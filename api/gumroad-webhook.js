const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore }                 = require('firebase-admin/firestore');

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

// Parse application/x-www-form-urlencoded body (what Gumroad sends)
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        const params = new URLSearchParams(raw);
        const obj = {};
        for (const [k, v] of params) obj[k] = v;
        resolve(obj);
      } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the secret so random internet traffic can't add emails
  const secret = req.query.secret;
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let body;
  try {
    body = await parseBody(req);
  } catch {
    return res.status(400).json({ error: 'Could not parse body' });
  }

  const { email, product_name, purchase_id, test } = body;

  if (!email) {
    return res.status(400).json({ error: 'No email in payload' });
  }

  const normalised = email.toLowerCase().trim();

  // Write to Firestore — document ID is the email, just needs to exist
  try {
    const db = getDb();
    await db.collection('authorised').doc(normalised).set({
      active:     true,
      product:    product_name  || null,
      purchaseId: purchase_id   || null,
      isTest:     test === 'true',
      grantedAt:  new Date().toISOString(),
    }, { merge: true });

    console.log(`Authorised${test === 'true' ? ' [TEST]' : ''}: ${normalised}`);
    return res.status(200).json({ ok: true, email: normalised });
  } catch (err) {
    console.error('Firestore error:', err.message);
    return res.status(500).json({ error: 'Failed to write to Firestore' });
  }
};
