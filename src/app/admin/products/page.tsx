"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Loader2,
  X,
  Copy,
  RotateCcw,
  Eye,
  Star,
  Sparkles,
  ExternalLink,
  Package,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";

interface InventoryItem {
  quantity: number;
}

interface VariantItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock?: number;
  inventory?: InventoryItem[];
}

interface CategoryItem {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice?: number | null;
  material: string;
  weight: string | null;
  purity: string | null;
  stoneType?: string | null;
  stoneWeight?: string | null;
  dimensions?: string | null;
  careInstructions?: string | null;
  shippingDetails?: string | null;
  warranty?: string | null;
  lowStockWarning?: number | null;
  status?: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  category?: CategoryItem;
  variants: VariantItem[];
  images?: { url: string }[];
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  keywords?: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  deletedAt?: string | null;
}

type TabType = "all" | "published" | "draft" | "archived";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formTab, setFormTab] = useState<"general" | "pricing" | "specs text" | "media" | "seo">("general");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    barcode: "",
    categoryId: "",
    material: "Gold (18K)",
    purity: "750",
    weight: "",
    stoneType: "Diamond (VVS-EF)",
    stoneWeight: "0.50 ct",
    dimensions: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    stock: "10",
    lowStockWarning: "5",
    description: "",
    shortDescription: "",
    careInstructions: "Avoid direct contact with harsh chemicals or perfume. Store in a soft pouch.",
    shippingDetails: "Insured express delivery within 3-5 business days.",
    warranty: "Lifetime exchange warranty on BIS hallmarked gold.",
    images: [] as string[],
    status: "PUBLISHED",
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    tags: "rings, diamond, gold",
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    canonicalUrl: "",
    keywords: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.error || "Failed to load products");
      }
    } catch {
      toast.error("Network error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch {
      console.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      sku: "",
      barcode: "",
      categoryId: categories[0]?.id || "",
      material: "Gold (18K)",
      purity: "750",
      weight: "4.5g",
      stoneType: "Diamond (VVS1)",
      stoneWeight: "0.45 ct",
      dimensions: "18mm x 15mm",
      price: "",
      compareAtPrice: "",
      costPrice: "",
      stock: "10",
      lowStockWarning: "5",
      description: "",
      shortDescription: "",
      careInstructions: "Clean gently with warm soapy water. Avoid wearing during strenuous activities.",
      shippingDetails: "Free insured shipping across India. Ships within 48 hours.",
      warranty: "Lifetime certificate of authenticity & BIS Hallmark warranty.",
      images: [],
      status: "PUBLISHED",
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      tags: "fine jewelry, gold, diamond",
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      canonicalUrl: "",
      keywords: "",
    });
    setFormTab("general");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode || "",
      categoryId: product.categoryId,
      material: product.material,
      purity: product.purity || "",
      weight: product.weight || "",
      stoneType: product.stoneType || "",
      stoneWeight: product.stoneWeight || "",
      dimensions: product.dimensions || "",
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      costPrice: product.costPrice ? String(product.costPrice) : "",
      stock: String(
        product.variants?.[0]?.inventory?.[0]?.quantity ??
          product.variants?.[0]?.stock ??
          10
      ),
      lowStockWarning: String(product.lowStockWarning || 5),
      description: product.description,
      shortDescription: product.shortDescription || "",
      careInstructions: product.careInstructions || "",
      shippingDetails: product.shippingDetails || "",
      warranty: product.warranty || "",
      images: product.images ? product.images.map((i) => i.url) : [],
      status: product.status || (product.isActive ? "PUBLISHED" : "DRAFT"),
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      tags: product.tags ? product.tags.join(", ") : "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      ogImage: product.ogImage || "",
      canonicalUrl: product.canonicalUrl || "",
      keywords: product.keywords ? product.keywords.join(", ") : "",
    });
    setFormTab("general");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.sku || !formData.categoryId) {
      toast.error("Please fill in all required fields (Name, SKU, Price, Category)");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...(editingProduct && { id: editingProduct.id }),
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        barcode: formData.barcode,
        categoryId: formData.categoryId,
        material: formData.material,
        purity: formData.purity,
        weight: formData.weight,
        stoneType: formData.stoneType,
        stoneWeight: formData.stoneWeight,
        dimensions: formData.dimensions,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
        costPrice: formData.costPrice ? Number(formData.costPrice) : null,
        stock: Number(formData.stock),
        lowStockWarning: Number(formData.lowStockWarning),
        description: formData.description,
        shortDescription: formData.shortDescription,
        careInstructions: formData.careInstructions,
        shippingDetails: formData.shippingDetails,
        warranty: formData.warranty,
        imageUrl: formData.images[0] || "",
        images: formData.images,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        ogImage: formData.ogImage,
        canonicalUrl: formData.canonicalUrl,
        keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      };

      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingProduct ? "Product updated" : "Product created & live!");
        setIsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.error || "Saving failed");
      }
    } catch {
      toast.error("Error submitting product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product duplicated as Draft");
        fetchProducts();
      } else {
        toast.error(data.error || "Duplication failed");
      }
    } catch {
      toast.error("Error duplicating product");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product moved to Archive");
        fetchProducts();
      }
    } catch {
      toast.error("Error archiving product");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product restored to Published");
        fetchProducts();
      }
    } catch {
      toast.error("Error restoring product");
    }
  };

  // Filter products by search and tab
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.material.toLowerCase().includes(query.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "published") return p.status === "PUBLISHED" || (p.isActive && !p.deletedAt);
    if (activeTab === "draft") return p.status === "DRAFT";
    if (activeTab === "archived") return p.status === "ARCHIVED" || Boolean(p.deletedAt);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
            Product Catalog
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your fine jewelry pieces, stock quantities, Cloudinary images, and SEO handles.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-deep-plum text-white px-5 py-2.5 rounded-xl text-xs font-medium hover:bg-deep-plum-dark transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(["all", "published", "draft", "archived"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                  activeTab === tab
                    ? "bg-rose-gold/10 text-rose-gold-dark font-semibold"
                    : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-xs text-neutral-400">
            Showing {filteredProducts.length} items
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU, name, or material..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-gold" /> Loading product catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-deep-plum mb-1">No products found</p>
            <p className="text-xs text-neutral-400 mb-4">Try adjusting search filters or create a new product.</p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-rose-gold text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-rose-gold-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">SKU / Material</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Inventory</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredProducts.map((product) => {
                  const image = product.images?.[0]?.url || "/placeholder.jpg";
                  const stock =
                    product.variants?.[0]?.inventory?.[0]?.quantity ??
                    product.variants?.[0]?.stock ??
                    0;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {image && image !== "/placeholder.jpg" ? (
                              <img src={image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-deep-plum">{product.name}</p>
                            <p className="text-[11px] text-neutral-400">
                              {product.category?.name || "Uncategorized"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-mono text-[11px] font-medium text-deep-plum">{product.sku}</p>
                        <p className="text-[11px] text-neutral-400">{product.material}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-deep-plum">
                        {formatPrice(product.price)}
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="block text-[10px] text-neutral-400 line-through font-normal">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "font-semibold",
                              stock <= (product.lowStockWarning || 5)
                                ? "text-amber-600"
                                : "text-emerald-600"
                            )}
                          >
                            {stock} in stock
                          </span>
                          {stock <= (product.lowStockWarning || 5) && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            product.deletedAt || product.status === "ARCHIVED"
                              ? "bg-neutral-100 text-neutral-400"
                              : product.status === "DRAFT"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                          )}
                        >
                          {product.deletedAt ? "Archived" : product.status || "Published"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-deep-plum rounded-lg transition-colors inline-block"
                          title="Preview Product Live"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-deep-plum rounded-lg transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-deep-plum rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {product.deletedAt ? (
                          <button
                            onClick={() => handleRestore(product.id)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                            title="Restore Product"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(product.id)}
                            className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Archive Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create & Edit Product */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
              className="bg-white rounded-3xl shadow-luxury border border-neutral-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 p-6 md:p-8 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="font-heading text-xl text-deep-plum">
                    {editingProduct ? "Edit Jewelry Piece" : "Add New Fine Jewelry Piece"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Fill in specs, pricing, and upload Cloudinary media.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Section Tabs */}
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2 overflow-x-auto">
                {[
                  { id: "general", label: "1. Basic & Stock" },
                  { id: "pricing", label: "2. Pricing & Specs" },
                  { id: "specs text", label: "3. Descriptions & Care" },
                  { id: "media", label: "4. Cloudinary Media" },
                  { id: "seo", label: "5. SEO & Meta" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormTab(t.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap",
                      formTab === t.id
                        ? "bg-deep-plum text-white"
                        : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {formTab === "general" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Product Name *
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
                          placeholder="e.g. Celestial Diamond Solitaire Ring"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          SKU (Unique Identifier) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="LUM-RNG-001"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Category / Collection *
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:border-rose-gold"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Status Workflow
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:border-rose-gold font-semibold"
                        >
                          <option value="PUBLISHED">Published (Live)</option>
                          <option value="DRAFT">Draft (Internal)</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Initial Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Low Stock Alert Threshold
                        </label>
                        <input
                          type="number"
                          value={formData.lowStockWarning}
                          onChange={(e) => setFormData({ ...formData, lowStockWarning: e.target.value })}
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 text-xs text-deep-plum font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isNewArrival}
                          onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                          className="rounded text-rose-gold focus:ring-rose-gold"
                        />
                        New Arrival
                      </label>
                      <label className="flex items-center gap-2 text-xs text-deep-plum font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="rounded text-rose-gold focus:ring-rose-gold"
                        />
                        Featured Piece
                      </label>
                      <label className="flex items-center gap-2 text-xs text-deep-plum font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isBestSeller}
                          onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                          className="rounded text-rose-gold focus:ring-rose-gold"
                        />
                        Best Seller
                      </label>
                    </div>
                  </div>
                )}

                {formTab === "pricing" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Selling Price (INR) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="49999"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Compare At Price (MRP)
                        </label>
                        <input
                          type="number"
                          value={formData.compareAtPrice}
                          onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                          placeholder="59999"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Cost Price (Internal Margin)
                        </label>
                        <input
                          type="number"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                          placeholder="28000"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Metal / Material *
                        </label>
                        <input
                          type="text"
                          value={formData.material}
                          onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                          placeholder="18K Rose Gold"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Purity / Hallmark
                        </label>
                        <input
                          type="text"
                          value={formData.purity}
                          onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                          placeholder="BIS Hallmarked (750)"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Gross Weight (grams)
                        </label>
                        <input
                          type="text"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="4.85 g"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Stone Type / Diamond Cut
                        </label>
                        <input
                          type="text"
                          value={formData.stoneType}
                          onChange={(e) => setFormData({ ...formData, stoneType: e.target.value })}
                          placeholder="Natural Diamond (VVS1)"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Stone Weight (Carats)
                        </label>
                        <input
                          type="text"
                          value={formData.stoneWeight}
                          onChange={(e) => setFormData({ ...formData, stoneWeight: e.target.value })}
                          placeholder="0.50 ct"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Barcode (UPC / EAN)
                        </label>
                        <input
                          type="text"
                          value={formData.barcode}
                          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                          placeholder="8901234567890"
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formTab === "specs text" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        Short Description (Card Subtitle)
                      </label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        placeholder="Handcrafted 18K rose gold ring adorned with brilliant-cut solitaire diamond."
                        className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        Full Product Description *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the craftsmanship, design history, and story behind this piece..."
                        className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Care Instructions
                        </label>
                        <textarea
                          rows={2}
                          value={formData.careInstructions}
                          onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                          Warranty & Certification
                        </label>
                        <textarea
                          rows={2}
                          value={formData.warranty}
                          onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                          className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formTab === "media" && (
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">
                      Product Images (Cloudinary CDN Uploader)
                    </label>
                    <CloudinaryImageUploader
                      images={formData.images}
                      onChange={(urls) => setFormData({ ...formData, images: urls })}
                      folder="products"
                      maxFiles={8}
                    />
                  </div>
                )}

                {formTab === "seo" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="Celestial Diamond Ring | Luxury Jewelry by Cherry"
                        className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={2}
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        placeholder="Discover the exquisite Celestial Diamond Ring crafted in 18K gold. BIS hallmarked with free insured shipping."
                        className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        Search Keywords (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="diamond ring, rose gold, solitaire, engagement ring"
                        className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                      />
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                  <div className="text-[11px] text-neutral-400">
                    Step {formTab === "general" ? "1" : formTab === "pricing" ? "2" : formTab === "specs text" ? "3" : formTab === "media" ? "4" : "5"} of 5
                  </div>

                  <div className="flex gap-3">
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
                      {editingProduct ? "Update Product" : "Publish Product"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
