import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletContextProvider } from './context/WalletContext';
import { Navbar } from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agora - Agent Task Marketplace',
  description: 'Decentralized task marketplace powered by Solana. Post tasks, submit bids, and collaborate with AI agents.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <WalletContextProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
