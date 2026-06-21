import { useState, useEffect, useRef } from 'react';
import { addRecord, getStored, deleteRecord, OUTREACH_KEY } from '../lib/storage';

// ─── Lead type config ─────────────────────────────────────────────────────────

const LEAD_TYPES = {
  local_business: {
    label:       'Local Business',
    description: 'Reach out to a local business for a referral partnership.',
    fields: [
      { id: 'companyName', label: 'Business Name',    placeholder: 'e.g. Green Physio',    required: true  },
      { id: 'ownerName',   label: 'Owner / Contact',  placeholder: 'e.g. Sarah',           required: true  },
      { id: 'websiteUrl',  label: 'Website (optional)', placeholder: 'https://…',          required: false },
      { id: 'toEmail',     label: 'Email (optional)', placeholder: 'hello@business.com',   required: false },
    ],
  },
  individual: {
    label:       'Individual',
    description: 'Follow up with someone you\'ve met who might become a client.',
    fields: [
      { id: 'companyName', label: 'Full Name',        placeholder: 'e.g. James Turner',    required: true  },
      { id: 'ownerName',   label: 'How You Met',      placeholder: 'e.g. Hyde Park run',   required: false },
      { id: 'websiteUrl',  label: 'Instagram / Link', placeholder: '@handle or URL',       required: false },
      { id: 'toEmail',     label: 'Email (optional)', placeholder: 'james@example.com',    required: false },
    ],
  },
};

// ─── Email template generator ─────────────────────────────────────────────────

function buildSubject(formState, leadType) {
  if (leadType === 'individual') return `Great meeting you — personal training`;
  return `Referral Partnership – ${formState.companyName}`;
}

function buildBody(formState, leadType) {
  const name = formState.ownerName?.trim() || 'there';
  const biz  = formState.companyName?.trim() || 'your business';

  if (leadType === 'individual') {
    return [
      `Hi ${name},`,
      '',
      `Really great meeting you${formState.ownerName ? ` at ${formState.ownerName}` : ''}! I wanted to follow up as I mentioned — I'm a mobile personal trainer working outdoors across London.`,
      '',
      `Most of my sessions are in local parks at 5:30 AM or 7 PM, so they fit easily around a full-time job. No gym membership needed.`,
      '',
      `I'd love to offer you a free 20-minute consultation to talk through your goals and see if we're a good fit. No obligation at all.`,
      '',
      `Let me know if that sounds good — happy to work around your schedule.`,
      '',
      `Best,`,
      `[Your Name]`,
      `[Your Phone / Instagram]`,
    ].join('\n');
  }

  return [
    `Hi ${name},`,
    '',
    `I came across ${biz} and wanted to reach out about a potential referral partnership.`,
    '',
    `I'm a mobile personal trainer working outdoors across London — my clients are busy professionals who train in local parks early morning or after work. I'm always looking to recommend trusted local businesses, and I thought there could be a natural fit between what we both offer.`,
    '',
    `A simple referral arrangement could work well for both sides — happy to keep it completely informal to start.`,
    '',
    `Would you be open to a quick 10-minute call or coffee to explore?`,
    '',
    `Best,`,
    `[Your Name]`,
    `[Your Phone / Website]`,
  ].join('\n');
}

// ─── History row ──────────────────────────────────────────────────────────────

function HistoryRow({ record, onDelete }) {
  const label = LEAD_TYPES[record.leadType]?.label ?? 'Outreach';
  const date  = new Date(record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-200">{record.companyName}</p>
        <p className="text-xs text-gray-600">{record.ownerName} · {date}</p>
      </div>
      <span className="flex-shrink-0 rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-400">
        {label}
      </span>
      <button
        onClick={() => onDelete(record.id)}
        className="flex-shrink-0 rounded p-1 text-gray-700 transition hover:text-red-500"
        title="Delete"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const BLANK = { companyName: '', ownerName: '', websiteUrl: '', toEmail: '' };

export default function LeadDashboard({ formState, setFormState }) {
  const [leadType,  setLeadType]  = useState('local_business');
  const [template,  setTemplate]  = useState(null); // { subject, body }
  const [copied,    setCopied]    = useState(false);
  const [history,   setHistory]   = useState(() => getStored(OUTREACH_KEY));
  const formRef = useRef(null);

  const config = LEAD_TYPES[leadType];

  useEffect(() => {
    function refresh() { setHistory(getStored(OUTREACH_KEY)); }
    window.addEventListener('pt_data_updated', refresh);
    return () => window.removeEventListener('pt_data_updated', refresh);
  }, []);

  // Scroll to form when populated externally (from Prospect Tracker)
  useEffect(() => {
    if (formState.companyName || formState.ownerName) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTemplate(null);
    }
  }, [formState]);

  function handleChange(e) {
    setFormState(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setTemplate(null);
  }

  function clearForm() {
    setFormState(BLANK);
    setTemplate(null);
    setCopied(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const subject = buildSubject(formState, leadType);
    const body    = buildBody(formState, leadType);
    setTemplate({ subject, body });
    addRecord(OUTREACH_KEY, { ...formState, leadType });
    setCopied(false);
  }

  function copyTemplate() {
    if (!template) return;
    const full = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDelete(id) {
    deleteRecord(OUTREACH_KEY, id);
  }

  const mailtoLink = template
    ? `mailto:${formState.toEmail ?? ''}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`
    : '#';

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-bold text-white">Outreach</h1>
        <p className="text-xs text-gray-500">Generate a ready-to-send email template — personalised in seconds.</p>
      </div>

      {/* Lead type toggle */}
      <div className="flex gap-2 rounded-xl border border-gray-800 bg-gray-900 p-1">
        {Object.entries(LEAD_TYPES).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setLeadType(key); setTemplate(null); setCopied(false); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              leadType === key
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">{config.description}</p>

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        {config.fields.map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-1 block text-xs font-medium text-gray-400">
              {field.label}{field.required && <span className="ml-0.5 text-red-400">*</span>}
            </label>
            <input
              id={field.id}
              type="text"
              value={formState[field.id] ?? ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        ))}

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Generate Email Template
        </button>
      </form>

      {/* Generated template */}
      {template && (
        <div className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-indigo-300">Email ready — personalise before sending</p>
            <div className="flex gap-2">
              <button
                onClick={copyTemplate}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {formState.toEmail && (
                <a
                  href={mailtoLink}
                  className="rounded-lg border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/10"
                >
                  Open in Email
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Subject</p>
            <p className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200">
              {template.subject}
            </p>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Body</p>
            <pre className="whitespace-pre-wrap rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm leading-relaxed text-gray-200 font-sans">
              {template.body}
            </pre>
          </div>

          <button
            onClick={clearForm}
            className="text-xs text-gray-600 hover:text-gray-400 transition"
          >
            Clear and start over
          </button>
        </div>
      )}

      {/* Outreach history */}
      {history.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-200">Outreach History</h2>
          </div>
          <div className="divide-y divide-gray-800/50 px-4">
            {history.map(r => (
              <HistoryRow key={r.id} record={r} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
