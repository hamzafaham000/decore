import { randomInt } from "node:crypto";

import { commerce } from "@decore/core";
import { getCheckoutMethod } from "@decore/core";
import { prisma } from "@decore/db";
import { createAdvancePayment } from "@/lib/payments";
import { getProduct } from "@/lib/catalog";
import { quoteFor } from "@/lib/pricing";

// The reference is the only thing that opens the receipt page, so it must not
// be guessable. Same shape as before, but drawn from the CSPRNG.
function reference(): string {
  const stamp = Date.now().toString(36).slice(-5).toUpperCase();
  const noise = randomInt(0, 36 ** 3)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `DC-${stamp}${noise}`;
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > max) return null;
  return trimmed;
}

function optionalText(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return null;
  return text(value, max);
}

async function readOrder(body: unknown) {
  if (typeof body !== "object" || body === null) return { error: "Malformed request." } as const;
  const payload = body as Record<string, unknown>;

  const method = getCheckoutMethod(text(payload.method, 20) ?? "");
  if (!method) return { error: "Choose a payment method." } as const;

  const customer = payload.customer;
  if (typeof customer !== "object" || customer === null) {
    return { error: "Missing details." } as const;
  }
  const person = customer as Record<string, unknown>;

  const customerName = text(person.name, 120);
  if (!customerName) return { error: "Enter your name." } as const;

  const phone = text(person.phone, 24);
  if (!phone || !/^[0-9+\-\s()]{7,24}$/.test(phone)) {
    return { error: "Enter a reachable phone number." } as const;
  }

  const email = optionalText(person.email, 160);
  if (person.email && !email) return { error: "That email address looks incomplete." } as const;

  const addressLine1 = text(person.addressLine1, 200);
  if (!addressLine1) return { error: "Enter a delivery address." } as const;

  const city = text(person.city, 60);
  if (!city) return { error: "Enter a city." } as const;

  const rawItems = payload.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { error: "Your selection is empty." } as const;
  }

  const items: {
    productSlug: string;
    name: string;
    unitPrice: number;
    quantity: number;
    finish: string;
  }[] = [];

  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) {
      return { error: "One of the items is unreadable." } as const;
    }
    const item = raw as Record<string, unknown>;

    const product =
      typeof item.slug === "string" ? await getProduct(item.slug) : undefined;
    if (!product) return { error: "A piece in your selection is no longer available." } as const;

    const quantity = item.quantity;
    const max = commerce.maxQuantity;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > max) {
      return { error: `Quantities run from 1 to ${max}.` } as const;
    }

    const finish = text(item.finish, 80);
    if (!finish || !product.finishes.includes(finish)) {
      return { error: `Choose a finish for the ${product.name}.` } as const;
    }

    items.push({
      productSlug: product.slug,
      name: product.name,
      unitPrice: product.price,
      quantity,
      finish,
    });
  }

  // Prices come from the catalogue, never from the browser.
  const quote = quoteFor(items);

  return {
    value: {
      method,
      quote,
      items,
      customerName,
      phone,
      email,
      addressLine1,
      addressLine2: optionalText(person.addressLine2, 200),
      city,
      notes: optionalText(person.notes, 1000),
      cancellationOk: person.cancellationOk === true,
    },
  } as const;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = await readOrder(body);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const order = parsed.value;

  let created;
  try {
    created = await prisma.order.create({
      data: {
        reference: reference(),
        method: order.method.id,
        status: "AWAITING_CONFIRMATION",
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        city: order.city,
        notes: order.notes,
        cancellationOk: order.cancellationOk,
        subtotal: order.quote.subtotal,
        deliveryFee: order.quote.deliveryFee,
        total: order.quote.total,
        advanceDue: order.quote.advanceDue,
        balanceDue: order.quote.balanceDue,
        items: {
          create: order.items.map((item) => ({
            productSlug: item.productSlug,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            finish: item.finish,
          })),
        },
      },
      select: { reference: true, method: true, total: true, advanceDue: true },
    });
  } catch (error) {
    // A locked record or a database that is down both land here. The browser gets a
    // message it can act on; the actual cause stays in the server log.
    console.error("Could not record order", error);
    return Response.json(
      { error: "We could not record the order just now. Please try again, or message us on WhatsApp." },
      { status: 503 },
    );
  }

  const payment = await createAdvancePayment();

  return Response.json({ ...created, paymentRedirectUrl: payment.redirectUrl }, { status: 201 });
}
