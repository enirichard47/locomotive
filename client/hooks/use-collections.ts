import { useQuery } from "@tanstack/react-query";
import { getAllCollections, getCollectionBySlug } from "@/lib/storefront";

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: getAllCollections,
    staleTime: 0, // Always fetch fresh
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 min
  });
};

export const useCollectionBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ["collection", slug],
    queryFn: () => getCollectionBySlug(slug!),
    enabled: !!slug,
    staleTime: 0, // Always fetch fresh
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 min
  });
};
