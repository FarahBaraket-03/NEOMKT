"""
Map API responses to database schema
"""

import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from uuid import UUID
import json

from config import TECH_CATEGORIES, TRUSTED_BRANDS


class DataMapper:
    """Maps API responses to database schema format"""

    @staticmethod
    def slugify(text: str) -> str:
        """Convert text to URL slug"""
        text = text.lower().strip()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-')

    @staticmethod
    def validate_price(price: Optional[float]) -> Optional[float]:
        """Validate and normalize price"""
        if price is None:
            return None
        try:
            price = float(price)
            if price < 0:
                return None
            return round(price, 2)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def validate_url(url: Optional[str]) -> Optional[str]:
        """Validate URL format"""
        if not url:
            return None
        url = str(url).strip()
        if url.startswith(('http://', 'https://', '//')):
            return url
        if not url.startswith('http'):
            url = 'https://' + url
        return url if len(url) < 2048 else None

    @classmethod
    def map_product_hunt_product(
        cls,
        api_product: Dict,
        brand_id: Optional[UUID] = None
    ) -> Optional[Dict]:
        """
        Map Product Hunt API response to product schema
        
        API Response: https://api.producthunt.com/v2/posts
        """
        try:
            name = api_product.get('name', '').strip()
            if not name or len(name) > 255:
                return None

            # Basic product mapping
            product = {
                'name': name,
                'slug': cls.slugify(name),
                'description': api_product.get('tagline', '') or api_product.get('description', ''),
                'price': 0.0,  # Product Hunt doesn't provide pricing
                'image_url': api_product.get('thumbnail', {}).get('image_url'),
                'external_url': api_product.get('url'),
                'category': 'software',  # Most PH products are software
                'brand_name': api_product.get('maker', {}).get('name', 'Unknown'),
            }

            # Validate required fields
            if not product['description'] or len(product['description']) < 10:
                return None

            return product

        except Exception as e:
            print(f"Error mapping Product Hunt product: {e}")
            return None

    @classmethod
    def map_github_repo(cls, api_repo: Dict) -> Optional[Dict]:
        """
        Map GitHub API repository to product schema
        
        API Response: https://api.github.com/search/repositories
        """
        try:
            name = api_repo.get('name', '').strip()
            if not name or len(name) > 255:
                return None

            language = api_repo.get('language') or 'Unknown'
            stars = api_repo.get('stargazers_count', 0)
            
            product = {
                'name': name,
                'slug': cls.slugify(name),
                'description': api_repo.get('description', ''),
                'price': 0.0,  # Open source
                'image_url': None,
                'external_url': api_repo.get('html_url'),
                'category': 'developer_tools',
                'brand_name': api_repo.get('owner', {}).get('login', 'Community'),
                'specs': {
                    'language': language,
                    'stars': str(stars),
                    'forks': str(api_repo.get('forks_count', 0)),
                    'license': api_repo.get('license', {}).get('name', 'No license')
                }
            }

            # Validate
            if not product['description'] or len(product['description']) < 10:
                return None

            return product

        except Exception as e:
            print(f"Error mapping GitHub repository: {e}")
            return None

    @classmethod
    def map_rawg_game(cls, api_game: Dict) -> Optional[Dict]:
        """
        Map RAWG video game API response to product schema
        
        API Response: https://api.rawg.io/api/games
        """
        try:
            name = api_game.get('name', '').strip()
            if not name or len(name) > 255:
                return None

            release_date = api_game.get('released')
            platforms = [p.get('platform', {}).get('name', '') for p in api_game.get('platforms', [])]

            product = {
                'name': name,
                'slug': cls.slugify(name),
                'description': f"Popular video game with {api_game.get('reviews_count', 0)} reviews",
                'price': 0.0,  # RAWG doesn't track pricing
                'image_url': api_game.get('background_image'),
                'external_url': f"https://rawg.io/games/{api_game.get('slug')}",
                'category': 'gaming',
                'brand_name': 'Various Publishers',
                'release_date': release_date,
                'specs': {
                    'rating': str(api_game.get('rating', 'N/A')),
                    'platforms': ', '.join(platforms),
                    'genres': ', '.join([g.get('name', '') for g in api_game.get('genres', [])]),
                }
            }

            return product

        except Exception as e:
            print(f"Error mapping RAWG game: {e}")
            return None

    @classmethod
    def normalize_product(
        cls,
        product: Dict,
        brand_uuid: Optional[UUID] = None,
        category_uuid: Optional[UUID] = None
    ) -> Optional[Dict]:
        """
        Normalize product data for database insertion
        Returns a clean product dict ready for DB
        """
        try:
            # Validate required fields
            name = product.get('name', '').strip()
            if not name or len(name) > 255:
                return None

            description = product.get('description', '').strip()
            if not description or len(description) < 10:
                return None

            price = cls.validate_price(product.get('price', 0))
            if price is None:
                return None

            # Build database-ready product
            db_product = {
                'name': name,
                'slug': cls.slugify(name),
                'description': description[:2000],  # Truncate if needed
                'price': price,
                'stock': product.get('stock', 0),
                'status': 'ACTIVE',
                'brand_id': brand_uuid,
                'category_id': category_uuid,
                'image_url': cls.validate_url(product.get('image_url')),
                'images': product.get('images', []),
                'release_date': product.get('release_date'),
            }

            # Add specs if available
            specs = product.get('specs', {})
            if specs and isinstance(specs, dict):
                db_product['specs'] = specs

            return db_product

        except Exception as e:
            print(f"Error normalizing product: {e}")
            return None

    @staticmethod
    def extract_brand_name(product: Dict) -> str:
        """Extract brand name from product"""
        brand = product.get('brand_name', 'Unknown').strip()
        if not brand or len(brand) > 255:
            return 'Unknown'
        return brand

    @staticmethod
    def extract_category(product: Dict) -> str:
        """Extract category from product"""
        category = product.get('category', 'software').lower().strip()
        return category if category in TECH_CATEGORIES else 'software'
