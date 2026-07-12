import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import type { AttendanceRecord, Child } from "../types";

function getTodayDateInputValue() {
  return new Date().toISOString().split("T")[0];
}

function toTimeSpan(time: string) {
  if (!time) {
    return null;
  }

  return `${time}:00`;
}

function toDateInputValue(dateString: string) {
  return new Date(dateString).toISOString().split("T")[0];
}

function toTimeInputValue(timeString?: string | null) {
  if (!timeString) {
    return "";
  }

  return timeString.slice(0, 5);
}

function AttendancePage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const [editingAttendanceId, setEditingAttendanceId] = useState<number | null>(null);

  const [childId, setChildId] = useState<number>(0);
  const [date, setDate] = useState(getTodayDateInputValue());
  const [wasPresent, setWasPresent] = useState(true);
  const [dropOffTime, setDropOffTime] = useState("08:30");
  const [pickUpTime, setPickUpTime] = useState("16:30");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadChildren() {
    try {
      const response = await api.get<Child[]>("/Children/active");
      setChildren(response.data);

      if (response.data.length > 0 && childId === 0) {
        setChildId(response.data[0].id);
      }
    } catch {
      setError("Failed to load children.");
    }
  }

  async function loadAttendance() {
    try {
      const response = await api.get<AttendanceRecord[]>("/Attendance");
      setRecords(response.data);
    } catch {
      setError("Failed to load attendance records.");
    }
  }

  useEffect(() => {
    loadChildren();
    loadAttendance();
  }, []);

  function resetForm() {
    setEditingAttendanceId(null);
    setChildId(children.length > 0 ? children[0].id : 0);
    setDate(getTodayDateInputValue());
    setWasPresent(true);
    setDropOffTime("08:30");
    setPickUpTime("16:30");
    setNotes("");
  }

  function startEdit(record: AttendanceRecord) {
    setEditingAttendanceId(record.id);
    setChildId(record.childId);
    setDate(toDateInputValue(record.date));
    setWasPresent(record.wasPresent);
    setDropOffTime(toTimeInputValue(record.dropOffTime) || "08:30");
    setPickUpTime(toTimeInputValue(record.pickUpTime) || "16:30");
    setNotes(record.notes || "");
    setError("");
    setSuccess("");
  }

  async function saveAttendance(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (childId === 0) {
      setError("Please add a child first.");
      return;
    }

    const attendanceBody = {
      childId,
      date: `${date}T00:00:00`,
      wasPresent,
      dropOffTime: wasPresent ? toTimeSpan(dropOffTime) : null,
      pickUpTime: wasPresent ? toTimeSpan(pickUpTime) : null,
      notes,
    };

    try {
      if (editingAttendanceId) {
        await api.put(`/Attendance/${editingAttendanceId}`, attendanceBody);
        setSuccess("Attendance updated.");
      } else {
        await api.post("/Attendance", attendanceBody);
        setSuccess("Attendance saved.");
      }

      resetForm();
      await loadAttendance();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to save attendance.");
      } else {
        setError("Failed to save attendance.");
      }
    }
  }

  async function deleteAttendance(id: number) {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/Attendance/${id}`);
      setSuccess("Attendance record deleted.");

      if (editingAttendanceId === id) {
        resetForm();
      }

      await loadAttendance();
    } catch {
      setError("Failed to delete attendance record.");
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">DayhomeFlow</p>
          <h1>Attendance</h1>
          <p className="muted">Track and edit daily attendance records.</p>
        </div>

        <div className="header-actions">
          <Link className="link-button" to="/invoices">
            Invoices
          </Link>

          <Link className="secondary-link-button" to="/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>{editingAttendanceId ? "Edit attendance" : "Add attendance"}</h2>

          <form onSubmit={saveAttendance} className="form">
            <label>
              Child
              <select
                value={childId}
                onChange={(event) => setChildId(Number(event.target.value))}
                required
              >
                {children.length === 0 ? (
                  <option value={0}>No children found</option>
                ) : (
                  children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label>
              Date
              <input
                value={date}
                onChange={(event) => setDate(event.target.value)}
                type="date"
                required
              />
            </label>

            <label className="checkbox-row">
              <input
                checked={wasPresent}
                onChange={(event) => setWasPresent(event.target.checked)}
                type="checkbox"
              />
              Present
            </label>

            {wasPresent && (
              <>
                <label>
                  Drop-off time
                  <input
                    value={dropOffTime}
                    onChange={(event) => setDropOffTime(event.target.value)}
                    type="time"
                  />
                </label>

                <label>
                  Pick-up time
                  <input
                    value={pickUpTime}
                    onChange={(event) => setPickUpTime(event.target.value)}
                    type="time"
                  />
                </label>
              </>
            )}

            <label>
              Notes
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes"
              />
            </label>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <button type="submit">
              {editingAttendanceId ? "Save changes" : "Save attendance"}
            </button>

            {editingAttendanceId && (
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
          <h2>Recent attendance</h2>

          {records.length === 0 ? (
            <p className="muted">No attendance records yet.</p>
          ) : (
            <div className="child-list">
              {records.map((record) => (
                <article key={record.id} className="child-card">
                  <div className="child-card-header">
                    <div>
                      <h3>{record.childName}</h3>
                      <p>Date: {new Date(record.date).toLocaleDateString()}</p>
                    </div>

                    <span
                      className={
                        record.wasPresent
                          ? "status-pill active"
                          : "status-pill inactive"
                      }
                    >
                      {record.wasPresent ? "Present" : "Absent"}
                    </span>
                  </div>

                  <p>Drop-off: {record.dropOffTime || "N/A"}</p>
                  <p>Pick-up: {record.pickUpTime || "N/A"}</p>
                  <p>Notes: {record.notes || "N/A"}</p>

                  <div className="card-actions">
                    <button type="button" onClick={() => startEdit(record)}>
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => deleteAttendance(record.id)}
                    >
                      Delete
                    </button>
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

export default AttendancePage;