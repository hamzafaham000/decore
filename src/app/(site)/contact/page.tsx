import type { Metadata } from "next";

import { Accordion } from "@/components/accordion";
import {
  ArrowUpRightIcon,
  ChatIcon,
  ClockIcon,
  MailIcon,
  TruckIcon,
} from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { JsonLd } from "@/components/json-ld";
import { brand, commerce } from "@/lib/brand";
import { formatPKR } from "@/lib/money";
import { faqJsonLd, siteOgImage } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: { absolute: `Contact — WhatsApp, email and delivery | ${brand.name}` },
  description: `Ask about a piece, a finish or delivery. Message ${brand.whatsapp} on WhatsApp or email ${brand.email}. Delivery across Pakistan, complimentary over ${formatPKR(commerce.freeDeliveryFrom)}.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: `Talk to Decore — WhatsApp, email and delivery`,
    description: `Ask about a piece, a finish or delivery. We reply ${brand.replyTime.toLowerCase()}.`,
    images: [siteOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `Talk to Decore — WhatsApp, email and delivery`,
    description: `Ask about a piece, a finish or delivery. Delivery across Pakistan.`,
  },
};

const faqs = [
  {
    title: "How long will my piece take?",
    content:
      "Every piece is made to order, usually in four to eight weeks from the day we confirm. The exact window for each piece is on its product page, and we update you twice during the build.",
  },
  {
    title: "Do you deliver across Pakistan?",
    content:
      "Pieces are blanketed and hand-delivered in major cities. Elsewhere in Pakistan they travel by insured freight. Delivery is complimentary over PKR 150,000, otherwise a flat delivery fee is added at checkout.",
  },
  {
    title: "How does payment work?",
    content: `${Math.round(commerce.advanceRate * 100)}% of the order confirms the build and is collected once we confirm. The balance is due when the piece is delivered. Nothing is charged when you place the order online.`,
  },
  {
    title: "Can I see finishes in person?",
    content:
      "Yes, by appointment. Write to us with the pieces you are considering and we will have the finish samples ready.",
  },
  {
    title: "What if I need to cancel?",
    content:
      "An order can be cancelled without charge only before the workshop cuts the timber. After that, the advance covers material already committed to your piece.",
  },
];

export default function ContactPage() {
  const channels = [
    {
      label: "WhatsApp",
      value: "Message us",
      detail: brand.replyTime,
      href: whatsappLink("Hello — I would like to ask about a piece."),
      icon: ChatIcon,
      external: true,
    },
    {
      label: "Email",
      value: brand.email,
      detail: "For drawings, finishes, and longer notes",
      href: `mailto:${brand.email}`,
      icon: MailIcon,
      external: false,
    },
  ];

  return (
    <div className="page-shell pb-4 pt-10 md:pt-16">
      <JsonLd data={faqJsonLd(faqs)} />
      <header className="grid gap-10 border-b border-line pb-12 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-muted">
              <span className="h-px w-8 bg-muted/50" />
              Contact
            </p>
            <h1 className="display-1 mt-7">
              Talk to <em className="text-pine">us.</em>
            </h1>
          </Reveal>
        </div>

        <Reveal delay={0.08} className="lg:col-span-5">
          <p className="max-w-[42ch] leading-relaxed text-muted">
            Most orders begin with a question about a finish or a room. Write to us and we will tell
            you what is possible, what it costs, and when it can be delivered.
          </p>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted">
            <ClockIcon className="h-4 w-4" />
            {brand.hours} · {brand.replyTime}
          </p>
        </Reveal>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {channels.map((channel, index) => {
          const Icon = channel.icon;
          return (
            <Reveal key={channel.label} delay={index * 0.06}>
              <a
                href={channel.href}
                {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-pine/40 hover:bg-pine-soft/40"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-pine">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRightIcon className="h-4 w-4 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                </div>
                <div className="mt-10">
                  <p className="eyebrow text-muted">{channel.label}</p>
                  <p className="mt-2 text-lg">{channel.value}</p>
                  <p className="mt-1 text-xs text-muted">{channel.detail}</p>
                </div>
              </a>
            </Reveal>
          );
        })}

        <Reveal delay={0.12}>
          <div className="flex h-full flex-col justify-between rounded-2xl bg-pine p-6 text-canvas">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas/10">
              <TruckIcon className="h-5 w-5" />
            </span>
            <div className="mt-10">
              <p className="eyebrow text-canvas/70">Delivery</p>
              <p className="mt-2 text-lg">Across Pakistan</p>
              <p className="mt-1 text-xs text-canvas/70">
                Complimentary over {formatPKR(commerce.freeDeliveryFrom)}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mt-20 grid gap-14 border-t border-line pt-14 md:mt-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow text-muted">What happens next</p>
            <h2 className="display-2 mt-4 max-w-[13ch]">A conversation, then a piece.</h2>
            <p className="mt-6 max-w-[42ch] leading-relaxed text-muted">
              No automated checkout, no call centre. The same three people answer every message
              and stand behind every delivery.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <ol className="border-t border-line">
            {[
              {
                title: "You write",
                body: "Tell us the piece, the room, or the date it needs to arrive. A photograph of the space helps.",
              },
              {
                title: "We reply",
                body: `Within one working day, with the finish options, a firm price, and a delivery window.`,
              },
              {
                title: "We build",
                body: `A ${Math.round(commerce.advanceRate * 100)}% advance starts the workshop. The balance is collected on delivery.`,
              },
            ].map((step, index) => (
              <li key={step.title} className="border-b border-line">
                <Reveal delay={index * 0.05}>
                  <div className="grid gap-3 py-6 sm:grid-cols-[auto_1fr] sm:gap-8">
                    <span className="eyebrow pt-1 text-muted">0{index + 1}</span>
                    <div>
                      <h3 className="text-xl">{step.title}</h3>
                      <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-muted">
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
          <Accordion items={faqs} />
        </div>
      </section>

      <section className="mt-20 md:mt-24">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-7 rounded-2xl bg-surface px-7 py-10 md:flex-row md:items-center md:px-12 md:py-12">
            <div>
              <p className="eyebrow text-muted">Ready when you are</p>
              <h2 className="display-3 mt-3">Start with a message.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappLink("Hello — I would like to ask about a piece.")}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <ChatIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <a href={`mailto:${brand.email}`} className="btn-outline">
                Email us
                <ArrowUpRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <p className="mt-8 text-xs text-muted">
        Delivery over {formatPKR(commerce.freeDeliveryFrom)} is complimentary.
      </p>
    </div>
  );
}
