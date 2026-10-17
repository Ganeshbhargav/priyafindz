import crypto from 'crypto';
import type { Product, CatalogResponse } from '../types/catalog.ts';
import { parseGoogleSheetsValues, parseProductsCsv, extractDriveFileId } from '../utils/catalogLogic.ts';
import { 
  resolveServiceAccountCredentials, 
  enrichProductsWithDriveVersions 
} from './googleDriveService.ts';

// In-memory server-side cache
interface CacheEntry {
  data: CatalogResponse;
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache for fresh sync

/**
 * Creates an RS256 signed JWT for Google Service Account authentication (Sheets scope)
 */
function createServiceAccountJwt(clientEmail: string, privateKey: string): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Url = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64Url(header);
  const encodedClaimSet = base64Url(claimSet);
  const signingInput = `${encodedHeader}.${encodedClaimSet}`;

  let normalizedKey = privateKey.trim();
  if (normalizedKey.includes('\\n')) {
    normalizedKey = normalizedKey.replace(/\\n/g, '\n');
  }

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  sign.end();
  const signature = sign
    .sign(normalizedKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signingInput}.${signature}`;
}

/**
 * Exchanges JWT for Google OAuth2 Bearer Access Token for Sheets
 */
async function getGoogleAccessToken(email: string, privateKey: string): Promise<string> {
  const assertion = createServiceAccountJwt(email, privateKey);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Google Service Account Auth Error]:', response.status, errorBody);
    throw new Error('Failed to authenticate Google Service Account');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Extracts spreadsheet ID from various formats (raw ID, full URL)
 */
function normalizeSpreadsheetId(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return trimmed;
}

/**
 * Retrieves the set of currently allowed product imageFileIds
 */
export async function getAllowedImageFileIds(): Promise<Set<string>> {
  const catalog = await getCatalogProducts();
  const set = new Set<string>();
  for (const product of catalog.products) {
    if (product.imageFileId) {
      set.add(product.imageFileId);
      const clean = extractDriveFileId(product.imageFileId);
      if (clean) set.add(clean);
    }
  }
  return set;
}

/**
 * Retrieves catalog products exclusively from Google Sheets
 * NEVER returns mock or demo fallback data.
 */
export async function getCatalogProducts(): Promise<CatalogResponse> {
  const now = Date.now();
  if (memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    return memoryCache.data;
  }

  const rawSpreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
  const spreadsheetId = normalizeSpreadsheetId(rawSpreadsheetId);
  const directCsvUrl = process.env.GOOGLE_SHEET_CSV_URL || process.env.GOOGLE_SHEETS_CSV_URL;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const { email, privateKey } = resolveServiceAccountCredentials();

  // If no spreadsheet configured yet, return empty list
  if (!spreadsheetId && !directCsvUrl) {
    return {
      products: [],
      total: 0,
      cachedAt: new Date().toISOString()
    };
  }

  const tabName = process.env.GOOGLE_SHEETS_TAB_NAME || process.env.GOOGLE_SHEET_TAB_NAME;
  const customRange = process.env.GOOGLE_SHEETS_RANGE || (tabName ? `'${tabName}'!A1:Z` : 'A1:Z');

  try {
    let parsedProducts: Product[] = [];

    // Mode 1: Service Account (Recommended for private Google Sheets)
    if (spreadsheetId && email && privateKey) {
      const accessToken = await getGoogleAccessToken(email, privateKey);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(customRange)}?valueRenderOption=UNFORMATTED_VALUE`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API responded with status ${response.status}`);
      }

      const json = await response.json();
      parsedProducts = parseGoogleSheetsValues(json.values || []);
    } 
    // Mode 2: Google Sheets API Key
    else if (spreadsheetId && apiKey) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/A1:Z?key=${encodeURIComponent(apiKey)}&valueRenderOption=UNFORMATTED_VALUE`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Sheets API Key fetch failed with status ${response.status}`);
      }
      const json = await response.json();
      parsedProducts = parseGoogleSheetsValues(json.values || []);
    }
    // Mode 3: Direct CSV Export URL or Public/Viewable Sheet Export
    else {
      const csvFetchUrl = directCsvUrl || `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?tqx=out:csv`;
      const response = await fetch(csvFetchUrl);
      if (!response.ok) {
        // Try fallback export url
        const fallbackUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv`;
        const res2 = await fetch(fallbackUrl);
        if (!res2.ok) {
          throw new Error(`Failed to fetch Google Sheet CSV: ${response.status}`);
        }
        const text = await res2.text();
        parsedProducts = parseProductsCsv(text).products;
      } else {
        const text = await response.text();
        parsedProducts = parseProductsCsv(text).products;
      }
    }

    // Only active products are served to visitors
    const activeProducts = parsedProducts.filter(p => p.isActive);

    // Enrich products with Drive versions for cache busting (?v=...)
    const enrichedProducts = await enrichProductsWithDriveVersions(activeProducts);

    const liveResponse: CatalogResponse = {
      products: enrichedProducts,
      total: enrichedProducts.length,
      cachedAt: new Date().toISOString()
    };

    memoryCache = { data: liveResponse, timestamp: now };
    return liveResponse;
  } catch (err: any) {
    console.error('[Catalog Backend Error] Failed to fetch Google Sheet:', err.message);
    // Never fallback to demo products! Return clean empty catalog with zero mock data.
    return {
      products: [],
      total: 0,
      cachedAt: new Date().toISOString()
    };
  }
}
