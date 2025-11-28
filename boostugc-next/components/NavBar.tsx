"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Use Cases", href: "/use-cases" },
  { label: "Comparisons", href: "/comparisons" },
];

const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/guides" },
  { label: "FAQ", href: "/faq" },
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="border-b border-white/10 bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-white">
          BoostUGC
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-white transition">
              Resources
              <span className="text-xs">▾</span>
            </button>
            <div className="hidden group-hover:flex absolute top-full right-0 mt-2 bg-white text-gray-900 shadow-xl rounded-lg p-4 flex-col gap-2 min-w-[180px]">
              {resourceLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/signup"
            className="rounded-full bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 transition"
          >
            Start Free Trial
          </Link>
        </div>
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen((v) => !v)}
        >
          ☰
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-900 px-6 py-4 space-y-3 text-sm text-gray-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="space-y-2">
            <p className="text-gray-400 text-xs uppercase tracking-wide">
              Resources
            </p>
            {resourceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            href="/signup"
            className="inline-block rounded-full bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 transition"
            onClick={() => setMobileOpen(false)}
          >
            Start Free Trial
          </Link>
        </div>
      )}
    </div>
  );
}
