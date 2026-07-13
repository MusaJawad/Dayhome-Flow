import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

type AuthMode = "login" | "register";

type AuthResponse = {
  token: string;
  email: string;
};

function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const existingToken = localStorage.getItem("dayhomeflow_token");

    if (existingToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const isLogin = mode === "login";

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const endpoint = isLogin ? "/Auth/login" : "/Auth/register";

      const response = await api.post<AuthResponse>(endpoint, {
        email: email.trim(),
        password
      });

      localStorage.setItem("dayhomeflow_token", response.data.token);
      localStorage.setItem("dayhomeflow_email", response.data.email);

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      setErrorMessage(
        typeof message === "string"
          ? message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const switchMode = () => {
    setErrorMessage("");
    setPassword("");
    setMode(isLogin ? "register" : "login");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <Link to="/" className="back-link">
            ← Back to home
          </Link>

          <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>

          <p>
            {isLogin
              ? "Log in to manage children, attendance, and invoice exports."
              : "Start tracking your dayhome attendance and monthly invoice records."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting
              ? isLogin
                ? "Logging in..."
                : "Creating account..."
              : isLogin
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {isLogin ? "Need an account?" : "Already have an account?"}
          </span>

          <button type="button" onClick={switchMode}>
            {isLogin ? "Create one" : "Log in"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;