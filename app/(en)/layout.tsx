import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { websiteThemeStyle } from "@/lib/cms/website-theme";
import { websiteMotionBodyAttributes, websiteMotionStyle } from "@/lib/motion/config";
import { baseMetadata, baseViewport } from "@/lib/seo/site-metadata";
import "../globals.css";
import "../motion.css";

export const metadata = baseMetadata;
export const viewport = baseViewport;

export default function EnglishRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" style={{ ...websiteThemeStyle(), ...websiteMotionStyle() }}>
      <body {...websiteMotionBodyAttributes()}>
        <SiteHeader />
        <main className="kh-page-intro">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
