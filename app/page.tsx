"use client";

import Image from "next/image";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --jet:       #0a0a0a;
          --jet2:      #111111;
          --jet3:      #181818;
          --card-bg:   #141414;
          --lime:      #CEF17B;
          --pine:      #084734;
          --mint:      #CDEDB3;
          --white:     #f0f0ee;
          --muted:     #6b6b6b;
          --border:    rgba(255,255,255,0.06);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--jet);
          color: var(--white);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        .whizz-landing { min-height: 100vh; }

      .nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 60px;  /* ← reduce from 22px to 16px */
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10,10,10,0.85);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
        .nav-links {
          display: flex;
          list-style: none;
          gap: 36px;
        }
      .nav-links a {
  color: #CEF17B;
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.02em;
  transition: color 0.2s;
}
.nav-links a:hover { color: #ffffff; }
        .nav-right { display: flex; align-items: center; gap: 12px; }

        .btn-primary {
          background: var(--lime);
          color: var(--jet);
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
          display: inline-block;
          white-space: nowrap;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-large { font-size: 1rem; padding: 15px 32px; border-radius: 10px; }
        .btn-ghost {
          color: var(--white);
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          border: 1px solid var(--border);
          padding: 10px 20px;
          border-radius: 10px;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-ghost:hover { border-color: var(--lime); color: var(--lime); }
        .btn-ghost-large {
          color: var(--white);
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          border: 1px solid var(--border);
          padding: 14px 28px;
          border-radius: 10px;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-ghost-large:hover { border-color: var(--lime); color: var(--lime); }
        .btn-text {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .btn-text:hover { color: var(--lime); }

        .accent { color: var(--lime); }

        .hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 20px 60px 60px;  /* ← reduce top padding from 60px to 20px */
  gap: 40px;
  position: relative;
  overflow: hidden;
}
        .hero::before {
          content: 'WHIZZ';
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(120px, 18vw, 220px);
          color: rgba(255,255,255,0.025);
          letter-spacing: -0.05em;
          pointer-events: none;
          z-index: 0;
          user-select: none;
        }

        .hero-left { position: relative; z-index: 2; }

        .hero-eyebrow {
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: var(--muted);
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .hero-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(38px, 4.5vw, 58px);
          line-height: 1.08;
          margin-bottom: 36px;
          color: var(--white);
        }
        .hero-headline .muted { color: rgba(240,240,238,0.45); }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .avatar-stack { display: flex; }
        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 2px solid var(--jet);
          margin-right: -10px;
          display: block;
        }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: var(--white);
          margin-left: 18px;
        }
        .stat-label { font-size: 0.75rem; color: var(--muted); margin-left: 18px; }

        .hero-desc-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 40px;
          max-width: 460px;
        }
        .icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--lime);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hero-desc { font-size: 0.88rem; color: rgba(240,240,238,0.55); line-height: 1.65; }
        .hero-ctas { display: flex; gap: 16px; align-items: center; }

        .hero-right {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-glow {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(206,241,123,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-img-wrap {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 30px 80px rgba(206,241,123,0.15));
          animation: float 6s ease-in-out infinite;
        }
        .hero-img { object-fit: contain; max-width: 100%; }

        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }

        .badge {
          position: absolute;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          backdrop-filter: blur(10px);
          z-index: 5;
          font-size: 0.82rem;
          white-space: nowrap;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .badge-top { top: 12%; right: -5%; }
        .badge-bottom { bottom: 14%; left: -5%; }
        .badge-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--lime);
          box-shadow: 0 0 8px var(--lime);
          flex-shrink: 0;
        }
        .badge-icon { font-size: 1.1rem; }
        .badge-title { font-weight: 600; font-size: 0.82rem; color: var(--white); }
        .badge-sub { font-size: 0.72rem; color: var(--muted); }

        .trusted-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 80px 60px;
          border-top: 1px solid var(--border);
        }
        .trusted-left h2 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(28px, 3vw, 42px);
          line-height: 1.2;
          color: rgba(240,240,238,0.75);
        }
        .trusted-right p {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.8;
          max-width: 400px;
          margin-top: 8px;
        }

        .features-section {
          display: grid;
          grid-template-columns: 1fr 1.1fr 1fr;
          gap: 20px;
          padding: 0 60px 80px;
        }
        .feature-card {
          border-radius: 16px;
          padding: 36px 32px;
          border: 1px solid var(--border);
          transition: transform 0.3s;
        }
        .feature-card:hover { transform: translateY(-4px); }
        .card-dark { background: var(--card-bg); }
        .card-accent { background: var(--lime); }

        .card-num {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--lime);
          margin-bottom: 16px;
        }
        .card-num.dark { color: var(--pine); }

        .feature-card h3 {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          line-height: 1.35;
          color: var(--white);
          margin-bottom: 14px;
        }
        .feature-card h3.dark { color: var(--jet); }

        .card-body {
          font-size: 0.85rem;
          line-height: 1.7;
          color: rgba(10,10,10,0.7);
          margin-bottom: 24px;
        }
        .card-link {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          color: var(--pine);
          transition: opacity 0.2s;
        }
        .card-link:hover { opacity: 0.7; }

        .modes-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          padding: 80px 60px;
          border-top: 1px solid var(--border);
          align-items: center;
        }
        .modes-chart {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 36px;
        }
        .chart-label {
          font-size: 0.8rem;
          color: var(--muted);
          margin-bottom: 6px;
          margin-top: 16px;
        }
        .chart-label:first-child { margin-top: 0; }
        .chart-bar {
          height: 8px;
          border-radius: 4px;
        }
        .chart-bar-85 { background: linear-gradient(90deg, var(--lime) 85%, rgba(255,255,255,0.06) 85%); }
        .chart-bar-72 { background: linear-gradient(90deg, var(--lime) 72%, rgba(255,255,255,0.06) 72%); }
        .chart-bar-60 { background: linear-gradient(90deg, var(--lime) 60%, rgba(255,255,255,0.06) 60%); }
        .chart-bar-78 { background: linear-gradient(90deg, var(--lime) 78%, rgba(255,255,255,0.06) 78%); }
        .chart-badge {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          color: var(--muted);
          background: rgba(206,241,123,0.06);
          border: 1px solid rgba(206,241,123,0.15);
          border-radius: 10px;
          padding: 14px 18px;
        }
        .green-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--lime);
          box-shadow: 0 0 8px var(--lime);
          flex-shrink: 0;
        }
        .chart-badge strong { color: var(--lime); margin-left: auto; font-size: 1rem; }

        .modes-right h2 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(26px, 3vw, 40px);
          line-height: 1.2;
          color: rgba(240,240,238,0.8);
          margin-bottom: 16px;
        }
        .stars { color: var(--lime); font-size: 1.1rem; letter-spacing: 3px; margin-bottom: 20px; }
        .modes-body {
          font-size: 0.88rem;
          color: rgba(240,240,238,0.5);
          line-height: 1.8;
          margin-bottom: 14px;
        }
        .modes-ctas { display: flex; gap: 20px; align-items: center; margin-top: 32px; }

        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 60px;
          border-top: 1px solid var(--border);
        }
        .footer-copy { font-size: 0.8rem; color: var(--muted); }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a {
          font-size: 0.8rem;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--lime); }

        @media (max-width: 900px) {
          .nav { padding: 18px 24px; }
          .nav-links { display: none; }
          .hero { grid-template-columns: 1fr; padding: 40px 24px 60px; }
          .hero::before { display: none; }
          .hero-right { order: -1; }
          .badge-top, .badge-bottom { display: none; }
          .trusted-section { grid-template-columns: 1fr; padding: 60px 24px; gap: 24px; }
          .features-section { grid-template-columns: 1fr; padding: 0 24px 60px; }
          .modes-section { grid-template-columns: 1fr; padding: 60px 24px; gap: 40px; }
          .footer { flex-direction: column; gap: 16px; padding: 28px 24px; text-align: center; }
        }
      `}</style>

      <div className="whizz-landing">
        {/* NAV */}
<nav className="nav">
  <div className="nav-logo">
    <Image src="/logo1.png" alt="Whizz" width={40} height={40} className="object-contain" />
  </div>
  <ul className="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">Features</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">What&apos;s new?</a></li>
  </ul>
  <a
    href="/login"
    className="btn-primary"
    style={{
      background: '#CEF17B',
      color: '#121A0D',
      padding: '10px 20px',
      borderRadius: '999px',
      fontWeight: '700',
      fontSize: '14px',
      textDecoration: 'none',
      transition: 'opacity 0.2s',
    }}
    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
  >
    Get Started Free
  </a>
</nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <p className="hero-eyebrow">STUDY SMARTER, NOT HARDER !</p>
            <h1 className="hero-headline">
              Best <span className="accent">AI-powered</span><br />
              study app<br />
              <span className="muted">for your future.</span>
            </h1>

            <div className="hero-stats">
              <div className="avatar-stack">
                {["#CEF17B","#084734","#CDEDB3","#8fcf5e","#e8ff9a"].map((c,i) => (
                  <span key={i} className="avatar" style={{background:c, zIndex:5-i}} />
                ))}
              </div>
              <div>
                <p className="stat-num">50K +</p>
                <p className="stat-label">Active Learners</p>
              </div>
            </div>

            <div className="hero-desc-row">
              <div className="icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5">
                  <path d="M5 12l5 5L20 7"/>
                </svg>
              </div>
              <p className="hero-desc">
                Whizz uses AI to generate flashcards, quizzes, and identification exercises directly from your PDF or Word files — completely free.
              </p>
            </div>

            <div className="hero-ctas">
              <a href="/login" className="btn-primary btn-large">Explore Now →</a>
              <a href="#" className="btn-ghost-large">Watch Demo</a>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-glow" />
            <div className="hero-img-wrap">
              <Image
                src="/hero2.png"
                alt="Whizz App"
                width={520}
                height={560}
                className="hero-img"
                priority
              />
            </div>
            <div className="badge badge-top">
              <span className="badge-dot" />
              <span>AI Question Generator</span>
            </div>
            <div className="badge badge-bottom">
              <span className="badge-icon">⚡</span>
              <div>
                <p className="badge-title">Free Forever</p>
                <p className="badge-sub">No credit card needed</p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUSTED */}
        <section className="trusted-section">
          <div className="trusted-left">
            <h2>Your <span className="accent">trusted</span> partner of<br />AI-powered learning.</h2>
          </div>
          <div className="trusted-right">
            <p>
              Whizz transforms any document into a personalized study session. Upload your files and let our AI build the perfect quiz set tailored to your content.
            </p>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="features-section">
          <div className="feature-card card-dark">
            <p className="card-num">01.</p>
            <h3>Study for Any<br />Level of Expertise.</h3>
          </div>
          <div className="feature-card card-accent">
            <p className="card-num dark">02.</p>
            <h3 className="dark">Industry<br />best practices.</h3>
            <p className="card-body dark">
              Whizz follows proven spaced-repetition and active-recall techniques backed by cognitive science to maximize retention.
            </p>
            <a href="#" className="card-link dark">Learn More →</a>
          </div>
          <div className="feature-card card-dark">
            <p className="card-num">03.</p>
            <h3>Protected<br />by encryption.</h3>
          </div>
        </section>

        {/* MODES */}
        <section className="modes-section">
          <div className="modes-chart">
            <div className="chart-label">Flip Cards</div>
            <div className="chart-bar chart-bar-85" />
            <div className="chart-label">Multiple Choice</div>
            <div className="chart-bar chart-bar-72" />
            <div className="chart-label">Enumeration</div>
            <div className="chart-bar chart-bar-60" />
            <div className="chart-label">Identification</div>
            <div className="chart-bar chart-bar-78" />
            <div className="chart-badge">
              <span className="green-dot" />
              Average Score Boost
              <strong>+45%</strong>
            </div>
          </div>

          <div className="modes-right">
            <h2>Trusted <span className="accent">platform</span><br />anytime &amp; anywhere.</h2>
            <div className="stars">★ ★ ★ ★ ★</div>
            <p className="modes-body">
              Whizz is a growing ecosystem of AI study modes built for students everywhere. Upload a <strong>PDF or Word file</strong> and let the AI generate questions across four powerful formats.
            </p>
            <p className="modes-body">
              Whizz <strong>unites and accelerates</strong> your study workflow — all modes, all files, completely free.
            </p>
            <div className="modes-ctas">
              <a href="/login" className="btn-primary">Get Started →</a>
              <a href="#" className="btn-text">Ask a question?</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-logo">
            <Image src="/logo1.png" alt="Whizz" width={40} height={40} className="object-contain" />
          </div>
          <p className="footer-copy">© 2025 Whizz. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
}