"use client";

import { Container, Typography } from "@mui/material";
import NoticeForm from "@/components/notices/NoticeForm";

export default function CreateNoticePage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Create Notice
      </Typography>
      <NoticeForm />
    </Container>
  );
}
