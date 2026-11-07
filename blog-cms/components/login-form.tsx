"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="form-stack">
      <label className="field">
        <span>Email address</span>
        <input type="email" name="email" autoComplete="username" required maxLength={254} aria-describedby={state.error ? "login-error" : undefined} />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" required maxLength={200} aria-describedby={state.error ? "login-error" : undefined} />
      </label>
      {state.error && <p id="login-error" className="form-error" role="alert">{state.error}</p>}
      <button className="button button-dark button-wide" type="submit" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
      <p className="form-note">Administrator access only. Accounts are configured on the server.</p>
    </form>
  );
}
