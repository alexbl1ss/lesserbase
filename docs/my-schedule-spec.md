# Locatorbase spec: "My Schedule"

A read-only, mobile-native view in **Locatorbase** where a staff member sees
**their own** assigned duties for the day, pulled live from Greaterbase. It's the
personal, phone-friendly counterpart to the camp manager's Daily Rota editor in
Greaterbase.

## Goal / non-goals

- **Goal:** a staff member opens Locatorbase, taps **My Schedule**, and sees a
  single read-only column of the blocks they're assigned to today, in time order.
- **Non-goals:** no editing, no assigning, no templates, no other people's rotas.
  All scheduling happens in Greaterbase; Locatorbase only renders.

## Launch

- Add a **My Schedule** entry to the Locatorbase home / menu.
- **Icon:** reuse the *same asset* as Greaterbase's Daily Rota tile —
  `public/assets/img/daily-routine_14991730.png`. Bundle/reference the identical
  image so the two apps read as the same feature.
- Label: **My Schedule** (or **My Rota**).

## Data source

Single call to the self-service personal-rota endpoint (see
`docs/backend-ticket-daily-rota.md` → *Personal rota (self-service)*):

```
GET /api/daily-rota/mine?from={YYYY-MM-DD}&to={YYYY-MM-DD}
Authorization: Bearer <session token>
```

- **Auth / identity:** the **bearer token is the only thing that identifies the
  user**. Locatorbase sends no user/staff id — not in the path, not as a param;
  the backend derives *who* from the token and returns only that person's own
  schedule. The request carries just the (optional) date range.
- **Default range:** `from = to = today` (campus-local). Fetch a few days ahead
  if we want day-nav without re-calling (see Open decisions).
- **Response:** a flat list of the caller's assignments across the range, one
  entry per block. The backend composes this from the saved rota **plus** the
  person's activity / class / residential assignments (that composition is the
  backend's job — Locatorbase just renders what comes back):

```jsonc
[
  { "date": "2026-08-01", "campus": "Loretto", "title": "Airport Team",
    "kind": "custom", "start": "09:00", "end": "17:00",
    "paid": "yes", "countsHours": true, "notes": "" },
  { "date": "2026-08-01", "campus": "Loretto", "title": "Evening residential presence",
    "kind": "custom", "start": "21:00", "end": "22:00",
    "paid": "no", "countsHours": false, "notes": "Pastoral availability within residential areas." }
]
```

Fields per entry: `date`, `campus`, `title`, `kind` (`meal | class | act | night
| custom`), `start`/`end` (`HH:mm`), `paid` (`yes | no | conditional | null`),
`countsHours` (bool), `notes` (string, may be empty).

## Rendering

A **single vertical, time-ordered, read-only column** — like the Greaterbase
rota's centre column, but simplified for a phone (a list of cards, not a
scaled-to-pixels timeline).

**Header**
- Title: **My schedule** (+ the person's first name if handy).
- The **date**, with a simple day stepper: `‹  Today ·  Fri 1 Aug  ›`.
- Optionally the campus if it varies.

**Each block (a card / row), sorted by `start`:**
- **Time range** — `09:00–17:00`, tabular figures, prominent.
- **Title** — e.g. "Afternoon activities", "Breakfast", "Evening residential presence".
- **Detail** — the `role`/`notes` line when present (e.g. "football").
- **Kind accent** — a small colour chip / left border by `kind`, matching
  Greaterbase's palette (meal = amber, act = violet, class = blue, night = navy,
  custom = teal). Optional but keeps the two apps consistent.
- **Unpaid tag** — show a subtle **"Unpaid"** chip on `paid: "no"` blocks (meals,
  residential), nothing on paid work. (Same rule as Greaterbase.)

**Footer / summary**
- A **daily total** of counting hours: sum the durations of entries where
  `countsHours` is true, e.g. **"6h 30m assigned"**. (Meals & residential don't
  add — same rule as Greaterbase's `countsHours = kind !== "meal" && paid !== "no"`.)

**States**
- **Loading:** skeleton / spinner.
- **Empty day:** friendly "No duties assigned" message.
- **Error / offline:** message + retry; ideally cache the last successful fetch
  so a glance still works offline.

## Visual style

- Native Locatorbase mobile conventions: list/cards, large touch targets, system
  fonts, light/dark aware. Glanceable — this is a "what am I doing today" view.
- Mirror Greaterbase's block colours where easy, for cross-app familiarity.

## Open decisions

1. **Range:** today only, or today + the next few days (swipe between days)?
   *Recommend:* today by default with prev/next-day nav; the endpoint's
   `from/to` already supports a range if we want to prefetch a week.
2. **Hours detail:** show just the daily total (recommended), or also flag
   over-7h? The over-7h highlight and residential claw-back are **manager**
   concerns in Greaterbase — the personal view should stay simple (list + total).
   *Recommend:* daily total only; no claw-back/over-limit UI here.
3. **Multi-campus:** if a person is ever at two campuses on one date, entries
   carry `campus` — group or label per campus. Normally one campus/date.

## Dependencies

- The **backend `GET /api/daily-rota/mine`** endpoint must exist (ticketed in
  `docs/backend-ticket-daily-rota.md`). It is the only new backend work; the
  composition + hours rules are specified there.
