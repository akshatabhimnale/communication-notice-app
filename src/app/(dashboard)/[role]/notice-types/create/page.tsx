"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NoticeTypeForm } from "@/components/NoticeType/NoticeTypeForm";
import { createNoticeType } from "@/services/noticeService";
import { createTemplate } from "@/services/TemplateService";
import { fetchUserProfile, fetchAllUsers } from "@/services/userService";
import { Container, CircularProgress, Typography, Button } from "@mui/material";
import { NoticeTypeFormValues } from "@/types/noticeTypesInterface";
import { NoticeTypeFormSkeleton } from "@/components/NoticeType/NoticeTypeFormSkeleton";
import { User } from "@/services/userService";
import { useRole } from "@/hooks/useRole";

export default function CreateNoticeType() {
  const router = useRouter();
  const { userRole } = useRole();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    console.log("Fetching user details...");
    setIsLoadingOrg(true);
    setError(null);
    try {
      const userProfile = await fetchUserProfile();
      const organizationId = userProfile.organization?.id || userProfile.organization_id;
      if (!organizationId) {
        throw new Error("Organization ID not found in user profile.");
      }
      console.log("Organization ID fetched successfully:", organizationId);
      setOrgId(organizationId);
      setUserId(userProfile.id);
      if (userRole === "user") {
        setUsers([{ id: userProfile.id } as User]);
      }
      setIsAuthenticated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load user information.";
      console.error("Error fetching user details:", err);
      setError(message);
      setOrgId(null);
      setUserId(null);
      setUsers([]);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingOrg(false);
    }
  }, [userRole]);

  const fetchUserList = useCallback(async () => {
    if (userRole !== "admin") {
      console.log("Skipping fetchAllUsers for non-admin user.");
      setIsLoadingUsers(false);
      return;
    }
    console.log("Fetching all users...");
    setIsLoadingUsers(true);
    setError(null);
    try {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
      console.log("All users fetched successfully:", allUsers);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load user list.";
      console.error("Error fetching users:", err);
      setError(message);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchUserDetails();
    fetchUserList();
  }, [fetchUserDetails, fetchUserList]);

  const handleSubmit = async (
    formValues: Omit<NoticeTypeFormValues, "org_id">,
    templateData?: { name: string; channel: string[]; template_content: string }
  ) => {
    console.log("handleSubmit triggered. FormValues:", formValues, "TemplateData:", templateData);
    setError(null);

    if (!orgId || !userId) {
      const errMsg = "Organization ID or User ID is missing. Cannot create notice type.";
      console.error("handleSubmit Error:", errMsg);
      setError(errMsg);
      return;
    }
    console.log("handleSubmit: Organization ID and User ID confirmed:", orgId, userId);

    try {
      const noticeTypePayload = { ...formValues, org_id: orgId };
      console.log("handleSubmit: Attempting to create notice type with payload:", noticeTypePayload);
      const createdNoticeType = await createNoticeType(noticeTypePayload);
      console.log("handleSubmit: Notice type created successfully:", createdNoticeType);

      if (templateData?.channel && templateData?.template_content) {
        const templatePayload = {
          channel: templateData.channel,
          template_content: templateData.template_content,
          notice_type: createdNoticeType.id,
        };
        console.log("handleSubmit: Attempting to create template with payload:", templatePayload);
        await createTemplate(templatePayload);
        console.log("handleSubmit: Template created successfully for notice type:", createdNoticeType.id);
      } else {
        console.log("handleSubmit: No valid template data provided, skipping template creation.");
      }

      const redirectPath = userRole === "admin" ? "/admin/notice-types" : "/user/notice-types";
      console.log(`handleSubmit: Process successful. Redirecting to ${redirectPath}`);
      router.push(redirectPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during creation.";
      console.error("Error creating notice type or template:", err);
      setError(`Failed to create: ${message}`);
    }
  };

  const handleRetryFetch = () => {
    fetchUserDetails();
    if (userRole === "admin") {
      fetchUserList();
    }
  };

  if (isLoadingOrg || (userRole === "admin" && isLoadingUsers)) {
    return <NoticeTypeFormSkeleton />;
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to /auth/login");
    router.push("/auth/login");
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" gutterBottom>
          Redirecting to login...
        </Typography>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !orgId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" gutterBottom>
          Error loading user details: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={handleRetryFetch}
          disabled={isLoadingOrg || isLoadingUsers}
          startIcon={(isLoadingOrg || isLoadingUsers) ? <CircularProgress size={20} /> : null}
        >
          {(isLoadingOrg || isLoadingUsers) ? "Retrying..." : "Retry"}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && userRole === "admin" && (
        <Typography color="error" gutterBottom sx={{ mb: 2 }}>
          {error} (User list unavailable, but you can still create the notice type)
        </Typography>
      )}
      <NoticeTypeForm
        onSubmit={handleSubmit}
        onCancel={() => router.push(userRole === "admin" ? "/admin/notice-types" : "/user/notice-types")}
        mode="create"
        orgId={orgId!}
        users={users}
        templates={[]}
      />
    </Container>
  );
}