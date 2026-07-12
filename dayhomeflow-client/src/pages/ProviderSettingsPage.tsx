import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import type { ProviderProfile } from "../types";

function ProviderSettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [providerName, setProviderName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    setError("");

    try {
      const response = await api.get<ProviderProfile>("/ProviderProfile/me");

      setBusinessName(response.data.businessName);
      setProviderName(response.data.providerName);
      setEmail(response.data.email || "");
      setPhone(response.data.phone || "");
    } catch {
      setError("Failed to load provider profile.");
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.put<ProviderProfile>("/ProviderProfile/me", {
        businessName,
        providerName,
        email,
        phone,
      });

      setBusinessName(response.data.businessName);
      setProviderName(response.data.providerName);
      setEmail(response.data.email || "");
      setPhone(response.data.phone || "");

      setSuccess("Provider settings saved.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to save provider settings.");
      } else {
        setError("Failed to save provider settings.");
      }
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">DayhomeFlow</p>
          <h1>Provider Settings</h1>
          <p className="muted">
            Update the provider details used on exported invoices.
          </p>
        </div>

        <Link className="secondary-link-button" to="/dashboard">
          Dashboard
        </Link>
      </header>

      <section className="panel">
        <form onSubmit={saveProfile} className="form">
          <label>
            Business / dayhome name
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
            Invoice email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
            />
          </label>

          <label>
            Phone number
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit">Save settings</button>
        </form>
      </section>
    </main>
  );
}

export default ProviderSettingsPage;