import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../lib/storage';

const EMPTY = { trainerName: '', businessName: '', email: '', serviceArea: '' };
const BASE_URL = 'https://ptopspro.vercel.app';

export function buildFormUrl(s) {
  if (!s || !s.email) return null;
  const payload = btoa(JSON.stringify({ n: s.businessName || s.trainerName, e: s.email, a: s.serviceArea }));
  return `${BASE_URL}?for=${payload}`;
}

export default function Settings({ onClose }) {
  const [form,  setForm]  = useState(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSettings();
    if (s && Object.keys(s).length) setForm({ ...EMPTY, ...s });
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSave(e) {
    e.preventDefault();
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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
            <input name="trainerName" value={form.trainerName} onChange={handleChange} placeholder="Dean Burt" required
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Business / Trading Name</label>
            <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="Dean Burt PT"
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Your Email <span className="text-red-400">*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            <p className="mt-1.5 text-xs text-gray-600">Client enquiries will be emailed here.</p>
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
      </div>
    </div>
  );
}
