import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { SERVER_URL } from "../../constants";

function checkSuccess(workoutEntry) {
  if (!workoutEntry || !workoutEntry.completed) return false;
  if (!workoutEntry.actualSets) return workoutEntry.completed;
  const parts = workoutEntry.actualSets.split(",").map((s) => parseInt(s.trim(), 10));
  const planned = workoutEntry.reps || 0;
  // All sets hit planned reps
  return parts.every((v) => v >= planned);
}

export default function CopyPreviewDialog({
  open,
  onClose,
  onConfirm,
  sourceExercises,
  sourceDate,
  saving,
}) {
  const [workoutLog, setWorkoutLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState({});

  useEffect(() => {
    if (!open || !sourceDate) return;
    const token = sessionStorage.getItem("bearer");
    setLoading(true);
    fetch(`${SERVER_URL}api/gym/workouts?date=${sourceDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.status === 204 ? [] : res.ok ? res.json() : []))
      .then((data) => setWorkoutLog(Array.isArray(data) ? data : []))
      .catch(() => setWorkoutLog([]))
      .finally(() => setLoading(false));
  }, [open, sourceDate]);

  useEffect(() => {
    if (!open) return;
    const adj = {};
    sourceExercises.forEach((ex) => {
      const match = workoutLog.find(
        (w) => w.exerciseName === ex.exerciseName && w.exerciseDate === sourceDate
      );
      const succeeded = checkSuccess(match);
      const currentWeight = ex.weightKg || 0;
      if (succeeded && currentWeight > 0) {
        adj[ex.id] = {
          suggest: true,
          original: currentWeight,
          newWeight: currentWeight + 2.5,
          accepted: true,
        };
      } else {
        adj[ex.id] = {
          suggest: false,
          original: currentWeight,
          newWeight: currentWeight,
          accepted: false,
        };
      }
    });
    setAdjustments(adj);
  }, [open, sourceExercises, workoutLog, sourceDate]);

  const handleWeightChange = (exId, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [exId]: { ...prev[exId], newWeight: parseFloat(value) || 0, accepted: true },
    }));
  };

  const handleToggle = (exId) => {
    setAdjustments((prev) => {
      const current = prev[exId];
      return {
        ...prev,
        [exId]: {
          ...current,
          accepted: !current.accepted,
          newWeight: !current.accepted ? current.original + 2.5 : current.original,
        },
      };
    });
  };

  const handleConfirm = () => {
    const adjusted = sourceExercises.map((ex) => {
      const adj = adjustments[ex.id];
      return {
        ...ex,
        weightKg: adj && adj.accepted ? adj.newWeight : ex.weightKg,
      };
    });
    onConfirm(adjusted);
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Copy exercises</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Exercise</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">New weight</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sourceExercises.map((ex) => {
                const adj = adjustments[ex.id];
                return (
                  <TableRow key={ex.id}>
                    <TableCell>
                      {ex.exerciseName}
                      {ex.sets && ex.reps ? ` · ${ex.sets}x${ex.reps}` : ""}
                    </TableCell>
                    <TableCell align="right">
                      {ex.weightKg ? `${ex.weightKg}kg` : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {adj?.suggest ? (
                        <TextField
                          type="number"
                          size="small"
                          value={adj.accepted ? adj.newWeight : adj.original}
                          onChange={(e) => handleWeightChange(ex.id, e.target.value)}
                          disabled={!adj.accepted}
                          inputProps={{ min: 0, step: 0.5 }}
                          sx={{ width: 80 }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {ex.weightKg ? `${ex.weightKg}kg` : "—"}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {adj?.suggest && (
                        <Chip
                          label={adj.accepted ? "Increase" : "Keep"}
                          color={adj.accepted ? "success" : "default"}
                          size="small"
                          onClick={() => handleToggle(ex.id)}
                          sx={{ cursor: "pointer" }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {sourceExercises.some((ex) => adjustments[ex.id]?.suggest) && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Exercises where all sets were completed successfully are suggested for a 2.5kg increase.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={saving}>
          {saving ? "Copying..." : "Copy"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
