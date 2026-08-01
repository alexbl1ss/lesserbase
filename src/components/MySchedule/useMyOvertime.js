import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyOvertime, OvertimeUnavailableError } from './api/overtimeApi.js';

/**
 * The logged-in user's own overtime for `dateStr` (YYYY-MM-DD), fetched with
 * from = to = that date so it lines up with the day the rota is showing.
 *
 * Unlike the rota this isn't cached in sessionStorage: overtime is something you
 * record and check, not something you glance at offline, and a stale copy of a
 * pending entry is worse than none.
 *
 * `unavailable` means the endpoint isn't deployed on this backend yet — the
 * caller hides the whole feature rather than offering a button that can't work.
 */
export default function useMyOvertime(dateStr) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);

    getMyOvertime(dateStr, dateStr)
      .then((list) => {
        if (id !== reqId.current) return; // a later date-step won the race
        setEntries(list);
        setUnavailable(false);
      })
      .catch((err) => {
        if (id !== reqId.current) return;
        setEntries([]);
        if (err instanceof OvertimeUnavailableError) setUnavailable(true);
        else setError(err.message || 'Could not load your overtime.');
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [dateStr, reloadToken]);

  // Fold a just-recorded entry (the 201 response) into the day being shown, so
  // it appears immediately without a refetch. An entry recorded against another
  // date belongs to a day we aren't displaying, so it's dropped.
  const addEntry = useCallback(
    (entry) => {
      if (!entry || entry.workDate !== dateStr) return;
      setEntries((prev) => [...prev, entry]);
    },
    [dateStr]
  );

  // An amended entry comes back from the backend whole, so swap it in by id.
  const replaceEntry = useCallback((updated) => {
    if (!updated?.id) return;
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  const removeEntry = useCallback((removed) => {
    if (!removed?.id) return;
    setEntries((prev) => prev.filter((e) => e.id !== removed.id));
  }, []);

  // Used when a manager decided an entry while it was on screen: what's shown is
  // out of date by definition, so re-ask rather than patching it locally.
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  return { entries, loading, error, unavailable, addEntry, replaceEntry, removeEntry, reload };
}
