/**
 * The catalogue as it existed before the database took over. This file is the
 * seed source: run `pnpm db:seed` once, then edit products in /admin. It is not
 * imported by the app.
 */
export type Surface = "home" | "office";

/**
 * The shop splits by what a buyer actually calls the thing — chair, table,
 * light, decor — not by a designer's "furniture and objects". Four flat
 * categories, no parent tree: a parent page would repeat a filtered view and
 * cost a click without adding a decision.
 *
 * Promote a line to a second level only when the catalogue passes ~40 pieces.
 */
export const seedCategories = [
  {
    slug: "seating",
    label: "Seating",
    blurb: "Chairs, benches and stools built for long sittings.",
  },
  {
    slug: "tables",
    label: "Tables & Desks",
    blurb: "Desks, consoles and side tables in solid hardwood.",
  },
  {
    slug: "lighting",
    label: "Lighting",
    blurb: "Pendants, floor and table lamps in brass and wood.",
  },
  {
    slug: "decor",
    label: "Decor",
    blurb: "Sculptural pieces in marble, brass and wood.",
  },
] as const;

export type CategorySlug = (typeof seedCategories)[number]["slug"];
export type CategoryLabel = (typeof seedCategories)[number]["label"];

export type Product = {
  slug: string;
  name: string;
  line: CategoryLabel;
  surfaces: Surface[];
  price: number;
  tagline: string;
  description: string;
  finishes: string[];
  materials: { label: string; value: string }[];
  dimensions: { label: string; value: string }[];
  leadTimeWeeks: number;
  /** Cover photograph. Used by cards, the cart, search and Open Graph. */
  image?: string;
  /**
   * Extra views for the product gallery — detail, in-room, scale.
   * The cover is not repeated here; the gallery renders it first.
   * A piece with only a cover shows no thumbnails at all.
   */
  images?: string[];
  glyph: "seating" | "table" | "lighting" | "workspace" | "object";
};

// Sample catalogue. Replace names, prices and copy with the real pieces —
// every page reads from this file, so nothing else needs to change.
export const seedProducts: Product[] = [
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
    line: "Tables & Desks",
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
    line: "Decor",
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
    line: "Decor",
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
    line: "Decor",
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
  {
    slug: "dastur-armchair",
    name: "Dastur Armchair",
    line: "Seating",
    surfaces: ["home", "office"],
    price: 245_000,
    tagline: "A high back and a caned frame, for the chair you read in.",
    description:
      "Dastur is a working chair that happens to be comfortable: a steam-bent ash frame, a hand-woven cane back, and a firm seat wrapped in cotton rather than foam that collapses in a year. The cane can be re-woven without touching the frame, which is the point of building it this way.",
    finishes: ["Natural ash", "Ebonised ash", "Walnut stain"],
    materials: [
      { label: "Frame", value: "Steam-bent solid ash" },
      { label: "Back", value: "Hand-woven cane" },
      { label: "Seat", value: "Cotton over a firm foam core" },
      { label: "Finish", value: "Hardwax oil, two coats" },
    ],
    dimensions: [
      { label: "Width", value: "68 cm" },
      { label: "Depth", value: "74 cm" },
      { label: "Height", value: "92 cm" },
      { label: "Seat height", value: "44 cm" },
    ],
    leadTimeWeeks: 7,
    glyph: "seating",
  },
  {
    slug: "takht-bench",
    name: "Takht Bench",
    line: "Seating",
    surfaces: ["home"],
    price: 165_000,
    tagline: "A low bench with one thick rail, made to seat three.",
    description:
      "Takht is built like a table: a 45 mm sheesham top on four splayed legs, with nothing under your feet to catch a heel. The front edge is chamfered by hand so it does not cut into the back of a knee, and the whole thing is light enough for two people to move.",
    finishes: ["Natural sheesham", "Smoked oak", "Painted bone"],
    materials: [
      { label: "Top", value: "Solid sheesham, 45 mm" },
      { label: "Legs", value: "Tapered solid wood" },
      { label: "Joinery", value: "Mortise and tenon, wedged" },
      { label: "Finish", value: "Oil and wax" },
    ],
    dimensions: [
      { label: "Length", value: "160 cm" },
      { label: "Depth", value: "38 cm" },
      { label: "Height", value: "45 cm" },
      { label: "Weight", value: "18 kg" },
    ],
    leadTimeWeeks: 6,
    glyph: "seating",
  },
  {
    slug: "peerhi-stool",
    name: "Peerhi Stool",
    line: "Seating",
    surfaces: ["home", "office"],
    price: 48_000,
    tagline: "The small stool every room needs and nobody photographs.",
    description:
      "Three legs, a woven seat, nothing else. Peerhi is cut from a single ash board and assembled with wedged tenons, so it takes weight without a stretcher across the middle. It tucks under a desk, carries a cup of tea, and stands in when the chairs run out.",
    finishes: ["Natural ash", "Black", "Clay"],
    materials: [
      { label: "Seat", value: "Solid ash" },
      { label: "Weave", value: "Cotton cord, hand-woven" },
      { label: "Joints", value: "Wedged tenon" },
      { label: "Finish", value: "Soap and wax" },
    ],
    dimensions: [
      { label: "Width", value: "36 cm" },
      { label: "Depth", value: "36 cm" },
      { label: "Height", value: "45 cm" },
      { label: "Weight", value: "3 kg" },
    ],
    leadTimeWeeks: 4,
    glyph: "seating",
  },
  {
    slug: "saraab-console",
    name: "Saraab Console",
    line: "Tables & Desks",
    surfaces: ["home", "office"],
    price: 275_000,
    tagline: "A long, shallow table for the wall you keep looking at.",
    description:
      "Saraab is 32 cm deep, so it holds a lamp and a bowl without turning into a shelf for everything else. The top is book-matched walnut; the base is a single mitred plane that meets the floor on a shadow gap, which is why it reads lighter than it is.",
    finishes: ["Natural walnut", "Ebonised ash", "Bone"],
    materials: [
      { label: "Top", value: "Book-matched walnut, 30 mm" },
      { label: "Base", value: "Solid walnut, mitred" },
      { label: "Shelf", value: "Walnut, 18 mm" },
      { label: "Finish", value: "Hardwax oil, three coats" },
    ],
    dimensions: [
      { label: "Length", value: "150 cm" },
      { label: "Depth", value: "32 cm" },
      { label: "Height", value: "78 cm" },
      { label: "Weight", value: "26 kg" },
    ],
    leadTimeWeeks: 7,
    glyph: "table",
  },
  {
    slug: "chabutra-side-table",
    name: "Chabutra Side Table",
    line: "Tables & Desks",
    surfaces: ["home", "office"],
    price: 88_000,
    tagline: "A small square that moves where the tea goes.",
    description:
      "A 45 cm top on an open frame, low enough to sit beside a lounge chair and light enough to lift with one hand. The top is a single solid slab with a soft roundover, so there is no edge to catch a sleeve.",
    finishes: ["Sheesham", "Ash", "Blackened"],
    materials: [
      { label: "Top", value: "Solid sheesham, 28 mm" },
      { label: "Frame", value: "Solid ash" },
      { label: "Feet", value: "Felted" },
      { label: "Finish", value: "Oil and wax" },
    ],
    dimensions: [
      { label: "Width", value: "45 cm" },
      { label: "Depth", value: "45 cm" },
      { label: "Height", value: "52 cm" },
      { label: "Weight", value: "6 kg" },
    ],
    leadTimeWeeks: 4,
    glyph: "table",
  },
  {
    slug: "davaat-bedside",
    name: "Davaat Bedside",
    line: "Tables & Desks",
    surfaces: ["home"],
    price: 78_000,
    tagline: "One drawer, one shelf, no handles.",
    description:
      "Davaat is a bedside table with a push-to-open drawer and an open shelf for the book you are actually reading. The carcass is solid ash and the drawer front is a single piece with the finger pull cut into it, so nothing sticks out into a small room.",
    finishes: ["Natural ash", "Walnut", "Bone"],
    materials: [
      { label: "Carcass", value: "Solid ash" },
      { label: "Drawer", value: "Dovetailed, timber slides" },
      { label: "Shelf", value: "Ash, 18 mm" },
      { label: "Finish", value: "Soap and wax" },
    ],
    dimensions: [
      { label: "Width", value: "42 cm" },
      { label: "Depth", value: "38 cm" },
      { label: "Height", value: "55 cm" },
      { label: "Weight", value: "9 kg" },
    ],
    leadTimeWeeks: 5,
    glyph: "table",
  },
  {
    slug: "mahtab-floor-lamp",
    name: "Mahtab Floor Lamp",
    line: "Lighting",
    surfaces: ["home", "office"],
    price: 118_000,
    tagline: "A tall stem and a paper shade that softens everything.",
    description:
      "Mahtab stands 158 cm and throws light up the wall rather than into your eyes, which is what a room wants after dark. The shade is handmade paper over a wire frame; the base is a weighted disc so it holds its place on a rug.",
    finishes: ["Brass and ivory", "Black and oat", "Bronze and clay"],
    materials: [
      { label: "Stem", value: "Unlacquered brass" },
      { label: "Shade", value: "Handmade paper on wire" },
      { label: "Base", value: "Weighted steel disc" },
      { label: "Flex", value: "Braided cotton, 2 m" },
    ],
    dimensions: [
      { label: "Height", value: "158 cm" },
      { label: "Shade", value: "Ø 42 cm" },
      { label: "Base", value: "Ø 28 cm" },
      { label: "Bulb", value: "E27, 12 W max" },
    ],
    leadTimeWeeks: 5,
    glyph: "lighting",
  },
  {
    slug: "chiragh-table-lamp",
    name: "Chiragh Table Lamp",
    line: "Lighting",
    surfaces: ["office", "home"],
    price: 64_000,
    tagline: "A small brass lamp for a desk that has to work at night.",
    description:
      "Chiragh is 42 cm tall with a shade that tilts, so it lights the paper instead of the room. The switch is a brass toggle set into the base rather than a switch on the cable, and the flex is cotton over braided core.",
    finishes: ["Raw brass", "Blackened brass", "Nickel"],
    materials: [
      { label: "Body", value: "Solid brass" },
      { label: "Shade", value: "Spun brass" },
      { label: "Switch", value: "Brass toggle, in base" },
      { label: "Flex", value: "Braided cotton, 1.8 m" },
    ],
    dimensions: [
      { label: "Height", value: "42 cm" },
      { label: "Shade", value: "Ø 18 cm" },
      { label: "Base", value: "Ø 14 cm" },
      { label: "Bulb", value: "E14, 8 W max" },
    ],
    leadTimeWeeks: 4,
    glyph: "lighting",
  },
];

