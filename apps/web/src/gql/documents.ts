import { gql } from '@apollo/client';

export const GET_HOME_STATS = gql`
  query GetHomeStats {
    productsCount
    brands {
      id
    }
    categories {
      id
    }
  }
`;

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts {
    products(limit: 6, sortBy: "created_at", sortOrder: DESC) {
      id
      name
      slug
      price
      stock
      status
      imageUrl
      avgRating
      reviewCount
      brand {
        id
        name
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts(
    $brandId: ID
    $categoryId: ID
    $status: ProductStatus
    $minPrice: Float
    $maxPrice: Float
    $search: String
    $sortBy: String
    $sortOrder: SortOrder
    $limit: Int
    $offset: Int
  ) {
    products(
      brandId: $brandId
      categoryId: $categoryId
      status: $status
      minPrice: $minPrice
      maxPrice: $maxPrice
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
      limit: $limit
      offset: $offset
    ) {
      id
      name
      slug
      price
      stock
      status
      imageUrl
      avgRating
      reviewCount
      brand {
        id
        name
      }
      category {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      price
      stock
      status
      imageUrl
      images
      avgRating
      reviewCount
      brand {
        id
        name
      }
      category {
        id
        name
        slug
      }
      specs {
        id
        key
        value
        unit
        displayOrder
      }
      reviews {
        id
        productId
        rating
        title
        comment
        isVerified
        createdAt
        user {
          id
          username
        }
      }
    }
  }
`;

export const GET_BRANDS = gql`
  query GetBrands {
    brands {
      id
      name
      slug
      country
      foundedYear
      logoUrl
      products {
        id
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      icon
      products {
        id
      }
    }
  }
`;

export const GET_REVIEWS = gql`
  query GetReviews($productId: ID!) {
    reviews(productId: $productId) {
      id
      productId
      rating
      title
      comment
      isVerified
      createdAt
      user {
        id
        username
      }
    }
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      productId
      rating
      title
      comment
      isVerified
      createdAt
      user {
        id
        username
      }
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $input: UpdateReviewInput!) {
    updateReview(id: $id, input: $input) {
      id
      rating
      title
      comment
      updatedAt
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export const GET_USER_WISHLIST = gql`
  query GetUserWishlist {
    wishlist {
      id
      productId
      addedAt
      product {
        id
        name
        slug
        price
        stock
        status
        imageUrl
      }
    }
  }
`;

export const IS_PRODUCT_WISHLISTED = gql`
  query IsProductWishlisted($productId: ID!) {
    isProductWishlisted(productId: $productId)
  }
`;

export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: ID!) {
    addToWishlist(productId: $productId) {
      id
      productId
      addedAt
    }
  }
`;

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: ID!) {
    removeFromWishlist(productId: $productId)
  }
`;

export const PRODUCT_UPDATED_SUBSCRIPTION = gql`
  subscription ProductUpdated($productId: ID) {
    productUpdated(productId: $productId) {
      id
      name
      slug
      price
      stock
      status
      brand {
        id
        name
      }
      category {
        id
        name
        slug
      }
      updatedAt
    }
  }
`;

export const PRICE_UPDATED_SUBSCRIPTION = gql`
  subscription PriceUpdated($productId: ID) {
    priceUpdated(productId: $productId) {
      oldPrice
      newPrice
      product {
        id
        name
        slug
        price
        stock
        status
        brand {
          id
          name
        }
        category {
          id
          name
          slug
        }
        updatedAt
      }
    }
  }
`;

export const PRODUCT_STOCK_CHANGED_SUBSCRIPTION = gql`
  subscription ProductStockChanged($productId: ID) {
    productStockChanged(productId: $productId) {
      id
      name
      slug
      price
      stock
      status
      brand {
        id
        name
      }
      category {
        id
        name
        slug
      }
      updatedAt
    }
  }
`;

export const REVIEW_ADDED_SUBSCRIPTION = gql`
  subscription ReviewAdded($productId: ID!) {
    reviewAdded(productId: $productId) {
      id
      productId
      rating
      title
      comment
      isVerified
      createdAt
      user {
        id
        username
      }
    }
  }
`;

export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    productsCount
    brands {
      id
    }
    lowStockProductsCount(threshold: 10)
    reviewsCount
  }
`;

export const GET_ADMIN_RECENT_ACTIVITY = gql`
  query GetAdminRecentActivity {
    recentProducts: products(limit: 5, sortBy: "created_at", sortOrder: DESC) {
      id
      name
      slug
      createdAt
    }
    recentReviews: reviews(limit: 5) {
      id
      title
      comment
      createdAt
      product {
        id
        name
        slug
      }
      user {
        id
        username
      }
    }
  }
`;

export const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts($search: String, $limit: Int, $offset: Int) {
    products(search: $search, sortBy: "created_at", sortOrder: DESC, limit: $limit, offset: $offset) {
      id
      name
      slug
      imageUrl
      price
      stock
      status
      brand {
        id
        name
      }
      category {
        id
        name
      }
    }
    productsCount
  }
`;

export const GET_ADMIN_PRODUCT_FORM = gql`
  query GetAdminProductForm($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      price
      stock
      status
      brandId
      categoryId
      imageUrl
      images
      releaseDate
      specs(limit: 200, offset: 0) {
        id
        key
        value
        unit
        displayOrder
      }
    }
    brands {
      id
      name
    }
    categories {
      id
      name
      slug
    }
  }
`;

export const GET_ADMIN_PRODUCT_CREATE_LOOKUPS = gql`
  query GetAdminProductCreateLookups {
    brands {
      id
      name
    }
    categories {
      id
      name
      slug
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      slug
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const CREATE_PRODUCT_SPEC = gql`
  mutation CreateProductSpec($input: CreateProductSpecInput!) {
    createProductSpec(input: $input) {
      id
      productId
      key
      value
      unit
      displayOrder
    }
  }
`;

export const DELETE_PRODUCT_SPEC = gql`
  mutation DeleteProductSpec($id: ID!) {
    deleteProductSpec(id: $id)
  }
`;

export const GET_ADMIN_BRANDS = gql`
  query GetAdminBrands {
    brands {
      id
      name
      slug
      country
      foundedYear
      logoUrl
      websiteUrl
      description
      products {
        id
      }
    }
  }
`;

export const GET_ADMIN_BRAND_BY_ID = gql`
  query GetAdminBrandById($id: ID!) {
    brand(id: $id) {
      id
      name
      slug
      country
      foundedYear
      logoUrl
      websiteUrl
      description
    }
  }
`;

export const CREATE_BRAND = gql`
  mutation CreateBrand($input: CreateBrandInput!) {
    createBrand(input: $input) {
      id
      name
      slug
    }
  }
`;

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($id: ID!, $input: UpdateBrandInput!) {
    updateBrand(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

export const DELETE_BRAND = gql`
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id)
  }
`;

export const GET_ADMIN_CATEGORIES = gql`
  query GetAdminCategories {
    categories {
      id
      name
      slug
      icon
      parentId
      parent {
        id
        name
      }
      children(limit: 100, offset: 0) {
        id
        name
        slug
        icon
        parentId
        products {
          id
        }
      }
      products {
        id
      }
    }
  }
`;

export const GET_ADMIN_CATEGORY_BY_ID = gql`
  query GetAdminCategoryById($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      icon
      description
      parentId
    }
    categories {
      id
      name
      parentId
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const GET_ADMIN_REVIEWS = gql`
  query GetAdminReviews($limit: Int, $offset: Int) {
    reviews(limit: $limit, offset: $offset) {
      id
      rating
      title
      comment
      isVerified
      createdAt
      product {
        id
        name
        slug
      }
      user {
        id
        username
      }
    }
    reviewsCount
  }
`;
