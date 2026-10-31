"use server";

import { redirect } from "next/navigation";

import { destroySession } from "@decore/auth";

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
