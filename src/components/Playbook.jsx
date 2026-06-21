import { useState, useEffect } from 'react';

// ─── Playbook data ────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'survival',
    title: 'Business Survival',
    emoji: '💼',
    color: 'border-red-500/40 bg-red-500/5',
    accent: 'text-red-400',
    rules: [
      { id: 's1', text: 'NO cash payments — card/bank transfer only.' },
      { id: 's2', text: 'Prepayment required before every session.' },
      { id: 's3', text: '24-hour cancellation policy — client pays in full if they cancel late.' },
      { id: 's4', text: 'Independent employment only — never sign a gym chain contract.' },
      { id: 's5', text: 'Partner with Ourparks / Motivate PT for location access.' },
      { id: 's6', text: 'Avoid The Gym Group and similar chains (they take a cut & restrict you).' },
      { id: 's7', text: 'Use pair-training discounts to fill two slots with one commute.' },
      { id: 's8', text: 'Offer NHS / key-worker discount to attract loyal long-term clients.' },
    ],
  },
  {
    id: 'gear',
    title: 'Gear & Weather Protocol',
    emoji: '🎒',
    color: 'border-sky-500/40 bg-sky-500/5',
    accent: 'text-sky-400',
    rules: [
      { id: 'g1', text: 'Waterproof shoes — non-negotiable, train in all conditions.' },
      { id: 'g2', text: 'Waterproof jacket — must be packed every session.' },
      { id: 'g3', text: 'Waterproof trousers — full rain kit always in the bag.' },
      { id: 'g4', text: 'Mat — warm-up, stretching, floor work.' },
      { id: 'g5', text: 'Suspension trainer (TRX-style) — full-body resistance anywhere.' },
      { id: 'g6', text: 'Jump rope — cardio finisher, takes zero space.' },
      { id: 'g7', text: 'Resistance bands (light/heavy) — adapt any exercise, any level.' },
      { id: 'g8', text: 'Interval timer — structure every session, no guessing.' },
      { id: 'g9', text: 'Pads & gloves — boxing as an ice-breaker (fun = referrals).' },
      { id: 'g10', text: 'Cold/rain = no excuse. Warm up faster, shorten rests. Never cancel.' },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics',
    emoji: '🚲',
    color: 'border-emerald-500/40 bg-emerald-500/5',
    accent: 'text-emerald-400',
    rules: [
      { id: 'l1', text: 'E-bike is mandatory transport — cheapest, no parking, no fuel.' },
      { id: 'l2', text: 'Cluster clients by area — plan route to minimise dead travel time.' },
      { id: 'l3', text: 'Avoid Royal Parks — require authorised trainer permit (or large fee).' },
      { id: 'l4', text: 'Use local parks, estates, and council spaces for sessions.' },
      { id: 'l5', text: 'Always have a weather-fallback indoor space identified per area.' },
      { id: 'l6', text: 'Keep a packed ready-bag — never scramble before a 5:30 AM session.' },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    emoji: '⏰',
    color: 'border-amber-500/40 bg-amber-500/5',
    accent: 'text-amber-400',
    rules: [
      { id: 'o1', text: 'Prime slots: 5:30 AM (pre-work) and 7:00 PM (post-work).' },
      { id: 'o2', text: 'Avoid midday slots — commuters can\'t use them, they kill your schedule.' },
      { id: 'o3', text: 'Target female clients — more consistent, higher referral rate.' },
      { id: 'o4', text: 'Record progress videos every 4 weeks — clients see results, clients stay.' },
      { id: 'o5', text: 'Send session reminders the night before — reduces late cancellations.' },
      { id: 'o6', text: 'Ask for referrals at week 4 and week 8 (when momentum is highest).' },
      { id: 'o7', text: 'Post one social proof reel per week (with client permission).' },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CheckIcon({ checked }) {
  return checked ? (
    <svg className="h-5 w-5 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="h-5 w-5 flex-shrink-0 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
    </svg>
  );
}

function Section({ section, checked, onToggle }) {
  const [open, setOpen] = useState(true);
  const done  = section.rules.filter(r => checked[r.id]).length;
  const total = section.rules.length;

  return (
    <div className={`rounded-2xl border ${section.color} overflow-hidden`}>
      {/* Header — tap to collapse */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{section.emoji}</span>
          <div>
            <h2 className={`font-semibold ${section.accent}`}>{section.title}</h2>
            <p className="text-xs text-gray-500">{done}/{total} checked</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress pip */}
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
          <svg
            className={`h-4 w-4 flex-shrink-0 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Rules list */}
      {open && (
        <ul className="divide-y divide-gray-800/60 border-t border-gray-800/60">
          {section.rules.map((rule) => (
            <li key={rule.id}>
              <button
                onClick={() => onToggle(rule.id)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5 active:bg-white/10"
              >
                <span className="mt-0.5">
                  <CheckIcon checked={!!checked[rule.id]} />
                </span>
                <span className={`text-sm leading-relaxed ${checked[rule.id] ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                  {rule.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'pt_playbook_checked';

export default function Playbook() {
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  });

  // Persist to localStorage whenever checked changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  function toggleRule(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function resetAll() {
    if (confirm('Clear all checkboxes?')) setChecked({});
  }

  const totalRules   = SECTIONS.reduce((n, s) => n + s.rules.length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Operations Playbook</h1>
          <p className="text-xs text-gray-500">{totalChecked}/{totalRules} rules acknowledged</p>
        </div>
        <button
          onClick={resetAll}
          className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-500 transition hover:border-gray-600 hover:text-gray-300"
        >
          Reset
        </button>
      </div>

      {/* Quick-reference banner */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
        <p className="text-xs leading-relaxed text-indigo-300">
          <strong className="text-indigo-200">Today's non-negotiables:</strong>{' '}
          Prepayment confirmed · Rain kit packed · 5:30 AM slot ready · Cancellation policy sent
        </p>
      </div>

      {SECTIONS.map(section => (
        <Section
          key={section.id}
          section={section}
          checked={checked}
          onToggle={toggleRule}
        />
      ))}

      {/* All done celebration */}
      {totalChecked === totalRules && totalRules > 0 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-center">
          <p className="font-semibold text-emerald-400">All rules acknowledged. You're set. Go get it.</p>
        </div>
      )}
    </div>
  );
}
