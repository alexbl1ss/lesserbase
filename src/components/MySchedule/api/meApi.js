import { SERVER_URL } from '../../../constants.js';

// Who and where the caller is: the two lookups the overtime form needs to fill
// itself in. Both are identified by the bearer token alone, like the rota.

function authHeaders() {
  const token = sessionStorage.getItem('bearer');
  return { Authorization: `Bearer ${token}` };
}

async function get(path) {
  const res = await fetch(`${SERVER_URL}${path}`, { headers: authHeaders() });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// The logged-in user, including the NSR `stays[]` (each with residential_base)
// that say which site they're at on a given date. Same endpoint Daily Summary
// uses to work out the user's site.
export const getMyProfile = () => get('api/my-profile');

// The campuses currently running. Rows may be plain names or objects; take
// whichever name field is there so a shape change doesn't empty the dropdown.
export async function getActiveCampuses() {
  const payload = await get('api/campuses/active');
  const rows = Array.isArray(payload) ? payload : payload?.campuses || payload?.data || [];
  return rows
    .map((row) =>
      typeof row === 'string'
        ? row
        : row?.name || row?.campusName || row?.campus || row?.base || row?.label || row?.value
    )
    .filter(Boolean);
}
