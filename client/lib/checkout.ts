const isSafeCheckoutImage = (image?: string | null) => {
  if (!image) {
    return false;
  }

  const normalized = image.trim();
  if (!normalized || normalized.startsWith("data:")) {
    return false;
  }

  return normalized.startsWith("/") || /^https?:\/\//i.test(normalized);
};

export const buildCheckoutUrl = (options: {
  item: string;
  collection: string;
  price: number;
  image?: string | null;
}) => {
  const params = new URLSearchParams();
  params.set("item", options.item);
  params.set("collection", options.collection);
  params.set("price", String(options.price));

  if (isSafeCheckoutImage(options.image)) {
    params.set("image", options.image!.trim());
  }

  return `/checkout?${params.toString()}`;
};
