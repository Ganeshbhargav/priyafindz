import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeVersionToken,
  validateImagePermission,
  type DriveFileMetadata
} from './googleDriveService.ts';

test('computeVersionToken derives consistent version tokens from checksum or modification time', () => {
  const metaWithMd5: DriveFileMetadata = {
    id: 'test-1',
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
    md5Checksum: 'd41d8cd98f00b204e9800998ecf8427e',
    modifiedTime: '2026-03-01T12:00:00.000Z'
  };
  assert.equal(computeVersionToken(metaWithMd5), 'd41d8cd98f00');

  const metaWithTimeOnly: DriveFileMetadata = {
    id: 'test-2',
    name: 'photo.png',
    mimeType: 'image/png',
    modifiedTime: '2026-03-01T12:00:00.000Z'
  };
  const token = computeVersionToken(metaWithTimeOnly);
  assert.ok(token && token.length > 0);
});

test('validateImagePermission rejects trashed files', () => {
  const trashedMeta: DriveFileMetadata = {
    id: 'test-trashed',
    name: 'old.jpg',
    mimeType: 'image/jpeg',
    trashed: true
  };

  assert.throws(
    () => validateImagePermission(trashedMeta),
    (err: any) => err.statusCode === 404
  );
});

test('validateImagePermission rejects unsupported MIME types', () => {
  const pdfMeta: DriveFileMetadata = {
    id: 'test-pdf',
    name: 'document.pdf',
    mimeType: 'application/pdf'
  };

  assert.throws(
    () => validateImagePermission(pdfMeta),
    (err: any) => err.statusCode === 415
  );
});

test('validateImagePermission rejects oversized files (>15MB)', () => {
  const oversizedMeta: DriveFileMetadata = {
    id: 'test-large',
    name: 'huge.jpg',
    mimeType: 'image/jpeg',
    size: 20 * 1024 * 1024 // 20 MB
  };

  assert.throws(
    () => validateImagePermission(oversizedMeta),
    (err: any) => err.statusCode === 413
  );
});

test('validateImagePermission permits valid images listed in catalog', () => {
  const validMeta: DriveFileMetadata = {
    id: 'allowed-drive-id',
    name: 'kurti.webp',
    mimeType: 'image/webp',
    size: 500 * 1024
  };

  const allowedIds = new Set(['allowed-drive-id', 'other-id']);
  assert.doesNotThrow(() => validateImagePermission(validMeta, allowedIds));
});

test('validateImagePermission rejects images not listed in catalog when restricted', () => {
  const unlistedMeta: DriveFileMetadata = {
    id: 'random-unlisted-id',
    name: 'private.png',
    mimeType: 'image/png',
    size: 500 * 1024
  };

  const allowedIds = new Set(['allowed-drive-id']);
  assert.throws(
    () => validateImagePermission(unlistedMeta, allowedIds),
    (err: any) => err.statusCode === 403
  );
});
