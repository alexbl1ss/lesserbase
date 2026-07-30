import React from 'react';
// This repo has no src/setupTests.js, so the DOM matchers are pulled in here.
import '@testing-library/jest-dom';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import MySchedule from './MySchedule.js';
import { getMyRota, ScheduleUnavailableError } from './api/myScheduleApi.js';

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

const today = () => new Date().toISOString().slice(0, 10);

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

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

it('lists the day in time order with a counting-hours total', async () => {
  getMyRota.mockResolvedValue([
    day({ title: 'Afternoon activities', kind: 'act', start: '14:00', end: '16:30', notes: 'football' }),
    day({ title: 'Breakfast', kind: 'meal', start: '08:00', end: '08:30', paid: 'no', countsHours: false }),
    day({ title: 'Airport Team', start: '09:00', end: '13:00' }),
  ]);

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
  getMyRota.mockResolvedValue([]);
  render(<MySchedule username="jo.bloggs@bliss.com" />);

  await waitFor(() => expect(getMyRota).toHaveBeenCalled());
  expect(getMyRota).toHaveBeenCalledWith(today(), today());
});

it('sends no identifier for the user — only the dates', async () => {
  getMyRota.mockResolvedValue([]);
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
  getMyRota.mockResolvedValue([
    { date, campus: 'Dollar', title: 'D0102', kind: 'class', start: '09:00', end: '12:30', paid: null, countsHours: true, notes: null },
    { date, campus: 'Dollar', title: 'Discovery', kind: 'act', start: '14:00', end: '16:00', paid: null, countsHours: true, notes: null },
    { date, campus: 'Dollar', title: 'Disco', kind: 'act', start: '19:00', end: '21:00', paid: null, countsHours: true, notes: null },
    {
      date, campus: 'Dollar', title: 'Evening residential presence', kind: 'custom',
      start: '21:00', end: '22:00', paid: 'no', countsHours: false,
      notes: 'Pastoral availability within residential areas.',
    },
  ]);

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

it('jumps straight to a date picked from the calendar', async () => {
  getMyRota.mockResolvedValue([]);
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
  getMyRota.mockResolvedValue([]);
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

  getMyRota.mockResolvedValue([day({ title: 'Airport Team' })]);
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Airport Team')).toBeInTheDocument();
});

it('refetches for the new day on every date change', async () => {
  getMyRota.mockResolvedValue([day({ title: 'Airport Team' })]);
  render(<MySchedule />);
  await screen.findByText('Airport Team');
  expect(getMyRota).toHaveBeenCalledTimes(1);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  getMyRota.mockResolvedValue([]);

  await userEvent.click(screen.getByLabelText('Next day'));

  await waitFor(() => expect(getMyRota).toHaveBeenCalledTimes(2));
  expect(getMyRota).toHaveBeenLastCalledWith(tomorrowStr, tomorrowStr);
  expect(await screen.findByText('No duties assigned.')).toBeInTheDocument();
  expect(screen.getByText('Back to today')).toBeInTheDocument();
});

it('repaints a revisited day from cache, then refreshes it', async () => {
  getMyRota.mockResolvedValue([day({ title: 'Airport Team' })]);
  render(<MySchedule />);
  await screen.findByText('Airport Team');

  getMyRota.mockResolvedValue([]);
  await userEvent.click(screen.getByLabelText('Next day'));
  await screen.findByText('No duties assigned.');

  // Back to today: the cached copy shows immediately, and we still re-ask.
  getMyRota.mockResolvedValue([day({ title: 'Airport Team' })]);
  await userEvent.click(screen.getByLabelText('Previous day'));
  expect(screen.getByText('Airport Team')).toBeInTheDocument();
  await waitFor(() => expect(getMyRota).toHaveBeenCalledTimes(3));
});
