"use client";

import { useEffect, useState } from "react";

interface Provider {
  id: string;
  name: string;
  url: string;
  apiEndpoint: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  _count?: { products: number };
}

const EMPTY_FORM = {
  name: "",
  url: "",
  apiEndpoint: "",
  apiKey: "",
  isActive: true,
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Provider | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProviders() {
    setLoading(true);
    const res = await fetch("/api/admin/providers");
    const data = await res.json();
    setProviders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadProviders(); }, []);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Provider) {
    setEditTarget(p);
    setForm({ name: p.name, url: p.url, apiEndpoint: p.apiEndpoint, apiKey: p.apiKey, isActive: p.isActive });
    setError("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const method = editTarget ? "PUT" : "POST";
    const url = editTarget ? `/api/admin/providers/${editTarget.id}` : "/api/admin/providers";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      setShowForm(false);
      loadProviders();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this provider? All linked products will also lose their provider link.")) return;
    await fetch(`/api/admin/providers/${id}`, { method: "DELETE" });
    loadProviders();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SMM Providers</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your connected SMM panel APIs</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Provider
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
      ) : providers.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
          </div>
          <p className="text-white font-semibold">No providers yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first SMM panel to get started</p>
          <button onClick={openAdd} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors">
            Add Provider
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">API Endpoint</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Products</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {providers.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-semibold text-sm">{p.name}</p>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 text-xs hover:text-blue-400 transition-colors">
                      {p.url}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300 text-sm font-mono truncate max-w-xs">{p.apiEndpoint}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-800 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {p._count?.products ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${p.isActive ? "bg-emerald-900/50 text-emerald-400" : "bg-gray-800 text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-400" : "bg-gray-500"}`} />
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-gray-700"
                      >
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
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-white font-semibold text-lg">
                {editTarget ? "Edit Provider" : "Add Provider"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Panel Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. HonestSMM"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Panel URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://honestsmm.com"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">API Endpoint</label>
                <input
                  type="url"
                  value={form.apiEndpoint}
                  onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })}
                  placeholder="https://honestsmm.com/api/v2"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-gray-500 text-xs mt-1">Usually: https://paneldomain.com/api/v2</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">API Key</label>
                <input
                  type="text"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder="Your API key from the panel"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 accent-blue-600"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">Active</label>
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
                  {saving ? "Saving..." : editTarget ? "Update" : "Add Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
