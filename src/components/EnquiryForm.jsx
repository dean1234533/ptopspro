import { useState } from 'react';
import { addRecord, ENQUIRIES_KEY, getSettings } from '../lib/storage';
import { buildFormUrl } from './Settings';

const GOALS = [
  'Weight loss',
  'Muscle gain / toning',
  'General fitness',
  'Running / cardio',
  'Post-injury rehab',
  'Boxing / sport-specific',
  'Other',
];

const SLOTS = [
  'Early morning (5:30 AM)',
  'Morning (7–9 AM)',
  'Midday (12–2 PM)',
  'Evening (6–8 PM)',
  'Weekends',
  'Flexible',
];

const EMPTY = { name: '', phone: '', email: '', goal: '', availability: [], message: '' };

export default function EnquiryForm() {
  const [form,      setForm]      = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [copied,    setCopied]    = useState(false);

  const settings        = getSettings();
  const CLIENT_FORM_URL = buildFormUrl(settings);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function toggleSlot(slot) {
    setForm(prev => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter(s => s !== slot)
        : [...prev.availability, slot],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    addRecord(ENQUIRIES_KEY, {
      name:         form.name.trim(),
      phone:        form.phone.trim(),
      email:        form.email.trim(),
      goal:         form.goal,
      availability: form.availability,
      message:      form.message.trim(),
      status:       'new',
    });
    setSubmitted(true);
  }

  function copyLink() {
    navigator.clipboard.writeText(CLIENT_FORM_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Enquiry logged</h2>
          <p className="mt-1 text-sm text-gray-400">Saved to your client list.</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setSubmitted(false); }}
          className="mt-2 rounded-xl border border-gray-700 px-6 py-2.5 text-sm text-gray-400 transition hover:border-gray-600 hover:text-gray-200"
        >
          Log another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Client-facing web form banner */}
      {CLIENT_FORM_URL ? (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/8 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
              <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-indigo-300">Your client enquiry form</p>
              <p className="mt-0.5 text-xs text-indigo-400/70 leading-relaxed">
                Share this in your Google Business Profile, Instagram bio, and WhatsApp. Clients fill it out — you see it in your Clients tab.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-gray-900/60 px-3 py-1.5 text-xs text-indigo-300 font-mono border border-indigo-500/20">
                  {CLIENT_FORM_URL}
                </code>
                <button
                  onClick={copyLink}
                  className="flex-shrink-0 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/25"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-700 bg-gray-900/40 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-800">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-300">Client enquiry form not set up</p>
              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                Open <strong className="text-gray-400">Settings ⚙</strong> to enter your details and download your personalised form. Deploy it to Vercel, then paste the URL back in Settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual log section */}
      <div>
        <h1 className="text-base font-bold text-white">Log a manual enquiry</h1>
        <p className="text-xs text-gray-500">Someone called, texted, or messaged you directly? Log it here.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label htmlFor="name" className="mb-1 block text-xs font-medium text-gray-400">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name" name="name" type="text"
            value={form.name} onChange={handleChange}
            placeholder="Jane Smith"
            required
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3.5 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-xs font-medium text-gray-400">Phone</label>
          <input
            id="phone" name="phone" type="tel"
            value={form.phone} onChange={handleChange}
            placeholder="07700 900000"
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3.5 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-400">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email" name="email" type="email"
            value={form.email} onChange={handleChange}
            placeholder="jane@example.com"
            required
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3.5 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="goal" className="mb-1 block text-xs font-medium text-gray-400">Primary Goal</label>
          <select
            id="goal" name="goal"
            value={form.goal} onChange={handleChange}
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3.5 text-sm text-gray-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select a goal…</option>
            {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-gray-400">Availability (select all that apply)</p>
          <div className="grid grid-cols-2 gap-2">
            {SLOTS.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition ${
                  form.availability.includes(slot)
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="mb-1 block text-xs font-medium text-gray-400">Notes</label>
          <textarea
            id="message" name="message"
            value={form.message} onChange={handleChange}
            rows={3}
            placeholder="How they found you, what they said, injuries, location…"
            className="w-full resize-none rounded-xl border border-gray-700 bg-gray-900 px-4 py-3.5 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 py-4 text-base font-semibold text-white transition hover:bg-indigo-500"
        >
          Log Enquiry
        </button>
      </form>
    </div>
  );
}
