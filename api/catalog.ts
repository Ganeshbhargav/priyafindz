import { getCatalogProducts } from '../src/server/googleSheetsService.ts';

export default async function handler(req: any, res: any) {
  // Public caching headers for Vercel Edge / CDN
  res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=360');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const catalog = await getCatalogProducts();
    return res.status(200).json(catalog);
  } catch (error) {
    console.error('[API Catalog Handler Error]', error);
    return res.status(503).json({
      error: 'Product catalog is temporarily unavailable. Please try again shortly.',
      products: [],
      total: 0
    });
  }
}
