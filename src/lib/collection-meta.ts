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
    title: `New Arrivals — Latest Jewelry | ${APP_NAME}`,
    heading: "New Arrivals",
    description: `Shop the latest jewelry at ${APP_NAME}. Fresh handcrafted rings, necklaces, earrings & bracelets added weekly. BIS Hallmarked. Free shipping above ₹999.`,
    ogDescription: `Discover ${APP_NAME}'s newest jewelry — handcrafted pieces arriving every week. Shop rings, necklaces, earrings & bracelets.`,
    heroTagline: "Fresh from the Workshop",
    heroParagraph: "Be the first to own our latest handcrafted pieces — each one a new story waiting to be told.",
    emoji: "✨",
    dbFilter: { isNewArrival: true },
    relatedSlugs: ["best-sellers", "rings", "necklaces"],
  },
  "best-sellers": {
    slug: "best-sellers",
    title: `Best Sellers — Most Loved Jewelry | ${APP_NAME}`,
    heading: "Best Sellers",
    description: `Discover ${APP_NAME}'s most loved jewelry pieces. Bestselling rings, necklaces, earrings & bracelets. Trusted by thousands of happy customers.`,
    ogDescription: `Shop ${APP_NAME}'s best selling jewelry — the pieces thousands of customers love most.`,
    heroTagline: "Most Loved",
    heroParagraph: "Chosen by thousands of happy customers. These are the pieces everyone is talking about.",
    emoji: "⭐",
    dbFilter: { isBestSeller: true },
    relatedSlugs: ["new-arrivals", "featured", "rings"],
  },
  featured: {
    slug: "featured",
    title: `Featured Collection — Curated Luxury | ${APP_NAME}`,
    heading: "Featured Collection",
    description: `Explore ${APP_NAME}'s hand-curated featured jewelry. Premium rings, necklaces, earrings and bracelets selected for exceptional craftsmanship.`,
    ogDescription: `Hand-curated luxury jewelry from ${APP_NAME}. Premium pieces selected for exceptional craftsmanship and elegance.`,
    heroTagline: "Editor's Choice",
    heroParagraph: "A carefully curated selection of our finest pieces — chosen for exceptional craftsmanship and timeless elegance.",
    emoji: "💎",
    dbFilter: { isFeatured: true },
    relatedSlugs: ["best-sellers", "new-arrivals", "necklaces"],
  },
  sale: {
    slug: "sale",
    title: `Sale — Luxury Jewelry on Discount | ${APP_NAME}`,
    heading: "Sale",
    description: `Shop ${APP_NAME}'s sale collection. Premium handcrafted jewelry at special prices. Limited stock — don't miss out on these exclusive deals.`,
    ogDescription: `${APP_NAME} sale — premium jewelry at special prices. Limited time offers on rings, necklaces, earrings & bracelets.`,
    heroTagline: "Limited Time Offers",
    heroParagraph: "Premium jewelry at exceptional value. Every piece is still crafted to our highest standard — just at a special price.",
    emoji: "🏷️",
    dbFilter: {},  // Sale is handled by compareAtPrice filter in page
    relatedSlugs: ["new-arrivals", "best-sellers", "rings"],
  },
  rings: {
    slug: "rings",
    title: `Rings Collection — Premium Gold & Diamond Rings | ${APP_NAME}`,
    heading: "Rings",
    description: `Shop premium rings at ${APP_NAME}. Gold rings, diamond rings, engagement rings & more. BIS Hallmarked. Free shipping above ₹999. Easy 15-day returns.`,
    ogDescription: `${APP_NAME}'s premium ring collection — rose-gold, diamond, and precious stone rings crafted for every occasion.`,
    heroTagline: "Circle of Elegance",
    heroParagraph: "From everyday stacking rings to statement solitaires — find the ring that speaks to you.",
    emoji: "💍",
    dbFilter: { category: "rings" },
    relatedSlugs: ["necklaces", "bracelets", "best-sellers"],
  },
  necklaces: {
    slug: "necklaces",
    title: `Necklaces — Luxury Gold & Diamond Necklaces | ${APP_NAME}`,
    heading: "Necklaces",
    description: `Discover elegant necklaces at ${APP_NAME}. Gold chains, diamond pendants, pearl necklaces & more. Handcrafted with love. Free shipping above ₹999.`,
    ogDescription: `${APP_NAME}'s necklace collection — from delicate rose-gold chains to statement diamond pieces.`,
    heroTagline: "Wear Your Story",
    heroParagraph: "From delicate chains to bold statement pieces — our necklaces are designed to be noticed.",
    emoji: "📿",
    dbFilter: { category: "necklaces" },
    relatedSlugs: ["earrings", "pendants", "rings"],
  },
  earrings: {
    slug: "earrings",
    title: `Earrings — Gold & Diamond Earrings | ${APP_NAME}`,
    heading: "Earrings",
    description: `Shop beautiful earrings at ${APP_NAME}. Gold jhumkas, diamond studs, hoops & drop earrings. Handcrafted. BIS Hallmarked. Free shipping above ₹999.`,
    ogDescription: `${APP_NAME}'s earring collection — rose-gold jhumkas, diamond studs, hoops and more for every occasion.`,
    heroTagline: "Frame Your Beauty",
    heroParagraph: "Earrings that whisper elegance or shout confidence — find your perfect pair.",
    emoji: "✨",
    dbFilter: { category: "earrings" },
    relatedSlugs: ["necklaces", "rings", "bracelets"],
  },
  bracelets: {
    slug: "bracelets",
    title: `Bracelets — Gold & Diamond Bracelets | ${APP_NAME}`,
    heading: "Bracelets",
    description: `Shop stunning bracelets at ${APP_NAME}. Gold bangles, diamond tennis bracelets, charm bracelets & more. Handcrafted luxury. Free shipping above ₹999.`,
    ogDescription: `${APP_NAME}'s bracelet collection — rose-gold bangles, diamond tennis bracelets and charm bracelets.`,
    heroTagline: "Wrap It Up",
    heroParagraph: "From delicate rose-gold chains to bold diamond bracelets — wear elegance on your wrist.",
    emoji: "⭐",
    dbFilter: { category: "bracelets" },
    relatedSlugs: ["rings", "earrings", "best-sellers"],
  },
  pendants: {
    slug: "pendants",
    title: `Pendants — Gold & Diamond Pendants | ${APP_NAME}`,
    heading: "Pendants",
    description: `Discover exquisite pendants at ${APP_NAME}. Gold pendants, diamond pendants, religious pendants & more. Handcrafted with precision. Free shipping above ₹999.`,
    ogDescription: `${APP_NAME}'s pendant collection — rose-gold and diamond pendants crafted with exceptional detail.`,
    heroTagline: "A Touch of Precious",
    heroParagraph: "Pendants that carry meaning. From religious motifs to modern minimalism — every piece tells a story.",
    emoji: "💎",
    dbFilter: { category: "pendants" },
    relatedSlugs: ["necklaces", "earrings", "rings"],
  },
  bangles: {
    slug: "bangles",
    title: `Bangles — Traditional & Modern Gold Bangles | ${APP_NAME}`,
    heading: "Bangles",
    description: `Shop beautiful bangles at ${APP_NAME}. Traditional rose-gold bangles, Kundan bangles & modern designs. BIS Hallmarked. Free shipping above ₹999.`,
    ogDescription: `${APP_NAME}'s bangle collection — from traditional rose-gold bangles to modern contemporary designs.`,
    heroTagline: "The Sound of Elegance",
    heroParagraph: "Bangles that celebrate tradition and modernity alike — find your perfect set.",
    emoji: "🌟",
    dbFilter: { category: "bangles" },
    relatedSlugs: ["bracelets", "rings", "earrings"],
  },
  anklets: {
    slug: "anklets",
    title: `Anklets — Silver & Gold Anklets | ${APP_NAME}`,
    heading: "Anklets",
    description: `Shop delicate anklets at ${APP_NAME}. Silver anklets, rose-gold anklets & diamond anklets. Handcrafted elegance for your feet. Free shipping above ₹999.`,
    ogDescription: `${APP_NAME}'s anklet collection — delicate silver and rose-gold anklets for everyday elegance.`,
    heroTagline: "Grace in Every Step",
    heroParagraph: "Delicate anklets that add a touch of grace — from minimalist silver to ornate rose-gold.",
    emoji: "🦶",
    dbFilter: { category: "anklets" },
    relatedSlugs: ["bracelets", "bangles", "rings"],
  },
  mangalsutra: {
    slug: "mangalsutra",
    title: `Mangalsutra — Traditional & Modern Designs | ${APP_NAME}`,
    heading: "Mangalsutra",
    description: `Discover beautiful mangalsutra at ${APP_NAME}. Traditional rose-gold mangalsutra, diamond mangalsutra & modern designs. BIS Hallmarked. Free shipping above ₹999.`,
    ogDescription: `${APP_NAME}'s mangalsutra collection — timeless traditional and contemporary modern designs.`,
    heroTagline: "A Bond of Love",
    heroParagraph: "Mangalsutra that honour tradition while embracing modern sensibility — beautifully crafted for life's most precious promises.",
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
