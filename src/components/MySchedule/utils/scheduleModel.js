// Shape + hours rules for the personal rota. Mirrors Greaterbase's Daily Rota so
// the two apps agree on colours, the Unpaid tag and what counts towards hours.

// "HH:mm" -> minutes past midnight. Returns null on anything unparseable.
export function toMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

// Block length in minutes. A block that ends "before" it starts runs past
// midnight (e.g. a night shift 22:00–07:00), so wrap it round the day.
export function durationMins(entry) {
  const s = toMinutes(entry.start);
  const e = toMinutes(entry.end);
  if (s == null || e == null) return 0;
  return e >= s ? e - s : e + 24 * 60 - s;
}

// Same rule as Greaterbase: meals and anything explicitly unpaid don't add to
// the day's hours. Trust the backend's flag when it sends one.
export function countsHours(entry) {
  if (typeof entry.countsHours === 'boolean') return entry.countsHours;
  return entry.kind !== 'meal' && entry.paid !== 'no';
}

// Total counting minutes for a day's entries.
export function totalCountingMins(entries) {
  return entries.reduce((sum, e) => (countsHours(e) ? sum + durationMins(e) : sum), 0);
}

// 390 -> "6h 30m", 120 -> "2h", 45 -> "45m", 0 -> "0h".
export function formatHours(mins) {
  if (!mins) return '0h';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// Class blocks come back titled with just the class code (e.g. "D0102"), which
// reads as nothing on its own — label it. Titles already starting with "Class"
// are left alone so we never produce "Class Class 3B".
export function displayTitle(entry) {
  const title = (entry.title || '').trim();
  if (entry.kind !== 'class' || !title) return title;
  return /^class\b/i.test(title) ? title : `Class ${title}`;
}

// Greaterbase's block palette: [background, border/accent, ink].
export function kindColors(kind, dark) {
  const light = {
    meal: ['#fbf1e0', '#dd9a3c', '#7f5410'],
    act: ['#eee9fb', '#7c5cd6', '#472c9c'],
    class: ['#e7f0fb', '#3f7fce', '#215394'],
    night: ['#e6e8f5', '#3a4491', '#232c69'],
    custom: ['#e2f3ef', '#2f9e8b', '#186253'],
  };
  const night = {
    meal: ['#372c19', '#c68f30', '#f1c884'],
    act: ['#29244e', '#9784e0', '#c9bef6'],
    class: ['#1b2a3e', '#5b8fd0', '#abc9ef'],
    night: ['#1f253d', '#616ab6', '#b6bde9'],
    custom: ['#152e28', '#3fae99', '#92dacb'],
  };
  const table = dark ? night : light;
  const [bg, bd, ink] = table[kind] || table.custom;
  return { bg, bd, ink };
}

// Sort a day's blocks into time order; unparseable times sink to the bottom.
export function byStart(a, b) {
  const sa = toMinutes(a.start);
  const sb = toMinutes(b.start);
  if (sa == null) return sb == null ? 0 : 1;
  if (sb == null) return -1;
  return sa - sb || durationMins(a) - durationMins(b);
}
