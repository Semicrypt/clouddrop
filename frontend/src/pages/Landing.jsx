import {
  ArrowRight,
  Cloud,
  Database,
  FileLock2,
  Search,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

const features = [
  {
    icon: FileLock2,
    title: "Private by default",
    description:
      "Files remain protected in private cloud storage and are accessed only through authorized requests.",
  },
  {
    icon: UploadCloud,
    title: "Simple uploads",
    description:
      "Upload documents and files with automatic type validation, categorization and metadata tracking.",
  },
  {
    icon: Search,
    title: "Find anything",
    description:
      "Search and filter your uploaded files without exposing internal storage details.",
  },
  {
    icon: ShieldCheck,
    title: "Secure sharing",
    description:
      "Generate temporary public links with automatic expiration and revocation controls.",
  },
];

export default function Landing() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link
          to="/"
          className="brand"
        >
          <div className="brand-mark">
            <Cloud size={21} />
          </div>

          <span>
            CloudDrop
          </span>
        </Link>

        <div className="nav-actions">
          <Link
            to="/login"
            className="text-link"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="button button-primary button-small"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-dot" />

            Secure cloud storage
            built on AWS
          </div>

          <h1>
            Your files.
            <br />

            <span>
              Secure in the cloud.
            </span>
          </h1>

          <p className="hero-description">
            Upload, organize, search,
            download and securely share
            your files from one modern
            cloud workspace.
          </p>

          <div className="hero-actions">
            <Link
              to="/register"
              className="button button-primary"
            >
              Start storing files

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="button button-secondary"
            >
              Sign in
            </Link>
          </div>

          <div className="hero-trust">
            <div>
              <ShieldCheck size={17} />

              Private storage
            </div>

            <div>
              <Database size={17} />

              PostgreSQL metadata
            </div>

            <div>
              <Cloud size={17} />

              AWS powered
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="storage-card">
            <div className="storage-card-header">
              <div>
                <span className="muted-label">
                  Cloud workspace
                </span>

                <h3>
                  My Files
                </h3>
              </div>

              <div className="status-pill">
                <span />

                Secure
              </div>
            </div>

            <div className="storage-upload">
              <div className="upload-icon">
                <UploadCloud
                  size={26}
                />
              </div>

              <strong>
                Drop files here
              </strong>

              <span>
                Private storage with
                encrypted transport
              </span>
            </div>

            <div className="storage-list">
              <div className="fake-file-row">
                <div className="file-symbol">
                  PDF
                </div>

                <div>
                  <strong>
                    project-report.pdf
                  </strong>

                  <span>
                    Documents · 2.4 MB
                  </span>
                </div>

                <span className="secured">
                  Secure
                </span>
              </div>

              <div className="fake-file-row">
                <div className="file-symbol image-symbol">
                  IMG
                </div>

                <div>
                  <strong>
                    architecture.png
                  </strong>

                  <span>
                    Images · 840 KB
                  </span>
                </div>

                <span className="secured">
                  Secure
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <span>
            Everything you need
          </span>

          <h2>
            Cloud storage without
            the complexity.
          </h2>
        </div>

        <div className="feature-grid">
          {features.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <article
                className="feature-card"
                key={title}
              >
                <div className="feature-icon">
                  <Icon size={22} />
                </div>

                <h3>
                  {title}
                </h3>

                <p>
                  {description}
                </p>
              </article>
            )
          )}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="brand footer-brand">
          <div className="brand-mark">
            <Cloud size={18} />
          </div>

          <span>
            CloudDrop
          </span>
        </div>

        <p>
          Secure cloud file storage
          platform.
        </p>
      </footer>
    </main>
  );
}
