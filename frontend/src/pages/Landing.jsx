import {
  useState,
} from "react";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Cloud,
  Database,
  Files,
  HardDrive,
  KeyRound,
  Layers3,
  LockKeyhole,
  Menu,
  Server,
  Share2,
  ShieldCheck,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import "./Landing.css";

const productFeatures = [
  {
    icon: UploadCloud,
    title: "Secure file uploads",
    description:
      "Upload documents, images, archives, spreadsheets, and other supported files through a protected storage workflow.",
  },
  {
    icon: Cloud,
    title: "Managed or your own AWS",
    description:
      "Start with CloudDrop-managed storage or securely connect your own AWS account when you want deeper control.",
  },
  {
    icon: Database,
    title: "Multi-bucket management",
    description:
      "Create CloudDrop-controlled S3 buckets, inspect them, choose a default destination, and manage storage from one interface.",
  },
  {
    icon: Layers3,
    title: "Bucket versioning",
    description:
      "Enable or suspend S3 versioning directly from CloudDrop for supported buckets in your connected AWS account.",
  },
  {
    icon: Share2,
    title: "Temporary sharing",
    description:
      "Create expiring file links backed by short-lived signed S3 access without making your objects publicly accessible.",
  },
  {
    icon: ShieldCheck,
    title: "Security by design",
    description:
      "Cross-account IAM, external IDs, temporary STS credentials, private buckets, encryption, and ownership checks.",
  },
];

const securityItems = [
  "Cross-account IAM roles",
  "Unique External ID per connection",
  "Temporary AWS STS credentials",
  "Private S3 buckets",
  "Block Public Access",
  "Server-side encryption",
];

const architectureItems = [
  {
    label: "Frontend",
    value: "React + Vite",
  },
  {
    label: "API",
    value: "Node.js + Express",
  },
  {
    label: "Database",
    value: "PostgreSQL",
  },
  {
    label: "Storage",
    value: "Amazon S3",
  },
  {
    label: "Deployment",
    value: "Docker + Nginx",
  },
  {
    label: "Automation",
    value: "GitHub Actions",
  },
];

function Brand() {
  return (
    <Link
      className="landing-brand"
      to="/"
      aria-label="CloudDrop home"
    >
      <span className="landing-brand-mark">
        <Cloud size={20} />
      </span>

      <strong>
        Cloud
        <em>Drop</em>
      </strong>
    </Link>
  );
}

export default function Landing() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const closeMobileMenu =
    () => {
      setMobileMenuOpen(
        false
      );
    };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-nav">
          <Brand />

          <nav className="landing-nav-links">
            <a href="#features">
              Features
            </a>

            <a href="#aws">
              AWS Storage
            </a>

            <a href="#security">
              Security
            </a>

            <a href="#architecture">
              Architecture
            </a>
          </nav>

          <div className="landing-nav-actions">
            <Link
              className="landing-signin"
              to="/login"
            >
              Sign in
            </Link>

            <Link
              className="landing-nav-cta"
              to="/register"
            >
              Get started

              <ArrowRight
                size={16}
              />
            </Link>
          </div>

          <button
            className="landing-mobile-toggle"
            type="button"
            aria-label={
              mobileMenuOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={
              mobileMenuOpen
            }
            onClick={() =>
              setMobileMenuOpen(
                (current) =>
                  !current
              )
            }
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="landing-mobile-menu">
            <a
              href="#features"
              onClick={
                closeMobileMenu
              }
            >
              Features
            </a>

            <a
              href="#aws"
              onClick={
                closeMobileMenu
              }
            >
              AWS Storage
            </a>

            <a
              href="#security"
              onClick={
                closeMobileMenu
              }
            >
              Security
            </a>

            <a
              href="#architecture"
              onClick={
                closeMobileMenu
              }
            >
              Architecture
            </a>

            <div className="landing-mobile-actions">
              <Link
                to="/login"
                onClick={
                  closeMobileMenu
                }
              >
                Sign in
              </Link>

              <Link
                className="primary"
                to="/register"
                onClick={
                  closeMobileMenu
                }
              >
                Create account

                <ArrowRight
                  size={16}
                />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-grid-background" />

          <div className="landing-glow landing-glow-one" />

          <div className="landing-glow landing-glow-two" />

          <div className="landing-container landing-hero-layout">
            <div className="landing-hero-copy">
              <div className="landing-eyebrow">
                <span>
                  <Zap size={14} />
                </span>

                Secure cloud file
                management
              </div>

              <h1>
                Your files.
                <br />

                <span>
                  Your cloud.
                </span>

                <br />

                Your control.
              </h1>

              <p>
                CloudDrop combines
                simple file
                management with
                secure AWS storage
                controls — including
                bring-your-own-AWS,
                multiple S3 buckets,
                versioning, sharing,
                and automated
                default-bucket
                routing.
              </p>

              <div className="landing-hero-actions">
                <Link
                  className="landing-primary-button"
                  to="/register"
                >
                  Start with CloudDrop

                  <ArrowRight
                    size={18}
                  />
                </Link>

                <a
                  className="landing-secondary-button"
                  href="#features"
                >
                  Explore platform

                  <ChevronRight
                    size={18}
                  />
                </a>
              </div>

              <div className="landing-trust-row">
                <div>
                  <Check size={15} />
                  Private by default
                </div>

                <div>
                  <Check size={15} />
                  No customer access
                  keys stored
                </div>

                <div>
                  <Check size={15} />
                  Expiring share links
                </div>
              </div>
            </div>

            <div className="landing-preview-wrap">
              <div className="landing-preview-glow" />

              <div className="landing-product-window">
                <div className="landing-window-top">
                  <div className="landing-window-brand">
                    <span>
                      <Cloud
                        size={15}
                      />
                    </span>

                    CloudDrop
                  </div>

                  <div className="landing-window-status">
                    <span />

                    AWS connected
                  </div>
                </div>

                <div className="landing-window-body">
                  <aside className="landing-preview-sidebar">
                    <div className="active">
                      <HardDrive
                        size={17}
                      />
                    </div>

                    <div>
                      <Files
                        size={17}
                      />
                    </div>

                    <div>
                      <Database
                        size={17}
                      />
                    </div>

                    <div>
                      <ShieldCheck
                        size={17}
                      />
                    </div>
                  </aside>

                  <div className="landing-preview-main">
                    <div className="landing-preview-heading">
                      <div>
                        <span>
                          Storage
                          workspace
                        </span>

                        <strong>
                          My AWS
                          Buckets
                        </strong>
                      </div>

                      <button
                        type="button"
                        tabIndex={-1}
                      >
                        +
                        <span>
                          Create bucket
                        </span>
                      </button>
                    </div>

                    <div className="landing-preview-stats">
                      <div>
                        <span>
                          Buckets
                        </span>

                        <strong>
                          2
                        </strong>

                        <small>
                          1 default
                        </small>
                      </div>

                      <div>
                        <span>
                          Files
                        </span>

                        <strong>
                          128
                        </strong>

                        <small>
                          Private
                          storage
                        </small>
                      </div>

                      <div>
                        <span>
                          Connection
                        </span>

                        <strong className="secure">
                          Secure
                        </strong>

                        <small>
                          AWS STS
                        </small>
                      </div>
                    </div>

                    <div className="landing-preview-buckets">
                      <div className="landing-preview-bucket default">
                        <div className="landing-preview-bucket-icon">
                          <Database
                            size={17}
                          />
                        </div>

                        <div className="landing-preview-bucket-copy">
                          <strong>
                            clouddrop-projects
                          </strong>

                          <span>
                            eu-north-1
                          </span>
                        </div>

                        <div className="landing-preview-badge">
                          Default
                        </div>
                      </div>

                      <div className="landing-preview-bucket">
                        <div className="landing-preview-bucket-icon">
                          <Database
                            size={17}
                          />
                        </div>

                        <div className="landing-preview-bucket-copy">
                          <strong>
                            clouddrop-archive
                          </strong>

                          <span>
                            eu-north-1
                          </span>
                        </div>

                        <div className="landing-preview-badge secondary">
                          Versioned
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="landing-floating-card secure">
                <span>
                  <ShieldCheck
                    size={18}
                  />
                </span>

                <div>
                  <strong>
                    Secure IAM
                  </strong>

                  <small>
                    STS temporary
                    credentials
                  </small>
                </div>
              </div>

              <div className="landing-floating-card storage">
                <span>
                  <Database
                    size={18}
                  />
                </span>

                <div>
                  <strong>
                    Multi-bucket
                  </strong>

                  <small>
                    Set your default
                    destination
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-container landing-tech-strip">
            <span>
              Built with
            </span>

            <div>
              <strong>AWS</strong>
              <strong>React</strong>
              <strong>Node.js</strong>
              <strong>PostgreSQL</strong>
              <strong>Docker</strong>
              <strong>Nginx</strong>
              <strong>
                GitHub Actions
              </strong>
            </div>
          </div>
        </section>

        <section
          className="landing-section landing-features"
          id="features"
        >
          <div className="landing-container">
            <div className="landing-section-heading">
              <span>
                Platform
                capabilities
              </span>

              <h2>
                Simple file
                management.
                <br />
                Serious cloud
                infrastructure.
              </h2>

              <p>
                CloudDrop makes
                secure storage easy
                to use while keeping
                the infrastructure
                controls that matter
                to technical users.
              </p>
            </div>

            <div className="landing-feature-grid">
              {productFeatures.map(
                ({
                  icon: Icon,
                  title,
                  description,
                }) => (
                  <article
                    key={title}
                    className="landing-feature-card"
                  >
                    <div className="landing-feature-icon">
                      <Icon
                        size={22}
                      />
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
          </div>
        </section>

        <section
          className="landing-section landing-aws-section"
          id="aws"
        >
          <div className="landing-container landing-aws-layout">
            <div className="landing-aws-copy">
              <span className="landing-small-label">
                Bring your own AWS
              </span>

              <h2>
                Your S3 storage.
                Managed through
                CloudDrop.
              </h2>

              <p>
                Connect an AWS
                account using a
                cross-account IAM
                role. CloudDrop then
                uses temporary STS
                credentials to work
                only with approved
                storage resources.
              </p>

              <div className="landing-aws-points">
                <div>
                  <Check size={14} />

                  Create
                  CloudDrop-controlled
                  buckets
                </div>

                <div>
                  <Check size={14} />

                  Select the default
                  upload bucket
                </div>

                <div>
                  <Check size={14} />

                  View files by bucket
                </div>

                <div>
                  <Check size={14} />

                  Enable or suspend
                  versioning
                </div>

                <div>
                  <Check size={14} />

                  Guarded bucket
                  deletion
                </div>

                <div>
                  <Check size={14} />

                  Existing managed
                  files remain
                  accessible
                </div>
              </div>

              <Link
                className="landing-inline-link"
                to="/register"
              >
                Create your workspace

                <ArrowRight
                  size={17}
                />
              </Link>
            </div>

            <div className="landing-aws-visual">
              <div className="landing-storage-tree">
                <div className="landing-tree-root">
                  <Cloud
                    size={25}
                  />

                  <div>
                    <span>
                      CloudDrop
                    </span>

                    <strong>
                      Storage Router
                    </strong>
                  </div>
                </div>

                <div className="landing-tree-line" />

                <div className="landing-tree-branches">
                  <article>
                    <div className="landing-tree-icon managed">
                      <HardDrive
                        size={20}
                      />
                    </div>

                    <span>
                      Managed
                      Storage
                    </span>

                    <strong>
                      CloudDrop S3
                    </strong>

                    <small>
                      Ready
                      immediately
                    </small>
                  </article>

                  <article>
                    <div className="landing-tree-icon aws">
                      <Database
                        size={20}
                      />
                    </div>

                    <span>
                      My AWS
                    </span>

                    <strong>
                      Default Bucket
                    </strong>

                    <small>
                      STS assumed role
                    </small>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="landing-section landing-security"
          id="security"
        >
          <div className="landing-container landing-security-layout">
            <div className="landing-security-visual">
              <div className="landing-security-ring ring-one" />
              <div className="landing-security-ring ring-two" />
              <div className="landing-security-ring ring-three" />

              <div className="landing-security-core">
                <ShieldCheck
                  size={40}
                />

                <strong>
                  Protected
                </strong>

                <span>
                  CloudDrop
                </span>
              </div>

              <div className="landing-security-chip chip-one">
                <KeyRound
                  size={17}
                />

                STS
              </div>

              <div className="landing-security-chip chip-two">
                <LockKeyhole
                  size={17}
                />

                Private S3
              </div>
            </div>

            <div className="landing-security-copy">
              <span className="landing-small-label">
                Security model
              </span>

              <h2>
                Cloud storage
                without handing over
                permanent AWS
                credentials.
              </h2>

              <p>
                CloudDrop's AWS
                connection uses an
                IAM role, unique
                external ID and
                short-lived STS
                credentials rather
                than requiring users
                to store AWS access
                keys in the
                application.
              </p>

              <div className="landing-security-list">
                {securityItems.map(
                  (item) => (
                    <div key={item}>
                      <span>
                        <Check
                          size={14}
                        />
                      </span>

                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          className="landing-section landing-architecture"
          id="architecture"
        >
          <div className="landing-container">
            <div className="landing-section-heading centered">
              <span>
                Cloud & DevOps
                architecture
              </span>

              <h2>
                Designed like a real
                production service.
              </h2>

              <p>
                CloudDrop combines
                application
                development,
                persistent
                databases, AWS
                storage, container
                deployment, reverse
                proxying, health
                checks, and
                automated CI/CD.
              </p>
            </div>

            <div className="landing-architecture-flow">
              <article>
                <div>
                  <Files size={20} />
                </div>

                <span>
                  Source
                </span>

                <strong>
                  GitHub
                </strong>
              </article>

              <ChevronRight
                className="landing-flow-arrow"
                size={20}
              />

              <article>
                <div>
                  <Zap size={20} />
                </div>

                <span>
                  Automation
                </span>

                <strong>
                  GitHub Actions
                </strong>
              </article>

              <ChevronRight
                className="landing-flow-arrow"
                size={20}
              />

              <article>
                <div>
                  <Server
                    size={20}
                  />
                </div>

                <span>
                  Runtime
                </span>

                <strong>
                  Docker
                </strong>
              </article>

              <ChevronRight
                className="landing-flow-arrow"
                size={20}
              />

              <article className="featured">
                <div>
                  <Cloud
                    size={20}
                  />
                </div>

                <span>
                  Application
                </span>

                <strong>
                  Node API
                </strong>
              </article>

              <div className="landing-flow-services">
                <div>
                  <Database
                    size={17}
                  />

                  PostgreSQL
                </div>

                <div>
                  <HardDrive
                    size={17}
                  />

                  AWS S3
                </div>

                <div>
                  <ShieldCheck
                    size={17}
                  />

                  Health checks
                </div>
              </div>
            </div>

            <div className="landing-architecture-grid">
              {architectureItems.map(
                (item) => (
                  <div
                    key={
                      item.label
                    }
                  >
                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {item.value}
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="landing-final">
          <div className="landing-container">
            <div className="landing-final-card">
              <div className="landing-final-glow" />

              <div className="landing-final-icon">
                <Cloud
                  size={24}
                />
              </div>

              <h2>
                Put your files in a
                cloud you control.
              </h2>

              <p>
                Start with
                CloudDrop-managed
                storage or connect
                your AWS account and
                take control of your
                own S3 buckets.
              </p>

              <div className="landing-final-actions">
                <Link
                  className="landing-primary-button"
                  to="/register"
                >
                  Create account

                  <ArrowRight
                    size={18}
                  />
                </Link>

                <Link
                  className="landing-secondary-button"
                  to="/login"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-content">
          <div>
            <Brand />

            <p>
              Secure file storage
              with AWS-powered
              control.
            </p>
          </div>

          <div className="landing-footer-links">
            <a href="#features">
              Features
            </a>

            <a href="#aws">
              AWS Storage
            </a>

            <a href="#security">
              Security
            </a>

            <Link to="/login">
              Sign in
            </Link>
          </div>

          <div className="landing-footer-bottom">
            <span>
              © 2026 CloudDrop
            </span>

            <span>
              Built for secure cloud
              storage.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}