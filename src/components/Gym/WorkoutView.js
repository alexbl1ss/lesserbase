import { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import ReplayIcon from "@mui/icons-material/Replay";
import { SERVER_URL } from "../../constants";

function useRestTimer() {
  const [seconds, setSeconds] = useState(0);
  const [total, setTotal] = useState(0);
  const intervalRef = useRef(null);

  const start = useCallback((duration) => {
    clearInterval(intervalRef.current);
    setTotal(duration);
    setSeconds(duration);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setSeconds(0);
    setTotal(0); // clears popup entirely
  }, []);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // total stays set after countdown so popup shows "LIFT!" until dismissed or next set
  return { seconds, total, start, stop };
}

function RestTimerPopup({ seconds, total, onDismiss }) {
  if (!total) return null;
  const finished = seconds <= 0;
  const progress = finished ? 0 : (seconds / total) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeLabel = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;
  const modeLabel = total > 120 ? "5min recover" : "2min rest";

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        bottom: 100,
        left: 24,
        right: 24,
        maxWidth: 500,
        mx: "auto",
        p: 2,
        borderRadius: 3,
        zIndex: 20,
        bgcolor: finished ? "success.main" : seconds <= 10 ? "warning.light" : "primary.light",
      }}
    >
      <Box
        onClick={onDismiss}
        sx={{
          position: "absolute",
          top: 8,
          right: 12,
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
          fontWeight: 700,
          fontSize: "0.85rem",
          "&:hover": { bgcolor: "rgba(255,255,255,0.5)" },
        }}
      >
        ✕
      </Box>
      {finished ? (
        <Typography variant="h4" sx={{ fontWeight: 700, color: "white", textAlign: "center", py: 1 }}>
          LIFT!
        </Typography>
      ) : (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "white", minWidth: 80 }}>
            {timeLabel}
          </Typography>
          <Stack sx={{ flex: 1 }} spacing={0.5}>
            <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
              {modeLabel}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.3)",
                "& .MuiLinearProgress-bar": { bgcolor: "white" },
              }}
            />
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}

function DurationTimer({ targetMinutes, onComplete, completed, disabled, onStatusChange }) {
  const hasTarget = targetMinutes != null && targetMinutes > 0;
  const targetSeconds = hasTarget ? targetMinutes * 60 : null;
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState(completed ? "done" : "idle"); // idle, running, paused, done
  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    setElapsed((prev) => prev + 1);
  }, []);

  const handleStart = () => {
    setStatus("running");
    onStatusChange?.("running");
    intervalRef.current = setInterval(tick, 1000);
  };

  const handlePause = () => {
    clearInterval(intervalRef.current);
    setStatus("paused");
    onStatusChange?.("paused");
  };

  const handleStop = () => {
    clearInterval(intervalRef.current);
    setStatus("done");
    onStatusChange?.("done");
    const actualMinutes = Math.round((elapsed / 60) * 10) / 10;
    onComplete(actualMinutes);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const remaining = hasTarget ? Math.max(0, targetSeconds - elapsed) : null;
  const elapsedProgress = hasTarget ? Math.min(100, (elapsed / targetSeconds) * 100) : 0;
  const remainingProgress = hasTarget ? Math.max(0, (remaining / targetSeconds) * 100) : 0;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (status === "done") {
    const actualMins = Math.round((elapsed / 60) * 10) / 10;
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
          Done — {actualMins} min{hasTarget ? ` (target ${targetMinutes} min)` : ""}
        </Typography>
      </Box>
    );
  }

  const circleStyle = (bg, hoverBg, isDisabled) => ({
    width: 56, height: 56, borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    cursor: isDisabled ? "default" : "pointer",
    bgcolor: isDisabled ? "grey.400" : bg, color: "white",
    opacity: isDisabled ? 0.5 : 1,
    transition: "transform 0.1s",
    "&:active": isDisabled ? {} : { transform: "scale(0.92)" },
    "&:hover": isDisabled ? {} : { bgcolor: hoverBg },
  });

  return (
    <Stack spacing={1} sx={{ py: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* Play/Pause — left */}
        {status === "idle" && (
          <Box onClick={disabled ? undefined : handleStart} sx={circleStyle("primary.main", "primary.dark", disabled)}>
            <PlayArrowIcon />
          </Box>
        )}
        {status === "running" && (
          <Box onClick={handlePause} sx={circleStyle("primary.main", "primary.dark", false)}>
            <PauseIcon />
          </Box>
        )}
        {status === "paused" && (
          <Box onClick={handleStart} sx={circleStyle("primary.main", "primary.dark", false)}>
            <PlayArrowIcon />
          </Box>
        )}

        {/* Bars and counters — middle */}
        {status !== "idle" && (
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                {formatTime(elapsed)}
              </Typography>
              {hasTarget && (
                <Typography variant="caption" color="text.secondary">
                  {formatTime(remaining)}
                </Typography>
              )}
            </Stack>
            <Box sx={{ height: 8, borderRadius: 4, overflow: "hidden", bgcolor: "grey.200" }}>
              <Box sx={{
                height: "100%",
                width: hasTarget ? `${elapsedProgress}%` : `${Math.min(100, (elapsed / 3600) * 100)}%`,
                bgcolor: hasTarget && elapsed >= targetSeconds ? "success.main" : "primary.main",
                borderRadius: 4, transition: "width 1s linear",
              }} />
            </Box>
            {hasTarget && (
              <Box sx={{ height: 8, borderRadius: 4, overflow: "hidden", bgcolor: "grey.200" }}>
                <Box sx={{
                  height: "100%",
                  width: `${remainingProgress}%`,
                  bgcolor: remaining <= 10 ? "warning.main" : "grey.400",
                  borderRadius: 4, transition: "width 1s linear", ml: "auto",
                }} />
              </Box>
            )}
          </Stack>
        )}

        {/* Stop — right */}
        {(status === "running" || status === "paused") && (
          <Box onClick={handleStop} sx={circleStyle("error.main", "error.dark", false)}>
            <StopIcon />
          </Box>
        )}
      </Stack>
    </Stack>
  );
}

function SetCircle({ reps, done, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: done ? "primary.main" : "grey.300",
        color: done ? "white" : "text.primary",
        fontWeight: 700,
        fontSize: "1.1rem",
        cursor: "pointer",
        userSelect: "none",
        transition: "background-color 0.15s, transform 0.1s",
        "&:active": { transform: "scale(0.92)" },
      }}
    >
      {reps}
    </Box>
  );
}

function parseActualSets(actualSets, numSets, planned, completed) {
  if (actualSets && typeof actualSets === "string") {
    const parts = actualSets.split(",").map((s) => s.trim());
    return Array.from({ length: numSets }, (_, i) => {
      const val = parts[i] !== undefined ? parseInt(parts[i], 10) : -1;
      if (val === -1 || isNaN(val)) return { done: false, reps: planned };
      return { done: true, reps: val };
    });
  }
  return Array.from({ length: numSets }, () => ({
    done: !!completed,
    reps: planned,
  }));
}

function buildPayload(entry, setStates) {
  const allComplete = setStates.every((s) => s.done);
  const actualSets = setStates
    .map((s) => (s.done ? String(s.reps) : "-1"))
    .join(",");
  return {
    sets: entry.sets,
    reps: entry.reps,
    weightKg: entry.weightKg,
    durationMinutes: entry.durationMinutes,
    notes: entry.notes,
    completed: allComplete,
    actualSets,
  };
}

function WorkoutEntry({ entry, setStates, onSetTap, onUpdate, onDelete, onActivate, onReset, resetKey, timerDisabled, onTimerStatusChange }) {
  const plannedReps = entry.reps || 0;
  const isDurationExercise = entry.durationMinutes != null && (!entry.sets && !entry.reps);
  const [durationReset, setDurationReset] = useState(false);

  // When resetKey changes, mark duration as reset
  useEffect(() => {
    if (resetKey > 0) setDurationReset(true);
  }, [resetKey]);

  // Clear the reset flag when entry refreshes from backend with completed: false
  useEffect(() => {
    if (!entry.completed) setDurationReset(false);
  }, [entry.completed]);

  const durationCompleted = isDurationExercise && !durationReset && !!entry.completed;
  const allDone = isDurationExercise ? durationCompleted : setStates.every((s) => s.done);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => {
    setForm({
      sets: entry.sets != null ? String(entry.sets) : "",
      reps: entry.reps != null ? String(entry.reps) : "",
      weightKg: entry.weightKg != null ? String(entry.weightKg) : "",
      durationMinutes: entry.durationMinutes != null ? String(entry.durationMinutes) : "",
      notes: entry.notes || "",
    });
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate(entry.id, {
      sets: form.sets ? parseInt(form.sets, 10) : null,
      reps: form.reps ? parseInt(form.reps, 10) : null,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes, 10) : null,
      notes: form.notes.trim() || null,
      completed: entry.completed,
    });
    setEditing(false);
  };

  const handleCircleTap = (index) => {
    onActivate(entry.id);
    onSetTap(entry.id, index);
  };

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, bgcolor: allDone ? "action.hover" : "background.paper" }}
    >
      {editing ? (
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {entry.exerciseName}
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField label="Sets" type="number" size="small" value={form.sets}
              onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
              inputProps={{ min: 0 }} sx={{ flex: 1 }} />
            <TextField label="Reps" type="number" size="small" value={form.reps}
              onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
              inputProps={{ min: 0 }} sx={{ flex: 1 }} />
            <TextField label="Kg" type="number" size="small" value={form.weightKg}
              onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
              inputProps={{ min: 0, step: 0.5 }} sx={{ flex: 1 }} />
          </Stack>
          <TextField label="Duration (min)" type="number" size="small" value={form.durationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
            inputProps={{ min: 0 }} />
          <TextField label="Notes" size="small" value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            multiline minRows={1} />
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" onClick={saveEdit}>Save</Button>
            <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                textDecoration: allDone ? "line-through" : "none",
              }}>
                {entry.exerciseName}
                {entry.weightKg ? ` · ${entry.weightKg}kg` : ""}
                {isDurationExercise && entry.durationMinutes > 0 ? ` · ${entry.durationMinutes} min` : ""}
              </Typography>
              {!isDurationExercise && entry.durationMinutes > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {entry.durationMinutes} min
                </Typography>
              )}
              {entry.notes && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {entry.notes}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={startEdit} title="Adjust">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onReset(entry.id)} title="Reset">
                <ReplayIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(entry)} title="Remove">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {isDurationExercise ? (
            <DurationTimer
              key={resetKey}
              targetMinutes={entry.durationMinutes}
              completed={durationCompleted}
              disabled={timerDisabled}
              onStatusChange={(s) => onTimerStatusChange?.(entry.id, s)}
              onComplete={(actualMinutes) => {
                onUpdate(entry.id, {
                  sets: entry.sets,
                  reps: entry.reps,
                  weightKg: entry.weightKg,
                  durationMinutes: actualMinutes,
                  notes: entry.notes,
                  completed: true,
                });
              }}
            />
          ) : plannedReps > 0 ? (
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {setStates.map((s, i) => (
                <SetCircle key={i} reps={s.reps} done={s.done} onClick={() => handleCircleTap(i)} />
              ))}
            </Stack>
          ) : null}
        </Stack>
      )}
    </Paper>
  );
}

const WorkoutView = forwardRef(function WorkoutView({ entries, dateStr, onRefresh }, ref) {
  const [allSetStates, setAllSetStates] = useState({});
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [resetKeys, setResetKeys] = useState({});
  const [activeTimerEntryId, setActiveTimerEntryId] = useState(null);

  const handleTimerStatusChange = useCallback((entryId, status) => {
    if (status === "running" || status === "paused") {
      setActiveTimerEntryId(entryId);
    } else {
      setActiveTimerEntryId((prev) => (prev === entryId ? null : prev));
    }
  }, []);
  const prevActiveRef = useRef(null);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const restTimer = useRestTimer();

  useEffect(() => {
    const states = {};
    entries.forEach((e) => {
      const numSets = Math.max(e.sets || 1, 1);
      const planned = e.reps || 0;
      states[e.id] = parseActualSets(e.actualSets, numSets, planned, e.completed);
    });
    setAllSetStates(states);
  }, [entries]);

  const flushEntry = useCallback(
    async (entryId) => {
      const entry = entriesRef.current.find((e) => e.id === entryId);
      const setStates = allSetStates[entryId];
      if (!entry || !setStates) return;

      const payload = buildPayload(entry, setStates);
      const token = sessionStorage.getItem("bearer");
      await fetch(`${SERVER_URL}api/gym/workouts/${entryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Failed to sync", err));
    },
    [allSetStates]
  );

  // Flush previous entry when user moves to a new exercise
  useEffect(() => {
    if (prevActiveRef.current && prevActiveRef.current !== activeEntryId) {
      flushEntry(prevActiveRef.current);
    }
    prevActiveRef.current = activeEntryId;
  }, [activeEntryId, flushEntry]);

  // Expose finish to parent
  useImperativeHandle(ref, () => ({
    finish: async () => {
      const token = sessionStorage.getItem("bearer");
      for (const entry of entriesRef.current) {
        const setStates = allSetStates[entry.id];
        if (!setStates) continue;
        const payload = buildPayload(entry, setStates);
        await fetch(`${SERVER_URL}api/gym/workouts/${entry.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }).catch((err) => console.error("Failed to sync", err));
      }
      onRefresh();
    },
  }), [allSetStates, onRefresh]);

  const handleSetTap = (entryId, index) => {
    setAllSetStates((prev) => {
      const entryStates = [...(prev[entryId] || [])];
      const entry = entriesRef.current.find((e) => e.id === entryId);
      const plannedReps = entry?.reps || 0;
      const s = { ...entryStates[index] };

      let timerDuration = 0;

      if (!s.done) {
        // First tap: mark done → full rest
        s.done = true;
        s.reps = plannedReps;
        timerDuration = 120;
      } else if (s.reps <= 0) {
        // Reset: no timer
        s.done = false;
        s.reps = plannedReps;
        timerDuration = 0;
      } else {
        // Counting down reps → failed set, longer rest
        s.reps = s.reps - 1;
        timerDuration = 300;
      }

      entryStates[index] = s;

      if (timerDuration > 0) {
        restTimer.start(timerDuration);
      } else {
        restTimer.stop();
      }

      return { ...prev, [entryId]: entryStates };
    });
  };

  const handleReset = (entryId) => {
    const entry = entriesRef.current.find((e) => e.id === entryId);
    if (!entry) return;
    const numSets = Math.max(entry.sets || 1, 1);
    const planned = entry.reps || 0;
    setAllSetStates((prev) => ({
      ...prev,
      [entryId]: Array.from({ length: numSets }, () => ({ done: false, reps: planned })),
    }));
    setResetKeys((prev) => ({ ...prev, [entryId]: (prev[entryId] || 0) + 1 }));

    // Clear completion on backend so duration exercises can restart
    const token = sessionStorage.getItem("bearer");
    fetch(`${SERVER_URL}api/gym/workouts/${entryId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        sets: entry.sets,
        reps: entry.reps,
        weightKg: entry.weightKg,
        durationMinutes: entry.durationMinutes,
        notes: entry.notes,
        completed: false,
        actualSets: null,
      }),
    }).catch((err) => console.error("Failed to reset", err));
  };

  const handleUpdate = async (id, payload) => {
    const token = sessionStorage.getItem("bearer");
    await fetch(`${SERVER_URL}api/gym/workouts/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    onRefresh();
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Remove ${entry.exerciseName} from this workout?`)) return;
    const token = sessionStorage.getItem("bearer");
    await fetch(`${SERVER_URL}api/gym/workouts/${entry.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    onRefresh();
  };

  const completedCount = entries.filter((e) => {
    const states = allSetStates[e.id];
    return states && states.every((s) => s.done);
  }).length;

  return (
    <Box>
      <RestTimerPopup seconds={restTimer.seconds} total={restTimer.total} onDismiss={restTimer.stop} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Workout
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {completedCount}/{entries.length} exercises done
        </Typography>
      </Stack>

      {entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
          No exercises in this workout yet. Hit + to add one.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {entries.map((entry) => (
            <WorkoutEntry
              key={entry.id}
              entry={entry}
              setStates={allSetStates[entry.id] || []}
              onSetTap={handleSetTap}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onActivate={setActiveEntryId}
              onReset={handleReset}
              resetKey={resetKeys[entry.id] || 0}
              timerDisabled={activeTimerEntryId != null && activeTimerEntryId !== entry.id}
              onTimerStatusChange={handleTimerStatusChange}
            />
          ))}
        </Stack>
      )}

      {entries.length > 0 && completedCount === entries.length && (
        <Typography
          variant="h6"
          sx={{ textAlign: "center", mt: 3, color: "success.main", fontWeight: 700 }}
        >
          Workout complete!
        </Typography>
      )}
    </Box>
  );
});

export default WorkoutView;
