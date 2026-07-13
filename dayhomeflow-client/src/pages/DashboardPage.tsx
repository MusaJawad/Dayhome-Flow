import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

type Child = {
  id: number;
  firstName: string;
  lastName: string;
  parentName?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
  dailyRate?: number;
  isActive: boolean;
};

type ChildFormState = {
  firstName: string;
  lastName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
};

const emptyForm: ChildFormState = {
  firstName: "",
  lastName: "",
  parentName: "",
  parentEmail: "",
  parentPhone: ""
};

function DashboardPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [form, setForm] = useState<ChildFormState>(emptyForm);
  const [editingChildId, setEditingChildId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeChildren = children.filter((child) => child.isActive);
  const inactiveChildren = children.filter((child) => !child.isActive);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get<Child[]>("/Children");
      setChildren(response.data);
    } catch {
      setErrorMessage("Could not load children. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ChildFormState, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingChildId(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrorMessage("Please enter the child's first and last name.");
      return;
    }

    try {
      setIsSaving(true);

      if (editingChildId) {
        const currentChild = children.find((child) => child.id === editingChildId);

        await api.put(`/Children/${editingChildId}`, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          parentName: form.parentName.trim(),
          parentEmail: form.parentEmail.trim(),
          parentPhone: form.parentPhone.trim(),
          dailyRate: 0,
          isActive: currentChild?.isActive ?? true
        });

        setSuccessMessage("Child updated successfully.");
      } else {
        await api.post("/Children", {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          parentName: form.parentName.trim(),
          parentEmail: form.parentEmail.trim(),
          parentPhone: form.parentPhone.trim(),
          dailyRate: 0
        });

        setSuccessMessage("Child added successfully.");
      }

      resetForm();
      await loadChildren();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Could not save child. Please try again.";

      setErrorMessage(typeof message === "string" ? message : "Could not save child. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (child: Child) => {
    setEditingChildId(child.id);
    setSuccessMessage("");
    setErrorMessage("");

    setForm({
      firstName: child.firstName || "",
      lastName: child.lastName || "",
      parentName: child.parentName || "",
      parentEmail: child.parentEmail || "",
      parentPhone: child.parentPhone || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (childId: number) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete(`/Children/${childId}`);

      setSuccessMessage("Child deactivated.");
      await loadChildren();
    } catch {
      setErrorMessage("Could not deactivate child. Please try again.");
    }
  };

  const handleReactivate = async (child: Child) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await api.put(`/Children/${child.id}`, {
        firstName: child.firstName,
        lastName: child.lastName,
        parentName: child.parentName || "",
        parentEmail: child.parentEmail || "",
        parentPhone: child.parentPhone || "",
        dailyRate: 0,
        isActive: true
      });

      setSuccessMessage("Child reactivated.");
      await loadChildren();
    } catch {
      setErrorMessage("Could not reactivate child. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dayhomeflow_token");
    localStorage.removeItem("dayhomeflow_email");

    window.location.assign("/#/auth");
  };

  const renderChildCard = (child: Child, isInactive = false) => {
    return (
      <article key={child.id} className={`child-card ${isInactive ? "inactive-card" : ""}`}>
        <div>
          <h3>
            {child.firstName} {child.lastName}
          </h3>

          <p>
            <strong>Parent:</strong>{" "}
            {child.parentName && child.parentName.trim() ? child.parentName : "Not provided"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {child.parentEmail && child.parentEmail.trim() ? child.parentEmail : "Not provided"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {child.parentPhone && child.parentPhone.trim() ? child.parentPhone : "Not provided"}
          </p>

          <p>
            <strong>Status:</strong> {child.isActive ? "Active" : "Inactive"}
          </p>
        </div>

        <div className="card-actions">
          <button type="button" className="secondary-button" onClick={() => handleEdit(child)}>
            Edit
          </button>

          {child.isActive ? (
            <button type="button" className="danger-button" onClick={() => handleDeactivate(child.id)}>
              Deactivate
            </button>
          ) : (
            <button type="button" className="primary-button" onClick={() => handleReactivate(child)}>
              Reactivate
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <main className="app-page">
      <header className="app-header">
        <div>
          <button
            type="button"
            className="back-link back-link-button"
            onClick={() => window.location.assign("/#/")}
          >
            ← Home
          </button>

          <h1>DayhomeFlow Dashboard</h1>
          <p>Manage children, parent details, attendance, and invoice exports.</p>
        </div>

        <nav className="app-nav">
          <Link to="/attendance">Attendance</Link>
          <Link to="/invoices">Invoices</Link>
          <Link to="/settings">Settings</Link>

          <button type="button" className="secondary-button" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>

      <section className="content-grid">
        <section className="panel">
          <h2>{editingChildId ? "Edit child" : "Add child"}</h2>

          <form onSubmit={handleSubmit} className="child-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(event) => handleInputChange("firstName", event.target.value)}
                  placeholder="First name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(event) => handleInputChange("lastName", event.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="parentName">Parent name</label>
              <input
                id="parentName"
                type="text"
                value={form.parentName}
                onChange={(event) => handleInputChange("parentName", event.target.value)}
                placeholder="Parent name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentEmail">Parent email</label>
              <input
                id="parentEmail"
                type="email"
                value={form.parentEmail}
                onChange={(event) => handleInputChange("parentEmail", event.target.value)}
                placeholder="parent@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentPhone">Parent phone</label>
              <input
                id="parentPhone"
                type="tel"
                value={form.parentPhone}
                onChange={(event) => handleInputChange("parentPhone", event.target.value)}
                placeholder="Parent phone number"
              />
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? "Saving..." : editingChildId ? "Update child" : "Add child"}
              </button>

              {editingChildId && (
                <button type="button" className="secondary-button" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Children</h2>
              <p>{activeChildren.length} active child{activeChildren.length === 1 ? "" : "ren"}</p>
            </div>

            <button type="button" className="secondary-button" onClick={loadChildren}>
              Refresh
            </button>
          </div>

          {isLoading ? (
            <p>Loading children...</p>
          ) : activeChildren.length === 0 ? (
            <p>No active children yet. Add your first child to get started.</p>
          ) : (
            <div className="child-list">
              {activeChildren.map((child) => renderChildCard(child))}
            </div>
          )}

          {inactiveChildren.length > 0 && (
            <div className="inactive-section">
              <h3>Inactive children</h3>

              <div className="child-list">
                {inactiveChildren.map((child) => renderChildCard(child, true))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default DashboardPage;