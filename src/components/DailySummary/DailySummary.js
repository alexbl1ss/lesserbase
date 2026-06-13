import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import useDailySummary, { STAFF_CATEGORIES } from './useDailySummary.js';

const qualChip = { height: 18, ml: 0.5, fontSize: '0.65rem' };

// A single contact line: name on the left, tappable number (or placeholder) right.
function ContactRow({ person }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.25 }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{person.name}</Typography>
      {person.phone ? (
        <Typography component="a" href={`tel:${person.phone}`} variant="body2" sx={{ color: 'primary.main', textDecoration: 'none' }}>
          {person.phone}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
          no number
        </Typography>
      )}
    </Stack>
  );
}

function ContactGroup({ label, people }) {
  if (people.length === 0) return null;
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      {people.map((p) => (
        <ContactRow key={`${label}-${p.nsrId}`} person={p} />
      ))}
    </Box>
  );
}

// Key on-call people for the day, deduped per group. Same source as Staff on
// Duty (scheduled + on site today), so it reflects who's actually reachable.
function KeyContacts({ staff }) {
  const managers = staff.filter((s) => s.category === 'Camp Manager');
  const dsls = staff.filter((s) => s.dsl);
  const firstAiders = staff.filter((s) => s.firstaid);
  if (managers.length === 0 && dsls.length === 0 && firstAiders.length === 0) return null;
  return (
    <Card sx={{ mb: 1.5, textAlign: 'left', bgcolor: 'action.hover' }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Key Contacts</Typography>
        <ContactGroup label="Camp Manager" people={managers} />
        <ContactGroup label="DSL" people={dsls} />
        <ContactGroup label="First Aid" people={firstAiders} />
      </CardContent>
    </Card>
  );
}

// DSL / First Aid / Lifeguard chips for a staff member.
function StaffChips({ s }) {
  return (
    <>
      {s.dsl && <Chip size="small" label="DSL" color="error" sx={qualChip} />}
      {s.firstaid && <Chip size="small" label="First Aid" color="success" sx={qualChip} />}
      {s.lifeguard && <Chip size="small" label="Lifeguard" color="info" sx={qualChip} />}
    </>
  );
}

// Dense table styling for narrow phone screens — trim cell padding hard.
const denseTable = {
  '& td': { px: 1, py: 0.4, fontSize: '0.75rem', borderBottom: '1px solid', borderColor: 'divider' },
  '& tr:last-child td': { borderBottom: 0 },
};

// Collapsible section. Count shows in the header so it's scannable while
// collapsed. Defaults open; a count of 0 starts collapsed to save scroll.
function Section({ title, count, defaultExpanded, children }) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      sx={{ '&:before': { display: 'none' }, boxShadow: 1, mb: 1, borderRadius: 1 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
        <Typography sx={{ flex: 1, fontWeight: 600 }}>{title}</Typography>
        {count != null && (
          <Chip size="small" label={count} sx={{ mr: 1 }} color={count > 0 ? 'primary' : 'default'} />
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1.5, textAlign: 'left' }}>{children}</AccordionDetails>
    </Accordion>
  );
}

const Empty = ({ children }) => (
  <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>{children}</Typography>
);

function ArrivalsDepartures({ arrivals, departures }) {
  const line = (label, b) => (
    <Box sx={{ mb: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, display: 'inline' }}>
        {label}: {b ? b.total : 0}
      </Typography>
      {b && b.total > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
          {' '}— St {b.STUDENT.total} (M{b.STUDENT.M}/F{b.STUDENT.F}), Ad {b.ADULT.total} (M{b.ADULT.M}/F{b.ADULT.F})
        </Typography>
      )}
    </Box>
  );
  return (
    <Box>
      {line('Arriving', arrivals)}
      {line('Leaving', departures)}
    </Box>
  );
}

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const dateStr = useMemo(() => selectedDate.format('YYYY-MM-DD'), [selectedDate]);
  const { loading, error, site, noSite, data } = useDailySummary(dateStr);

  const shiftDay = (n) => setSelectedDate((d) => d.add(n, 'day'));
  const hc = data.headcount;
  const headTotal = hc.total;
  const arrDepCount = (data.arrivals?.total || 0) + (data.departures?.total || 0);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', pb: 4 }}>
      {/* Sticky day navigator — reachable by thumb while scrolling on a phone */}
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
          <IconButton onClick={() => shiftDay(-1)} aria-label="Previous day" size="small">
            <ChevronLeftIcon />
          </IconButton>
          <DatePicker
            value={selectedDate}
            onChange={(d) => d && setSelectedDate(d)}
            format="ddd DD MMM YYYY"
            slotProps={{ textField: { size: 'small', sx: { width: 180 } } }}
          />
          <IconButton onClick={() => shiftDay(1)} aria-label="Next day" size="small">
            <ChevronRightIcon />
          </IconButton>
        </Stack>
        {site && (
          <Typography variant="caption" align="center" display="block" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {site}
          </Typography>
        )}
      </Box>

      <Box sx={{ px: 1, pt: 1 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>
        )}

        {!loading && noSite && (
          <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            You are not assigned to a site, so there is no Daily Summary to show. Please speak to your manager if you think this is wrong.
          </Typography>
        )}

        {!loading && !error && !noSite && (
          <>
            <KeyContacts staff={data.staff} />

            <Section title="On-site Headcount" count={headTotal} defaultExpanded={headTotal > 0}>
              {headTotal === 0 ? (
                <Empty>No one recorded on site.</Empty>
              ) : (
                <Table size="small" sx={denseTable}>
                  <TableHead>
                    <TableRow sx={{ '& th': { px: 1, py: 0.5, fontSize: '0.75rem', color: 'text.secondary' } }}>
                      <TableCell />
                      <TableCell align="right">M</TableCell>
                      <TableCell align="right">F</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Students</TableCell>
                      <TableCell align="right">{hc.students.M}</TableCell>
                      <TableCell align="right">{hc.students.F}</TableCell>
                      <TableCell align="right">{hc.students.total}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Adults — Staff (overnight)</TableCell>
                      <TableCell align="right">{hc.staffOvernight.M}</TableCell>
                      <TableCell align="right">{hc.staffOvernight.F}</TableCell>
                      <TableCell align="right">{hc.staffOvernight.total}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Adults — Non-staff (overnight)</TableCell>
                      <TableCell align="right">{hc.nonStaffOvernight.M}</TableCell>
                      <TableCell align="right">{hc.nonStaffOvernight.F}</TableCell>
                      <TableCell align="right">{hc.nonStaffOvernight.total}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Day staff</TableCell>
                      <TableCell align="right">—</TableCell>
                      <TableCell align="right">—</TableCell>
                      <TableCell align="right">{hc.dayStaff.total}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { fontWeight: 700 } }}>
                      <TableCell>Total</TableCell>
                      <TableCell align="right" />
                      <TableCell align="right" />
                      <TableCell align="right">{hc.total}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </Section>

            <Section title="Residential Arrivals & Departures" count={arrDepCount} defaultExpanded={arrDepCount > 0}>
              <ArrivalsDepartures arrivals={data.arrivals} departures={data.departures} />
            </Section>

            <Section title="Classes" count={data.classes.length} defaultExpanded={data.classes.length > 0}>
              {data.classes.length === 0 ? (
                <Empty>No classes scheduled.</Empty>
              ) : (
                <Table size="small" sx={denseTable}>
                  <TableBody>
                    {data.classes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.teacher}</TableCell>
                        <TableCell align="right">{c.studentCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Section>

            <Section title="Activities" count={data.activities.length} defaultExpanded={data.activities.length > 0}>
              {data.activities.length === 0 ? (
                <Empty>No activities scheduled.</Empty>
              ) : (
                <Table size="small" sx={denseTable}>
                  <TableBody>
                    {data.activities.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          {a.name}
                          {a.slot ? ` · ${a.slot}` : ''}
                          {a.external && <Chip size="small" label="Ext" sx={{ ml: 0.5, height: 18 }} />}
                        </TableCell>
                        <TableCell>{a.leader}</TableCell>
                        <TableCell align="right">{a.students}/{a.adults}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Section>

            <Section title="Staff on Duty" count={data.staff.length} defaultExpanded={data.staff.length > 0}>
              {data.staff.length === 0 ? (
                <Empty>No staff scheduled.</Empty>
              ) : (
                STAFF_CATEGORIES.map((cat) => {
                  const people = data.staff.filter((s) => s.category === cat);
                  if (people.length === 0) return null;
                  return (
                    <Box key={cat} sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                        {cat} ({people.length})
                      </Typography>
                      <Table size="small" sx={denseTable}>
                        <TableBody>
                          {people.map((s) => (
                            <TableRow key={s.nsrId}>
                              <TableCell>{s.name}</TableCell>
                              <TableCell align="right">
                                <StaffChips s={s} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  );
                })
              )}
            </Section>

            <Section title="Allergies" count={data.allergies.length} defaultExpanded={data.allergies.length > 0}>
              {data.allergies.length === 0 ? (
                <Empty>No recorded allergies on site.</Empty>
              ) : (
                <Table size="small" sx={denseTable}>
                  <TableBody>
                    {data.allergies.map((a, i) => (
                      <TableRow key={`${a.name}-${i}`}>
                        <TableCell>{a.name}</TableCell>
                        <TableCell>{a.allergies}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Section>
          </>
        )}
      </Box>
    </Box>
  );
}
