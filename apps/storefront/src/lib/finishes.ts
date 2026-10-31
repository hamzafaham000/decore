/** A small, honest colour cue for finish names — no invented material samples. */
const swatches: [needle: string, color: string][] = [
  ["chalk", "#ece7dd"],
  ["bone", "#ded5c6"],
  ["oatmeal", "#d2c7b4"],
  ["clay", "#a9745c"],
  ["velvet", "#7c5a50"],
  ["natural", "#8a5f3d"],
  ["smoked", "#4e3a2c"],
  ["ebonised", "#332e2a"],
  ["black", "#37322d"],
  ["grey", "#9a978f"],
  ["brass", "#ad8a4d"],
  ["gold", "#b3924f"],
  ["marble", "#47443f"],
];

export function finishSwatch(finish: string): string {
  const key = finish.toLowerCase();
  return swatches.find(([needle]) => key.includes(needle))?.[1] ?? "#c4bdb0";
}
