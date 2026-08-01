import React, { useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
  amendOvertime,
  recordOvertime,
  OvertimeDecidedError,
  OvertimeUnavailableError,
} from './api/overtimeApi.js';
import { MAX_TEXT, validateOvertime } from './utils/overtimeModel.js';
import { formatHours } from './utils/scheduleModel.js';

// The common shifts, so the usual case is one tap rather than typing a number.
const QUICK_MINUTES = [30, 60, 90, 120];

/**
 * Record extra time worked, or amend an entry that hasn't been decided yet —
 * pass `entry` for the latter. Opens on the day the schedule is showing, with
 * the campus preselected, so the usual case is minutes plus a reason.
 *
 * The caller mounts this only while it's open, so every open is a fresh form:
 * the prefills below are plain initial state and there's no reset to get wrong.
 *
 * `onSaved` gets the created or updated entry; `onDecided` fires instead when
 * the backend says a manager got there first, so the caller can refresh.
 */
export default function OvertimeDialog({
  entry,
  date,
  campus,
  campusOptions,
  onClose,
  onSaved,
  onDecided,
}) {
  const amending = !!entry;

  // A future day can't be recorded against, so those open on today instead.
  const today = dayjs();
  const [workDate, setWorkDate] = useState(() => {
    if (amending) return dayjs(entry.workDate);
    return date && date.isAfter(today, 'day') ? today : date || today;
  });
  const [minutes, setMinutes] = useState(amending ? String(entry.minutes ?? '') : '');
  const [reason, setReason] = useState(amending ? entry.reason || '' : '');
  const [campusValue, setCampusValue] = useState(
    (amending ? entry.campus : campus) || campus || ''
  );
  const [note, setNote] = useState(amending ? entry.note || '' : '');
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState('');
  const [saving, setSaving] = useState(false);

  const mins = Number(minutes);
  const preview = Number.isFinite(mins) && mins > 0 ? formatHours(mins) : '';

  // Offer a list only when the lookup actually returned one — otherwise a failed
  // fetch would leave a dropdown holding the single prefilled value and no way
  // to choose anything else. Whatever is selected is always in the list, so an
  // entry recorded at a campus that has since closed keeps its value on amend.
  const hasList = (campusOptions || []).length > 0;
  const options = hasList ? [...new Set([...campusOptions, campusValue].filter(Boolean))] : [];

  const handleSave = async () => {
    const payload = {
      workDate: workDate ? workDate.format('YYYY-MM-DD') : '',
      minutes: minutes === '' ? '' : mins,
      reason: reason.trim(),
      campus: campusValue.trim(),
      note: note.trim(),
    };

    const found = validateOvertime(payload, dayjs().format('YYYY-MM-DD'));
    setErrors(found);
    setFailure('');
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const saved = amending
        ? await amendOvertime(entry.id, payload)
        : await recordOvertime(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      if (err instanceof OvertimeDecidedError) {
        onDecided(err.message);
        onClose();
        return;
      }
      setFailure(
        err instanceof OvertimeUnavailableError
          ? "Recording overtime isn't switched on yet."
          : err.message || 'Could not save your overtime.'
      );
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{amending ? 'Amend overtime' : 'Record overtime'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <DatePicker
            label="Day worked"
            value={workDate}
            onChange={(d) => d && d.isValid() && setWorkDate(d)}
            format="ddd DD MMM YYYY"
            disableFuture
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.workDate,
                helperText: errors.workDate || '',
              },
            }}
          />

          <div>
            <TextField
              label="Minutes worked"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              inputProps={{ min: 1, max: 1440, inputMode: 'numeric' }}
              error={!!errors.minutes}
              helperText={errors.minutes || (preview && `That's ${preview}.`) || ''}
              fullWidth
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
              {QUICK_MINUTES.map((m) => (
                <Chip
                  key={m}
                  label={formatHours(m)}
                  size="small"
                  variant={mins === m ? 'filled' : 'outlined'}
                  color={mins === m ? 'primary' : 'default'}
                  onClick={() => setMinutes(String(m))}
                />
              ))}
            </Stack>
          </div>

          <TextField
            label="What was it for?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            inputProps={{ maxLength: MAX_TEXT }}
            error={!!errors.reason}
            helperText={errors.reason || 'e.g. covered late airport run'}
            fullWidth
          />

          {/* A list when we have one; a plain field if the campus lookup failed,
              so a dropdown outage can't block recording. */}
          <TextField
            label="Campus"
            value={campusValue}
            onChange={(e) => setCampusValue(e.target.value)}
            error={!!errors.campus}
            helperText={errors.campus || ''}
            select={hasList}
            fullWidth
          >
            {options.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            inputProps={{ maxLength: MAX_TEXT }}
            error={!!errors.note}
            helperText={errors.note || ''}
            multiline
            minRows={2}
            fullWidth
          />

          <Typography variant="caption" color="text.secondary">
            This goes to your manager to approve — it isn&apos;t counted until they do.
          </Typography>

          {failure && (
            <Typography variant="body2" color="error">
              {failure}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : amending ? 'Save changes' : 'Record overtime'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
