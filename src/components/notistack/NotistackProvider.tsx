"use client";
import { SnackbarProvider } from "notistack";
import React from "react";

export default function NotistackProvider({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={3000}
    >
      {children}
    </SnackbarProvider>
  );
}