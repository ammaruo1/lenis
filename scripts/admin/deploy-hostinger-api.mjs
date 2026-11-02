#!/usr/bin/env node
/**
 * Deploy prebuilt ZIP to Hostinger via official API.
 * Requires env: HOSTINGER_API_TOKEN, HOSTINGER_ACCOUNT_USERNAME, HOSTINGER_DOMAIN
 * Optional: HOSTINGER_ARCHIVE_PATH (default alarbi-hostinger-source.zip)
 */
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const token = process.env.HOSTINGER_API_TOKEN?.trim();
const username = process.env.HOSTINGER_ACCOUNT_USERNAME?.trim();
const domain = process.env.HOSTINGER_DOMAIN?.trim();
const archiveName = process.env.HOSTINGER_ARCHIVE_PATH?.trim() || 'alarbi-hostinger-source.zip';
const zipPath = resolve(root, '.local', 'alarbi-hostinger-source.zip');

if (!token || !username || !domain) {
  console.error(
    'Missing HOSTINGER_API_TOKEN, HOSTINGER_ACCOUNT_USERNAME, or HOSTINGER_DOMAIN.\n' +
      'Create API token: hPanel → Profile → API. Then add secrets to Cursor Cloud environment.'
  );
  process.exit(1);
}
if (!existsSync(zipPath)) {
  console.error('Missing build package. Run: npm run build:all && node scripts/admin/package-hostinger.mjs --prebuilt');
  process.exit(1);
}

const apiBase = 'https://developers.hostinger.com/api/hosting/v1';
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

async function api(method, path, body) {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
  return json;
}

/** Minimal TUS upload using fetch (single PATCH with full body for moderate ZIP sizes). */
async function tusUpload(uploadUrl, authKey, restAuthKey, remotePath, filePath) {
  const size = statSync(filePath).size;
  const target = `${uploadUrl.replace(/\/$/, '')}/${remotePath}?override=true`;
  const create = await fetch(target, {
    method: 'POST',
    headers: {
      'X-Auth': authKey,
      'X-Auth-Rest': restAuthKey,
      'Upload-Length': String(size),
      'Upload-Offset': '0',
      'Tus-Resumable': '1.0.0',
    },
  });
  if (create.status !== 201 && create.status !== 204) {
    throw new Error(`TUS create failed ${create.status}: ${await create.text()}`);
  }
  const patchUrl = create.headers.get('Location') || target;
  const buf = readFileSync(filePath);
  const patch = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'X-Auth': authKey,
      'X-Auth-Rest': restAuthKey,
      'Upload-Offset': '0',
      'Content-Type': 'application/offset+octet-stream',
      'Tus-Resumable': '1.0.0',
    },
    body: buf,
  });
  if (!patch.ok) throw new Error(`TUS patch failed ${patch.status}: ${await patch.text()}`);
}

async function main() {
  console.log('Upload URL…');
  const uploadMeta = await api(
    'POST',
    `/accounts/${encodeURIComponent(username)}/websites/${encodeURIComponent(domain)}/files/upload-url`,
    {}
  );
  const { url, auth_key, rest_auth_key } = uploadMeta;
  if (!url || !auth_key) throw new Error('Unexpected upload-url response shape');

  console.log(`Uploading ${archiveName} (${statSync(zipPath).size} bytes)…`);
  await tusUpload(url, auth_key, rest_auth_key, archiveName, zipPath);

  console.log('Starting Node.js build…');
  const build = await api(
    'POST',
    `/accounts/${encodeURIComponent(username)}/websites/${encodeURIComponent(domain)}/nodejs/builds`,
    {
      node_version: 24,
      app_type: 'fastify',
      root_directory: '.',
      output_directory: '.',
      build_script: 'none',
      entry_file: 'server.js',
      package_manager: 'npm',
      source_type: 'archive',
      source_options: { archive_path: archiveName },
    }
  );

  const uuid = build.uuid ?? build.data?.uuid;
  console.log(JSON.stringify({ ok: true, buildUuid: uuid, state: build.state }, null, 2));
  if (uuid) {
    console.log('Poll logs in hPanel or GET .../nodejs/builds/' + uuid);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
