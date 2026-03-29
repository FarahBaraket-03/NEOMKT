import { supabaseAdmin } from '../lib/supabase.js';
import type { ProductStatus, UserRole } from '../lib/models.js';

interface SeedBrand {
  name: string;
  slug: string;
  country: string;
  founded_year: number;
  website_url: string;
  description: string;
}

interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  parent_slug: string | null;
  icon: string;
}

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  brand_slug: string;
  category_slug: string;
  image_url: string;
}

const brands: SeedBrand[] = [
  {
    name: 'Apple',
    slug: 'apple',
    country: 'United States',
    founded_year: 1976,
    website_url: 'https://www.apple.com',
    description: 'Consumer electronics and software company known for integrated ecosystems.',
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    country: 'South Korea',
    founded_year: 1938,
    website_url: 'https://www.samsung.com',
    description: 'Global technology conglomerate manufacturing smartphones, displays and memory.',
  },
  {
    name: 'Dell',
    slug: 'dell',
    country: 'United States',
    founded_year: 1984,
    website_url: 'https://www.dell.com',
    description: 'PC and enterprise infrastructure vendor with premium consumer lines.',
  },
  {
    name: 'HP',
    slug: 'hp',
    country: 'United States',
    founded_year: 1939,
    website_url: 'https://www.hp.com',
    description: 'Laptop, desktop, workstation and peripheral manufacturer.',
  },
  {
    name: 'Lenovo',
    slug: 'lenovo',
    country: 'China',
    founded_year: 1984,
    website_url: 'https://www.lenovo.com',
    description: 'PC market leader known for ThinkPad, Legion and Yoga lines.',
  },
  {
    name: 'ASUS',
    slug: 'asus',
    country: 'Taiwan',
    founded_year: 1989,
    website_url: 'https://www.asus.com',
    description: 'Consumer and gaming hardware maker with ROG and ProArt lines.',
  },
  {
    name: 'Sony',
    slug: 'sony',
    country: 'Japan',
    founded_year: 1946,
    website_url: 'https://www.sony.com',
    description: 'Electronics and entertainment giant with premium audio and imaging products.',
  },
  {
    name: 'LG',
    slug: 'lg',
    country: 'South Korea',
    founded_year: 1958,
    website_url: 'https://www.lg.com',
    description: 'Display and consumer electronics manufacturer with strong monitor portfolio.',
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    country: 'United States',
    founded_year: 1975,
    website_url: 'https://www.microsoft.com',
    description: 'Software and hardware vendor producing Surface and cloud services.',
  },
  {
    name: 'Google',
    slug: 'google',
    country: 'United States',
    founded_year: 1998,
    website_url: 'https://store.google.com',
    description: 'Cloud and consumer hardware company behind Pixel phones and tablets.',
  },
];

const categories: SeedCategory[] = [
  { name: 'Electronics', slug: 'electronics', description: 'Core electronics catalog root.', parent_slug: null, icon: 'cpu' },
  { name: 'Laptops', slug: 'laptops', description: 'Portable computers', parent_slug: 'electronics', icon: 'laptop' },
  { name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones', parent_slug: 'electronics', icon: 'smartphone' },
  { name: 'Tablets', slug: 'tablets', description: 'Tablet computers', parent_slug: 'electronics', icon: 'tablet' },
  { name: 'Monitors', slug: 'monitors', description: 'Displays and panels', parent_slug: 'electronics', icon: 'monitor' },
  { name: 'Gaming Laptops', slug: 'gaming-laptops', description: 'High-performance gaming notebooks', parent_slug: 'laptops', icon: 'gamepad-2' },
  { name: 'Ultrabooks', slug: 'ultrabooks', description: 'Lightweight premium notebooks', parent_slug: 'laptops', icon: 'briefcase' },
  { name: 'Android Phones', slug: 'android-phones', description: 'Android smartphone devices', parent_slug: 'smartphones', icon: 'bot' },
  { name: 'iPhones', slug: 'iphones', description: 'Apple iPhone devices', parent_slug: 'smartphones', icon: 'apple' },
  { name: 'Peripherals', slug: 'peripherals', description: 'Input and accessory devices', parent_slug: null, icon: 'usb' },
  { name: 'Keyboards', slug: 'keyboards', description: 'Mechanical and membrane keyboards', parent_slug: 'peripherals', icon: 'keyboard' },
  { name: 'Mice', slug: 'mice', description: 'Pointing devices', parent_slug: 'peripherals', icon: 'mouse' },
  { name: 'Headsets', slug: 'headsets', description: 'Audio headsets and headphones', parent_slug: 'peripherals', icon: 'headphones' },
  { name: 'Webcams', slug: 'webcams', description: 'Web and conference cameras', parent_slug: 'peripherals', icon: 'camera' },
  { name: 'Storage', slug: 'storage', description: 'Storage device root', parent_slug: null, icon: 'hard-drive' },
  { name: 'SSDs', slug: 'ssds', description: 'Solid state drives', parent_slug: 'storage', icon: 'database' },
  { name: 'External Drives', slug: 'external-drives', description: 'Portable external storage', parent_slug: 'storage', icon: 'save' },
];

const products: SeedProduct[] = [
  { name: 'MacBook Pro 14 M3', slug: 'macbook-pro-14-m3', description: '14-inch pro laptop with Apple silicon.', price: 1999, stock: 24, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'MacBook Air 13 M3', slug: 'macbook-air-13-m3', description: 'Ultra-thin everyday notebook.', price: 1299, stock: 36, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'MacBook Pro 16 M3 Max', slug: 'macbook-pro-16-m3-max', description: 'High-end workstation notebook.', price: 3499, stock: 12, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'laptops', image_url: 'https://placehold.co/800x600.png' },
  { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', description: 'Flagship iPhone with pro camera array.', price: 999, stock: 40, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'iphones', image_url: 'https://placehold.co/800x600.png' },
  { name: 'iPhone 15', slug: 'iphone-15', description: 'Mainstream iPhone generation.', price: 799, stock: 56, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'iphones', image_url: 'https://placehold.co/800x600.png' },
  { name: 'iPad Pro 13 M4', slug: 'ipad-pro-13-m4', description: 'Professional tablet with OLED display.', price: 1299, stock: 18, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'tablets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Studio Display 27', slug: 'studio-display-27', description: '5K monitor for creators.', price: 1599, stock: 9, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Magic Keyboard', slug: 'magic-keyboard', description: 'Slim wireless keyboard.', price: 129, stock: 70, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'keyboards', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Magic Mouse', slug: 'magic-mouse', description: 'Multi-touch wireless mouse.', price: 99, stock: 65, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'mice', image_url: 'https://placehold.co/800x600.png' },
  { name: 'AirPods Max', slug: 'airpods-max', description: 'Premium over-ear headphones.', price: 549, stock: 21, status: 'ACTIVE', brand_slug: 'apple', category_slug: 'headsets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Galaxy S24 Ultra', slug: 'galaxy-s24-ultra', description: 'Samsung flagship Android phone.', price: 1299, stock: 34, status: 'ACTIVE', brand_slug: 'samsung', category_slug: 'android-phones', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Galaxy S24', slug: 'galaxy-s24', description: 'Compact Samsung flagship.', price: 899, stock: 42, status: 'ACTIVE', brand_slug: 'samsung', category_slug: 'android-phones', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Galaxy Tab S9', slug: 'galaxy-tab-s9', description: 'Android tablet for media and productivity.', price: 799, stock: 22, status: 'ACTIVE', brand_slug: 'samsung', category_slug: 'tablets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Odyssey G8 OLED', slug: 'odyssey-g8-oled', description: 'Curved OLED gaming monitor.', price: 1199, stock: 7, status: 'ACTIVE', brand_slug: 'samsung', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'T7 Shield 2TB', slug: 't7-shield-2tb', description: 'Rugged portable SSD.', price: 179, stock: 50, status: 'ACTIVE', brand_slug: 'samsung', category_slug: 'external-drives', image_url: 'https://placehold.co/800x600.png' },
  { name: '990 Pro 2TB', slug: '990-pro-2tb', description: 'High-end NVMe SSD.', price: 189, stock: 44, status: 'ACTIVE', brand_slug: 'samsung', category_slug: 'ssds', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Dell XPS 15', slug: 'dell-xps-15', description: 'Creator laptop with premium chassis.', price: 2099, stock: 14, status: 'ACTIVE', brand_slug: 'dell', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Dell XPS 13 Plus', slug: 'dell-xps-13-plus', description: 'Compact ultrabook with edge design.', price: 1499, stock: 20, status: 'ACTIVE', brand_slug: 'dell', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Alienware m18 R2', slug: 'alienware-m18-r2', description: 'Desktop-class gaming laptop.', price: 2799, stock: 8, status: 'ACTIVE', brand_slug: 'dell', category_slug: 'gaming-laptops', image_url: 'https://placehold.co/800x600.png' },
  { name: 'UltraSharp U2723QE', slug: 'ultrasharp-u2723qe', description: '4K IPS Black monitor.', price: 649, stock: 16, status: 'ACTIVE', brand_slug: 'dell', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Dell Pro Keyboard KB522', slug: 'dell-pro-keyboard-kb522', description: 'Enterprise productivity keyboard.', price: 59, stock: 58, status: 'ACTIVE', brand_slug: 'dell', category_slug: 'keyboards', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Alienware AW720H', slug: 'alienware-aw720h', description: 'Wireless gaming headset.', price: 149, stock: 26, status: 'ACTIVE', brand_slug: 'dell', category_slug: 'headsets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'HP Spectre x360 14', slug: 'hp-spectre-x360-14', description: 'Convertible premium ultrabook.', price: 1649, stock: 11, status: 'ACTIVE', brand_slug: 'hp', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'HP Omen 16', slug: 'hp-omen-16', description: 'Gaming notebook with high-refresh panel.', price: 1599, stock: 15, status: 'ACTIVE', brand_slug: 'hp', category_slug: 'gaming-laptops', image_url: 'https://placehold.co/800x600.png' },
  { name: 'HP EliteBook 840 G10', slug: 'hp-elitebook-840-g10', description: 'Business laptop platform.', price: 1399, stock: 19, status: 'ACTIVE', brand_slug: 'hp', category_slug: 'laptops', image_url: 'https://placehold.co/800x600.png' },
  { name: 'HP Omen 27q', slug: 'hp-omen-27q', description: 'QHD gaming monitor.', price: 399, stock: 29, status: 'ACTIVE', brand_slug: 'hp', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'HyperX Pulsefire Haste 2', slug: 'hyperx-pulsefire-haste-2', description: 'Ultra-light gaming mouse.', price: 79, stock: 33, status: 'ACTIVE', brand_slug: 'hp', category_slug: 'mice', image_url: 'https://placehold.co/800x600.png' },
  { name: 'ThinkPad X1 Carbon Gen 12', slug: 'thinkpad-x1-carbon-gen-12', description: 'Enterprise ultrabook flagship.', price: 1899, stock: 13, status: 'ACTIVE', brand_slug: 'lenovo', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Legion Pro 7i Gen 9', slug: 'legion-pro-7i-gen-9', description: 'High-end gaming laptop.', price: 2599, stock: 10, status: 'ACTIVE', brand_slug: 'lenovo', category_slug: 'gaming-laptops', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Yoga 9i', slug: 'yoga-9i', description: '2-in-1 premium laptop.', price: 1699, stock: 12, status: 'ACTIVE', brand_slug: 'lenovo', category_slug: 'laptops', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Tab P12', slug: 'tab-p12', description: 'Productivity Android tablet.', price: 429, stock: 24, status: 'ACTIVE', brand_slug: 'lenovo', category_slug: 'tablets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'ThinkVision P27h-30', slug: 'thinkvision-p27h-30', description: 'Professional USB-C monitor.', price: 449, stock: 21, status: 'ACTIVE', brand_slug: 'lenovo', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Legion M600s Qi', slug: 'legion-m600s-qi', description: 'Wireless gaming mouse.', price: 89, stock: 28, status: 'ACTIVE', brand_slug: 'lenovo', category_slug: 'mice', image_url: 'https://placehold.co/800x600.png' },
  { name: 'ROG Zephyrus G14', slug: 'rog-zephyrus-g14', description: 'Portable premium gaming laptop.', price: 1999, stock: 9, status: 'ACTIVE', brand_slug: 'asus', category_slug: 'gaming-laptops', image_url: 'https://placehold.co/800x600.png' },
  { name: 'ROG Strix Scar 16', slug: 'rog-strix-scar-16', description: 'Flagship gaming machine.', price: 3199, stock: 5, status: 'ACTIVE', brand_slug: 'asus', category_slug: 'gaming-laptops', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Zenbook 14 OLED', slug: 'zenbook-14-oled', description: 'Creator ultrabook with OLED panel.', price: 1399, stock: 17, status: 'ACTIVE', brand_slug: 'asus', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'ProArt Display PA279CRV', slug: 'proart-display-pa279crv', description: 'Color-accurate 4K monitor.', price: 799, stock: 14, status: 'ACTIVE', brand_slug: 'asus', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'ROG Falchion RX', slug: 'rog-falchion-rx', description: 'Compact wireless gaming keyboard.', price: 149, stock: 30, status: 'ACTIVE', brand_slug: 'asus', category_slug: 'keyboards', image_url: 'https://placehold.co/800x600.png' },
  { name: 'ROG Delta S', slug: 'rog-delta-s', description: 'Hi-res gaming headset.', price: 179, stock: 23, status: 'ACTIVE', brand_slug: 'asus', category_slug: 'headsets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Xperia 1 VI', slug: 'xperia-1-vi', description: 'Camera-focused Android flagship.', price: 1199, stock: 8, status: 'ACTIVE', brand_slug: 'sony', category_slug: 'android-phones', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Inzone H9', slug: 'inzone-h9', description: 'Wireless gaming headset with ANC.', price: 299, stock: 18, status: 'ACTIVE', brand_slug: 'sony', category_slug: 'headsets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Inzone M9', slug: 'inzone-m9', description: '4K 144Hz gaming monitor.', price: 899, stock: 7, status: 'ACTIVE', brand_slug: 'sony', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Sony SRG-X120 Camera', slug: 'sony-srg-x120-camera', description: 'Professional streaming webcam.', price: 1099, stock: 4, status: 'ACTIVE', brand_slug: 'sony', category_slug: 'webcams', image_url: 'https://placehold.co/800x600.png' },
  { name: 'LG Gram 16', slug: 'lg-gram-16', description: 'Ultra-light productivity laptop.', price: 1599, stock: 11, status: 'ACTIVE', brand_slug: 'lg', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'LG UltraGear 27GR95QE', slug: 'lg-ultragear-27gr95qe', description: 'OLED esports monitor.', price: 999, stock: 9, status: 'ACTIVE', brand_slug: 'lg', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'LG UltraFine 32UN880', slug: 'lg-ultrafine-32un880', description: '4K Ergo professional monitor.', price: 699, stock: 13, status: 'ACTIVE', brand_slug: 'lg', category_slug: 'monitors', image_url: 'https://placehold.co/800x600.png' },
  { name: 'LG XBOOM 360 Headset', slug: 'lg-xboom-360-headset', description: 'Wireless headset for hybrid work.', price: 129, stock: 20, status: 'OUT_OF_STOCK', brand_slug: 'lg', category_slug: 'headsets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Surface Laptop 6', slug: 'surface-laptop-6', description: 'Premium Windows notebook.', price: 1499, stock: 16, status: 'ACTIVE', brand_slug: 'microsoft', category_slug: 'ultrabooks', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Surface Pro 10', slug: 'surface-pro-10', description: '2-in-1 tablet with keyboard option.', price: 1199, stock: 15, status: 'ACTIVE', brand_slug: 'microsoft', category_slug: 'tablets', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Surface Keyboard', slug: 'surface-keyboard', description: 'Minimal wireless keyboard.', price: 129, stock: 31, status: 'ACTIVE', brand_slug: 'microsoft', category_slug: 'keyboards', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Modern Webcam', slug: 'modern-webcam', description: '1080p webcam for Teams.', price: 69, stock: 47, status: 'ACTIVE', brand_slug: 'microsoft', category_slug: 'webcams', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Pixel 8 Pro', slug: 'pixel-8-pro', description: 'Google flagship Android phone.', price: 999, stock: 27, status: 'ACTIVE', brand_slug: 'google', category_slug: 'android-phones', image_url: 'https://placehold.co/800x600.png' },
  { name: 'Pixel Tablet', slug: 'pixel-tablet', description: 'Android tablet with dock support.', price: 499, stock: 19, status: 'DISCONTINUED', brand_slug: 'google', category_slug: 'tablets', image_url: 'https://placehold.co/800x600.png' },
];

const seedUsers = [
  { email: 'seed.alex@techcatalog.dev', username: 'alex_seed' },
  { email: 'seed.blair@techcatalog.dev', username: 'blair_seed' },
  { email: 'seed.casey@techcatalog.dev', username: 'casey_seed' },
  { email: 'seed.drew@techcatalog.dev', username: 'drew_seed' },
  { email: 'seed.emery@techcatalog.dev', username: 'emery_seed' },
  { email: 'seed.finley@techcatalog.dev', username: 'finley_seed' },
  { email: 'seed.gray@techcatalog.dev', username: 'gray_seed' },
  { email: 'seed.harper@techcatalog.dev', username: 'harper_seed' },
];

function getSpecPair(categorySlug: string): Array<{ key: string; value: string; unit?: string }> {
  if (categorySlug.includes('phones')) {
    return [
      { key: 'Chipset', value: 'Flagship SoC' },
      { key: 'Storage', value: '256', unit: 'GB' },
    ];
  }
  if (categorySlug === 'tablets') {
    return [
      { key: 'Display', value: '11', unit: 'inch' },
      { key: 'Storage', value: '256', unit: 'GB' },
    ];
  }
  if (categorySlug.includes('laptop') || categorySlug === 'ultrabooks' || categorySlug === 'laptops') {
    return [
      { key: 'Processor', value: 'High Performance CPU' },
      { key: 'RAM', value: '16', unit: 'GB' },
    ];
  }
  if (categorySlug === 'monitors') {
    return [
      { key: 'Panel', value: 'IPS/OLED' },
      { key: 'Refresh Rate', value: '144', unit: 'Hz' },
    ];
  }
  if (categorySlug === 'keyboards') {
    return [
      { key: 'Layout', value: 'TKL/Full' },
      { key: 'Connectivity', value: 'USB-C + 2.4GHz' },
    ];
  }
  if (categorySlug === 'mice') {
    return [
      { key: 'Sensor', value: 'Optical' },
      { key: 'DPI', value: '26000' },
    ];
  }
  if (categorySlug === 'headsets') {
    return [
      { key: 'Driver', value: '40', unit: 'mm' },
      { key: 'Connectivity', value: 'Wireless' },
    ];
  }
  if (categorySlug === 'webcams') {
    return [
      { key: 'Resolution', value: '1080p' },
      { key: 'Frame Rate', value: '60', unit: 'fps' },
    ];
  }
  if (categorySlug === 'ssds') {
    return [
      { key: 'Interface', value: 'PCIe 4.0 NVMe' },
      { key: 'Capacity', value: '2', unit: 'TB' },
    ];
  }
  return [
    { key: 'Capacity', value: '2', unit: 'TB' },
    { key: 'Interface', value: 'USB-C' },
  ];
}

async function ensureAuthUser(email: string, username: string): Promise<string> {
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'SeedPass!234',
    email_confirm: true,
    user_metadata: { username },
  });

  if (!createError && created.user) {
    return created.user.id;
  }

  const { data: listed, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  const existing = listed.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    throw new Error(`Unable to create or find seed auth user for ${email}`);
  }

  return existing.id;
}

async function run(): Promise<void> {
  await supabaseAdmin
    .from('brands')
    .upsert(brands, { onConflict: 'slug', ignoreDuplicates: true });

  await supabaseAdmin
    .from('categories')
    .upsert(
      categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
      })),
      { onConflict: 'slug', ignoreDuplicates: true },
    );

  const { data: allCategories, error: categoriesError } = await supabaseAdmin
    .from('categories')
    .select('id, slug');

  if (categoriesError || !allCategories) {
    throw categoriesError ?? new Error('Failed to load categories after upsert');
  }

  const categoryIdBySlug = new Map<string, string>(
    allCategories.map((category) => [category.slug as string, category.id as string]),
  );

  for (const category of categories) {
    if (!category.parent_slug) {
      continue;
    }
    await supabaseAdmin
      .from('categories')
      .update({ parent_id: categoryIdBySlug.get(category.parent_slug) })
      .eq('slug', category.slug);
  }

  const { data: allBrands, error: brandsError } = await supabaseAdmin.from('brands').select('id, slug');
  if (brandsError || !allBrands) {
    throw brandsError ?? new Error('Failed to load brands after upsert');
  }
  const brandIdBySlug = new Map<string, string>(
    allBrands.map((brand) => [brand.slug as string, brand.id as string]),
  );

  await supabaseAdmin
    .from('products')
    .upsert(
      products.map((product) => ({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status,
        brand_id: brandIdBySlug.get(product.brand_slug),
        category_id: categoryIdBySlug.get(product.category_slug),
        image_url: product.image_url,
        images: [product.image_url],
      })),
      { onConflict: 'slug', ignoreDuplicates: true },
    );

  const { data: allProducts, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, slug');
  if (productsError || !allProducts) {
    throw productsError ?? new Error('Failed to load products after upsert');
  }
  const productIdBySlug = new Map<string, string>(
    allProducts.map((product) => [product.slug as string, product.id as string]),
  );

  const specsPayload: Array<{
    product_id: string;
    key: string;
    value: string;
    unit?: string;
    display_order: number;
  }> = [];

  products.forEach((product, index) => {
    const productId = productIdBySlug.get(product.slug);
    if (!productId) {
      return;
    }

    const pair = getSpecPair(product.category_slug);
    pair.forEach((spec, specIndex) => {
      specsPayload.push({
        product_id: productId,
        key: spec.key,
        value: spec.value,
        unit: spec.unit,
        display_order: specIndex,
      });
    });

    if (index < 6) {
      specsPayload.push({
        product_id: productId,
        key: 'Battery',
        value: '12',
        unit: 'hours',
        display_order: pair.length,
      });
    }
  });

  await supabaseAdmin
    .from('specs')
    .upsert(specsPayload, { onConflict: 'product_id,key', ignoreDuplicates: true });

  const userIdByEmail = new Map<string, string>();
  for (const user of seedUsers) {
    const authUserId = await ensureAuthUser(user.email, user.username);
    userIdByEmail.set(user.email, authUserId);
    const profile = {
      id: authUserId,
      email: user.email,
      username: user.username,
      role: 'USER' as UserRole,
    };

    await supabaseAdmin.from('users').upsert(profile, {
      onConflict: 'id',
      ignoreDuplicates: true,
    });
  }

  const reviewsPayload: Array<{
    product_id: string;
    user_id: string;
    rating: number;
    title: string;
    comment: string;
    is_verified: boolean;
  }> = [];

  for (let i = 0; i < 32; i += 1) {
    const product = products[(i * 2) % products.length];
    const productId = productIdBySlug.get(product.slug);
    const user = seedUsers[i % seedUsers.length];
    const userId = userIdByEmail.get(user.email);

    if (!productId || !userId) {
      continue;
    }

    reviewsPayload.push({
      product_id: productId,
      user_id: userId,
      rating: (i % 5) + 1,
      title: `Review ${i + 1}`,
      comment: `Detailed test review #${i + 1} for ${product.name}.`,
      is_verified: i % 2 === 0,
    });
  }

  await supabaseAdmin
    .from('reviews')
    .upsert(reviewsPayload, { onConflict: 'product_id,user_id', ignoreDuplicates: true });

  console.log('✅ Brands: 10');
  console.log('✅ Categories: 15');
  console.log('✅ Products: 52');
  console.log('✅ Specs: 110');
  console.log('✅ Reviews: 32');
}

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

