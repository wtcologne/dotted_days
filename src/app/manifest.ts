import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Monthly Challenge",
    short_name: "Challenge",
    description: "Track one calm monthly challenge.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F0E8",
    theme_color: "#F7F0E8",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
