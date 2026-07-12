import { Link } from "react-router-dom";

function LandingPage() {
  const isLoggedIn = !!localStorage.getItem("dayhomeflow_token");

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">
          DayhomeFlow
        </Link>

        <div className="landing-nav-actions">
          {isLoggedIn ? (
            <Link className="link-button" to="/dashboard">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link className="secondary-link-button" to="/auth">
                Log in
              </Link>

              <Link className="link-button" to="/auth">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">Childcare admin made simpler</p>

          <h1>Track attendance and export monthly dayhome invoices faster.</h1>

          <p className="hero-subtitle">
            DayhomeFlow helps dayhome providers manage children, record daily
            attendance, calculate monthly hours, and export Excel invoices using
            a familiar template.
          </p>

          <div className="hero-actions">
            {isLoggedIn ? (
              <Link className="link-button large-button" to="/dashboard">
                Open dashboard
              </Link>
            ) : (
              <Link className="link-button large-button" to="/auth">
                Start tracking attendance
              </Link>
            )}

            <a className="outline-button large-button" href="#features">
              View features
            </a>
          </div>

          <p className="privacy-note">
            Built for dayhome workflows. Use demo data while testing before
            entering real childcare information.
          </p>
        </div>

        <div className="hero-card">
          <div className="mock-window">
            <div className="mock-window-top">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="mock-dashboard">
              <div>
                <p className="mock-label">Monthly invoice</p>
                <h3>July 2026</h3>
              </div>

              <div className="mock-grid">
                <span>Child</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>Hours</span>

                <strong>Ayaan Test</strong>
                <span>8</span>
                <span>a</span>
                <span>8.5</span>
                <strong>16.5</strong>

                <strong>Sara Demo</strong>
                <span>x</span>
                <span>7.5</span>
                <span>8</span>
                <strong>15.5</strong>
              </div>

              <div className="mock-export-row">
                <span>Ready to export</span>
                <button>Excel</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-heading">
          <p className="eyebrow">Features</p>
          <h2>Everything needed for the monthly attendance workflow.</h2>
        </div>

        <div className="features-grid">
          <article className="feature-card">
            <h3>Children management</h3>
            <p>
              Add children, update parent contact details, deactivate inactive
              records, and keep provider data separated by account.
            </p>
          </article>

          <article className="feature-card">
            <h3>Attendance tracking</h3>
            <p>
              Record present/absent days, drop-off times, pick-up times, notes,
              and edit mistakes before exporting.
            </p>
          </article>

          <article className="feature-card">
            <h3>Excel invoice export</h3>
            <p>
              Export a monthly Excel invoice using the same familiar structure:
              child rows, day columns, total hours, provider name, and parent names.
            </p>
          </article>

          <article className="feature-card">
            <h3>Provider settings</h3>
            <p>
              Update the provider name, business name, email, and phone number
              used on exported invoice documents.
            </p>
          </article>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to organize your dayhome records?</h2>
        <p>
          Start with children and attendance, then export the monthly invoice
          when records are ready.
        </p>

        {isLoggedIn ? (
          <Link className="link-button large-button" to="/dashboard">
            Go to dashboard
          </Link>
        ) : (
          <Link className="link-button large-button" to="/auth">
            Create account
          </Link>
        )}
      </section>
    </main>
  );
}

export default LandingPage;