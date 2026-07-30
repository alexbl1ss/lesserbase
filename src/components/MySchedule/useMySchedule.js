import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyRota, ScheduleUnavailableError } from './api/myScheduleApi.js';
import { byStart } from './utils/scheduleModel.js';

// One call per day shown, with from and to both set to that date — no
// prefetching a range. Every date change re-asks the backend for that day.

// Days we've successfully loaded this session, so a revisit paints instantly
// and a glance still works when the network drops. Kept in sessionStorage (not
// localStorage) deliberately: it dies with the tab session, so one person's
// schedule can't linger for the next user of a shared device — same reasoning
// as the landing page's tile order.
const CACHE_KEY = 'myschedule:days';
const CACHE_LIMIT = 30; // days; plenty for browsing, bounded for storage

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(days) {
  try {
    // Trim oldest-inserted days first so the cache can't grow without bound.
    const keys = Object.keys(days);
    const kept = keys.length > CACHE_LIMIT ? keys.slice(keys.length - CACHE_LIMIT) : keys;
    const trimmed = kept.reduce((acc, k) => ({ ...acc, [k]: days[k] }), {});
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    /* private mode / quota — the cache is a nicety, not a requirement */
  }
}

/**
 * The logged-in user's own rota for `dateStr` (YYYY-MM-DD).
 *
 * Fetches that single day (`from` = `to` = `dateStr`) every time the date
 * changes. A previously loaded day renders from cache while the fresh copy is
 * in flight, so stepping through dates doesn't flash a skeleton.
 */
export default function useMySchedule(dateStr) {
  const [days, setDays] = useState(readCache);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [stale, setStale] = useState(false);
  const reqId = useRef(0);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    setUnavailable(false);
    setStale(false);

    getMyRota(dateStr, dateStr)
      .then((entries) => {
        if (id !== reqId.current) return; // a later date-step won the race
        setDays((prev) => {
          const next = { ...prev, [dateStr]: entries };
          writeCache(next);
          return next;
        });
      })
      .catch((err) => {
        if (id !== reqId.current) return;
        if (err instanceof ScheduleUnavailableError) {
          setUnavailable(true);
        } else {
          setError(err.message || 'Could not load your schedule.');
          setStale(true); // fall back to this day's cached copy, if we have one
        }
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [dateStr, reloadToken]);

  const retry = useCallback(() => setReloadToken((n) => n + 1), []);

  const cached = days[dateStr];
  const hasCache = Array.isArray(cached);
  const entries = hasCache ? cached.slice().sort(byStart) : [];

  return {
    entries,
    loading,
    error,
    unavailable,
    // Only warn "possibly out of date" when we actually fell back to the cache.
    stale: stale && hasCache,
    hasCache,
    retry,
  };
}
