"use client";

import { logoutThunk } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store"; // Import your store's dispatch type

export default function LogoutButton() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>(); // Use typed dispatch

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}