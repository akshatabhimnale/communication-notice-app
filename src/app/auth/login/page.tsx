"use client";

import { RootState } from "@/store";
import { loginThunk } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<any>();
  const router = useRouter();

  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/user");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginThunk({ dispatch, data: { username, password } }));
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
      {error && <p>⚠️ {error}</p>}
    </div>
  );
}
