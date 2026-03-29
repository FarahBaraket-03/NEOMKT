"""
Test suite for safe web scraping
"""

import unittest
from unittest.mock import Mock, patch, MagicMock
import json

from data_mapper import DataMapper
from api_clients import RateLimiter, GitHubClient, RAWGClient


class TestDataMapper(unittest.TestCase):
    """Test data mapping functions"""

    def test_slugify(self):
        """Test URL slug generation"""
        assert DataMapper.slugify("Test Product") == "test-product"
        assert DataMapper.slugify("Apple iPhone 15") == "apple-iphone-15"
        assert DataMapper.slugify("  Spaces  ") == "spaces"
        assert DataMapper.slugify("Special@#$Chars!") == "specialchars"

    def test_validate_price(self):
        """Test price validation"""
        assert DataMapper.validate_price(99.99) == 99.99
        assert DataMapper.validate_price(0) == 0
        assert DataMapper.validate_price(-10) is None
        assert DataMapper.validate_price("99.99") == 99.99
        assert DataMapper.validate_price(None) is None
        assert DataMapper.validate_price("invalid") is None

    def test_validate_url(self):
        """Test URL validation"""
        assert DataMapper.validate_url("https://example.com") == "https://example.com"
        assert DataMapper.validate_url("example.com") == "https://example.com"
        assert DataMapper.validate_url("//example.com") == "//example.com"
        assert DataMapper.validate_url(None) is None
        assert DataMapper.validate_url("") is None

    def test_map_github_repo(self):
        """Test GitHub repo mapping"""
        repo = {
            "name": "awesome-project",
            "description": "This is an awesome project for developers",
            "html_url": "https://github.com/user/awesome-project",
            "owner": {"login": "user"},
            "language": "Python",
            "stargazers_count": 1500,
            "forks_count": 300,
            "license": {"name": "MIT"}
        }
        
        product = DataMapper.map_github_repo(repo)
        
        assert product is not None
        assert product['name'] == "awesome-project"
        assert product['slug'] == "awesome-project"
        assert product['category'] == "developer_tools"
        assert product['price'] == 0.0
        assert 'specs' in product

    def test_map_rawg_game(self):
        """Test RAWG game mapping"""
        game = {
            "name": "The Legend of Zelda",
            "released": "1986-02-21",
            "background_image": "https://example.com/image.jpg",
            "slug": "the-legend-of-zelda",
            "rating": 4.5,
            "reviews_count": 500,
            "platforms": [
                {"platform": {"name": "Nintendo Entertainment System"}},
                {"platform": {"name": "Nintendo Switch"}}
            ],
            "genres": [
                {"name": "Adventure"},
                {"name": "Fantasy"}
            ]
        }
        
        product = DataMapper.map_rawg_game(game)
        
        assert product is not None
        assert product['name'] == "The Legend of Zelda"
        assert product['category'] == "gaming"
        assert product['release_date'] == "1986-02-21"
        assert 'specs' in product

    def test_normalize_product(self):
        """Test product normalization"""
        from uuid import uuid4
        
        product = {
            'name': 'Test Product',
            'description': 'This is a test product description',
            'price': 99.99,
            'stock': 100,
            'image_url': 'https://example.com/image.jpg',
            'specs': {'ram': '16GB', 'storage': '512GB'}
        }
        
        brand_id = uuid4()
        category_id = uuid4()
        
        normalized = DataMapper.normalize_product(product, brand_id, category_id)
        
        assert normalized is not None
        assert normalized['name'] == 'Test Product'
        assert normalized['price'] == 99.99
        assert normalized['brand_id'] == brand_id
        assert normalized['category_id'] == category_id
        assert 'specs' in normalized


class TestRateLimiter(unittest.TestCase):
    """Test rate limiting"""

    def test_rate_limiter_initialization(self):
        """Test RateLimiter setup"""
        limiter = RateLimiter(100)
        assert limiter.max_tokens == 100
        assert limiter.tokens == 100

    def test_rate_limiter_tracks_requests(self):
        """Test request tracking"""
        limiter = RateLimiter(100)
        initial_requests = limiter.requests_made
        
        # Simulate requests
        for _ in range(5):
            limiter.wait_if_needed()
        
        assert limiter.requests_made == initial_requests + 5


class TestAPIClients(unittest.TestCase):
    """Test API client initialization"""

    def test_github_client_init(self):
        """Test GitHub client setup"""
        client = GitHubClient()
        assert client.api_name == 'github'
        assert client.base_url == 'https://api.github.com'
        assert client.session is not None

    def test_rawg_client_init(self):
        """Test RAWG client setup"""
        client = RAWGClient()
        assert client.api_name == 'rawg'
        assert client.base_url == 'https://api.rawg.io/api'
        assert client.session is not None


class TestDataValidation(unittest.TestCase):
    """Test data validation"""

    def test_extract_brand_name(self):
        """Test brand extraction"""
        product = {'brand_name': 'Apple Inc'}
        assert DataMapper.extract_brand_name(product) == 'Apple Inc'
        
        product = {'brand_name': None}
        assert DataMapper.extract_brand_name(product) == 'Unknown'

    def test_extract_category(self):
        """Test category extraction"""
        product = {'category': 'DEVELOPER_TOOLS'}
        assert DataMapper.extract_category(product) in ['developer_tools', 'software']


def run_tests():
    """Run all tests"""
    unittest.main(argv=[''], exit=False, verbosity=2)


if __name__ == '__main__':
    run_tests()
