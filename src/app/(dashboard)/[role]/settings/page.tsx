"use client";

import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import Link from "next/link";

const SettingsPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
        p: 4,
        textAlign: "center",
      }}
      className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <ConstructionIcon
        sx={{
          fontSize: 80,
          color: theme.palette.primary.main,
          mb: 2,
        }}
      />
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
          mb: 2,
        }}
      >
        Settings Page Under Development
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          maxWidth: 600,
          mb: 4,
        }}
      >
        We&#39;re working hard to bring you a fully functional settings page. Check back soon for updates!
      </Typography>
      <Link href="/" passHref>
        <Button
          variant="contained"
          color="primary"
          sx={{
            textTransform: "none",
            fontWeight: 500,
            px: 4,
            py: 1,
          }}
          className="hover:bg-primary-600 transition-colors"
        >
          Return to Home
        </Button>
      </Link>
    </Box>
  );
};

export default SettingsPage;