"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// One IntersectionObserver wires every scroll-reveal element (.rv / .draw / .fly)
// on the page, matching the v4 contract. Re-scans on route change so client
// navigations animate too. Honors reduced-motion (the CSS neutralizes transforms,
// and we simply reveal everything immediately).
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(".rv, .draw, .fly"),
    );

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );

    targets.forEach((el) => {
      if (!el.classList.contains("in")) io.observe(el);
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
