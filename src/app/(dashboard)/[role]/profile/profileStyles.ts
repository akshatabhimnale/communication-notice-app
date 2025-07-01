import { SxProps, Theme } from "@mui/material";

export const styles: Record<string, SxProps<Theme>> = {
  root: {
    mt: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
  },
  fieldContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  buttonGroup: {
    display: "flex",
    gap: 2,
    mt: 2,
  },
};