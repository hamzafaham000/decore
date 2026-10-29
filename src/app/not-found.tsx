import Link from "next/link";

import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[60vh] flex-col justify-center py-20">
      <p className="eyebrow text-muted">404 — Not found</p>
      <h1 className="display-1 mt-6 max-w-[14ch]">
        This page has
        <br />
        <em className="text-pine">left the room.</em>
      </h1>
      <p className="mt-6 max-w-[42ch] leading-relaxed text-muted">
        The piece may have moved, or the link may be old. The collection is still here.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Link href="/collection" className="btn-primary">
          Browse the collection
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link href="/" className="link-underline">
          Back home
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
