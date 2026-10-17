import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePrice,
  calculateDiscount,
  parseBoolean,
  parseCsvLine,
  sanitizeAffiliateUrl,
  normalizeProduct,
  parseGoogleSheetsValues,
  filterAndSortProducts,
  OFFICIAL_COLUMNS
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
  assert.equal(calculateDiscount(1200, 1000), 0);
  assert.equal(calculateDiscount(500, 500), 0);
});

test('parseBoolean properly parses boolean values from spreadsheets', () => {
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('TRUE'), true);
  assert.equal(parseBoolean('yes'), true);
  assert.equal(parseBoolean(1), true);
  assert.equal(parseBoolean('false'), false);
  assert.equal(parseBoolean('no'), false);
  assert.equal(parseBoolean('', false), false);
});

test('sanitizeAffiliateUrl permits only valid HTTPS/HTTP destinations', () => {
  assert.equal(sanitizeAffiliateUrl('https://meesho.com/p/1'), 'https://meesho.com/p/1');
  assert.equal(sanitizeAffiliateUrl('http://myntra.com/p/2'), 'http://myntra.com/p/2');
  assert.equal(sanitizeAffiliateUrl('javascript:alert(1)'), '#');
  assert.equal(sanitizeAffiliateUrl(''), '#');
  assert.equal(sanitizeAffiliateUrl(null), '#');
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

test('parseGoogleSheetsValues parses Google Sheets API 2D values array', () => {
  const values = [
    [
      'productId', 'productName', 'category', 'retailer', 'price',
      'originalPrice', 'imageUrl', 'affiliateUrl', 'description', 'reelUrl',
      'featured', 'isActive', 'createdAt'
    ],
    [
      'PF-201', 'Chanderi Kurta', 'Kurtis', 'Meesho', '399',
      '999', 'https://images.unsplash.com/sample.jpg', 'https://meesho.com/s/p/201',
      'Elegant summer kurti', '', 'true', 'true', '2026-03-01'
    ],
    [
      'PF-202', 'Discontinued Item', 'Dresses', 'Myntra', '799',
      '1999', 'https://images.unsplash.com/sample2.jpg', 'https://myntra.com/s/p/202',
      'Old stock', '', 'false', 'false', '2026-03-02'
    ]
  ];

  const products = parseGoogleSheetsValues(values);
  assert.equal(products.length, 1); // Second product is inactive, so excluded
  assert.equal(products[0].productId, 'PF-201');
  assert.equal(products[0].productName, 'Chanderi Kurta');
  assert.equal(products[0].price, 399);
  assert.equal(products[0].originalPrice, 999);
  assert.equal(products[0].discountPercent, 60);
  assert.equal(products[0].retailer, 'Meesho');
  assert.equal(products[0].isActive, true);
});

test('filterAndSortProducts handles search, category, and budget tiers (Under 299, 399, 499)', () => {
  const mockProducts: Product[] = [
    normalizeProduct({
      productId: '1',
      productName: 'Anarkali Kurta',
      description: 'Festive red',
      price: 899,
      originalPrice: 1999,
      category: 'Ethnic Wear',
      retailer: 'Meesho',
      affiliateUrl: 'https://meesho.com/1',
      imageUrl: 'https://img.com/1',
      featured: true,
      isActive: true,
      createdAt: '2026-03-01'
    }),
    normalizeProduct({
      productId: '2',
      productName: 'Cotton Kurti',
      description: 'Daily office wear',
      price: 249,
      originalPrice: 599,
      category: 'Kurtis',
      retailer: 'Myntra',
      affiliateUrl: 'https://myntra.com/2',
      imageUrl: 'https://img.com/2',
      featured: false,
      isActive: true,
      createdAt: '2026-03-02'
    }),
    normalizeProduct({
      productId: '3',
      productName: 'Pearl Choker Necklace',
      description: 'Golden jewelry',
      price: 349,
      originalPrice: 799,
      category: 'Accessories',
      retailer: 'Meesho',
      affiliateUrl: 'https://meesho.com/3',
      imageUrl: 'https://img.com/3',
      featured: false,
      isActive: true,
      createdAt: '2026-03-03'
    })
  ];

  // Category filter
  const ethnicOnly = filterAndSortProducts(mockProducts, { category: 'Ethnic Wear' });
  assert.equal(ethnicOnly.length, 1);
  assert.equal(ethnicOnly[0].productId, '1');

  // Budget category "Under ₹299"
  const under299 = filterAndSortProducts(mockProducts, { category: 'Under ₹299' });
  assert.equal(under299.length, 1);
  assert.equal(under299[0].productId, '2');

  // Budget category "Under ₹399"
  const under399 = filterAndSortProducts(mockProducts, { category: 'Under ₹399' });
  assert.equal(under399.length, 2);

  // Search query
  const searched = filterAndSortProducts(mockProducts, { searchQuery: 'pearl' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].productId, '3');
});
