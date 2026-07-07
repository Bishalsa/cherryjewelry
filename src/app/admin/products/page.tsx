"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Edit, Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

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
  price: number;
  compareAtPrice: number | null;
  material: string;
  weight: string | null;
  purity: string | null;
  description: string;
  shortDescription: string;
  categoryId: string;
  category?: CategoryItem;
  variants: VariantItem[];
  images?: { url: string }[];
  isActive: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    material: "Gold (18K)",
    price: "",
    compareAtPrice: "",
    stock: "10",
    description: "",
    imageUrl: "",
    weight: "",
    purity: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.error || "Failed to load products");
      }
    } catch {
      toast.error("Network error fetching products");
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
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: `CHR-${Date.now().toString().slice(-6)}`,
      categoryId: categories[0]?.id || "",
      material: "Gold (18K)",
      price: "",
      compareAtPrice: "",
      stock: "15",
      description: "",
      imageUrl: "",
      weight: "3.5g",
      purity: "750",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    // Find standard variant stock
    const stdVariant = product.variants.find((v) => v.name === "Standard");
    const stockQty = stdVariant?.inventory?.[0]?.quantity || 0;

    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      material: product.material,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || "",
      stock: stockQty.toString(),
      description: product.description || "",
      imageUrl: product.images?.[0]?.url || "",
      weight: product.weight || "",
      purity: product.purity || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Product deleted successfully.");
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch {
      toast.error("Failed to delete product due to network error");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const isEdit = !!editingProduct;
      const url = "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit
        ? { ...formData, id: editingProduct.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          isEdit ? "Product updated successfully." : "Product added successfully."
        );
        setIsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to save product");
      }
    } catch {
      toast.error("Network error saving product");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.material.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
        <p className="text-neutral-400 text-sm font-medium">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-obsidian">Products</h1>
          <p className="text-neutral-500 mt-1">Manage your jewelry catalog.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-obsidian text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or material..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Product</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">SKU</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Category</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Price</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Stock</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400 text-sm">
                    No products found. Add a product to get started.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  // Calculate total stock from all variants
                  const totalStock = product.variants.reduce((acc, v) => {
                    const stockQty = v.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
                    return acc + stockQty;
                  }, 0);

                  const displayImage = product.images?.[0]?.url || "";

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200/50">
                            {displayImage ? (
                              <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg opacity-40">💍</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-obsidian">{product.name}</p>
                            <p className="text-xs text-neutral-400">{product.material}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{product.category?.name || "Uncategorized"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-obsidian">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${totalStock > 5 ? 'text-neutral-600' : totalStock > 0 ? 'text-warning-dark font-medium' : 'text-destructive font-medium'}`}>
                          {totalStock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          product.isActive ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {product.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-neutral-400 hover:text-gold-dark transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-neutral-400 hover:text-destructive transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-luxury relative z-10 border border-neutral-100 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="font-heading text-xl text-obsidian">
                  {editingProduct ? "Edit Product Details" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Product Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Celestial Diamond Ring"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* SKU */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">SKU (Unique)</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. LUM-RNG-001"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:border-gold"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Material */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Material</label>
                    <input
                      type="text"
                      required
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g. Gold (18K), Platinum"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Price (INR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="45999"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Compare At Price */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Compare At Price (Sale/Original)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      placeholder="52999"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Initial Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="15"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Product Image URL</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Weight (e.g. 4.2g)</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="4.2g"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Purity */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Purity (e.g. 750, 916)</label>
                    <input
                      type="text"
                      value={formData.purity}
                      onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                      placeholder="750"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the product materials, design history, and attributes in detail..."
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-obsidian text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingProduct ? "Save Changes" : "Create Product"}
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
