"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createWaitlistClient } from "@/lib/supabase";

export type WaitlistState = {
  status: "idle" | "ok" | "error";
  message: string;
};

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  fullName: z.string().trim().max(120).optional().or(z.literal("")),
  brokerage: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().trim().max(60).optional().or(z.literal("")),
});

// Best-effort per-IP limiter. Resets on cold start; a production deployment
// should also run the platform WAF / rate limiter (e.g. Vercel Firewall) in
// front. Defense-in-depth, not the only line.
const HITS = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = HITS.get(ip);
  if (!entry || now > entry.reset) {
    HITS.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function submitWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  // Honeypot: a real user never fills this hidden field. Pretend success so
  // bots get no signal.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "ok", message: "You're on the list. We'll be in touch." };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return { status: "error", message: "Too many attempts. Try again in a minute." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName") ?? "",
    brokerage: formData.get("brokerage") ?? "",
    source: formData.get("source") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check your details.",
    };
  }

  const supabase = createWaitlistClient();
  if (!supabase) {
    return {
      status: "error",
      message: "The waitlist isn't configured yet. Please try again soon.",
    };
  }

  const { error } = await supabase.from("waitlist").insert({
    email: parsed.data.email,
    full_name: parsed.data.fullName || null,
    brokerage: parsed.data.brokerage || null,
    source: parsed.data.source || "website",
  });

  if (error) {
    // Unique violation → already joined. Treat as a friendly success.
    if (error.code === "23505") {
      return { status: "ok", message: "You're already on the list — nicely done." };
    }
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  return {
    status: "ok",
    message: "You're on the list. We'll reach out with early access.",
  };
}
