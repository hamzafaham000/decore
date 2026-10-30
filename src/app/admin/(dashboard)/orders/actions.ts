"use server";

import { revalidatePath } from "next/cache";

import type { OrderStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const statuses: OrderStatus[] = [
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "PAID",
  "DISPATCHED",
  "CANCELLED",
];

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateStatus(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const status = text(formData, "status") as OrderStatus;

  if (!id || !statuses.includes(status)) return;

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function setAdvancePaid(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  if (!id) return;

  const order = await prisma.order.findUnique({ where: { id }, select: { advancePaid: true } });
  if (!order) return;

  await prisma.order.update({ where: { id }, data: { advancePaid: !order.advancePaid } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}
