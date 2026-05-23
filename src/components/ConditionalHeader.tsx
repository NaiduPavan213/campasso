"use client";

import Link from "next/link";
import SignOut from "@/components/SignOut";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ConditionalHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide on hero page — it has its own navbar
  if (pathname === "/") return null;

  const navLinks = [
    { href: "/colleges", label: "Colleges" },
    { href: "/compare", label: "Compare" },
    { href: "/shortlist", label: "Shortlist" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "!bg-[#071620]/95 backdrop-blur-md border-b border-white/[0.06] shadow-lg"
          : "!bg-[#071620] border-b border-white/[0.06]"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          {/* Icon mark */}
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="#00E5FF" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="2" fill="#00E5FF"/>
            </svg>
          </div>
          <span className="text-[18px] font-semibold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
            campasso
          </span>
        </Link>

        {/* Center nav links — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <>
              {/* User avatar */}
              <div className="flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.08] rounded-full pl-1.5 pr-3 py-1">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[11px] font-medium text-cyan-400">
                  {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                </div>
                <span className="text-sm text-white/70 max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <SignOut />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium px-4 py-2 rounded-full !bg-cyan-500 hover:!bg-cyan-400 text-[#071620] transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden !bg-[#071620] border-t border-white/[0.06] px-4 py-4 flex flex-col gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-white/[0.06] pt-3 mt-1">
            {session?.user ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50 truncate">
                  {session.user.name || session.user.email}
                </span>
                <SignOut />
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-sm font-medium py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-sm font-medium py-2.5 rounded-full !bg-cyan-500 hover:!bg-cyan-400 text-[#071620] transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}