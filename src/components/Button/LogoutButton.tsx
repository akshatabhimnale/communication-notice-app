"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import Button from "@mui/material/Button";
import { logoutThunk } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";

export default function LogoutButton() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
