// app/admin/notice-types/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { NoticeTypeForm } from "@/components/NoticeTypeForm";
import { fetchNoticeTypeById, updateNoticeType } from "@/services/noticeService";
import { CircularProgress, Container } from "@mui/material";

export default function EditNoticeType() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] = useState<{
    name: string;
    description: string | null;
    dynamic_schema: Record<string, any>;
    org_id: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNoticeType = async () => {
      if (!id || typeof id !== "string") return;
      
      try {
        const data = await fetchNoticeTypeById(id);
        setInitialData({
          name: data.name || "",
          description: data.description || null,
          dynamic_schema: data.dynamic_schema || {},
          org_id: data.org_id || ""
        });
      } catch (error) {
        console.error("Error fetching notice type:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNoticeType();
  }, [id]);

  const handleSubmit = async (values: Parameters<typeof updateNoticeType>[1]) => {
    if (!id || typeof id !== "string") return;
    
    try {
      await updateNoticeType(id, values);
      router.push("/admin/notice-types");
    } catch (error) {
      throw error;
    }
  };

  if (isLoading || !initialData) {
    return (
      <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <NoticeTypeForm
      initialValues={initialData}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/admin/notice-types")}
      mode="edit"
      orgId={initialData.org_id}
      isLoading={isLoading}
    />
  );
}