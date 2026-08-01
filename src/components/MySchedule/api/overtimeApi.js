import { SERVER_URL } from '../../../constants.js';

// Staff-side overtime: record extra time worked, and read back your own entries.
// Reviewing (approve/reject) is a manager screen and deliberately not here.
//
// As with the personal rota, the bearer token is the ONLY thing identifying the
// caller — we never send a user or staff id. The backend stamps who from the
// token and returns only that person's own entries.
//
// Every assumption about the endpoint's shape lives in this file, so a change to
// the backend contract is a one-file correction:
//   POST   /api/overtime              { workDate, minutes, reason, campus, note } -> 201 entry
//   GET    /api/overtime/mine?from=&to=                                           -> entries
//   PATCH  /api/overtime/{id}         same body                                   -> updated entry
//   DELETE /api/overtime/{id}                                                     -> 204
// An entry is { id, workDate, minutes, reason, campus, note, status, createdAt }
// with status RECORDED (awaiting a decision), APPROVED or REJECTED. Amending and
// withdrawing are only possible while RECORDED — once decided the backend 409s.
const BASE = `${SERVER_URL}api/overtime`;

function authHeaders() {
  const token = sessionStorage.getItem('bearer');
  return { Authorization: `Bearer ${token}` };
}

// Thrown when overtime isn't deployed on this backend yet. The UI hides the
// whole feature on this rather than offering a button that cannot work.
export class OvertimeUnavailableError extends Error {
  constructor() {
    super('Overtime is not available yet.');
    this.name = 'OvertimeUnavailableError';
  }
}

// A 409: the entry was approved or rejected while the user had it on screen, so
// it can no longer be changed. Distinct from a plain failure because the right
// response is to refresh and show the decision, not to offer a retry.
export class OvertimeDecidedError extends Error {
  constructor() {
    super('A manager has already decided this one, so it can no longer be changed.');
    this.name = 'OvertimeDecidedError';
  }
}

// The backend rejects with { statusCode, timestamp, message, description }. Its
// message is written for people ("Minutes must be between 1 and 1440"), so show
// it rather than inventing our own wording for a rule we may not mirror exactly.
async function failureMessage(res, fallback) {
  try {
    const body = await res.json();
    return body?.message || body?.description || fallback;
  } catch {
    return fallback;
  }
}

function toEntries(payload) {
  if (Array.isArray(payload)) return payload;
  const list = payload?.entries || payload?.items || payload?.content || payload?.data;
  return Array.isArray(list) ? list : [];
}

// The caller's own overtime across a date range, inclusive.
export async function getMyOvertime(from, to) {
  const res = await fetch(`${BASE}/mine?from=${from}&to=${to}`, { headers: authHeaders() });

  if (res.status === 204) return [];
  if (res.status === 404 || res.status === 501) throw new OvertimeUnavailableError();
  if (!res.ok) throw new Error(await failureMessage(res, `Could not load your overtime (${res.status}).`));

  return toEntries(await res.json());
}

function body({ workDate, minutes, reason, campus, note }) {
  return JSON.stringify({ workDate, minutes, reason, campus, note: note || null });
}

// Record extra time worked. Comes back RECORDED — a manager decides later.
export async function recordOvertime(entry) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: body(entry),
  });

  if (res.status === 404 || res.status === 501) throw new OvertimeUnavailableError();
  if (!res.ok) throw new Error(await failureMessage(res, `Could not record your overtime (${res.status}).`));

  return res.json();
}

// Correct an entry that hasn't been decided yet. A 404 here means the entry is
// gone or was never the caller's — the backend makes those indistinguishable on
// purpose, so treat it as "no longer there" rather than as a missing endpoint.
export async function amendOvertime(id, entry) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: body(entry),
  });

  if (res.status === 409) throw new OvertimeDecidedError();
  if (res.status === 404) throw new Error('That entry is no longer there.');
  if (!res.ok) throw new Error(await failureMessage(res, `Could not save your changes (${res.status}).`));

  return res.json();
}

// Take back an entry that hasn't been decided yet.
export async function withdrawOvertime(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() });

  if (res.status === 409) throw new OvertimeDecidedError();
  if (res.status === 404) throw new Error('That entry is no longer there.');
  if (!res.ok) throw new Error(await failureMessage(res, `Could not withdraw it (${res.status}).`));
}