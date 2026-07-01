"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { sampleProducts } from "@/lib/sample-data";

export default function AdminProductsPage() {
  const [query, setQuery] = useState("");

  const filteredProducts = sampleProducts.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.sku.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-obsidian">Products</h1>
          <p className="text-neutral-500 mt-1">Manage your jewelry catalog.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-obsidian text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors">
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
              placeholder="Search products by name or SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors shrink-0">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Product</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">SKU</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Price</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Stock</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((product) => {
                const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                return (
                  <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="opacity-20">💎</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-obsidian">{product.name}</p>
                          <p className="text-xs text-neutral-400">{product.material}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{product.sku}</td>
                    <td className="px-6 py-4 text-sm font-medium text-obsidian">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${totalStock > 0 ? 'text-neutral-600' : 'text-destructive font-medium'}`}>
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
                        <button className="p-1.5 text-neutral-400 hover:text-gold transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-neutral-400 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-neutral-400 hover:text-obsidian transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm text-neutral-500">No products found matching your search.</p>
            </div>
          )}
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-sm text-neutral-500">
          <span>Showing 1 to {filteredProducts.length} of {filteredProducts.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-neutral-200 rounded-md disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-neutral-200 rounded-md disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
