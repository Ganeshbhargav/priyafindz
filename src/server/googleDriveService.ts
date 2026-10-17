import crypto from 'crypto';
import type { Product } from '../types/catalog.ts';
import { extractDriveFileId, extractFolderId } from '../utils/catalogLogic.ts';

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  md5Checksum?: string;
  modifiedTime?: string;
  trashed?: boolean;
  parents?: string[];
}

export interface DriveImageResult {
  buffer: Buffer;
  contentType: string;
  contentLength: number;
  etag: string;
  lastModified: string;
  version: string;
}

// In-memory cache for file metadata and access tokens
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const METADATA_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
const metadataCache = new Map<string, CacheEntry<DriveFileMetadata>>();

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml'
]);

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 Megabytes

/**
 * Normalizes PEM private key formatting across Vercel and local environments.
 * Strips accidental outer quotes, handles literal escaped newlines and CRLF.
 */
export function normalizePrivateKey(key: string): string {
  if (!key) return '';
  let normalized = key.trim();
  // Strip outer quotes if pasted with surrounding quotes
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  // Convert literal \\n to real newlines
  if (normalized.includes('\\n')) {
    normalized = normalized.replace(/\\n/g, '\n');
  }
  // Normalize CRLF to LF
  return normalized.replace(/\r\n/g, '\n');
}

/**
 * Resolves Service Account credentials from environment variables safely.
 * Supports multiple JSON key and individual key variable aliases.
 */
export function resolveServiceAccountCredentials(): { email?: string; privateKey?: string } {
  // Check JSON format in all common env var names
  const jsonKey = 
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY || 
    process.env.GCP_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (jsonKey && jsonKey.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(jsonKey.trim());
      if (parsed.client_email && parsed.private_key) {
        return {
          email: parsed.client_email,
          privateKey: normalizePrivateKey(parsed.private_key)
        };
      }
    } catch {
      console.warn('[Credentials] Failed to parse Service Account JSON key string');
    }
  }

  // Check individual email and private key env vars
  const email = 
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 
    process.env.GOOGLE_CLIENT_EMAIL ||
    process.env.GCP_CLIENT_EMAIL ||
    process.env.CLIENT_EMAIL;

  const rawKey = 
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || 
    process.env.GOOGLE_PRIVATE_KEY ||
    process.env.GCP_PRIVATE_KEY ||
    process.env.PRIVATE_KEY;

  if (email && rawKey) {
    return { 
      email: email.trim(), 
      privateKey: normalizePrivateKey(rawKey) 
    };
  }

  return {};
}

/**
 * Creates RS256 signed JWT for Google Service Account authentication with Drive scope
 */
function createServiceAccountDriveJwt(clientEmail: string, privateKey: string): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
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

  const normalizedKey = normalizePrivateKey(privateKey);
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
 * Retrieves an authenticated Google Drive Access Token with in-memory caching
 */
export async function getDriveAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60 * 1000) {
    return cachedAccessToken.token;
  }

  const { email, privateKey } = resolveServiceAccountCredentials();
  if (!email || !privateKey) {
    throw new Error('Google Service Account credentials not configured for Drive access');
  }

  const assertion = createServiceAccountDriveJwt(email, privateKey);
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
    console.error('[Google Drive Auth Error]:', response.status, errorBody);
    throw new Error('Failed to authenticate Google Service Account for Google Drive');
  }

  const data = await response.json();
  const expiresInSeconds = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: now + expiresInSeconds * 1000
  };

  return cachedAccessToken.token;
}

/**
 * Computes a cache-busting version token from file metadata
 */
export function computeVersionToken(meta: DriveFileMetadata): string {
  if (meta.md5Checksum) {
    return meta.md5Checksum.substring(0, 12);
  }
  if (meta.modifiedTime) {
    const epoch = new Date(meta.modifiedTime).getTime();
    if (!isNaN(epoch)) return epoch.toString(36);
  }
  return 'v1';
}

/**
 * Fetches file metadata from Google Drive API with caching
 */
export async function getDriveFileMetadata(fileId: string): Promise<DriveFileMetadata> {
  const cleanId = extractDriveFileId(fileId);
  if (!cleanId || !/^[a-zA-Z0-9_-]{10,100}$/.test(cleanId)) {
    const err = new Error('Invalid Google Drive file ID format');
    (err as any).statusCode = 400;
    throw err;
  }

  const now = Date.now();
  const cached = metadataCache.get(cleanId);
  if (cached && now - cached.timestamp < METADATA_CACHE_TTL_MS) {
    return cached.data;
  }

  const token = await getDriveAccessToken();
  const fields = 'id,name,mimeType,size,md5Checksum,modifiedTime,trashed,parents';
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cleanId)}?fields=${encodeURIComponent(fields)}&supportsAllDrives=true`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (response.status === 404) {
    const err = new Error('Image file not found in Google Drive');
    (err as any).statusCode = 404;
    throw err;
  }

  if (response.status === 403) {
    const errorBody = await response.text();
    let isApiDisabled = false;
    let activationUrl = '';
    try {
      const errJson = JSON.parse(errorBody);
      const msg = errJson.error?.message || '';
      if (
        msg.includes('Google Drive API has not been used') || 
        msg.includes('disabled') || 
        errJson.error?.details?.some((d: any) => d.reason === 'SERVICE_DISABLED')
      ) {
        isApiDisabled = true;
        activationUrl = errJson.error?.details?.find((d: any) => d.metadata?.activationUrl)?.metadata?.activationUrl || 
          'https://console.developers.google.com/apis/api/drive.googleapis.com/overview';
      }
    } catch {}

    if (isApiDisabled) {
      console.error(`\n========================================================================\n[ACTION REQUIRED] Google Drive API is DISABLED in your Google Cloud Project.\nEnable it at:\n${activationUrl}\n========================================================================\n`);
      const err = new Error(`Google Drive API is disabled in your Google Cloud Project. Please enable 'Google Drive API' in Google Cloud Console.`);
      (err as any).statusCode = 403;
      throw err;
    }

    const { email } = resolveServiceAccountCredentials();
    const serviceAccountNote = email ? ` (Service Account: ${email})` : '';
    const err = new Error(`Access denied to Google Drive image file. Please share the file or folder with the service account${serviceAccountNote}.`);
    (err as any).statusCode = 403;
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`Google Drive API returned HTTP ${response.status}`);
    (err as any).statusCode = response.status >= 500 ? 502 : response.status;
    throw err;
  }

  const json = await response.json();
  const meta: DriveFileMetadata = {
    id: json.id,
    name: json.name || 'image',
    mimeType: json.mimeType || 'application/octet-stream',
    size: json.size ? parseInt(json.size, 10) : undefined,
    md5Checksum: json.md5Checksum,
    modifiedTime: json.modifiedTime,
    trashed: Boolean(json.trashed),
    parents: json.parents || []
  };

  metadataCache.set(cleanId, { data: meta, timestamp: now });
  return meta;
}

/**
 * Validates that the requested image is permitted to be served:
 * 1. Must be an allowed image MIME type.
 * 2. Must not be trashed.
 * 3. Must not exceed maximum allowed size.
 * 4. Must either belong to the configured folder OR be referenced in the catalog.
 */
export function validateImagePermission(
  meta: DriveFileMetadata,
  allowedFileIds?: Set<string>,
  requestedId?: string
): void {
  if (meta.trashed) {
    const err = new Error('Requested image has been deleted or moved to trash');
    (err as any).statusCode = 404;
    throw err;
  }

  if (!SUPPORTED_MIME_TYPES.has(meta.mimeType)) {
    const err = new Error(`Unsupported image format: ${meta.mimeType}. Supported formats: JPEG, PNG, WebP, AVIF, GIF, SVG.`);
    (err as any).statusCode = 415;
    throw err;
  }

  if (meta.size && meta.size > MAX_IMAGE_BYTES) {
    const err = new Error(`Image size exceeds allowed limit of 15MB`);
    (err as any).statusCode = 413;
    throw err;
  }

  const rawFolder = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const configuredFolderId = rawFolder ? extractFolderId(rawFolder) || rawFolder.trim() : undefined;

  // Check 1: Referenced in active catalog products (by Drive ID or requested alias)
  if (allowedFileIds) {
    if (allowedFileIds.has(meta.id) || (requestedId && allowedFileIds.has(requestedId))) {
      return;
    }
  }

  // Check 2: Belongs to configured Google Drive folder (e.g. "PriyaFindz Product Images")
  if (configuredFolderId && meta.parents && meta.parents.includes(configuredFolderId)) {
    return;
  }

  // If restrictions are enabled (either allowedFileIds has elements OR configuredFolderId is set),
  // and neither check matched, access is forbidden.
  if ((allowedFileIds && allowedFileIds.size > 0) || configuredFolderId) {
    const err = new Error('Image is not referenced in current product catalog or configured Drive folder');
    (err as any).statusCode = 403;
    throw err;
  }
}

/**
 * Downloads and streams/returns the image buffer with security validation and headers
 */
export async function getDriveImage(
  fileId: string,
  allowedFileIds?: Set<string>
): Promise<DriveImageResult> {
  const meta = await getDriveFileMetadata(fileId);
  validateImagePermission(meta, allowedFileIds, fileId);

  const token = await getDriveAccessToken();
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(meta.id)}?alt=media&supportsAllDrives=true`;

  let response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // Handle redirect if returned
  if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
    const redirectUrl = response.headers.get('location')!;
    response = await fetch(redirectUrl);
  }

  if (!response.ok) {
    const err = new Error(`Failed to stream image from Google Drive (HTTP ${response.status})`);
    (err as any).statusCode = response.status === 404 ? 404 : 502;
    throw err;
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const etag = meta.md5Checksum ? `"${meta.md5Checksum}"` : `"${computeVersionToken(meta)}"`;
  const lastModified = meta.modifiedTime 
    ? new Date(meta.modifiedTime).toUTCString()
    : new Date().toUTCString();
  const version = computeVersionToken(meta);

  return {
    buffer,
    contentType: meta.mimeType,
    contentLength: buffer.length,
    etag,
    lastModified,
    version
  };
}

/**
 * Enriches catalog products with cache-busting version tokens (?v=...)
 * based on Google Drive file modification times or MD5 checksums.
 */
export async function enrichProductsWithDriveVersions(products: Product[]): Promise<Product[]> {
  const { email, privateKey } = resolveServiceAccountCredentials();
  if (!email || !privateKey) {
    return products;
  }

  const uniqueFileIds = Array.from(
    new Set(
      products
        .map(p => p.imageFileId)
        .filter((id): id is string => Boolean(id && id.trim()))
    )
  );

  if (uniqueFileIds.length === 0) {
    return products;
  }

  // Lookup metadata for each file in parallel with a concurrency limit
  const versionMap = new Map<string, string>();
  await Promise.allSettled(
    uniqueFileIds.map(async (fileId) => {
      try {
        const meta = await getDriveFileMetadata(fileId);
        versionMap.set(fileId, computeVersionToken(meta));
      } catch {
        // Fallback gracefully without breaking catalog loading
      }
    })
  );

  return products.map(product => {
    if (!product.imageFileId) return product;
    const version = versionMap.get(product.imageFileId);
    if (!version) return product;

    const vParam = `&v=${encodeURIComponent(version)}`;
    const updatedImageUrl = `/api/image?id=${encodeURIComponent(product.imageFileId)}${vParam}`;

    return {
      ...product,
      imageUrl: updatedImageUrl,
      image_url: updatedImageUrl
    };
  });
}
