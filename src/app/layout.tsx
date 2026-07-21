import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Playfair_Display, DM_Sans } from "next/font/google";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION, APP_URL, APP_OG_IMAGE } from "@/lib/constants";
import Script from "next/script";
import "./globals.css";

// ─────────────────────────────────────────────────────────────────────────────
// Font System
//
// Cormorant Garamond: Display / Logo — ultra-luxury feel, editorial grade
// Playfair Display:   Headings — elegant serif for h1–h4
// DM Sans:            Body / UI — crisp, highly legible on mobile OLED screens
// ─────────────────────────────────────────────────────────────────────────────

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// DM Sans: designed for digital screens, excellent on Android OLED at any size
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// ─────────────────────────────────────────────────────────────────────────────
// Viewport (separate export per Next.js App Router spec)
// ─────────────────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,       // Allow user zoom for accessibility
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#B76E79" },
    { media: "(prefers-color-scheme: dark)", color: "#5C2248" },
  ],
  colorScheme: "light dark",
};

// ─────────────────────────────────────────────────────────────────────────────
// SEO Metadata
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,

  keywords: [
    // Primary intent keywords
    "Cherry Jewelry",
    "handcrafted jewelry India",
    "luxury jewelry online",
    "BIS hallmarked gold jewelry",
    "certified diamond jewelry",
    // Category keywords
    "gold rings online",
    "diamond necklace",
    "silver earrings",
    "gold bracelets",
    "mangalsutra online",
    "jewelry pendants",
    // Long-tail / gift intent
    "jewelry gift for girlfriend",
    "anniversary jewelry gift",
    "wedding jewelry India",
    "best jewelry store online India",
    // Location-agnostic luxury
    "premium jewelry D2C",
    "jewelry with free shipping",
  ],

  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,

  // Canonical and alternates
  alternates: {
    canonical: APP_URL,
  },

  // Open Graph — 1200×630 luxury brand image
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: APP_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Exquisite Handcrafted Jewelry`,
        type: "image/jpeg",
      },
    ],
  },

  // Twitter / X Cards
  twitter: {
    card: "summary_large_image",
    site: "@CherryJewelry",
    creator: "@CherryJewelry",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    images: [APP_OG_IMAGE],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Apple / PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },

  // Verification (add Search Console ID when available)
  // verification: { google: "YOUR_GOOGLE_VERIFICATION_ID" },

  // Format detection — prevent iOS auto-linking phone numbers incorrectly
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // Category for app stores
  category: "shopping",
};

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD Structured Data (Organization + WebSite schema)
// Helps Google rich results and Knowledge Panel
// ─────────────────────────────────────────────────────────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: APP_NAME,
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      description: APP_DESCRIPTION,
      foundingDate: "2024",
      areaServed: "IN",
      currenciesAccepted: "INR",
      priceRange: "₹₹",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-98765-43210",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
        areaServed: "IN",
      },
      sameAs: [
        "https://instagram.com/cherryjewelry",
        "https://facebook.com/cherryjewelry",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: APP_NAME,
      description: APP_DESCRIPTION,
      publisher: { "@id": `${APP_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${APP_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html
      lang="en-IN"
      className={`${cormorantGaramond.variable} ${playfairDisplay.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Favicon system */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                });
              `}
            </Script>
          </>
        )}

        {/* Microsoft Clarity */}
        {clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","${clarityId}");
            `}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
