"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ArrowUpRightIcon, CloseIcon, SearchIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { formatPKR } from "@/lib/money";
import { highlightParts, searchProducts, type SearchDoc } from "@/lib/search";

const recentsKey = "decore-recent-searches";
const suggestions = ["Lamp", "Walnut", "Desk", "Marble", "Office"];

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, index) =>
        part.match ? (
          <mark key={index} className="bg-transparent text-pine">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function SearchDialog({ index }: { index: SearchDoc[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const results = useMemo(() => searchProducts(index, query), [index, query]);
  const hasQuery = query.trim().length > 0;
  const visibleRecents = recents.filter(
    (recent) => !suggestions.some((suggestion) => suggestion.toLowerCase() === recent.toLowerCase()),
  );

  const openDialog = useCallback(() => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    try {
      const stored = window.localStorage.getItem(recentsKey);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecents(parsed.filter((item): item is string => typeof item === "string").slice(0, 4));
        }
      }
    } catch {
      // Private mode or blocked storage — recents are a nicety, not a requirement.
    }
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // Global shortcuts: ⌘K anywhere, "/" when not already typing.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) closeDialog();
        else openDialog();
        return;
      }

      if (event.key === "/" && !open) {
        const target = event.target as HTMLElement | null;
        if (
          target?.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
        ) {
          return;
        }
        event.preventDefault();
        openDialog();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openDialog, closeDialog]);

  // Lock the page, focus the field, and hand focus back on close.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const trigger = triggerRef.current;

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      const target = lastFocused.current;
      if (target && target !== document.body) target.focus();
      else trigger?.focus();
    };
  }, [open]);

  // Keep the highlighted row visible without scrolling the page behind it.
  useEffect(() => {
    if (!open) return;
    const option = results[active] ? document.getElementById(`search-option-${results[active].slug}`) : null;
    option?.scrollIntoView({ block: "nearest" });
  }, [active, open, results]);

  function remember(term: string) {
    const cleaned = term.trim();
    if (cleaned.length < 2) return;
    setRecents((current) => {
      const next = [cleaned, ...current.filter((item) => item.toLowerCase() !== cleaned.toLowerCase())].slice(0, 4);
      try {
        window.localStorage.setItem(recentsKey, JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }

  function chooseResult(doc: SearchDoc) {
    remember(query);
    closeDialog();
    router.push(`/product/${doc.slug}`);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length > 0) setActive((current) => (current + 1) % results.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length > 0) setActive((current) => (current - 1 + results.length) % results.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const result = results[active];
      if (result) chooseResult(result);
    }
  }

  function onDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }

    if (event.key !== "Tab") return;

    const root = dialogRef.current;
    if (!root) return;

    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-label="Search pieces"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-full px-2.5 text-[0.8125rem] text-muted transition-colors hover:bg-ink/5 hover:text-ink sm:px-3"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[10px] text-muted/80 xl:inline">
          ⌘K
        </kbd>
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex items-stretch justify-center sm:items-start sm:px-4 sm:pt-[9vh]">
              <div
                className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
                onClick={closeDialog}
                aria-hidden
              />

              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-title"
                onKeyDown={onDialogKeyDown}
                className="animate-menu-in relative flex h-full w-full flex-col overflow-hidden bg-canvas pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] sm:h-auto sm:max-h-[min(38rem,80vh)] sm:max-w-[42rem] sm:rounded-2xl sm:border sm:border-line sm:pb-0 sm:pt-0 sm:shadow-[0_24px_80px_-24px_rgba(23,22,20,0.35)]"
              >
                <h2 id="search-title" className="sr-only">
                  Search pieces
                </h2>

                <div className="flex items-center gap-3 border-b border-line px-4 py-3.5 sm:px-6 sm:py-4">
                  <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActive(0);
                    }}
                    onKeyDown={onInputKeyDown}
                    placeholder="Search pieces, materials, rooms…"
                    aria-label="Search pieces"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    role="combobox"
                    aria-expanded={results.length > 0}
                    aria-controls="search-results"
                    aria-autocomplete="list"
                    aria-activedescendant={
                      results[active] ? `search-option-${results[active].slug}` : undefined
                    }
                    className="min-w-0 flex-1 bg-transparent py-1 text-base text-ink outline-none placeholder:text-muted/70 sm:text-lg"
                  />
                  <button
                    type="button"
                    onClick={closeDialog}
                    aria-label="Close search"
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-2.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    <span className="hidden text-[10px] uppercase tracking-[0.16em] sm:inline">Esc</span>
                    <CloseIcon className="h-5 w-5 sm:hidden" />
                  </button>
                </div>

                <p aria-live="polite" className="sr-only">
                  {hasQuery
                    ? `${results.length} ${results.length === 1 ? "piece" : "pieces"} found`
                    : ""}
                </p>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-4 sm:px-3">
                  {!hasQuery ? (
                    <div>
                      <div className="px-3">
                        <p className="eyebrow text-muted">Try a search</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                setQuery(suggestion);
                                setActive(0);
                                inputRef.current?.focus();
                              }}
                              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-ink/40 hover:text-ink"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      {visibleRecents.length > 0 && (
                        <div className="mt-7 px-3">
                          <p className="eyebrow text-muted">Recent</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {visibleRecents.map((recent) => (
                              <button
                                key={recent}
                                type="button"
                                onClick={() => {
                                  setQuery(recent);
                                  setActive(0);
                                  inputRef.current?.focus();
                                }}
                                className="rounded-full border border-line px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-ink/40 hover:text-ink"
                              >
                                {recent}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-8 px-3 pb-4">
                        <Link
                          href="/collection"
                          onClick={closeDialog}
                          className="link-underline text-xs text-muted hover:text-ink"
                        >
                          Browse the shop
                          <ArrowUpRightIcon className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <p className="font-display text-2xl">Nothing matches “{query.trim()}”.</p>
                      <p className="mx-auto mt-3 max-w-[34ch] text-sm leading-relaxed text-muted">
                        Try a material, a room, or a type: walnut, office, lamp.
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            setActive(0);
                            inputRef.current?.focus();
                          }}
                          className="btn-outline"
                        >
                          Clear search
                        </button>
                        <Link href="/contact" onClick={closeDialog} className="btn-primary">
                          Ask us
                          <ArrowUpRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <ul id="search-results" role="listbox" aria-label="Pieces">
                      {results.map((doc, index) => {
                        const selected = index === active;
                        return (
                          <li
                            key={doc.slug}
                            id={`search-option-${doc.slug}`}
                            role="option"
                            aria-selected={selected}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => chooseResult(doc)}
                            className={`flex cursor-pointer items-center gap-4 rounded-xl px-3 py-3 transition-colors ${
                              selected ? "bg-pine-soft" : "hover:bg-ink/[0.03]"
                            }`}
                          >
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-line/40">
                              <ProductImage product={doc} sizes="56px" compact />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-lg leading-tight">
                                <Highlighted text={doc.name} query={query} />
                              </span>
                              <span className="mt-1 block truncate text-xs text-muted">
                                {doc.line} · {doc.tagline}
                              </span>
                            </span>
                            <span className="shrink-0 text-sm tabular-nums text-ink">
                              {formatPKR(doc.price)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="hidden items-center justify-between gap-4 border-t border-line px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-muted sm:flex">
                  <span className="flex items-center gap-2">
                    <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-sans text-[10px]">
                      ↑
                    </kbd>
                    <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-sans text-[10px]">
                      ↓
                    </kbd>
                    <span>to move</span>
                    <span aria-hidden>·</span>
                    <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-sans text-[10px]">
                      ↵
                    </kbd>
                    <span>to open</span>
                  </span>
                  <span className="normal-case tracking-normal">Name, material, or room</span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
