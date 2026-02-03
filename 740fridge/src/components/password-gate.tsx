"use client";

import * as React from "react";

const STORAGE_KEY = "740fridge:authed";
const APP_PASSWORD = "4foot2inch";

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [password, setPassword] = React.useState("");
  const [hasAccess, setHasAccess] = React.useState(false);
  const [hasTried, setHasTried] = React.useState(false);

  React.useEffect(() => {
    setHasAccess(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setHasTried(true);

    if (password !== APP_PASSWORD) return;

    window.localStorage.setItem(STORAGE_KEY, "true");
    setHasAccess(true);
  }

  if (hasAccess) return children;

  return (
    <div className="min-h-dvh grid place-items-center bg-[var(--background)] px-4">
      <div className="fridge-frame fridge-surface w-full max-w-md p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium tracking-wide text-zinc-600">
            740fridge
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Enter the fridge password
          </h1>
          <p className="text-sm text-zinc-600">
            This wall is private (simple password gate).
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <label className="text-sm font-medium text-zinc-700" htmlFor="pw">
            Password
          </label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            inputMode="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-xl border border-zinc-200 bg-white/70 px-3 text-base outline-none focus:ring-2 focus:ring-zinc-900/15"
            placeholder="••••••••••"
          />

          {hasTried && password !== APP_PASSWORD ? (
            <div className="text-sm text-red-600">Wrong password.</div>
          ) : null}

          <button
            type="submit"
            className="mt-2 h-11 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 active:bg-zinc-950"
          >
            Open fridge
          </button>

          <div className="text-xs text-zinc-500">
            Note: this is a client-side gate (acceptable for this project).
          </div>
        </form>
      </div>
    </div>
  );
}
