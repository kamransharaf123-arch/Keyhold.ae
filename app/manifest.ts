import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KeyHold",
    short_name: "KeyHold",
    description: "Dubai real estate advisory platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFBF8",
    theme_color: "#171717",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
