"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NoticeTypeForm } from "@/components/NoticeType/NoticeTypeForm";
import { createNoticeType } from "@/services/noticeService";
import { createTemplate } from "@/services/TemplateService";
import { fetchUserProfile } from "@/services/userService";
import { Container, CircularProgress, Typography, Button } from "@mui/material";
import { NoticeTypeFormValues } from "@/types/noticeTypesInterface";
import { NoticeTypeFormSkeleton } from "@/components/NoticeType/NoticeTypeFormSkeleton";

export default function CreateNoticeType() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null); 
  const [isLoadingOrg, setIsLoadingOrg] = useState(true); // Renamed for clarity
  const [error, setError] = useState<string | null>(null);


  // Wrap the orgId fetching in useCallback to maintain reference
  const fetchOrganizationId = useCallback(async () => {
    console.log("Fetching organization ID...");
    setIsLoadingOrg(true); // Ensure loading state is true at the start
    setError(null); // Clear previous errors
    try {
      const userProfile = await fetchUserProfile();
      // Prioritize organization.id if available, then organization_id
      const organizationId = userProfile.organization?.id || userProfile.organization_id;
      if (!organizationId) {
        throw new Error("Organization ID not found in user profile.");
      }
      console.log("Organization ID fetched successfully:", organizationId);
      setOrgId(organizationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load organization information.";
      console.error("Error fetching organization ID:", err);
      setError(message);
      setOrgId(null); // Ensure orgId is null on error
    } finally {
      setIsLoadingOrg(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizationId();
  }, [fetchOrganizationId]);

  /**
   * Handles the submission of the notice type form, including optional template creation.
   * @param formValues - The core data for the notice type.
   * @param templateData - Optional data for creating an associated template.
   */
  const handleSubmit = async (
    formValues: Omit<NoticeTypeFormValues, "org_id">,
    templateData?: { name: string; channel: string; template_content: string }
  ) => {
    console.log("handleSubmit triggered. FormValues:", formValues, "TemplateData:", templateData);
    setError(null); // Clear previous submission errors

    // --- Crucial Check: Ensure orgId is available before proceeding ---
    if (!orgId) {
      const errMsg = "Organization ID is missing. Cannot create notice type.";
      console.error("handleSubmit Error:", errMsg);
      setError(errMsg);
      return;
    }
    console.log("handleSubmit: Organization ID confirmed:", orgId);

    try {
      // --- 1. Create Notice Type ---
      const noticeTypePayload = { ...formValues, org_id: orgId };
      console.log("handleSubmit: Attempting to create notice type with payload:", noticeTypePayload);
      const createdNoticeType = await createNoticeType(noticeTypePayload);
      console.log("handleSubmit: Notice type created successfully:", createdNoticeType);

      // --- 2. Create Template (if data provided) ---
      if (templateData?.channel && templateData?.template_content) {
        // Basic check for essential template fields
        const templatePayload = {
          channel: templateData.channel,
          template_content: templateData.template_content,
          notice_type: createdNoticeType.id, // Use the ID from the newly created notice type
        };
        console.log("handleSubmit: Attempting to create template with payload:", templatePayload);
        await createTemplate(templatePayload);
        console.log("handleSubmit: Template created successfully for notice type:", createdNoticeType.id);
      } else {
        console.log("handleSubmit: No valid template data provided, skipping template creation.");
      }

      // --- 3. Redirect on Success ---
      console.log("handleSubmit: Process successful. Redirecting to /admin/notice-types");
      router.push("/admin/notice-types");

    } catch (err) {
      // --- Error Handling for Submission ---
      const message = err instanceof Error ? err.message : "An unexpected error occurred during creation.";
      console.error("handleSubmit: Error creating notice type or template:", err);
      // *** OPTIMIZATION: Update the component's error state to display the error ***
      setError(`Failed to create: ${message}`);
    }
  };

  const handleRetryFetchOrg = () => {
    fetchOrganizationId();
  };

  // Display error related to fetching Org ID
  if (error && !orgId) { // Show retry only if orgId fetching failed
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" gutterBottom>
          Error loading required data: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={handleRetryFetchOrg}
          // Disable button while retrying
          disabled={isLoadingOrg}
          startIcon={isLoadingOrg ? <CircularProgress size={20} /> : null}
        >
          {isLoadingOrg ? "Retrying..." : "Retry"}
        </Button>
      </Container>
    );
  }

  // Display skeleton while fetching Org ID
  if (isLoadingOrg) {
    return <NoticeTypeFormSkeleton />;
  }

  if (orgId) {
    return (
      // Pass the submission error state down to the form
      // For now, we'll display the page-level error if submission fails.
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Display submission errors above the form */}
        {error && (
          <Typography color="error" gutterBottom sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <NoticeTypeForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/notice-types")}
          mode="create"
          orgId={orgId} // Pass the fetched orgId
          // so we don't pass isLoadingOrg here.Form manage its own submit state.
          // isLoading={false} // Or remove if NoticeTypeForm defaults correctly
        />
      </Container>
    );
  }

  // Fallback case 
  return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography color="error">
              Unable to load the form. Organization ID might be missing or an unexpected error occurred.
          </Typography>
      </Container>
  );
}
