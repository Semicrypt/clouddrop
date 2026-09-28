import {
  ArrowLeft,
  Cloud,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

export default function Login() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

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

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await api.post(
          "/api/auth/login",
          {
            email,
            password,
          }
        );

      const {
        token,
        user,
      } = response.data.data;

      localStorage.setItem(
        "clouddrop_token",
        token
      );

      localStorage.setItem(
        "clouddrop_user",
        JSON.stringify(user)
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-brand-panel">
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

        <div className="auth-brand-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />

            Secure workspace
          </span>

          <h1>
            Your cloud files,
            wherever you are.
          </h1>

          <p>
            Sign in to access your
            private files, downloads
            and secure sharing tools.
          </p>
        </div>

        <div className="auth-security-note">
          <LockKeyhole
            size={20}
          />

          <div>
            <strong>
              Protected access
            </strong>

            <span>
              JWT authentication and
              private cloud storage.
            </span>
          </div>
        </div>
      </section>

      <section className="auth-panel auth-form-panel">
        <div className="auth-form-wrapper">
          <Link
            to="/"
            className="back-link"
          >
            <ArrowLeft size={17} />

            Back to home
          </Link>

          <div className="auth-heading">
            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to your
              CloudDrop account.
            </p>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="auth-form"
          >
            <label>
              Email address

              <div className="input-wrapper">
                <Mail
                  size={18}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              Password

              <div className="input-wrapper">
                <LockKeyhole
                  size={18}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              </div>
            </label>

            <button
              className="button button-primary auth-submit"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2
                    className="spinner"
                    size={18}
                  />

                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?

            <Link to="/register">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
