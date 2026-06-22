import { useState, useEffect } from 'react';
import { getStored, addRecord, updateRecord, deleteRecord, PROSPECTS_KEY } from '../lib/storage';

// ─── Config ───────────────────────────────────────────────────────────────────

const SOURCES = ['Referral', 'Local Park', 'Social Media', 'Walk-in / Street', 'Google Maps', 'Event', 'Other'];

const NEXT_STATUS    = { spotted: 'contacted', contacted: 'interested', interested: 'booked', booked: 'won', won: 'spotted' };
const CURRENT_LABEL  = { spotted: 'Spotted', contacted: 'Contacted', interested: 'Interested', booked: 'Booked', won: 'Won' };
const ACTION_LABEL   = { spotted: 'Contacted', contacted: 'Interested', interested: 'Booked', booked: 'Won', won: 'Re-spot' };
const ACTION_STYLES  = {
  spotted:    'bg-amber-500/15 text-amber-400 ring-amber-500/25 hover:bg-amber-500/25',
  contacted:  'bg-indigo-500/15 text-indigo-400 ring-indigo-500/25 hover:bg-indigo-500/25',
  interested: 'bg-violet-500/15 text-violet-400 ring-violet-500/25 hover:bg-violet-500/25',
  booked:     'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25 hover:bg-emerald-500/25',
  won:        'bg-gray-500/15 text-gray-400 ring-gray-500/25 hover:bg-gray-500/25',
};

const FILTER_TABS = [
  { key: 'all',        label: 'All'       },
  { key: 'spotted',    label: 'Spotted'   },
  { key: 'contacted',  label: 'Contacted' },
  { key: 'interested', label: 'Interested'},
  { key: 'booked',     label: 'Booked'    },
  { key: 'won',        label: 'Won'       },
];

const EMPTY_FORM = { name: '', source: '', notes: '' };

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status, onClick }) {
  return (
    <button
      onClick={onClick}
      title={`Mark as ${ACTION_LABEL[status]}`}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset transition ${ACTION_STYLES[status] ?? ACTION_STYLES.spotted}`}
    >
      <span className="opacity-50">→</span>
      {ACTION_LABEL[status] ?? 'Contacted'}
    </button>
  );
}

function ProspectCard({ prospect, onOutreach, onDelete }) {
  const [open, setOpen] = useState(false);

  function advance() {
    updateRecord(PROSPECTS_KEY, prospect.id, { status: NEXT_STATUS[prospect.status] ?? 'spotted' });
  }

  const date = prospect.createdAt
    ? new Date(prospect.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
    : '—';

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-gray-300">
          {prospect.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-100">{prospect.name}</p>
          <p className="truncate text-xs text-gray-500">{prospect.source || 'No source'}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-[10px] font-medium text-gray-600">{CURRENT_LABEL[prospect.status] ?? 'Spotted'}</span>
          <StatusPill status={prospect.status ?? 'spotted'} onClick={advance} />
          <button
            onClick={() => setOpen(o => !o)}
            className="rounded-lg p-1.5 text-gray-600 transition hover:text-gray-300"
          >
            <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-800 px-4 py-3 space-y-2 text-sm">
          {prospect.notes && (
            <div className="flex gap-2">
              <span className="w-16 flex-shrink-0 text-xs text-gray-500">Notes</span>
              <span className="text-gray-300 text-xs leading-relaxed">{prospect.notes}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="w-16 flex-shrink-0 text-xs text-gray-500">Added</span>
            <span className="text-gray-500 text-xs">{date}</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => onOutreach(prospect)}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
            >
              Write Outreach Email
            </button>
            <button
              onClick={() => { if (confirm('Delete this prospect?')) onDelete(prospect.id); }}
              className="ml-auto rounded-lg border border-red-900/50 px-3 py-2 text-xs font-medium text-red-500 transition hover:border-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add form ─────────────────────────────────────────────────────────────────

function AddProspectForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addRecord(PROSPECTS_KEY, { ...form, status: 'spotted' });
    setForm(EMPTY_FORM);
    setOpen(false);
    onAdd();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 py-3 text-sm font-medium text-gray-500 transition hover:border-indigo-500 hover:text-indigo-400"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Prospect
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
      <p className="text-sm font-semibold text-indigo-300">New Prospect</p>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Name / Business <span className="text-red-400">*</span>
        </label>
        <input
          name="name" type="text"
          value={form.name} onChange={handleChange}
          placeholder="e.g. Emma Davies"
          required
          autoFocus
          className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">Source</label>
        <select
          name="source"
          value={form.source} onChange={handleChange}
          className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select source…</option>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">Notes</label>
        <textarea
          name="notes"
          value={form.notes} onChange={handleChange}
          rows={2}
          placeholder="What did you talk about? Any follow-up info…"
          className="w-full resize-none rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => { setForm(EMPTY_FORM); setOpen(false); }}
          className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm text-gray-400 transition hover:border-gray-600 hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RssScout({ onCopyToForm }) {
  const [prospects, setProspects] = useState(() => getStored(PROSPECTS_KEY));
  const [filter,    setFilter]    = useState('all');

  function refresh() { setProspects(getStored(PROSPECTS_KEY)); }

  useEffect(() => {
    window.addEventListener('pt_data_updated', refresh);
    return () => window.removeEventListener('pt_data_updated', refresh);
  }, []);

  function handleOutreach(prospect) {
    onCopyToForm({ companyName: prospect.name, ownerName: prospect.name });
  }

  function handleDelete(id) {
    deleteRecord(PROSPECTS_KEY, id);
  }

  const visible = filter === 'all'
    ? prospects
    : prospects.filter(p => (p.status ?? 'spotted') === filter);

  const wonCount      = prospects.filter(p => p.status === 'won').length;
  const bookedCount   = prospects.filter(p => p.status === 'booked').length;
  const contactedCount= prospects.filter(p => p.status === 'contacted' || p.status === 'interested').length;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Prospect Tracker</h1>
        <p className="text-xs text-gray-500">Log every lead, track the pipeline, never lose a follow-up.</p>
      </div>

      {/* Stats row */}
      {prospects.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'In Pipeline', value: contactedCount, color: 'text-amber-400' },
            { label: 'Booked',      value: bookedCount,    color: 'text-violet-400' },
            { label: 'Won',         value: wonCount,       color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 px-3 py-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add prospect */}
      <AddProspectForm onAdd={refresh} />

      {/* Filter tabs */}
      {prospects.length > 0 && (
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-800 bg-gray-900 p-1 scrollbar-hide">
          {FILTER_TABS.map(({ key, label }) => {
            const count = key === 'all'
              ? prospects.length
              : prospects.filter(p => (p.status ?? 'spotted') === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-shrink-0 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  filter === key ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    filter === key ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Cards */}
      {visible.length === 0 && prospects.length > 0 && (
        <div className="py-8 text-center text-sm text-gray-600">No prospects in this stage.</div>
      )}

      {prospects.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">No prospects yet.</p>
          <p className="mt-1 text-xs text-gray-600">
            Add the first lead from a park session, referral, or social DM.
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="space-y-2">
          {visible.map(p => (
            <ProspectCard
              key={p.id}
              prospect={p}
              onOutreach={handleOutreach}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
