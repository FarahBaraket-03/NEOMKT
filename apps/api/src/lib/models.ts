export type UserRole = 'PUBLIC' | 'USER' | 'ADMIN';
export type ProductStatus = 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';

export interface BrandRow {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logo_url: string | null;
  website_url: string | null;
  founded_year: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  created_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  stock: number;
  status: ProductStatus;
  brand_id: string;
  category_id: string;
  image_url: string | null;
  images: string[] | null;
  release_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductSpecRow {
  id: string;
  product_id: string;
  key: string;
  value: string;
  unit: string | null;
  display_order: number;
}

export interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItemRow {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  foundedYear: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  icon: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  brandId: string;
  categoryId: string;
  imageUrl: string | null;
  images: string[];
  releaseDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpec {
  id: string;
  productId: string;
  key: string;
  value: string;
  unit: string | null;
  displayOrder: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
