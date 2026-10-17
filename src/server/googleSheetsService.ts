import crypto from 'crypto';
import type { Product, CatalogResponse } from '../types/catalog.ts';
import { DEMO_PRODUCTS } from '../data/demoCatalog.ts';
import { parseGoogleSheetsValues } from '../utils/catalogLogic.ts';

// In-memory server-side cache
interface CacheEntry {
  data: CatalogResponse;
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Creates an RS256 signed JWT for Google Service Account authentication
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

  // Handle various formats of private key from environment variables
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
 * Exchanges JWT for Google OAuth2 Bearer Access Token
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
 * Parses service account credentials from supported environment variable formats:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 * - GOOGLE_SERVICE_ACCOUNT_KEY (full JSON string)
 */
function resolveServiceAccountCredentials(): { email?: string; privateKey?: string } {
  // Option 1: Full JSON string
  const jsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (jsonKey) {
    try {
      const parsed = JSON.parse(jsonKey);
      return {
        email: parsed.client_email,
        privateKey: parsed.private_key
      };
    } catch {
      console.warn('[Credentials] Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON string');
    }
  }

  // Option 2: Individual email and private key env vars
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;

  if (email && privateKey) {
    return { email, privateKey };
  }

  return {};
}

/**
 * Retrieves catalog products from private Google Sheets or fallback demo data
 */
export async function getCatalogProducts(): Promise<CatalogResponse> {
  // Check memory cache
  const now = Date.now();
  if (memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    return memoryCache.data;
  }

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const { email, privateKey } = resolveServiceAccountCredentials();

  // If no private spreadsheet ID configured, serve curated demo catalog
  if (!spreadsheetId) {
    const demoResponse: CatalogResponse = {
      products: DEMO_PRODUCTS,
      total: DEMO_PRODUCTS.length,
      isDemo: true,
      cachedAt: new Date().toISOString()
    };
    memoryCache = { data: demoResponse, timestamp: now };
    return demoResponse;
  }

  try {
    let sheetValues: any[][] = [];

    // Mode A: Service Account (Recommended for private sheets)
    if (email && privateKey) {
      const accessToken = await getGoogleAccessToken(email, privateKey);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/A1:Z?valueRenderOption=UNFORMATTED_VALUE`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`[Google Sheets API Error] Status: ${response.status}`);
        throw new Error('Google Sheets API request failed');
      }

      const json = await response.json();
      sheetValues = json.values || [];
    } 
    // Mode B: Google Sheets API Key
    else if (apiKey) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/A1:Z?key=${encodeURIComponent(apiKey)}&valueRenderOption=UNFORMATTED_VALUE`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Sheets API Key fetch failed: ${response.status}`);
      }
      const json = await response.json();
      sheetValues = json.values || [];
    } else {
      console.warn('[Catalog Backend] Spreadsheet ID is set, but no service account credentials or API key provided. Serving demo catalog.');
      const demoResponse: CatalogResponse = {
        products: DEMO_PRODUCTS,
        total: DEMO_PRODUCTS.length,
        isDemo: true,
        cachedAt: new Date().toISOString()
      };
      return demoResponse;
    }

    // Parse rows into sanitized products
    const parsedProducts = parseGoogleSheetsValues(sheetValues);

    if (parsedProducts.length === 0) {
      console.warn('[Catalog Backend] Google Sheet was fetched, but contained 0 active products. Falling back to demo catalog.');
      return {
        products: DEMO_PRODUCTS,
        total: DEMO_PRODUCTS.length,
        isDemo: true,
        cachedAt: new Date().toISOString()
      };
    }

    const liveResponse: CatalogResponse = {
      products: parsedProducts,
      total: parsedProducts.length,
      isDemo: false,
      cachedAt: new Date().toISOString()
    };

    // Cache successful response
    memoryCache = { data: liveResponse, timestamp: now };
    return liveResponse;
  } catch (err: any) {
    console.error('[Catalog Backend Error] Failed to fetch Google Sheets catalog:', err.message);
    // Return friendly fallback without leaking credentials or stack traces
    return {
      products: DEMO_PRODUCTS,
      total: DEMO_PRODUCTS.length,
      isDemo: true,
      cachedAt: new Date().toISOString()
    };
  }
}
