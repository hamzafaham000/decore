type MoneyRowProps = {
  label: string;
  value: string;
  /** Extra classes for the amount, e.g. "text-pine" for the advance line. */
  valueClass?: string;
};

export function MoneyRow({ label, value, valueClass }: MoneyRowProps) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={valueClass ? `tabular-nums ${valueClass}` : "tabular-nums"}>{value}</dd>
    </div>
  );
}
