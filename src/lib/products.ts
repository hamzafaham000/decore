export type Surface = "home" | "office";

export type Product = {
  slug: string;
  name: string;
  line: string;
  surfaces: Surface[];
  price: number;
  tagline: string;
  description: string;
  finishes: string[];
  materials: { label: string; value: string }[];
  dimensions: { label: string; value: string }[];
  leadTimeWeeks: number;
  /** Drop this once real photography exists at this path. */
  image?: string;
  glyph: "seating" | "lighting" | "workspace" | "object";
};

// Sample catalogue. Replace names, prices and copy with the real pieces —
// every page reads from this file, so nothing else needs to change.
export const products: Product[] = [
  {
    slug: "meher-lounge-chair",
    name: "Meher Lounge Chair",
    line: "Seating",
    surfaces: ["home", "office"],
    price: 285_000,
    tagline: "A low, quiet seat for the corner of a room.",
    description:
      "Meher is drawn from a single curve: the back leg rises without a joint to carry the shoulder of the seat. The frame is solid walnut, finished by hand in three coats of oil. The cushion is a dense wool bouclé over a webbed base, built to be re-covered in ten years rather than replaced in three.",
    finishes: ["Oatmeal bouclé", "Bone bouclé", "Clay velvet"],
    materials: [
      { label: "Frame", value: "Solid Kashmir walnut" },
      { label: "Upholstery", value: "Wool bouclé, 620 gsm" },
      { label: "Base", value: "Hand-woven elastic webbing" },
      { label: "Finish", value: "Hardwax oil, three coats" },
    ],
    dimensions: [
      { label: "Width", value: "76 cm" },
      { label: "Depth", value: "82 cm" },
      { label: "Height", value: "71 cm" },
      { label: "Seat height", value: "40 cm" },
    ],
    leadTimeWeeks: 6,
    glyph: "seating",
  },
  {
    slug: "rivaan-writing-desk",
    name: "Rivaan Writing Desk",
    line: "Workspace",
    surfaces: ["office"],
    price: 340_000,
    tagline: "One plane of wood, and a single quiet drawer.",
    description:
      "Made for the hour before anyone else is awake. The top is a single book-matched slab, thinned to 22 mm at the edge so it reads lighter than it is. One dovetailed drawer runs on soft-close timber slides — no metal in the visible line of the piece.",
    finishes: ["Natural walnut", "Smoked walnut", "Ebonised ash"],
    materials: [
      { label: "Top", value: "Book-matched solid walnut, 30 mm" },
      { label: "Legs", value: "Tapered walnut, mortise and tenon" },
      { label: "Drawer", value: "Hand-cut dovetails, timber runners" },
      { label: "Finish", value: "Matte hardwax oil" },
    ],
    dimensions: [
      { label: "Width", value: "140 cm" },
      { label: "Depth", value: "68 cm" },
      { label: "Height", value: "74 cm" },
      { label: "Knee space", value: "62 cm" },
    ],
    leadTimeWeeks: 8,
    glyph: "workspace",
  },
  {
    slug: "sona-pendant-lamp",
    name: "Sona Pendant Lamp",
    line: "Lighting",
    surfaces: ["home", "office"],
    price: 96_000,
    tagline: "Hand-raised brass that ages in the direction of the room.",
    description:
      "Raised from a single disc of brass by a workshop in Chiniot that has hammered ware for three generations. Every shade carries the marks of the planishing, so no two hang the same way. Unlacquered: it warms and darkens with the room.",
    finishes: ["Raw brass", "Blackened brass"],
    materials: [
      { label: "Shade", value: "Hand-raised brass, 0.8 mm" },
      { label: "Cord", value: "Linen-sheathed, 2 m" },
      { label: "Canopy", value: "Matched brass" },
      { label: "Fitting", value: "E27, dimmable" },
    ],
    dimensions: [
      { label: "Diameter", value: "32 cm" },
      { label: "Height", value: "24 cm" },
      { label: "Drop", value: "Adjustable to 120 cm" },
    ],
    leadTimeWeeks: 4,
    glyph: "lighting",
  },
  // Objects. Stock photography stands in until we shoot our own pieces — clear each licence first.
  {
    slug: "panah-table-sculpture",
    name: "Panah Table Sculpture",
    line: "Objects",
    surfaces: ["home", "office"],
    price: 58_000,
    tagline: "Two arms of cast stone, holding a single sphere of brass.",
    description:
      "Panah is a study in balance. The cradle is cast in fine white stone and sanded to a matte finish that softens under raking light. The sphere is turned brass, left unlacquered, and free to roll — it settles wherever the room leaves it. Weighted through the base, so it rights itself.",
    finishes: ["Chalk white, raw brass", "Bone, blackened brass"],
    materials: [
      { label: "Cradle", value: "Cast stone, matte white" },
      { label: "Sphere", value: "Turned brass, unlacquered" },
      { label: "Base", value: "Weighted, felted underside" },
      { label: "Care", value: "Dry cloth only" },
    ],
    dimensions: [
      { label: "Height", value: "26 cm" },
      { label: "Width", value: "18 cm" },
      { label: "Depth", value: "12 cm" },
      { label: "Sphere", value: "6 cm diameter" },
    ],
    leadTimeWeeks: 4,
    image: "/products/panah-table-sculpture.avif",
    glyph: "object",
  },
  {
    slug: "girih-linked-sculpture",
    name: "Girih Linked Sculpture",
    line: "Objects",
    surfaces: ["home", "office"],
    price: 74_000,
    tagline: "Two rings that cannot come apart, joined in gold.",
    description:
      "Cast as one piece and then cut, so the two rings hold each other. The surface is worked through a coarse aggregate before casting; the joint alone is left smooth and laid by hand in gold leaf. It stands on a marble plinth heavy enough to ignore a curious hand.",
    finishes: ["Black stone, gold leaf", "Chalk white, raw brass"],
    materials: [
      { label: "Rings", value: "Cast stone, textured black finish" },
      { label: "Joint", value: "Hand-laid gold leaf" },
      { label: "Plinth", value: "Honed Nero marble" },
      { label: "Care", value: "Dry cloth only" },
    ],
    dimensions: [
      { label: "Height", value: "34 cm" },
      { label: "Width", value: "22 cm" },
      { label: "Depth", value: "11 cm" },
      { label: "Ring diameter", value: "17 cm" },
    ],
    leadTimeWeeks: 4,
    image: "/products/girih-linked-sculpture.avif",
    glyph: "object",
  },
  {
    slug: "suhbat-stacked-sculpture",
    name: "Suhbat Stacked Sculpture",
    line: "Objects",
    surfaces: ["home"],
    price: 128_000,
    tagline: "Three figures, each seated in a ring of black marble.",
    description:
      "A stack of three marble rings, cut and honed so each carries the figure above it. The figures are cast brass and left unlacquered, posed differently — nobody in the row sits the same way. Assembled over a steel core on a solid plinth; the stone is the reason it does not move.",
    finishes: ["Black marble, raw brass", "Grey marble, blackened brass"],
    materials: [
      { label: "Rings", value: "Honed Nero marble" },
      { label: "Figures", value: "Cast brass, unlacquered" },
      { label: "Core", value: "Steel, bonded through" },
      { label: "Base", value: "Solid marble, felted underside" },
    ],
    dimensions: [
      { label: "Height", value: "68 cm" },
      { label: "Width", value: "26 cm" },
      { label: "Depth", value: "14 cm" },
      { label: "Base", value: "26 × 14 cm" },
    ],
    leadTimeWeeks: 6,
    image: "/products/suhbat-stacked-sculpture.avif",
    glyph: "object",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
