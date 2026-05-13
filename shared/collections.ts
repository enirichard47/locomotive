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
    },
  ],
  manga: [
    {
      id: "default-manga-preview",
      name: "Manga Drop 01",
      description: "Anime-inspired artwork, launch preview",
      price: 54.99,
    },
  ],
  arsenal: [
    {
      id: "default-arsenal-jersey-1",
      name: "Arsenal Jersey 1",
      description: "Performance fit, breathable",
      price: 79.99,
    },
    {
      id: "default-arsenal-jersey-2",
      name: "Arsenal Jersey 2",
      description: "Performance fit, breathable",
      price: 79.99,
    },
    {
      id: "default-arsenal-jersey-3",
      name: "Arsenal Jersey 3",
      description: "Performance fit, breathable",
      price: 79.99,
    },
  ],
  combat: [
    {
      id: "default-combat-tee-1",
      name: "Combat Tee 1",
      description: "Premium cotton, oversized fit",
      price: 49.99,
    },
    {
      id: "default-combat-tee-2",
      name: "Combat Tee 2",
      description: "Premium cotton, oversized fit",
      price: 49.99,
    },
    {
      id: "default-combat-tee-3",
      name: "Combat Tee 3",
      description: "Premium cotton, oversized fit",
      price: 49.99,
    },
  ],
  eight: [
    {
      id: "default-eight-series-1",
      name: "8 Series #1",
      description: "Minimal design, premium fit",
      price: 45.99,
    },
    {
      id: "default-eight-series-2",
      name: "8 Series #2",
      description: "Minimal design, premium fit",
      price: 45.99,
    },
    {
      id: "default-eight-series-3",
      name: "8 Series #3",
      description: "Minimal design, premium fit",
      price: 45.99,
    },
  ],
  oly: [
    {
      id: "default-oly-heritage-1",
      name: "Oly Heritage #1",
      description: "Embroidered, classic fit",
      price: 69.99,
    },
    {
      id: "default-oly-heritage-2",
      name: "Oly Heritage #2",
      description: "Embroidered, classic fit",
      price: 69.99,
    },
    {
      id: "default-oly-heritage-3",
      name: "Oly Heritage #3",
      description: "Embroidered, classic fit",
      price: 69.99,
    },
  ],
};

export const getDefaultFeaturedItems = (slug?: string) =>
  (slug ? defaultFeaturedItemsBySlug[slug] : undefined) || [];