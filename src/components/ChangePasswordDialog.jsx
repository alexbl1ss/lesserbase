import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from '@mui/material';

import { SERVER_URL } from '../constants.js';

const RESET_GUIDANCE =
  "There's no automated reset — contact Alex or another Admin to have it reset.";

export default function ChangePasswordDialog({ open, onClose, email, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setSaving(false);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${SERVER_URL}api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('bearer')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || 'Could not change password. Please try again.');
        setSaving(false);
        return;
      }

      // Success: all tokens are revoked server-side, so the current session is
      // now invalid — send the user back to a fresh login.
      setSuccess('Password changed. Please sign in again with your new password.');
      setTimeout(() => {
        reset();
        onPasswordChanged();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Could not change password. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change password</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Account"
            value={email || ''}
            InputProps={{ readOnly: true }}
            fullWidth
          />
          <div>
            <TextField
              type="password"
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoFocus
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              {RESET_GUIDANCE}
            </Typography>
          </div>
          <TextField
            type="password"
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <TextField
            type="password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
          <Typography variant="caption" color="text.secondary">
            This is a shared login — changing it here also updates your Greaterbase
            password.
          </Typography>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          {success && (
            <Typography variant="body2" sx={{ color: 'success.main' }}>
              {success}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !!success}>
          {saving ? 'Saving...' : 'Change password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
