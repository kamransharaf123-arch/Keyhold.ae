import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { websiteThemeStyle } from "@/lib/cms/website-theme";
import { baseMetadata, baseViewport } from "@/lib/seo/site-metadata";
import "../globals.css";

export const metadata = baseMetadata;
export const viewport = baseViewport;

export default function EnglishRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" style={websiteThemeStyle()}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
