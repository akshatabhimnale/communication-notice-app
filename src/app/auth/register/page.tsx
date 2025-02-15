"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { registerThunk } from "@/store/slices/authSlice";
import { RegisterPayload } from "@/services/authService";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterPayload>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "user",
    organization_name: "",
    organization_address: "",
    organization_phone: "",
  });

  const dispatch = useDispatch<any>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await dispatch(registerThunk(formData)).unwrap();
      router.push("/auth/login");
    } catch (err: any) {
      setError(err || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          name="organization_name"
          placeholder="Organization Name"
          value={formData.organization_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="organization_address"
          placeholder="Organization Address"
          value={formData.organization_address}
          onChange={handleChange}
        />
        <input
          type="text"
          name="organization_phone"
          placeholder="Organization Phone"
          value={formData.organization_phone}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
