// Cloudflare Pages Function — runs on Cloudflare's edge, no Node.js runtime.
// Uses Web Crypto API to sign a Google service-account JWT, then writes to
// Firestore via the REST API.

export async function onRequestPost({ request, env }) {
  // Verify secret
  const url = new URL(request.url);
  if (url.searchParams.get('secret') !== env.WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Parse Gumroad's URL-encoded body
  const text = await request.text();
  const params = new URLSearchParams(text);
  const email      = params.get('email');
  const product    = params.get('product_name');
  const purchaseId = params.get('purchase_id');
  const isTest     = params.get('test') === 'true';

  if (!email) {
    return new Response(JSON.stringify({ error: 'No email' }), { status: 400 });
  }

  const normalised = email.toLowerCase().trim();

  try {
    const token = await getGoogleToken(env.FIREBASE_CLIENT_EMAIL, env.FIREBASE_PRIVATE_KEY);
    await firestoreSet(env.FIREBASE_PROJECT_ID, 'authorised', normalised, {
      active:     { booleanValue: true },
      product:    { stringValue: product    || '' },
      purchaseId: { stringValue: purchaseId || '' },
      isTest:     { booleanValue: isTest },
      grantedAt:  { stringValue: new Date().toISOString() },
    }, token);

    console.log(`Authorised${isTest ? ' [TEST]' : ''}: ${normalised}`);
    return new Response(JSON.stringify({ ok: true, email: normalised }), { status: 200 });
  } catch (err) {
    console.error('Error:', err.message);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}

// Only POST allowed — any other method returns 405
export async function onRequest({ request }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
}

// ── Google OAuth via service-account JWT ────────────────────────────────────

async function getGoogleToken(clientEmail, rawPrivateKey) {
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  const now   = Math.floor(Date.now() / 1000);
  const claim = { iss: clientEmail, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now };

  const b64url = obj => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signingInput = `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url(claim)}`;

  const keyData  = pemToBuffer(privateKey);
  const cryptoKey = await crypto.subtle.importKey('pkcs8', keyData, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf   = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(signingInput));
  const sig      = bufToBase64Url(sigBuf);
  const jwt      = `${signingInput}.${sig}`;

  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data));
  return data.access_token;
}

// ── Firestore REST API ───────────────────────────────────────────────────────

async function firestoreSet(projectId, collection, docId, fields, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore ${res.status}: ${body}`);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pemToBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function bufToBase64Url(buf) {
  let bin = '';
  new Uint8Array(buf).forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
