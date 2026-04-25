import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import {
  addAdminCollection,
  deleteAdminCollection,
  getAllCollections,
  updateAdminCollection,
} from "../../lib/storefront";
import type { CollectionItem } from "../../lib/storefront";
import { Plus, Trash2, Edit2, Tag, Sparkles, Layers3 } from "lucide-react";

export default function AdminCollections() {
  const { isConnected, isAdmin } = useWallet();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const createImageInputRef = useRef<HTMLInputElement | null>(null);
  const editImageInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "/locomotive_logo.jpeg",
    path: "",
    basePrice: "49.99",
    comingSoon: false,
  });

  const [editData, setEditData] = useState({
    name: "",
    description: "",
    image: "",
    path: "",
    basePrice: "49.99",
    comingSoon: false,
  });

  const readImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file.");
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Failed to read image file."));
      };
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });
  };

  const adminCollections = collections.filter(c => c.source === "admin");

  const refreshData = async () => {
    setIsLoadingCollections(true);
    try {
      const nextCollections = await getAllCollections();
      setCollections(nextCollections);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to load collections.");
      setCollections([]);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.path.trim()) {
      alert("Name, description, and slug are required.");
      return;
    }

    try {
      await addAdminCollection({
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim() || "/locomotive_logo.jpeg",
        path: `/collections/${formData.path.trim().toLowerCase().replace(/\s+/g, "-")}`,
        basePrice: Number(formData.basePrice) || 49.99,
        comingSoon: formData.comingSoon,
      });

      setFormData({
        name: "",
        description: "",
        image: "/locomotive_logo.jpeg",
        path: "",
        basePrice: "49.99",
        comingSoon: false,
      });
      setShowForm(false);
      await refreshData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create collection.");
    }
  };

  const handleCreateImageUpload = async (file?: File | null) => {
    if (!file) {
      return;
    }

    try {
      const imageDataUrl = await readImageFile(file);
      setFormData((prev) => ({ ...prev, image: imageDataUrl }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    }
  };

  const handleEditImageUpload = async (file?: File | null) => {
    if (!file) {
      return;
    }

    try {
      const imageDataUrl = await readImageFile(file);
      setEditData((prev) => ({ ...prev, image: imageDataUrl }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    }
  };

  const startEdit = (collection: CollectionItem) => {
    setEditingId(collection.id);
    setEditData({
      name: collection.name,
      description: collection.description,
      image: collection.image,
      path: collection.path.replace("/collections/", ""),
      basePrice: collection.basePrice.toFixed(2),
      comingSoon: collection.comingSoon,
    });
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editData.name.trim() || !editData.description.trim() || !editData.path.trim()) {
      alert("Name, description, and slug are required.");
      return;
    }

    try {
      await updateAdminCollection(editingId, {
        name: editData.name.trim(),
        description: editData.description.trim(),
        image: editData.image.trim() || "/locomotive_logo.jpeg",
        path: `/collections/${editData.path.trim().toLowerCase().replace(/\s+/g, "-")}`,
        basePrice: Number(editData.basePrice) || 49.99,
        comingSoon: editData.comingSoon,
      });

      setEditingId(null);
      await refreshData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update collection.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this collection? This action cannot be undone.")) return;
    try {
      await deleteAdminCollection(id);
      if (editingId === id) setEditingId(null);
      await refreshData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete collection.");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <AdminHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-[hsl(var(--muted-foreground))] mb-6">Connect wallet to continue.</p>
          <ConnectWallet />
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <AdminHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-red-500">Access denied.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))]/30">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--card))]/60 border border-[hsl(var(--border))] rounded-3xl p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <Link
                to="/admin"
                className="group relative p-3 hover:bg-gradient-to-br hover:from-[hsl(var(--primary))]/10 hover:to-[hsl(var(--primary))]/5 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 transition-all duration-300"
                title="Back to Dashboard"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/60 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                <svg className="relative w-6 h-6 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
                  <p className="text-xs tracking-[0.2em] font-bold text-[hsl(var(--muted-foreground))] uppercase">Curation Studio</p>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))]">Collections</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-2 text-base md:text-lg">Create and manage storefront collections with polished control.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/60 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                <Layers3 className="w-4 h-4" />
                {collections.length} total
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 text-[hsl(var(--primary-foreground))] rounded-xl font-semibold shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 hover:-translate-y-0.5 transition"
              >
                <Plus className="w-5 h-5" />
                {showForm ? "Close Form" : "New Collection"}
              </button>
            </div>
          </div>
        </div>

        {isLoadingCollections && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
            Loading collections...
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 border border-[hsl(var(--border))] rounded-3xl p-8 space-y-6 shadow-xl shadow-[hsl(var(--primary))]/10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">Add New Collection</h2>
              <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))]">Fields marked by context are required for publishing</p>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Collection Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Combat Series"
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Slug</label>
                    <input
                      type="text"
                      placeholder="e.g., combat"
                      value={formData.path}
                      onChange={(e) => setFormData(p => ({ ...p, path: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">URL becomes /collections/your-slug</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Description</label>
                  <textarea
                    placeholder="Describe this collection..."
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-24 focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Image URL</label>
                    <div className="space-y-3">
                      <input
                        ref={createImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleCreateImageUpload(e.target.files?.[0])}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="/image.jpg, https://..., or uploaded image"
                          value={formData.image}
                          onChange={(e) => setFormData(p => ({ ...p, image: e.target.value }))}
                          className="flex-1 px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => createImageInputRef.current?.click()}
                          className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-semibold hover:border-[hsl(var(--primary))] transition"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Base Price ($)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData(p => ({ ...p, basePrice: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                    />
                  </div>
                </div>

                <label className="inline-flex items-center gap-3 px-4 py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl cursor-pointer hover:border-[hsl(var(--primary))] transition">
                  <input
                    type="checkbox"
                    checked={formData.comingSoon}
                    onChange={(e) => setFormData(p => ({ ...p, comingSoon: e.target.checked }))}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">Mark as Coming Soon</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 text-[hsl(var(--primary-foreground))] rounded-xl font-semibold shadow-lg shadow-[hsl(var(--primary))]/20 hover:shadow-[hsl(var(--primary))]/35 transition"
                  >
                    Create Collection
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-[hsl(var(--border))] rounded-xl font-semibold hover:bg-[hsl(var(--card))] transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <aside className="lg:sticky lg:top-28 bg-[hsl(var(--background))]/80 border border-[hsl(var(--border))] rounded-2xl p-4 space-y-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))] font-bold">Live Preview</p>
                <div className="h-40 rounded-xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                  <img
                    src={formData.image || "/locomotive_logo.jpeg"}
                    alt={formData.name || "Collection preview"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/locomotive_logo.jpeg";
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">{formData.name || "Untitled Collection"}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 line-clamp-3">{formData.description || "Your collection description will appear here."}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-semibold">${Number(formData.basePrice || 0).toFixed(2)}</span>
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">/collections/{(formData.path || "slug").trim().toLowerCase().replace(/\s+/g, "-")}</span>
                  {formData.comingSoon && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 font-semibold">Coming Soon</span>
                  )}
                </div>
              </aside>
            </form>
          </div>
        )}

        {/* Collections Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Your Collections</h2>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">{collections.length} total ({adminCollections.length} custom)</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {collections.length === 0 ? (
              <div className="lg:col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-12 text-center">
                <Tag className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
                <p className="text-[hsl(var(--muted-foreground))]">No collections yet</p>
              </div>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 hover:border-[hsl(var(--primary))]/50 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/10 transition h-full flex flex-col"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="w-full h-36 rounded-xl overflow-hidden border border-[hsl(var(--border))] mb-4 bg-[hsl(var(--background))]">
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/locomotive_logo.jpeg";
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))] truncate">{collection.name}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${collection.source === "admin" ? "bg-purple-500/15 text-purple-700 border border-purple-500/30" : "bg-blue-500/15 text-blue-700 border border-blue-500/30"}`}>
                          {collection.source === "admin" ? "Custom" : "Default"}
                        </span>
                        {collection.comingSoon && (
                          <span className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-[hsl(var(--muted-foreground))] break-words">{collection.description}</p>
                      <div className="flex items-center flex-wrap gap-3 mt-4 text-sm text-[hsl(var(--muted-foreground))]">
                        <span className="px-3 py-1 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] font-semibold text-[hsl(var(--foreground))]">${collection.basePrice.toFixed(2)}</span>
                        <span className="px-3 py-1 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] break-all">{collection.path}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {editingId === collection.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
                        >
                          ✕
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(collection)}
                            className="p-2 hover:bg-[hsl(var(--background))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(collection.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/60 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId === collection.id && (
                    <form onSubmit={handleEditSubmit} className="mt-6 pt-6 border-t border-[hsl(var(--border))] space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-semibold text-[hsl(var(--foreground))] text-lg">Edit Collection</h4>
                        <span className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))] font-bold">
                          Editing card
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                          className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                        />
                        <input
                          type="text"
                          value={editData.path}
                          onChange={(e) => setEditData((p) => ({ ...p, path: e.target.value }))}
                          className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                        />
                      </div>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] min-h-20 focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                      />
                      <div className="grid md:grid-cols-[1fr_180px] gap-4 items-start">
                        <div className="space-y-3 min-w-0">
                          <input
                            ref={editImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => void handleEditImageUpload(e.target.files?.[0])}
                            className="hidden"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editData.image}
                              onChange={(e) => setEditData((p) => ({ ...p, image: e.target.value }))}
                              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                            />
                            <button
                              type="button"
                              onClick={() => editImageInputRef.current?.click()}
                              className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-semibold hover:border-[hsl(var(--primary))] transition shrink-0"
                            >
                              Upload
                            </button>
                          </div>
                        </div>
                        <input
                          type="number"
                          value={editData.basePrice}
                          onChange={(e) => setEditData((p) => ({ ...p, basePrice: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-[hsl(var(--primary))]/60 focus:ring-2 focus:ring-[hsl(var(--primary))]/20 outline-none transition"
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editData.comingSoon}
                          onChange={(e) => setEditData((p) => ({ ...p, comingSoon: e.target.checked }))}
                        />
                        Coming Soon
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 text-[hsl(var(--primary-foreground))] rounded-xl font-semibold">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2.5 border border-[hsl(var(--border))] rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
