import type {
  Brand,
  BrandRow,
  Category,
  CategoryRow,
  Product,
  ProductRow,
  ProductSpec,
  ProductSpecRow,
  Review,
  ReviewRow,
  User,
  UserRow,
  WishlistItem,
  WishlistItemRow,
} from './models.js';

export const mapBrand = (row: BrandRow): Brand => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  country: row.country,
  logoUrl: row.logo_url,
  websiteUrl: row.website_url,
  foundedYear: row.founded_year,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  parentId: row.parent_id,
  icon: row.icon,
  createdAt: row.created_at,
});

export const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  price: Number(row.price),
  stock: row.stock,
  status: row.status,
  brandId: row.brand_id,
  categoryId: row.category_id,
  imageUrl: row.image_url,
  images: row.images ?? [],
  releaseDate: row.release_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapProductSpec = (row: ProductSpecRow): ProductSpec => ({
  id: row.id,
  productId: row.product_id,
  key: row.key,
  value: row.value,
  unit: row.unit,
  displayOrder: row.display_order,
});

export const mapReview = (row: ReviewRow): Review => ({
  id: row.id,
  productId: row.product_id,
  userId: row.user_id,
  rating: row.rating,
  title: row.title,
  comment: row.comment,
  isVerified: row.is_verified,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapWishlistItem = (row: WishlistItemRow): WishlistItem => ({
  id: row.id,
  userId: row.user_id,
  productId: row.product_id,
  addedAt: row.added_at,
});

export const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  username: row.username,
  role: row.role,
  avatarUrl: row.avatar_url,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
