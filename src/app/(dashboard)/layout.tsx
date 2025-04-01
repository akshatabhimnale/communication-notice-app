"use client";

import LogoutButton from "@/components/Button/LogoutButton";
import ProfileButton from "@/components/Button/ProfileButton";
import { Stack } from "@mui/material";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";


function ToolbarActions() {
  return (
    <Stack direction="row">  
      <ProfileButton/>
      <ThemeSwitcher />
    </Stack>
  );
}
export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
    slots={{
      toolbarActions: ToolbarActions,
    }}
    >
      <PageContainer>{children}</PageContainer>
      <LogoutButton />
    </DashboardLayout>
  );
}
