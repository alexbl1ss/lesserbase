import { SERVER_URL } from '../../../constants.js';

// The bearer token is the ONLY thing that identifies the caller. We never send a
// user or staff id — the backend derives who from the token and returns just
// that person's own schedule. The request carries only the date range.
function authHeaders() {
  const token = sessionStorage.getItem('bearer');
  return { Authorization: `Bearer ${token}` };
}

// Thrown when the endpoint isn't deployed yet (it's the one backend dependency
// of this view) so the UI can say so instead of showing a raw failure.
export class ScheduleUnavailableError extends Error {
  constructor() {
    super('My Schedule is not available yet.');
    this.name = 'ScheduleUnavailableError';
  }
}

// GET /api/daily-rota/mine?from=&to= — the caller's blocks across the range,
// wrapped alongside `totalCountingMinutes`. That total is the authority on hours:
// it resolves duties that overlap (half an hour of tuck shop inside an hour of
// supervision is one paid half-hour, not two), which summing blocks cannot.
//
// Returns { entries, totalCountingMinutes }, the total being null when the
// response carries no figure — a bare array, which the spec once returned.
export async function getMyRota(from, to) {
  const res = await fetch(`${SERVER_URL}api/daily-rota/mine?from=${from}&to=${to}`, {
    headers: authHeaders(),
  });

  if (res.status === 204) return { entries: [], totalCountingMinutes: 0 };
  if (res.status === 404 || res.status === 501) throw new ScheduleUnavailableError();
  if (!res.ok) throw new Error(`Could not load your schedule (${res.status}).`);

  const payload = await res.json();
  if (Array.isArray(payload)) return { entries: payload, totalCountingMinutes: null };

  const list = payload?.entries || payload?.blocks || payload?.items || payload?.data;
  const total = payload?.totalCountingMinutes;
  return {
    entries: Array.isArray(list) ? list : [],
    totalCountingMinutes: Number.isFinite(total) ? total : null,
  };
}
