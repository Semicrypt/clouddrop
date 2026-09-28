import {
  ArrowLeft,
  Cloud,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

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

  function updateField(
    event
  ) {
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.value,
    }));
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await api.post(
          "/api/auth/register",
          form
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
          "Unable to create your account."
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

            Start securely
          </span>

          <h1>
            Build your private
            cloud workspace.
          </h1>

          <p>
            Store, organize and share
            your files through a
            secure AWS-backed
            platform.
          </p>
        </div>

        <div className="auth-security-note">
          <Cloud size={20} />

          <div>
            <strong>
              AWS powered
            </strong>

            <span>
              Private object storage
              with secure temporary
              access.
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
              Create an account
            </h2>

            <p>
              Start using your
              CloudDrop workspace.
            </p>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              Full name

              <div className="input-wrapper">
                <User size={18} />

                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={
                    updateField
                  }
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
              </div>
            </label>

            <label>
              Email address

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={
                    updateField
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
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    form.password
                  }
                  onChange={
                    updateField
                  }
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
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

                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?

            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
