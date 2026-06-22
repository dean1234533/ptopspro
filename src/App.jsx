import { useState, useEffect } from 'react';
import Playbook      from './components/Playbook';
import LeadDashboard from './components/LeadDashboard';
import EnquiryForm   from './components/EnquiryForm';
import ClientList    from './components/ClientList';
import RssScout      from './components/RssScout';
import Settings      from './components/Settings';
import { getSettings, SETTINGS_KEY } from './lib/storage';
import { startSync, stopSync } from './lib/sync';

const TABS = [
  {
    id: 'playbook',
    label: 'Playbook',
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'outreach',
    label: 'Outreach',
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'enquiry',
    label: 'Enquiry',
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'prospects',
    label: 'Prospects',
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
];

const GearIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function App() {
  const [activeTab,    setActiveTab]    = useState('playbook');
  const [showSettings, setShowSettings] = useState(() => !getSettings().trainerId);

  const [outreachForm, setOutreachForm] = useState({
    companyName: '', ownerName: '', websiteUrl: '', toEmail: '',
  });

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();

    function notify(rows) {
      rows.forEach(r => {
        if (Notification.permission === 'granted') {
          new Notification('New Enquiry — PT Ops Pro', { body: `${r.name} wants to book a consultation` });
        }
      });
    }

    function initSync() {
      stopSync();
      startSync(notify);
    }

    initSync();

    // Restart sync whenever settings are saved (e.g. trainerId just became available)
    function onUpdate(e) {
      if (!e.detail?.key || e.detail.key === SETTINGS_KEY) initSync();
    }
    window.addEventListener('pt_data_updated', onUpdate);

    return () => {
      stopSync();
      window.removeEventListener('pt_data_updated', onUpdate);
    };
  }, []);

  function handleCopyToForm(fields) {
    setOutreachForm(prev => ({ ...prev, ...fields }));
    setActiveTab('outreach');
  }

  return (
    <div className="flex min-h-dvh bg-gray-950">

      {/* ── Sidebar — md and up ────────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 md:z-30 md:border-r md:border-gray-800 md:bg-gray-950">

        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-gray-800 px-5 py-4">
          <span className="text-base font-bold tracking-tight text-white">PT Ops</span>
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Pro</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Settings */}
        <div className="border-t border-gray-800 p-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-800/80 hover:text-gray-300"
          >
            <GearIcon />
            Settings
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div className="flex min-h-dvh flex-1 flex-col md:ml-56">

        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-lg font-bold tracking-tight text-white">PT Ops</span>
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Pro</span>
            <button
              onClick={() => setShowSettings(true)}
              className="ml-auto rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-800 hover:text-gray-300"
              aria-label="Settings"
            >
              <GearIcon />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-2xl">
            {activeTab === 'playbook'  && <Playbook />}
            {activeTab === 'outreach'  && <LeadDashboard formState={outreachForm} setFormState={setOutreachForm} />}
            {activeTab === 'enquiry'   && <EnquiryForm />}
            {activeTab === 'clients'   && <ClientList />}
            {activeTab === 'prospects' && <RssScout onCopyToForm={handleCopyToForm} />}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm md:hidden">
          <div className="flex">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  activeTab === tab.id ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Settings modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
