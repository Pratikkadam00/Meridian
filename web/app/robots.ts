import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meridian.ae";

export default function robots(): MetadataRoute.Robots {
  return {
    // /shared/* are per-buyer client-portal links (already noindex via page
    // metadata) — disallow crawling too, defense-in-depth against an indexer
    // that ignores meta robots.
    rules: { userAgent: "*", allow: "/", disallow: "/shared/" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
