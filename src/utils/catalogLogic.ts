import type { Product } from '../types/catalog.ts';

export const OFFICIAL_COLUMNS = [
  'productId',
  'productName',
  'category',
  'retailer',
  'price',
  'originalPrice',
  'imageFileId',
  'affiliateUrl',
  'description',
  'reelUrl',
  'featured',
  'isActive',
  'createdAt'
] as const;

export const COLUMN_ALIASES: Record<string, string> = {
  productid: 'productId',
  product_id: 'productId',
  id: 'productId',
  productname: 'productName',
  name: 'productName',
  title: 'productName',
  category: 'category',
  retailer: 'retailer',
  merchant: 'retailer',
  store: 'retailer',
  brand: 'retailer',
  price: 'price',
  price_inr: 'price',
  priceinr: 'price',
  originalprice: 'originalPrice',
  original_price: 'originalPrice',
  original_price_inr: 'originalPrice',
  mrp: 'originalPrice',
  
  // Google Drive File ID column headers and aliases
  imagefileid: 'imageFileId',
  image_file_id: 'imageFileId',
  imagefile: 'imageFileId',
  image_file: 'imageFileId',
  imageid: 'imageFileId',
  image_id: 'imageFileId',
  drivefileid: 'imageFileId',
  drive_file_id: 'imageFileId',
  drivefile: 'imageFileId',
  drive_file: 'imageFileId',
  driveid: 'imageFileId',
  drive_id: 'imageFileId',
  fileid: 'imageFileId',
  file_id: 'imageFileId',
  googledrivefileid: 'imageFileId',
  google_drive_file_id: 'imageFileId',
  googledriveid: 'imageFileId',
  google_drive_id: 'imageFileId',
  googledrivefile: 'imageFileId',
  driveimageid: 'imageFileId',
  driveimage: 'imageFileId',
  imagedriveid: 'imageFileId',
  productimagefileid: 'imageFileId',
  productimageid: 'imageFileId',
  productimage: 'imageFileId',
  photoid: 'imageFileId',
  drivelink: 'imageFileId',
  imagelink: 'imageFileId',
  imagegoogledriveid: 'imageFileId',
  imageiddrive: 'imageFileId',
  googledriveimageid: 'imageFileId',

  // Backward compatibility aliases mapping to imageFileId
  imageurl: 'imageFileId',
  image_url: 'imageFileId',
  image: 'imageFileId',
  photo: 'imageFileId',
  picture: 'imageFileId',
  pic: 'imageFileId',
  img: 'imageFileId',
  imgurl: 'imageFileId',

  affiliateurl: 'affiliateUrl',
  affiliate_url: 'affiliateUrl',
  url: 'affiliateUrl',
  link: 'affiliateUrl',
  description: 'description',
  desc: 'description',
  reelurl: 'reelUrl',
  reel_url: 'reelUrl',
  reel: 'reelUrl',
  instagram: 'reelUrl',
  featured: 'featured',
  isfeatured: 'featured',
  is_featured: 'featured',
  isactive: 'isActive',
  is_active: 'isActive',
  active: 'isActive',
  createdat: 'createdAt',
  created_at: 'createdAt',
  date: 'createdAt'
};

/**
 * Extracts a Google Drive file ID from a raw string, URL, or identifier.
 * Explicitly rejects Google Drive folder URLs and configured folder IDs (folders are not images).
 */
export function extractDriveFileId(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  // Explicitly reject Google Drive folder URLs
  if (/\/drive\/folders\/[a-zA-Z0-9_-]+/i.test(trimmed) || /\/folders\/[a-zA-Z0-9_-]+/i.test(trimmed)) {
    return '';
  }

  // Reject if it matches the configured folder ID
  const envFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (envFolderId && (trimmed === envFolderId || trimmed.includes(envFolderId))) {
    return '';
  }

  // Match /file/d/<fileId>/view or similar URL
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch) return fileDMatch[1];

  // Match id=<fileId> query param
  const idQueryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idQueryMatch) return idQueryMatch[1];

  // Match open?id=<fileId>
  const openMatch = trimmed.match(/open\?id=([a-zA-Z0-9_-]+)/i);
  if (openMatch) return openMatch[1];

  // Check if it's a pure Google Drive File ID (10 to 100 alphanumeric with dashes/underscores)
  if (/^[a-zA-Z0-9_-]{10,100}$/.test(trimmed)) {
    return trimmed;
  }

  // If it's another format or URL, return empty if invalid or return trimmed if no spaces
  return trimmed.includes(' ') ? '' : trimmed;
}

/**
 * Extracts a Google Drive folder ID from a raw ID, folder URL, or query parameter.
 * Handles URLs like https://drive.google.com/drive/folders/<FOLDER_ID>?usp=drive_link
 */
export function extractFolderId(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/i);
  if (folderMatch) return folderMatch[1];

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch) return idParamMatch[1];

  const clean = trimmed.split('?')[0].split('#')[0].trim();
  if (/^[a-zA-Z0-9_-]{10,100}$/.test(clean)) {
    return clean;
  }
  return clean;
}

/**
 * Formats a product's image URL to point to the server-side /api/image endpoint
 * with optional cache-busting version parameter based on Drive file mtime/md5.
 */
export function formatProductImageUrl(imageFileId?: string, version?: string): string {
  if (!imageFileId || typeof imageFileId !== 'string' || !imageFileId.trim()) {
    return '';
  }
  const cleanId = extractDriveFileId(imageFileId);
  if (!cleanId) return '';
  
  // If cleanId is already a full external image URL (non-drive), return as-is
  if (/^https?:\/\//i.test(cleanId) && !cleanId.includes('drive.google.com')) {
    return cleanId;
  }

  const vParam = version ? `&v=${encodeURIComponent(version)}` : '';
  return `/api/image?id=${encodeURIComponent(cleanId)}${vParam}`;
}

/**
 * Validates and sanitizes affiliate URL (ensures valid HTTPS or HTTP)
 */
export function sanitizeAffiliateUrl(rawUrl: unknown, fallbackUrl = '#'): string {
  if (!rawUrl || typeof rawUrl !== 'string') return fallbackUrl;
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return fallbackUrl;
}

/**
 * Parses numeric currency strings safely handling '₹', ',', and spaces.
 */
export function parsePrice(val: unknown, fallback = 0): number {
  if (typeof val === 'number') {
    return isNaN(val) ? fallback : Math.max(0, val);
  }
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^\d.-]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : Math.max(0, num);
}

/**
 * Calculates percentage discount saved.
 */
export function calculateDiscount(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
  return Math.min(99, Math.max(0, pct));
}

/**
 * Parses boolean fields from spreadsheet variations ("true", "TRUE", "yes", "1", 1).
 */
export function parseBoolean(val: unknown, defaultValue = false): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (!val) return defaultValue;
  const s = String(val).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'active' || s === 'y';
}

/**
 * Normalizes raw product fields into standard Product type with imageFileId and dynamic /api/image delivery.
 */
export function normalizeProduct(raw: Record<string, any>, index = 1): Product {
  const productId = String(raw.productId || raw.product_id || raw.id || `pf-${index}`).trim();
  const productName = String(raw.productName || raw.name || raw.title || 'Curated Fashion Find').trim();
  const category = String(raw.category || 'Ethnic Wear').trim();
  const retailer = String(raw.retailer || raw.merchant || 'Meesho').trim();
  const price = parsePrice(raw.price ?? raw.price_inr);
  const originalPriceRaw = parsePrice(raw.originalPrice ?? raw.original_price_inr, 0);
  const originalPrice = originalPriceRaw > price ? originalPriceRaw : undefined;
  const discountPercent = originalPrice ? calculateDiscount(price, originalPrice) : 0;
  
  // Extract Google Drive File ID
  const rawImageVal = String(
    raw.imageFileId || raw.image_file_id || raw.imageUrl || raw.image_url || raw.image || raw.photo || ''
  ).trim();

  const driveId = extractDriveFileId(rawImageVal);
  const imageFileId = driveId || undefined;

  // Format delivery URL (empty string indicates no image -> neutral branded placeholder will render)
  let imageUrl = '';
  if (imageFileId) {
    imageUrl = formatProductImageUrl(imageFileId, raw.imageVersion || raw.version);
  } else if (rawImageVal && /^https?:\/\//i.test(rawImageVal) && !rawImageVal.includes('drive.google.com')) {
    imageUrl = rawImageVal;
  }

  const affiliateUrl = sanitizeAffiliateUrl(raw.affiliateUrl ?? raw.affiliate_url);
  const description = String(raw.description || raw.desc || 'Curated trendy fashion piece with verified quality and exceptional pricing.').trim();
  const reelUrl = raw.reelUrl || raw.reel_url ? String(raw.reelUrl || raw.reel_url).trim() : undefined;
  const featured = parseBoolean(raw.featured ?? raw.is_featured ?? raw.isFeatured, false);
  const isActive = parseBoolean(raw.isActive ?? raw.active ?? raw.is_active, true);
  const createdAt = String(raw.createdAt || raw.created_at || new Date().toISOString().split('T')[0]).trim();

  return {
    productId,
    productName,
    category,
    retailer,
    price,
    originalPrice,
    imageFileId,
    imageUrl,
    affiliateUrl,
    description,
    reelUrl,
    featured,
    isActive,
    createdAt,
    discountPercent,

    // Aliases
    product_id: productId,
    name: productName,
    merchant: retailer,
    price_inr: price,
    original_price_inr: originalPrice ?? price,
    image_file_id: imageFileId,
    image_url: imageUrl,
    affiliate_url: affiliateUrl,
    reel_url: reelUrl,
    active: isActive,
    discount_percent: discountPercent,
    tags: raw.tags || []
  };
}

/**
 * Parses raw 2D values array from Google Sheets API v4
 */
export function parseGoogleSheetsValues(values: any[][]): Product[] {
  if (!values || values.length < 2) return [];

  const headerRow = values[0].map((h: any) => 
    String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const columnMap: Record<string, number> = {};
  headerRow.forEach((header: string, idx: number) => {
    const canonical = COLUMN_ALIASES[header];
    if (canonical) {
      columnMap[canonical] = idx;
    }
  });

  const products: Product[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0) continue;

    const rowObj: Record<string, any> = {};
    for (const [propName, colIdx] of Object.entries(columnMap)) {
      if (colIdx < row.length) {
        rowObj[propName] = row[colIdx];
      }
    }

    // Skip empty name or empty price
    const name = rowObj.productName;
    if (!name || String(name).trim() === '') continue;

    const product = normalizeProduct(rowObj, i);
    // Exclude inactive products
    if (product.isActive) {
      products.push(product);
    }
  }

  return products;
}

/**
 * Robust CSV Line Parser that handles commas inside quoted fields.
 */
export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

/**
 * Parses CSV text into products
 */
export function parseProductsCsv(csvText: string): {
  products: Product[];
  errors: string[];
  totalRows: number;
} {
  const lines = csvText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    return { products: [], errors: ['CSV content is empty'], totalRows: 0 };
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const rows = lines.map(line => parseCsvLine(line));
  const products = parseGoogleSheetsValues(rows);

  return {
    products,
    errors: [],
    totalRows: lines.length - 1
  };
}

/**
 * Filter and sort products according to storefront parameters.
 */
export function filterAndSortProducts(
  products: Product[],
  options: {
    category?: string;
    searchQuery?: string;
    retailer?: string;
    merchant?: string;
    maxPrice?: number;
    budgetTier?: 'under299' | 'under399' | 'under499' | 'under999' | 'all';
    sortBy?: 'trending' | 'price-asc' | 'price-desc' | 'discount' | 'newest';
    activeOnly?: boolean;
  }
): Product[] {
  let list = options.activeOnly !== false ? products.filter(p => p.isActive) : [...products];

  // Category filter
  if (options.category && options.category !== 'All') {
    const cat = String(options.category).trim();
    if (cat === 'Under ₹299') {
      list = list.filter(p => p.price <= 299);
    } else if (cat === 'Under ₹399') {
      list = list.filter(p => p.price <= 399);
    } else if (cat === 'Under ₹499') {
      list = list.filter(p => p.price <= 499);
    } else if (cat === 'Under ₹999') {
      list = list.filter(p => p.price <= 999);
    } else {
      list = list.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }
  }

  // Budget Tier filter
  if (options.budgetTier && options.budgetTier !== 'all') {
    if (options.budgetTier === 'under299') {
      list = list.filter(p => p.price <= 299);
    } else if (options.budgetTier === 'under399') {
      list = list.filter(p => p.price <= 399);
    } else if (options.budgetTier === 'under499') {
      list = list.filter(p => p.price <= 499);
    } else if (options.budgetTier === 'under999') {
      list = list.filter(p => p.price <= 999);
    }
  }

  // Retailer filter
  const retailer = options.retailer || options.merchant;
  if (retailer && retailer !== 'All') {
    list = list.filter(p => p.retailer.toLowerCase() === retailer.toLowerCase());
  }

  // Max price filter
  if (options.maxPrice && options.maxPrice > 0) {
    list = list.filter(p => p.price <= options.maxPrice!);
  }

  // Search query (search product name, description, category, retailer)
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const q = options.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.productName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.retailer.toLowerCase().includes(q)
    );
  }

  // Sorting
  const sortBy = options.sortBy || 'trending';
  switch (sortBy) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'discount':
      list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
      break;
    case 'newest':
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'trending':
    default:
      // Featured first, then highest discount
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.discountPercent || 0) - (a.discountPercent || 0);
      });
      break;
  }

  return list;
}
