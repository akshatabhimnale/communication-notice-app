"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { NoticeTypeForm } from "@/components/NoticeType/NoticeTypeForm";
import { fetchNoticeTypeById, updateNoticeType } from "@/services/noticeService";
import { fetchTemplates, createTemplate, updateTemplate } from "@/services/TemplateService";
import { fetchAllUsers } from "@/services/userService";
import { Container, CircularProgress, Typography, Button } from "@mui/material";
import { NoticeTypeFormValues } from "@/types/noticeTypesInterface";
import { NoticeTypeFormSkeleton } from "@/components/NoticeType/NoticeTypeFormSkeleton";
import { User } from "@/services/userService";
import { template } from "@/services/TemplateService";

export default function EditNoticeType() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] = useState<NoticeTypeFormValues | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<template[]>([]);
  const [isLoadingNoticeType, setIsLoadingNoticeType] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoticeType = useCallback(async () => {
    if (!id || typeof id !== "string") return;
    console.log("Fetching notice type:", id);
    setIsLoadingNoticeType(true);
    setError(null);
    try {
      const data = await fetchNoticeTypeById(id);
      setInitialData({
        name: data.name || "",
        description: data.description || null,
        dynamic_schema: data.dynamic_schema || {},
        org_id: data.org_id || "",
        assigned_to: data.assigned_to || null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notice type.";
      console.error("Error fetching notice type:", err);
      setError(message);
      setInitialData(null);
    } finally {
      setIsLoadingNoticeType(false);
    }
  }, [id]);

  const fetchUserList = useCallback(async () => {
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
  }, []);

  const fetchNoticeTypeTemplates = useCallback(async () => {
    if (!id || typeof id !== "string") return;
    console.log("Fetching templates for notice type:", id);
    setIsLoadingTemplates(true);
    setError(null);
    try {
      let allTemplates: template[] = [];
      let nextUrl: string | null = `/templates/?notice_type=${id}`;

      while (nextUrl) {
        const response = await fetchTemplates(nextUrl);
        allTemplates = [...allTemplates, ...response.results];
        nextUrl = response.next;
        console.log(`Fetched ${response.results.length} templates, total so far: ${allTemplates.length}, next: ${nextUrl}`);
      }

      setTemplates(allTemplates);
      console.log("Templates fetched successfully:", allTemplates);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load templates.";
      console.error("Error fetching templates:", err);
      setError(message);
      setTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNoticeType();
    fetchUserList();
    fetchNoticeTypeTemplates();
  }, [fetchNoticeType, fetchUserList, fetchNoticeTypeTemplates]);

  const handleSubmit = async (
    values: NoticeTypeFormValues,
    templateData?: { name: string; channel: string; template_content: string; id?: string }
  ) => {
    if (!id || typeof id !== "string") {
      setError("Invalid notice type ID.");
      return;
    }

    console.log("handleSubmit triggered. FormValues:", values, "TemplateData:", templateData);
    setError(null);

    try {
      console.log("Attempting to update notice type with payload:", values);
      await updateNoticeType(id, values);
      console.log("Notice type updated successfully:", id);

      if (templateData?.channel && templateData?.template_content) {
        const templatePayload = {
          channel: templateData.channel,
          template_content: templateData.template_content,
          notice_type: id,
        };
        if (templateData.id) {
          console.log("Attempting to update template with payload:", templatePayload);
          await updateTemplate(templateData.id, templatePayload);
          console.log("Template updated successfully:", templateData.id);
        } else {
          console.log("Attempting to create template with payload:", templatePayload);
          await createTemplate(templatePayload);
          console.log("Template created successfully for notice type:", id);
        }
      } else {
        console.log("No valid template data provided, skipping template creation/update.");
      }

      console.log("Process successful. Redirecting to /admin/notice-types");
      router.push("/admin/notice-types");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during update.";
      console.error("Error updating notice type or template:", err);
      setError(`Failed to update: ${message}`);
    }
  };

  const handleRetryFetch = () => {
    fetchNoticeType();
    fetchUserList();
    fetchNoticeTypeTemplates();
  };

  if (error && (!initialData || users.length === 0 || isLoadingTemplates)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" gutterBottom>
          Error loading required data: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={handleRetryFetch}
          disabled={isLoadingNoticeType || isLoadingUsers || isLoadingTemplates}
          startIcon={(isLoadingNoticeType || isLoadingUsers || isLoadingTemplates) ? <CircularProgress size={20} /> : null}
        >
          {(isLoadingNoticeType || isLoadingUsers || isLoadingTemplates) ? "Retrying..." : "Retry"}
        </Button>
      </Container>
    );
  }

  if (isLoadingNoticeType || isLoadingUsers || isLoadingTemplates) {
    return <NoticeTypeFormSkeleton />;
  }

  if (initialData && users.length > 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Typography color="error" gutterBottom sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <NoticeTypeForm
          initialValues={initialData}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/notice-types")}
          mode="edit"
          orgId={initialData.org_id}
          users={users}
          templates={templates}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography color="error">
        Unable to load the form. Notice type, organization ID, or user list might be missing.
      </Typography>
    </Container>
  );
}