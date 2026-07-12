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

function AttendancePage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

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

  async function saveAttendance(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (childId === 0) {
      setError("Please add a child first.");
      return;
    }

    try {
      await api.post("/Attendance", {
        childId,
        date: `${date}T00:00:00`,
        wasPresent,
        dropOffTime: wasPresent ? toTimeSpan(dropOffTime) : null,
        pickUpTime: wasPresent ? toTimeSpan(pickUpTime) : null,
        notes,
      });

      setSuccess("Attendance saved.");
      setNotes("");

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
          <p className="muted">Track daily attendance and care hours.</p>
        </div>

        <Link className="link-button" to="/dashboard">
          Back to dashboard
        </Link>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>Add attendance</h2>

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

            <button type="submit">Save attendance</button>
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
                  <h3>{record.childName}</h3>
                  <p>Date: {new Date(record.date).toLocaleDateString()}</p>
                  <p>Status: {record.wasPresent ? "Present" : "Absent"}</p>
                  <p>Drop-off: {record.dropOffTime || "N/A"}</p>
                  <p>Pick-up: {record.pickUpTime || "N/A"}</p>
                  <p>Notes: {record.notes || "N/A"}</p>

                  <button
                    className="danger-button"
                    onClick={() => deleteAttendance(record.id)}
                  >
                    Delete
                  </button>
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