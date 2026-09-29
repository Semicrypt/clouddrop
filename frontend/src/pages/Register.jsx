import {
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  Database,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

import "./Register.css";

export default function Register() {
  const navigate =
    useNavigate();

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const name =
      form.name.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    if (
      !name ||
      !email ||
      !form.password
    ) {
      setError(
        "Complete all fields before creating your account."
      );

      return;
    }

    if (
      form.password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await api.post(
          "/api/auth/register",
          {
            name,
            email,
            password:
              form.password,
          }
        );

      const token =
        response?.data?.data
          ?.token;

      const user =
        response?.data?.data
          ?.user;

      if (!token) {
        throw new Error(
          "Registration response did not include an authentication token."
        );
      }

      localStorage.setItem(
        "clouddrop_token",
        token
      );

      if (user) {
        localStorage.setItem(
          "clouddrop_user",
          JSON.stringify(
            user
          )
        );
      }

      /*
       * New CloudDrop users choose
       * Managed Storage or connect
       * their own AWS account before
       * continuing into the product.
       */
      navigate(
        "/aws-storage",
        {
          replace: true,
        }
      );
    } catch (requestError) {
      setError(
        requestError
          ?.response?.data
          ?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-background-grid" />

      <div className="register-glow register-glow-one" />

      <div className="register-glow register-glow-two" />

      <header className="register-header">
        <Link
          className="register-brand"
          to="/"
        >
          <span>
            <Cloud size={20} />
          </span>

          <strong>
            Cloud
            <em>Drop</em>
          </strong>
        </Link>

        <Link
          className="register-back"
          to="/"
        >
          <ArrowLeft
            size={16}
          />

          Back to home
        </Link>
      </header>

      <main className="register-main">
        <section className="register-showcase">
          <div className="register-showcase-content">
            <div className="register-kicker">
              <ShieldCheck
                size={15}
              />

              Start securely
            </div>

            <h1>
              Build your private
              <span>
                {" "}
                cloud workspace.
              </span>
            </h1>

            <p>
              Create your CloudDrop
              account, choose your
              preferred storage model,
              then securely upload,
              organize and share files
              from one workspace.
            </p>

            <div className="register-benefits">
              <div>
                <span>
                  <Check
                    size={14}
                  />
                </span>

                <div>
                  <strong>
                    Choose your storage
                  </strong>

                  <small>
                    Start with managed
                    storage or connect
                    your own AWS account.
                  </small>
                </div>
              </div>

              <div>
                <span>
                  <Check
                    size={14}
                  />
                </span>

                <div>
                  <strong>
                    Secure AWS access
                  </strong>

                  <small>
                    Cross-account IAM
                    roles and temporary
                    STS credentials.
                  </small>
                </div>
              </div>

              <div>
                <span>
                  <Check
                    size={14}
                  />
                </span>

                <div>
                  <strong>
                    Multi-bucket control
                  </strong>

                  <small>
                    Create buckets,
                    select defaults and
                    manage versioning.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="register-storage-visual">
            <div className="register-storage-ring ring-one" />

            <div className="register-storage-ring ring-two" />

            <div className="register-storage-core">
              <Cloud
                size={34}
              />

              <strong>
                CloudDrop
              </strong>

              <span>
                Storage
              </span>
            </div>

            <div className="register-storage-chip managed">
              <Cloud
                size={15}
              />

              Managed
            </div>

            <div className="register-storage-chip aws">
              <Database
                size={15}
              />

              My AWS
            </div>
          </div>
        </section>

        <section className="register-form-section">
          <div className="register-form-card">
            <div className="register-form-heading">
              <span>
                Create account
              </span>

              <h2>
                Start your workspace
              </h2>

              <p>
                Your storage choice
                comes immediately after
                registration.
              </p>
            </div>

            {error && (
              <div
                className="register-error"
                role="alert"
              >
                <ShieldCheck
                  size={17}
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            <form
              className="register-form"
              onSubmit={
                handleSubmit
              }
            >
              <label>
                <span>
                  Full name
                </span>

                <div className="register-input-wrap">
                  <User
                    size={17}
                  />

                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    required
                  />
                </div>
              </label>

              <label>
                <span>
                  Email address
                </span>

                <div className="register-input-wrap">
                  <Mail
                    size={17}
                  />

                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    required
                  />
                </div>
              </label>

              <label>
                <span>
                  Password
                </span>

                <div className="register-input-wrap">
                  <Lock
                    size={17}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    minLength={8}
                    required
                  />

                  <button
                    className="register-password-toggle"
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    disabled={
                      loading
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={17}
                      />
                    ) : (
                      <Eye
                        size={17}
                      />
                    )}
                  </button>
                </div>

                <small className="register-password-help">
                  Use at least 8
                  characters.
                </small>
              </label>

              <button
                className="register-submit"
                type="submit"
                disabled={
                  loading
                }
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="register-spin"
                    />

                    Creating account…
                  </>
                ) : (
                  <>
                    Create account

                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>
            </form>

            <div className="register-next-step">
              <div className="register-next-step-icon">
                <Database
                  size={18}
                />
              </div>

              <div>
                <strong>
                  Next: choose storage
                </strong>

                <p>
                  After registration,
                  choose CloudDrop
                  Managed Storage or
                  securely connect your
                  AWS account.
                </p>
              </div>
            </div>

            <div className="register-divider">
              <span>
                Already have an
                account?
              </span>
            </div>

            <Link
              className="register-signin"
              to="/login"
            >
              Sign in instead

              <ArrowRight
                size={17}
              />
            </Link>

            <div className="register-security-note">
              <Lock
                size={14}
              />

              <p>
                Connecting AWS never
                requires you to store
                an AWS access key or
                secret access key in
                CloudDrop.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="register-footer">
        <span>
          © 2026 CloudDrop
        </span>

        <span>
          Secure cloud file storage
        </span>
      </footer>
    </div>
  );
}