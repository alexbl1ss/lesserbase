import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  getMyProfile,
  whoIsArriving,
  whoIsLeaving,
  studentsResidentByNight,
  adultsResidentByNight,
  fetchClassGroups,
  fetchClassLists,
  getActivityGroups,
  getActivityLeaders,
  getWeeklyStaffScheduling,
  getAllergies,
} from './api/dailySummaryApi.js';

// Campuses are matched by name across endpoints; compare leniently.
const sameCampus = (a, b) =>
  (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

// dayjs Monday of the week containing `d` (ISO weeks start Monday).
function mondayOf(d) {
  const day = d.day(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  return d.add(diff, 'day');
}

const isResidential = (row) =>
  row?.residential === true || row?.isResident === true || row?.overnight === true ||
  row?.overnight_resident === true;

// Build a STUDENT/ADULT × M/F breakdown of overnight residents from people rows.
function residentBreakdown(rows) {
  const out = {
    STUDENT: { M: 0, F: 0, total: 0 },
    ADULT: { M: 0, F: 0, total: 0 },
    total: 0,
  };
  rows.filter(isResidential).forEach((r) => {
    const type = (r.personType || '').toUpperCase() === 'ADULT' ? 'ADULT' : 'STUDENT';
    const g = (r.gender || '').trim().toUpperCase().startsWith('F') ? 'F' : 'M';
    out[type][g] += 1;
    out[type].total += 1;
    out.total += 1;
  });
  return out;
}

// Pick the single site this user is assigned to for `date`: the NSR stay whose
// range covers the day, else the nearest stay (upcoming preferred, then most
// recent). Returns { base } or null when the user has no stays at all.
function resolveSite(stays, date) {
  if (!Array.isArray(stays) || stays.length === 0) return null;

  const covering = stays.find(
    (s) =>
      s.residential_base &&
      dayjs(s.arrivaldate).isValid() &&
      !date.isBefore(dayjs(s.arrivaldate), 'day') &&
      !date.isAfter(dayjs(s.departuredate), 'day')
  );
  if (covering) return { base: covering.residential_base };

  const withBase = stays.filter((s) => s.residential_base && dayjs(s.arrivaldate).isValid());
  if (withBase.length === 0) return null;

  // Nearest by distance to the stay's range; prefer upcoming over past on a tie.
  const ranked = withBase
    .map((s) => {
      const start = dayjs(s.arrivaldate);
      const end = dayjs(s.departuredate);
      const distance = date.isBefore(start, 'day')
        ? start.diff(date, 'day')
        : date.diff(end, 'day');
      const upcoming = date.isBefore(start, 'day') ? 0 : 1;
      return { base: s.residential_base, distance: Math.abs(distance), upcoming };
    })
    .sort((a, b) => a.distance - b.distance || a.upcoming - b.upcoming);

  return { base: ranked[0].base };
}

const EMPTY = {
  arrivals: null,
  departures: null,
  headcount: {
    students: { total: 0, M: 0, F: 0 },
    staffOvernight: { total: 0, M: 0, F: 0 },
    nonStaffOvernight: { total: 0, M: 0, F: 0 },
    dayStaff: { total: 0 },
    total: 0,
  },
  classes: [],
  activities: [],
  staff: [],
  allergies: [],
};

const isFemale = (g) => (g || '').trim().toUpperCase().startsWith('F');

// Tally a list of people into { total, M, F } by a gender accessor.
function genderTally(rows, genderOf) {
  const t = { total: 0, M: 0, F: 0 };
  rows.forEach((r) => {
    t.total += 1;
    if (isFemale(genderOf(r))) t.F += 1;
    else t.M += 1;
  });
  return t;
}

// Staff seniority buckets, highest first (mirrors Greaterbase's subtables).
export const STAFF_CATEGORIES = ['Camp Manager', 'House Parents', 'Teachers', 'Activity Staff'];

const hasRole = (roles, re) => (roles || []).some((r) => re.test(r));

// Assign a person to their single highest-ranking bucket by role.
function staffCategory(roles) {
  if (hasRole(roles, /camp.*manager/i)) return 'Camp Manager';
  if (hasRole(roles, /residential.*manager/i)) return 'House Parents';
  if (hasRole(roles, /teacher/i)) return 'Teachers';
  return 'Activity Staff';
}

export default function useDailySummary(dateStr) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    site: null,
    noSite: false,
    data: EMPTY,
  });

  useEffect(() => {
    let cancelled = false;
    const date = dayjs(dateStr);

    async function run() {
      setState((s) => ({ ...s, loading: true, error: null }));

      let profile;
      try {
        profile = await getMyProfile();
      } catch (err) {
        if (!cancelled) {
          setState({ loading: false, error: 'Could not load your profile.', site: null, noSite: false, data: EMPTY });
        }
        return;
      }

      const site = resolveSite(profile?.stays, date);
      if (!site) {
        if (!cancelled) {
          setState({ loading: false, error: null, site: null, noSite: true, data: EMPTY });
        }
        return;
      }

      const campus = site.base;
      // Per-call .catch so one failing endpoint doesn't sink the whole report.
      const safe = (p, fallback) => p.catch(() => fallback);

      const yearStart = date.startOf('year').format('YYYY-MM-DD');
      const yearEnd = date.endOf('year').format('YYYY-MM-DD');
      const monday = mondayOf(date).format('YYYY-MM-DD');

      const [
        arrivingRows,
        leavingRows,
        residentStudents,
        residentAdults,
        classGroups,
        classListRows,
        activityGroups,
        activityLeaders,
        weekly,
        allergyRows,
      ] = await Promise.all([
        safe(whoIsArriving(dateStr), []),
        safe(whoIsLeaving(dateStr), []),
        safe(studentsResidentByNight(dateStr), []),
        safe(adultsResidentByNight(dateStr, campus), []),
        safe(fetchClassGroups(campus, dateStr, dateStr), []),
        safe(fetchClassLists(dateStr, dateStr, campus), []),
        safe(getActivityGroups(dateStr), []),
        safe(getActivityLeaders(dateStr, campus), []),
        safe(getWeeklyStaffScheduling(campus, monday), null),
        safe(getAllergies(yearStart, yearEnd), []),
      ]);

      // --- Arrivals / departures (overnight residents at this site) ---
      const arrivals = residentBreakdown(arrivingRows.filter((r) => sameCampus(r.campus, campus)));
      const departures = residentBreakdown(leavingRows.filter((r) => sameCampus(r.campus, campus)));

      // --- Headcount: students (M/F), overnight adults split staff/non-staff
      // (M/F), and day staff (non-residential, count only — no gender source) ---
      const students = genderTally(
        residentStudents.filter((r) => sameCampus(r.stay_campus, campus)),
        (r) => r.studentGender
      );
      // adultsResidentByNight is already campus-scoped and overnight-only.
      const isStaffRole = (role) => (role || '').toLowerCase().includes('staff');
      const staffOvernight = genderTally(residentAdults.filter((r) => isStaffRole(r.role)), (r) => r.gender);
      const nonStaffOvernight = genderTally(residentAdults.filter((r) => !isStaffRole(r.role)), (r) => r.gender);

      // Day staff = scheduled & on-site today but not residential. Deduped by nsrId.
      let dayStaffCount = 0;
      if (weekly && Array.isArray(weekly.rows)) {
        const seenDay = new Set();
        dayStaffCount = weekly.rows.filter((r) => {
          if (r.residential) return false;
          const scheduledToday = (r.scheduledDates || []).some((d) => dayjs(d).isSame(date, 'day'));
          const onSite =
            r.arrivalDate &&
            !date.isBefore(dayjs(r.arrivalDate), 'day') &&
            !date.isAfter(dayjs(r.departureDate), 'day');
          if (!scheduledToday || !onSite || seenDay.has(r.nsrId)) return false;
          seenDay.add(r.nsrId);
          return true;
        }).length;
      }

      const headcount = {
        students,
        staffOvernight,
        nonStaffOvernight,
        dayStaff: { total: dayStaffCount },
        total: students.total + staffOvernight.total + nonStaffOvernight.total + dayStaffCount,
      };

      // --- Classes: count students per group, resolve teacher ---
      const listsForSite = classListRows.filter((r) => sameCampus(r.campus, campus));
      const countByGroup = {};
      const teacherByGroup = {};
      listsForSite.forEach((r) => {
        countByGroup[r.group_id] = (countByGroup[r.group_id] || 0) + 1;
        if (!teacherByGroup[r.group_id] && r.adult_full_name) {
          teacherByGroup[r.group_id] = r.adult_full_name;
        }
      });
      const classes = classGroups
        .filter((g) => sameCampus(g.campus, campus))
        .map((g) => ({
          id: g.id,
          name: g.groupName,
          teacher: teacherByGroup[g.id] || g.leaderName || '—',
          studentCount: countByGroup[g.id] || 0,
        }));

      // --- Activities: members count + resolve leader name ---
      const leaderNameById = {};
      activityLeaders.forEach((l) => {
        if (l.staffId != null) leaderNameById[l.staffId] = l.name;
      });
      const activities = activityGroups
        .filter((g) => sameCampus(g.campus, campus))
        .map((g) => {
          const members = Array.isArray(g.members) ? g.members : [];
          const students = members.filter((m) => (m.personType || '').toUpperCase() === 'STUDENT').length;
          const adults = members.filter((m) => (m.personType || '').toUpperCase() === 'ADULT').length;
          return {
            id: g.groupId,
            name: g.name,
            slot: g.slot,
            external: (g.productType || '').toUpperCase() === 'EXTERNAL',
            leader: g.leaderName || leaderNameById[g.leaderStaffId] || '—',
            students,
            adults,
          };
        });

      // --- Staff scheduling: rows scheduled today and on-site today, deduped ---
      let staff = [];
      if (weekly && Array.isArray(weekly.rows)) {
        const seen = new Set();
        staff = weekly.rows
          .filter((r) => {
            const scheduledToday = (r.scheduledDates || []).some((d) => dayjs(d).isSame(date, 'day'));
            const onSite =
              r.arrivalDate &&
              !date.isBefore(dayjs(r.arrivalDate), 'day') &&
              !date.isAfter(dayjs(r.departureDate), 'day');
            return scheduledToday && onSite;
          })
          .filter((r) => {
            if (seen.has(r.nsrId)) return false;
            seen.add(r.nsrId);
            return true;
          })
          .map((r) => {
            const roles = r.roles || [];
            const quals = r.qualifications || [];
            return {
              nsrId: r.nsrId,
              name: r.name,
              category: staffCategory(roles),
              residential: r.residential,
              dsl: quals.some((q) => /dsl/i.test(q)),
              firstaid: quals.some((q) => /first/i.test(q)),
              lifeguard: hasRole(roles, /lifeguard/i),
              // Not in the staff-scheduling payload yet; lights up once the
              // backend adds a phone to the row.
              phone: r.phone || r.adultPhone || r.adult_phone || null,
            };
          })
          // Order by seniority bucket, then alphabetically within the bucket.
          .sort(
            (a, b) =>
              STAFF_CATEGORIES.indexOf(a.category) - STAFF_CATEGORIES.indexOf(b.category) ||
              (a.name || '').localeCompare(b.name || '')
          );
      }

      // --- Allergies: queried whole year, filter to site + people on site today ---
      const dayInRange = (r) =>
        (!r.startDate || !date.isBefore(dayjs(r.startDate), 'day')) &&
        (!r.endDate || !date.isAfter(dayjs(r.endDate), 'day'));
      const allergies = allergyRows
        .filter((r) => sameCampus(r.campus, campus))
        .filter(dayInRange)
        .filter((r) => {
          const a = (r.allergies || '').trim().toLowerCase();
          return a && !['none', 'na', 'n/a'].includes(a);
        })
        .map((r) => ({
          name: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
          personType: r.personType,
          allergies: r.allergies,
        }));

      if (!cancelled) {
        setState({
          loading: false,
          error: null,
          site: campus,
          noSite: false,
          data: { arrivals, departures, headcount, classes, activities, staff, allergies },
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [dateStr]);

  return state;
}
