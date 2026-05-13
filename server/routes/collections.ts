import { RequestHandler } from "express";
import { supabaseServer } from "../supabase";
import { getDefaultFeaturedItems } from "../../shared/collections";

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

type ProductRow = {
  id: string;
  collection_id: string | null;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  created_at: string;
};

type CollectionFeaturedItem = {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
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
  featuredItems: [] as CollectionFeaturedItem[],
});

const mapProductRow = (row: ProductRow): CollectionFeaturedItem => ({
  id: row.id,
  name: row.name,
  description: row.description || "",
  image: row.image || undefined,
  price: Number(row.price),
});

const getDefaultCollectionFeaturedItems = (slug: string): CollectionFeaturedItem[] =>
  getDefaultFeaturedItems(slug).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image || undefined,
  }));

const loadFeaturedItemsByCollectionIds = async (collectionIds: string[]) => {
  if (collectionIds.length === 0) {
    return {
      featuredItemsByCollectionId: new Map<string, CollectionFeaturedItem[]>(),
      missingTable: false,
    };
  }

  const { data, error } = await supabaseServer
    .from("products")
    .select("id, collection_id, name, description, image, price, created_at")
    .in("collection_id", collectionIds)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      return {
        featuredItemsByCollectionId: new Map<string, CollectionFeaturedItem[]>(),
        missingTable: true,
      };
    }

    throw error;
  }

  const featuredItemsByCollectionId = new Map<string, CollectionFeaturedItem[]>();

  for (const row of (data || []) as ProductRow[]) {
    if (!row.collection_id) {
      continue;
    }

    const nextItems = featuredItemsByCollectionId.get(row.collection_id) || [];
    nextItems.push(mapProductRow(row));
    featuredItemsByCollectionId.set(row.collection_id, nextItems);
  }

  return { featuredItemsByCollectionId, missingTable: false };
};

const attachFeaturedItems = (
  collections: CollectionRow[],
  featuredItemsByCollectionId: Map<string, CollectionFeaturedItem[]>,
) =>
  collections.map((collection) => {
    const storedItems = featuredItemsByCollectionId.get(collection.id) || [];
    const featuredItems = storedItems.length > 0
      ? storedItems
      : collection.source === "default"
        ? getDefaultCollectionFeaturedItems(collection.slug)
        : [];

    return {
      ...toCollectionItem(collection),
      featuredItems,
    };
  });

const attachFeaturedItemsToCollection = (
  collection: CollectionRow,
  featuredItems: CollectionFeaturedItem[],
) => ({
  ...toCollectionItem(collection),
  featuredItems: featuredItems.length > 0
    ? featuredItems
    : collection.source === "default"
      ? getDefaultCollectionFeaturedItems(collection.slug)
      : [],
});

const replaceFeaturedItems = async (
  collectionId: string,
  featuredItems?: Array<{
    name?: string;
    description?: string;
    image?: string;
    price?: number;
  }>,
) => {
  if (!Array.isArray(featuredItems)) {
    return;
  }

  const normalizedItems = featuredItems
    .map((item) => ({
      name: item.name?.trim() || "",
      description: item.description?.trim() || "",
      image: item.image?.trim() || null,
      price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
    }))
    .filter((item) => item.name.length > 0);

  const deleteResult = await supabaseServer.from("products").delete().eq("collection_id", collectionId);
  if (deleteResult.error) {
    throw deleteResult.error;
  }

  if (normalizedItems.length === 0) {
    return;
  }

  const { error } = await supabaseServer.from("products").insert(
    normalizedItems.map((item) => ({
      collection_id: collectionId,
      name: item.name,
      description: item.description,
      image: item.image,
      price: item.price,
    })),
  );

  if (error) {
    throw error;
  }
};

const getDefaultCollectionByPath = (path: string) => {
  const found = defaultCollectionsSeed.find((item) => item.path === path);
  if (!found) {
    return null;
  }

  return attachFeaturedItemsToCollection({ id: `default-${found.slug}`, ...found } as CollectionRow, []);
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
          attachFeaturedItemsToCollection(
            {
              id: `default-${index + 1}`,
              ...item,
            } as CollectionRow,
            [],
          ),
        ),
      });
    }

    return res.status(500).json({ error: error.message });
  }

  const collections = (data || []) as CollectionRow[];
  const { featuredItemsByCollectionId, missingTable } = await loadFeaturedItemsByCollectionIds(
    collections.map((item) => item.id),
  );

  return res.status(200).json({
    collections: attachFeaturedItems(collections, missingTable ? new Map<string, CollectionFeaturedItem[]>() : featuredItemsByCollectionId),
  });
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

  const collection = data as CollectionRow;
  const { featuredItemsByCollectionId, missingTable } = await loadFeaturedItemsByCollectionIds([collection.id]);
  const featuredItems = missingTable ? [] : featuredItemsByCollectionId.get(collection.id) || [];

  return res.status(200).json({
    collection: attachFeaturedItemsToCollection(collection, featuredItems),
  });
};

export const handleCreateCollection: RequestHandler = async (req, res) => {
  const { name, description, image, path, basePrice, comingSoon, featuredItems } = req.body as {
    name?: string;
    description?: string;
    image?: string;
    path?: string;
    basePrice?: number;
    comingSoon?: boolean;
    featuredItems?: Array<{
      name?: string;
      description?: string;
      image?: string;
      price?: number;
    }>;
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

  if (Array.isArray(featuredItems)) {
    try {
      await replaceFeaturedItems((data as CollectionRow).id, featuredItems);
    } catch (featuredItemError) {
      return res.status(500).json({
        error: featuredItemError instanceof Error ? featuredItemError.message : "Failed to create featured items",
      });
    }
  }

  const { featuredItemsByCollectionId, missingTable } = await loadFeaturedItemsByCollectionIds([(data as CollectionRow).id]);
  const nextFeaturedItems = missingTable ? [] : featuredItemsByCollectionId.get((data as CollectionRow).id) || [];

  return res.status(201).json({
    collection: attachFeaturedItemsToCollection(data as CollectionRow, nextFeaturedItems),
  });
};

export const handleUpdateCollection: RequestHandler = async (req, res) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const { name, description, image, path, basePrice, comingSoon, featuredItems } = req.body as {
    name?: string;
    description?: string;
    image?: string;
    path?: string;
    basePrice?: number;
    comingSoon?: boolean;
    featuredItems?: Array<{
      name?: string;
      description?: string;
      image?: string;
      price?: number;
    }>;
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

  if (Array.isArray(featuredItems)) {
    try {
      await replaceFeaturedItems(id, featuredItems);
    } catch (featuredItemError) {
      return res.status(500).json({
        error: featuredItemError instanceof Error ? featuredItemError.message : "Failed to update featured items",
      });
    }
  }

  const { featuredItemsByCollectionId, missingTable } = await loadFeaturedItemsByCollectionIds([id]);
  const nextFeaturedItems = missingTable ? [] : featuredItemsByCollectionId.get(id) || [];

  return res.status(200).json({
    collection: attachFeaturedItemsToCollection(data as CollectionRow, nextFeaturedItems),
  });
};

export const handleDeleteCollection: RequestHandler = async (req, res) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const deleteProductsResult = await supabaseServer.from("products").delete().eq("collection_id", id);
  if (deleteProductsResult.error && !isMissingTableError(deleteProductsResult.error)) {
    return res.status(500).json({ error: deleteProductsResult.error.message });
  }

  const { error } = await supabaseServer.from("collections").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
};
