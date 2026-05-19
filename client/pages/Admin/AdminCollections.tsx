import { FormEvent, useEffect, useRef, useState } from "react";
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
import type { CollectionFeaturedItem, CollectionItem } from "../../lib/storefront";
import { Plus, Trash2, Edit2, Tag, Sparkles, Layers3, ArrowLeft, Image as ImageIcon } from "lucide-react";

type FeaturedItemDraft = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
};

type FeaturedItemsEditorProps = {
  items: FeaturedItemDraft[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: Exclude<keyof FeaturedItemDraft, "id">, value: string) => void;
  onUploadImage: (id: string, file?: File | null) => void | Promise<void>;
  defaultImage: string;
  defaultPrice: string;
};

const createFeaturedItemDraft = (overrides: Partial<FeaturedItemDraft> = {}): FeaturedItemDraft => ({
  id: `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: "",
  description: "",
  image: "",
  price: "",
  ...overrides,
});

const featuredItemToDraft = (item: CollectionFeaturedItem): FeaturedItemDraft => ({
  id: item.id,
  name: item.name,
  description: item.description,
  image: item.image || "",
  price: item.price.toFixed(2),
});

const normalizeFeaturedItemDrafts = (
  items: FeaturedItemDraft[],
  fallbackImage: string,
  fallbackPrice: string,
) => {
  const normalizedItems: Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
  }> = [];

  for (const draft of items) {
    const name = draft.name.trim();
    const description = draft.description.trim();
    const image = draft.image.trim() || fallbackImage;
    const priceSource = draft.price.trim() || fallbackPrice;

    if (!name && !description && !draft.image.trim() && !draft.price.trim()) {
      continue;
    }

    if (!name || !description) {
      return {
        error: "Each featured item needs a name and description, or remove the empty card.",
        items: null as Array<{
          id: string;
          name: string;
          description: string;
          image: string;
          price: number;
        }> | null,
      };
    }

    const price = Number(priceSource);
    if (!Number.isFinite(price)) {
      return {
        error: `Featured item "${name}" needs a valid price.`,
        items: null as Array<{
          id: string;
          name: string;
          description: string;
          image: string;
          price: number;
        }> | null,
      };
    }

    normalizedItems.push({ id: draft.id, name, description, image, price });
  }

  return { error: null, items: normalizedItems };
};

function FeaturedItemsEditor({
  items,
  onAdd,
  onRemove,
  onChange,
  onUploadImage,
  defaultImage,
  defaultPrice,
}: FeaturedItemsEditorProps) {
  const uploadRefs = useRef<Record<string, HTMLInputElement | null>>({});

  return (
    <div className="border border-gray-100 bg-gray-50/30 p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-gray-100">
        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold text-black">Featured Products</h4>
          <p className="text-xs text-gray-400 mt-1">Add product items that will populate this collection page.</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[hsl(var(--primary))] transition-all duration-300"
        >
          Add Item Card
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-gray-250 p-6 text-center text-xs text-gray-400 uppercase tracking-widest font-medium py-10 bg-white">
          No items curated in this collection.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-100 p-5 space-y-4 relative group">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
                  Product Card {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Item Title</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => onChange(item.id, "name", e.target.value)}
                    placeholder="e.g. Hate Beanie V1"
                    className="w-full px-3 py-2 text-xs border border-gray-100 outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => onChange(item.id, "price", e.target.value)}
                    placeholder={defaultPrice}
                    className="w-full px-3 py-2 text-xs border border-gray-100 outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => onChange(item.id, "description", e.target.value)}
                    placeholder="Short editorial details..."
                    className="w-full px-3 py-2 text-xs border border-gray-100 outline-none min-h-16 focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Image URL / Upload</label>
                  <input
                    type="text"
                    value={item.image}
                    onChange={(e) => onChange(item.id, "image", e.target.value)}
                    placeholder={defaultImage}
                    className="w-full px-3 py-2 text-xs border border-gray-100 outline-none focus:border-black transition mb-2"
                  />
                  
                  <div className="flex items-center gap-2">
                    <input
                      ref={(node) => {
                        uploadRefs.current[item.id] = node;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        void onUploadImage(item.id, e.target.files?.[0]);
                        e.currentTarget.value = "";
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => uploadRefs.current[item.id]?.click()}
                      className="flex-1 py-2 border border-gray-100 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
                    >
                      Upload File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCollections() {
  const { isConnected, isAdmin } = useWallet();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const createImageInputRef = useRef<HTMLInputElement | null>(null);
  const editImageInputRef = useRef<HTMLInputElement | null>(null);
  const [formFeaturedItems, setFormFeaturedItems] = useState<FeaturedItemDraft[]>([]);
  const [editFeaturedItems, setEditFeaturedItems] = useState<FeaturedItemDraft[]>([]);

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

  const uploadFileToServer = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file.");
    }

    const fd = new FormData();
    fd.append("file", file, file.name);

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as Record<string, unknown> | string;
      const message = typeof payload === "string" ? payload : (payload.error || response.statusText);
      throw new Error(message as string);
    }

    const payload = await response.json() as { url?: string };
    if (!payload || !payload.url) {
      throw new Error("Upload did not return a file URL.");
    }

    return payload.url;
  };

  const updateFeaturedItemDraft = (
    setter: typeof setFormFeaturedItems,
    id: string,
    field: Exclude<keyof FeaturedItemDraft, "id">,
    value: string,
  ) => {
    setter((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeFeaturedItemDraft = (setter: typeof setFormFeaturedItems, id: string) => {
    setter((current) => current.filter((item) => item.id !== id));
  };

  const uploadFeaturedItemImage = async (
    setter: typeof setFormFeaturedItems,
    id: string,
    file?: File | null,
  ) => {
    if (!file) {
      return;
    }

    try {
      const url = await uploadFileToServer(file);
      setter((current) => current.map((item) => (item.id === id ? { ...item, image: url } : item)));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload featured item image.");
    }
  };

  const addFormFeaturedItem = () => {
    setFormFeaturedItems((current) => [...current, createFeaturedItemDraft({ price: formData.basePrice })]);
  };

  const addEditFeaturedItem = () => {
    setEditFeaturedItems((current) => [...current, createFeaturedItemDraft({ price: editData.basePrice })]);
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

    const normalizedFeaturedItems = normalizeFeaturedItemDrafts(
      formFeaturedItems,
      formData.image.trim() || "/locomotive_logo.jpeg",
      formData.basePrice === "" ? "0" : formData.basePrice,
    );

    if (normalizedFeaturedItems.error) {
      alert(normalizedFeaturedItems.error);
      return;
    }

    try {
      await addAdminCollection({
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim() || "/locomotive_logo.jpeg",
        path: `/collections/${formData.path.trim().toLowerCase().replace(/\s+/g, "-")}`,
        basePrice: formData.basePrice === "" ? 0 : Number(formData.basePrice),
        comingSoon: formData.comingSoon,
        featuredItems: normalizedFeaturedItems.items || [],
      });

      setFormData({
        name: "",
        description: "",
        image: "/locomotive_logo.jpeg",
        path: "",
        basePrice: "49.99",
        comingSoon: false,
      });
      setFormFeaturedItems([]);
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
      const url = await uploadFileToServer(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    }
  };

  const handleEditImageUpload = async (file?: File | null) => {
    if (!file) {
      return;
    }

    try {
      const url = await uploadFileToServer(file);
      setEditData((prev) => ({ ...prev, image: url }));
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
    setEditFeaturedItems(
      collection.featuredItems.length > 0
        ? collection.featuredItems.map(featuredItemToDraft)
        : [],
    );
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editData.name.trim() || !editData.description.trim() || !editData.path.trim()) {
      alert("Name, description, and slug are required.");
      return;
    }

    const normalizedFeaturedItems = normalizeFeaturedItemDrafts(
      editFeaturedItems,
      editData.image.trim() || "/locomotive_logo.jpeg",
      editData.basePrice === "" ? "0" : editData.basePrice,
    );

    if (normalizedFeaturedItems.error) {
      alert(normalizedFeaturedItems.error);
      return;
    }

    try {
      await updateAdminCollection(editingId, {
        name: editData.name.trim(),
        description: editData.description.trim(),
        image: editData.image.trim() || "/locomotive_logo.jpeg",
        path: `/collections/${editData.path.trim().toLowerCase().replace(/\s+/g, "-")}`,
        basePrice: editData.basePrice === "" ? 0 : Number(editData.basePrice),
        comingSoon: editData.comingSoon,
        featuredItems: normalizedFeaturedItems.items || [],
      });

      setEditingId(null);
      setEditFeaturedItems([]);
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
      if (editingId === id) setEditFeaturedItems([]);
      await refreshData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete collection.");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full px-4 py-28 text-center">
          <div className="border border-[hsl(var(--border))] bg-white p-12 text-center shadow-sm w-full">
            <p className="text-gray-500 font-serif italic text-sm mb-6">Connect wallet to continue.</p>
            <ConnectWallet />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full px-4 py-28 text-center">
          <div className="border border-red-500/20 bg-red-500/[0.02] p-12 text-center w-full">
            <p className="text-red-500 font-serif text-sm">Access denied.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[hsl(var(--foreground))]">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Editorial Subheader */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between pb-10 border-b border-gray-100 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="group flex items-center justify-center w-10 h-10 border border-gray-100 hover:border-black transition-colors"
                title="Back to System overview"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </Link>
              <div className="w-[1px] h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--primary))]">Curation Studio</span>
              </div>
            </div>
            
            <h1 className="font-serif text-5xl font-bold uppercase tracking-tighter text-black">
              Lookbook <span className="italic font-light">Curation</span>
            </h1>
            <p className="text-gray-500 font-serif italic text-base max-w-xl leading-relaxed">
              Design and launch storefront lookbooks, specify custom base prices, structure products, and toggle pre-sale discount systems.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Layers3 className="w-3.5 h-3.5 text-gray-300" />
              <span>{collections.length} Total</span>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[hsl(var(--primary))] transition-all duration-300 shadow-sm"
            >
              {showForm ? "Hide Editor" : "New Collection"}
            </button>
          </div>
        </div>

        {isLoadingCollections && (
          <div className="border border-gray-100 p-8 text-center text-xs uppercase tracking-widest font-bold text-gray-400">
            Fetching Lookbooks...
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="border border-gray-100 bg-white p-8 sm:p-10 space-y-8 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="font-serif text-2xl font-bold text-black uppercase tracking-tight">Create Lookbook</h2>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Populate the gallery archive</p>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Collection Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Hate Collection"
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-100 outline-none focus:border-black text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">URL Slug</label>
                    <input
                      type="text"
                      placeholder="e.g., hate"
                      value={formData.path}
                      onChange={(e) => setFormData(p => ({ ...p, path: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-100 outline-none focus:border-black text-sm transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">Path: /collections/your-slug</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Description</label>
                  <textarea
                    placeholder="Write lookbook concept details..."
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-100 outline-none focus:border-black text-sm min-h-24 transition"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Cover Image URL</label>
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
                          placeholder="/image.jpg or paste URL"
                          value={formData.image}
                          onChange={(e) => setFormData(p => ({ ...p, image: e.target.value }))}
                          className="flex-1 px-4 py-3 border border-gray-100 outline-none focus:border-black text-sm transition"
                        />
                        <button
                          type="button"
                          onClick={() => createImageInputRef.current?.click()}
                          className="px-5 py-3 border border-gray-150 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Base Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData(p => ({ ...p, basePrice: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-100 outline-none focus:border-black text-sm transition"
                    />
                  </div>
                </div>

                <div className="py-2">
                  <label className="inline-flex items-center gap-3 px-4 py-3 border border-gray-100 cursor-pointer hover:border-black transition">
                    <input
                      type="checkbox"
                      checked={formData.comingSoon}
                      onChange={(e) => setFormData(p => ({ ...p, comingSoon: e.target.checked }))}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">Mark as Upcoming Lookbook</span>
                  </label>
                </div>

                <FeaturedItemsEditor
                  items={formFeaturedItems}
                  onAdd={addFormFeaturedItem}
                  onRemove={(id) => removeFeaturedItemDraft(setFormFeaturedItems, id)}
                  onChange={(id, field, value) => updateFeaturedItemDraft(setFormFeaturedItems, id, field, value)}
                  onUploadImage={(id, file) => uploadFeaturedItemImage(setFormFeaturedItems, id, file)}
                  defaultImage={formData.image || "/locomotive_logo.jpeg"}
                  defaultPrice={formData.basePrice || "49.99"}
                />

                <div className="flex gap-4 pt-4 border-t border-gray-50">
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[hsl(var(--primary))] transition-all duration-500 shadow"
                  >
                    Publish Lookbook
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormFeaturedItems([]);
                    }}
                    className="px-8 py-4 border border-gray-150 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Preview panel */}
              <aside className="border border-gray-100 p-6 space-y-6 sticky top-28 bg-gray-50/20">
                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold block">Live Lookbook Preview</span>
                <div className="aspect-[4/5] bg-gray-100 overflow-hidden border border-gray-100 relative group">
                  <img
                    src={formData.image || "/locomotive_logo.jpeg"}
                    alt={formData.name || "Preview"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/locomotive_logo.jpeg";
                    }}
                  />
                  {formData.comingSoon && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-6 py-2 border border-white/20 text-white text-[8px] uppercase tracking-[0.4em] font-bold">Upcoming</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-black tracking-tight">{formData.name || "Untitled Lookbook"}</h3>
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-serif italic">{formData.description || "The conceptual statement will display here."}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-widest pt-2">
                  <span className="px-3 py-1 bg-white border border-gray-100 text-black font-serif italic text-xs">${Number(formData.basePrice || 0).toFixed(0)}</span>
                  <span className="px-3 py-1 bg-white border border-gray-100 text-gray-400">/{(formData.path || "slug").trim().toLowerCase()}</span>
                </div>
              </aside>
            </form>
          </div>
        )}

        {/* Collections Grid */}
        <section className="space-y-8">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="font-serif text-2xl uppercase tracking-tight text-black">Curated Archives</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">
              {collections.length} Lookbooks curated ({adminCollections.length} Custom Editions)
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {collections.length === 0 ? (
              <div className="lg:col-span-2 border border-gray-100 py-20 text-center space-y-4">
                <Tag className="w-8 h-8 text-gray-300 mx-auto opacity-50" />
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400">No active lookbooks</p>
              </div>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  className="border border-gray-100 p-8 hover:shadow-md hover:border-gray-250 transition-all duration-500 bg-white flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-4 flex-1 min-w-0">
                        {/* Image slot */}
                        <div className="aspect-[16/9] overflow-hidden border border-gray-50 bg-gray-50 relative group">
                          <img
                            src={collection.image}
                            alt={collection.name}
                            className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = "/locomotive_logo.jpeg";
                            }}
                          />
                          {collection.comingSoon && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                              <span className="px-6 py-2 border border-white/20 text-white text-[8px] uppercase tracking-[0.4em] font-bold">Upcoming</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-serif text-2xl font-bold text-black tracking-tight">{collection.name}</h3>
                          
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 border ${
                            collection.source === "admin" 
                              ? "bg-black text-white border-black" 
                              : "text-gray-400 border-gray-100"
                          }`}>
                            {collection.source === "admin" ? "Custom" : "System Default"}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 font-light leading-relaxed break-words">
                          {collection.description}
                        </p>

                        <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-widest pt-2">
                          <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-black font-serif italic text-xs">
                            ${collection.basePrice.toFixed(0)} Base
                          </span>
                          <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-400 break-all">
                            {collection.path}
                          </span>
                          <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-black">
                            {collection.featuredItems.length} Products Curated
                          </span>
                        </div>
                      </div>

                      {/* Edit controls */}
                      <div className="flex gap-1 shrink-0">
                        {editingId === collection.id ? (
                          <button
                            onClick={() => setEditingId(null)}
                            className="w-8 h-8 flex items-center justify-center border border-black text-black hover:bg-black hover:text-white transition text-xs font-bold"
                          >
                            ✕
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(collection)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-100 hover:border-black text-gray-400 hover:text-black transition"
                              title="Edit Lookbook"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {collection.source === "admin" && (
                              <button
                                onClick={() => handleDelete(collection.id)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-100 hover:border-red-500 text-gray-400 hover:text-red-500 transition"
                                title="Delete Lookbook"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {editingId === collection.id && (
                    <form onSubmit={handleEditSubmit} className="mt-8 pt-8 border-t border-gray-100 space-y-6">
                      <div className="border-b border-gray-50 pb-2">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Edit Lookbook Config</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Name</label>
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                            className="w-full px-3 py-2 text-xs border border-gray-100 outline-none focus:border-black transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Slug</label>
                          <input
                            type="text"
                            value={editData.path}
                            onChange={(e) => setEditData((p) => ({ ...p, path: e.target.value }))}
                            className="w-full px-3 py-2 text-xs border border-gray-100 outline-none focus:border-black transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Description</label>
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-gray-100 outline-none focus:border-black min-h-20 transition"
                        />
                      </div>

                      <div className="grid md:grid-cols-[1fr_150px] gap-4">
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Cover Image</label>
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
                              className="flex-1 min-w-0 px-3 py-2 text-xs border border-gray-100 outline-none focus:border-black transition"
                            />
                            <button
                              type="button"
                              onClick={() => editImageInputRef.current?.click()}
                              className="px-3 py-2 border border-gray-150 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition shrink-0"
                            >
                              Upload
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Price ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editData.basePrice}
                            onChange={(e) => setEditData((p) => ({ ...p, basePrice: e.target.value }))}
                            className="w-full px-3 py-2 text-xs border border-gray-100 outline-none focus:border-black transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editData.comingSoon}
                            onChange={(e) => setEditData((p) => ({ ...p, comingSoon: e.target.checked }))}
                            className="w-4 h-4 accent-black"
                          />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-black">Upcoming Lookbook</span>
                        </label>
                      </div>

                      <FeaturedItemsEditor
                        items={editFeaturedItems}
                        onAdd={addEditFeaturedItem}
                        onRemove={(id) => removeFeaturedItemDraft(setEditFeaturedItems, id)}
                        onChange={(id, field, value) => updateFeaturedItemDraft(setEditFeaturedItems, id, field, value)}
                        onUploadImage={(id, file) => uploadFeaturedItemImage(setEditFeaturedItems, id, file)}
                        defaultImage={editData.image || "/locomotive_logo.jpeg"}
                        defaultPrice={editData.basePrice || "49.99"}
                      />

                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[hsl(var(--primary))] transition-all duration-300">
                          Save Lookbook
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditFeaturedItems([]);
                          }}
                          className="px-6 py-2.5 border border-gray-150 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition"
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
