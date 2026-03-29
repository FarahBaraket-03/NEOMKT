"""
Examples of using the web scraper in different ways
"""

from api_clients import GitHubClient, RAWGClient
from data_mapper import DataMapper
from database import DatabaseManager
from scraper import SafeWebScraper
import json


def example_1_fetch_github_repos():
    """Example 1: Fetch GitHub developer tools"""
    print("\n" + "="*70)
    print("EXAMPLE 1: Fetch GitHub Developer Tools")
    print("="*70)
    
    client = GitHubClient()
    repos = client.fetch_developer_tools(limit=5)
    
    print(f"Found {len(repos)} repositories:\n")
    for repo in repos:
        print(f"📦 {repo['name']}")
        print(f"   URL: {repo['html_url']}")
        print(f"   Language: {repo.get('language', 'Unknown')}")
        print(f"   Stars: {repo['stargazers_count']}")
        print()


def example_2_map_github_repo():
    """Example 2: Map GitHub repo to product schema"""
    print("\n" + "="*70)
    print("EXAMPLE 2: Map GitHub Repository to Product Schema")
    print("="*70)
    
    # Sample repo from GitHub
    repo = {
        "name": "awesome-project",
        "description": "A comprehensive guide to building amazing projects with cutting-edge technology",
        "html_url": "https://github.com/user/awesome-project",
        "owner": {"login": "developer-user"},
        "language": "Python",
        "stargazers_count": 2500,
        "forks_count": 450,
        "license": {"name": "MIT"}
    }
    
    product = DataMapper.map_github_repo(repo)
    
    print(f"Original API Response:")
    print(json.dumps(repo, indent=2))
    print(f"\nMapped to Product Schema:")
    print(json.dumps(product, indent=2))


def example_3_fetch_games():
    """Example 3: Fetch video games from RAWG"""
    print("\n" + "="*70)
    print("EXAMPLE 3: Fetch Video Games from RAWG")
    print("="*70)
    
    client = RAWGClient()
    games = client.fetch_products(limit=5)
    
    print(f"Found {len(games)} games:\n")
    for game in games:
        print(f"🎮 {game['name']}")
        print(f"   Released: {game.get('released', 'Unknown')}")
        print(f"   Rating: {game.get('rating', 'N/A')}")
        print(f"   Platforms: {', '.join([p.get('platform', {}).get('name', 'Unknown') for p in game.get('platforms', [])])}")
        print()


def example_4_normalize_products():
    """Example 4: Normalize products for database"""
    print("\n" + "="*70)
    print("EXAMPLE 4: Normalize Products for Database Storage")
    print("="*70)
    
    from uuid import uuid4
    
    # Raw product data
    products = [
        {
            'name': 'Apple MacBook Pro',
            'description': 'High-performance laptop for professionals',
            'price': 1999.99,
            'stock': 50,
            'image_url': 'https://example.com/macbook.jpg',
            'category': 'laptops',
            'specs': {'cpu': 'M3 Pro', 'ram': '16GB', 'storage': '512GB SSD'}
        },
        {
            'name': 'Samsung Galaxy S24',
            'description': 'Flagship smartphone with advanced features',
            'price': 999.99,
            'stock': 100,
            'image_url': 'https://example.com/galaxy.jpg',
            'category': 'smartphones',
            'specs': {'display': '6.2" AMOLED', 'ram': '12GB', 'camera': '200MP'}
        }
    ]
    
    brand_id = uuid4()
    category_id = uuid4()
    
    print("Normalizing products...\n")
    for product in products:
        normalized = DataMapper.normalize_product(product, brand_id, category_id)
        print(f"✓ {normalized['name']}")
        print(f"  Price: ${normalized['price']}")
        print(f"  Specs: {normalized.get('specs', {})}")
        print()


def example_5_full_pipeline():
    """Example 5: Full scraping pipeline (demo mode)"""
    print("\n" + "="*70)
    print("EXAMPLE 5: Full Web Scraping Pipeline")
    print("="*70)
    print("Running in demo mode (in-memory storage)\n")
    
    # Create in-memory database
    db = DatabaseManager()
    
    # Initialize scraper
    scraper = SafeWebScraper(db)
    
    # Run scraper
    result = scraper.scrape()
    
    # Print results
    if result['success']:
        print("\n✓ Pipeline completed successfully!")
        stats = result.get('stats', {})
        print(f"\nResults:")
        print(f"  • Total fetched: {stats.get('fetched', 0)}")
        print(f"  • Successfully mapped: {stats.get('mapped', 0)}")
        print(f"  • Inserted to DB: {stats.get('inserted', 0)}")
    else:
        print(f"\n✗ Pipeline failed: {result.get('error', 'Unknown error')}")


def example_6_custom_github_search():
    """Example 6: Custom GitHub search query"""
    print("\n" + "="*70)
    print("EXAMPLE 6: Custom GitHub Repository Search")
    print("="*70)
    
    client = GitHubClient()
    
    # Search for Rust projects with >500 stars
    print("Searching for Rust projects with >500 stars...\n")
    repos = client.fetch_products(
        query='language:rust stars:>500 is:public',
        limit=5
    )
    
    print(f"Found {len(repos)} Rust repositories:")
    for repo in repos:
        print(f"\n📦 {repo['name']}")
        print(f"   Stars: {repo['stargazers_count']}")
        print(f"   Language: {repo.get('language', 'Rust')}")


def example_7_data_validation():
    """Example 7: Data validation"""
    print("\n" + "="*70)
    print("EXAMPLE 7: Data Validation")
    print("="*70)
    
    test_cases = [
        ("Valid price", 99.99, DataMapper.validate_price(99.99)),
        ("Negative price", -50, DataMapper.validate_price(-50)),
        ("String price", "199.99", DataMapper.validate_price("199.99")),
        ("Invalid price", "abc", DataMapper.validate_price("abc")),
    ]
    
    print("\nPrice Validation:")
    for desc, input_val, output_val in test_cases:
        status = "✓" if output_val is not None else "✗"
        print(f"  {status} {desc}: {input_val} → {output_val}")
    
    # Test slug generation
    print("\n\nSlug Generation:")
    test_slugs = [
        "Apple iPhone 15 Pro Max",
        "Samsung Galaxy S24 Ultra",
        "Special!@#$ Characters",
    ]
    
    for text in test_slugs:
        slug = DataMapper.slugify(text)
        print(f"  '{text}' → '{slug}'")


def main():
    """Run all examples"""
    
    print("""
    
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                   WEB SCRAPER USAGE EXAMPLES                      ║
    ║            Safe, Ethical Data Fetching from Public APIs            ║
    ╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    examples = [
        ("1", "Fetch GitHub Developer Tools", example_1_fetch_github_repos),
        ("2", "Map GitHub Repo to Schema", example_2_map_github_repo),
        ("3", "Fetch Video Games from RAWG", example_3_fetch_games),
        ("4", "Normalize Products", example_4_normalize_products),
        ("5", "Full Scraping Pipeline", example_5_full_pipeline),
        ("6", "Custom GitHub Search", example_6_custom_github_search),
        ("7", "Data Validation", example_7_data_validation),
        ("0", "Exit", None),
    ]
    
    while True:
        print("\nAvailable Examples:")
        for code, desc, _ in examples:
            print(f"  [{code}] {desc}")
        
        choice = input("\nSelect example (0 to exit): ").strip()
        
        if choice == "0":
            print("\nGoodbye! 👋")
            break
        
        for code, desc, func in examples:
            if code == choice and func:
                try:
                    func()
                except Exception as e:
                    print(f"\n✗ Error: {e}")
                    import traceback
                    traceback.print_exc()
                break
        else:
            if choice != "0":
                print("Invalid selection. Try again.")


if __name__ == '__main__':
    main()
