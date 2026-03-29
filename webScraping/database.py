"""
Database operations for storing scraped data
Safe, efficient bulk operations with validation
"""

import logging
import os
from typing import List, Dict, Optional, Tuple
from uuid import UUID
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages database operations for scraped data"""

    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        """
        Initialize database manager
        
        For production use with Supabase:
        from supabase import create_client
        self.client = create_client(supabase_url, supabase_key)
        """
        # Use provided credentials or read from environment
        self.supabase_url = supabase_url or os.getenv('SUPABASE_URL')
        self.supabase_key = supabase_key or os.getenv('SUPABASE_KEY')
        self.client = None
        
        # For testing/demo purposes
        self.data = {
            'brands': {},
            'categories': {},
            'products': {},
        }

    def connect(self):
        """Connect to Supabase"""
        if self.supabase_url and self.supabase_key:
            try:
                from supabase import create_client
                self.client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Connected to Supabase")
            except Exception as e:
                logger.error(f"Failed to connect to Supabase: {e}")
                logger.info("Using in-memory storage for demo")
        else:
            logger.warning("Supabase credentials not provided, using in-memory storage")

    # BRANDS Operations
    def get_or_create_brand(self, brand_name: str, country: str = None) -> Optional[UUID]:
        """Get existing brand or create new one"""
        try:
            # Check if brand exists
            if self.client:
                query = self.client.table('brands').select('id').eq('name', brand_name)
                existing = query.execute()
                if existing.data:
                    return UUID(existing.data[0]['id'])
            else:
                # Demo mode
                if brand_name in self.data['brands']:
                    return self.data['brands'][brand_name]['id']

            # Create new brand
            new_brand = {
                'name': brand_name,
                'slug': self._slugify(brand_name),
                'country': country,
                'logo_url': None,
                'website_url': None,
                'founded_year': None,
                'description': f"Tech brand: {brand_name}",
            }

            if self.client:
                result = self.client.table('brands').insert(new_brand).execute()
                brand_id = UUID(result.data[0]['id'])
                logger.info(f"Created brand: {brand_name} ({brand_id})")
                return brand_id
            else:
                # Demo mode
                import uuid as uuid_module
                brand_id = uuid_module.uuid4()
                new_brand['id'] = brand_id
                self.data['brands'][brand_name] = new_brand
                logger.info(f"Created brand (demo): {brand_name} ({brand_id})")
                return brand_id

        except Exception as e:
            logger.error(f"Error getting/creating brand '{brand_name}': {e}")
            return None

    # CATEGORIES Operations
    def get_or_create_category(
        self,
        category_name: str,
        description: str = None,
        parent_id: UUID = None
    ) -> Optional[UUID]:
        """Get existing category or create new one"""
        try:
            # Check if category exists
            if self.client:
                query = self.client.table('categories').select('id').eq('slug', self._slugify(category_name))
                existing = query.execute()
                if existing.data:
                    return UUID(existing.data[0]['id'])
            else:
                # Demo mode
                slug = self._slugify(category_name)
                for cat in self.data['categories'].values():
                    if cat['slug'] == slug:
                        return cat['id']

            # Create new category
            new_category = {
                'name': category_name,
                'slug': self._slugify(category_name),
                'description': description or f"Category: {category_name}",
                'parent_id': parent_id,
                'icon': None,
            }

            if self.client:
                result = self.client.table('categories').insert(new_category).execute()
                category_id = UUID(result.data[0]['id'])
                logger.info(f"Created category: {category_name} ({category_id})")
                return category_id
            else:
                # Demo mode
                import uuid as uuid_module
                category_id = uuid_module.uuid4()
                new_category['id'] = category_id
                self.data['categories'][category_name] = new_category
                logger.info(f"Created category (demo): {category_name} ({category_id})")
                return category_id

        except Exception as e:
            logger.error(f"Error getting/creating category '{category_name}': {e}")
            return None

    # PRODUCTS Operations
    def insert_products(self, products: List[Dict]) -> Tuple[int, int]:
        """
        Bulk insert products
        Returns (inserted_count, skipped_count)
        """
        inserted = 0
        skipped = 0

        for product in products:
            try:
                # Get or create brand
                brand_name = product.get('brand_name', 'Unknown')
                brand_id = self.get_or_create_brand(brand_name)
                if not brand_id:
                    logger.warning(f"Skipping product {product['name']}: no brand")
                    skipped += 1
                    continue

                # Get or create category
                category_name = product.get('category', 'software')
                category_id = self.get_or_create_category(category_name)
                if not category_id:
                    logger.warning(f"Skipping product {product['name']}: no category")
                    skipped += 1
                    continue

                # Prepare product record
                product_record = {
                    'name': product['name'],
                    'slug': product.get('slug', self._slugify(product['name'])),
                    'description': product.get('description', ''),
                    'price': float(product.get('price', 0)),
                    'stock': product.get('stock', 0),
                    'status': 'ACTIVE',
                    'brand_id': str(brand_id),
                    'category_id': str(category_id),
                    'image_url': product.get('image_url'),
                    'images': product.get('images', []),
                    'release_date': product.get('release_date'),
                }

                # Insert product
                if self.client:
                    result = self.client.table('products').insert(product_record).execute()
                    product_id = UUID(result.data[0]['id'])
                    logger.info(f"Inserted product: {product['name']}")
                else:
                    # Demo mode
                    import uuid as uuid_module
                    product_id = uuid_module.uuid4()
                    product_record['id'] = product_id
                    self.data['products'][product['name']] = product_record
                    logger.info(f"Inserted product (demo): {product['name']}")

                # Insert specs if available
                specs = product.get('specs', {})
                if specs and product_id:
                    self._insert_specs(product_id, specs)

                # Insert reviews if available
                reviews = product.get('reviews', [])
                if reviews and product_id:
                    self._insert_reviews(product_id, reviews)

                inserted += 1

            except Exception as e:
                logger.error(f"Error inserting product {product.get('name', 'unknown')}: {e}")
                skipped += 1

        return inserted, skipped

    def _insert_specs(self, product_id: UUID, specs: Dict):
        """Insert product specifications"""
        try:
            for key, value in specs.items():
                spec_record = {
                    'product_id': str(product_id),
                    'key': key,
                    'value': str(value),
                    'unit': None,
                    'display_order': 0,
                }

                if self.client:
                    self.client.table('specs').insert(spec_record).execute()

            logger.debug(f"Inserted {len(specs)} specs for product {product_id}")

        except Exception as e:
            logger.error(f"Error inserting specs for product {product_id}: {e}")

    def _insert_reviews(self, product_id: UUID, reviews: List[Dict], user_id: str = None):
        """Insert product reviews"""
        try:
            # Use default reviewer user ID if not provided
            if not user_id:
                user_id = os.getenv('DEFAULT_REVIEWER_ID', '00000000-0000-0000-0000-000000000000')
            
            for review in reviews:
                review_record = {
                    'product_id': str(product_id),
                    'user_id': user_id,
                    'rating': int(review.get('rating', 5)),
                    'title': review.get('title', ''),
                    'comment': review.get('comment', 'Great product!'),
                    'is_verified': False,
                    'created_at': review.get('created_at'),
                }

                if self.client:
                    self.client.table('reviews').insert(review_record).execute()

            logger.debug(f"Inserted {len(reviews)} reviews for product {product_id}")

        except Exception as e:
            logger.error(f"Error inserting reviews for product {product_id}: {e}")

    def count_products(self) -> int:
        """Count total products in database"""
        try:
            if self.client:
                result = self.client.table('products').select('id', count='exact').execute()
                return result.count or 0
            else:
                return len(self.data['products'])
        except Exception as e:
            logger.error(f"Error counting products: {e}")
            return 0

    @staticmethod
    def _slugify(text: str) -> str:
        """Convert text to URL slug"""
        import re
        text = text.lower().strip()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-')

    def get_summary(self) -> Dict:
        """Get database summary"""
        try:
            if self.client:
                brands_count = self.client.table('brands').select('id', count='exact').execute().count or 0
                categories_count = self.client.table('categories').select('id', count='exact').execute().count or 0
                products_count = self.client.table('products').select('id', count='exact').execute().count or 0
            else:
                brands_count = len(self.data['brands'])
                categories_count = len(self.data['categories'])
                products_count = len(self.data['products'])

            return {
                'brands': brands_count,
                'categories': categories_count,
                'products': products_count,
            }

        except Exception as e:
            logger.error(f"Error getting database summary: {e}")
            return {}
