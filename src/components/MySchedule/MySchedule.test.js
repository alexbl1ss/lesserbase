import React from 'react';
// This repo has no src/setupTests.js, so the DOM matchers are pulled in here.
import '@testing-library/jest-dom';
import { render as rtlRender, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import MySchedule from './MySchedule.js';
import { getMyRota, ScheduleUnavailableError } from './api/myScheduleApi.js';
import {
  getMyOvertime,
  recordOvertime,
  amendOvertime,
  withdrawOvertime,
  OvertimeUnavailableError,
  OvertimeDecidedError,
} from './api/overtimeApi.js';
import { getActiveCampuses, getMyProfile } from './api/meApi.js';

// The date picker needs the same localization context App.js provides.
const render = (ui) =>
  rtlRender(
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      {ui}
    </LocalizationProvider>
  );

jest.mock('./api/myScheduleApi.js', () => {
  const actual = jest.requireActual('./api/myScheduleApi.js');
  return { ...actual, getMyRota: jest.fn() };
});

jest.mock('./api/overtimeApi.js', () => {
  const actual = jest.requireActual('./api/overtimeApi.js');
  return {
    ...actual,
    getMyOvertime: jest.fn(),
    recordOvertime: jest.fn(),
    amendOvertime: jest.fn(),
    withdrawOvertime: jest.fn(),
  };
});

jest.mock('./api/meApi.js', () => ({
  getActiveCampuses: jest.fn(),
  getMyProfile: jest.fn(),
}));

// Local, not UTC: the view works in local dates (dayjs()), so a UTC-based
// helper disagrees with it between midnight and midnight-UTC — an hour each
// night in BST when every date assertion here would fail.
const today = () => dayjs().format('YYYY-MM-DD');

const day = (over = {}) => ({
  date: today(),
  campus: 'Loretto',
  title: 'Airport Team',
  kind: 'custom',
  start: '09:00',
  end: '17:00',
  paid: 'yes',
  countsHours: true,
  notes: '',
  ...over,
});

// What the endpoint returns: the day's blocks plus its own hours total. Pass
// null for the total to stand in for a response that carries no figure.
const rota = (entries, totalCountingMinutes = null) => ({ entries, totalCountingMinutes });

const overtimeEntry = (over = {}) => ({
  id: 1,
  workDate: today(),
  minutes: 90,
  reason: 'Covered late airport run',
  campus: 'Loretto',
  note: '',
  status: 'RECORDED',
  createdAt: `${today()}T22:14:00`,
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  // Most tests don't care about overtime; default to a day with none recorded.
  getMyOvertime.mockResolvedValue([]);
  getActiveCampuses.mockResolvedValue(['Loretto', 'Dollar']);
  getMyProfile.mockResolvedValue({ stays: [] });
});

it('lists the day in time order with a counting-hours total', async () => {
  getMyRota.mockResolvedValue(rota([
    day({ title: 'Afternoon activities', kind: 'act', start: '14:00', end: '16:30', notes: 'football' }),
    day({ title: 'Breakfast', kind: 'meal', start: '08:00', end: '08:30', paid: 'no', countsHours: false }),
    day({ title: 'Airport Team', start: '09:00', end: '13:00' }),
  ], 390));

  render(<MySchedule username="jo.bloggs@bliss.com" />);

  await screen.findByText('Airport Team');

  const titles = screen.getAllByText(/Breakfast|Airport Team|Afternoon activities/).map((n) => n.textContent);
  expect(titles).toEqual(['Breakfast', 'Airport Team', 'Afternoon activities']);

  // 4h (airport) + 2h30 (activities); breakfast is an unpaid meal and doesn't count.
  expect(screen.getByText('6h 30m assigned')).toBeInTheDocument();
  expect(screen.getByText('Unpaid')).toBeInTheDocument();
  expect(screen.getByText('football')).toBeInTheDocument();
});

it('asks for the single selected day — from and to are the same date', async () => {
  getMyRota.mockResolvedValue(rota([]));
  render(<MySchedule username="jo.bloggs@bliss.com" />);

  await waitFor(() => expect(getMyRota).toHaveBeenCalled());
  expect(getMyRota).toHaveBeenCalledWith(today(), today());
});

it('sends no identifier for the user — only the dates', async () => {
  getMyRota.mockResolvedValue(rota([]));
  render(<MySchedule username="jo.bloggs@bliss.com" />);

  await waitFor(() => expect(getMyRota).toHaveBeenCalled());
  const args = getMyRota.mock.calls[0];
  expect(args).toHaveLength(2);
  args.forEach((a) => expect(a).toMatch(/^\d{4}-\d{2}-\d{2}$/));
});

// Verbatim entries from a real trial response for 2026-06-29 (Dollar), kept as
// a fixture so the null-heavy fields stay covered: class/act blocks carry
// paid: null and notes: null, only the residential block is tagged unpaid.
it('renders a real day off trial, agreeing with the backend hours total', async () => {
  const date = today();
  getMyRota.mockResolvedValue(rota([
    { date, campus: 'Dollar', title: 'D0102', kind: 'class', start: '09:00', end: '12:30', paid: null, countsHours: true, notes: null },
    { date, campus: 'Dollar', title: 'Discovery', kind: 'act', start: '14:00', end: '16:00', paid: null, countsHours: true, notes: null },
    { date, campus: 'Dollar', title: 'Disco', kind: 'act', start: '19:00', end: '21:00', paid: null, countsHours: true, notes: null },
    {
      date, campus: 'Dollar', title: 'Evening residential presence', kind: 'custom',
      start: '21:00', end: '22:00', paid: 'no', countsHours: false,
      notes: 'Pastoral availability within residential areas.',
    },
  ], 450));

  render(<MySchedule username="jo.bloggs@bliss.com" />);
  // Bare class codes are labelled so "D0102" reads as a class.
  await screen.findByText('Class D0102');

  // 210 + 120 + 120 = 450 counting minutes, matching totalCountingMinutes.
  expect(screen.getByText('7h 30m assigned')).toBeInTheDocument();
  expect(screen.getByText('3 paid blocks')).toBeInTheDocument();

  // Only the residential block is unpaid, and it's the only one with a detail line.
  expect(screen.getAllByText('Unpaid')).toHaveLength(1);
  expect(screen.getByText('Pastoral availability within residential areas.')).toBeInTheDocument();

  // paid: null must not read as unpaid, and notes: null must not render as "null".
  expect(screen.queryByText('null')).not.toBeInTheDocument();
  expect(screen.getByText('Dollar', { exact: false })).toBeInTheDocument();
});

// A real Tuesday from production: Tuck Shop 16:30–17:00 sits inside Supervision
// 16:00–17:00. The backend pays that half-hour once (300 minutes); adding the
// blocks up ourselves would count it twice and show 5h 30m.
it('shows the backend total when duties overlap, not the sum of the blocks', async () => {
  const date = today();
  const at = (title, kind, start, end, countsHours) => ({
    date, campus: 'Loretto', title, kind, start, end, paid: null, countsHours, notes: '',
  });
  getMyRota.mockResolvedValue(rota([
    at('Breakfast', 'meal', '08:00', '08:45', false),
    at('Lunch', 'meal', '12:30', '13:30', false),
    at('Golf', 'act', '14:00', '16:00', true),
    at('Supervision', 'custom', '16:00', '17:00', true),
    at('Tuck Shop', 'custom', '16:30', '17:00', true),
    at('Dinner', 'meal', '17:30', '18:30', false),
    at('pool', 'act', '19:00', '21:00', true),
  ], 300));

  render(<MySchedule username="iain.page@bliss.com" />);
  await screen.findByText('Tuck Shop');

  expect(screen.getByText('5h assigned')).toBeInTheDocument();
  expect(screen.queryByText('5h 30m assigned')).not.toBeInTheDocument();
  expect(screen.getByText('4 paid blocks')).toBeInTheDocument();
});

// Only if a response arrives without a figure do we fall back to summing.
it('falls back to summing the blocks when no total comes back', async () => {
  getMyRota.mockResolvedValue(rota([
    day({ title: 'Airport Team', start: '09:00', end: '13:00' }),
    day({ title: 'Evening activities', kind: 'act', start: '19:00', end: '21:00' }),
  ], null));

  render(<MySchedule />);
  await screen.findByText('Airport Team');
  expect(screen.getByText('6h assigned')).toBeInTheDocument();
});

it('jumps straight to a date picked from the calendar', async () => {
  getMyRota.mockResolvedValue(rota([]));
  render(<MySchedule />);
  await waitFor(() => expect(getMyRota).toHaveBeenCalled());

  expect(screen.getByRole('textbox', { name: /select date/i }))
    .toHaveValue(dayjs().format('ddd DD MMM YYYY'));

  // Open the calendar and tap the 1st of the shown month — no stepping.
  await userEvent.click(screen.getByRole('button', { name: /choose date/i }));
  await userEvent.click(await screen.findByRole('gridcell', { name: '1' }));

  const first = dayjs().date(1).format('YYYY-MM-DD');
  await waitFor(() => expect(getMyRota).toHaveBeenLastCalledWith(first, first));
});

it('shows a friendly empty state', async () => {
  getMyRota.mockResolvedValue(rota([]));
  render(<MySchedule />);
  expect(await screen.findByText('No duties assigned.')).toBeInTheDocument();
});

it('explains when the endpoint is not deployed yet', async () => {
  getMyRota.mockRejectedValue(new ScheduleUnavailableError());
  render(<MySchedule />);
  expect(await screen.findByText(/isn't switched on yet/)).toBeInTheDocument();
});

it('offers a retry when the fetch fails outright', async () => {
  getMyRota.mockRejectedValue(new Error('Could not load your schedule (500).'));
  render(<MySchedule />);
  expect(await screen.findByText('Could not load your schedule (500).')).toBeInTheDocument();

  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Airport Team')).toBeInTheDocument();
});

it('refetches for the new day on every date change', async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  render(<MySchedule />);
  await screen.findByText('Airport Team');
  expect(getMyRota).toHaveBeenCalledTimes(1);

  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');
  getMyRota.mockResolvedValue(rota([]));

  await userEvent.click(screen.getByLabelText('Next day'));

  await waitFor(() => expect(getMyRota).toHaveBeenCalledTimes(2));
  expect(getMyRota).toHaveBeenLastCalledWith(tomorrowStr, tomorrowStr);
  expect(await screen.findByText('No duties assigned.')).toBeInTheDocument();
  expect(screen.getByText('Back to today')).toBeInTheDocument();
});

it('repaints a revisited day from cache, then refreshes it', async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  render(<MySchedule />);
  await screen.findByText('Airport Team');

  getMyRota.mockResolvedValue(rota([]));
  await userEvent.click(screen.getByLabelText('Next day'));
  await screen.findByText('No duties assigned.');

  // Back to today: the cached copy shows immediately, and we still re-ask.
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  await userEvent.click(screen.getByLabelText('Previous day'));
  expect(screen.getByText('Airport Team')).toBeInTheDocument();
  await waitFor(() => expect(getMyRota).toHaveBeenCalledTimes(3));
});

// ── Overtime ───────────────────────────────────────────────────────────────
// Recording extra time worked, and seeing it back with its status. Approving
// happens elsewhere; nothing here decides an entry.

it('lists recorded overtime with its status, without touching the assigned total', async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  getMyOvertime.mockResolvedValue([
    overtimeEntry({ id: 1, minutes: 90, reason: 'Covered late airport run' }),
  ]);

  render(<MySchedule />);
  await screen.findByText('Covered late airport run');

  expect(screen.getByText('1h 30m')).toBeInTheDocument();
  expect(screen.getByText('Awaiting approval')).toBeInTheDocument();

  // Assigned hours are the rota's; a pending claim doesn't inflate them.
  expect(screen.getByText('8h assigned')).toBeInTheDocument();
  expect(screen.queryByText('9h 30m assigned')).not.toBeInTheDocument();
  expect(screen.getByText(/awaiting approval and isn't counted yet/)).toBeInTheDocument();
});

it('totals approved overtime on its own line', async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  getMyOvertime.mockResolvedValue([
    overtimeEntry({ id: 1, minutes: 60, reason: 'Late duty', status: 'APPROVED' }),
    overtimeEntry({ id: 2, minutes: 30, reason: 'Extra cover', status: 'REJECTED' }),
  ]);

  render(<MySchedule />);
  await screen.findByText('Late duty');

  expect(screen.getByText('Approved')).toBeInTheDocument();
  expect(screen.getByText('Rejected')).toBeInTheDocument();
  // Only the approved hour totals; the rejected half-hour doesn't.
  expect(screen.getByText('+1h')).toBeInTheDocument();
  expect(screen.getByText('8h assigned')).toBeInTheDocument();
});

it('records overtime and shows it straight away', async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  getMyOvertime.mockResolvedValue([]);
  recordOvertime.mockResolvedValue(
    overtimeEntry({ id: 7, minutes: 90, reason: 'Late airport run' })
  );

  render(<MySchedule />);
  await screen.findByText('Airport Team');
  expect(screen.getByText('Nothing recorded for this day.')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /record overtime/i }));
  const dialog = await screen.findByRole('dialog');
  await userEvent.type(within(dialog).getByLabelText(/minutes worked/i), '90');
  await userEvent.type(within(dialog).getByLabelText(/what was it for/i), 'Late airport run');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Record overtime' }));

  // The day being viewed and that day's campus are filled in for the user.
  await waitFor(() => expect(recordOvertime).toHaveBeenCalledWith({
    workDate: today(),
    minutes: 90,
    reason: 'Late airport run',
    campus: 'Loretto',
    note: '',
  }));

  expect(await screen.findByText('Late airport run')).toBeInTheDocument();
  expect(screen.getByText('Awaiting approval')).toBeInTheDocument();
});

it('keeps an entry the backend would reject on the client', async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  render(<MySchedule />);
  await screen.findByText('Airport Team');

  await userEvent.click(screen.getByRole('button', { name: /record overtime/i }));
  const dialog = await screen.findByRole('dialog');
  // A reason but no minutes — a guaranteed 400.
  await userEvent.type(within(dialog).getByLabelText(/what was it for/i), 'Late airport run');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Record overtime' }));

  expect(await screen.findByText('How long did you work?')).toBeInTheDocument();
  expect(recordOvertime).not.toHaveBeenCalled();
});

it('surfaces the backend message when it refuses the entry', async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  recordOvertime.mockRejectedValue(new Error('Minutes must be between 1 and 1440'));

  render(<MySchedule />);
  await screen.findByText('Airport Team');

  await userEvent.click(screen.getByRole('button', { name: /record overtime/i }));
  const dialog = await screen.findByRole('dialog');
  await userEvent.type(within(dialog).getByLabelText(/minutes worked/i), '90');
  await userEvent.type(within(dialog).getByLabelText(/what was it for/i), 'Late airport run');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Record overtime' }));

  expect(await screen.findByText('Minutes must be between 1 and 1440')).toBeInTheDocument();
});

it('offers recording on a day with no duties at all', async () => {
  getMyRota.mockResolvedValue(rota([]));
  render(<MySchedule />);
  await screen.findByText('No duties assigned.');

  // Extra time gets worked on days off too, so the button is still there.
  expect(screen.getByRole('button', { name: /record overtime/i })).toBeInTheDocument();
});

it('hides overtime entirely when the endpoint is not deployed yet', async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  getMyOvertime.mockRejectedValue(new OvertimeUnavailableError());

  render(<MySchedule />);
  await screen.findByText('Airport Team');

  await waitFor(() => expect(getMyOvertime).toHaveBeenCalled());
  expect(screen.queryByRole('button', { name: /record overtime/i })).not.toBeInTheDocument();
  expect(screen.queryByText('Overtime')).not.toBeInTheDocument();
});

it("doesn't claim the day is clear when overtime failed to load", async () => {
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  getMyOvertime.mockRejectedValue(new Error('Could not load your overtime (500).'));

  render(<MySchedule />);
  await screen.findByText('Airport Team');

  expect(await screen.findByText("Couldn't load your overtime.")).toBeInTheDocument();
  expect(screen.queryByText('Nothing recorded for this day.')).not.toBeInTheDocument();
});

it('follows an entry recorded against an earlier day to that day', async () => {
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  getMyRota.mockResolvedValue(rota([day({ title: 'Airport Team' })], 480));
  getMyOvertime.mockResolvedValue([]);
  recordOvertime.mockResolvedValue(
    overtimeEntry({ id: 9, workDate: yesterday, minutes: 60, reason: 'Late duty' })
  );

  render(<MySchedule />);
  await screen.findByText('Airport Team');

  await userEvent.click(screen.getByRole('button', { name: /record overtime/i }));
  const dialog = await screen.findByRole('dialog');
  await userEvent.type(within(dialog).getByLabelText(/minutes worked/i), '60');
  await userEvent.type(within(dialog).getByLabelText(/what was it for/i), 'Late duty');

  // The saved entry belongs to yesterday, so the view moves there — saving it
  // into today's list would have hidden it.
  getMyOvertime.mockResolvedValue([
    overtimeEntry({ id: 9, workDate: yesterday, minutes: 60, reason: 'Late duty' }),
  ]);
  await userEvent.click(within(dialog).getByRole('button', { name: 'Record overtime' }));

  await waitFor(() => expect(getMyOvertime).toHaveBeenLastCalledWith(yesterday, yesterday));
  expect(await screen.findByText('Late duty')).toBeInTheDocument();
});

// ── Campus ─────────────────────────────────────────────────────────────────

it('defaults the campus to where I am and offers the other active campuses', async () => {
  // A day off: nothing on the rota, so the answer has to come from my stay.
  getMyRota.mockResolvedValue(rota([]));
  getMyProfile.mockResolvedValue({
    stays: [
      {
        residential_base: 'Dollar',
        arrivaldate: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
        departuredate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      },
    ],
  });
  getActiveCampuses.mockResolvedValue(['Loretto', 'Dollar', 'Strathallan']);

  render(<MySchedule />);
  await screen.findByText('No duties assigned.');
  await waitFor(() => expect(getMyProfile).toHaveBeenCalled());

  await userEvent.click(screen.getByRole('button', { name: /record overtime/i }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('Dollar')).toBeInTheDocument();

  await userEvent.click(within(dialog).getByRole('combobox'));
  const options = await screen.findAllByRole('option');
  expect(options.map((o) => o.textContent)).toEqual(['Loretto', 'Dollar', 'Strathallan']);
});

it("prefers the day's own campus over my stay when the rota says where I was", async () => {
  getMyRota.mockResolvedValue(rota([day({ campus: 'Loretto' })], 480));
  getMyProfile.mockResolvedValue({
    stays: [
      {
        residential_base: 'Dollar',
        arrivaldate: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
        departuredate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      },
    ],
  });

  render(<MySchedule />);
  await screen.findByText('Airport Team');
  await userEvent.click(screen.getByRole('button', { name: /record overtime/i }));

  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('Loretto')).toBeInTheDocument();
});

it('still lets me record when the campus list is unavailable', async () => {
  getMyRota.mockResolvedValue(rota([day()], 480));
  getActiveCampuses.mockRejectedValue(new Error('api/campuses/active -> 500'));

  render(<MySchedule />);
  await screen.findByText('Airport Team');
  await userEvent.click(screen.getByRole('button', { name: /record overtime/i }));

  // Falls back to a plain field rather than an empty, unusable dropdown.
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByLabelText(/campus/i)).toHaveValue('Loretto');
});

// ── Amend and withdraw ─────────────────────────────────────────────────────

it('amends an entry that is still awaiting approval', async () => {
  getMyRota.mockResolvedValue(rota([day()], 480));
  getMyOvertime.mockResolvedValue([overtimeEntry({ id: 5, minutes: 90, reason: 'Late duty' })]);
  amendOvertime.mockResolvedValue(overtimeEntry({ id: 5, minutes: 120, reason: 'Late duty' }));

  render(<MySchedule />);
  await screen.findByText('Late duty');

  await userEvent.click(screen.getByRole('button', { name: 'Amend' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('Amend overtime')).toBeInTheDocument();

  const minutes = within(dialog).getByLabelText(/minutes worked/i);
  expect(minutes).toHaveValue(90);
  await userEvent.clear(minutes);
  await userEvent.type(minutes, '120');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

  await waitFor(() => expect(amendOvertime).toHaveBeenCalledWith(5, expect.objectContaining({
    minutes: 120,
    reason: 'Late duty',
  })));
  expect(await screen.findByText('2h')).toBeInTheDocument();
});

it('withdraws an entry after confirming', async () => {
  getMyRota.mockResolvedValue(rota([day()], 480));
  getMyOvertime.mockResolvedValue([overtimeEntry({ id: 5, reason: 'Late duty' })]);
  withdrawOvertime.mockResolvedValue(undefined);

  render(<MySchedule />);
  await screen.findByText('Late duty');

  await userEvent.click(screen.getByRole('button', { name: 'Withdraw' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText(/won't go to your manager/)).toBeInTheDocument();

  await userEvent.click(within(dialog).getByRole('button', { name: 'Withdraw' }));

  await waitFor(() => expect(withdrawOvertime).toHaveBeenCalledWith(5));
  await waitFor(() => expect(screen.queryByText('Late duty')).not.toBeInTheDocument());
  expect(screen.getByText('Nothing recorded for this day.')).toBeInTheDocument();
});

it('leaves a withdrawal alone if I back out', async () => {
  getMyRota.mockResolvedValue(rota([day()], 480));
  getMyOvertime.mockResolvedValue([overtimeEntry({ id: 5, reason: 'Late duty' })]);

  render(<MySchedule />);
  await screen.findByText('Late duty');

  await userEvent.click(screen.getByRole('button', { name: 'Withdraw' }));
  const dialog = await screen.findByRole('dialog');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Keep it' }));

  expect(withdrawOvertime).not.toHaveBeenCalled();
  expect(screen.getByText('Late duty')).toBeInTheDocument();
});

it('offers neither amend nor withdraw once a manager has decided', async () => {
  getMyRota.mockResolvedValue(rota([day()], 480));
  getMyOvertime.mockResolvedValue([
    overtimeEntry({ id: 5, reason: 'Approved one', status: 'APPROVED' }),
    overtimeEntry({ id: 6, reason: 'Rejected one', status: 'REJECTED' }),
  ]);

  render(<MySchedule />);
  await screen.findByText('Approved one');

  expect(screen.queryByRole('button', { name: 'Amend' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Withdraw' })).not.toBeInTheDocument();
});

it('says so and refreshes when a manager decided it first', async () => {
  getMyRota.mockResolvedValue(rota([day()], 480));
  getMyOvertime.mockResolvedValue([overtimeEntry({ id: 5, reason: 'Late duty' })]);
  withdrawOvertime.mockRejectedValue(new OvertimeDecidedError());

  render(<MySchedule />);
  await screen.findByText('Late duty');
  expect(getMyOvertime).toHaveBeenCalledTimes(1);

  // It was approved while sitting on screen, so the entry stays — with the
  // fresh state re-read from the backend rather than guessed at.
  getMyOvertime.mockResolvedValue([
    overtimeEntry({ id: 5, reason: 'Late duty', status: 'APPROVED' }),
  ]);
  await userEvent.click(screen.getByRole('button', { name: 'Withdraw' }));
  const dialog = await screen.findByRole('dialog');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Withdraw' }));

  expect(await screen.findByText(/already decided this one/)).toBeInTheDocument();
  await waitFor(() => expect(getMyOvertime).toHaveBeenCalledTimes(2));
  expect(await screen.findByText('Approved')).toBeInTheDocument();
});

// Overtime is agreed in advance as often as it's claimed after the fact, so a
// future day is a legitimate entry, not a mistake to block.
it('records overtime for a future day', async () => {
  const nextWeek = dayjs().add(7, 'day').format('YYYY-MM-DD');
  getMyRota.mockResolvedValue(rota([]));
  getMyOvertime.mockResolvedValue([]);
  recordOvertime.mockResolvedValue(
    overtimeEntry({ id: 11, workDate: nextWeek, minutes: 120, reason: 'Pre-approved excursion' })
  );

  render(<MySchedule />);
  await screen.findByText('No duties assigned.');

  // Step the schedule forward a week, then record against the day on screen.
  for (let i = 0; i < 7; i += 1) {
    await userEvent.click(screen.getByLabelText('Next day'));
  }
  await waitFor(() => expect(getMyRota).toHaveBeenLastCalledWith(nextWeek, nextWeek));

  await userEvent.click(screen.getByRole('button', { name: /record overtime/i }));
  const dialog = await screen.findByRole('dialog');
  await userEvent.type(within(dialog).getByLabelText(/minutes worked/i), '120');
  await userEvent.type(within(dialog).getByLabelText(/what was it for/i), 'Pre-approved excursion');

  // Nothing on the rota and no stay covering the day, so the campus is picked.
  await userEvent.click(within(dialog).getByRole('combobox'));
  await userEvent.click(await screen.findByRole('option', { name: 'Loretto' }));

  await userEvent.click(within(dialog).getByRole('button', { name: 'Record overtime' }));

  // The future day is sent as-is, not quietly snapped back to today.
  await waitFor(() => expect(recordOvertime).toHaveBeenCalledWith(expect.objectContaining({
    workDate: nextWeek,
    minutes: 120,
  })));
  expect(await screen.findByText('Pre-approved excursion')).toBeInTheDocument();
});
