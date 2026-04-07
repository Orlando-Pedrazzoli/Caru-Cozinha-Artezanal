import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
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

const siteUrl = 'https://www.caru.pt';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Caru - Cozinha Artesanal | Salgados, Doces e Fitness',
    template: '%s | Caru - Cozinha Artesanal',
  },
  description:
    'Encomende salgados, doces e produtos fitness artesanais. Tortas, quiches, brigadeiros, brownies e muito mais. Entrega em Portugal.',
  keywords: [
    'cozinha artesanal',
    'salgados artesanais',
    'doces artesanais',
    'fitness',
    'tortas',
    'quiches',
    'brigadeiros',
    'brownies',
    'encomendas',
    'portugal',
    'menu digital',
  ],
  authors: [{ name: 'Caru - Cozinha Artesanal', url: siteUrl }],
  creator: 'Orlando Pedrazzoli',
  publisher: 'Caru - Cozinha Artesanal',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    alternateLocale: 'en_GB',
    url: siteUrl,
    siteName: 'Caru - Cozinha Artesanal',
    title: 'Caru - Cozinha Artesanal | Salgados, Doces e Fitness',
    description:
      'Encomende salgados, doces e produtos fitness artesanais. Tortas, quiches, brigadeiros, brownies e muito mais.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        secureUrl: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Caru - Cozinha Artesanal',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caru - Cozinha Artesanal | Salgados, Doces e Fitness',
    description:
      'Encomende salgados, doces e produtos fitness artesanais. Entrega em Portugal.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Caru - Cozinha Artesanal',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'pt-PT': `${siteUrl}/pt`,
      'en-GB': `${siteUrl}/en`,
    },
  },
  verification: {
    // google: 'codigo-google-search-console',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#6B3A7D',
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
        {children}
      </body>
    </html>
  );
}
