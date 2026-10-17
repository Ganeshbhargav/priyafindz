import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePrice,
  calculateDiscount,
  parseBoolean,
  parseCsvLine,
  validateHeaders,
  parseProductsCsv,
  filterAndSortProducts,
  extractGoogleSheetCsvUrl,
  REQUIRED_COLUMNS
} from './catalogLogic.ts';
import type { Product } from '../types/catalog.ts';

test('parsePrice handles INR symbols, commas, and invalid inputs', () => {
  assert.equal(parsePrice('₹799'), 799);
  assert.equal(parsePrice('  1,499.50 '), 1499.5);
  assert.equal(parsePrice('Free', 100), 100);
  assert.equal(parsePrice(null, 50), 50);
  assert.equal(parsePrice(-20, 0), 0);
});

test('calculateDiscount calculates percentage discount correctly', () => {
  assert.equal(calculateDiscount(500, 1000), 50);
  assert.equal(calculateDiscount(799, 2499), 68);
  assert.equal(calculateDiscount(1200, 1000), 0); // No discount when price > original
  assert.equal(calculateDiscount(500, 500), 0);
});

test('parseBoolean properly parses boolean values', () => {
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('TRUE'), true);
  assert.equal(parseBoolean('yes'), true);
  assert.equal(parseBoolean(1), true);
  assert.equal(parseBoolean('false'), false);
  assert.equal(parseBoolean('no'), false);
  assert.equal(parseBoolean('', false), false);
});

test('parseCsvLine parses quoted values containing commas', () => {
  const line = 'PF-101,"Kurta, Pant & Dupatta Set","Rich fabric, soft",499';
  const parsed = parseCsvLine(line);
  assert.equal(parsed.length, 4);
  assert.equal(parsed[0], 'PF-101');
  assert.equal(parsed[1], 'Kurta, Pant & Dupatta Set');
  assert.equal(parsed[2], 'Rich fabric, soft');
  assert.equal(parsed[3], '499');
});

test('validateHeaders detects missing required columns', () => {
  const validHeaders = [...REQUIRED_COLUMNS];
  const resValid = validateHeaders(validHeaders);
  assert.equal(resValid.isValid, true);
  assert.equal(resValid.missing.length, 0);

  const missingHeaders = ['product_id', 'name', 'price_inr'];
  const resInvalid = validateHeaders(missingHeaders);
  assert.equal(resInvalid.isValid, false);
  assert.ok(resInvalid.missing.includes('affiliate_url'));
  assert.ok(resInvalid.missing.includes('category'));
});

test('parseProductsCsv parses CSV text into typed products', () => {
  const csv = [
    REQUIRED_COLUMNS.join(','),
    'PF-01,"Chikankari Kurti","Hand embroidered lucknowi kurti",399,999,"Kurtis","Meesho","https://meesho.com/p/1","https://img.com/1","https://instagram.com/reel/1",true,true,2026-03-01',
    'PF-02,"A-line Western Dress","Floral summer dress",599,1499,"Dresses","Myntra","https://myntra.com/p/2","https://img.com/2","",false,true,2026-03-02'
  ].join('\n');

  const result = parseProductsCsv(csv);
  assert.equal(result.errors.length, 0);
  assert.equal(result.products.length, 2);
  assert.equal(result.products[0].product_id, 'PF-01');
  assert.equal(result.products[0].price_inr, 399);
  assert.equal(result.products[0].original_price_inr, 999);
  assert.equal(result.products[0].discount_percent, 60);
  assert.equal(result.products[0].featured, true);
  assert.equal(result.products[0].active, true);
  assert.equal(result.products[1].featured, false);
});

test('filterAndSortProducts handles search, category, and budget tiers', () => {
  const mockProducts: Product[] = [
    {
      product_id: '1',
      name: 'Anarkali Kurta',
      description: 'Festive red',
      price_inr: 899,
      original_price_inr: 1999,
      category: 'Ethnic Wear',
      merchant: 'Meesho',
      affiliate_url: 'https://meesho.com/1',
      image_url: 'https://img.com/1',
      featured: true,
      active: true,
      created_at: '2026-03-01',
      discount_percent: 55
    },
    {
      product_id: '2',
      name: 'Cotton Kurti',
      description: 'Daily office wear',
      price_inr: 249,
      original_price_inr: 599,
      category: 'Kurtis',
      merchant: 'Myntra',
      affiliate_url: 'https://myntra.com/2',
      image_url: 'https://img.com/2',
      featured: false,
      active: true,
      created_at: '2026-03-02',
      discount_percent: 58
    },
    {
      product_id: '3',
      name: 'Pearl Choker Necklace',
      description: 'Golden jewelry',
      price_inr: 199,
      original_price_inr: 499,
      category: 'Accessories',
      merchant: 'Meesho',
      affiliate_url: 'https://meesho.com/3',
      image_url: 'https://img.com/3',
      featured: false,
      active: true,
      created_at: '2026-03-03',
      discount_percent: 60
    }
  ];

  // Category filter
  const ethnicOnly = filterAndSortProducts(mockProducts, { category: 'Ethnic Wear' });
  assert.equal(ethnicOnly.length, 1);
  assert.equal(ethnicOnly[0].product_id, '1');

  // Budget category "Under ₹299"
  const under299 = filterAndSortProducts(mockProducts, { category: 'Under ₹299' });
  assert.equal(under299.length, 2);

  // Search query
  const searched = filterAndSortProducts(mockProducts, { searchQuery: 'pearl' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].product_id, '3');

  // Sort by price asc
  const priceAsc = filterAndSortProducts(mockProducts, { sortBy: 'price-asc' });
  assert.equal(priceAsc[0].price_inr, 199);
  assert.equal(priceAsc[2].price_inr, 899);
});

test('extractGoogleSheetCsvUrl extracts export links from multiple URL patterns', () => {
  const url1 = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0';
  const res1 = extractGoogleSheetCsvUrl(url1);
  assert.equal(res1.isValid, true);
  assert.equal(res1.sheetId, '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  assert.ok(res1.csvUrl.includes('export?format=csv'));

  const url2 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSamplePubId12345/pubhtml';
  const res2 = extractGoogleSheetCsvUrl(url2);
  assert.equal(res2.isValid, true);
  assert.ok(res2.csvUrl.includes('output=csv'));
});
