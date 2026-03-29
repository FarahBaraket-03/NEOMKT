"""
Consumer tech products scraper
Orchestrates fetching, mapping, and storing consumer tech products
"""

import logging
import json
import os
from typing import Dict, List
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from api_clients_ecommerce import ConsumerTechFetcher
from data_mapper_ecommerce import EcommerceDataMapper
from database import DatabaseManager

# Setup logging
logging.basicConfig(
    level='INFO',
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scraper_ecommerce.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ConsumerTechScraper:
    """Safe scraper for consumer tech products from e-commerce APIs"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.fetcher = ConsumerTechFetcher()
        self.mapper = EcommerceDataMapper()
        self.db = db_manager or DatabaseManager()
        self.db.connect()
        self.stats = {
            'fetched': 0,
            'mapped': 0,
            'inserted': 0,
            'skipped': 0,
            'errors': 0,
        }
    
    def scrape(self) -> Dict:
        """Execute full scraping pipeline"""
        
        logger.info("=" * 70)
        logger.info("CONSUMER TECH PRODUCTS SCRAPER")
        logger.info("=" * 70)
        logger.info(f"Started at: {datetime.now().isoformat()}")
        
        try:
            # Step 1: Fetch from all e-commerce APIs
            logger.info("\n[STEP 1] Fetching products from e-commerce APIs...")
            api_results = self.fetcher.fetch_all_products()
            total_fetched = self.fetcher.get_total_products(api_results)
            logger.info(f"Fetched {total_fetched} products from APIs")
            self.stats['fetched'] = total_fetched
            
            if total_fetched == 0:
                logger.warning("No products fetched. Check API credentials:")
                logger.warning("  - AMAZON_RAPIDAPI_KEY")
                logger.warning("  - ALIEXPRESS_RAPIDAPI_KEY")
                return {
                    'success': False,
                    'message': 'No products fetched - check API credentials',
                    'stats': self.stats
                }
            
            # Step 2: Map and normalize data
            logger.info("\n[STEP 2] Mapping API responses to schema...")
            normalized_products = self.mapper.map_all_products(api_results)
            logger.info(f"Mapped {len(normalized_products)} products")
            self.stats['mapped'] = len(normalized_products)
            
            # Step 3: Insert into database
            logger.info("\n[STEP 3] Inserting products into database...")
            inserted, skipped = self.db.insert_products(normalized_products)
            logger.info(f"Inserted {inserted} products, Skipped {skipped}")
            self.stats['inserted'] = inserted
            self.stats['skipped'] = skipped
            self.stats['errors'] = self.stats['fetched'] - self.stats['mapped']
            
            # Step 4: Summary
            logger.info("\n[STEP 4] Generating summary...")
            db_summary = self.db.get_summary()
            logger.info(f"Database summary: {json.dumps(db_summary, indent=2)}")
            
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
                'stats': self.stats
            }


def main():
    """Entry point"""
    logger.info("\n" + "=" * 70)
    logger.info("🛍️  CONSUMER TECH PRODUCTS DATA LOADER")
    logger.info("=" * 70)
    
    # Check credentials
    amazon_key = os.getenv('AMAZON_RAPIDAPI_KEY')
    aliexpress_key = os.getenv('ALIEXPRESS_RAPIDAPI_KEY')
    
    if not amazon_key and not aliexpress_key:
        logger.error("❌ No API credentials found!")
        logger.error("Please add to .env:")
        logger.error("  AMAZON_RAPIDAPI_KEY=<your-amazon-api-key>")
        logger.error("  ALIEXPRESS_RAPIDAPI_KEY=<your-aliexpress-api-key>")
        return 1
    
    if amazon_key:
        logger.info("✓ Amazon API key found")
    else:
        logger.warning("⚠ Amazon API key not configured")
    
    if aliexpress_key:
        logger.info("✓ AliExpress API key found")
    else:
        logger.warning("⚠ AliExpress API key not configured")
    
    # Check Supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if supabase_url and supabase_key:
        logger.info("✓ Supabase credentials found (PRODUCTION MODE)")
    else:
        logger.warning("⚠ Supabase not configured, using demo mode")
    
    logger.info("")
    
    # Run scraper
    scraper = ConsumerTechScraper()
    result = scraper.scrape()
    
    if result['success']:
        logger.info("\n✓ Scraping successful!")
        return 0
    else:
        logger.error("\n✗ Scraping failed!")
        return 1


if __name__ == '__main__':
    exit(main())
