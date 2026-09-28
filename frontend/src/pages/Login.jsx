import {
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

import "./Login.css";

export default function Login() {
  const navigate =
    useNavigate();

  const [
    form,
    setForm,
  ] = useState({
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

    if (
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        "Enter your email and password."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await api.post(
          "/api/auth/login",
          {
            email:
              form.email
                .trim()
                .toLowerCase(),

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
          "Login response did not include an authentication token."
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

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    } catch (requestError) {
      setError(
        requestError
          ?.response?.data
          ?.message ||
          "Unable to sign in. Check your email and password and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-background-grid" />

      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <header className="login-header">
        <Link
          className="login-brand"
          to="/"
        >
          <span>
            <Cloud
              size={20}
            />
          </span>

          <strong>
            Cloud
            <em>
              Drop
            </em>
          </strong>
        </Link>

        <Link
          className="login-back"
          to="/"
        >
          <ArrowLeft
            size={16}
          />

          Back to home
        </Link>
      </header>

      <main className="login-main">
        <section className="login-showcase">
          <div className="login-showcase-content">
            <div className="login-kicker">
              <ShieldCheck
                size={15}
              />

              Secure cloud
              workspace
            </div>

            <h1>
              Welcome back to
              <span>
                {" "}
                CloudDrop.
              </span>
            </h1>

            <p>
              Access your files,
              storage configuration,
              temporary shares and
              connected AWS
              infrastructure from one
              secure workspace.
            </p>

            <div className="login-benefits">
              <div>
                <span>
                  <Check
                    size={14}
                  />
                </span>

                <div>
                  <strong>
                    Private file
                    storage
                  </strong>

                  <small>
                    Secure uploads and
                    signed downloads.
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
                    AWS integration
                  </strong>

                  <small>
                    Cross-account IAM
                    with temporary STS
                    credentials.
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
                    Multi-bucket
                    control
                  </strong>

                  <small>
                    Choose default
                    storage, versioning
                    and bucket actions.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="login-security-visual">
            <div className="login-security-ring ring-one" />
            <div className="login-security-ring ring-two" />

            <div className="login-security-core">
              <ShieldCheck
                size={35}
              />

              <strong>
                Protected
              </strong>

              <span>
                CloudDrop
              </span>
            </div>

            <div className="login-security-chip chip-left">
              <Lock
                size={15}
              />

              Private storage
            </div>

            <div className="login-security-chip chip-right">
              <Cloud
                size={15}
              />

              AWS connected
            </div>
          </div>
        </section>

        <section className="login-form-section">
          <div className="login-form-card">
            <div className="login-form-heading">
              <span>
                Sign in
              </span>

              <h2>
                Access your
                workspace
              </h2>

              <p>
                Enter your CloudDrop
                account credentials.
              </p>
            </div>

            {error && (
              <div
                className="login-error"
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
              className="login-form"
              onSubmit={
                handleSubmit
              }
            >
              <label>
                <span>
                  Email address
                </span>

                <div className="login-input-wrap">
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

                <div className="login-input-wrap">
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    required
                  />

                  <button
                    className="login-password-toggle"
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
              </label>

              <button
                className="login-submit"
                type="submit"
                disabled={
                  loading
                }
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="login-spin"
                    />

                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>
                New to CloudDrop?
              </span>
            </div>

            <Link
              className="login-create-account"
              to="/register"
            >
              Create an account

              <ArrowRight
                size={17}
              />
            </Link>

            <div className="login-security-note">
              <Lock
                size={14}
              />

              <p>
                CloudDrop never asks
                you to enter AWS
                access keys or secret
                keys when connecting
                your AWS account.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="login-footer">
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