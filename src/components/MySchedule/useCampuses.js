import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { getActiveCampuses, getMyProfile } from './api/meApi.js';
import { currentCampus } from './utils/overtimeModel.js';

/**
 * The campuses to offer when recording overtime, and which one to preselect.
 *
 * Both lookups are season-scale facts, not per-day ones, so they're fetched once
 * per mount and the default is re-resolved locally as the user steps between
 * days. Neither failing is fatal — the form still works, it just can't prefill
 * or can't offer a list.
 */
export default function useCampuses(dateStr) {
  const [options, setOptions] = useState([]);
  const [stays, setStays] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getActiveCampuses()
      .then((list) => !cancelled && setOptions(list))
      .catch(() => {});
    getMyProfile()
      .then((profile) => !cancelled && setStays(profile?.stays || []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const myCampus = useMemo(
    () => (stays ? currentCampus(stays, dayjs(dateStr)) : ''),
    [stays, dateStr]
  );

  return { options, myCampus };
}
