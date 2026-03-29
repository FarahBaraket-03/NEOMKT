"""
Safe API clients for fetching tech product data
Implements rate limiting, retries, and error handling
"""

import time
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from abc import ABC, abstractmethod
import logging

from config import APIS, SCRAPING

logger = logging.getLogger(__name__)


class RateLimiter:
    """Token bucket rate limiter"""

    def __init__(self, requests_per_hour: int):
        self.max_tokens = requests_per_hour
        self.tokens = requests_per_hour
        self.last_update = datetime.now()
        self.requests_made = 0

    def wait_if_needed(self):
        """Wait if rate limit would be exceeded"""
        now = datetime.now()
        time_passed = (now - self.last_update).total_seconds()
        
        # Refill tokens (linearly)
        tokens_to_add = (time_passed / 3600) * self.max_tokens
        self.tokens = min(self.max_tokens, self.tokens + tokens_to_add)
        self.last_update = now

        if self.tokens < 1:
            sleep_time = (1 - self.tokens) * (3600 / self.max_tokens)
            logger.info(f"Rate limit: sleeping for {sleep_time:.2f}s")
            time.sleep(sleep_time)
            self.tokens = 1

        self.tokens -= 1
        self.requests_made += 1


class BaseAPIClient(ABC):
    """Base class for safe API clients"""

    def __init__(self, api_name: str):
        self.api_name = api_name
        self.config = APIS.get(api_name, {})
        self.base_url = self.config.get('base_url', '')
        self.rate_limiter = RateLimiter(self.config.get('rate_limit', 60))
        self.session = self._create_session()

    def _create_session(self) -> requests.Session:
        """Create requests session with retry strategy"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': SCRAPING['user_agent'],
            'Accept': 'application/json',
        })
        return session

    def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Optional[Dict]:
        """Make safe HTTP request with retries and rate limiting"""
        
        url = f"{self.base_url}{endpoint}"
        max_retries = SCRAPING['max_retries']

        for attempt in range(max_retries):
            try:
                self.rate_limiter.wait_if_needed()
                
                response = self.session.request(
                    method,
                    url,
                    timeout=self.config.get('timeout', 10),
                    verify=SCRAPING['verify_ssl'],
                    **kwargs
                )
                
                response.raise_for_status()
                
                logger.debug(f"{self.api_name} {method} {endpoint}: {response.status_code}")
                return response.json()

            except requests.exceptions.Timeout:
                logger.warning(f"Timeout on {self.api_name} (attempt {attempt + 1})")
                if attempt < max_retries - 1:
                    time.sleep(SCRAPING['retry_delay'])

            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:  # Rate limited
                    retry_after = int(response.headers.get('Retry-After', 60))
                    logger.warning(f"Rate limited by {self.api_name}, waiting {retry_after}s")
                    time.sleep(retry_after)
                elif response.status_code == 403:
                    logger.error(f"Forbidden: {url}")
                    return None
                elif response.status_code >= 500:
                    logger.warning(f"Server error {response.status_code} (attempt {attempt + 1})")
                    if attempt < max_retries - 1:
                        time.sleep(SCRAPING['retry_delay'])
                else:
                    logger.error(f"HTTP {response.status_code}: {e}")
                    return None

            except Exception as e:
                logger.error(f"Error from {self.api_name}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(SCRAPING['retry_delay'])

        logger.error(f"Failed after {max_retries} retries: {url}")
        return None

    @abstractmethod
    def fetch_products(self, query: str = None, limit: int = 50) -> List[Dict]:
        """Fetch products from API"""
        pass


class ProductHuntClient(BaseAPIClient):
    """Product Hunt API client"""

    def __init__(self):
        super().__init__('producthunt')
        # Note: ProductHunt API requires authentication
        # Getting products requires Access Token
        self.access_token = None

    def fetch_products(self, query: str = None, limit: int = 50) -> List[Dict]:
        """
        Fetch products from Product Hunt
        
        Note: Requires authentication. 
        See: https://www.producthunt.com/api/analytics
        """
        logger.info("ProductHunt requires authentication token (free tier available)")
        logger.info("Get token from: https://www.producthunt.com/api")
        # Would need: Authorization: Bearer <TOKEN>
        return []


class GitHubClient(BaseAPIClient):
    """GitHub REST API client"""

    def __init__(self):
        super().__init__('github')

    def fetch_products(
        self,
        query: str = "stars:>1000 is:public",
        limit: int = 50
    ) -> List[Dict]:
        """
        Fetch popular open-source repositories
        
        Default query finds repos with >1000 stars
        """
        logger.info(f"Fetching GitHub repos: {query}")
        
        all_results = []
        per_page = min(100, limit)

        try:
            params = {
                'q': query,
                'sort': 'stars',
                'order': 'desc',
                'per_page': per_page,
            }

            response = self._request('GET', '/search/repositories', params=params)
            
            if response and 'items' in response:
                all_results = response['items'][:limit]
                logger.info(f"Fetched {len(all_results)} GitHub repos")

        except Exception as e:
            logger.error(f"Error fetching GitHub products: {e}")

        return all_results

    def fetch_developer_tools(self, limit: int = 50) -> List[Dict]:
        """Fetch popular developer tools"""
        query = 'topic:developer-tools stars:>500 is:public'
        return self.fetch_products(query, limit)

    def fetch_programming_languages(self, limit: int = 50) -> List[Dict]:
        """Fetch popular programming language repos"""
        query = 'topic:programming-language stars:>1000 is:public'
        return self.fetch_products(query, limit)


class RAWGClient(BaseAPIClient):
    """RAWG Video Games Database API client"""

    def __init__(self):
        super().__init__('rawg')
        self.api_key = None  # Free API, no key needed

    def fetch_products(self, query: str = None, limit: int = 50) -> List[Dict]:
        """
        Fetch popular video games
        """
        logger.info(f"Fetching RAWG games")
        
        all_results = []

        try:
            params = {
                'ordering': '-rating',
                'page_size': min(40, limit),
            }

            # Optionally add search query
            if query:
                params['search'] = query

            response = self._request('GET', '/games', params=params)
            
            if response and 'results' in response:
                all_results = response['results'][:limit]
                logger.info(f"Fetched {len(all_results)} games from RAWG")

        except Exception as e:
            logger.error(f"Error fetching RAWG games: {e}")

        return all_results


class TechProductFetcher:
    """Unified API for fetching tech products from multiple sources"""

    def __init__(self):
        self.github_client = GitHubClient()
        self.rawg_client = RAWGClient()
        self.producthunt_client = ProductHuntClient()

    def fetch_all_products(self) -> Dict[str, List[Dict]]:
        """Fetch products from all available APIs"""
        
        results = {}

        # GitHub developer tools
        logger.info("=" * 50)
        logger.info("Fetching from GitHub API...")
        logger.info("=" * 50)
        results['github_devtools'] = self.github_client.fetch_developer_tools(limit=50)
        
        # GitHub programming languages
        results['github_languages'] = self.github_client.fetch_programming_languages(limit=30)

        # RAWG Games
        logger.info("=" * 50)
        logger.info("Fetching from RAWG API...")
        logger.info("=" * 50)
        results['rawg_games'] = self.rawg_client.fetch_products(limit=50)

        return results

    def get_total_products(self, results: Dict[str, List[Dict]]) -> int:
        """Count total products fetched"""
        return sum(len(products) for products in results.values())
