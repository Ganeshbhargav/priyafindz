import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  parseProductsCsv,
  extractGoogleSheetCsvUrl,
  generateCsvTemplate,
  REQUIRED_COLUMNS
} from './src/utils/catalogLogic.ts';
import { DEMO_PRODUCTS } from './src/data/demoCatalog.ts';
import type { Product, CatalogMetadata } from './src/types/catalog.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-memory catalog state with server-side caching
interface ServerCatalogState {
  source: 'demo' | 'google_sheet';
  sheetUrl: string;
  sheetId: string;
  csvUrl: string;
  lastSyncedAt: string;
  products: Product[];
  errorMessage?: string;
  cachedAt: number;
}

const state: ServerCatalogState = {
  source: 'demo',
  sheetUrl: process.env.GOOGLE_SHEETS_URL || '',
  sheetId: process.env.GOOGLE_SHEET_ID || '',
  csvUrl: '',
  lastSyncedAt: new Date().toISOString(),
  products: DEMO_PRODUCTS,
  cachedAt: Date.now()
};

// Check if initial env has a Google Sheet configured
if (state.sheetUrl || state.sheetId) {
  const extracted = extractGoogleSheetCsvUrl(state.sheetUrl || state.sheetId);
  if (extracted.isValid) {
    state.csvUrl = extracted.csvUrl;
    state.sheetId = extracted.sheetId || state.sheetId;
  }
}

/**
 * Fetch and parse Google Sheet CSV server-side securely
 */
async function fetchSheetProducts(targetCsvUrl: string): Promise<{
  products: Product[];
  errors: string[];
  totalRows: number;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(targetCsvUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PriyaFindzCatalogBot/1.0 (Indian Fashion Storefront)',
        'Accept': 'text/csv,text/plain,*/*'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Sheets responded with status ${response.status} (${response.statusText}). Ensure sheet is shared to 'Anyone with the link' or Published to Web.`);
    }

    const csvText = await response.text();
    return parseProductsCsv(csvText);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Timeout connecting to Google Sheets. Please verify the URL.');
    }
    throw err;
  }
}

/**
 * GET /api/catalog
 * Returns current catalog (demo or live Google Sheets)
 */
app.get('/api/catalog', async (req, res) => {
  try {
    // If live Google Sheet is connected and cache is older than 60s, refresh in background
    if (state.source === 'google_sheet' && state.csvUrl) {
      const now = Date.now();
      if (now - state.cachedAt > 60000) {
        try {
          const result = await fetchSheetProducts(state.csvUrl);
          if (result.products.length > 0) {
            state.products = result.products;
            state.lastSyncedAt = new Date().toISOString();
            state.cachedAt = now;
            state.errorMessage = undefined;
          }
        } catch (err: any) {
          console.warn('[Catalog Refresh Warning]:', err.message);
          state.errorMessage = err.message;
        }
      }
    }

    const metadata: CatalogMetadata = {
      source: state.source,
      sheetId: state.sheetId,
      sheetUrl: state.sheetUrl,
      lastSyncedAt: state.lastSyncedAt,
      itemCount: state.products.length,
      status: state.source === 'demo' ? 'demo' : (state.errorMessage ? 'error' : 'connected'),
      errorMessage: state.errorMessage,
      validatedColumns: [...REQUIRED_COLUMNS]
    };

    res.json({
      metadata,
      products: state.products
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve catalog',
      message: error.message,
      fallbackProducts: DEMO_PRODUCTS
    });
  }
});

/**
 * POST /api/catalog/connect
 * Validates, tests and connects a real Google Sheet catalog
 */
app.post('/api/catalog/connect', async (req, res) => {
  const { sheetUrl } = req.body;

  if (!sheetUrl || typeof sheetUrl !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Google Sheet link or CSV URL is required.'
    });
  }

  const extracted = extractGoogleSheetCsvUrl(sheetUrl);
  if (!extracted.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Google Sheet URL. Provide a standard Google Sheets sharing URL, Published-to-Web link, or CSV export URL.'
    });
  }

  try {
    const parseResult = await fetchSheetProducts(extracted.csvUrl);

    if (parseResult.errors.length > 0) {
      return res.status(422).json({
        success: false,
        error: 'Schema validation error',
        details: parseResult.errors,
        requiredColumns: REQUIRED_COLUMNS,
        sampleRow: parseResult.products[0] || null
      });
    }

    if (parseResult.products.length === 0) {
      return res.status(422).json({
        success: false,
        error: 'Google Sheet contains no valid active product rows. Make sure you have at least one product row with a name and price.'
      });
    }

    // Success! Update active server state
    state.source = 'google_sheet';
    state.sheetUrl = sheetUrl;
    state.sheetId = extracted.sheetId || '';
    state.csvUrl = extracted.csvUrl;
    state.products = parseResult.products;
    state.lastSyncedAt = new Date().toISOString();
    state.cachedAt = Date.now();
    state.errorMessage = undefined;

    res.json({
      success: true,
      message: `Successfully connected Google Sheet! Loaded ${parseResult.products.length} products.`,
      metadata: {
        source: 'google_sheet',
        sheetId: state.sheetId,
        sheetUrl: state.sheetUrl,
        lastSyncedAt: state.lastSyncedAt,
        itemCount: state.products.length,
        status: 'connected'
      },
      previewProducts: parseResult.products.slice(0, 4)
    });
  } catch (err: any) {
    res.status(502).json({
      success: false,
      error: 'Failed to fetch spreadsheet',
      message: err.message,
      instructions: [
        '1. Ensure Google Sheet sharing is set to "Anyone with the link can view".',
        '2. Or go to File > Share > Publish to web > Select Sheet > choose CSV > Click Publish.',
        '3. Check that your header row contains: ' + REQUIRED_COLUMNS.join(', ')
      ]
    });
  }
});

/**
 * POST /api/catalog/reset-demo
 * Restores the curated demo catalog
 */
app.post('/api/catalog/reset-demo', (req, res) => {
  state.source = 'demo';
  state.sheetUrl = '';
  state.sheetId = '';
  state.csvUrl = '';
  state.products = DEMO_PRODUCTS;
  state.lastSyncedAt = new Date().toISOString();
  state.cachedAt = Date.now();
  state.errorMessage = undefined;

  res.json({
    success: true,
    message: 'Reset catalog to curated PriyaFindz demo collection.',
    metadata: {
      source: 'demo',
      lastSyncedAt: state.lastSyncedAt,
      itemCount: state.products.length,
      status: 'demo'
    }
  });
});

/**
 * GET /api/catalog/template.csv
 * Downloads the exact CSV template
 */
app.get('/api/catalog/template.csv', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="priyafindz_catalog_template.csv"');
  res.send(generateCsvTemplate());
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PriyaFindz Fashion Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
