import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function formatSummary(exercise) {
  const parts = [];

  if (exercise.sets && exercise.reps) {
    const weight = exercise.weightKg ? ` @ ${exercise.weightKg}kg` : "";
    parts.push(`${exercise.sets}x${exercise.reps}${weight}`);
  } else if (exercise.sets) {
    parts.push(`${exercise.sets} sets`);
  } else if (exercise.reps) {
    parts.push(`${exercise.reps} reps`);
  }

  if (exercise.weightKg && !exercise.sets && !exercise.reps) {
    parts.push(`${exercise.weightKg}kg`);
  }

  if (exercise.durationMinutes) {
    parts.push(`${exercise.durationMinutes} min`);
  }

  return parts.join(" · ") || "No details";
}

export default function ExerciseRow({ exercise, onEdit, onDelete }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {exercise.exerciseName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatSummary(exercise)}
          </Typography>
          {exercise.notes && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {exercise.notes}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => onEdit(exercise)} title="Edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(exercise)} title="Delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
