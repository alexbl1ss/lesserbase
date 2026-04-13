import { useState, useEffect, useMemo } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { SERVER_URL } from "../../constants";

function formatActualSets(actualSets) {
  if (!actualSets) return "—";
  return actualSets
    .split(",")
    .map((s) => {
      const v = parseInt(s.trim(), 10);
      return v === -1 ? "—" : String(v);
    })
    .join(", ");
}

export default function HistoryView() {
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("bearer");
    setLoading(true);
    fetch(`${SERVER_URL}api/gym/workouts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 204) return [];
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => setAllWorkouts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to fetch workout history", err);
        setAllWorkouts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const exerciseNames = useMemo(() => {
    const names = new Set();
    allWorkouts.forEach((w) => {
      if (w.exerciseName) names.add(w.exerciseName);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [allWorkouts]);

  const filtered = useMemo(() => {
    if (!selectedExercise) return [];
    return allWorkouts
      .filter((w) => w.exerciseName === selectedExercise && w.completed)
      .sort((a, b) => {
        const da = new Date(b.exerciseDate || 0).getTime();
        const db = new Date(a.exerciseDate || 0).getTime();
        return da - db;
      });
  }, [allWorkouts, selectedExercise]);

  const isDuration = useMemo(() => {
    if (!filtered.length) return false;
    return filtered.some((w) => w.durationMinutes != null && !w.sets && !w.reps);
  }, [filtered]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Exercise</InputLabel>
        <Select
          value={selectedExercise}
          label="Exercise"
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          <MenuItem value="">
            <em>Select an exercise</em>
          </MenuItem>
          {exerciseNames.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!selectedExercise ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          Pick an exercise to view your history.
        </Typography>
      ) : filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No logged workouts for {selectedExercise}.
        </Typography>
      ) : isDuration ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Duration (min)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((w) => (
                <TableRow key={w.id} hover>
                  <TableCell>{w.exerciseDate}</TableCell>
                  <TableCell align="right">
                    {w.durationMinutes != null ? w.durationMinutes : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 90 }}>Date</TableCell>
                <TableCell align="right">Weight</TableCell>
                <TableCell>Planned</TableCell>
                <TableCell>Actual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((w) => (
                <TableRow key={w.id} hover>
                  <TableCell>{w.exerciseDate}</TableCell>
                  <TableCell align="right">{w.weightKg ?? "—"}</TableCell>
                  <TableCell>
                    {w.sets && w.reps ? `${w.sets}x${w.reps}` : "—"}
                  </TableCell>
                  <TableCell>{formatActualSets(w.actualSets)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
