"""
Mock data scraper for consumer tech products
Loads high-quality mock data with reviews and inserts into database
"""

import logging
import json
import os
from typing import Dict
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from mock_data_large import generate_all_products, get_stats
from database import DatabaseManager

# Setup logging
logging.basicConfig(
    level='INFO',
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scraper_mock.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class MockDataScraper:
    """Loads and inserts mock data into database"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db = db_manager or DatabaseManager()
        self.db.connect()
        self.stats = {
            'generated': 0,
            'inserted': 0,
            'skipped': 0,
            'reviews_inserted': 0,
            'errors': 0,
        }
    
    def scrape(self) -> Dict:
        """Load mock data and insert into database"""
        
        logger.info("=" * 70)
        logger.info("🎯 MOCK DATA LOADER - Consumer Tech Products (NO REVIEWS)")
        logger.info("=" * 70)
        logger.info(f"Started at: {datetime.now().isoformat()}")
        
        try:
            # Step 1: Generate mock data
            logger.info("\n[STEP 1] Generating large-scale mock data...")
            products = generate_all_products()
            self.stats['generated'] = len(products)
            
            logger.info(f"Generated {len(products)} products (reviews will be skipped)")
            
            # Show data breakdown
            stats = get_stats()
            logger.info(f"\nData Summary:")
            logger.info(f"  Total Products: {stats['total_products']}")
            logger.info(f"  Total Stock: {stats['total_stock']} units")
            logger.info(f"  Average Product Price: ${stats.get('avg_rating', 0)}/5")
            
            # Step 2: Prepare data for insertion
            logger.info("\n[STEP 2] Preparing products for database...")
            db_products = []
            
            for product in products:
                db_product = {
                    'name': product['name'],
                    'slug': product['slug'],
                    'description': product['description'],
                    'price': float(product['price']),
                    'stock': product['stock'],
                    'status': 'ACTIVE',
                    'brand_name': product['brand'],
                    'category': product['category'],
                    'image_url': product['image_url'],
                    'images': product['images'],
                    'release_date': None,
                    'specs': product['specs'],
                    # Skip reviews - empty list means no reviews will be inserted
                    'reviews': [],
                }
                db_products.append(db_product)
            
            logger.info(f"Prepared {len(db_products)} products")
            
            # Step 3: Insert into database
            logger.info("\n[STEP 3] Inserting products into database...")
            inserted, skipped = self.db.insert_products(db_products)
            
            logger.info(f"Inserted {inserted} products")
            if skipped > 0:
                logger.warning(f"Skipped {skipped} products")
            
            self.stats['inserted'] = inserted
            self.stats['skipped'] = skipped
            
            # Count total reviews
            total_reviews = sum(len(p.get('reviews', [])) for p in db_products)
            self.stats['reviews_inserted'] = total_reviews
            
            # Step 4: Summary
            logger.info("\n[STEP 4] Generating summary...")
            db_summary = self.db.get_summary()
            logger.info(f"Database Summary:")
            logger.info(f"  Brands: {db_summary.get('brands', 0)}")
            logger.info(f"  Categories: {db_summary.get('categories', 0)}")
            logger.info(f"  Products: {db_summary.get('products', 0)}")
            
            # Final report
            logger.info("\n" + "=" * 70)
            logger.info("✓ MOCK DATA LOADING COMPLETE")
            logger.info("=" * 70)
            logger.info(json.dumps(self.stats, indent=2))
            logger.info(f"Ended at: {datetime.now().isoformat()}")
            
            return {
                'success': True,
                'stats': self.stats,
                'db_summary': db_summary,
                'data_stats': stats,
            }
        
        except Exception as e:
            logger.error(f"Loading failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'stats': self.stats
            }


def main():
    """Entry point"""
    logger.info("\n" + "=" * 70)
    logger.info("🛍️  CONSUMER TECH PRODUCTS - MOCK DATA LOADER")
    logger.info("=" * 70)
    
    # Check Supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if supabase_url and supabase_key:
        logger.info("✓ Supabase credentials found (PRODUCTION MODE)")
        logger.info(f"✓ Project: {supabase_url.split('.')[0]}")
    else:
        logger.warning("⚠ Supabase not configured, using demo mode")
    
    logger.info("")
    
    # Run loader
    scraper = MockDataScraper()
    result = scraper.scrape()
    
    if result['success']:
        logger.info("\n✓ Mock data loaded successfully!")
        logger.info(f"\nYou now have:")
        logger.info(f"  • {result['stats']['inserted']} products")
        logger.info(f"  • {result['stats']['reviews_inserted']} reviews")
        logger.info(f"  • {result['data_stats']['total_stock']} units in stock")
        return 0
    else:
        logger.error("\n✗ Loading failed!")
        return 1


if __name__ == '__main__':
    exit(main())
