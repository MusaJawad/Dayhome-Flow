import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import type { AuthResponse } from "../types";

function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [providerName, setProviderName] = useState("");
  const [phone, setPhone] = useState("");
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

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
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
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Enter your password"
              minLength={6}
              required
            />
          </label>

          {mode === "register" && (
            <>
              <label>
                Business / dayhome name
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Your dayhome name"
                  required
                />
              </label>

              <label>
                Provider name
                <input
                  value={providerName}
                  onChange={(event) => setProviderName(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>

              <label>
                Phone
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number"
                />
              </label>
            </>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit">
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button className="text-button" onClick={switchMode}>
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}

export default AuthPage;