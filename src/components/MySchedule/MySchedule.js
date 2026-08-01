import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import useMySchedule from './useMySchedule.js';
import useMyOvertime from './useMyOvertime.js';
import useCampuses from './useCampuses.js';
import OvertimeDialog from './OvertimeDialog.jsx';
import WithdrawOvertimeDialog from './WithdrawOvertimeDialog.jsx';
import {
  countsHours,
  displayTitle,
  durationMins,
  formatHours,
  kindColors,
  totalCountingMins,
} from './utils/scheduleModel.js';
import { canChange, statusChip, totalMinutes } from './utils/overtimeModel.js';

const OVERTIME_ICON = `${process.env.PUBLIC_URL || ''}/assets/overtime.png`;

// Read-only personal rota. Everything here is scheduled in Greaterbase; this
// view only renders what the backend composes for the logged-in user.

function DayNav({ date, setDate }) {
  const isToday = date.isSame(dayjs(), 'day');
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1,
        px: 1,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        <IconButton onClick={() => setDate((d) => d.subtract(1, 'day'))} aria-label="Previous day">
          <ChevronLeftIcon />
        </IconButton>
        <DatePicker
          label="Select Date"
          value={date}
          onChange={(d) => d && d.isValid() && setDate(d)}
          format="ddd DD MMM YYYY"
          slotProps={{ textField: { size: 'small', sx: { width: 190 } } }}
        />
        <IconButton onClick={() => setDate((d) => d.add(1, 'day'))} aria-label="Next day">
          <ChevronRightIcon />
        </IconButton>
      </Stack>
      <Box sx={{ textAlign: 'center', mt: 0.5, minHeight: 30 }}>
        {isToday ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Today
          </Typography>
        ) : (
          <Button size="small" onClick={() => setDate(dayjs())}>
            Back to today
          </Button>
        )}
      </Box>
    </Box>
  );
}

// One duty. Time range on the left, title/detail on the right, kind colour as a
// left accent bar so the day is scannable at a glance.
function BlockCard({ entry }) {
  const theme = useTheme();
  const c = kindColors(entry.kind, theme.palette.mode === 'dark');
  const unpaid = entry.paid === 'no';
  const detail = entry.role || entry.notes;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        textAlign: 'left',
        bgcolor: c.bg,
        color: c.ink,
        borderRadius: 1.5,
        borderLeft: `5px solid ${c.bd}`,
        boxShadow: 1,
        mb: 1,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 1.5, minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ columnGap: 1, rowGap: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              fontSize: '1.05rem',
              letterSpacing: '0.01em',
            }}
          >
            {entry.start}&ndash;{entry.end}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {formatHours(durationMins(entry))}
          </Typography>
          {unpaid && (
            <Chip
              size="small"
              label="Unpaid"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'rgba(0,0,0,0.08)',
                color: 'inherit',
              }}
            />
          )}
        </Stack>
        <Typography sx={{ fontWeight: 600, mt: 0.25 }}>{displayTitle(entry)}</Typography>
        {detail && (
          <Typography variant="body2" sx={{ mt: 0.25, opacity: 0.85 }}>
            {detail}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// Recorded overtime. Deliberately not styled as a rota block: this is time the
// person is claiming, not time they were assigned, and the status colour is the
// thing to read at a glance.
function OvertimeCard({ entry, onAmend, onWithdraw }) {
  const theme = useTheme();
  const { label, color } = statusChip(entry.status);
  const accent = color === 'default' ? theme.palette.divider : theme.palette[color].main;
  // Only while it's still yours to change — once decided the backend refuses.
  const changeable = canChange(entry);

  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `5px solid ${accent}`,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ columnGap: 1, rowGap: 0.5, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {formatHours(Number(entry.minutes) || 0)}
        </Typography>
        <Chip size="small" label={label} color={color} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
      </Stack>
      <Typography sx={{ fontWeight: 600, mt: 0.25 }}>{entry.reason}</Typography>
      {entry.note && (
        <Typography variant="body2" sx={{ mt: 0.25, color: 'text.secondary' }}>
          {entry.note}
        </Typography>
      )}
      {changeable && (
        <Stack direction="row" spacing={1} sx={{ mt: 0.5, ml: -1 }}>
          <Button size="small" onClick={() => onAmend(entry)}>
            Amend
          </Button>
          <Button size="small" color="error" onClick={() => onWithdraw(entry)}>
            Withdraw
          </Button>
        </Stack>
      )}
    </Box>
  );
}

// The overtime strip under the day: what's already recorded, and the way to add
// more. Rendered even on an empty day — extra time gets worked on days off too.
function OvertimeSection({ entries, error, notice, onRecord, onAmend, onWithdraw }) {
  const pending = entries.filter((e) => e.status === 'RECORDED').length;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          mb: 0.5,
        }}
      >
        Overtime
      </Typography>

      {notice && (
        <Typography variant="body2" sx={{ color: 'warning.main', mb: 1 }}>
          {notice}
        </Typography>
      )}

      {entries.map((e, i) => (
        <OvertimeCard
          key={e.id ?? `${e.workDate}-${e.minutes}-${i}`}
          entry={e}
          onAmend={onAmend}
          onWithdraw={onWithdraw}
        />
      ))}

      {/* Never claim the day is clear when we simply couldn't read it. */}
      {entries.length === 0 && (
        <Typography variant="body2" sx={{ color: error ? 'warning.main' : 'text.secondary', mb: 1 }}>
          {error ? "Couldn't load your overtime." : 'Nothing recorded for this day.'}
        </Typography>
      )}

      <Button
        fullWidth
        variant="outlined"
        onClick={onRecord}
        startIcon={
          <Box component="img" src={OVERTIME_ICON} alt="" sx={{ width: 24, height: 24 }} />
        }
        sx={{ justifyContent: 'center', py: 1 }}
      >
        Record overtime
      </Button>

      {pending > 0 && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
          {pending} {pending === 1 ? 'entry is' : 'entries are'} awaiting approval and
          {' '}{pending === 1 ? "isn't" : "aren't"} counted yet.
        </Typography>
      )}
    </Box>
  );
}

const Loading = () => (
  <Box sx={{ px: 1, pt: 2 }}>
    {[0, 1, 2].map((i) => (
      <Skeleton key={i} variant="rounded" height={84} sx={{ mb: 1, borderRadius: 1.5 }} />
    ))}
  </Box>
);

const Message = ({ children, action }) => (
  <Box sx={{ mt: 5, px: 3 }}>
    <Typography align="center" sx={{ color: 'text.secondary' }}>
      {children}
    </Typography>
    {action && <Box sx={{ textAlign: 'center', mt: 2 }}>{action}</Box>}
  </Box>
);

export default function MySchedule({ username }) {
  const [date, setDate] = useState(dayjs());
  const dateStr = useMemo(() => date.format('YYYY-MM-DD'), [date]);
  const {
    entries, totalCountingMinutes, loading, error, unavailable, stale, hasCache, retry,
  } = useMySchedule(dateStr);

  // Hours come from the backend, which knows how overlapping duties resolve —
  // an hour of supervision with a half-hour tuck shop inside it is 1h, not 1h30.
  // Summing the blocks ourselves double-counts the overlap, so only do it if a
  // response arrives without a total.
  const total = useMemo(
    () => (totalCountingMinutes == null ? totalCountingMins(entries) : totalCountingMinutes),
    [totalCountingMinutes, entries]
  );

  const overtime = useMyOvertime(dateStr);
  const { options: campusOptions, myCampus } = useCampuses(dateStr);
  // null = closed; { entry: null } = recording new; { entry } = amending it.
  const [editing, setEditing] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  const [notice, setNotice] = useState('');

  // Overtime is kept out of the assigned total: the rota's total is scheduled
  // hours, and an entry only becomes real time once a manager approves it. Show
  // approved overtime as its own line rather than folding it in.
  const approvedOvertime = useMemo(
    () => totalMinutes(overtime.entries, 'APPROVED'),
    [overtime.entries]
  );

  // Overtime is usually recorded after the fact, so the dialog lets you pick an
  // earlier day. Follow the entry to that day rather than saving it into a view
  // that can't show it — otherwise a successful record looks like it vanished.
  const { addEntry, replaceEntry, removeEntry, reload } = overtime;
  const handleSaved = useCallback(
    (saved) => {
      setNotice('');
      // The entry may have moved to another day, either because it was recorded
      // for one or because an amend changed it. Follow it rather than dropping
      // it into a view that can't show it.
      if (saved?.workDate && saved.workDate !== dateStr) setDate(dayjs(saved.workDate));
      else if (editing?.entry) replaceEntry(saved);
      else addEntry(saved);
    },
    [dateStr, editing, addEntry, replaceEntry]
  );

  // A manager decided it while it was on screen: say so and re-ask, since what's
  // displayed is out of date by definition.
  const handleDecided = useCallback(
    (message) => {
      setNotice(message);
      reload();
    },
    [reload]
  );

  const handleWithdrawn = useCallback(
    (entry) => {
      setNotice('');
      removeEntry(entry);
    },
    [removeEntry]
  );

  // Normally one campus a day; if a day ever spans two, label each run.
  const campuses = useMemo(
    () => [...new Set(entries.map((e) => e.campus).filter(Boolean))],
    [entries]
  );
  const showCampusHeadings = campuses.length > 1;

  // Only greet by name when the login is a first.last address — a role mailbox
  // like finance@… would otherwise read as "My schedule — Finance".
  const local = (username || '').split('@')[0];
  const firstName = /^[a-z]+\.[a-z]+/i.test(local) ? local.split('.')[0] : '';
  const heading = firstName
    ? `My schedule — ${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`
    : 'My schedule';

  // Keep showing cached duties while a background refresh is in flight.
  const showSkeleton = loading && !hasCache;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', pb: 5 }}>
      <DayNav date={date} setDate={setDate} />

      <Box sx={{ px: 1, pt: 1.5 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          {heading}
          {!showCampusHeadings && campuses[0] ? ` · ${campuses[0]}` : ''}
        </Typography>

        {showSkeleton && <Loading />}

        {!showSkeleton && unavailable && (
          <Message action={<Button variant="outlined" onClick={retry}>Retry</Button>}>
            My Schedule isn&apos;t switched on yet. Your rota is still being kept in
            Greaterbase — please check with your manager.
          </Message>
        )}

        {!showSkeleton && !unavailable && error && !hasCache && (
          <Message action={<Button variant="outlined" onClick={retry}>Retry</Button>}>
            {error}
          </Message>
        )}

        {!showSkeleton && !unavailable && (!error || hasCache) && (
          <>
            {stale && (
              <Typography
                variant="caption"
                display="block"
                align="center"
                sx={{ color: 'warning.main', mb: 1 }}
              >
                Offline — showing the last schedule loaded.{' '}
                <Button size="small" onClick={retry} sx={{ minWidth: 0, p: 0 }}>
                  Retry
                </Button>
              </Typography>
            )}

            {entries.length === 0 ? (
              <Message>No duties assigned.</Message>
            ) : showCampusHeadings ? (
              campuses.map((campus) => (
                <Box key={campus} sx={{ mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      mb: 0.5,
                    }}
                  >
                    {campus}
                  </Typography>
                  {entries
                    .filter((e) => e.campus === campus)
                    .map((e, i) => (
                      <BlockCard key={`${campus}-${e.title}-${e.start}-${i}`} entry={e} />
                    ))}
                </Box>
              ))
            ) : (
              entries.map((e, i) => (
                <BlockCard key={`${e.title}-${e.start}-${i}`} entry={e} />
              ))
            )}

            {!overtime.unavailable && !overtime.loading && (
              <OvertimeSection
                entries={overtime.entries}
                error={overtime.error}
                notice={notice}
                onRecord={() => setEditing({ entry: null })}
                onAmend={(entry) => setEditing({ entry })}
                onWithdraw={setWithdrawing}
              />
            )}

            {(entries.length > 0 || approvedOvertime > 0) && (
              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                {entries.length > 0 && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {entries.filter(countsHours).length} paid{' '}
                      {entries.filter(countsHours).length === 1 ? 'block' : 'blocks'}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {formatHours(total)} assigned
                    </Typography>
                  </Box>
                )}
                {approvedOvertime > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      mt: entries.length > 0 ? 0.5 : 0,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Approved overtime
                    </Typography>
                    <Typography
                      sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'success.main' }}
                    >
                      +{formatHours(approvedOvertime)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Mounted only while open so each open starts from a clean, prefilled form. */}
      {editing && (
        <OvertimeDialog
          entry={editing.entry}
          date={date}
          // Where the person actually is: the day's own duties are the best
          // evidence, their current stay covers days off with nothing on the rota.
          campus={campuses[0] || myCampus}
          campusOptions={campusOptions}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onDecided={handleDecided}
        />
      )}

      {withdrawing && (
        <WithdrawOvertimeDialog
          entry={withdrawing}
          onClose={() => setWithdrawing(null)}
          onWithdrawn={handleWithdrawn}
          onDecided={handleDecided}
        />
      )}
    </Box>
  );
}
