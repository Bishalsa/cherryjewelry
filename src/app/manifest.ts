import { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "Cherry",
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],
    orientation: "portrait-primary",
    // Brand palette — Rose Gold background, Deep Plum theme
    background_color: "#FFF8F4",
    theme_color: "#B76E79",
    categories: ["shopping", "lifestyle", "fashion"],
    lang: "en-IN",
    dir: "ltr",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New Arrivals",
        short_name: "New In",
        description: "Shop our latest jewelry arrivals",
        url: "/collections/new-arrivals",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Best Sellers",
        short_name: "Popular",
        description: "Most loved jewelry pieces",
        url: "/collections/best-sellers",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "My Wishlist",
        short_name: "Wishlist",
        description: "Your saved jewelry pieces",
        url: "/wishlist",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
