"""
Configuration for safe web scraping
"""

import os
from typing import Dict, List

# API Configuration
APIS = {
    "producthunt": {
        "name": "Product Hunt",
        "base_url": "https://api.producthunt.com/v2",
        "rate_limit": 100,  # requests per hour
        "timeout": 10,
        "enabled": True,
        "docs": "https://www.producthunt.com/api"
    },
    "github": {
        "name": "GitHub REST API",
        "base_url": "https://api.github.com",
        "rate_limit": 60,  # requests per hour (unauthenticated)
        "timeout": 10,
        "enabled": True,
        "docs": "https://docs.github.com/en/rest"
    },
    "amazon": {
        "name": "Real-Time Amazon Data API",
        "base_url": "https://real-time-amazon-data.p.rapidapi.com",
        "rate_limit": 100,  # requests per month (hard limit)
        "timeout": 10,
        "enabled": True,
        "docs": "https://rapidapi.com/laxminarayan/api/real-time-amazon-data",
        "api_key_env": "AMAZON_RAPIDAPI_KEY",
        "api_host": "real-time-amazon-data.p.rapidapi.com",
    },
    "aliexpress": {
        "name": "AliExpress DataHub API",
        "base_url": "https://aliexpress-datahub.p.rapidapi.com",
        "rate_limit": 100,  # requests per month (hard limit)
        "timeout": 10,
        "enabled": True,
        "docs": "https://rapidapi.com/datalab/api/aliexpress-datahub",
        "api_key_env": "ALIEXPRESS_RAPIDAPI_KEY",
        "api_host": "aliexpress-datahub.p.rapidapi.com",
    },
}

# Database Configuration
DATABASE = {
    "url": os.getenv("SUPABASE_URL", ""),
    "key": os.getenv("SUPABASE_KEY", ""),
    "schema": "public"
}

# Consumer Tech Categories Map
TECH_CATEGORIES = {
    "smartphones": "Mobile & Smartphones",
    "laptops": "Computers & Laptops",
    "tablets": "Tablets & E-readers",
    "keyboards": "Keyboards & Input Devices",
    "storage": "Storage & SSDs",
    "monitors": "Monitors & Displays",
    "peripherals": "Computer Peripherals",
    "headphones": "Audio & Headphones",
    "smartwatches": "Smartwatches & Wearables",
    "cameras": "Cameras & Photography",
}

# Brand Whitelist (to ensure quality data)
TRUSTED_BRANDS = {
    "Apple", "Microsoft", "Google", "Samsung", "Sony", "Intel", "AMD",
    "NVIDIA", "Qualcomm", "Lenovo", "Dell", "HP", "ASUS", "Razer",
    "Canon", "Nikon", "DJI", "GoPro", "Fitbit", "Garmin", "OnePlus",
    "Xiaomi", "Huawei", "Realme", "Oppo", "Vivo", "Nothing", "Motorola",
    "LG", "Panasonic", "JBL", "Bose", "Sennheiser", "Beats", "AirPods",
}

# Scraping Settings
SCRAPING = {
    "max_retries": 3,
    "retry_delay": 2,  # seconds
    "batch_size": 50,  # products per batch insert
    "verify_ssl": True,
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "respect_robots_txt": True,
}

# Data Validation
VALIDATION = {
    "min_price": 0,
    "max_price": 999999,
    "required_fields": ["name", "brand_id", "category_id", "price"],
    "min_description_length": 10,
}

# Logging
LOGGING = {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "filepath": "logs/scraper.log"
}
