# Quick Start Guide

## 🚀 Installation (5 minutes)

### Step 1: Navigate to the project
```bash
cd webScraping
```

### Step 2: Create virtual environment (optional but recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Setup environment
```bash
# Copy .env.example to .env
cp .env.example .env
# Or on Windows:
copy .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-anon-key
```

## 🎯 Usage

### Demo Mode (No Configuration Needed)
```bash
# Test everything in-memory without Supabase
python run.py
```

### Production Mode (With Supabase)
```bash
# Make sure .env has your Supabase credentials
# Then run:
python run.py
```

### Explore Examples
```bash
# Run interactive examples
python examples.py
```

### Run Tests
```bash
pytest test_scraper.py -v
```

## 📊 What Gets Fetched?

### GitHub API (Free, 60 req/hour)
- ✅ Developer tools and utilities
- ✅ Programming languages
- ✅ Framework libraries
- ✅ Real-time data with ratings

### RAWG Games API (Free)
- ✅ Video games database
- ✅ Multi-platform games
- ✅ Game ratings and genres
- ✅ Publisher information

### Product Hunt (Optional, Free tier available)
- ✅ Latest tech products
- ✅ Software tools
- ✅ Startup launches

## 🔍 Data Flow

```
APIs (GitHub, RAWG)
    ↓
Rate Limited Requests (safe!)
    ↓
Response Validation
    ↓
Map to Schema (brands, categories, products, specs)
    ↓
Database Insertion (Supabase)
    ↓
Complete! ✓
```

## ⚙️ Configuration

### Rate Limiting
Edit `config.py`:
```python
APIS = {
    "github": {
        "rate_limit": 60,  # requests per hour
    }
}
```

### Trusted Brands
Add/remove brands in `config.py`:
```python
TRUSTED_BRANDS = {
    "Apple", "Microsoft", "Google", ...
}
```

### Logging Level
```python
LOGGING = {
    "level": "INFO",  # Change to DEBUG for verbose logs
}
```

## 🧪 Testing

### Run unit tests
```bash
python test_scraper.py
```

### Test specific API
```bash
python -c "from api_clients import GitHubClient; c = GitHubClient(); print(len(c.fetch_developer_tools(5)))"
```

### Test data mapping
```bash
python -c "from data_mapper import DataMapper; print(DataMapper.slugify('Test Product'))"
```

## 📊 Database Schema

Your Supabase database will be populated with:

```
brands
├── id (UUID)
├── name
├── slug
├── country
├── logo_url
└── website_url

categories
├── id (UUID)
├── name
├── slug
├── parent_id (for hierarchy)
└── description

products
├── id (UUID)
├── name
├── slug
├── description
├── price
├── stock
├── brand_id (FK)
├── category_id (FK)
├── image_url
└── specs (JSON)

specs
├── id (UUID)
├── product_id (FK)
├── key (e.g., "RAM")
├── value (e.g., "16GB")
└── unit (e.g., "GB")
```

## 🛡️ Safety Features

✅ **Rate Limiting** - Respects API limits
✅ **Error Handling** - Retries with backoff
✅ **Data Validation** - Ensures quality
✅ **Logging** - Audit trail of all operations
✅ **API-Based** - No HTML scraping (ethical)
✅ **SSL/TLS** - Secure connections
✅ **Timeout Protection** - Prevents hangs

## 🔑 API Keys (Optional)

These APIs work WITHOUT registration:
- ✓ GitHub (60 requests/hour unauthenticated)
- ✓ RAWG (20 requests/minute free tier)

With free registration:
- ⭐ Product Hunt (get free token)
- ⭐ GitHub (increase to 5000 requests/hour)

To add your API keys, update `.env`:
```
GITHUB_TOKEN=ghp_xxxxx
PRODUCTHUNT_TOKEN=xxxxx
RAWG_API_KEY=xxxxx
```

## 📝 Logging

Logs are saved to `logs/scraper.log`

View in real-time:
```bash
# Unix/Mac
tail -f logs/scraper.log

# Windows PowerShell
Get-Content logs/scraper.log -Tail 10 -Wait
```

## 🐛 Troubleshooting

### "Connection refused"
- Check SUPABASE_URL in .env
- Verify network connectivity
- Check Supabase is online

### "Rate limited"
- Scraper will automatically wait
- Check logs/scraper.log for timing
- Reduce batch size in config.py

### "No data inserted"
- Run in demo mode first: `python run.py`
- Check if APIs are accessible
- Verify database schema exists

### "Missing dependencies"
```bash
pip install -r requirements.txt
```

## 📚 Documentation

- **README.md** - Full documentation
- **examples.py** - Usage examples
- **config.py** - Configuration options
- **api_clients.py** - API client code
- **data_mapper.py** - Data transformation logic

## 💡 Tips

1. **Start small**: Run examples first to understand the data
2. **Monitor logs**: Always check logs/scraper.log
3. **Test mapping**: Verify data format before bulk insert
4. **Use demo mode**: Test without Supabase setup first
5. **Schedule runs**: Use cron/Task Scheduler for recurring scrapes

## 🚀 Production Setup

For production deployment:

1. Use environment variables instead of .env
2. Set up CloudFlare or proxy for rate limiting
3. Add database connection pooling
4. Implement data freshness tracking
5. Set up alerts for failures
6. Use managed logging (Datadog, CloudWatch, etc.)

## 📞 Support

Check these resources in order:
1. logs/scraper.log - Detailed error information
2. README.md - Comprehensive documentation
3. examples.py - Usage patterns
4. config.py - Configuration options

---

**Happy Scraping!** 🎉

For questions or issues, review the logs and documentation.
