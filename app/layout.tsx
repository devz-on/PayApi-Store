import "./globals.css";
import { ReactNode } from "react";
import Script from "next/script";

export const metadata = {
  title: "Devz Pay Wrapper API",
  description: "Simple REST API wrapper built by DevzON",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}