"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-xs uppercase tracking-[0.14em] text-muted">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field mt-2"
        />
      </label>

      <label className="block">
        <span className="text-xs uppercase tracking-[0.14em] text-muted">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field mt-2"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-clay">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
