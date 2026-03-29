"""
E-commerce API clients for consumer tech products
Fetches real product data from Amazon and AliExpress via RapidAPI
"""

import logging
import os
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RateLimiter:
    """Token bucket rate limiter for API calls"""
    
    def __init__(self, requests_per_month: int = 100):
        self.max_tokens = requests_per_month
        self.tokens = requests_per_month
        self.refill_time = datetime.now()
        self.refill_interval = timedelta(days=30)
    
    def check_rate_limit(self) -> bool:
        """Check if request is allowed"""
        # Refill tokens monthly
        if datetime.now() - self.refill_time > self.refill_interval:
            self.tokens = self.max_tokens
            self.refill_time = datetime.now()
        
        if self.tokens > 0:
            self.tokens -= 1
            return True
        return False
    
    def get_remaining(self) -> int:
        """Get remaining requests for this month"""
        return self.tokens


class AmazonProductClient:
    """Fetches consumer tech products from Amazon via RapidAPI"""
    
    def __init__(self):
        self.api_key = os.getenv('AMAZON_RAPIDAPI_KEY')
        self.api_host = "real-time-amazon-data.p.rapidapi.com"
        self.base_url = "https://real-time-amazon-data.p.rapidapi.com"
        self.rate_limiter = RateLimiter(requests_per_month=50)  # Reserve some for AliExpress
        
        if not self.api_key:
            logger.warning("Amazon API key not found in AMAZON_RAPIDAPI_KEY")
    
    def fetch_products(self, search_query: str, category: str = None, limit: int = 10) -> List[Dict]:
        """
        Fetch products matching search query
        
        Args:
            search_query: Product search term (e.g., "laptop", "smartphone")
            category: Amazon category (optional)
            limit: Max results per query
            
        Returns:
            List of product data dicts
        """
        if not self.rate_limiter.check_rate_limit():
            logger.warning(f"Amazon API: Rate limit exceeded. Remaining: {self.rate_limiter.get_remaining()}")
            return []
        
        try:
            headers = {
                'x-rapidapi-key': self.api_key,
                'x-rapidapi-host': self.api_host,
                'Content-Type': 'application/json'
            }
            
            params = {
                'query': search_query,
                'page': '1',
                'country': 'US'
            }
            
            logger.info(f"Fetching Amazon products: {search_query}")
            response = requests.get(
                f"{self.base_url}/search",
                headers=headers,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            products = data.get('data', {}).get('products', [])[:limit]
            
            logger.info(f"✓ Fetched {len(products)} Amazon products for '{search_query}'")
            return products
            
        except Exception as e:
            logger.error(f"Amazon API error: {e}")
            return []
    
    def fetch_category_products(self, categories: List[Dict]) -> List[Dict]:
        """
        Fetch products across multiple tech categories
        
        Args:
            categories: List of {'name': 'product', 'query': 'search term'} dicts
            
        Returns:
            All fetched products
        """
        all_products = []
        
        for category in categories:
            if not self.rate_limiter.check_rate_limit():
                logger.warning("Amazon: Monthly rate limit reached, stopping")
                break
            
            query = category.get('query', category.get('name'))
            products = self.fetch_products(query, limit=5)
            all_products.extend(products)
        
        return all_products


class AliExpressProductClient:
    """Fetches consumer tech products from AliExpress via RapidAPI"""
    
    def __init__(self):
        self.api_key = os.getenv('ALIEXPRESS_RAPIDAPI_KEY')
        self.api_host = "aliexpress-datahub.p.rapidapi.com"
        self.base_url = "https://aliexpress-datahub.p.rapidapi.com"
        self.rate_limiter = RateLimiter(requests_per_month=50)  # Reserve some for Amazon
        
        if not self.api_key:
            logger.warning("AliExpress API key not found in ALIEXPRESS_RAPIDAPI_KEY")
    
    def fetch_products(self, search_query: str, limit: int = 10) -> List[Dict]:
        """
        Fetch products from AliExpress
        
        Args:
            search_query: Product search term
            limit: Max results
            
        Returns:
            List of product data dicts
        """
        if not self.rate_limiter.check_rate_limit():
            logger.warning(f"AliExpress API: Rate limit exceeded. Remaining: {self.rate_limiter.get_remaining()}")
            return []
        
        try:
            headers = {
                'x-rapidapi-key': self.api_key,
                'x-rapidapi-host': self.api_host,
                'Content-Type': 'application/json'
            }
            
            params = {
                'keywords': search_query,
                'page': '1',
                'sort': 'popularity'
            }
            
            logger.info(f"Fetching AliExpress products: {search_query}")
            response = requests.get(
                f"{self.base_url}/search",
                headers=headers,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            products = data.get('data', {}).get('items', [])[:limit]
            
            logger.info(f"✓ Fetched {len(products)} AliExpress products for '{search_query}'")
            return products
            
        except Exception as e:
            logger.error(f"AliExpress API error: {e}")
            return []
    
    def fetch_category_products(self, categories: List[Dict]) -> List[Dict]:
        """Fetch products across multiple categories"""
        all_products = []
        
        for category in categories:
            if not self.rate_limiter.check_rate_limit():
                logger.warning("AliExpress: Monthly rate limit reached, stopping")
                break
            
            query = category.get('query', category.get('name'))
            products = self.fetch_products(query, limit=5)
            all_products.extend(products)
        
        return all_products


class ConsumerTechFetcher:
    """Orchestrates fetching consumer tech products from multiple e-commerce APIs"""
    
    def __init__(self):
        self.amazon = AmazonProductClient()
        self.aliexpress = AliExpressProductClient()
        
        # Product categories to fetch
        self.categories = [
            {'name': 'laptops', 'query': 'laptop computer'},
            {'name': 'smartphones', 'query': 'smartphone mobile phone'},
            {'name': 'keyboards', 'query': 'mechanical keyboard'},
            {'name': 'storage', 'query': 'SSD external hard drive'},
            {'name': 'headphones', 'query': 'wireless headphones'},
        ]
    
    def fetch_all_products(self) -> Dict[str, List]:
        """Fetch products from all sources"""
        logger.info("=" * 60)
        logger.info("Fetching Consumer Tech Products")
        logger.info("=" * 60)
        
        results = {
            'amazon': [],
            'aliexpress': [],
        }
        
        # Fetch from Amazon
        if self.amazon.api_key:
            results['amazon'] = self.amazon.fetch_category_products(self.categories)
        else:
            logger.warning("Skipping Amazon (no API key)")
        
        # Fetch from AliExpress
        if self.aliexpress.api_key:
            results['aliexpress'] = self.aliexpress.fetch_category_products(self.categories)
        else:
            logger.warning("Skipping AliExpress (no API key)")
        
        return results
    
    def get_total_products(self, results: Dict[str, List]) -> int:
        """Get total products across all sources"""
        return sum(len(products) for products in results.values())
