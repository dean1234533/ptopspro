import { useState, useEffect, useRef } from 'react';

const POLL_MS = 2 * 60 * 1000; // every 2 minutes

export function useUpdateCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const currentVersion = useRef(typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : null);

  useEffect(() => {
    // Skip in Electron (file:// protocol has no server to poll)
    if (window.location.protocol === 'file:') return;
    // Skip if we don't have a build time to compare against
    if (!currentVersion.current) return;

    async function check() {
      try {
        const res = await fetch('/version.json?t=' + Date.now());
        if (!res.ok) return;
        const { v } = await res.json();
        if (v && v !== currentVersion.current) setUpdateAvailable(true);
      } catch {
        // Network error — silently ignore
      }
    }

    const id = setInterval(check, POLL_MS);
    return () => clearInterval(id);
  }, []);

  return updateAvailable;
}
