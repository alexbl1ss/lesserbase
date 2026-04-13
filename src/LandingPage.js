import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export default function LandingPage({ onSelect }) {
  const publicUrl = process.env.PUBLIC_URL || "";
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  const tileMinHeight = isMobile ? 90 : isTablet ? 120 : 160;
  const iconSize = isMobile ? 32 : isTablet ? 48 : 64;
  const fontSize = isMobile ? "0.75rem" : isTablet ? "0.9rem" : "1rem";

  const tiles = [
    {
      label: "Student Search",
      src: `${publicUrl}/assets/students.png`,
      key: "search",
    },
    {
      label: "Groups",
      src: `${publicUrl}/assets/groups.png`,
      key: "groups",
    },
    {
      label: "My Info",
      src: `${publicUrl}/assets/myinfo.png`,
      key: "profile",
    },
    {
      label: "Gym",
      src: `${publicUrl}/assets/gym.png`,
      key: "gym",
    },
  ];

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
      <Grid
        container
        spacing={2}
        justifyContent="center"
        sx={{ maxWidth: 600 }}
      >
        {tiles.map((tile) => (
          <Grid item xs={6} sm={3} key={tile.key}>
            <Card
              sx={{
                minHeight: tileMinHeight,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CardActionArea
                onClick={() => onSelect(tile.key)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 2,
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
