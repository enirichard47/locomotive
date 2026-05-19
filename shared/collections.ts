export interface DefaultFeaturedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export const defaultFeaturedItemsBySlug: Record<string, DefaultFeaturedItem[]> = {
  hate: [
    {
      id: "default-hate-cap",
      name: "Hate Cap",
      description: "Full-color print, regular fit",
      price: 11,
      image: "/hate.png",
    },
  ],
  manga: [
    {
      id: "default-manga-preview",
      name: "Manga Drop 01",
      description: "Anime-inspired artwork, launch preview",
      price: 54.99,
      image: "/locomotive_logo.png",
    },
  ],
};

export const getDefaultFeaturedItems = (slug?: string) =>
  (slug ? defaultFeaturedItemsBySlug[slug] : undefined) || [];