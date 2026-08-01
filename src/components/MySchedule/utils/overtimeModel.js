import dayjs from 'dayjs';

// Shape + rules for staff-recorded overtime. The backend is the authority on all
// of this; what's here is presentation plus a client-side echo of its validation
// so an obvious mistake is caught before the round trip.

export const MAX_MINUTES = 1440; // a day
export const MAX_TEXT = 500; // reason and note

// RECORDED is the resting state — recorded, awaiting a manager's decision.
const STATUSES = {
  RECORDED: { label: 'Awaiting approval', color: 'warning' },
  APPROVED: { label: 'Approved', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
};

// Semantic palette colours rather than fixed hex, so the chips stay legible in
// both themes and match the rest of the app's status language.
export function statusChip(status) {
  return STATUSES[status] || { label: status || 'Unknown', color: 'default' };
}

// Amending and withdrawing are only offered while an entry is still RECORDED;
// the backend 409s once a manager has decided, so don't put the button there.
export function canChange(entry) {
  return entry?.status === 'RECORDED';
}

/**
 * Which campus the user is at on `date`, from the NSR `stays[]` on their
 * profile. Same rule Daily Summary resolves its site with: the stay covering
 * the date, otherwise the nearest one by distance (upcoming beats past on a
 * tie), so a day either side of a camp still resolves sensibly.
 *
 * `date` is a dayjs; `stays` may be missing entirely for staff with no NSR row,
 * in which case there's nothing to default to and the form asks.
 */
export function currentCampus(stays, date) {
  if (!Array.isArray(stays) || !stays.length) return '';

  const withBase = stays.filter((s) => s.residential_base && dayjs(s.arrivaldate).isValid());
  if (!withBase.length) return '';

  const covering = withBase.find(
    (s) =>
      !date.isBefore(dayjs(s.arrivaldate), 'day') && !date.isAfter(dayjs(s.departuredate), 'day')
  );
  if (covering) return covering.residential_base;

  const ranked = withBase
    .map((s) => {
      const start = dayjs(s.arrivaldate);
      const end = dayjs(s.departuredate);
      const before = date.isBefore(start, 'day');
      return {
        base: s.residential_base,
        distance: Math.abs(before ? start.diff(date, 'day') : date.diff(end, 'day')),
        upcoming: before ? 0 : 1,
      };
    })
    .sort((a, b) => a.distance - b.distance || a.upcoming - b.upcoming);

  return ranked[0].base;
}

// Minutes across a set of entries, optionally only those with a given status.
export function totalMinutes(entries, status) {
  return entries.reduce(
    (sum, e) => (status && e.status !== status ? sum : sum + (Number(e.minutes) || 0)),
    0
  );
}

/**
 * Mirrors the backend's 400s: blank workDate/minutes/reason/campus, minutes
 * outside 1–1440, reason or note over 500 chars.
 *
 * Deliberately does NOT bar a future date. Overtime is agreed in advance as
 * often as it's claimed after the fact, so the form allows it; if the backend
 * still refuses future dates, its own message is what the user sees.
 *
 * Returns a { field: message } object — empty when the entry is good to send.
 */
export function validateOvertime({ workDate, minutes, reason, campus, note }) {
  const errors = {};
  const mins = Number(minutes);

  if (!workDate) errors.workDate = 'Pick the day.';

  if (!minutes && minutes !== 0) errors.minutes = 'How long did you work?';
  else if (!Number.isFinite(mins) || mins <= 0) errors.minutes = 'Enter more than 0 minutes.';
  else if (mins > MAX_MINUTES) errors.minutes = "That's more than a day — check the minutes.";

  if (!String(reason || '').trim()) errors.reason = 'Say what the extra time was for.';
  else if (reason.length > MAX_TEXT) errors.reason = `Keep this under ${MAX_TEXT} characters.`;

  if (!String(campus || '').trim()) errors.campus = 'Which campus?';

  if (note && note.length > MAX_TEXT) errors.note = `Keep this under ${MAX_TEXT} characters.`;

  return errors;
}
