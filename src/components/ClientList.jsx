import { useState, useEffect } from 'react';
import { getStored, updateRecord, deleteRecord, ENQUIRIES_KEY } from '../lib/storage';

const NEXT_STATUS = { new: 'contacted', contacted: 'booked', booked: 'closed', closed: 'new' };

const ACTION_LABEL = { new: 'Contacted', contacted: 'Booked', booked: 'Closed', closed: 'Reopen' };
const ACTION_STYLES = {
  new:       'bg-amber-500/15 text-amber-400 ring-amber-500/25 hover:bg-amber-500/25',
  contacted: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25 hover:bg-emerald-500/25',
  booked:    'bg-gray-500/15 text-gray-400 ring-gray-500/25 hover:bg-gray-500/25',
  closed:    'bg-indigo-500/15 text-indigo-400 ring-indigo-500/25 hover:bg-indigo-500/25',
};

const CURRENT_LABEL = { new: 'New', contacted: 'Contacted', booked: 'Booked', closed: 'Closed' };

function StatusPill({ status, onClick }) {
  return (
    <button
      onClick={onClick}
      title={`Mark as ${ACTION_LABEL[status]}`}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset transition ${ACTION_STYLES[status] ?? ACTION_STYLES.new}`}
    >
      <span className="opacity-50">→</span>
      {ACTION_LABEL[status] ?? 'Contacted'}
    </button>
  );
}

function EnquiryCard({ enquiry, onDelete }) {
  const [open,        setOpen]        = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteVal,     setNoteVal]     = useState(enquiry.message || '');

  function advanceStatus() {
    updateRecord(ENQUIRIES_KEY, enquiry.id, { status: NEXT_STATUS[enquiry.status] ?? 'new' });
  }

  function saveConsultation(val) {
    updateRecord(ENQUIRIES_KEY, enquiry.id, { consultationTime: val });
  }

  function saveNote() {
    updateRecord(ENQUIRIES_KEY, enquiry.id, { message: noteVal });
    setEditingNote(false);
  }

  const date = enquiry.createdAt
    ? new Date(enquiry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
    : '—';

  const consultDisplay = enquiry.consultationTime
    ? new Date(enquiry.consultationTime).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          {enquiry.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-100">{enquiry.name}</p>
          <p className="truncate text-xs text-gray-500">{enquiry.email}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-[10px] font-medium text-gray-600">{CURRENT_LABEL[enquiry.status] ?? 'New'}</span>
          <StatusPill status={enquiry.status ?? 'new'} onClick={advanceStatus} />
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
        <div className="border-t border-gray-800 px-4 py-3 space-y-2.5 text-sm">

          {/* Consultation time — always shown, editable */}
          <div className="flex items-start gap-2">
            <span className="w-24 flex-shrink-0 text-xs text-gray-500 pt-1">Consultation</span>
            <div className="flex-1">
              <input
                type="datetime-local"
                defaultValue={enquiry.consultationTime ? enquiry.consultationTime.slice(0, 16) : ''}
                onChange={e => saveConsultation(e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
              />
              {consultDisplay && (
                <p className="mt-1 text-[10px] text-emerald-500">{consultDisplay}</p>
              )}
            </div>
          </div>

          {enquiry.phone && (
            <div className="flex gap-2">
              <span className="w-24 flex-shrink-0 text-xs text-gray-500">Phone</span>
              <a href={`tel:${enquiry.phone}`} className="text-indigo-400 hover:underline text-xs">{enquiry.phone}</a>
            </div>
          )}
          {enquiry.goal && (
            <div className="flex gap-2">
              <span className="w-24 flex-shrink-0 text-xs text-gray-500">Goal</span>
              <span className="text-gray-300 text-xs">{enquiry.goal}</span>
            </div>
          )}
          {enquiry.availability?.length > 0 && (
            <div className="flex gap-2">
              <span className="w-24 flex-shrink-0 text-xs text-gray-500">Slots</span>
              <span className="text-gray-300 text-xs">{enquiry.availability.join(', ')}</span>
            </div>
          )}

          {/* Editable notes */}
          <div className="flex items-start gap-2">
            <span className="w-24 flex-shrink-0 text-xs text-gray-500 pt-1">Notes</span>
            {editingNote ? (
              <div className="flex-1 space-y-1.5">
                <textarea
                  autoFocus
                  rows={3}
                  value={noteVal}
                  onChange={e => setNoteVal(e.target.value)}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button onClick={saveNote} className="rounded-lg bg-indigo-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-indigo-500">Save</button>
                  <button onClick={() => { setNoteVal(enquiry.message || ''); setEditingNote(false); }} className="rounded-lg border border-gray-700 px-3 py-1 text-[10px] text-gray-400 hover:border-gray-600">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditingNote(true)} className="flex-1 text-left text-xs text-gray-400 hover:text-gray-200 transition">
                {enquiry.message || <span className="italic text-gray-600">Add a note…</span>}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <span className="w-24 flex-shrink-0 text-xs text-gray-500">Received</span>
            <span className="text-gray-500 text-xs">{date}</span>
          </div>

          <div className="flex gap-3 pt-1">
            <a
              href={`mailto:${enquiry.email}?subject=Your PT enquiry`}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
            >
              Email
            </a>
            {enquiry.phone && (
              <a
                href={`tel:${enquiry.phone}`}
                className="rounded-lg border border-gray-700 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-gray-600"
              >
                Call
              </a>
            )}
            <button
              onClick={() => { if (confirm('Delete this enquiry?')) onDelete(enquiry.id); }}
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

export default function ClientList() {
  const [enquiries, setEnquiries] = useState(() => getStored(ENQUIRIES_KEY));
  const [filter,    setFilter]    = useState('all');

  useEffect(() => {
    function refresh() { setEnquiries(getStored(ENQUIRIES_KEY)); }
    window.addEventListener('pt_data_updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('pt_data_updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  function handleDelete(id) {
    deleteRecord(ENQUIRIES_KEY, id);
  }

  const FILTER_TABS = [
    { key: 'all',       label: 'All' },
    { key: 'new',       label: 'New' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'booked',    label: 'Booked' },
  ];

  const visible = filter === 'all'
    ? enquiries
    : enquiries.filter(e => (e.status ?? 'new') === filter);

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Client Enquiries</h1>
          <p className="text-xs text-gray-500">{enquiries.length} total · tap status to advance</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-gray-800 bg-gray-900 p-1">
        {FILTER_TABS.map(({ key, label }) => {
          const count = key === 'all'
            ? enquiries.length
            : enquiries.filter(e => (e.status ?? 'new') === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
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

      {visible.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-600">
          {filter === 'all'
            ? 'No enquiries yet. Share your enquiry form link.'
            : `No ${filter} enquiries.`}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(e => (
            <EnquiryCard key={e.id} enquiry={e} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
