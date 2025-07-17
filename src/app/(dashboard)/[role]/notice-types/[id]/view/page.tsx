"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import { fetchNoticeTypeById } from "@/services/noticeService";
import { NoticeType } from "@/types/noticeTypesInterface";
import { NoticeTypeViewSkeleton } from "@/app/(dashboard)/[role]/notice-types/[id]/view/NoticeTypeViewSkeleton";

export default function NoticeTypeView() {
  const router = useRouter();
  const { id } = useParams();
  const [noticeType, setNoticeType] = useState<NoticeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNoticeType = async () => {
      if (!id || typeof id !== "string") {
        setError("Invalid notice type ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchNoticeTypeById(id);
        console.log("Fetched noticeType:", data); // Debug: Log the full noticeType
        console.log("Dynamic schema:", data.dynamic_schema); // Debug: Log the dynamic_schema
        setNoticeType(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notice type");
      } finally {
        setLoading(false);
      }
    };

    loadNoticeType();
  }, [id]);

  if (loading) {
    return <NoticeTypeViewSkeleton />;
  }

  if (error || !noticeType) {
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">{error || "Notice type not found"}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/admin/notice-types")}
          sx={{ mt: 2 }}
        >
          Back to Notice Types
        </Button>
      </Container>
    );
  }

  // Parse dynamic_schema fields
  const fields = noticeType.dynamic_schema
    ? Object.entries(noticeType.dynamic_schema).map(([key, value]) => ({
        name: key, // Use the key as the field name
        type: value.type || "Unknown",
        required: value.required ? "Yes" : "No",
      }))
    : [];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Notice Type: {noticeType.name}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push("/admin/notice-types")}
        >
          Back to List
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Details
          </Typography>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{noticeType.name}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {noticeType.description || "No description available"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dynamic Schema
          </Typography>
          {fields.length > 0 ? (
            <Box sx={{ display: "grid", gap: 2 }}>
              {fields.map((field, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Field Name
                  </Typography>
                  <Typography variant="body1">{field.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Type
                  </Typography>
                  <Typography variant="body1">{field.type}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Required
                  </Typography>
                  <Typography variant="body1">{field.required}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No fields defined in the schema
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}