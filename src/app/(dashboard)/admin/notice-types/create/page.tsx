// app/admin/notice-types/create/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NoticeTypeForm } from "@/components/NoticeTypeForm";
import { createNoticeType } from "@/services/noticeService";
import { fetchUserProfile } from "@/services/userService";
import { Container, CircularProgress, Typography, Button } from "@mui/material";
import { NoticeTypeFormValues } from "@/types/noticeTypesInterface";

export default function CreateNoticeType() {
  const router = useRouter();
  const [orgId, setOrgId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Wrap the orgId fetching in useCallback to maintain reference
  const fetchOrganizationId = useCallback(async () => {
    try {
      const userProfile = await fetchUserProfile();
      const organizationId = userProfile.organization_id || userProfile.organization?.id;
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }
      setOrgId(organizationId);
      setError("");
    } catch (err) {
      console.error("Error fetching organization ID:", err);
      setError(err instanceof Error ? err.message : "Failed to load organization information");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizationId();
  }, [fetchOrganizationId]);

  const handleSubmit = async (formValues: Omit<NoticeTypeFormValues, 'org_id'>) => {
    try {
      if (!orgId) {
        throw new Error("Organization ID is missing");
      }
      
      await createNoticeType({
        ...formValues,
        org_id: orgId
      });
      router.push("/admin/notice-types");
    } catch (err) {
      console.error("Error creating notice type:", err);
      throw err;
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    fetchOrganizationId(); // Use the memoized function
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleRetry}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
          disabled={isLoading}
        >
          {isLoading ? "Retrying..." : "Retry Loading"}
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <NoticeTypeForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/admin/notice-types")}
      mode="create"
      orgId={orgId}
    />
  );
}