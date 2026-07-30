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

// GET /api/daily-rota/mine?from=&to= — a flat list of the caller's blocks across
// the range. The spec returns a bare array; tolerate an envelope object too in
// case the backend wraps it alongside the range hours total.
export async function getMyRota(from, to) {
  const res = await fetch(`${SERVER_URL}api/daily-rota/mine?from=${from}&to=${to}`, {
    headers: authHeaders(),
  });

  if (res.status === 204) return [];
  if (res.status === 404 || res.status === 501) throw new ScheduleUnavailableError();
  if (!res.ok) throw new Error(`Could not load your schedule (${res.status}).`);

  const payload = await res.json();
  if (Array.isArray(payload)) return payload;
  const list = payload?.entries || payload?.blocks || payload?.items || payload?.data;
  return Array.isArray(list) ? list : [];
}
