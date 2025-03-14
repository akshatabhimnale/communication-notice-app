"use client";

import { logout as logoutAction } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export default function LogoutButton() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logoutAction());
    router.push("/auth/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
