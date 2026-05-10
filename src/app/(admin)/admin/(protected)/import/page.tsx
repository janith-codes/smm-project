"use client";

import { useEffect, useState, useMemo } from "react";

interface Provider {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

interface SmmService {
  service: number | string;
  name: string;
  type?: string;
  category?: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  refill?: boolean;
  cancel?: boolean;
}

interface SelectableService extends SmmService {
  selected: boolean;
  categoryId: string;
  sellingRate: string;
}

type Step = "select-provider" | "fetch-services" | "select-services" | "importing" | "done";

export default function ImportPage() {
  const [step, setStep] = useState<Step>("select-provider");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<SelectableService[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [defaultCategoryId, setDefaultCategoryId] = useState("");
  const [defaultMarkup, setDefaultMarkup] = useState("20");

  useEffect(() => {
    fetch("/api/admin/providers").then((r) => r.json()).then((data) => {
      setProviders(Array.isArray(data) ? data.filter((p: Provider) => p.isActive) : []);
    });
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

  async function fetchServices() {
    if (!selectedProvider) return;
    setFetching(true);
    setFetchError("");
    setStep("fetch-services");

    const res = await fetch(`/api/admin/providers/${selectedProvider.id}/services`);
    setFetching(false);

    if (!res.ok) {
      const data = await res.json();
      setFetchError(data.error ?? "Failed to fetch services");
      setStep("select-provider");
      return;
    }

    const data: SmmService[] = await res.json();

    const markup = parseFloat(defaultMarkup) || 20;
    const withSelectable: SelectableService[] = data.map((svc) => ({
      ...svc,
      selected: false,
      categoryId: defaultCategoryId,
      sellingRate: String((parseFloat(String(svc.rate)) * (1 + markup / 100)).toFixed(4)),
    }));

    setServices(withSelectable);
    setStep("select-services");
  }

  const providerCategories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category ?? "Other"));
    return ["all", ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCat = categoryFilter === "all" || s.category === categoryFilter;
      const matchesSearch = !searchFilter || s.name.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [services, categoryFilter, searchFilter]);

  const selectedCount = services.filter((s) => s.selected).length;

  function toggleAll() {
    const allFilteredSelected = filteredServices.every((s) => s.selected);
    setServices((prev) =>
      prev.map((s) => {
        const inFiltered = filteredServices.some((f) => f.service === s.service);
        if (!inFiltered) return s;
        return { ...s, selected: !allFilteredSelected };
      })
    );
  }

  function toggleService(id: number | string) {
    setServices((prev) =>
      prev.map((s) => (s.service === id ? { ...s, selected: !s.selected } : s))
    );
  }

  function updateServiceField(id: number | string, field: "categoryId" | "sellingRate", value: string) {
    setServices((prev) =>
      prev.map((s) => (s.service === id ? { ...s, [field]: value } : s))
    );
  }

  function applyBulkCategory(catId: string) {
    setServices((prev) =>
      prev.map((s) => {
        const inFiltered = filteredServices.some((f) => f.service === s.service && s.selected);
        if (!inFiltered) return s;
        return { ...s, categoryId: catId };
      })
    );
  }

  function applyBulkMarkup(markup: string) {
    const m = parseFloat(markup) || 0;
    setServices((prev) =>
      prev.map((s) => {
        const inFiltered = filteredServices.some((f) => f.service === s.service && s.selected);
        if (!inFiltered) return s;
        return { ...s, sellingRate: String((parseFloat(String(s.rate)) * (1 + m / 100)).toFixed(4)) };
      })
    );
  }

  async function handleImport() {
    const toImport = services.filter((s) => s.selected);
    if (!toImport.length) return;
    setStep("importing");

    const res = await fetch("/api/admin/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: selectedProvider!.id,
        services: toImport.map((s) => ({
          service: s.service,
          name: s.name,
          type: s.type,
          category: s.category,
          rate: s.rate,
          min: s.min,
          max: s.max,
          categoryId: s.categoryId || undefined,
          sellingRate: parseFloat(s.sellingRate) || undefined,
        })),
      }),
    });

    const data = await res.json();
    setImportResult(data);
    setStep("done");
  }

  const catTree = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return "";
    const parent = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null;
    return parent ? `${parent.name} / ${cat.name}` : cat.name;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Import Services</h1>
        <p className="text-gray-400 mt-1 text-sm">Fetch services from SMM providers and import them as products</p>
      </div>

      <div className="flex gap-2 mb-8">
        {(["select-provider", "select-services", "done"] as const).map((s, i) => {
          const labels = ["1. Select Provider", "2. Select Services", "3. Done"];
          const current =
            step === "select-provider" ? 0
            : step === "fetch-services" ? 1
            : step === "select-services" ? 1
            : step === "importing" ? 2
            : 2;
          const isActive = i <= current;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isActive ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"}`}>
                {labels[i]}
              </div>
              {i < 2 && <div className="w-8 h-px bg-gray-700" />}
            </div>
          );
        })}
      </div>

      {step === "select-provider" && (
        <div className="max-w-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Choose a Provider</h2>
            <p className="text-gray-400 text-sm">Select which SMM panel to import services from</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">Default Settings</label>
            <div className="grid grid-cols-2 gap-4 bg-gray-900 rounded-xl p-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Default Category</label>
                <select
                  value={defaultCategoryId}
                  onChange={(e) => setDefaultCategoryId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {categories.filter((c) => !c.parentId).map((parent) => (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>{parent.name}</option>
                      {categories.filter((c) => c.parentId === parent.id).map((child) => (
                        <option key={child.id} value={child.id}>  {child.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Default Markup %</label>
                <input
                  type="number"
                  value={defaultMarkup}
                  onChange={(e) => setDefaultMarkup(e.target.value)}
                  placeholder="20"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {providers.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-8 text-center">
              <p className="text-white font-semibold">No active providers</p>
              <p className="text-gray-400 text-sm mt-1">Add an SMM provider first</p>
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors text-left ${selectedProvider?.id === p.id ? "bg-blue-600/20 border-blue-500" : "bg-gray-900 border-gray-800 hover:border-gray-600"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedProvider?.id === p.id ? "bg-blue-600" : "bg-gray-800"}`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{p.name}</p>
                      <p className="text-gray-400 text-xs">{p.url}</p>
                    </div>
                  </div>
                  {selectedProvider?.id === p.id && (
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {fetchError && (
            <div className="mt-4 bg-red-900/50 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300">{fetchError}</div>
          )}

          <div className="mt-6">
            <button
              onClick={fetchServices}
              disabled={!selectedProvider || fetching}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors flex items-center gap-2"
            >
              {fetching ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fetching services...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Fetch Services
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "fetch-services" && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-white font-semibold">Fetching services...</p>
            <p className="text-gray-400 text-sm mt-1">Connecting to {selectedProvider?.name}</p>
          </div>
        </div>
      )}

      {step === "select-services" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {services.length} services from {selectedProvider?.name}
              </h2>
              <p className="text-gray-400 text-sm">{selectedCount} selected</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setStep("select-provider"); setServices([]); }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={selectedCount === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Import {selectedCount} Services
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search services..."
                className="bg-gray-900 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {providerCategories.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>

          {selectedCount > 0 && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-end">
              <p className="text-blue-300 text-sm font-semibold self-center">Bulk edit {selectedCount} selected:</p>
              <div>
                <label className="block text-xs text-blue-300/70 mb-1">Set Category</label>
                <select
                  onChange={(e) => applyBulkCategory(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none"
                >
                  <option value="">Pick category...</option>
                  {categories.filter((c) => !c.parentId).map((parent) => (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>{parent.name}</option>
                      {categories.filter((c) => c.parentId === parent.id).map((child) => (
                        <option key={child.id} value={child.id}>  {child.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-blue-300/70 mb-1">Set Markup %</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    defaultValue={defaultMarkup}
                    id="bulk-markup"
                    placeholder="20"
                    className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-1.5 text-sm w-24 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const val = (document.getElementById("bulk-markup") as HTMLInputElement)?.value;
                      applyBulkMarkup(val);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl px-3 py-1.5 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filteredServices.length > 0 && filteredServices.every((s) => s.selected)}
                      onChange={toggleAll}
                      className="accent-blue-600 w-4 h-4 rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Service Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rate/1K</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Min / Max</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Our Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Selling Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredServices.map((svc) => (
                  <tr
                    key={svc.service}
                    className={`transition-colors ${svc.selected ? "bg-blue-600/10" : "hover:bg-gray-800/50"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={svc.selected}
                        onChange={() => toggleService(svc.service)}
                        className="accent-blue-600 w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{svc.service}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-white text-sm leading-snug line-clamp-2">{svc.name}</p>
                      {svc.type && <p className="text-gray-500 text-xs mt-0.5">{svc.type}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-xs">{svc.category ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-200 text-sm font-mono">${svc.rate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-xs">{Number(svc.min).toLocaleString()} / {Number(svc.max).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={svc.categoryId}
                        onChange={(e) => updateServiceField(svc.service, "categoryId", e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                      >
                        <option value="">No category</option>
                        {categories.filter((c) => !c.parentId).map((parent) => (
                          <optgroup key={parent.id} label={parent.name}>
                            <option value={parent.id}>{parent.name}</option>
                            {categories.filter((c) => c.parentId === parent.id).map((child) => (
                              <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.0001"
                        value={svc.sellingRate}
                        onChange={(e) => updateServiceField(svc.service, "sellingRate", e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs font-mono w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleImport}
              disabled={selectedCount === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import {selectedCount} Selected Services
            </button>
          </div>
        </div>
      )}

      {step === "importing" && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-white font-semibold">Importing services...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait</p>
          </div>
        </div>
      )}

      {step === "done" && importResult && (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Import Complete!</h2>
          <p className="text-gray-400 text-lg">
            Successfully imported <span className="text-white font-semibold">{importResult.imported}</span> services
          </p>
          <div className="flex gap-3 justify-center mt-8">
            <button
              onClick={() => { setStep("select-provider"); setSelectedProvider(null); setServices([]); setImportResult(null); }}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors"
            >
              Import More
            </button>
            <a href="/admin/products" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors">
              View Products
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
