"""
Data mapper for e-commerce products
Converts Amazon and AliExpress API responses to Supabase schema
"""

import logging
import re
from typing import Dict, List, Optional
from decimal import Decimal

logger = logging.getLogger(__name__)


class EcommerceDataMapper:
    """Maps e-commerce product data to Supabase schema"""
    
    # Category mapping from API to database
    CATEGORY_MAP = {
        'laptop': 'laptops',
        'computer': 'laptops',
        'smartphone': 'smartphones',
        'mobile': 'smartphones',
        'phone': 'smartphones',
        'tablet': 'tablets',
        'keyboard': 'keyboards',
        'ssd': 'storage',
        'hard drive': 'storage',
        'storage': 'storage',
        'headphone': 'headphones',
        'earbuds': 'headphones',
        'monitor': 'monitors',
        'display': 'monitors',
        'smartwatch': 'smartwatches',
        'watch': 'smartwatches',
        'camera': 'cameras',
    }
    
    def __init__(self):
        self.mappings_count = 0
        self.errors_count = 0
    
    def map_amazon_product(self, product: Dict, source: str = 'amazon') -> Optional[Dict]:
        """
        Map Amazon product to schema
        
        Expected Amazon API fields:
        - asin: Product ID
        - product_title: Product name
        - product_price: Price (may need parsing)
        - product_original_price: Original price
        - product_rating: Rating
        - product_num_ratings: Number of ratings
        - product_url: Link
        - product_photo: Image URL
        """
        try:
            # Extract name and category
            title = product.get('product_title', 'Unknown Product')
            
            # Parse price - Amazon may return "$123.45" or similar
            price_str = product.get('product_price', '0')
            price = self._parse_price(price_str)
            
            # Determine category from title
            category = self._infer_category(title)
            
            # Extract brand from title or use store
            brand_name = self._extract_brand_from_title(title)
            
            # Set product image
            image_url = product.get('product_photo')
            
            mapped = {
                'name': title[:255],  # Truncate to DB limit
                'slug': self._slugify(title),
                'description': f"Amazon Product: {title}. Rating: {product.get('product_rating', 'N/A')}/5",
                'brand_name': brand_name,
                'category': category,
                'price': price,
                'stock': 1,  # Default stock
                'image_url': image_url,
                'images': [image_url] if image_url else [],
                'release_date': None,
                'specs': {
                    'rating': str(product.get('product_rating', 'N/A')),
                    'num_ratings': str(product.get('product_num_ratings', 0)),
                    'asin': product.get('asin', ''),
                    'source': source,
                },
                'source_url': product.get('product_url'),
            }
            
            self.mappings_count += 1
            logger.debug(f"Mapped Amazon product: {title}")
            return mapped
            
        except Exception as e:
            self.errors_count += 1
            logger.error(f"Error mapping Amazon product: {e}")
            return None
    
    def map_aliexpress_product(self, product: Dict, source: str = 'aliexpress') -> Optional[Dict]:
        """
        Map AliExpress product to schema
        
        Expected AliExpress API fields vary by endpoint
        Common: title, price, original_price, rating, image, url
        """
        try:
            title = product.get('title') or product.get('productTitle', 'Unknown Product')
            
            # Parse price
            price_str = product.get('price') or product.get('productPrice', '0')
            price = self._parse_price(price_str)
            
            # Category inference
            category = self._infer_category(title)
            
            # Brand extraction
            brand_name = self._extract_brand_from_title(title)
            
            # Image
            image_url = product.get('image') or product.get('productImage')
            
            mapped = {
                'name': title[:255],
                'slug': self._slugify(title),
                'description': f"AliExpress Product: {title}. {'Rating: ' + str(product.get('rating', 'N/A')) if product.get('rating') else ''}",
                'brand_name': brand_name,
                'category': category,
                'price': price,
                'stock': 1,  # Default stock
                'image_url': image_url,
                'images': [image_url] if image_url else [],
                'release_date': None,
                'specs': {
                    'rating': str(product.get('rating', 'N/A')),
                    'orders': str(product.get('orders', 0)),
                    'source': source,
                },
                'source_url': product.get('url') or product.get('productUrl'),
            }
            
            self.mappings_count += 1
            logger.debug(f"Mapped AliExpress product: {title}")
            return mapped
            
        except Exception as e:
            self.errors_count += 1
            logger.error(f"Error mapping AliExpress product: {e}")
            return None
    
    def map_all_products(self, results: Dict[str, List]) -> List[Dict]:
        """
        Map all products from all sources
        
        Args:
            results: Dict with 'amazon' and 'aliexpress' product lists
            
        Returns:
            List of normalized products
        """
        normalized = []
        
        # Map Amazon products
        for product in results.get('amazon', []):
            mapped = self.map_amazon_product(product)
            if mapped:
                normalized.append(mapped)
        
        # Map AliExpress products
        for product in results.get('aliexpress', []):
            mapped = self.map_aliexpress_product(product)
            if mapped:
                normalized.append(mapped)
        
        logger.info(f"Mapped {len(normalized)} products ({self.errors_count} errors)")
        return normalized
    
    @staticmethod
    def _parse_price(price_str: str) -> float:
        """Extract numeric price from string like '$123.45' or '￥1234'"""
        if not price_str:
            return 0.0
        
        # Remove currency symbols and extract numbers
        match = re.search(r'[\d.]+', str(price_str).replace(',', ''))
        if match:
            try:
                return float(match.group())
            except ValueError:
                return 0.0
        return 0.0
    
    @staticmethod
    def _slugify(text: str) -> str:
        """Convert text to URL-safe slug"""
        text = text.lower()
        text = re.sub(r'[^a-z0-9]+', '-', text)
        text = text.strip('-')
        return text[:100]  # Truncate
    
    @staticmethod
    def _infer_category(title: str) -> str:
        """Infer product category from title"""
        title_lower = title.lower()
        
        for keyword, category in EcommerceDataMapper.CATEGORY_MAP.items():
            if keyword in title_lower:
                return category
        
        return 'peripherals'  # Default category
    
    @staticmethod
    def _extract_brand_from_title(title: str) -> str:
        """Try to extract brand from product title"""
        # Known brands to look for
        brands = [
            'Apple', 'Microsoft', 'Google', 'Samsung', 'Sony', 'Intel', 'AMD',
            'NVIDIA', 'Qualcomm', 'Lenovo', 'Dell', 'HP', 'ASUS', 'Razer',
            'Canon', 'Nikon', 'DJI', 'GoPro', 'Fitbit', 'Garmin', 'OnePlus',
            'Xiaomi', 'Huawei', 'Realme', 'Oppo', 'Vivo', 'Nothing', 'Motorola',
            'LG', 'Panasonic', 'JBL', 'Bose', 'Sennheiser', 'Beats',
            'LogitechLogitech',  # Misspelled commonly
        ]
        
        for brand in brands:
            if brand.lower() in title.lower():
                return brand
        
        # Extract first word as fallback
        first_word = title.split()[0]
        return first_word if len(first_word) > 2 else 'Generic'
