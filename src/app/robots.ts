import { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all reputable crawlers
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin",
          "/api/",
          "/api",
          "/checkout/",
          "/checkout",
          "/order-confirmation/",
          "/order-confirmation",
          "/account/",
          "/account",
          "/login/",
          "/register/",
          "/_next/",
        ],
      },
      {
        // Block AI training scrapers that don't respect robots.txt conventions
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web"],
        disallow: ["/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
