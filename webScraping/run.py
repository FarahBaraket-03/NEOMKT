#!/usr/bin/env python
"""
Quick start script for web scraping
Run this to start fetching and storing tech products data
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from scraper import SafeWebScraper
from database import DatabaseManager

logger = logging.getLogger(__name__)


def main():
    """Main entry point"""
    
    print("""
    ╔════════════════════════════════════════════════════════════════════╗
    ║          SAFE WEB SCRAPING - TECH PRODUCTS DATA FETCHER            ║
    ╚════════════════════════════════════════════════════════════════════╝
    """)

    # Check environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')

    mode = "DEMO"
    if supabase_url and supabase_key:
        mode = "PRODUCTION"
        print(f"✓ Using Supabase credentials from .env")
        print(f"  URL: {supabase_url[:50]}...")
    else:
        print(f"⚠ No Supabase credentials found - using in-memory demo mode")
        print(f"  To enable production mode:")
        print(f"  1. Edit .env with your SUPABASE_URL and SUPABASE_KEY")
        print(f"  2. Run again")

    print(f"\nMode: {mode}\n")

    try:
        # Initialize database - credentials are read from .env automatically
        db = DatabaseManager()
        db.connect()

        # Initialize scraper
        scraper = SafeWebScraper(db)

        # Run scraping
        print("Starting scraper...\n")
        result = scraper.scrape()

        # Print results
        print("\n" + "=" * 70)
        if result['success']:
            print("✓ SCRAPING COMPLETED SUCCESSFULLY")
            stats = result.get('stats', {})
            print(f"\n📊 Statistics:")
            print(f"   • Fetched: {stats.get('fetched', 0)} products")
            print(f"   • Mapped: {stats.get('mapped', 0)} products")
            print(f"   • Inserted: {stats.get('inserted', 0)} products")
            print(f"   • Skipped: {stats.get('skipped', 0)} products")
            print(f"   • Errors: {stats.get('errors', 0)} products")

            db_summary = result.get('db_summary', {})
            print(f"\n🗄 Database Summary:")
            print(f"   • Brands: {db_summary.get('brands', 0)}")
            print(f"   • Categories: {db_summary.get('categories', 0)}")
            print(f"   • Products: {db_summary.get('products', 0)}")
        else:
            print("✗ SCRAPING FAILED")
            print(f"Error: {result.get('error', 'Unknown error')}")

        print("=" * 70)

        return 0 if result['success'] else 1

    except Exception as e:
        print(f"✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
