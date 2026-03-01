import type { Metadata } from "next";
import "./globals.css";
import { SolanaWalletProvider } from "@/providers/WalletProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SolGig - Decentralized Freelance Marketplace on Solana",
  description:
    "The first decentralized freelance marketplace on Solana. Zero fees, trustless escrow payments, on-chain reviews.",
  keywords: ["solana", "freelance", "decentralized", "web3", "crypto", "defi"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#0d0a1a] text-white antialiased">
        <SolanaWalletProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
