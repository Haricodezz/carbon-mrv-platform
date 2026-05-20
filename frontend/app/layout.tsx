import './globals.css';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ClientProviders from '@/components/providers/ClientProviders';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';



import {
  Playfair_Display,
  Inter,
} from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${playfair.variable} ${inter.variable} bg-white text-slate-900 antialiased`}
      >
        <ClientProviders>
          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}