"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Eye,
  Check,
  Star,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";
import { cn } from "@/lib/utils";

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  banner: string | null;
  parentId: string | null;
  position: number;
  isActive: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  _count?: { products: number };
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: [] as string[],
    banner: [] as string[],
    parentId: "",
    position: "0",
    isActive: true,
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
  });

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) {
        setCollections(data.categories);
      } else {
        toast.error(data.error || "Failed to load collections");
      }
    } catch {
      toast.error("Network error loading collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: [],
      banner: [],
      parentId: "",
      position: String(collections.length + 1),
      isActive: true,
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CollectionItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      image: item.image ? [item.image] : [],
      banner: item.banner ? [item.banner] : [],
      parentId: item.parentId || "",
      position: String(item.position),
      isActive: item.isActive,
      isFeatured: item.isFeatured,
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...(editingItem && { id: editingItem.id }),
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: formData.image[0] || null,
        banner: formData.banner[0] || null,
        parentId: formData.parentId || null,
        position: Number(formData.position),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      };

      const method = editingItem ? "PUT" : "POST";
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          editingItem
            ? "Collection updated successfully"
            : "Collection created successfully"
        );
        setIsModalOpen(false);
        fetchCollections();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch {
      toast.error("Error saving collection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete collection "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Collection deleted");
        fetchCollections();
      } else {
        toast.error(data.error || "Deletion failed");
      }
    } catch {
      toast.error("Error deleting collection");
    }
  };

  const filtered = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.slug.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
            Collections & Categories
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Organize your luxury jewelry pieces into structured, SEO-friendly storefront collections.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-deep-plum text-white px-5 py-2.5 rounded-xl text-xs font-medium hover:bg-deep-plum-dark transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Collection
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collections by name or slug..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
          />
        </div>
        <div className="text-xs text-neutral-400 font-medium">
          Total: {filtered.length} Collections
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-gold" /> Loading collections...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-deep-plum mb-1">No collections found</p>
            <p className="text-xs text-neutral-400 mb-4">Create your first collection to group products.</p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-rose-gold text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-rose-gold-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create Collection
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  <th className="py-3.5 px-4">Collection</th>
                  <th className="py-3.5 px-4">Slug & Route</th>
                  <th className="py-3.5 px-4">Products</th>
                  <th className="py-3.5 px-4">Display Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <FolderTree className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-deep-plum flex items-center gap-1.5">
                            {item.name}
                            {item.isFeatured && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            )}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-neutral-400 truncate max-w-xs">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/collections/${item.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-gold-dark hover:underline"
                      >
                        /collections/{item.slug}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-neutral-600">
                      {item._count?.products || 0} items
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500">
                      Position #{item.position}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          item.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-neutral-100 text-neutral-400"
                        )}
                      >
                        {item.isActive ? "Visible" : "Hidden"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-deep-plum rounded-lg transition-colors"
                        title="Edit Collection"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Collection */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl shadow-luxury border border-neutral-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-6 md:p-8 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h3 className="font-heading text-xl text-deep-plum">
                  {editingItem ? "Edit Collection" : "Create New Collection"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                      Collection Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, ""),
                        })
                      }
                      placeholder="e.g. Diamond Necklaces"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                      Slug (URL Handle)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="diamond-necklaces"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                </div>

                {/* Cloudinary Thumbnail & Banner Upload */}
                <div className="space-y-4 pt-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">
                    Thumbnail Image (Cloudinary)
                  </label>
                  <CloudinaryImageUploader
                    images={formData.image}
                    onChange={(urls) => setFormData({ ...formData, image: urls })}
                    folder="collections"
                    maxFiles={1}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">
                    Collection Banner Image (Cloudinary)
                  </label>
                  <CloudinaryImageUploader
                    images={formData.banner}
                    onChange={(urls) => setFormData({ ...formData, banner: urls })}
                    folder="banners"
                    maxFiles={1}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief story or tagline for this jewelry collection..."
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                  />
                </div>

                {/* Positions & Flags */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                      Display Position Order
                    </label>
                    <input
                      type="number"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-rose-gold focus:ring-rose-gold"
                    />
                    <label htmlFor="isActive" className="text-xs text-deep-plum font-medium cursor-pointer">
                      Visible on Storefront
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded text-rose-gold focus:ring-rose-gold"
                    />
                    <label htmlFor="isFeatured" className="text-xs text-deep-plum font-medium cursor-pointer">
                      Featured Collection
                    </label>
                  </div>
                </div>

                {/* SEO Title & Description */}
                <div className="border-t border-neutral-100 pt-4 space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-deep-plum">
                    SEO Metadata Settings
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="SEO Meta Title (e.g. Fine Diamond Rings Collection | Cherry Jewelry)"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                    />
                    <textarea
                      rows={2}
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="SEO Meta Description for search engines..."
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl text-xs font-medium hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-deep-plum text-white px-6 py-2.5 rounded-xl text-xs font-medium hover:bg-deep-plum-dark transition-colors disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingItem ? "Save Changes" : "Create Collection"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
