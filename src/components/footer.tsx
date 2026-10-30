import Link from "next/link";

import { ArrowUpRightIcon, ChatIcon, MailIcon } from "@/components/icons";
import { brand, commerce } from "@/lib/brand";
import { categories } from "@/lib/products";
import { formatPKR } from "@/lib/money";
import { whatsappLink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-canvas">
      <div className="page-shell grid gap-14 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <p className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-[0.22em]">
            <span aria-hidden className="h-2 w-2 rounded-full bg-canvas" />
            {brand.name}
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-canvas/60">
            A short shop of pieces for work and rest, built to order by workshops we visit in
            person.
          </p>
          <a
            href={whatsappLink("Hello — I would like to ask about a piece.")}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-canvas/25 px-5 py-3 text-[0.8125rem] transition-colors hover:border-canvas hover:bg-canvas hover:text-ink"
          >
            <ChatIcon className="h-4 w-4" />
            Message us
          </a>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow text-canvas/60">Shop</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link
                href="/collection"
                className="text-canvas/75 transition-colors hover:text-canvas"
              >
                Shop
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/collection/${category.slug}`}
                  className="text-canvas/75 transition-colors hover:text-canvas"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow text-canvas/60">Contact</p>
          <ul className="mt-5 space-y-3 text-sm text-canvas/75">
            <li>
              <Link href="/contact" className="transition-colors hover:text-canvas">
                Contact us
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-canvas"
              >
                <MailIcon className="h-4 w-4 shrink-0 text-canvas/60" />
                {brand.email}
              </a>
            </li>
            <li>
              <Link
                href="/made-to-order"
                className="transition-colors hover:text-canvas"
              >
                Made to order
              </Link>
            </li>
            <li>
              <Link href="/#approach" className="transition-colors hover:text-canvas">
                Our approach
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow text-canvas/60">Good to know</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-canvas/75">
            <li>Made to order in four to eight weeks.</li>
            <li>
              A {Math.round(commerce.advanceRate * 100)}% advance confirms the build; the balance
              is due on delivery.
            </li>
            <li>Complimentary delivery over {formatPKR(commerce.freeDeliveryFrom)}.</li>
          </ul>
        </div>
      </div>

      <div className="page-shell">
        <div className="flex items-end justify-between gap-8 border-t border-canvas/15 pt-10">
          <p className="max-w-[16ch] text-sm leading-relaxed text-canvas/65">
            Fewer things,
            <br />
            made properly.
          </p>
          <span aria-hidden className="select-none text-[clamp(4rem,16vw,13rem)] leading-[0.72] tracking-[-0.05em] text-canvas/40">
            {brand.name}
          </span>
        </div>
      </div>

      <div className="page-shell flex flex-col gap-3 border-t border-canvas/10 py-6 text-canvas/60 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] uppercase tracking-[0.16em]">
          © {brand.year} {brand.name}
        </p>
        <a
          href={whatsappLink("Hello — I would like to ask about a piece.")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-canvas"
        >
          Enquire
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  );
}
