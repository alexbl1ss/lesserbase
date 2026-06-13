# Daily Summary — Endpoint Primer

A reference for reusing the Greaterbase "Daily Summary" data sources from this
(Lesserbase) project. Both apps talk to the **same REST backend**.

> **There is no dedicated daily-summary backend endpoint.** In Greaterbase the
> entire report is assembled **client-side** (`src/components/DailySummary/hooks/useDailySummary.js`)
> by fanning out across existing module endpoints and filtering by campus in the
> browser. Replicate the aggregation, not a single magic call.

## Cross-cutting conventions

- **Base URL**: `REACT_APP_SERVER_URL` (exposed as `SERVER_URL` in `constants.js`).
- **Auth**: every call sends `Authorization: Bearer <token>` where
  `token = sessionStorage.getItem("bearer")`. No exceptions.
- **Dates**: always `YYYY-MM-DD` strings (dayjs-formatted).
- **Campus filtering is client-side.** Most endpoints return *all* campuses; the
  summary filters with a `sameCampus(row.campus, campusName)` string compare.
  Campus is matched by **name**, not id (except the bedroom board, which takes
  the campus name as a query param).
- **Empty / error handling**: helpers treat HTTP `204` as `[]`; every per-day
  call is wrapped in `.catch(() => [])` so one failing endpoint doesn't sink the
  whole report.
- **Fan-out bound**: Greaterbase caps the range at `MAX_RANGE_DAYS = 14` — this
  report hits ~7 endpoints × N days, so keep a bound.

## Endpoints

### 1. Arrivals / departures
`Transfers/api/transfersApi.js` (via the shared `http.js` wrapper)

| Call | Endpoint |
|---|---|
| `whoIsArriving(date)` | `GET api/whoisarriving/{date}` |
| `whoIsLeaving(date)`  | `GET api/whoisleaving/{date}` |

Rows of people. Consumed fields: `campus`, `personType` (`STUDENT`/`ADULT`),
`gender`, and residential flags (`residential` / `isResident` / `overnight`) —
used to build the type×gender breakdown (overnight residents only).

### 2. On-site headcount
Direct `fetch` in the hook.

- `GET api/residentcount/{date}`
- Rows: `{ campus, residentType, residentCount }`. Filter by campus. Same source
  as the Residents page.

### 3. Bedrooms — two calls per day
`Bedrooms/api/bedroomAllocationApi.js`

| Call | Endpoint |
|---|---|
| `fetchBedroomResidents({date})` | `GET api/studentsresidentbynight/{date}` **+** `GET api/adultsresidentbynight/{date}` (campus-wide roster for the night) |
| `fetchBedrooms({date, campus, residents})` | `GET api/bedrooms/board?campus={name}&date={date}` (per-campus board) |

Board rooms carry `residents[]`, `capacity`, `house`, `bedroomName`.
**Gotcha:** the summary fetches the board for each day **plus the day before**,
then diffs occupancy to derive in-use / moving-in / vacating rooms.

### 4. Classes
`Classes/api/classesApi.js`

| Call | Endpoint |
|---|---|
| `fetchClassGroups(campusName, start, end)` | `GET api/classes/groups?campusName={name}&startDate={d}&endDate={d}` |
| `fetchWeeklyClassLists(start, end, campusName)` | `GET api/class_lists/{startDate}/{endDate}?campusName={name}` |

- Group rows: `id`, `groupName`, `leaderName`, optional `groupDates[]`.
- Class-list rows (per student): `group_id`, `adult_full_name` (teacher) — used
  to count students per class and resolve the teacher.

### 5. Activities
`Activities/api/activitiesApi.js`

| Call | Endpoint |
|---|---|
| `getActivityGroupsByDate(date)` | `GET api/activities/groups?date={date}` |
| `getActivityLeaders(date, campus)` | `GET api/activities/leaders?date={date}&campus={name}` |

- Group fields: `campus`, `name`, `slot`, `productType` (`EXTERNAL` vs onsite),
  `members[]` (each with `personType`), `leaderName` / `leaderStaffId`.
- Leaders endpoint resolves `leaderStaffId` → name when the group lacks
  `leaderName`.

### 6. Staff scheduling
`Timetable/api/staffSchedulingApi.js`

- `getWeeklyStaffScheduling(campus, weekStart)` →
  `GET api/staff-scheduling/weekly?campus={name}&weekStart={monday}`
- **Week-anchored.** Map each day to its Monday (`mondayOfWeek`), fetch the
  distinct weeks, then filter rows where `scheduledDates` includes the day **and**
  the day is within `arrivalDate`/`departureDate`.
- Row fields: `nsrId` (dedupe key — weeks can overlap), `name`, `roles[]`,
  `dsl`, `firstaid`, `qualifications[]`, `residential` / `isResident`, `staff`.

### 7. Allergies
Direct `fetch` in the hook.

- `GET api/allergies?start={d}&end={d}`
- Rows: `{ campus, firstName, lastName, allergies, personType, startDate, endDate }`.
- **Gotcha:** this endpoint keys off arrival within the queried window, so the
  summary queries the **whole year** and then filters per day by each person's
  stay (`dayInRange`). A narrow range would miss people who arrived earlier but
  are still on site.

## Practical notes for porting

- The reusable layer is the **per-module `api/` helpers**, not the summary hook
  itself. If Lesserbase can copy/import those small fetch wrappers you get the
  correct URLs + auth for free.
- Non-obvious bits worth carrying over verbatim:
  - **Week-anchoring** for staff scheduling.
  - **Previous-day diff** for the bedrooms section.
  - **Query-wide-then-filter** for allergies.
  - **Client-side campus filtering by name.**
- Keep a range cap (`MAX_RANGE_DAYS`) given the per-day × per-endpoint fan-out.

---
*Source: Greaterbase `src/components/DailySummary/` (hook `useDailySummary.js`
plus the imported module `api/` helpers).*
