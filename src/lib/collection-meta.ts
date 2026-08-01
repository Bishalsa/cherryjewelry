// ============================================
// Cherry Jewelry — Collection Metadata Config
// Central source of truth for all collection
// pages: slugs, titles, descriptions, SEO copy,
// hero content, and JSON-LD schema helpers.
// ============================================

import { APP_NAME, APP_URL } from "@/lib/constants";

export interface CollectionConfig {
  slug: string;
  title: string;           // Page <title>
  heading: string;         // H1 on the page
  description: string;     // Meta description
  ogDescription: string;   // OG description (can differ)
  heroTagline: string;     // Small eyebrow text above h1
  heroParagraph: string;   // Sub-heading paragraph
  emoji: string;           // Decorative emoji for placeholder images
  dbFilter: {              // Maps to getProducts() ProductFilters
    category?: string;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    isFeatured?: boolean;
    isSale?: boolean;      // priceMax trick — handled in page
  };
  relatedSlugs: string[];  // Shown at bottom of page
}

// ─── All supported collection slugs ──────────────────────────────────────────

export const COLLECTION_CONFIGS: Record<string, CollectionConfig> = {
  "new-arrivals": {
    slug: "new-arrivals",
    title: `New Arrivals — Latest Fashion Jewelry | ${APP_NAME}`,
    heading: "New Arrivals",
    description: `Shop the latest wholesale & fashion jewelry at ${APP_NAME}. Fresh anti-tarnish rings, necklaces, earrings & bracelets added weekly. Quality Assured.`,
    ogDescription: `Discover ${APP_NAME}'s newest fashion jewelry — premium pieces arriving every week. Shop rings, necklaces, earrings & bracelets.`,
    heroTagline: "Fresh Collections",
    heroParagraph: "Be the first to explore our latest fashion & wholesale jewelry pieces — crafted for everyday style.",
    emoji: "✨",
    dbFilter: { isNewArrival: true },
    relatedSlugs: ["best-sellers", "rings", "necklaces"],
  },
  "best-sellers": {
    slug: "best-sellers",
    title: `Best Sellers — Most Loved Fashion Jewelry | ${APP_NAME}`,
    heading: "Best Sellers",
    description: `Discover ${APP_NAME}'s most loved fashion jewelry pieces. Bestselling rings, necklaces, earrings & bracelets. Trusted by wholesale & retail customers.`,
    ogDescription: `Shop ${APP_NAME}'s best selling fashion jewelry — trending designs loved by our customers.`,
    heroTagline: "Most Loved",
    heroParagraph: "Chosen by thousands of happy customers. These are our top-trending fashion jewelry pieces.",
    emoji: "⭐",
    dbFilter: { isBestSeller: true },
    relatedSlugs: ["new-arrivals", "featured", "rings"],
  },
  featured: {
    slug: "featured",
    title: `Featured Collection — Curated Fashion Jewelry | ${APP_NAME}`,
    heading: "Featured Collection",
    description: `Explore ${APP_NAME}'s hand-curated featured fashion jewelry. Premium stainless steel, alloy, and crystal pieces selected for exceptional finish.`,
    ogDescription: `Hand-curated fashion jewelry from ${APP_NAME}. Premium anti-tarnish pieces selected for style and finish.`,
    heroTagline: "Trending Selection",
    heroParagraph: "A carefully curated selection of our finest fashion jewelry — chosen for premium finish and style.",
    emoji: "💎",
    dbFilter: { isFeatured: true },
    relatedSlugs: ["best-sellers", "new-arrivals", "necklaces"],
  },
  sale: {
    slug: "sale",
    title: `Sale — Fashion Jewelry Special Offers | ${APP_NAME}`,
    heading: "Sale",
    description: `Shop ${APP_NAME}'s sale collection. Premium fashion & wholesale jewelry at special prices. Limited stock offers.`,
    ogDescription: `${APP_NAME} sale — premium fashion jewelry at wholesale prices. Limited time offers.`,
    heroTagline: "Wholesale Offers",
    heroParagraph: "Premium fashion jewelry at exceptional value. Quality anti-tarnish finish at special prices.",
    emoji: "🏷️",
    dbFilter: {},
    relatedSlugs: ["new-arrivals", "best-sellers", "rings"],
  },
  rings: {
    slug: "rings",
    title: `Rings Collection — Fashion & Alloy Rings | ${APP_NAME}`,
    heading: "Rings",
    description: `Shop premium fashion rings at ${APP_NAME}. Stainless steel rings, crystal rings, stackable rings & statement bands. Quality Assured.`,
    ogDescription: `${APP_NAME}'s fashion ring collection — stainless steel, crystal, and statement rings for everyday wear.`,
    heroTagline: "Circle of Style",
    heroParagraph: "From everyday stacking rings to bold statement bands — find the ring that suits your vibe.",
    emoji: "💍",
    dbFilter: { category: "rings" },
    relatedSlugs: ["necklaces", "bracelets", "best-sellers"],
  },
  necklaces: {
    slug: "necklaces",
    title: `Necklaces — Fashion & Pendant Chains | ${APP_NAME}`,
    heading: "Necklaces",
    description: `Discover elegant fashion necklaces at ${APP_NAME}. Pendant chains, layered necklaces, crystal chokers & statement pieces.`,
    ogDescription: `${APP_NAME}'s necklace collection — from delicate pendant chains to bold statement pieces.`,
    heroTagline: "Wear Your Style",
    heroParagraph: "From delicate pendant chains to bold statement pieces — our fashion necklaces are designed for everyday elegance.",
    emoji: "📿",
    dbFilter: { category: "necklaces" },
    relatedSlugs: ["earrings", "pendants", "rings"],
  },
  earrings: {
    slug: "earrings",
    title: `Earrings — Fashion Studs, Hoops & Drops | ${APP_NAME}`,
    heading: "Earrings",
    description: `Shop beautiful fashion earrings at ${APP_NAME}. Studs, hoops, drop earrings & crystal dangles. Skin-friendly & anti-tarnish.`,
    ogDescription: `${APP_NAME}'s earring collection — stylish studs, hoops, and drop earrings for every occasion.`,
    heroTagline: "Frame Your Style",
    heroParagraph: "Earrings that elevate your look — from minimalist studs to eye-catching hoops.",
    emoji: "✨",
    dbFilter: { category: "earrings" },
    relatedSlugs: ["necklaces", "rings", "bracelets"],
  },
  bracelets: {
    slug: "bracelets",
    title: `Bracelets — Fashion Bangles & Chains | ${APP_NAME}`,
    heading: "Bracelets",
    description: `Shop stunning fashion bracelets at ${APP_NAME}. Stainless steel bangles, charm bracelets, tennis bracelets & cuff bands.`,
    ogDescription: `${APP_NAME}'s bracelet collection — stylish bangles, charm bracelets, and cuff bands.`,
    heroTagline: "Wrap It Up",
    heroParagraph: "From delicate chain bracelets to bold cuffs — wear style on your wrist.",
    emoji: "⭐",
    dbFilter: { category: "bracelets" },
    relatedSlugs: ["rings", "earrings", "best-sellers"],
  },
  pendants: {
    slug: "pendants",
    title: `Pendants — Fashion Charms & Amulets | ${APP_NAME}`,
    heading: "Pendants",
    description: `Discover fashion pendants at ${APP_NAME}. Shell inlays, crystal charms, butterfly pendants & statement motifs.`,
    ogDescription: `${APP_NAME}'s pendant collection — crystal and shell pendants crafted with style.`,
    heroTagline: "A Touch of Sparkle",
    heroParagraph: "Pendants that add flair to any outfit. From minimalist charms to crystal motifs.",
    emoji: "💎",
    dbFilter: { category: "pendants" },
    relatedSlugs: ["necklaces", "earrings", "rings"],
  },
  bangles: {
    slug: "bangles",
    title: `Bangles — Fashion & Anti-Tarnish Bangles | ${APP_NAME}`,
    heading: "Bangles",
    description: `Shop fashion bangles at ${APP_NAME}. Contemporary anti-tarnish bangles, cuff sets & modern designs.`,
    ogDescription: `${APP_NAME}'s bangle collection — stylish contemporary bangles and cuff sets.`,
    heroTagline: "Sound of Style",
    heroParagraph: "Bangles that combine contemporary trends with everyday durability — find your set.",
    emoji: "🌟",
    dbFilter: { category: "bangles" },
    relatedSlugs: ["bracelets", "rings", "earrings"],
  },
  anklets: {
    slug: "anklets",
    title: `Anklets — Fashion Charm Anklets | ${APP_NAME}`,
    heading: "Anklets",
    description: `Shop delicate fashion anklets at ${APP_NAME}. Stainless steel & charm anklets for everyday wear.`,
    ogDescription: `${APP_NAME}'s anklet collection — delicate charm anklets for everyday style.`,
    heroTagline: "Grace in Every Step",
    heroParagraph: "Delicate anklets that add a subtle sparkle — from minimalist chains to charm anklets.",
    emoji: "🦶",
    dbFilter: { category: "anklets" },
    relatedSlugs: ["bracelets", "bangles", "rings"],
  },
  mangalsutra: {
    slug: "mangalsutra",
    title: `Mangalsutra — Modern Fashion Designs | ${APP_NAME}`,
    heading: "Mangalsutra",
    description: `Discover modern fashion mangalsutras at ${APP_NAME}. Lightweight anti-tarnish designs for daily wear.`,
    ogDescription: `${APP_NAME}'s mangalsutra collection — modern contemporary fashion designs.`,
    heroTagline: "Modern Traditions",
    heroParagraph: "Mangalsutras designed for the modern lifestyle — lightweight, elegant, and anti-tarnish.",
    emoji: "🪷",
    dbFilter: { category: "mangalsutra" },
    relatedSlugs: ["necklaces", "pendants", "rings"],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the config for a slug, or null if not found */
export function getCollectionConfig(slug: string): CollectionConfig | null {
  return COLLECTION_CONFIGS[slug] ?? null;
}

/** All valid collection slugs (for generateStaticParams) */
export const ALL_COLLECTION_SLUGS = Object.keys(COLLECTION_CONFIGS);

/** Build canonical URL for a collection */
export function collectionCanonical(slug: string): string {
  return `${APP_URL}/collections/${slug}`;
}

/** Build JSON-LD CollectionPage + BreadcrumbList for a collection */
export function buildCollectionJsonLd(
  config: CollectionConfig,
  productCount: number
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${collectionCanonical(config.slug)}/#webpage`,
        url: collectionCanonical(config.slug),
        name: config.title,
        description: config.description,
        isPartOf: { "@id": `${APP_URL}/#website` },
        breadcrumb: { "@id": `${collectionCanonical(config.slug)}/#breadcrumb` },
        about: {
          "@type": "ItemList",
          name: config.heading,
          numberOfItems: productCount,
          description: config.description,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${collectionCanonical(config.slug)}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: APP_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Collections",
            item: `${APP_URL}/collections`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: config.heading,
            item: collectionCanonical(config.slug),
          },
        ],
      },
    ],
  };
}
