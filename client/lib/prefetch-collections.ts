import { QueryClient } from "@tanstack/react-query";
import { getAllCollections } from "./storefront";

export const prefetchCollections = async (queryClient: QueryClient) => {
  try {
    await queryClient.prefetchQuery({
      queryKey: ["collections"],
      queryFn: getAllCollections,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    });
  } catch (error) {
    console.warn("Failed to prefetch collections:", error);
  }
};
