"use client";
import { logoutThunk } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";

export default function LogoutButton() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      // imported logoutthunk from authslice 
      await dispatch(logoutThunk()).unwrap();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}