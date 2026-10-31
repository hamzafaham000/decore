const numberFormat = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

/** All money in this app is whole Pakistani Rupees — no subunit is ever priced. */
export function formatPKR(amount: number): string {
  return `PKR ${numberFormat.format(amount)}`;
}
