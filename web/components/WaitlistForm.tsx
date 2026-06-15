"use client";

import { useActionState } from "react";
import { submitWaitlist, type WaitlistState } from "@/app/actions";

const initial: WaitlistState = { status: "idle", message: "" };

type Props = {
  source?: string;
  placeholder?: string;
  cta?: string;
  /** "light" tweaks the message colors for use on cream/bone bands. */
  tone?: "dark" | "light";
};

export default function WaitlistForm({
  source = "website",
  placeholder = "you@brokerage.ae",
  cta = "Join the waitlist",
  tone = "dark",
}: Props) {
  const [state, formAction, pending] = useActionState(submitWaitlist, initial);
  const done = state.status === "ok";

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="source" value={source} />
      {/* Honeypot — hidden from users + assistive tech, catches bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="wl-company">Company</label>
        <input id="wl-company" type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {!done && (
        <div className="em">
          <label htmlFor="wl-email" className="hp">
            Work email
          </label>
          <input
            id="wl-email"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder={placeholder}
            aria-label="Work email"
          />
          <button type="submit" disabled={pending}>
            {pending ? "Joining…" : cta}
          </button>
        </div>
      )}

      {state.status !== "idle" && (
        <p
          className={`form-msg ${state.status === "ok" ? "ok" : "err"} ${
            tone === "light" ? "on-light" : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {state.status === "ok" ? "✓ " : ""}
          {state.message}
        </p>
      )}
    </form>
  );
}
