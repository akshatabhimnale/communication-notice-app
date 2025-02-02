"use client";

import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Card, CardContent, Typography } from "@mui/material";
export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <PageContainer>{children}</PageContainer>
    </DashboardLayout>
  );
}
