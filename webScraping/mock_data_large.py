"""
Large-scale mock data - 360+ consumer tech products
With realistic specs, 8+ reviews per product, images
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict

# Real Unsplash image URLs
IMAGE_URLS = {
    "laptop": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
               "https://placehold.co/500x500",
               "https://placehold.co/500x500"],
    "phone": ["https://images.unsplash.com/photo-1592286927505-1def25e63e07?w=500&q=80",
              "https://images.unsplash.com/photo-1610945415295-d9bbf7ce3350?w=500&q=80"],
    "keyboard": ["https://images.unsplash.com/photo-1587829191301-4f34603b5c63?w=500&q=80"],
    "storage": ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80"],
    "headphones": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"],
    "monitor": ["https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&q=80"],
    "mouse": ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80",
              "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80"],
    "printer": ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80"],
    "videogame": ["https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&q=80",
                  "https://images.unsplash.com/photo-1593305841991-05de59242612?w=500&q=80",
                  "https://images.unsplash.com/photo-1535405557558-afc4877a26fc?w=500&q=80"],
}

BRANDS = {
    "laptop": ["Apple", "Dell", "Lenovo", "ASUS", "HP", "MSI", "Razer", "Acer", "LG"],
    "phone": ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Realme", "Motorola"],
    "keyboard": ["Logitech", "Corsair", "Keychron", "Steelseries", "Razer", "ASUS"],
    "storage": ["Samsung", "Western Digital", "Seagate", "Kingston", "Crucial"],
    "headphones": ["Sony", "Apple", "Sennheiser", "Bose", "JBL", "Audio-Technica"],
    "monitor": ["Dell", "LG", "ASUS", "Samsung", "Acer"],
    "mouse": ["Logitech", "Corsair", "Razer", "Steelseries", "ASUS", "Mad Catz"],
    "printer": ["HP", "Canon", "Epson", "Brother", "Xerox", "Lexmark"],
    "videogame": ["Sony", "Microsoft", "Nintendo", "Valve", "Bandai Namco", "Electronic Arts"],
}

REVIEWERS = [
    "Alex Johnson", "Maria Garcia", "James Smith", "Sarah Lee", "Michael Chen",
    "Emma Wilson", "David Brown", "Lisa Anderson", "Kevin Martinez", "Jessica Taylor",
    "Robert Miller", "Rebecca Davis", "William Rodriguez", "Amanda Moore", "Daniel Thomas",
    "Jennifer Martin", "Christopher Lee", "Michelle Taylor", "Andrew White", "Elizabeth Harris",
]

def generate_reviews(product_name: str, count: int = 10) -> List[Dict]:
    """Generate random reviews for product"""
    reviews = []
    templates = [
        (5, "Excellent!", "Amazing quality and service!"),
        (5, "Highly recommend", "This is the best product!"),
        (4, "Very good", "Great value for price"),
        (4, "Good quality", "Works as advertised"),
        (5, "Outstanding", "Exceeded expectations!"),
        (3, "Average", "Does the job"),
        (4, "Solid product", "Happy with purchase"),
        (5, "Perfect!", "Worth every penny"),
    ]
    
    for i in range(count):
        rating, title, comment = random.choice(templates)
        reviews.append({
            "id": f"rev_{i+1}",
            "title": title,
            "rating": rating,
            "comment": comment,
            "reviewer": random.choice(REVIEWERS),
            "created_at": (datetime.now() - timedelta(days=random.randint(1, 180))).isoformat(),
            "helpful": random.randint(0, 50),
        })
    return reviews


def generate_product(product_id: int, category: str, brand: str, base_name: str) -> Dict:
    """Generate single product"""
    specs_map = {
        "laptop": {"processor": "Intel i7", "ram": "16GB", "storage": "512GB SSD", "display": "15.6-inch FHD"},
        "phone": {"processor": "Snapdragon 8", "ram": "8GB", "storage": "256GB", "camera": "50MP"},
        "keyboard": {"type": "Mechanical", "backlight": "RGB", "connection": "Wireless"},
        "storage": {"capacity": "1TB", "speed": "7000MB/s", "interface": "NVMe PCIe 4.0"},
        "headphones": {"type": "Over-ear", "anc": "Active", "battery": "40 hours"},
        "monitor": {"size": "27-inch", "resolution": "4K", "refresh": "144Hz"},
        "mouse": {"type": "Optical", "dpi": "16000", "connection": "Wireless", "battery": "70 hours"},
        "printer": {"type": "Color Inkjet", "print_speed": "15 ppm", "resolution": "4800 dpi", "connectivity": "WiFi"},
        "videogame": {"platform": "Multi-platform", "genre": "Action", "rating": "E10+", "mode": "Single/Multiplayer"},
    }
    
    return {
        "id": f"prod_{product_id}",
        "name": f"{brand} {base_name}",
        "brand": brand,
        "category": category,
        "slug": f"{brand}-{base_name}".lower().replace(" ", "-"),
        "price": random.randint(50, 3000),
        "image_url": random.choice(IMAGE_URLS.get(category[:6], IMAGE_URLS["laptop"])),
        "images": [random.choice(IMAGE_URLS.get(category[:6], IMAGE_URLS["laptop"]))],
        "description": f"Premium {brand} {category} product with latest technology",
        "specs": specs_map.get(category, {}),
        "rating": round(random.uniform(3.5, 5.0), 1),
        "stock": random.randint(5, 100),
        "reviews": generate_reviews(f"{brand} {base_name}", random.randint(8, 15)),
    }


def generate_all_products() -> List[Dict]:
    """Generate 360+ products across categories"""
    products = []
    product_id = 1
    
    # Category configs: (category_name, count, base_models)
    configs = [
        ("laptops", 100, ["Pro", "Air", "XPS", "Vivobook", "IdeaPad"]),
        ("smartphones", 120, ["iPhone", "Galaxy", "Pixel", "OnePlus", "Xiaomi"]),
        ("keyboards", 80, ["Gaming", "Mechanical", "Wireless", "Compact", "RGB"]),
        ("storage", 90, ["NVMe SSD", "External HDD", "SSD Drive", "Backup Drive", "Portable"]),
        ("headphones", 80, ["Pro", "Max", "Plus", "Elite", "Studio"]),
        ("monitors", 70, ["Gaming", "4K", "Ultrawide", "Professional", "Curved"]),
        ("mouse", 60, ["Gaming", "Wireless", "Ergonomic", "Pro", "Ultra-Light"]),
        ("printer", 50, ["WiFi", "InkJet", "LaserJet", "OfficeJet", "Color"]),
        ("videogame", 70, ["PS5", "Xbox", "Nintendo", "Action", "RPG"]),
    ]
    
    for category, count, models in configs:
        brands = BRANDS.get(category, ["Generic"])
        
        for i in range(count):
            brand = random.choice(brands)
            model = random.choice(models)
            
            product = generate_product(product_id, category, brand, f"{model} {random.randint(2023, 2024)}")
            products.append(product)
            product_id += 1
    
    return products


def get_stats() -> Dict:
    """Get dataset statistics"""
    products = generate_all_products()
    
    stats = {
        "total_products": len(products),
        "total_reviews": sum(len(p.get("reviews", [])) for p in products),
        "total_stock": sum(p.get("stock", 0) for p in products),
        "categories": len(set(p["category"] for p in products)),
        "avg_rating": round(sum(p.get("rating", 0) for p in products) / len(products), 2),
    }
    return stats


if __name__ == "__main__":
    products = generate_all_products()
    stats = get_stats()
    print(f"\nGenerated {len(products)} products with {stats['total_reviews']} reviews!")
    print(f"Total stock: {stats['total_stock']} units")
    print(f"Average rating: {stats['avg_rating']}/5")
