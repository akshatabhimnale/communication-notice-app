// app/admin/notice-types/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NoticeTypeForm } from "@/components/NoticeTypeForm";
import { createNoticeType } from "@/services/noticeService";
import { fetchUserProfile } from "@/services/userService";

export default function CreateNoticeType() {
  const router = useRouter();
  const [orgId, setOrgId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getOrgId = async () => {
      try {
        const userProfile = await fetchUserProfile();
        const orgId = userProfile.organization_id || userProfile.organization?.id;
        if (orgId) {
          setOrgId(orgId);
        } else {
          throw new Error("Organization ID not found");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getOrgId();
  }, []);

  const handleSubmit = async (values: Parameters<typeof createNoticeType>[0]) => {
    try {
      await createNoticeType(values);
      router.push("/admin/notice-types");
    } catch (error) {
      throw error;
    }
  };

  return (
    <NoticeTypeForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/admin/notice-types")}
      mode="create"
      orgId={orgId}
      isLoading={isLoading}
    />
  );
}