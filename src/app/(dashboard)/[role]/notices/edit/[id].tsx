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

  if (!notice || !notice.title || !notice.description) {
  return <p>Notice not found or incomplete data.</p>;
}

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Edit Notice
      </Typography>
      <NoticeForm initialData={{ id: notice.id, title: notice.title as string, description: notice.description as string }} isEdit />
    </Container>
  );
}
