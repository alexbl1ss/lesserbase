import { SERVER_URL } from '../../../constants.js';

// All daily-summary calls share the same bearer auth. There is no dedicated
// daily-summary endpoint on the backend (same as Greaterbase) — the report is
// assembled client-side by fanning out across existing module endpoints and
// filtering to the logged-in user's site.
function authHeaders() {
  const token = sessionStorage.getItem('bearer');
  return { Authorization: `Bearer ${token}` };
}

// GET a JSON array. The backend returns 204 (No Content) instead of an empty
// array for several of these endpoints, so treat 204 as []. Non-OK responses
// throw so callers can decide per-section whether to swallow the error.
async function getArray(path) {
  const res = await fetch(`${SERVER_URL}${path}`, { headers: authHeaders() });
  if (res.status === 204) return [];
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// GET a JSON object (profile, weekly schedule). 204 -> null.
async function getObject(path) {
  const res = await fetch(`${SERVER_URL}${path}`, { headers: authHeaders() });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

const enc = encodeURIComponent;

// Logged-in user, including NSR `stays[]` (each with residential_base) used to
// resolve which single site this user is assigned to.
export const getMyProfile = () => getObject('api/my-profile');

// Arrivals / departures — rows of people with campus, personType, gender and
// a `residential` flag (overnight residents).
export const whoIsArriving = (date) => getArray(`api/whoisarriving/${date}`);
export const whoIsLeaving = (date) => getArray(`api/whoisleaving/${date}`);

// On-site headcount, per-person (needed for gender / staff splits):
//  - students resident that night (carry studentGender, stay_campus)
//  - overnight adults at the site (carry gender + a computed staff/leader role)
// Day staff (non-residential) are not here — they come from the weekly schedule.
export const studentsResidentByNight = (date) => getArray(`api/studentsresidentbynight/${date}`);
export const adultsResidentByNight = (date, campus) =>
  getArray(`api/adultsresidentbynight/${date}?campus=${enc(campus)}`);

// Classes — group options plus the per-student class list (carries the teacher
// via adult_full_name and the group via group_id).
export const fetchClassGroups = (campusName, startDate, endDate) =>
  getArray(`api/classes/groups?campusName=${enc(campusName)}&startDate=${startDate}&endDate=${endDate}`);
export const fetchClassLists = (startDate, endDate, campusName) =>
  getArray(`api/class_lists/${startDate}/${endDate}?campusName=${enc(campusName)}`);

// Activities — groups for the day (members[] carry personType) and the leader
// directory used to resolve leaderStaffId -> name.
export const getActivityGroups = (date) => getArray(`api/activities/groups?date=${date}`);
export const getActivityLeaders = (date, campus) =>
  getArray(`api/activities/leaders?date=${date}&campus=${enc(campus)}`);

// Staff scheduling — week-anchored: returns { campus, days, rows } for the week
// beginning on the given Monday.
export const getWeeklyStaffScheduling = (campus, weekStart) =>
  getObject(`api/staff-scheduling/weekly?campus=${enc(campus)}&weekStart=${weekStart}`);

// Allergies — keyed off arrival within the queried window, so callers should
// query a wide range (whole year) and filter per day by each person's stay.
export const getAllergies = (start, end) => getArray(`api/allergies?start=${start}&end=${end}`);
