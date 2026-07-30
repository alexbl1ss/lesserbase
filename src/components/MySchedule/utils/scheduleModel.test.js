import {
  byStart,
  countsHours,
  displayTitle,
  durationMins,
  formatHours,
  toMinutes,
  totalCountingMins,
} from './scheduleModel.js';

const block = (over = {}) => ({
  date: '2026-08-01',
  campus: 'Loretto',
  title: 'Airport Team',
  kind: 'custom',
  start: '09:00',
  end: '17:00',
  paid: 'yes',
  notes: '',
  ...over,
});

describe('toMinutes', () => {
  it('parses HH:mm', () => {
    expect(toMinutes('09:00')).toBe(540);
    expect(toMinutes('9:05')).toBe(545);
    expect(toMinutes('00:00')).toBe(0);
  });

  it('rejects rubbish', () => {
    expect(toMinutes('')).toBeNull();
    expect(toMinutes(null)).toBeNull();
    expect(toMinutes('25:00')).toBeNull();
    expect(toMinutes('09:70')).toBeNull();
  });
});

describe('durationMins', () => {
  it('measures a normal block', () => {
    expect(durationMins(block({ start: '09:00', end: '17:00' }))).toBe(480);
  });

  it('wraps a block that runs past midnight', () => {
    expect(durationMins(block({ start: '22:00', end: '07:00' }))).toBe(540);
  });

  it('is zero when the times are unusable', () => {
    expect(durationMins(block({ start: 'x', end: '17:00' }))).toBe(0);
  });
});

describe('countsHours', () => {
  it('trusts the backend flag when present', () => {
    expect(countsHours(block({ countsHours: false }))).toBe(false);
    expect(countsHours(block({ kind: 'meal', countsHours: true }))).toBe(true);
  });

  it('falls back to kind !== meal && paid !== no', () => {
    expect(countsHours(block())).toBe(true);
    expect(countsHours(block({ kind: 'meal' }))).toBe(false);
    expect(countsHours(block({ paid: 'no' }))).toBe(false);
    expect(countsHours(block({ paid: 'conditional' }))).toBe(true);
  });
});

describe('totalCountingMins', () => {
  it('sums only the counting blocks', () => {
    const day = [
      block({ start: '09:00', end: '13:00' }), // 240, counts
      block({ kind: 'meal', start: '13:00', end: '13:30' }), // meal, ignored
      block({ start: '21:00', end: '22:00', paid: 'no' }), // unpaid, ignored
      block({ start: '14:00', end: '16:30' }), // 150, counts
    ];
    expect(totalCountingMins(day)).toBe(390);
  });

  it('is zero for an empty day', () => {
    expect(totalCountingMins([])).toBe(0);
  });
});

describe('formatHours', () => {
  it('renders hours and minutes', () => {
    expect(formatHours(390)).toBe('6h 30m');
    expect(formatHours(120)).toBe('2h');
    expect(formatHours(45)).toBe('45m');
    expect(formatHours(0)).toBe('0h');
  });
});

describe('displayTitle', () => {
  it('labels a bare class code', () => {
    expect(displayTitle(block({ kind: 'class', title: 'D0102' }))).toBe('Class D0102');
  });

  it('leaves other kinds alone', () => {
    expect(displayTitle(block({ kind: 'act', title: 'Discovery' }))).toBe('Discovery');
    expect(displayTitle(block({ kind: 'meal', title: 'Breakfast' }))).toBe('Breakfast');
  });

  it('does not double up on a title that already says Class', () => {
    expect(displayTitle(block({ kind: 'class', title: 'Class 3B' }))).toBe('Class 3B');
    expect(displayTitle(block({ kind: 'class', title: 'class 3B' }))).toBe('class 3B');
  });

  it('survives a missing title', () => {
    expect(displayTitle(block({ kind: 'class', title: '' }))).toBe('');
    expect(displayTitle(block({ kind: 'class', title: null }))).toBe('');
  });
});

describe('byStart', () => {
  it('orders by start time, unparseable last', () => {
    const day = [
      block({ title: 'c', start: '21:00' }),
      block({ title: 'bad', start: 'nope' }),
      block({ title: 'a', start: '08:00' }),
      block({ title: 'b', start: '13:00' }),
    ];
    expect(day.slice().sort(byStart).map((b) => b.title)).toEqual(['a', 'b', 'c', 'bad']);
  });
});
