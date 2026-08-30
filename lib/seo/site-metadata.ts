import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/data/site";

export const baseMetadata: Metadata = {
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

export const baseViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F4EE",
  colorScheme: "light",
};
