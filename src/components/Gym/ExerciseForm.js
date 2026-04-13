import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";

export default function ExerciseForm({ open, onClose, onSave, exercise, saving }) {
  const editing = !!exercise?.id;

  const [form, setForm] = useState({
    exerciseName: "",
    sets: "",
    reps: "",
    weightKg: "",
    durationMinutes: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    if (exercise) {
      setForm({
        exerciseName: exercise.exerciseName || "",
        sets: exercise.sets != null ? String(exercise.sets) : "",
        reps: exercise.reps != null ? String(exercise.reps) : "",
        weightKg: exercise.weightKg != null ? String(exercise.weightKg) : "",
        durationMinutes: exercise.durationMinutes != null ? String(exercise.durationMinutes) : "",
        notes: exercise.notes || "",
      });
    } else {
      setForm({
        exerciseName: "",
        sets: "",
        reps: "",
        weightKg: "",
        durationMinutes: "",
        notes: "",
      });
    }
  }, [open, exercise]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const canSave = form.exerciseName.trim().length > 0 && !saving;

  const handleSave = () => {
    onSave({
      exerciseName: form.exerciseName.trim(),
      sets: form.sets ? parseInt(form.sets, 10) : null,
      reps: form.reps ? parseInt(form.reps, 10) : null,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes, 10) : null,
      notes: form.notes.trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? "Edit Exercise" : "Log Exercise"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Exercise name"
            value={form.exerciseName}
            onChange={(e) => set("exerciseName", e.target.value)}
            required
            autoFocus
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Sets"
              type="number"
              value={form.sets}
              onChange={(e) => set("sets", e.target.value)}
              inputProps={{ min: 0 }}
              fullWidth
            />
            <TextField
              label="Reps"
              type="number"
              value={form.reps}
              onChange={(e) => set("reps", e.target.value)}
              inputProps={{ min: 0 }}
              fullWidth
            />
            <TextField
              label="Weight (kg)"
              type="number"
              value={form.weightKg}
              onChange={(e) => set("weightKg", e.target.value)}
              inputProps={{ min: 0, step: 0.5 }}
              fullWidth
            />
          </Stack>
          <TextField
            label="Duration (minutes)"
            type="number"
            value={form.durationMinutes}
            onChange={(e) => set("durationMinutes", e.target.value)}
            inputProps={{ min: 0 }}
            fullWidth
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          {saving ? "Saving..." : editing ? "Save" : "Log it"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
