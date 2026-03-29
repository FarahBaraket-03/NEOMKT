"""
Main web scraper orchestration
Coordinates fetching, mapping, validation, and storage
"""

import logging
import json
import os
from typing import Dict, List
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from config import LOGGING, TECH_CATEGORIES
from api_clients import TechProductFetcher
from data_mapper import DataMapper
from database import DatabaseManager

# Setup logging
logging.basicConfig(
    level=LOGGING['level'],
    format=LOGGING['format'],
    handlers=[
        logging.FileHandler(LOGGING['filepath']),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class SafeWebScraper:
    """Safe, ethical web scraper for tech products"""

    def __init__(self, db_manager: DatabaseManager = None):
        self.fetcher = TechProductFetcher()
        self.mapper = DataMapper()
        self.db = db_manager or DatabaseManager()
        self.db.connect()
        self.stats = {
            'fetched': 0,
            'mapped': 0,
            'skipped': 0,
            'inserted': 0,
            'errors': 0,
        }

    def scrape(self) -> Dict:
        """Execute full scraping pipeline"""
        
        logger.info("=" * 70)
        logger.info("SAFE WEB SCRAPING FOR TECH PRODUCTS")
        logger.info("=" * 70)
        logger.info(f"Started at: {datetime.now().isoformat()}")

        try:
            # Step 1: Fetch from all APIs
            logger.info("\n[STEP 1] Fetching products from safe APIs...")
            api_results = self.fetcher.fetch_all_products()
            total_fetched = self.fetcher.get_total_products(api_results)
            logger.info(f"✓ Fetched {total_fetched} products from APIs")
            self.stats['fetched'] = total_fetched

            # Step 2: Map and normalize data
            logger.info("\n[STEP 2] Mapping API responses to schema...")
            normalized_products = self._process_all_results(api_results)
            logger.info(f"✓ Mapped {len(normalized_products)} products")
            self.stats['mapped'] = len(normalized_products)

            # Step 3: Insert into database
            logger.info("\n[STEP 3] Inserting products into database...")
            inserted, skipped = self.db.insert_products(normalized_products)
            logger.info(f"✓ Inserted {inserted} products, Skipped {skipped}")
            self.stats['inserted'] = inserted
            self.stats['skipped'] = skipped
            self.stats['errors'] = self.stats['fetched'] - self.stats['mapped']

            # Step 4: Summary
            logger.info("\n[STEP 4] Generating summary...")
            db_summary = self.db.get_summary()
            logger.info(f"✓ Database summary: {json.dumps(db_summary, indent=2)}")

            # Final report
            logger.info("\n" + "=" * 70)
            logger.info("SCRAPING COMPLETE")
            logger.info("=" * 70)
            logger.info(json.dumps(self.stats, indent=2))
            logger.info(f"Ended at: {datetime.now().isoformat()}")

            return {
                'success': True,
                'stats': self.stats,
                'db_summary': db_summary,
            }

        except Exception as e:
            logger.error(f"Scraping failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'stats': self.stats,
            }

    def _process_all_results(self, api_results: Dict[str, List[Dict]]) -> List[Dict]:
        """Process results from all APIs"""
        
        all_products = []

        # Process GitHub developer tools
        logger.debug(f"Processing {len(api_results.get('github_devtools', []))} GitHub devtools...")
        for repo in api_results.get('github_devtools', []):
            product = self.mapper.map_github_repo(repo)
            if product:
                all_products.append(product)

        # Process GitHub programming languages
        logger.debug(f"Processing {len(api_results.get('github_languages', []))} GitHub languages...")
        for repo in api_results.get('github_languages', []):
            product = self.mapper.map_github_repo(repo)
            if product:
                all_products.append(product)

        # Process RAWG games
        logger.debug(f"Processing {len(api_results.get('rawg_games', []))} RAWG games...")
        for game in api_results.get('rawg_games', []):
            product = self.mapper.map_rawg_game(game)
            if product:
                all_products.append(product)

        logger.info(f"Processed {len(all_products)} valid products")
        return all_products


def main():
    """Main entry point"""
    
    # Initialize scraper with credentials from environment
    db_manager = DatabaseManager()
    # Credentials are now automatically read from .env via DatabaseManager
    
    scraper = SafeWebScraper(db_manager)

    # Run scraping
    result = scraper.scrape()

    # Return result
    return result


if __name__ == '__main__':
    result = main()
    exit(0 if result['success'] else 1)
