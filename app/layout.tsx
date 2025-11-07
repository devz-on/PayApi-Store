import "./globals.css";
import { ReactNode } from "react";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: {
    default: "Devz Pay Wrapper API | DevzON",
    template: "%s | Devz Pay Wrapper",
  },
  description:
    "Beautiful & simple REST API wrapper for Razorpay built by DevzON — create payment QRs and check statuses instantly.",
  icons: {
    icon: "/logo.png", // path in /public
  },
  openGraph: {
    title: "Devz Pay Wrapper API | DevzON",
    description:
      "Supercharge your Razorpay payments with the Devz Pay Wrapper API — simple, fast, and developer-friendly.",
    url: "https://store.devxjin.site",
    siteName: "Devz Pay Wrapper",
    images: [
      {
        url: "/og-image.png", // optional, for link previews
        width: 1200,
        height: 630,
        alt: "Devz Pay Wrapper API by DevzON",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devz Pay Wrapper API | DevzON",
    description: "Powerful Razorpay payment wrapper built by DevzON.",
    images: ["/og-image.png"],
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body>{children}
        <SpeedInsights />
      </body>
    </html>
  );
}
