import axios from "axios";
import { useEffect, useState } from "react";
import api from "../api/api";
import type { Child } from "../types";
import { Link } from "react-router-dom";

function DashboardPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [firstName, setFirstName] = useState("Ayaan");
  const [lastName, setLastName] = useState("Test");
  const [parentName, setParentName] = useState("Parent Example");
  const [parentEmail, setParentEmail] = useState("parent@example.com");
  const [parentPhone, setParentPhone] = useState("403-555-1234");
  const [dailyRate, setDailyRate] = useState(45);
  const [error, setError] = useState("");

  async function loadChildren() {
    try {
      const response = await api.get<Child[]>("/Children");
      setChildren(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load children.");
      } else {
        setError("Failed to load children.");
      }
    }
  }

  useEffect(() => {
    loadChildren();
  }, []);

  async function addChild(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await api.post("/Children", {
        firstName,
        lastName,
        parentName,
        parentEmail,
        parentPhone,
        dailyRate,
      });

      setFirstName("");
      setLastName("");
      setParentName("");
      setParentEmail("");
      setParentPhone("");
      setDailyRate(45);

      await loadChildren();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to add child.");
      } else {
        setError("Failed to add child.");
      }
    }
  }

  function logout() {
    localStorage.removeItem("dayhomeflow_token");
    localStorage.removeItem("dayhomeflow_email");
    window.location.href = "/auth";
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">DayhomeFlow</p>
          <h1>Dashboard</h1>
          <p className="muted">
            Logged in as {localStorage.getItem("dayhomeflow_email")}
          </p>
        </div>
            <div className="header-actions">
                <Link className="link-button" to="/attendance">
                    Attendance
                </Link>

                <Link className="link-button" to="/invoices">
                    Invoices
                </Link>

                <Link className="link-button" to="/settings">
                    Settings
                </Link>

                <button className="secondary-button" onClick={logout}>
                    Logout
                </button>
            </div>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>Add child</h2>

          <form onSubmit={addChild} className="form">
            <label>
              First name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </label>

            <label>
              Last name
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </label>

            <label>
              Parent name
              <input
                value={parentName}
                onChange={(event) => setParentName(event.target.value)}
              />
            </label>

            <label>
              Parent email
              <input
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
                type="email"
              />
            </label>

            <label>
              Parent phone
              <input
                value={parentPhone}
                onChange={(event) => setParentPhone(event.target.value)}
              />
            </label>

            <label>
              Daily rate
              <input
                value={dailyRate}
                onChange={(event) => setDailyRate(Number(event.target.value))}
                type="number"
                min="0"
              />
            </label>

            {error && <p className="error">{error}</p>}

            <button type="submit">Add child</button>
          </form>
        </div>

        <div className="panel">
          <h2>Children</h2>

          {children.length === 0 ? (
            <p className="muted">No children added yet.</p>
          ) : (
            <div className="child-list">
              {children.map((child) => (
                <article key={child.id} className="child-card">
                  <h3>
                    {child.firstName} {child.lastName}
                  </h3>
                  <p>Parent: {child.parentName || "N/A"}</p>
                  <p>Daily rate: ${child.dailyRate}</p>
                  <p>Status: {child.isActive ? "Active" : "Inactive"}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;