#!/usr/bin/env python3
"""Check database status"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Get counts
prod = client.table('products').select('id', count='exact').execute()
rev = client.table('reviews').select('id', count='exact').execute()
cat = client.table('categories').select('name').execute()
brand = client.table('brands').select('id', count='exact').execute()

print('\n✓ Database Status:')
print(f'  Products: {prod.count}')
print(f'  Reviews: {rev.count}')
print(f'  Brands: {brand.count}')
print(f'  Categories ({len(cat.data)}):')
for c in sorted(cat.data, key=lambda x: x['name']):
    print(f'    • {c["name"]}')
print()
