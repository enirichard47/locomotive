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
  arsenal: [
    {
      id: "default-arsenal-jersey-1",
      name: "Arsenal Jersey 1",
      description: "Performance fit, breathable",
      price: 79.99,
      image: "/locomotive_logo.png",
    },
    {
      id: "default-arsenal-jersey-2",
      name: "Arsenal Jersey 2",
      description: "Performance fit, breathable",
      price: 79.99,
      image: "/locomotive_logo.png",
    },
    {
      id: "default-arsenal-jersey-3",
      name: "Arsenal Jersey 3",
      description: "Performance fit, breathable",
      price: 79.99,
      image: "/locomotive_logo.png",
    },
  ],
  combat: [
    {
      id: "default-combat-tee-1",
      name: "Combat Tee 1",
      description: "Premium cotton, oversized fit",
      price: 49.99,
      image: "/locomotive_logo.png",
    },
    {
      id: "default-combat-tee-2",
      name: "Combat Tee 2",
      description: "Premium cotton, oversized fit",
      price: 49.99,
      image: "/locomotive_logo.png",
    },
    {
      id: "default-combat-tee-3",
      name: "Combat Tee 3",
      description: "Premium cotton, oversized fit",
      price: 49.99,
      image: "/locomotive_logo.png",
    },
  ],
  eight: [
    {
      id: "default-eight-series-1",
      name: "8 Series #1",
      description: "Minimal design, premium fit",
      price: 45.99,
      image: "/locomotive_logo.png",
    },
    {
      id: "default-eight-series-2",
      name: "8 Series #2",
      description: "Minimal design, premium fit",
      price: 45.99,
      image: "/locomotive_logo.png",
    },
    {
      id: "default-eight-series-3",
      name: "8 Series #3",
      description: "Minimal design, premium fit",
      price: 45.99,
      image: "/locomotive_logo.png",
    },
  ],
  oly: [
    {
      id: "default-oly-heritage-1",
      name: "Oly Heritage #1",
      description: "Embroidered, classic fit",
      price: 69.99,
      image: "/locomotive_logo.png",
    },
    {
      id: "default-oly-heritage-2",
      name: "Oly Heritage #2",
      description: "Embroidered, classic fit",
      price: 69.99,
      image: "/locomotive_logo.png",
    },
    {
      id: "default-oly-heritage-3",
      name: "Oly Heritage #3",
      description: "Embroidered, classic fit",
      price: 69.99,
      image: "/locomotive_logo.png",
    },
  ],
};

export const getDefaultFeaturedItems = (slug?: string) =>
  (slug ? defaultFeaturedItemsBySlug[slug] : undefined) || [];