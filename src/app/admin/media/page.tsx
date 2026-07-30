"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Folder,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";
import { cn } from "@/lib/utils";
import type { FolderKey } from "@/lib/cloudinary-folders";

interface FolderDef {
  id:    FolderKey;
  label: string;
}

const FOLDERS: FolderDef[] = [
  { id: "products",     label: "All Products"       },
  { id: "rings",        label: "Rings 💍"            },
  { id: "necklaces",    label: "Necklaces 📿"        },
  { id: "earrings",     label: "Earrings ✨"          },
  { id: "bracelets",    label: "Bracelets ⭐"         },
  { id: "pendants",     label: "Pendants 💎"          },
  { id: "bangles",      label: "Bangles 🌟"           },
  { id: "anklets",      label: "Anklets 🦶"           },
  { id: "mangalsutra",  label: "Mangalsutra 🪷"       },
  { id: "collections",  label: "Collections"         },
  { id: "banners",      label: "Banners"             },
  { id: "homepage",     label: "Homepage Assets"     },
  { id: "seo",          label: "SEO & OG Images"     },
  { id: "logos",        label: "Logos & Favicons"    },
  { id: "blog",         label: "Blog"                },
];

export default function AdminMediaPage() {
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>("products");
  const [resources,      setResources]      = useState<any[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [query,          setQuery]          = useState("");
  const [copiedId,       setCopiedId]       = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      // Pass the FolderKey directly — the API resolves to the correct path
      const res  = await fetch(`/api/admin/media?folder=${encodeURIComponent(selectedFolder)}`);
      const data = await res.json();
      if (data.success) {
        setResources(data.resources || []);
      } else {
        toast.error(data.error || "Failed to load media assets");
      }
    } catch {
      toast.error("Network error fetching Cloudinary resources");
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  // Reload when folder tab changes
  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("CDN URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteMedia = async (publicId: string) => {
    if (!confirm("Delete this asset from Cloudinary permanently?")) return;
    try {
      const res  = await fetch(`/api/admin/media?publicId=${encodeURIComponent(publicId)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Asset deleted");
        fetchMedia();
      } else {
        toast.error(data.error || "Deletion failed");
      }
    } catch {
      toast.error("Error deleting Cloudinary asset");
    }
  };

  const filtered = resources.filter((r) =>
    r.public_id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
            Cloudinary Media Library
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Upload, organise and manage brand media assets across Cloudinary CDN folders.
          </p>
        </div>
        <button
          onClick={fetchMedia}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-deep-plum transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Uploader */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3">
        <h3 className="font-heading text-sm text-deep-plum font-semibold">
          Upload New Assets
        </h3>
        <CloudinaryImageUploader
          images={[]}
          onChange={() => fetchMedia()}   // Refresh media grid after upload
          folder={selectedFolder}          // FolderKey — resolved inside the component
          maxFiles={20}
        />
      </div>

      {/* Folder tabs + search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-neutral-100 pb-3">
          {FOLDERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                selectedFolder === f.id
                  ? "bg-deep-plum text-white"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <Folder className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assets by file ID…"
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold text-deep-plum font-medium placeholder:text-neutral-400"
            />
          </div>
          <div className="text-xs text-neutral-400 shrink-0">
            {filtered.length} asset{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Media grid */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm min-h-[300px]">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-gold" />
            Loading Cloudinary resources…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-deep-plum mb-1">
              No media assets in this folder
            </p>
            <p className="text-xs text-neutral-400">
              Upload images above to add them to Cloudinary.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((item) => (
              <div
                key={item.public_id}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-sm"
              >
                <img
                  src={item.secure_url}
                  alt={item.public_id}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end gap-1">
                    <a
                      href={item.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-white text-deep-plum rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleCopyUrl(item.secure_url, item.public_id)}
                      className="p-1.5 bg-white text-deep-plum rounded-lg hover:bg-rose-gold hover:text-white transition-colors"
                      title="Copy CDN URL"
                    >
                      {copiedId === item.public_id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(item.public_id)}
                      className="p-1.5 bg-white text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors"
                      title="Delete from Cloudinary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[10px] text-white/90 truncate bg-black/60 px-2 py-1 rounded-md">
                    {item.format?.toUpperCase()} · {(item.bytes / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
