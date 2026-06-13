import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SERVER_URL } from "./constants";

const APP_NAME = "locatorbase";
// Every tile that exists (used to validate saved orders and to populate the
// "hidden tiles" restore tray).
const ALL_TILES = ["summary", "groups", "search", "profile", "gym"];
// Default layout for anyone who hasn't customised — gym starts hidden but is
// still restorable from the tray.
const DEFAULT_ORDER = ["summary", "groups", "search", "profile"];

// The per-user tile order lives in the database (user_preferences table), keyed
// by the logged-in user via their bearer token. No local cache — the DB is the
// single source of truth so a layout can't leak between users on one device.
function fetchOrder() {
  const token = sessionStorage.getItem("bearer");
  return fetch(`${SERVER_URL}api/my-preferences/${APP_NAME}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.tileOrder && Array.isArray(data.tileOrder)) {
        const valid = data.tileOrder.filter((k) => ALL_TILES.includes(k));
        return valid.length > 0 ? valid : null;
      }
      return null;
    })
    .catch(() => null);
}

function saveOrder(order) {
  const token = sessionStorage.getItem("bearer");
  fetch(`${SERVER_URL}api/my-preferences/${APP_NAME}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tileOrder: order }),
  }).catch(() => {});
}

function SortableTile({ tile, tileMinHeight, iconSize, fontSize, onSelect, reordering, canRemove, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ width: "100%" }}>
      <Card
        sx={{
          minHeight: tileMinHeight,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          position: "relative",
        }}
      >
        {reordering && canRemove && (
          <Box
            onClick={(e) => { e.stopPropagation(); onRemove(tile.key); }}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: "error.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 2,
              "&:hover": { bgcolor: "error.dark" },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        )}
        {reordering && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1,
              cursor: "grab",
              touchAction: "none",
              color: "grey.400",
              "&:hover": { color: "grey.600" },
            }}
          >
            <DragIndicatorIcon />
          </Box>
        )}
        <CardActionArea
          onClick={() => onSelect(tile.key)}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            p: 2,
            flex: 1,
          }}
        >
          <Box
            component="img"
            src={tile.src}
            alt={tile.label}
            sx={{
              width: iconSize,
              height: iconSize,
              objectFit: "contain",
              mb: 1,
            }}
          />
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Typography
              variant="body2"
              align="center"
              sx={{ fontSize, fontWeight: 600 }}
            >
              {tile.label}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}

export default function LandingPage({ onSelect }) {
  const publicUrl = process.env.PUBLIC_URL || "";
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  const tileMinHeight = isMobile ? 140 : isTablet ? 160 : 180;
  const iconSize = isMobile ? 64 : isTablet ? 72 : 80;
  const fontSize = isMobile ? "1rem" : isTablet ? "1.1rem" : "1.2rem";

  const tileMap = {
    search: { label: "Student Search", src: `${publicUrl}/assets/students.png`, key: "search" },
    groups: { label: "My Registers", src: `${publicUrl}/assets/groups.png`, key: "groups" },
    summary: { label: "Daily Summary", src: `${publicUrl}/assets/playbook.png`, key: "summary" },
    profile: { label: "My Info", src: `${publicUrl}/assets/myinfo.png`, key: "profile" },
    gym: { label: "Gym", src: `${publicUrl}/assets/gym.png`, key: "gym" },
  };

  // null = not loaded yet; falls back to DEFAULT_ORDER when the user has no
  // saved preference row in the database.
  const [order, setOrder] = useState(null);
  const [reordering, setReordering] = useState(false);
  const longPressTimer = useRef(null);

  useEffect(() => {
    fetchOrder().then((remote) => {
      setOrder(remote || [...DEFAULT_ORDER]);
    });
  }, []);

  const handleTilePointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setReordering(true);
    }, 600);
  }, []);

  const handleTilePointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  const hiddenTiles = useMemo(
    () => ALL_TILES.filter((k) => !(order || []).includes(k)).map((k) => tileMap[k]).filter(Boolean),
    [order]
  );

  const handleRemoveTile = useCallback((key) => {
    setOrder((prev) => {
      const next = prev.filter((k) => k !== key);
      saveOrder(next);
      return next;
    });
  }, []);

  const handleAddTile = useCallback((key) => {
    setOrder((prev) => {
      const next = [...prev, key];
      saveOrder(next);
      return next;
    });
  }, []);

  const tiles = useMemo(
    () => (order || []).map((key) => tileMap[key]).filter(Boolean),
    [order]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(active.id);
    const newIndex = order.indexOf(over.id);
    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);
    saveOrder(newOrder);
  };

  // Wait for the database fetch before painting tiles — avoids a flash of the
  // wrong layout.
  if (order === null) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        mx: "auto",
        mt: 4,
        px: 2,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={order}
          strategy={isMobile ? verticalListSortingStrategy : rectSortingStrategy}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr 1fr",
              },
              gap: 2,
              maxWidth: 700,
              width: "100%",
            }}
          >
            {tiles.map((tile) => (
              <Box
                key={tile.key}
                onPointerDown={handleTilePointerDown}
                onPointerUp={handleTilePointerUp}
                onPointerLeave={handleTilePointerUp}
              >
                <SortableTile
                  tile={tile}
                  tileMinHeight={tileMinHeight}
                  iconSize={iconSize}
                  fontSize={fontSize}
                  onSelect={reordering ? () => {} : onSelect}
                  reordering={reordering}
                  canRemove={tiles.length > 1}
                  onRemove={handleRemoveTile}
                />
              </Box>
            ))}
          </Box>
        </SortableContext>
      </DndContext>

      {reordering && hiddenTiles.length > 0 && (
        <Box sx={{ mt: 3, maxWidth: 700, width: "100%" }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}>
            Hidden tiles
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {hiddenTiles.map((tile) => (
              <Card
                key={tile.key}
                sx={{
                  minHeight: 80,
                  minWidth: 140,
                  flex: "1 1 140px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: 0.6,
                  position: "relative",
                }}
              >
                <Box
                  onClick={() => handleAddTile(tile.key)}
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 2,
                    "&:hover": { bgcolor: "success.dark" },
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    p: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={tile.src}
                    alt={tile.label}
                    sx={{ width: 40, height: 40, objectFit: "contain", mb: 0.5 }}
                  />
                  <Typography variant="body2" align="center" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {tile.label}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {reordering && (
        <Button
          variant="contained"
          onClick={() => setReordering(false)}
          sx={{ mt: 3 }}
        >
          Done
        </Button>
      )}
    </Box>
  );
}
