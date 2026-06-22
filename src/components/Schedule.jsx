import { useState, useEffect } from 'react';
import { getStored, ENQUIRIES_KEY } from '../lib/storage';

function isSameDay(isoString, date) {
  const d = new Date(isoString);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth()    === date.getMonth()    &&
    d.getDate()     === date.getDate()
  );
}

function formatDay(date) {
  const today    = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const yesterday= new Date(today); yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date.toISOString(), today))     return 'Today';
  if (isSameDay(date.toISOString(), tomorrow))  return 'Tomorrow';
  if (isSameDay(date.toISOString(), yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function Schedule() {
  const [current,    setCurrent]    = useState(new Date());
  const [enquiries,  setEnquiries]  = useState(() => getStored(ENQUIRIES_KEY));

  useEffect(() => {
    function refresh() { setEnquiries(getStored(ENQUIRIES_KEY)); }
    window.addEventListener('pt_data_updated', refresh);
    return () => window.removeEventListener('pt_data_updated', refresh);
  }, []);

  function prevDay() {
    setCurrent(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  }
  function nextDay() {
    setCurrent(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  }
  function goToday() { setCurrent(new Date()); }

  const booked = enquiries
    .filter(e => e.consultationTime && isSameDay(e.consultationTime, current))
    .sort((a, b) => new Date(a.consultationTime) - new Date(b.consultationTime));

  const isToday = isSameDay(current.toISOString(), new Date());

  return (
    <div className="space-y-5">

      {/* Day navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={prevDay}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 text-gray-400 transition hover:border-gray-600 hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-white">{formatDay(current)}</p>
          <p className="text-xs text-gray-500">
            {current.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={nextDay}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 text-gray-400 transition hover:border-gray-600 hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {!isToday && (
        <button
          onClick={goToday}
          className="w-full rounded-xl border border-gray-700 py-2 text-xs font-medium text-gray-500 transition hover:border-gray-600 hover:text-gray-300"
        >
          Back to today
        </button>
      )}

      {/* Session count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">
          {booked.length === 0 ? 'No sessions' : `${booked.length} session${booked.length > 1 ? 's' : ''}`}
        </span>
        <span className="text-xs text-gray-600">scheduled</span>
      </div>

      {booked.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 py-14 text-center">
          <p className="text-sm text-gray-600">No consultations booked for this day.</p>
          <p className="mt-1 text-xs text-gray-700">Set a consultation time in the Clients tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {booked.map(e => (
            <div key={e.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-start gap-3">
                {/* Time block */}
                <div className="flex w-14 flex-shrink-0 flex-col items-center rounded-lg bg-indigo-600/15 py-2 text-center">
                  <span className="text-base font-bold text-indigo-300 leading-none">
                    {formatTime(e.consultationTime)}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {e.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <p className="font-semibold text-gray-100">{e.name}</p>
                  </div>

                  <div className="mt-2 space-y-1">
                    {e.goal && (
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-600">Goal: </span>{e.goal}
                      </p>
                    )}
                    {e.message && (
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-600">Notes: </span>{e.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    {e.phone && (
                      <a
                        href={`tel:${e.phone}`}
                        className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gray-600"
                      >
                        Call
                      </a>
                    )}
                    <a
                      href={`mailto:${e.email}?subject=Your consultation today`}
                      className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gray-600"
                    >
                      Email
                    </a>
                    {e.phone && (
                      <a
                        href={`https://wa.me/44${e.phone.replace(/^0/, '').replace(/\s/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-emerald-900/50 px-3 py-1.5 text-xs font-medium text-emerald-500 transition hover:border-emerald-700"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
