"use server";

import { redirect } from "next/navigation";

import { createSession } from "@decore/auth";
import { verifyPassword } from "@decore/core";
import { prisma } from "@decore/db";

export type LoginState = { error?: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password do not match." };
  }

  await createSession(user.id);
  redirect("/admin");
}
