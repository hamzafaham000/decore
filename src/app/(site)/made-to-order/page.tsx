import type { Metadata } from "next";
import Link from "next/link";

import { Accordion } from "@/components/accordion";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChatIcon,
  ClockIcon,
  LeafIcon,
  TruckIcon,
} from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { brand, commerce } from "@/lib/brand";
import { formatPKR } from "@/lib/money";
import { madeToOrderFaqs, madeToOrderJsonLd, siteOgImage } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: { absolute: `Made to order in Pakistan — lead times & delivery | ${brand.name}` },
  description: `How a Decore piece is made: built after you order, four to eight weeks, a ${Math.round(
    commerce.advanceRate * 100,
  )}% advance, and hand delivery across Pakistan.`,
  alternates: { canonical: "/made-to-order" },
  openGraph: {
    type: "website",
    url: "/made-to-order",
    title: `Made to order in Pakistan — lead times & delivery | ${brand.name}`,
    description: `Built after you order, in four to eight weeks, and delivered across Pakistan.`,
    images: [siteOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `Made to order in Pakistan | ${brand.name}`,
    description: `Built after you order, in four to eight weeks, and delivered across Pakistan.`,
  },
};

const facts = [
  {
    label: "Lead time",
    value: "4–8 weeks",
    detail: "From the day we confirm the order.",
    icon: ClockIcon,
  },
  {
    label: "Advance",
    value: `${Math.round(commerce.advanceRate * 100)}%`,
    detail: `Balance on delivery. Delivery free over ${formatPKR(commerce.freeDeliveryFrom)}.`,
    icon: LeafIcon,
  },
  {
    label: "Delivery",
    value: "Across Pakistan",
    detail: "Hand-delivered in major cities, insured freight elsewhere.",
    icon: TruckIcon,
  },
];

const steps = [
  {
    week: "Week 0",
    title: "You write",
    body: "Tell us the piece, the finish and the room it is going into. A photograph of the space helps us answer properly.",
  },
  {
    week: "Week 0–1",
    title: "We confirm",
    body: `We reply ${brand.replyTime.toLowerCase()} with the finish options and a delivery window. A ${Math.round(
      commerce.advanceRate * 100,
    )}% advance starts the build; the balance is collected on delivery.`,
  },
  {
    week: "Week 1–8",
    title: "We build",
    body: "The workshop cuts, joins and finishes the piece, and we update you twice during the build.",
  },
  {
    week: "Week 4–8",
    title: "We deliver",
    body: "Blanketed and hand-delivered in major cities, insured freight elsewhere. You are contacted to arrange the window.",
  },
];

export default function MadeToOrderPage() {
  return (
    <div className="page-shell pb-4 pt-10 md:pt-16">
      <JsonLd data={madeToOrderJsonLd(madeToOrderFaqs)} />

      <header className="grid gap-10 border-b border-line pb-12 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-muted">
              <span className="h-px w-8 bg-muted/50" />
              Made to order
            </p>
            <h1 className="display-1 mt-7">
              Made after you ask,
              <br />
              <em className="text-pine">not before.</em>
            </h1>
          </Reveal>
        </div>

        <Reveal delay={0.08} className="lg:col-span-5">
          <p className="max-w-[42ch] leading-relaxed text-muted">
            Decore keeps a short list and builds each piece once it is ordered. Nothing is
            held in a warehouse, so the timber, the brass and the finish are chosen for your piece.
          </p>
        </Reveal>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {facts.map((fact, index) => {
          const Icon = fact.icon;
          return (
            <Reveal key={fact.label} delay={index * 0.06}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-pine">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="mt-10">
                  <p className="eyebrow text-muted">{fact.label}</p>
                  <p className="mt-2 text-lg">{fact.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{fact.detail}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>

      <section className="mt-20 grid gap-14 border-t border-line pt-14 md:mt-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="eyebrow text-muted">The timeline</p>
            <h2 className="display-2 mt-4 max-w-[14ch]">What happens, week by week.</h2>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <ol className="border-t border-line">
            {steps.map((step, index) => (
              <li key={step.title} className="border-b border-line">
                <Reveal delay={index * 0.05}>
                  <div className="grid gap-3 py-6 sm:grid-cols-[auto_1fr] sm:gap-8">
                    <span className="eyebrow pt-1 text-muted">{step.week}</span>
                    <div>
                      <h3 className="text-xl">{step.title}</h3>
                      <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-20 grid gap-10 md:mt-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow text-muted">Questions</p>
          <h2 className="display-3 mt-4">Good to know</h2>
        </div>
        <div className="lg:col-span-8">
          <Accordion items={madeToOrderFaqs} />
        </div>
      </section>

      <section className="mt-20 md:mt-24">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-7 rounded-2xl bg-surface px-7 py-10 md:flex-row md:items-center md:px-12 md:py-12">
            <div>
              <p className="eyebrow text-muted">Start here</p>
              <h2 className="display-3 mt-3">Tell us about the room.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappLink("Hello — I would like to ask about a made-to-order piece.")}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <ChatIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <Link href="/collection" className="btn-outline">
                See the shop
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <ClockIcon className="h-3.5 w-3.5" />
          {brand.hours}
        </span>
        <a href={`mailto:${brand.email}`} className="link-underline">
          {brand.email}
        </a>
        <Link href="/contact" className="inline-flex items-center gap-1.5 link-underline">
          Contact
          <ArrowUpRightIcon className="h-3 w-3" />
        </Link>
      </p>
    </div>
  );
}
