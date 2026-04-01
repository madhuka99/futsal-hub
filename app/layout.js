// app/layout.js
import "@/app/globals.css";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://futsal-manager.vercel.app"
  ),
  title: {
    default: "FutsalHub",
    template: "%s | FutsalHub",
  },
  description: "Manage your futsal games with friends",
  keywords: ["futsal", "sports", "team management", "soccer", "football"],
  authors: [{ name: "Yahampath Chandika" }],
  creator: "Yahampath Chandika",
  applicationName: "FutsalHub",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FutsalHub",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "FutsalHub",
    title: {
      default: "FutsalHub",
      template: "%s | FutsalHub",
    },
    description: "Manage your futsal games with friends",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "FutsalHub Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "FutsalHub",
      template: "%s | FutsalHub",
    },
    description: "Manage your futsal games with friends",
    images: ["https://futsal-manager.vercel.app/logo.png"],
    creator: "@yourtwitter",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FutsalHub" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/logo.svg" color="#000000" />

        {/* iOS Splash Screens */}
        {/* iPhone 16 Pro Max, 15 Plus, 14 Pro Max */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1320x2868.png"
          media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        {/* iPhone 16 Pro, 15 Pro, 15, 14 Pro */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1179x2556.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        {/* iPhone 14, 13, 13 Pro, 12, 12 Pro */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        {/* iPhone 14 Plus, 13 Pro Max, 12 Pro Max */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1284x2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        {/* iPhone 13 Mini, 12 Mini, 11 Pro, XS, X */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        {/* iPhone SE 3rd/2nd gen, 8, 7, 6s */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        {/* iPhone 11, XR */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-828x1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        {/* iPhone 11 Pro Max, XS Max */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1242x2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        {/* iPad Pro 12.9" */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-2048x2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        {/* iPad Pro 11" */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1668x2388.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        {/* iPad Air, iPad 10th gen */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1640x2360.png"
          media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        {/* iPad Mini, iPad 9th gen */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1536x2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
      </head>
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
