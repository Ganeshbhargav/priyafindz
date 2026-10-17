import type { Product, Category } from '../types/catalog.ts';

export const REQUIRED_COLUMNS = [
  'product_id',
  'name',
  'description',
  'price_inr',
  'original_price_inr',
  'category',
  'merchant',
  'affiliate_url',
  'image_url',
  'reel_url',
  'featured',
  'active',
  'created_at'
] as const;

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
export function calculateDiscount(price: number, originalPrice: number): number {
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
 * Validates whether the CSV header includes all required columns.
 */
export function validateHeaders(headerRow: string[]): {
  isValid: boolean;
  missing: string[];
  normalizedHeaders: string[];
} {
  const normalizedHeaders = headerRow.map(h => 
    h.toLowerCase().trim().replace(/[\s-]+/g, '_')
  );

  const missing = REQUIRED_COLUMNS.filter(
    col => !normalizedHeaders.includes(col)
  );

  return {
    isValid: missing.length === 0,
    missing,
    normalizedHeaders
  };
}

/**
 * Parses a full CSV string into typed Product objects according to the required schema.
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
  const headerValidation = validateHeaders(rawHeaders);

  const errors: string[] = [];
  if (!headerValidation.isValid) {
    errors.push(`Missing required columns: ${headerValidation.missing.join(', ')}`);
  }

  // Map header index to column name
  const headerMap: Record<string, number> = {};
  headerValidation.normalizedHeaders.forEach((col, idx) => {
    headerMap[col] = idx;
  });

  const products: Product[] = [];

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const line = lines[rowIdx];
    const cells = parseCsvLine(line);

    const getCell = (col: string): string => {
      const idx = headerMap[col];
      return idx !== undefined && idx < cells.length ? cells[idx] : '';
    };

    const productId = getCell('product_id') || `prod-${rowIdx}`;
    const name = getCell('name');
    if (!name) {
      // Skip empty named rows
      continue;
    }

    const price = parsePrice(getCell('price_inr'));
    const originalPrice = parsePrice(getCell('original_price_inr'), price);
    const discount = calculateDiscount(price, originalPrice);

    const product: Product = {
      product_id: productId,
      name,
      description: getCell('description') || 'Trending curated fashion piece with exceptional quality and value.',
      price_inr: price,
      original_price_inr: originalPrice,
      category: getCell('category') || 'Ethnic Wear',
      merchant: getCell('merchant') || 'Meesho',
      affiliate_url: getCell('affiliate_url'),
      image_url: getCell('image_url'),
      reel_url: getCell('reel_url'),
      featured: parseBoolean(getCell('featured'), false),
      active: parseBoolean(getCell('active'), true),
      created_at: getCell('created_at') || new Date().toISOString().split('T')[0],
      discount_percent: discount,
      in_stock: true
    };

    products.push(product);
  }

  return {
    products,
    errors,
    totalRows: lines.length - 1
  };
}

/**
 * Filter and sort products according to storefront parameters.
 */
export function filterAndSortProducts(
  products: Product[],
  options: {
    category?: Category;
    searchQuery?: string;
    merchant?: string;
    maxPrice?: number;
    budgetTier?: 'under299' | 'under499' | 'under999' | 'all';
    sortBy?: 'trending' | 'price-asc' | 'price-desc' | 'discount' | 'newest';
    activeOnly?: boolean;
  }
): Product[] {
  let list = options.activeOnly !== false ? products.filter(p => p.active) : [...products];

  // Category filter
  if (options.category && options.category !== 'All') {
    if (options.category === 'Under ₹299') {
      list = list.filter(p => p.price_inr <= 299);
    } else if (options.category === 'Under ₹499') {
      list = list.filter(p => p.price_inr <= 499);
    } else if (options.category === 'Under ₹999') {
      list = list.filter(p => p.price_inr <= 999);
    } else {
      list = list.filter(p => p.category.toLowerCase() === options.category?.toLowerCase());
    }
  }

  // Budget Tier filter
  if (options.budgetTier && options.budgetTier !== 'all') {
    if (options.budgetTier === 'under299') {
      list = list.filter(p => p.price_inr <= 299);
    } else if (options.budgetTier === 'under499') {
      list = list.filter(p => p.price_inr <= 499);
    } else if (options.budgetTier === 'under999') {
      list = list.filter(p => p.price_inr <= 999);
    }
  }

  // Merchant filter
  if (options.merchant && options.merchant !== 'All') {
    list = list.filter(p => p.merchant.toLowerCase() === options.merchant?.toLowerCase());
  }

  // Max price filter
  if (options.maxPrice && options.maxPrice > 0) {
    list = list.filter(p => p.price_inr <= options.maxPrice!);
  }

  // Search query
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const q = options.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.merchant.toLowerCase().includes(q)
    );
  }

  // Sorting
  const sortBy = options.sortBy || 'trending';
  switch (sortBy) {
    case 'price-asc':
      list.sort((a, b) => a.price_inr - b.price_inr);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price_inr - a.price_inr);
      break;
    case 'discount':
      list.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
      break;
    case 'newest':
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'trending':
    default:
      // Featured first, then highest discount
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.discount_percent || 0) - (a.discount_percent || 0);
      });
      break;
  }

  return list;
}

/**
 * Generates an empty / sample CSV template for Google Sheets
 */
export function generateCsvTemplate(): string {
  const headers = REQUIRED_COLUMNS.join(',');
  const sampleRow1 = [
    'PF-101',
    '"Embroidered Anarkali Kurta Set with Dupatta"',
    '"Rich georgette with zari work, comes with stitched pant and organza dupatta."',
    '799',
    '2499',
    '"Ethnic Wear"',
    '"Meesho"',
    '"https://www.meesho.com/s/p/ethnic-set-101?aff=priya"',
    '"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"',
    '"https://www.instagram.com/reel/C8_example1/"',
    'true',
    'true',
    '2026-03-01'
  ].join(',');

  const sampleRow2 = [
    'PF-102',
    '"Floral Printed Cotton Co-ord Set"',
    '"Breathable premium pure cotton co-ord set for brunch and summer outings."',
    '449',
    '1299',
    '"Co-ord Sets"',
    '"Myntra"',
    '"https://www.myntra.com/coord-set-102?aff=priya"',
    '"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"',
    '""',
    'true',
    'true',
    '2026-03-02'
  ].join(',');

  return `${headers}\n${sampleRow1}\n${sampleRow2}\n`;
}

/**
 * Extracts Google Sheet ID from diverse Google Sheets URLs:
 * - https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit...
 * - https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pubhtml
 */
export function extractGoogleSheetCsvUrl(inputUrl: string): {
  csvUrl: string;
  sheetId?: string;
  isValid: boolean;
  type: 'public_csv' | 'sheet_id' | 'published_web' | 'unknown';
} {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return { csvUrl: '', isValid: false, type: 'unknown' };
  }

  // Case 1: Direct CSV link
  if (trimmed.endsWith('.csv') || trimmed.includes('output=csv') || trimmed.includes('format=csv')) {
    return { csvUrl: trimmed, isValid: true, type: 'public_csv' };
  }

  // Case 2: Published to web URL (docs.google.com/spreadsheets/d/e/{ID}/pubhtml or similar)
  const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch && pubMatch[1]) {
    const pubId = pubMatch[1];
    return {
      csvUrl: `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv`,
      isValid: true,
      type: 'published_web'
    };
  }

  // Case 3: Standard Google Sheet URL (docs.google.com/spreadsheets/d/{ID}/...)
  const standardMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (standardMatch && standardMatch[1]) {
    const sheetId = standardMatch[1];
    return {
      csvUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
      sheetId,
      isValid: true,
      type: 'sheet_id'
    };
  }

  // Case 4: Raw ID passed
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return {
      csvUrl: `https://docs.google.com/spreadsheets/d/${trimmed}/export?format=csv`,
      sheetId: trimmed,
      isValid: true,
      type: 'sheet_id'
    };
  }

  return { csvUrl: trimmed, isValid: false, type: 'unknown' };
}
