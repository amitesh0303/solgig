"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { TRUNCATE_WALLET } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/jobs", label: "Find Work" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/messages", label: "Messages" },
];

export function Navbar() {
  const { publicKey } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-purple-900/30 bg-[#0d0a1a]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-gradient">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
              Sol<span className="text-purple-400">Gig</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 hover:text-purple-400 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            {publicKey && (
              <Link
                href={`/profile/${publicKey.toBase58()}`}
                className="text-sm text-gray-300 hover:text-purple-400 transition-colors font-medium"
              >
                Profile ({TRUNCATE_WALLET(publicKey.toBase58())})
              </Link>
            )}
          </div>

          {/* Wallet button */}
          <div className="hidden md:block">
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !text-sm !font-medium !h-9 !py-0" />
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-purple-900/30 bg-[#0d0a1a] px-4 py-4 space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-300 hover:text-purple-400 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          {publicKey && (
            <Link
              href={`/profile/${publicKey.toBase58()}`}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-300 hover:text-purple-400 transition-colors font-medium"
            >
              My Profile
            </Link>
          )}
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !text-sm !font-medium !w-full !justify-center" />
        </div>
      )}
    </nav>
  );
}
