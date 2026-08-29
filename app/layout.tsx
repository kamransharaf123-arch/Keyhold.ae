import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "KeyHold | Dubai Real Estate",
    template: "%s | KeyHold",
  },
  description: siteConfig.description,
  applicationName: "KeyHold",
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: "KeyHold",
    title: "KeyHold | Dubai Real Estate",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyHold | Dubai Real Estate",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FCFBF8",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
