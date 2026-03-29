export interface Brand {
  id: string;
  name: string;
  slug: string;
  country?: string | null;
  foundedYear?: number | null;
  logoUrl?: string | null;
  products?: { id: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  products?: { id: string }[];
}

export interface ProductSpec {
  id: string;
  key: string;
  value: string;
  unit?: string | null;
  displayOrder: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
  imageUrl?: string | null;
  images: string[];
  avgRating: number;
  reviewCount: number;
  brand: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  specs?: ProductSpec[];
  reviews?: ProductReview[];
}
