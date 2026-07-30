import React, { useMemo, useState } from 'react';
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
import {
  countsHours,
  displayTitle,
  durationMins,
  formatHours,
  kindColors,
  totalCountingMins,
} from './utils/scheduleModel.js';

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
  const { entries, loading, error, unavailable, stale, hasCache, retry } = useMySchedule(dateStr);

  const total = useMemo(() => totalCountingMins(entries), [entries]);

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

            {entries.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
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
          </>
        )}
      </Box>
    </Box>
  );
}
