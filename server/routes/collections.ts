import { RequestHandler } from "express";
import { supabaseServer } from "../supabase";

type CollectionRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  path: string;
  coming_soon: boolean;
  base_price: number;
  source: "default" | "admin";
};

const defaultCollectionsSeed = [
  {
    name: "Hate Collection",
    description:
      "Limited edition drops engineered for bold identities and unapologetic self-expression",
    image: "/hate.png",
    slug: "hate",
    path: "/collections/hate",
    coming_soon: false,
    base_price: 22,
    source: "default" as const,
  },
  {
    name: "Manga Collection",
    description: "Anime-inspired graphics and vibrant colors. Launching soon.",
    image: "/locomotive_logo.png",
    slug: "manga",
    path: "/collections/manga",
    coming_soon: true,
    base_price: 54.99,
    source: "default" as const,
  },
];

const isMissingTableError = (error: { code?: string; message?: string } | null) =>
  Boolean(error && (error.code === "PGRST205" || /Could not find the table/i.test(error.message || "")));

const ensureDefaultCollections = async () => {
  const { error } = await supabaseServer.from("collections").upsert(defaultCollectionsSeed, {
    onConflict: "slug",
    ignoreDuplicates: true,
  });

  return error;
};

const normalizePath = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/^\/collections\//, "")
    .replace(/^\/+/, "")
    .replace(/\s+/g, "-");

  return `/collections/${slug}`;
};

const toCollectionItem = (row: CollectionRow) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  image: row.image || "/locomotive_logo.jpeg",
  path: row.path,
  comingSoon: row.coming_soon,
  basePrice: Number(row.base_price),
  source: row.source,
});

const getDefaultCollectionByPath = (path: string) => {
  const found = defaultCollectionsSeed.find((item) => item.path === path);
  if (!found) {
    return null;
  }

  return toCollectionItem({ id: `default-${found.slug}`, ...found } as CollectionRow);
};

export const handleGetCollections: RequestHandler = async (_req, res) => {
  const seedError = await ensureDefaultCollections();
  if (seedError && !isMissingTableError(seedError)) {
    return res.status(500).json({ error: seedError.message });
  }

  const { data, error } = await supabaseServer
    .from("collections")
    .select("id, slug, name, description, image, path, coming_soon, base_price, source")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      // Keep storefront usable while DB table is being created.
      return res.status(200).json({
        collections: defaultCollectionsSeed.map((item, index) =>
          toCollectionItem({
            id: `default-${index + 1}`,
            ...item,
          } as CollectionRow),
        ),
      });
    }

    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ collections: (data || []).map((item) => toCollectionItem(item as CollectionRow)) });
};

export const handleGetCollectionBySlug: RequestHandler = async (req, res) => {
  const slugParam = req.params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  if (!slug) {
    return res.status(400).json({ error: "slug is required" });
  }

  const path = normalizePath(slug);
  const { data, error } = await supabaseServer
    .from("collections")
    .select("id, slug, name, description, image, path, coming_soon, base_price, source")
    .eq("path", path)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      const fallback = getDefaultCollectionByPath(path);
      if (fallback) {
        return res.status(200).json({ collection: fallback });
      }
      return res.status(404).json({ error: "Collection not found" });
    }
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    const fallback = getDefaultCollectionByPath(path);
    if (fallback) {
      return res.status(200).json({ collection: fallback });
    }
    return res.status(404).json({ error: "Collection not found" });
  }

  return res.status(200).json({ collection: toCollectionItem(data as CollectionRow) });
};

export const handleCreateCollection: RequestHandler = async (req, res) => {
  const { name, description, image, path, basePrice, comingSoon } = req.body as {
    name?: string;
    description?: string;
    image?: string;
    path?: string;
    basePrice?: number;
    comingSoon?: boolean;
  };

  if (!name?.trim() || !description?.trim() || !path?.trim()) {
    return res.status(400).json({ error: "name, description, and path are required" });
  }

  const normalizedPath = normalizePath(path);
  const slug = normalizedPath.replace("/collections/", "");

  const { data, error } = await supabaseServer
    .from("collections")
    .insert({
      name: name.trim(),
      description: description.trim(),
      image: image?.trim() || "/locomotive_logo.jpeg",
      slug,
      path: normalizedPath,
      coming_soon: Boolean(comingSoon),
      base_price: Number(basePrice) || 49.99,
      source: "admin",
    })
    .select("id, slug, name, description, image, path, coming_soon, base_price, source")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ collection: toCollectionItem(data as CollectionRow) });
};

export const handleUpdateCollection: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const { name, description, image, path, basePrice, comingSoon } = req.body as {
    name?: string;
    description?: string;
    image?: string;
    path?: string;
    basePrice?: number;
    comingSoon?: boolean;
  };

  const updates: Record<string, unknown> = {};

  if (typeof name === "string") updates.name = name.trim();
  if (typeof description === "string") updates.description = description.trim();
  if (typeof image === "string") updates.image = image.trim() || "/locomotive_logo.jpeg";
  if (typeof comingSoon === "boolean") updates.coming_soon = comingSoon;
  if (typeof basePrice === "number") updates.base_price = basePrice;
  if (typeof path === "string" && path.trim()) {
    const normalizedPath = normalizePath(path);
    updates.path = normalizedPath;
    updates.slug = normalizedPath.replace("/collections/", "");
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const { data, error } = await supabaseServer
    .from("collections")
    .update(updates)
    .eq("id", id)
    .select("id, slug, name, description, image, path, coming_soon, base_price, source")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ collection: toCollectionItem(data as CollectionRow) });
};

export const handleDeleteCollection: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const { error } = await supabaseServer.from("collections").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
};
