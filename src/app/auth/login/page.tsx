"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginThunk } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store"; // ✅ Import correct dispatch type
import { LoginPayload } from "@/services/authService";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const dispatch = useDispatch<AppDispatch>(); // ✅ Correctly typed dispatch
  const router = useRouter();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/user");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: LoginPayload = { username, password };
    await dispatch(loginThunk({ dispatch, data: payload })); // ✅ Correctly typed dispatch
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
    </div>
  );
}
