import type { IncomingMessage, ServerResponse } from 'http';
import { getDriveImage } from './googleDriveService.ts';
import { getAllowedImageFileIds } from './googleSheetsService.ts';
import { extractDriveFileId } from '../utils/catalogLogic.ts';

function sendJsonError(res: any, statusCode: number, errorMsg: string): void {
  res.statusCode = statusCode;
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json({ error: errorMsg });
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: errorMsg }));
  }
}

export async function handleImageDelivery(req: any, res: any): Promise<void> {
  // Global CORS & preflight headers for image embedding
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Resilient query extraction for Vercel Serverless & Express
  let query = req.query || {};
  if (!query.id && req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      query = Object.fromEntries(parsedUrl.searchParams.entries());
    } catch {}
  }

  const rawIdVal = query.id || query.fileId || query.driveId;
  const rawId = Array.isArray(rawIdVal) ? rawIdVal[0] : rawIdVal;

  if (!rawId || typeof rawId !== 'string') {
    sendJsonError(res, 400, "Missing required parameter 'id' (Google Drive file ID)");
    return;
  }

  // Explicitly guard against accidental folder ID usage
  const configuredFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (
    rawId.includes('/folders/') || 
    (configuredFolderId && (rawId === configuredFolderId || rawId.includes(configuredFolderId)))
  ) {
    sendJsonError(res, 400, 'Invalid image ID: The requested ID corresponds to a Google Drive folder, not an image file.');
    return;
  }

  const cleanFileId = extractDriveFileId(rawId);
  if (!cleanFileId || !/^[a-zA-Z0-9_-]{10,100}$/.test(cleanFileId)) {
    sendJsonError(res, 400, 'Invalid Google Drive file ID format');
    return;
  }

  try {
    // Check permission against active catalog imageFileIds
    let allowedIds: Set<string> | undefined;
    try {
      allowedIds = await getAllowedImageFileIds();
    } catch (e) {
      // If catalog is temporarily unreachable, fallback to Drive folder permission check
    }

    const result = await getDriveImage(cleanFileId, allowedIds);

    // Conditional GET evaluation (ETag / If-None-Match)
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag && clientEtag === result.etag) {
      res.statusCode = 304;
      res.end();
      return;
    }

    // Conditional GET evaluation (If-Modified-Since)
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince && result.lastModified) {
      const clientDate = new Date(ifModifiedSince).getTime();
      const serverDate = new Date(result.lastModified).getTime();
      if (!isNaN(clientDate) && !isNaN(serverDate) && serverDate <= clientDate) {
        res.statusCode = 304;
        res.end();
        return;
      }
    }

    // Cache-Control headers
    if (query.v) {
      // Versioned image request (immutable hash/mtime): cache heavily with stale-while-revalidate
      res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400');
    } else {
      // Unversioned image request: 1 day cache with stale-while-revalidate
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400');
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Length', result.contentLength.toString());
    res.setHeader('ETag', result.etag);
    res.setHeader('Last-Modified', result.lastModified);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method === 'HEAD') {
      res.statusCode = 200;
      res.end();
      return;
    }

    if (typeof res.status === 'function' && typeof res.send === 'function') {
      res.status(200).send(result.buffer);
    } else {
      res.statusCode = 200;
      res.end(result.buffer);
    }
  } catch (err: any) {
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
    
    // Log sanitized error on server without leaking sensitive info
    console.warn(`[Image Delivery Error] (File ${cleanFileId}): ${err.message}`);

    // Return sanitized safe client error
    sendJsonError(
      res, 
      statusCode, 
      statusCode < 500 ? err.message : 'Unable to retrieve image from storage'
    );
  }
}
