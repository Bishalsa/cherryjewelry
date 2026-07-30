/**
 * Canonical folder map for the entire upload pipeline.
 * Single source of truth — imported by client and server.
 * Adding a category here is all you need to do.
 */

export type FolderKey =
  | "products"
  | "rings"
  | "necklaces"
  | "earrings"
  | "bracelets"
  | "pendants"
  | "bangles"
  | "anklets"
  | "mangalsutra"
  | "collections"
  | "banners"
  | "homepage"
  | "seo"
  | "logos"
  | "blog";

/** Resolve a FolderKey or full path string to a Cloudinary folder path. */
export function resolveCloudinaryFolder(folder: string): string {
  const MAP: Record<string, string> = {
    products:      "cherry-jewelry/products",
    rings:         "cherry-jewelry/products/rings",
    necklaces:     "cherry-jewelry/products/necklaces",
    earrings:      "cherry-jewelry/products/earrings",
    bracelets:     "cherry-jewelry/products/bracelets",
    pendants:      "cherry-jewelry/products/pendants",
    bangles:       "cherry-jewelry/products/bangles",
    anklets:       "cherry-jewelry/products/anklets",
    mangalsutra:   "cherry-jewelry/products/mangalsutra",
    collections:   "cherry-jewelry/collections",
    banners:       "cherry-jewelry/banners",
    homepage:      "cherry-jewelry/homepage",
    seo:           "cherry-jewelry/seo",
    logos:         "cherry-jewelry/logos",
    blog:          "cherry-jewelry/blog",
  };

  // If it's already a full path, use it directly.
  if (folder.includes("/")) return folder;

  return MAP[folder] ?? `cherry-jewelry/${folder}`;
}
