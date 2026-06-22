import { useState, useEffect } from 'react';

let addToast = () => {};

export function notify(rows) {
  rows.forEach(r => {
    addToast({ name: r.name, goal: r.goal || '' });
  });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToast = (toast) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { ...toast, id }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };
    return () => { addToast = () => {}; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-start gap-3 rounded-xl border border-indigo-500/30 bg-gray-900 px-4 py-3 shadow-2xl animate-slide-down"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {t.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">New enquiry</p>
            <p className="truncate text-xs text-gray-400">{t.name}{t.goal ? ` — ${t.goal}` : ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
