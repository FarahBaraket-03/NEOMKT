# Safe Web Scraping for Tech Products

A secure, ethical web scraping solution that fetches real technology products data from free public APIs and stores it in your Supabase database.

## 🛡️ Safety Features

- **API-based** (not HTML scraping) - Respects robots.txt and TOS
- **Rate limiting** - Implements token bucket algorithm
- **Error handling** - Graceful failures with retries
- **Data validation** - Ensures data quality before insertion
- **Logging** - Complete audit trail of operations
- **Free tier** - Uses only free APIs (no special keys required)

## 📡 Supported Data Sources

### 1. **GitHub API** (No auth required)
   - Popular open-source repositories
   - Developer tools and programming languages
   - Real-time data about projects

### 2. **RAWG Video Games Database** (Free API)
   - Video games with ratings and metadata
   - Multi-platform games
   - Genre and publisher information

### 3. **Product Hunt** (Requires free token)
   - Latest tech products
   - Startup launches
   - Trending software tools

## 🚀 Quick Start

### Installation

```bash
# Navigate to project
cd webScraping

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Configuration

1. **Get Supabase Credentials:**
   ```
   SUPABASE_URL: https://your-project.supabase.co
   SUPABASE_KEY: anon public key from Settings > API
   ```

2. **(Optional) Get API Keys:**
   - Product Hunt: https://www.producthunt.com/api
   - GitHub: https://github.com/settings/tokens (free, 60 req/hour without)
   - RAWG: https://rawg.io/api (free, no key needed)

### Run Scraper

```bash
# Demo mode (in-memory storage)
python scraper.py

# Production mode (update .env first)
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_KEY=your-key \
python scraper.py
```

## 📊 Data Schema Mapping

```
API Response → Normalized → Database
   ↓              ↓            ↓
GitHub Repo  → Product → brands + categories + products + specs
RAWG Game    → Product → brands + categories + products + specs
ProductHunt  → Product → brands + categories + products + specs
```

### Product Mapping

| Field | Source | Required |
|-------|--------|----------|
| `name` | API title | ✅ |
| `slug` | Auto-generated | ✅ |
| `description` | API description | ✅ |
| `price` | API pricing (or free) | ✅ |
| `stock` | API availability | ⚠️ |
| `brand_id` | Extract + create | ✅ |
| `category_id` | Map API → schema | ✅ |
| `image_url` | API image | ⚠️ |
| `specs` | API metadata | ⚠️ |

## 🔍 How It Works

```
1. FETCH
   ├─ GitHub: /search/repositories
   ├─ RAWG: /games
   └─ ProductHunt: /posts

2. MAP & NORMALIZE
   ├─ Extract relevant fields
   ├─ Validate data quality
   ├─ Create brands/categories
   └─ Format for schema

3. STORE
   ├─ Batch insert products
   ├─ Insert specs
   └─ Log results

4. REPORT
   ├─ Success/error count
   ├─ Database summary
   └─ Performance metrics
```

## 📝 Configuration File

Edit `config.py` to:

- **Add/remove APIs** in `APIS` dict
- **Change rate limits** (requests per hour)
- **Add trusted brands** whitelist
- **Adjust logging** level/output

## 🧪 Testing

```bash
# Run unit tests
pytest tests/

# Test a specific API
python -c "from api_clients import GitHubClient; c = GitHubClient(); print(c.fetch_developer_tools(5))"

# Test data mapping
python -c "from data_mapper import DataMapper; print(DataMapper.slugify('Test Product'))"
```

## 📋 Usage Examples

### Fetch GitHub Developer Tools Only

```python
from api_clients import GitHubClient
from data_mapper import DataMapper

client = GitHubClient()
repos = client.fetch_developer_tools(limit=50)

for repo in repos:
    product = DataMapper.map_github_repo(repo)
    print(f"Mapped: {product['name']}")
```

### Fetch Games with Custom Filters

```python
from api_clients import RAWGClient

client = RAWGClient()
games = client.fetch_products(query="puzzle", limit=30)
```

### Custom Scraping Pipeline

```python
from scraper import SafeWebScraper
from database import DatabaseManager

db = DatabaseManager(url="...", key="...")
scraper = SafeWebScraper(db)
result = scraper.scrape()
print(result['stats'])
```

## ⚙️ Advanced Configuration

### Rate Limiting

Change in `config.py`:
```python
APIS = {
    "github": {
        "rate_limit": 60,  # 60 requests per hour
        ...
    }
}
```

### Retry Policy

```python
SCRAPING = {
    "max_retries": 3,
    "retry_delay": 2,  # seconds
}
```

### Data Validation

```python
VALIDATION = {
    "min_price": 0,
    "max_price": 999999,
    "min_description_length": 10,
}
```

## 🚨 Error Handling

All errors are logged with context:

```
ERROR - Error inserting product 'Example Product': Duplicate slug
WARNING - Rate limited by GitHub, waiting 60s
DEBUG - GitHub GET /search/repositories: 200
```

Check logs in `webScraping/logs/scraper.log`

## 📊 Monitoring

After scraping, check:

```sql
-- Database summary
SELECT 
  (SELECT COUNT(*) FROM brands) as brand_count,
  (SELECT COUNT(*) FROM categories) as category_count,
  (SELECT COUNT(*) FROM products) as product_count;

-- Recently inserted products
SELECT name, brand_id, price, created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- Product specs example
SELECT k.*, v.value 
FROM specs k 
WHERE k.product_id = '<product-uuid>'
ORDER BY k.display_order;
```

## 🔐 Security Best Practices

✅ **DO:**
- Use official public APIs
- Respect rate limits
- Validate all input data
- Use HTTPS connections
- Set reasonable timeouts
- Log all operations

❌ **DON'T:**
- Scrape HTML pages without permission
- Ignore robots.txt
- Hammer APIs with requests
- Store API keys in code
- Bypass rate limiting

## 🤝 Contributing

To add a new data source:

1. Create new `XyzClient(BaseAPIClient)` in `api_clients.py`
2. Implement `fetch_products()` method
3. Add mapping method in `data_mapper.py`
4. Update `TechProductFetcher.fetch_all_products()`
5. Add tests

## 📚 Resources

- [GitHub API Docs](https://docs.github.com/en/rest)
- [RAWG API Docs](https://rawg.io/api)
- [Product Hunt API](https://www.producthunt.com/api)
- [Web Scraping Ethics](https://blog.apify.com/web-scraping-ethics/)

## 📄 License

This scraper respects all API terms of service and data usage rights.

## 💬 Support

Check logs and error messages:
```bash
tail -f webScraping/logs/scraper.log
```

For issues, check:
1. API rate limits
2. Network connectivity
3. Supabase credentials
4. Database schema existence
