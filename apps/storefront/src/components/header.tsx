"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ArrowRightIcon, BagIcon, ChatIcon, CloseIcon, GridIcon, MailIcon, MenuIcon } from "@decore/ui";
import { SearchDialog } from "@/components/search-dialog";
import { announcement, brand, nav } from "@decore/core";
import { cartCount, useCartStore } from "@/lib/cart-store";
import type { SearchDoc } from "@/lib/search";
import { useMounted } from "@/lib/use-mounted";

const navIcons = {
  "/collection": GridIcon,
  "/contact": MailIcon,
} as const;

function NavLinksFallback() {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
      {nav.map((item) => {
        const Icon = navIcons[item.href as keyof typeof navIcons];
        return (
          <Link
            key={item.label}
            href={item.href}
            className="inline-flex items-center gap-2 text-[0.8125rem] tracking-[0.02em] text-muted transition-colors hover:text-ink"
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
      {nav.map((item) => {
        const Icon = navIcons[item.href as keyof typeof navIcons];
        const active =
          item.href === "/collection"
            ? pathname === "/collection" || pathname.startsWith("/product/")
            : item.href === "/contact"
              ? pathname === "/contact"
              : false;

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex items-center gap-2 text-[0.8125rem] tracking-[0.02em] transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            {item.label}
            {active && (
              <span aria-hidden className="absolute -bottom-1.5 left-0 h-px w-full bg-pine" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header({
  whatsappUrl,
  searchIndex,
}: {
  whatsappUrl: string;
  searchIndex: SearchDoc[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const mounted = useMounted();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [menuOpen]);

  const count = mounted ? cartCount(items) : 0;

  return (
    <>
      <div className="relative z-40 bg-pine text-canvas">
        <div className="page-shell flex h-9 items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em]">{announcement}</span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "border-line bg-canvas/90 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/80"
            : "border-transparent bg-canvas"
        }`}
      >
        <div className="page-shell flex h-[4.5rem] items-center justify-between gap-3 md:grid md:h-20 md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            aria-label={`${brand.name} home`}
            className="flex items-center gap-2.5 justify-self-start"
          >
            <span aria-hidden className="h-2 w-2 rounded-full bg-pine" />
            <span className="text-[1.15rem] font-semibold uppercase leading-none tracking-[0.22em] md:text-xl">
              {brand.name}
            </span>
          </Link>

          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>

          <div className="flex items-center justify-end gap-1.5 sm:gap-3 md:justify-self-end">
            <SearchDialog index={searchIndex} />
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-[0.8125rem] text-muted transition-colors hover:bg-ink/5 hover:text-ink lg:flex"
            >
              <ChatIcon className="h-4 w-4" />
              WhatsApp
            </a>

            <button
              type="button"
              onClick={openCart}
              aria-label={count > 0 ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag, empty"}
              className="inline-flex h-10 items-center gap-2 rounded-full px-2.5 text-[0.8125rem] text-muted transition-colors hover:bg-ink/5 hover:text-ink sm:px-3"
            >
              <span className="relative inline-flex shrink-0">
                <BagIcon className="h-4 w-4" />
                {count > 0 && (
                  <span
                    aria-hidden
                    className="absolute -right-1 -top-1 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-pine px-1 text-[10px] font-medium leading-none tabular-nums text-canvas"
                  >
                    {count}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Bag</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="animate-menu-in fixed inset-0 z-50 flex flex-col overflow-y-auto bg-canvas md:hidden"
        >
          <div className="page-shell flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              aria-label={`${brand.name} home`}
              className="flex items-center gap-2.5"
            >
              <span aria-hidden className="h-2 w-2 rounded-full bg-pine" />
              <span className="text-[1.15rem] font-semibold uppercase leading-none tracking-[0.22em]">
                {brand.name}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="page-shell flex min-h-0 flex-1 flex-col overflow-y-auto pb-[max(1.75rem,env(safe-area-inset-bottom))]">
            <nav aria-label="Mobile" className="pt-8">
              <p className="eyebrow text-muted">Browse</p>
              <ul className="mt-4 border-t border-line">
                {nav.map((item, index) => {
                  const Icon = navIcons[item.href as keyof typeof navIcons] ?? ArrowRightIcon;

                  return (
                    <li
                      key={item.label}
                      className="animate-menu-in border-b border-line"
                      style={{ animationDelay: `${60 + index * 45}ms` }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-4 py-4"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-pine transition-colors group-hover:border-pine/30 group-hover:bg-pine-soft">
                          <Icon className="h-[1.05rem] w-[1.05rem]" />
                        </span>
                        <span className="flex-1 text-[1.0625rem] font-medium tracking-[-0.005em]">
                          {item.label}
                        </span>
                        <ArrowRightIcon className="h-4 w-4 text-muted/60 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto pt-10">
              <div className="rounded-xl bg-pine-soft/70 p-5">
                <p className="text-[0.9375rem] font-medium">Questions before you order?</p>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                  Every piece is built to order. Ask us about timing, finish or fabric.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary mt-4 w-full"
                >
                  <ChatIcon className="h-4 w-4" />
                  Message on WhatsApp
                </a>
                <a
                  href={`mailto:${brand.email}`}
                  className="mt-3 flex items-center justify-center gap-2 text-[0.8125rem] text-muted transition-colors hover:text-ink"
                >
                  <MailIcon className="h-3.5 w-3.5" />
                  {brand.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
