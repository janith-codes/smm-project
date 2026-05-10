"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  children?: { id: string; name: string }[];
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", parentId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); }, []);

  function openAdd(parentId?: string) {
    setEditTarget(null);
    setForm({ name: "", parentId: parentId ?? "" });
    setError("");
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setEditTarget(c);
    setForm({ name: c.name, parentId: c.parentId ?? "" });
    setError("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const method = editTarget ? "PUT" : "POST";
    const url = editTarget ? `/api/admin/categories/${editTarget.id}` : "/api/admin/categories";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        parentId: form.parentId || null,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      loadCategories();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    loadCategories();
  }

  const topLevel = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId);
  const parentOptions = categories.filter((c) => !c.parentId && c.id !== editTarget?.id);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 mt-1 text-sm">Organize services with categories and subcategories</p>
        </div>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 text-center">
          <p className="text-white font-semibold">No categories yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first category to organize products</p>
          <button onClick={() => openAdd()} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors">
            Add Category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map((cat) => {
            const children = getChildren(cat.id);
            return (
              <div key={cat.id} className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{cat.name}</p>
                      <p className="text-gray-500 text-xs">/{cat.slug} · {cat._count?.products ?? 0} products · {children.length} subcategories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAdd(cat.id)}
                      className="text-gray-400 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700 text-xs font-medium flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Sub
                    </button>
                    <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {children.length > 0 && (
                  <div className="border-t border-gray-800">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between px-6 py-3 pl-14 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-gray-700 flex items-center justify-center">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-200 text-sm">{child.name}</p>
                            <p className="text-gray-500 text-xs">{(child as Category & { _count?: { products: number } })._count?.products ?? 0} products</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(child)} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(child.id)} className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-white font-semibold text-lg">
                {editTarget ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. YouTube Views"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None (top-level category)</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
                >
                  {saving ? "Saving..." : editTarget ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
