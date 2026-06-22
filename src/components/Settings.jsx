import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../lib/storage';

const EMPTY = { trainerName: '', businessName: '', serviceArea: '', trainerId: '' };
const BASE_URL = 'https://ptopspro.vercel.app/enquiry.html';

export function buildFormUrl(s) {
  if (!s || !s.trainerId) return null;
  const payload = btoa(JSON.stringify({ n: s.businessName || s.trainerName, a: s.serviceArea, id: s.trainerId }));
  return `${BASE_URL}?for=${payload}`;
}

export default function Settings({ onClose }) {
  const [form,   setForm]   = useState(EMPTY);
  const [saved,  setSaved]  = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const s = getSettings();
    if (s && Object.keys(s).length) setForm({ ...EMPTY, ...s });
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSave(e) {
    e.preventDefault();
    const toSave = { ...form };
    if (!toSave.trainerId) toSave.trainerId = crypto.randomUUID();
    saveSettings(toSave);
    setForm(toSave);
    setSaved(true);
    setTimeout(() => onClose(), 800);
  }

  function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const formUrl = buildFormUrl(form);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl border border-gray-800 bg-gray-950 p-6 sm:rounded-2xl max-h-[90vh] overflow-y-auto">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Profile</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Your Name <span className="text-red-400">*</span></label>
            <input name="trainerName" value={form.trainerName} onChange={handleChange} placeholder="e.g. John Smith" required
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Business / Trading Name</label>
            <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="e.g. John Smith PT"
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Service Area</label>
            <input name="serviceArea" value={form.serviceArea} onChange={handleChange} placeholder="East London"
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <button type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
            {saved ? 'Saved ✓' : 'Save'}
          </button>
        </form>

        {/* Shareable link — shown once profile is set up */}
        {formUrl && (
          <div className="mt-5 rounded-xl border border-indigo-500/30 bg-indigo-500/8 p-4">
            <p className="mb-1 text-xs font-semibold text-indigo-300">Your client enquiry link</p>
            <p className="mb-3 text-[11px] text-indigo-400/70">Send this to potential clients via WhatsApp, Instagram, or add it to your Google Business Profile.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-gray-900/60 px-3 py-2 text-[11px] font-mono text-indigo-300 border border-indigo-500/20">
                {formUrl}
              </code>
              <button
                type="button"
                onClick={() => copyLink(formUrl)}
                className="flex-shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 border-t border-gray-800 pt-5 text-center">
          <a
            href="https://wa.me/447752300937"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Support
          </a>
          <p className="mt-1 text-xs text-gray-600">Need help? Message us directly.</p>
        </div>
      </div>
    </div>
  );
}
