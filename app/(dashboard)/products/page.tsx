"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Tag,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [cat, setCat] = useState("T-Shirts");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("20");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  async function loadProducts() {
    try {
      setLoading(true);
      const url = new URL("/api/products", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (category) url.searchParams.set("category", category);
      if (lowStockOnly) url.searchParams.set("lowStock", "true");

      const res = await fetch(url.toString());
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, lowStockOnly]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        sku,
        category: cat,
        description,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        stockQuantity: Number(stockQuantity),
        lowStockThreshold: Number(lowStockThreshold),
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsAddModalOpen(false);
        setEditingProduct(null);
        resetForm();
        loadProducts();
      }
    } catch (err) {
      console.error("Save product error:", err);
    }
  };

  const resetForm = () => {
    setName("");
    setSku("");
    setCat("T-Shirts");
    setDescription("");
    setPrice("");
    setSalePrice("");
    setStockQuantity("20");
    setLowStockThreshold("5");
  };

  const handleStockAdjust = async (productId: string, delta: number, currentStock: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stockQuantity: newStock } : p))
      );

      await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newStock }),
      });
    } catch (err) {
      console.error("Failed to adjust stock:", err);
      loadProducts();
    }
  };

  const openEdit = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku || "");
    setCat(p.category || "General");
    setDescription(p.description || "");
    setPrice(p.price?.toString() || "");
    setSalePrice(p.salePrice ? p.salePrice.toString() : "");
    setStockQuantity(p.stockQuantity?.toString() || "0");
    setLowStockThreshold(p.lowStockThreshold?.toString() || "5");
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-sky-600" />
            Product Catalog & Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real inventory used by AI Digital Manager to answer customer questions
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            lowStockOnly
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock Only</span>
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
          <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No products found</h3>
          <p className="text-xs text-slate-500 mt-1">Add items so the AI can quote prices and availability.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const isLow = p.stockQuantity <= p.lowStockThreshold;

            return (
              <div
                key={p._id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {p.sku || "NO-SKU"}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{p.name}</h3>
                      <span className="text-xs text-sky-600 font-semibold">{p.category}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isLow
                          ? "bg-rose-100 text-rose-700 border border-rose-200 animate-pulse"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p.stockQuantity} in stock
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {p.description || "No description provided."}
                  </p>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-900">
                      {formatPKR(p.salePrice || p.price)}
                    </span>
                    {p.salePrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatPKR(p.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Adjuster & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-1">Quick Stock:</span>
                    <button
                      onClick={() => handleStockAdjust(p._id, -1, p.stockQuantity)}
                      disabled={p.stockQuantity <= 0}
                      className="w-7 h-7 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-xs disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-xs px-1 text-slate-800">
                      {p.stockQuantity}
                    </span>
                    <button
                      onClick={() => handleStockAdjust(p._id, 1, p.stockQuantity)}
                      className="w-7 h-7 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Black Classic Cotton T-Shirt"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="DFT-001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    placeholder="T-Shirts / Traditional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1850"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Price (PKR)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="1650 (optional)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low Stock Alert At</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fabric, sizing details, colors..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  {editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
