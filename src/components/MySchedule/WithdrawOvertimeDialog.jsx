import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { withdrawOvertime, OvertimeDecidedError } from './api/overtimeApi.js';
import { formatHours } from './utils/scheduleModel.js';

/**
 * Confirm taking back an entry. Withdrawing can't be undone from here — a new
 * entry would have to be recorded — so it asks first and names what's going.
 */
export default function WithdrawOvertimeDialog({ entry, onClose, onWithdrawn, onDecided }) {
  const [failure, setFailure] = useState('');
  const [working, setWorking] = useState(false);

  const handleWithdraw = async () => {
    setWorking(true);
    setFailure('');
    try {
      await withdrawOvertime(entry.id);
      onWithdrawn(entry);
      onClose();
    } catch (err) {
      if (err instanceof OvertimeDecidedError) {
        onDecided(err.message);
        onClose();
        return;
      }
      setFailure(err.message || 'Could not withdraw it.');
      setWorking(false);
    }
  };

  return (
    <Dialog open onClose={() => !working && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle>Withdraw this overtime?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {formatHours(Number(entry.minutes) || 0)} — {entry.reason}
        </DialogContentText>
        <DialogContentText sx={{ mt: 1 }}>
          It won&apos;t go to your manager. You can record it again if you need to.
        </DialogContentText>
        {failure && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {failure}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={working}>
          Keep it
        </Button>
        <Button color="error" variant="contained" onClick={handleWithdraw} disabled={working}>
          {working ? 'Withdrawing…' : 'Withdraw'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
