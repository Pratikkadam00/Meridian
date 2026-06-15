"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/early-access", label: "Early access" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav className="nav" aria-label="Primary">
        <Link href="/" className="brand" aria-label="Meridian — home">
          Mer<span className="i">i</span>dian
        </Link>
        <div className="mid">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/join" className="pill">
          Join the waitlist
        </Link>
        <button
          type="button"
          className="menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div id="mobile-nav" className={`mobile-nav${open ? " open" : ""}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link href="/join" onClick={() => setOpen(false)}>
          Join the waitl<span className="i">i</span>st
        </Link>
      </div>
    </>
  );
}
