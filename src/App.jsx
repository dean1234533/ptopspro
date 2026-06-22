import { useState, useEffect } from 'react';
import Playbook      from './components/Playbook';
import LeadDashboard from './components/LeadDashboard';
import EnquiryForm   from './components/EnquiryForm';
import ClientList    from './components/ClientList';
import Schedule      from './components/Schedule';
import RssScout      from './components/RssScout';
import Settings      from './components/Settings';
import { getSettings, SETTINGS_KEY } from './lib/storage';
import { buildFormUrl } from './components/Settings';
import { startSync, stopSync } from './lib/sync';
import { useUpdateCheck } from './hooks/useUpdateCheck';
import ToastContainer, { notify as toastNotify } from './components/Toast';

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
    id: 'schedule',
    label: 'Schedule',
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
  const [linkCopied,   setLinkCopied]  = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);
  const updateAvailable = useUpdateCheck();

  const isIOS       = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid   = /Android/.test(navigator.userAgent);
  const isPWA       = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const showInstall = !isPWA && (isIOS || isAndroid) && !installDismissed;

  const [outreachForm, setOutreachForm] = useState({
    companyName: '', ownerName: '', websiteUrl: '', toEmail: '',
  });

  function copyShareLink() {
    const url = buildFormUrl(getSettings());
    if (!url) { setShowSettings(true); return; }
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  useEffect(() => {
    const canNotify = typeof Notification !== 'undefined';
    if (canNotify && Notification.permission === 'default') Notification.requestPermission();

    function notify(rows) {
      // In-app toast (works on all platforms)
      toastNotify(rows);
      // OS notification where supported (desktop + Android Chrome)
      if (canNotify && Notification.permission === 'granted') {
        rows.forEach(r => new Notification('New Enquiry — PT Ops Pro', { body: `${r.name} wants to book a consultation` }));
      }
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
    <div className="flex min-h-screen bg-gray-950" style={{minHeight:'100dvh'}}>

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

        {/* Settings + Support */}
        <div className="border-t border-gray-800 p-3 space-y-0.5">
          <button
            onClick={copyShareLink}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/10 hover:text-indigo-300"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {linkCopied ? 'Link Copied!' : 'Share Enquiry Link'}
          </button>
          <a
            href="https://wa.me/447752300937"
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-500 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Support
          </a>
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
      <div className="flex min-h-screen flex-1 flex-col md:ml-56" style={{minHeight:'100dvh'}}>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-lg font-bold tracking-tight text-white">PT Ops</span>
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Pro</span>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={copyShareLink}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/10"
                aria-label="Copy enquiry link"
              >
                {linkCopied ? 'Copied!' : 'Share Link'}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-800 hover:text-gray-300"
                aria-label="Settings"
              >
                <GearIcon />
              </button>
            </div>
          </div>
        </header>

        {/* Update banner */}
        {updateAvailable && (
          <div className="flex items-center justify-between gap-3 bg-indigo-600 px-4 py-2.5 text-sm text-white">
            <span className="font-medium">A new version is available.</span>
            <button
              onClick={() => window.location.reload()}
              className="flex-shrink-0 rounded-lg border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10 transition"
            >
              Update now
            </button>
          </div>
        )}

        {/* Install banner */}
        {showInstall && (
          <div className="flex items-center justify-between gap-3 bg-gray-900 border-b border-gray-800 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">
                {isIOS ? 'Tap Share → Add to Home Screen' : 'Add to Home Screen'}
              </p>
              <p className="text-[11px] text-gray-500">Get a full-screen app experience</p>
            </div>
            <button onClick={() => setInstallDismissed(true)} className="flex-shrink-0 text-gray-600 hover:text-gray-400 text-lg leading-none">✕</button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 pt-4 md:px-8 md:pb-8 md:pt-6" style={{paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))'}}>
          <div className="mx-auto w-full max-w-2xl">
            {activeTab === 'playbook'  && <Playbook />}
            {activeTab === 'outreach'  && <LeadDashboard formState={outreachForm} setFormState={setOutreachForm} />}
            {activeTab === 'enquiry'   && <EnquiryForm />}
            {activeTab === 'clients'   && <ClientList />}
            {activeTab === 'schedule'  && <Schedule />}
            {activeTab === 'prospects' && <RssScout onCopyToForm={handleCopyToForm} />}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm md:hidden" style={{paddingBottom:'env(safe-area-inset-bottom)'}}>
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

      {/* In-app toast notifications */}
      <ToastContainer />
    </div>
  );
}
