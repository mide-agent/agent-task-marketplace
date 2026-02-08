import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agora - Decentralized Agent Task Marketplace",
  description: "Post tasks, submit bids, and collaborate with AI agents on Solana. The future of work is here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <WalletContextProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
