import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import type { InvoicePreview } from "../types";

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function InvoicePage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [preview, setPreview] = useState<InvoicePreview | null>(null);
  const [error, setError] = useState("");

  async function loadPreview(event?: React.FormEvent) {
    event?.preventDefault();
    setError("");

    try {
      const response = await api.get<InvoicePreview>("/Invoices/preview", {
        params: {
          year,
          month,
        },
      });

      setPreview(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load invoice preview.");
      } else {
        setError("Failed to load invoice preview.");
      }
    }
  }

  async function exportExcel() {
    setError("");

    try {
      const response = await api.get("/Invoices/export/excel", {
        params: {
          year,
          month,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `DayhomeFlow-Invoice-${year}-${String(month).padStart(2, "0")}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError("Failed to export Excel file.");
      } else {
        setError("Failed to export Excel file.");
      }
    }
  }

  const dayNumbers = preview
    ? Array.from({ length: preview.daysInMonth }, (_, index) => index + 1)
    : [];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">DayhomeFlow</p>
          <h1>Invoice Preview</h1>
          <p className="muted">
            Generate a monthly invoice grid based on attendance records.
          </p>
        </div>

        <div className="header-actions">
          <Link className="link-button" to="/attendance">
            Attendance
          </Link>

          <Link className="secondary-link-button" to="/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      <section className="panel">
        <form onSubmit={loadPreview} className="invoice-controls">
          <label>
            Month
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
          </label>

          <label>
            Year
            <input
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              type="number"
              min="2000"
              max="2100"
            />
          </label>

          <button type="submit">Generate preview</button>

          <button type="button" onClick={exportExcel}>
            Export Excel
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>

      {preview && (
        <section className="panel invoice-panel">
          <div className="invoice-title-row">
            <div>
              <h2>
                Invoice Preview — {preview.month}/{preview.year}
              </h2>
              <p className="muted">
                x = no record, a = absent, 0 = present without times
              </p>
            </div>

            <div className="invoice-total-box">
              <span>Total paid</span>
              <strong>${preview.totalPaid.toFixed(2)}</strong>
            </div>
          </div>

          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th className="sticky-col">Child</th>

                  {dayNumbers.map((day) => (
                    <th key={day}>{day}</th>
                  ))}

                  <th>Total Hours</th>
                  <th>Contract Fee</th>
                </tr>
              </thead>

              <tbody>
                {preview.children.length === 0 ? (
                  <tr>
                    <td colSpan={preview.daysInMonth + 3}>
                      No active children found.
                    </td>
                  </tr>
                ) : (
                  preview.children.map((child) => (
                    <tr key={child.childId}>
                      <td className="sticky-col child-name-cell">
                        {child.childName}
                      </td>

                      {child.days.map((day) => (
                        <td
                          key={day.day}
                          className={
                            day.value.toLowerCase() === "x"
                              ? "cell-x"
                              : day.value.toLowerCase() === "a"
                              ? "cell-a"
                              : "cell-present"
                          }
                        >
                          {day.value}
                        </td>
                      ))}

                      <td className="strong-cell">{child.totalHours}</td>
                      <td className="strong-cell">
                        ${child.contractFee.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="invoice-summary">
            <div>
              <span>Subtotal</span>
              <strong>${preview.subTotal.toFixed(2)}</strong>
            </div>

            <div>
              <span>Agency fees</span>
              <strong>${preview.agencyFees.toFixed(2)}</strong>
            </div>

            <div>
              <span>Liability insurance</span>
              <strong>${preview.liabilityInsurance.toFixed(2)}</strong>
            </div>

            <div>
              <span>Storypark deduction</span>
              <strong>${preview.storyparkDeduction.toFixed(2)}</strong>
            </div>

            <div>
              <span>Training courses</span>
              <strong>${preview.trainingCourses.toFixed(2)}</strong>
            </div>

            <div>
              <span>Deductions</span>
              <strong>${preview.deductions.toFixed(2)}</strong>
            </div>

            <div>
              <span>Additions</span>
              <strong>${preview.additions.toFixed(2)}</strong>
            </div>

            <div className="grand-total">
              <span>Total paid</span>
              <strong>${preview.totalPaid.toFixed(2)}</strong>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default InvoicePage;