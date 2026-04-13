import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CheckIcon from "@mui/icons-material/Check";
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import { SERVER_URL } from "../../constants";
import ExerciseRow from "./ExerciseRow";
import ExerciseForm from "./ExerciseForm";
import WorkoutView from "./WorkoutView";
import HistoryView from "./HistoryView";
import CopyPreviewDialog from "./CopyPreviewDialog";

export default function GymTracker() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [mode, setMode] = useState("plan"); // "plan" or "workout"
  const [exercises, setExercises] = useState([]);
  const [workoutLog, setWorkoutLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyFromDate, setCopyFromDate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewExercises, setPreviewExercises] = useState([]);
  const [previewSourceDate, setPreviewSourceDate] = useState("");
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const workoutRef = useRef(null);

  const dateStr = selectedDate.format("YYYY-MM-DD");
  const isToday = selectedDate.isSame(dayjs(), "day");

  const fetchExercises = useCallback(() => {
    const token = sessionStorage.getItem("bearer");
    return fetch(`${SERVER_URL}api/gym/exercises?date=${dateStr}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 204) return [];
        if (res.ok) return res.json();
        throw new Error("Failed to fetch exercises");
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setExercises(list);
        return list;
      })
      .catch((err) => {
        console.error(err);
        setExercises([]);
        return [];
      });
  }, [dateStr]);

  const fetchWorkoutLog = useCallback(() => {
    const token = sessionStorage.getItem("bearer");
    return fetch(`${SERVER_URL}api/gym/workouts?date=${dateStr}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 204) return [];
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setWorkoutLog(list);
        return list;
      })
      .catch(() => {
        setWorkoutLog([]);
        return [];
      });
  }, [dateStr]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchExercises(), fetchWorkoutLog()])
      .then(([, log]) => {
        // Auto-switch to workout mode if a log exists for this day
        setMode(log.length > 0 ? "workout" : "plan");
      })
      .finally(() => setLoading(false));
  }, [fetchExercises, fetchWorkoutLog]);

  const refreshAll = () => {
    fetchExercises();
    fetchWorkoutLog();
  };

  // --- Plan mode handlers ---

  const handleAdd = () => {
    if (mode === "workout") {
      // Add unplanned exercise to workout log
      setEditingExercise(null);
      setDialogOpen(true);
      return;
    }
    setEditingExercise(null);
    setDialogOpen(true);
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setDialogOpen(true);
  };

  const handleDelete = (exercise) => {
    if (!window.confirm(`Delete ${exercise.exerciseName}?`)) return;
    const token = sessionStorage.getItem("bearer");
    fetch(`${SERVER_URL}api/gym/exercises/${exercise.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) fetchExercises();
        else alert("Failed to delete exercise");
      })
      .catch((err) => console.error(err));
  };

  const handleSave = (formData) => {
    const token = sessionStorage.getItem("bearer");

    if (mode === "workout" && !editingExercise) {
      // Add unplanned exercise to workout log
      const payload = {
        ...formData,
        exerciseDate: dateStr,
        completed: false,
      };
      setSaving(true);
      fetch(`${SERVER_URL}api/gym/workouts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.ok) {
            setDialogOpen(false);
            fetchWorkoutLog();
          } else {
            alert("Failed to add exercise to workout");
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setSaving(false));
      return;
    }

    // Plan mode: create/edit planned exercise
    const isEdit = !!editingExercise?.id;
    const url = isEdit
      ? `${SERVER_URL}api/gym/exercises/${editingExercise.id}`
      : `${SERVER_URL}api/gym/exercises`;
    const method = isEdit ? "PUT" : "POST";

    const payload = {
      ...formData,
      exerciseDate: dateStr,
    };

    setSaving(true);
    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          setDialogOpen(false);
          setEditingExercise(null);
          fetchExercises();
        } else {
          alert("Failed to save exercise");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setSaving(false));
  };

  // --- Start workout ---

  const handleStartWorkout = async () => {
    const token = sessionStorage.getItem("bearer");
    setStarting(true);
    try {
      const res = await fetch(
        `${SERVER_URL}api/gym/workouts/start?date=${dateStr}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        await fetchWorkoutLog();
        setMode("workout");
      } else {
        alert("Failed to start workout");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start workout");
    } finally {
      setStarting(false);
    }
  };

  // --- Navigation ---

  const prevDay = () => setSelectedDate((d) => d.subtract(1, "day"));
  const nextDay = () => setSelectedDate((d) => d.add(1, "day"));
  const goToday = () => setSelectedDate(dayjs());

  // --- Copy ---

  const handleOpenCopy = () => {
    setCopyFromDate(selectedDate.subtract(1, "day"));
    setCopyDialogOpen(true);
  };

  const handleCopyFromDate = async () => {
    if (!copyFromDate) return;
    const token = sessionStorage.getItem("bearer");
    const sourceDate = dayjs(copyFromDate).format("YYYY-MM-DD");
    setCopyDialogOpen(false);
    try {
      const res = await fetch(
        `${SERVER_URL}api/gym/exercises?date=${sourceDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.status === 204 ? [] : res.ok ? await res.json() : [];
      const sourceExercises = Array.isArray(data) ? data : [];

      if (sourceExercises.length === 0) {
        alert(`No exercises found on ${dayjs(copyFromDate).format("ddd D MMM YYYY")}.`);
        return;
      }

      setPreviewExercises(sourceExercises);
      setPreviewSourceDate(sourceDate);
      setPreviewOpen(true);
    } catch (err) {
      console.error("Failed to fetch exercises for copy", err);
      alert("Failed to fetch exercises.");
    }
  };

  const handleConfirmCopy = async (adjustedExercises) => {
    const token = sessionStorage.getItem("bearer");
    setCopying(true);
    setPreviewOpen(false);
    try {
      for (const ex of adjustedExercises) {
        await fetch(`${SERVER_URL}api/gym/exercises`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exerciseDate: dateStr,
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps,
            weightKg: ex.weightKg,
            durationMinutes: ex.durationMinutes,
            notes: ex.notes,
          }),
        });
      }
      fetchExercises();
    } catch (err) {
      console.error("Failed to copy exercises", err);
      alert("Failed to copy exercises.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2, pb: 12 }}>
      {/* Date navigation */}
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={prevDay}>
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h6" sx={{ minWidth: 200, textAlign: "center" }}>
          {selectedDate.format("ddd D MMM YYYY")}
        </Typography>

        <IconButton onClick={nextDay}>
          <ChevronRightIcon />
        </IconButton>

        {!isToday && (
          <Button size="small" startIcon={<TodayIcon />} onClick={goToday}>
            Today
          </Button>
        )}
      </Stack>

      {/* Mode toggle */}
      <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => { if (v) setMode(v); }}
          size="small"
        >
          <ToggleButton value="plan">Plan</ToggleButton>
          <ToggleButton value="workout" disabled={workoutLog.length === 0 && exercises.length === 0}>
            Workout
          </ToggleButton>
          <ToggleButton value="history">History</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : mode === "workout" ? (
        workoutLog.length > 0 ? (
          <WorkoutView
            ref={workoutRef}
            entries={workoutLog}
            dateStr={dateStr}
            onRefresh={fetchWorkoutLog}
          />
        ) : exercises.length > 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You have {exercises.length} exercise{exercises.length === 1 ? "" : "s"} planned.
            </Typography>
            <Button
              variant="contained"
              startIcon={<FitnessCenterIcon />}
              onClick={handleStartWorkout}
              disabled={starting}
            >
              {starting ? "Starting..." : "Start workout"}
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            No plan for this day. Switch to Plan to add exercises first.
          </Typography>
        )
      ) : mode === "plan" ? (
        <>
          {exercises.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No exercises planned for this day. Hit + to get started.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {exercises.map((ex) => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </Stack>
          )}
        </>
      ) : mode === "history" ? (
        <HistoryView />
      ) : null}

      {/* Action buttons */}
      {mode !== "history" && (
        <Stack direction="row" spacing={2} sx={{ position: "fixed", bottom: 24, right: 24 }}>
          {mode === "plan" && (
            <Fab color="primary" onClick={handleOpenCopy} disabled={copying}>
              <ContentCopyIcon />
            </Fab>
          )}
          {mode === "workout" && workoutLog.length > 0 && (
            <Fab
              color="success"
              onClick={async () => {
                setFinishing(true);
                try {
                  await workoutRef.current?.finish();
                } finally {
                  setFinishing(false);
                }
              }}
              disabled={finishing}
            >
              <CheckIcon />
            </Fab>
          )}
          <Fab color="primary" onClick={handleAdd}>
            <AddIcon />
          </Fab>
        </Stack>
      )}

      {/* Add/Edit dialog */}
      <ExerciseForm
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingExercise(null);
        }}
        onSave={handleSave}
        exercise={editingExercise}
        saving={saving}
      />

      {/* Copy from dialog */}
      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Copy exercises from another day</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
              <DatePicker
                label="Copy from"
                value={copyFromDate}
                onChange={(v) => setCopyFromDate(v)}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyFromDate} disabled={!copyFromDate}>
            Copy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy preview with weight increase suggestions */}
      <CopyPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmCopy}
        sourceExercises={previewExercises}
        sourceDate={previewSourceDate}
        saving={copying}
      />
    </Box>
  );
}
