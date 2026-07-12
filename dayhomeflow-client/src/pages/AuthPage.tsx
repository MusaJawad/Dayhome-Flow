import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import type { AuthResponse } from "../types";


function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@dayhomeflow.com");
  const [password, setPassword] = useState("password123");
  const [businessName, setBusinessName] = useState("Demo Dayhome");
  const [providerName, setProviderName] = useState("Demo Provider");
  const [phone, setPhone] = useState("403-555-1234");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const endpoint = mode === "login" ? "/Auth/login" : "/Auth/register";

      const body =
        mode === "login"
          ? {
              email,
              password,
            }
          : {
              email,
              password,
              businessName,
              providerName,
              phone,
            };

      const response = await api.post<AuthResponse>(endpoint, body);

      localStorage.setItem("dayhomeflow_token", response.data.token);
      localStorage.setItem("dayhomeflow_email", response.data.email);

      navigate("/dashboard");
      window.location.reload();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong.");
      } else {
        setError("Something went wrong.");
      }
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">DayhomeFlow</p>

        <Link className="back-home-link" to="/">
          ← Back to home
        </Link>

        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>

        <p className="muted">
          Manage children, attendance, and monthly invoices from one simple dashboard.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>

          {mode === "register" && (
            <>
              <label>
                Business name
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  required
                />
              </label>

              <label>
                Provider name
                <input
                  value={providerName}
                  onChange={(event) => setProviderName(event.target.value)}
                  required
                />
              </label>

              <label>
                Phone
                <input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            </>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit">
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button
          className="text-button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}

export default AuthPage;