"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Container, Typography } from "@mui/material";
import NoticeForm from "@/components/notices/NoticeForm";

export default function EditNoticePage() {
  const { id } = useParams();
  const notice = useSelector((state: RootState) =>
    state.notice.notices.find((n) => n.id === id)
  );

  if (!notice) return <p>Notice not found.</p>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Edit Notice
      </Typography>
      <NoticeForm initialData={notice} isEdit />
    </Container>
  );
}
