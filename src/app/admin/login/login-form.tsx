"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-7 space-y-4">
      <label className="block">
        <span className="a-label">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field mt-1.5"
        />
      </label>

      <label className="block">
        <span className="a-label">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field mt-1.5"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-[#a03d2c]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="a-btn a-btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
