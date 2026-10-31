import type { ReactNode } from "react";

import { PlusIcon } from "@decore/ui";

export type AccordionItem = {
  title: string;
  content: ReactNode;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.title} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-sm font-medium [&::-webkit-details-marker]:hidden">
            {item.title}
            <PlusIcon className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <div className="max-w-[54ch] pb-6 text-sm leading-relaxed text-muted">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
