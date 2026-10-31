import type { Product } from "@decore/core";

/**
 * A compact, serializable slice of a product. The header receives this from the
 * server so the whole catalogue never has to be shipped to the browser just to
 * search it.
 */
export type SearchDoc = {
  slug: string;
  name: string;
  line: string;
  price: number;
  tagline: string;
  finishes: string;
  materials: string;
  surfaces: string;
  image?: string;
  glyph: Product["glyph"];
  leadTimeWeeks: number;
};

export function buildSearchDoc(product: Product): SearchDoc {
  return {
    slug: product.slug,
    name: product.name,
    line: product.line,
    price: product.price,
    tagline: product.tagline,
    finishes: product.finishes.join(" "),
    materials: product.materials.map((material) => `${material.label} ${material.value}`).join(" "),
    surfaces: product.surfaces.join(" "),
    image: product.image,
    glyph: product.glyph,
    leadTimeWeeks: product.leadTimeWeeks,
  };
}

/** Lowercase, strip accents and punctuation so "Bouclé" matches "boucle". */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const fieldWeights: { key: keyof SearchDoc; weight: number; synonyms: boolean }[] = [
  { key: "name", weight: 14, synonyms: true },
  { key: "line", weight: 6, synonyms: true },
  { key: "tagline", weight: 4, synonyms: true },
  { key: "finishes", weight: 3, synonyms: true },
  { key: "materials", weight: 3, synonyms: true },
  // Rooms are literal: "desk" should not find every office piece via "office".
  { key: "surfaces", weight: 2, synonyms: false },
];

/**
 * Words people actually type. Synonyms score lower than the literal word, so
 * "desk" still puts the writing desk above the table sculpture.
 */
const synonyms: Record<string, string[]> = {
  sofa: ["couch", "chair", "seating", "lounge"],
  couch: ["sofa", "chair", "seating", "lounge"],
  seat: ["chair", "seating", "lounge"],
  lounge: ["chair", "seating", "sofa"],
  lamp: ["light", "lighting", "pendant"],
  light: ["lamp", "lighting", "pendant"],
  lighting: ["lamp", "pendant", "light"],
  pendant: ["lamp", "lighting", "light"],
  desk: ["table", "workspace", "study", "office"],
  table: ["desk", "workspace"],
  work: ["desk", "workspace", "study"],
  study: ["desk", "workspace", "office"],
  wood: ["walnut", "wooden"],
  wooden: ["wood", "walnut"],
  walnut: ["wood", "wooden"],
  gold: ["brass"],
  brass: ["gold", "metal"],
  metal: ["brass"],
  decor: ["object", "sculpture", "ornament"],
  decoration: ["object", "sculpture", "ornament"],
  object: ["sculpture", "decor", "ornament"],
  ornament: ["object", "sculpture"],
  statue: ["sculpture", "object"],
  art: ["sculpture", "object"],
  sculpture: ["object", "statue", "art"],
  marble: ["stone"],
  stone: ["marble"],
  home: ["living"],
  house: ["home", "living"],
  office: ["work", "study", "desk"],
  bedroom: ["home", "living"],
};

function singular(word: string): string | null {
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return null;
}

type Variant = { value: string; factor: number; synonym?: boolean };

function variantsFor(token: string): Variant[] {
  const variants: Variant[] = [{ value: token, factor: 1 }];
  const singularToken = singular(token);

  if (singularToken) {
    variants.push({ value: singularToken, factor: 0.95 });
  } else if (token.length > 2) {
    variants.push({ value: `${token}s`, factor: 0.95 });
  }

  const synonymSource = synonyms[token] ?? (singularToken ? synonyms[singularToken] : undefined) ?? [];
  for (const synonym of synonymSource) {
    variants.push({ value: synonym, factor: 0.5, synonym: true });
    const synonymSingular = singular(synonym);
    if (synonymSingular) variants.push({ value: synonymSingular, factor: 0.48, synonym: true });
  }

  return variants;
}

function quality(text: string, term: string): number {
  if (!text) return 0;
  if (text === term) return 2;
  if (text.startsWith(term)) return 1.5;
  for (const word of text.split(" ")) {
    if (word.startsWith(term)) return 1.2;
  }
  return text.includes(term) ? 0.8 : 0;
}

export function searchProducts(index: SearchDoc[], rawQuery: string): SearchDoc[] {
  const query = normalize(rawQuery);
  if (!query) return [];

  const tokens = query.split(" ").filter(Boolean);
  if (tokens.length === 0) return [];

  const scored = index
    .map((doc) => {
      const text: Record<string, string> = {
        name: normalize(doc.name),
        line: normalize(doc.line),
        tagline: normalize(doc.tagline),
        finishes: normalize(doc.finishes),
        materials: normalize(doc.materials),
        surfaces: normalize(doc.surfaces),
      };

      let total = 0;

      for (const token of tokens) {
        const variants = variantsFor(token);
        let best = 0;

        for (const field of fieldWeights) {
          const haystack = text[field.key as string] ?? "";
          for (const variant of variants) {
            if (variant.synonym && !field.synonyms) continue;
            const score = quality(haystack, variant.value) * field.weight * variant.factor;
            if (score > best) best = score;
          }
        }

        // Every word has to land somewhere, so "wooden desk" never returns the chair.
        if (best === 0) return { doc, score: 0 };
        total += best;
      }

      if (text.name === query) total += 40;
      else if (text.name.startsWith(query)) total += 18;
      else if (text.name.includes(query)) total += 10;

      return { doc, score: total };
    })
    .filter((entry) => entry.score > 0);

  // Array.prototype.sort is stable, so equal scores keep catalogue order.
  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.doc);
}

export type HighlightPart = { text: string; match: boolean };

/** Split a label into matched/unmatched runs so the query can be marked. */
export function highlightParts(text: string, rawQuery: string): HighlightPart[] {
  const tokens = normalize(rawQuery)
    .split(" ")
    .filter((token) => token.length > 1);
  if (tokens.length === 0) return [{ text, match: false }];

  const haystack = text.toLowerCase();
  const ranges: [number, number][] = [];

  for (const token of tokens) {
    for (const value of [token, singular(token)].filter(Boolean) as string[]) {
      let start = haystack.indexOf(value);
      while (start !== -1) {
        ranges.push([start, start + value.length]);
        start = haystack.indexOf(value, start + value.length);
      }
    }
  }

  if (ranges.length === 0) return [{ text, match: false }];

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }

  const parts: HighlightPart[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });

  return parts;
}
