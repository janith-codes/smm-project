"use client";

import { useEffect, useState, useCallback } from "react";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

interface Provider {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  providerId: string | null;
  provider?: { id: string; name: string } | null;
  providerServiceId: string | null;
  providerRate: number | null;
  sellingRate: number | null;
  minOrder: number | null;
  maxOrder: number | null;
  serviceType: string | null;
  isActive: boolean;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  categoryId: "",
  sellingRate: "",
  minOrder: "",
  maxOrder: "",
  isActive: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20", search });
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    fetch("/api/admin/providers").then((r) => r.json()).then(setProviders).catch(() => {});
  }, []);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditTarget(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      categoryId: p.categoryId ?? "",
      sellingRate: p.sellingRate != null ? String(p.sellingRate) : "",
      minOrder: p.minOrder != null ? String(p.minOrder) : "",
      maxOrder: p.maxOrder != null ? String(p.maxOrder) : "",
      isActive: p.isActive,
    });
    setError("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const method = editTarget ? "PUT" : "POST";
    const url = editTarget ? `/api/admin/products/${editTarget.id}` : "/api/admin/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        categoryId: form.categoryId || null,
        sellingRate: form.sellingRate ? parseFloat(form.sellingRate) : null,
        minOrder: form.minOrder ? parseInt(form.minOrder) : null,
        maxOrder: form.maxOrder ? parseInt(form.maxOrder) : null,
        isActive: form.isActive,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      loadProducts();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, isActive: !p.isActive }),
    });
    loadProducts();
  }

  const totalPages = Math.ceil(total / 20);

  const catTree = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return "";
    const parent = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null;
    return parent ? `${parent.name} / ${cat.name}` : cat.name;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1 text-sm">{total} total services</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
      ) : products.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 text-center">
          <p className="text-white font-semibold">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Add manually or import from an SMM provider</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors">
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rate / 1K</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Min / Max</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-white text-sm font-medium leading-snug line-clamp-2">{p.name}</p>
                      {p.providerServiceId && (
                        <p className="text-gray-500 text-xs mt-0.5">ID: {p.providerServiceId}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.categoryId ? (
                        <span className="text-gray-300 text-xs">{catTree(p.categoryId)}</span>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.provider ? (
                        <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded-md">{p.provider.name}</span>
                      ) : (
                        <span className="text-gray-600 text-xs">Manual</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.sellingRate != null ? (
                        <span className="text-white text-sm font-mono">${p.sellingRate}</span>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.minOrder != null ? (
                        <span className="text-gray-300 text-xs">{p.minOrder.toLocaleString()} / {p.maxOrder?.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleActive(p)} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${p.isActive ? "bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-400" : "bg-gray-500"}`} />
                        {p.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-gray-400 text-sm">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <h2 className="text-white font-semibold text-lg">
                {editTarget ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Service Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Instagram Followers – HQ"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No category</option>
                  {categories.filter((c) => !c.parentId).map((parent) => (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>{parent.name}</option>
                      {categories.filter((c) => c.parentId === parent.id).map((child) => (
                        <option key={child.id} value={child.id}>  {child.name}</option>
                      ))}
                    </optgroup>
                  ))}
                  {categories.filter((c) => !c.parentId && !categories.some((p) => p.id !== c.id)).length === 0 &&
                    categories.filter((c) => c.parentId && !categories.find((p) => p.id === c.parentId)).map((orphan) => (
                      <option key={orphan.id} value={orphan.id}>{orphan.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Selling Rate/1K ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.sellingRate}
                    onChange={(e) => setForm({ ...form, sellingRate: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Min Order</label>
                  <input
                    type="number"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                    placeholder="100"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Max Order</label>
                  <input
                    type="number"
                    value={form.maxOrder}
                    onChange={(e) => setForm({ ...form, maxOrder: e.target.value })}
                    placeholder="10000"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="productActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 accent-blue-600"
                />
                <label htmlFor="productActive" className="text-sm text-gray-300">Active</label>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors">
                  {saving ? "Saving..." : editTarget ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
