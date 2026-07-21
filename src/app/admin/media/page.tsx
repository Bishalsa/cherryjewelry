"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Folder,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Plus,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";
import { cn } from "@/lib/utils";

const FOLDERS = [
  { id: "products", label: "Products", path: "cherry-jewelry/products" },
  { id: "collections", label: "Collections", path: "cherry-jewelry/collections" },
  { id: "banners", label: "Banners", path: "cherry-jewelry/banners" },
  { id: "homepage", label: "Homepage Assets", path: "cherry-jewelry/homepage" },
  { id: "seo", label: "SEO & OG Images", path: "cherry-jewelry/seo" },
  { id: "logos", label: "Logos & Favicons", path: "cherry-jewelry/logos" },
];

export default function AdminMediaPage() {
  const [selectedFolder, setSelectedFolder] = useState<string>("products");
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentFolderConfig = FOLDERS.find((f) => f.id === selectedFolder) || FOLDERS[0];

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/media?folder=${encodeURIComponent(currentFolderConfig.path)}`);
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
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder]);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("CDN URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteMedia = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this asset from Cloudinary?")) return;

    try {
      const res = await fetch(`/api/admin/media?publicId=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Asset deleted from Cloudinary");
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
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
          Cloudinary Media Library
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage, upload, and organize your brand media assets across Cloudinary CDN folders.
        </p>
      </div>

      {/* Cloudinary Drag & Drop Uploader */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3">
        <h3 className="font-heading text-sm text-deep-plum font-semibold">
          Upload New Assets to /{currentFolderConfig.path}
        </h3>
        <CloudinaryImageUploader
          images={[]}
          onChange={() => fetchMedia()}
          folder={selectedFolder as any}
          maxFiles={10}
        />
      </div>

      {/* Folder Navigation & Search */}
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
              placeholder="Search assets by file ID..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
            />
          </div>
          <div className="text-xs text-neutral-400">
            Assets count: {filtered.length}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm min-h-[300px]">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-gold" /> Loading Cloudinary resources...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-deep-plum mb-1">No media assets in this folder</p>
            <p className="text-xs text-neutral-400">Upload images above to add them to Cloudinary.</p>
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
