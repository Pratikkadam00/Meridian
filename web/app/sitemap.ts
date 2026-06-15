import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meridian.ae";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1 },
    { path: "/how-it-works", priority: 0.8 },
    { path: "/early-access", priority: 0.8 },
    { path: "/about", priority: 0.6 },
    { path: "/join", priority: 0.7 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/cookies", priority: 0.3 },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: new Date("2026-06-15"),
    changeFrequency: "monthly",
    priority: r.priority,
  }));
}
