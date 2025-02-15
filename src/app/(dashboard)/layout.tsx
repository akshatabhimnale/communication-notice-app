"use client";

import LogoutButton from "@/components/Button/LogoutButton";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <PageContainer>{children}</PageContainer>
      <LogoutButton />
    </DashboardLayout>
  );
}
