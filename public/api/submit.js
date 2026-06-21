// Vercel serverless function — receives client enquiry, emails it to the PT
//
// ONE-TIME SETUP (free forever, no credit card):
// 1. Go to brevo.com → sign up free
// 2. My account (top right) → SMTP & API → API Keys → Generate a new API key → copy it
// 3. Senders & IP → Senders → Add a sender → add dbs_workouts@yahoo.com → verify it
// 4. In Vercel: bookehnow project → Settings → Environment Variables
//    Add: BREVO_API_KEY = (paste your key)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Access-Control-Allow-Origin', '*');

  const { pt_email, pt_name, name, phone, email, goal, availability, notes } = req.body;

  if (!pt_email || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const availText = Array.isArray(availability)
    ? availability.join(', ')
    : availability || 'Not specified';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
      <h2 style="color:#6366f1;margin:0 0 4px;font-size:20px">New Client Enquiry</h2>
      <p style="color:#64748b;margin:0 0 24px;font-size:13px">via PT Ops Pro</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:130px">Name</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600">${name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${phone || '—'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Email</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0"><a href="mailto:${email}" style="color:#6366f1">${email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Goal</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${goal || '—'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Availability</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${availText}</td></tr>
        <tr><td style="padding:10px 0;color:#64748b;vertical-align:top">Notes</td><td style="padding:10px 0">${notes || '—'}</td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Reply directly to this email to reach ${name}.</p>
    </div>
  `;

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender:  { name: 'PT Ops Pro', email: 'dbs_workouts@yahoo.com' },
        to:      [{ email: pt_email, name: pt_name || '' }],
        replyTo: { email, name },
        subject: `New enquiry from ${name}`,
        htmlContent: html,
      }),
    });

    if (r.ok) return res.status(200).json({ ok: true });

    const err = await r.text();
    console.error('Brevo error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
