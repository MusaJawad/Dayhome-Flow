import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import type { Child } from "../types";

function DashboardPage() {
  const [children, setChildren] = useState<Child[]>([]);

  const [editingChildId, setEditingChildId] = useState<number | null>(null);

  const [firstName, setFirstName] = useState("Ayaan");
  const [lastName, setLastName] = useState("Test");
  const [parentName, setParentName] = useState("Parent Example");
  const [parentEmail, setParentEmail] = useState("parent@example.com");
  const [parentPhone, setParentPhone] = useState("403-555-1234");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  function resetForm() {
    setEditingChildId(null);
    setFirstName("");
    setLastName("");
    setParentName("");
    setParentEmail("");
    setParentPhone("");
    setIsActive(true);
  }

  function startEdit(child: Child) {
    setEditingChildId(child.id);
    setFirstName(child.firstName);
    setLastName(child.lastName);
    setParentName(child.parentName || "");
    setParentEmail(child.parentEmail || "");
    setParentPhone(child.parentPhone || "");
    setIsActive(child.isActive);
    setError("");
    setSuccess("");
  }

  async function saveChild(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const childBody = {
      firstName,
      lastName,
      parentName,
      parentEmail,
      parentPhone,
      dailyRate: 0,
      isActive,
    };

    try {
      if (editingChildId) {
        await api.put(`/Children/${editingChildId}`, childBody);
        setSuccess("Child updated.");
      } else {
        await api.post("/Children", {
          firstName,
          lastName,
          parentName,
          parentEmail,
          parentPhone,
          dailyRate: 0,
        });

        setSuccess("Child added.");
      }

      resetForm();
      await loadChildren();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to save child.");
      } else {
        setError("Failed to save child.");
      }
    }
  }

  async function deactivateChild(id: number) {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/Children/${id}`);
      setSuccess("Child deactivated.");
      await loadChildren();
    } catch {
      setError("Failed to deactivate child.");
    }
  }

  async function reactivateChild(child: Child) {
    setError("");
    setSuccess("");

    try {
      await api.put(`/Children/${child.id}`, {
        firstName: child.firstName,
        lastName: child.lastName,
        parentName: child.parentName || "",
        parentEmail: child.parentEmail || "",
        parentPhone: child.parentPhone || "",
        dailyRate: 0,
        isActive: true,
      });

      setSuccess("Child reactivated.");
      await loadChildren();
    } catch {
      setError("Failed to reactivate child.");
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
          <h2>{editingChildId ? "Edit child" : "Add child"}</h2>

          <form onSubmit={saveChild} className="form">
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

            {editingChildId && (
              <label className="checkbox-row">
                <input
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  type="checkbox"
                />
                Active child
              </label>
            )}

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <button type="submit">
              {editingChildId ? "Save changes" : "Add child"}
            </button>

            {editingChildId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            )}
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
                  <div className="child-card-header">
                    <div>
                      <h3>
                        {child.firstName} {child.lastName}
                      </h3>

                      <p>
                        Status:{" "}
                        <strong>
                          {child.isActive ? "Active" : "Inactive"}
                        </strong>
                      </p>
                    </div>

                    <span
                      className={
                        child.isActive ? "status-pill active" : "status-pill inactive"
                      }
                    >
                      {child.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p>Parent: {child.parentName || "N/A"}</p>
                  <p>Email: {child.parentEmail || "N/A"}</p>
                  <p>Phone: {child.parentPhone || "N/A"}</p>

                  <div className="card-actions">
                    <button type="button" onClick={() => startEdit(child)}>
                      Edit
                    </button>

                    {child.isActive ? (
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => deactivateChild(child.id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => reactivateChild(child)}
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
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