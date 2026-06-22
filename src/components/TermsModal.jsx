import { useState } from 'react';

const TERMS = `
**PT Ops Pro — Terms of Service**
Last updated: June 2026

**1. Acceptance**
By creating an account and using PT Ops Pro ("the App"), you agree to these Terms of Service in full. If you do not agree, do not use the App.

**2. Who May Use the App**
PT Ops Pro is a business management tool for professional personal trainers. Access is granted on a per-licence basis following purchase. Your licence is personal and non-transferable — it may not be shared with or passed to any other individual.

**3. Your Account**
You are responsible for maintaining the security of your login credentials. You must notify us immediately at ptopspro@gmail.com if you suspect any unauthorised use of your account. We reserve the right to suspend or terminate accounts that breach these Terms.

**4. Acceptable Use**
You agree not to:
- Share your account access with any third party
- Use the App for any unlawful purpose
- Attempt to reverse-engineer, copy, or resell any part of the App
- Upload content that is false, misleading, or in breach of any applicable law

**5. Client Data**
Any client information entered into or submitted through the App (including enquiry forms) is your responsibility. You must ensure you have lawful grounds to collect and process that data under UK GDPR and any other applicable data protection law. PT Ops Pro acts as a data processor on your behalf.

**6. Payments & Refunds**
Licences are purchased via Gumroad. All sales are final. No refunds are issued once access has been granted, except where required by law.

**7. Service Availability**
We aim to keep the App available at all times but do not guarantee uninterrupted access. We may carry out maintenance or updates at any time. We are not liable for any loss resulting from downtime.

**8. Intellectual Property**
All content, design, and code within PT Ops Pro remains the property of PT Ops Pro. You are granted a limited, non-exclusive licence to use the App for its intended purpose only.

**9. Limitation of Liability**
To the maximum extent permitted by law, PT Ops Pro shall not be liable for any indirect, incidental, or consequential loss or damage arising from your use of the App. Our total liability shall not exceed the amount you paid for your licence.

**10. Changes to These Terms**
We may update these Terms at any time. Continued use of the App after changes are published constitutes acceptance of the revised Terms.

**11. Governing Law**
These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.

**Contact:** ptopspro@gmail.com
`;

const PRIVACY = `
**PT Ops Pro — Privacy Policy**
Last updated: June 2026

**1. Who We Are**
PT Ops Pro is operated as a sole-trader software product based in the United Kingdom. We are the data controller for information you provide when creating an account. Contact: ptopspro@gmail.com

**2. What Data We Collect**

*Account data:* Your email address and password (stored securely via Firebase Authentication).

*Profile data:* Your name, business name, and service area — entered by you in Settings.

*Client enquiry data:* Names, email addresses, phone numbers, and fitness goals submitted by your clients via your shared enquiry form. This data is stored under your account and is your responsibility as data controller for your clients.

*Usage data:* Basic usage information may be collected automatically by our hosting provider (Cloudflare) and database provider (Google Firebase/Firestore).

**3. How We Use Your Data**
- To provide and operate the App
- To send account-related communications (password resets, access notifications)
- To auto-delete records older than 3 months to limit data accumulation
- We do not use your data for marketing, profiling, or any purpose beyond operating the App

**4. Data Sharing**
We do not sell or share your personal data with third parties for commercial purposes. Data is processed by the following sub-processors:
- **Google Firebase** (authentication and database) — servers in the EU/US
- **Cloudflare** (hosting and edge network) — servers globally
- **Gumroad** (payment processing) — solely for purchase transactions

**5. Data Retention**
Client enquiry records are automatically deleted after 3 months. Account data is retained for as long as your account is active. You may request deletion of your account and all associated data at any time.

**6. Your Rights (UK GDPR)**
You have the right to:
- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your data
- Object to or restrict processing
- Data portability

To exercise any of these rights, contact us at ptopspro@gmail.com. We will respond within 30 days.

**7. Security**
All data is encrypted in transit (HTTPS) and at rest via Firebase's built-in security. Access to your data is restricted to your authenticated account only.

**8. Cookies**
The App does not use tracking cookies. Firebase may use session tokens stored in browser memory to maintain your login state.

**9. Children**
PT Ops Pro is not intended for use by anyone under the age of 18.

**10. Changes to This Policy**
We may update this Privacy Policy from time to time. We will notify you of significant changes via the App. Continued use constitutes acceptance.

**Contact:** ptopspro@gmail.com
`;

function renderContent(text) {
  const lines = text.trim().split('\n');
  const elements = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { elements.push(<div key={key++} className="h-2" />); continue; }

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2,-2).includes('**')) {
      const content = trimmed.slice(2, -2);
      const isTitle = content.includes('—') || content.includes('Terms') || content.includes('Privacy');
      elements.push(
        <p key={key++} className={isTitle ? 'text-base font-bold text-white mt-2 mb-1' : 'text-sm font-semibold text-gray-200 mt-4 mb-1'}>
          {content}
        </p>
      );
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-sm text-gray-400 ml-4 list-disc">{trimmed.slice(2)}</li>
      );
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.slice(1,-1).includes(':')) {
      const [label, ...rest] = trimmed.slice(1,-1).split(':');
      elements.push(
        <p key={key++} className="text-sm text-gray-400">
          <span className="font-semibold text-gray-300">{label}:</span>{rest.join(':')}
        </p>
      );
    } else {
      // inline bold
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={key++} className="text-sm text-gray-400 leading-relaxed">
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**')
              ? <span key={i} className="font-semibold text-gray-300">{p.slice(2,-2)}</span>
              : p
          )}
        </p>
      );
    }
  }
  return elements;
}

export default function TermsModal({ onAccept }) {
  const [tab, setTab] = useState('terms');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center">
      <div className="flex w-full max-w-lg flex-col rounded-t-2xl border border-gray-800 bg-gray-950 sm:rounded-2xl" style={{maxHeight:'90dvh'}}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-800 px-6 pt-5 pb-0">
          <h2 className="mb-4 text-lg font-bold text-white">Before you continue</h2>
          <div className="flex gap-1">
            {[['terms','Terms of Service'],['privacy','Privacy Policy']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === id
                    ? 'bg-gray-900 text-white border border-b-0 border-gray-700'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-900 px-6 py-5 space-y-1">
          {tab === 'terms'   ? renderContent(TERMS)   : renderContent(PRIVACY)}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-800 bg-gray-950 px-6 py-4">
          <p className="mb-3 text-xs text-gray-600">
            By tapping "I Agree" you confirm you have read and accept both our Terms of Service and Privacy Policy.
          </p>
          <button
            onClick={onAccept}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            I Agree — Continue
          </button>
        </div>
      </div>
    </div>
  );
}
