"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  createNoticeThunk,
  updateNoticeThunk,
} from "@/store/slices/noticeSlice";
import { TextField, Button, Box, Paper } from "@mui/material";
const defaultLegalTemplate = `
<b>NOTICE OF AGREEMENT</b><br/><br/>
This Agreement is made on this <b>[DATE]</b>, by and between:<br/><br/>

<b>Party 1:</b> [Party 1 Name], residing at [Address]<br/>
<b>Party 2:</b> [Party 2 Name], residing at [Address]<br/><br/>

WHEREAS, the parties agree to the following terms:<br/><br/>

<b>1. Scope of Agreement</b><br/>
This agreement covers the obligations and responsibilities of both parties.<br/><br/>

<b>2. Duration</b><br/>
The agreement shall be valid from <b>[Start Date]</b> to <b>[End Date]</b>.<br/><br/>

<b>3. Governing Law</b><br/>
This agreement shall be governed by the laws of [Jurisdiction].<br/><br/>

<b>Signed by:</b><br/><br/>
Party 1: ____________________ Date: ___________<br/>
Party 2: ____________________ Date: ___________
`;
interface NoticeFormProps {
  initialData?: { id?: string; title: string; description: string };
  isEdit?: boolean;
}

const NoticeForm: React.FC<NoticeFormProps> = ({
  initialData,
  isEdit = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || defaultLegalTemplate,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && initialData?.id) {
      dispatch(updateNoticeThunk({ id: initialData.id, data: formData }));
    } else {
      dispatch(createNoticeThunk(formData));
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, maxWidth: 500, margin: "auto" }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          name="title"
          label="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <TextField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          required
          multiline
          rows={20}
        />
        <Button type="submit" variant="contained" color="primary">
          {isEdit ? "Update" : "Create"}
        </Button>
      </Box>
    </Paper>
  );
};

export default NoticeForm;
