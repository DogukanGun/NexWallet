import { Box, CircularProgress } from "@mui/material";

interface LoadingOverlayProps {
  fullPage?: boolean;
}

const LoadingOverlay = ({ fullPage = true }: LoadingOverlayProps) => {
  return (
    <Box
      sx={{
        position: fullPage ? "fixed" : "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <CircularProgress sx={{ color: "white" }} size={60} />
    </Box>
  );
};

export default LoadingOverlay;
