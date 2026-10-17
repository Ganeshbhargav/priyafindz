import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { getCatalogProducts } from './src/server/googleSheetsService.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

/**
 * Public Storefront Catalog Endpoint
 * Dispatches to private Google Sheets service or curated demo data
 */
app.get('/api/catalog', async (req, res) => {
  try {
    const catalog = await getCatalogProducts();
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json(catalog);
  } catch (err: any) {
    console.error('[Server /api/catalog Error]:', err.message);
    res.status(500).json({
      products: [],
      total: 0,
      isDemo: true,
      error: 'Failed to load catalog'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(import.meta.dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(import.meta.dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PriyaFindz Production-Ready Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
