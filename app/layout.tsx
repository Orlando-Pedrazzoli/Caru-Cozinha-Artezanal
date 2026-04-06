import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Caru - Cozinha Artesanal | Menu Digital',
  description:
    'Salgados, doces e produtos fitness artesanais. Menu digital Caru.',
  keywords:
    'cozinha artesanal, salgados, doces, fitness, menu digital, portugal',
  authors: [{ name: 'Caru - Cozinha Artesanal' }],
  openGraph: {
    title: 'Caru - Cozinha Artesanal | Menu Digital',
    description: 'Salgados, doces e produtos fitness artesanais.',
    type: 'website',
    locale: 'pt_PT',
    siteName: 'Caru - Cozinha Artesanal',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt' suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
