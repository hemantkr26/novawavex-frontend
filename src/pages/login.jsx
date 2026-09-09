import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================
  // HANDLE LOGIN
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = formData.email.trim();

    if (!email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (loading || success) {
      return;
    }

    setLoading(true);

    try {
      await login(
        email,
        formData.password
      );

      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 450);
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Invalid email or password."
        );
      } else if (
        error.response?.status === 400
      ) {
        setError(
          "Please check your email and password."
        );
      } else {
        setError(
          "Unable to connect to the server."
        );
      }

      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =====================================
          LOGIN CARD
          ===================================== */}

      <div className="login-card">

        {/* ===================================
            BRAND
            =================================== */}

        <div className="login-brand">

          <div className="login-brand-mark">
            NW
          </div>

          <div className="login-brand-copy">
            <h1>
              NovaWavex
            </h1>

            <p>
              Workflow Management Platform
            </p>
          </div>

        </div>


        {/* ===================================
            HEADER
            =================================== */}

        <div className="login-header">

          <span className="login-eyebrow">
            AUTHENTICATION
          </span>

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to continue to your
            NovaWavex workspace.
          </p>

        </div>


        {/* ===================================
            LOGIN FORM
            =================================== */}

        <form
          onSubmit={handleSubmit}
          className="login-form"
          noValidate
        >

          {/* EMAIL */}

          <div className="login-field">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading || success}
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="login-field">

            <div className="login-label-row">

              <label htmlFor="password">
                Password
              </label>

              <Link
                to="/forgot-password"
                className="login-forgot-link"
                tabIndex={
                  loading || success
                    ? -1
                    : 0
                }
              >
                Forgot Password?
              </Link>

            </div>


            <div className="login-password-wrapper">

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading || success}
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading || success}
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div
              className="login-error"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <AlertCircle
                size={15}
                className="login-error-icon"
              />

              <span>
                {error}
              </span>
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div
              className="login-success"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <CheckCircle2
                size={16}
                className="login-success-icon"
              />

              <span>
                Login successful. Redirecting...
              </span>
            </div>
          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className={`login-submit-button ${
              loading
                ? "is-loading"
                : ""
            } ${
              success
                ? "is-success"
                : ""
            }`}
            disabled={loading || success}
            aria-busy={loading}
          >

            {success ? (
              <>
                <CheckCircle2
                  size={17}
                  className="login-submit-success-icon"
                />

                <span>
                  Login successful
                </span>
              </>
            ) : loading ? (
              <>
                <Loader2
                  size={17}
                  className="login-submit-spinner"
                />

                <span>
                  Logging in...
                </span>
              </>
            ) : (
              <>
                <LogIn size={17} />

                <span>
                  Login
                </span>
              </>
            )}

            {loading && (
              <span className="login-button-progress" />
            )}

          </button>

        </form>


        {/* ===================================
            CREATE ACCOUNT
            =================================== */}

        <div className="login-create-account">

          <span>
            Don't have an account?
          </span>

          <Link
            to="/register"
            className="login-register-link"
            tabIndex={
              loading || success
                ? -1
                : 0
            }
          >
            <UserPlus
              size={15}
              className="login-register-icon"
            />

            <span>
              Create Account
            </span>
          </Link>

        </div>


        {/* ===================================
            SECURITY INFORMATION
            =================================== */}

        <div className="login-security">

          <KeyRound size={14} />

          <span>
            Secured with JWT authentication
          </span>

        </div>

      </div>


      {/* =====================================
          LOGIN STYLES
          ===================================== */}

      <style>{`

        /* =====================================
           PAGE
           ===================================== */

        .login-page {

          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 32px 20px;

          box-sizing: border-box;

          background:
            linear-gradient(
              135deg,
              #f7f9fc 0%,
              #eef3fb 100%
            );

          animation:
            login-page-enter
            0.45s ease-out both;
        }


        /* =====================================
           CARD
           ===================================== */

        .login-card {

          width: 100%;
          max-width: 430px;

          padding: 34px 36px 28px;

          box-sizing: border-box;

          border:
            1px solid #e3e8f0;

          border-radius: 16px;

          background: #ffffff;

          box-shadow:
            0 18px 45px
            rgba(31, 45, 70, 0.10);

          animation:
            login-card-enter
            0.55s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            both;
        }


        /* =====================================
           BRAND
           ===================================== */

        .login-brand {

          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 30px;

          animation:
            login-brand-enter
            0.55s
            0.08s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            both;
        }


        .login-brand-mark {

          width: 40px;
          height: 40px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color: #ffffff;

          background: #4f7df3;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 0.4px;

          box-shadow:
            0 5px 14px
            rgba(79, 125, 243, 0.18);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .login-brand:hover .login-brand-mark {

          transform:
            translateY(-1px)
            rotate(-2deg)
            scale(1.03);

          box-shadow:
            0 7px 18px
            rgba(79, 125, 243, 0.24);
        }


        .login-brand-copy {

          min-width: 0;
        }


        .login-brand h1 {

          margin: 0;

          color: #172033;

          font-size: 17px;
          font-weight: 800;

          transition:
            color 0.18s ease;
        }


        .login-brand p {

          margin: 3px 0 0;

          color: #7a8699;

          font-size: 10px;
        }


        /* =====================================
           HEADER
           ===================================== */

        .login-header {

          margin-bottom: 24px;

          animation:
            login-content-enter
            0.5s
            0.14s
            ease-out
            both;
        }


        .login-eyebrow {

          display: block;

          margin-bottom: 7px;

          color: #6489ed;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.4px;
        }


        .login-header h2 {

          margin: 0;

          color: #172033;

          font-size: 25px;
          font-weight: 800;
        }


        .login-header p {

          margin: 7px 0 0;

          color: #68758a;

          font-size: 12px;

          line-height: 1.55;
        }


        /* =====================================
           FORM
           ===================================== */

        .login-form {

          display: flex;
          flex-direction: column;

          gap: 17px;

          animation:
            login-content-enter
            0.5s
            0.20s
            ease-out
            both;
        }


        .login-field {

          display: flex;
          flex-direction: column;

          gap: 7px;
        }


        .login-field label {

          color: #25324a;

          font-size: 11px;
          font-weight: 700;

          transition:
            color 0.18s ease;
        }


        .login-field:focus-within label {

          color: #4f7df3;
        }


        .login-label-row {

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;
        }


        .login-forgot-link {

          color: #4f7df3;

          font-size: 10px;
          font-weight: 700;

          text-decoration: none;

          transition:
            color 0.18s ease,
            transform 0.18s ease;
        }


        .login-forgot-link:hover {

          color: #416fe5;

          text-decoration: underline;

          transform:
            translateX(1px);
        }


        .login-forgot-link:active {

          transform:
            translateX(0)
            scale(0.98);
        }


        .login-field input {

          width: 100%;

          min-height: 42px;

          padding:
            0 12px;

          box-sizing: border-box;

          border:
            1px solid #dce3ed;

          border-radius: 8px;

          outline: none;

          color: #172033;

          background: #ffffff;

          font-size: 12px;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            transform 0.18s ease,
            background 0.18s ease;
        }


        .login-field input::placeholder {

          color: #9aa5b5;

          transition:
            color 0.18s ease,
            opacity 0.18s ease;
        }


        .login-field input:hover:not(:disabled) {

          border-color: #c8d4e5;
        }


        .login-field input:focus {

          border-color: #7d9df0;

          background: #ffffff;

          box-shadow:
            0 0 0 3px
            rgba(79, 125, 243, 0.10);

          transform:
            translateY(-1px);
        }


        .login-field input:focus::placeholder {

          color: #aeb8c7;

          opacity: 0.75;
        }


        .login-field input:disabled {

          cursor: not-allowed;

          background: #f7f8fa;

          opacity: 0.75;
        }


        /* =====================================
           PASSWORD
           ===================================== */

        .login-password-wrapper {

          position: relative;
        }


        .login-password-wrapper input {

          padding-right: 42px;
        }


        .login-password-toggle {

          position: absolute;

          top: 50%;
          right: 8px;

          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          transform: translateY(-50%);

          border: 0;

          border-radius: 6px;

          color: #78859a;

          background: transparent;

          cursor: pointer;

          transition:
            color 0.18s ease,
            background 0.18s ease,
            transform 0.16s ease;
        }


        .login-password-toggle:hover:not(:disabled) {

          color: #4f7df3;

          background: #f3f6fc;

          transform:
            translateY(-50%)
            scale(1.05);
        }


        .login-password-toggle:active:not(:disabled) {

          transform:
            translateY(-50%)
            scale(0.92);
        }


        .login-password-toggle:disabled {

          cursor: not-allowed;

          opacity: 0.55;
        }


        .login-password-toggle svg {

          transition:
            transform 0.18s ease;
        }


        .login-password-toggle:hover:not(:disabled) svg {

          transform: scale(1.08);
        }


        /* =====================================
           ERROR
           ===================================== */

        .login-error {

          display: flex;
          align-items: flex-start;

          gap: 8px;

          padding:
            9px 11px;

          border:
            1px solid #f1d4d4;

          border-radius: 7px;

          color: #b54747;

          background: #fff3f3;

          font-size: 10px;

          line-height: 1.45;

          animation:
            login-error-enter
            0.3s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            both;
        }


        .login-error-icon {

          flex-shrink: 0;

          margin-top: 1px;

          animation:
            login-error-icon
            0.35s
            ease-out
            both;
        }


        /* =====================================
           SUCCESS
           ===================================== */

        .login-success {

          display: flex;
          align-items: center;

          gap: 8px;

          padding:
            9px 11px;

          border:
            1px solid #cfe8d7;

          border-radius: 7px;

          color: #287443;

          background: #f0faf3;

          font-size: 10px;

          line-height: 1.45;

          animation:
            login-success-enter
            0.3s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            both;
        }


        .login-success-icon {

          flex-shrink: 0;

          animation:
            login-success-icon
            0.4s
            ease-out
            both;
        }


        /* =====================================
           LOGIN BUTTON
           ===================================== */

        .login-submit-button {

          position: relative;

          width: 100%;

          min-height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          margin-top: 2px;

          overflow: hidden;

          border: 0;

          border-radius: 8px;

          color: #ffffff;

          background: #4f7df3;

          cursor: pointer;

          font-size: 12px;
          font-weight: 750;

          box-shadow:
            0 0 0 rgba(79, 125, 243, 0);

          transition:
            background 0.18s ease,
            transform 0.15s ease,
            box-shadow 0.18s ease,
            opacity 0.18s ease;
        }


        .login-submit-button:hover:not(:disabled) {

          background: #416fe5;

          transform:
            translateY(-1px);

          box-shadow:
            0 6px 14px
            rgba(79, 125, 243, 0.20);
        }


        .login-submit-button:active:not(:disabled) {

          transform:
            translateY(1px)
            scale(0.99);

          box-shadow:
            0 2px 7px
            rgba(79, 125, 243, 0.14);
        }


        .login-submit-button:disabled {

          opacity: 0.72;

          cursor: not-allowed;

          transform: none;

          box-shadow: none;
        }


        .login-submit-button.is-loading {

          background: #5d87ed;

        }


        .login-submit-button.is-success {

          background: #3f9a5b;

          opacity: 1;
        }


        .login-submit-spinner {

          animation:
            login-spin
            0.85s
            linear
            infinite;
        }


        .login-submit-success-icon {

          animation:
            login-success-icon
            0.4s
            ease-out
            both;
        }


        .login-button-progress {

          position: absolute;

          left: 0;
          bottom: 0;

          width: 100%;
          height: 2px;

          transform-origin: left;

          background:
            rgba(
              255,
              255,
              255,
              0.72
            );

          animation:
            login-progress
            1.1s
            ease-in-out
            infinite;
        }


        /* =====================================
           CREATE ACCOUNT
           ===================================== */

        .login-create-account {

          display: flex;
          align-items: center;
          justify-content: center;

          flex-wrap: wrap;

          gap: 5px;

          margin-top: 22px;

          color: #718096;

          font-size: 11px;

          animation:
            login-content-enter
            0.5s
            0.28s
            ease-out
            both;
        }


        .login-register-link {

          display: inline-flex;
          align-items: center;

          gap: 5px;

          color: #4f7df3;

          font-weight: 750;

          text-decoration: none;

          transition:
            color 0.18s ease,
            transform 0.18s ease;
        }


        .login-register-link:hover {

          color: #416fe5;

          text-decoration: underline;

          transform:
            translateY(-1px);
        }


        .login-register-link:active {

          transform:
            translateY(0)
            scale(0.98);
        }


        .login-register-icon {

          transition:
            transform 0.18s ease;
        }


        .login-register-link:hover .login-register-icon {

          transform:
            translateX(1px)
            scale(1.05);
        }


        /* =====================================
           SECURITY
           ===================================== */

        .login-security {

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          margin-top: 18px;
          padding-top: 15px;

          border-top:
            1px solid #edf0f5;

          color: #8a95a6;

          font-size: 9px;

          animation:
            login-content-enter
            0.5s
            0.34s
            ease-out
            both;
        }


        .login-security svg {

          color: #6489ed;

          transition:
            transform 0.18s ease;
        }


        .login-security:hover svg {

          transform:
            translateY(-1px)
            scale(1.05);
        }


        /* =====================================
           FOCUS ACCESSIBILITY
           ===================================== */

        .login-submit-button:focus-visible,
        .login-password-toggle:focus-visible,
        .login-forgot-link:focus-visible,
        .login-register-link:focus-visible {

          outline:
            2px solid #4f7df3;

          outline-offset: 3px;
        }


        /* =====================================
           ANIMATIONS
           ===================================== */

        @keyframes login-page-enter {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }


        @keyframes login-card-enter {

          from {
            opacity: 0;
            transform:
              translateY(18px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }


        @keyframes login-brand-enter {

          from {
            opacity: 0;
            transform:
              translateY(-8px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }


        @keyframes login-content-enter {

          from {
            opacity: 0;
            transform:
              translateY(8px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }


        @keyframes login-error-enter {

          from {
            opacity: 0;
            transform:
              translateY(-4px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }


        @keyframes login-error-icon {

          0% {
            opacity: 0;
            transform:
              scale(0.7)
              rotate(-8deg);
          }

          70% {
            transform:
              scale(1.08)
              rotate(2deg);
          }

          100% {
            opacity: 1;
            transform:
              scale(1)
              rotate(0);
          }
        }


        @keyframes login-success-enter {

          from {
            opacity: 0;
            transform:
              translateY(4px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }


        @keyframes login-success-icon {

          0% {
            opacity: 0;
            transform:
              scale(0.6);
          }

          70% {
            transform:
              scale(1.12);
          }

          100% {
            opacity: 1;
            transform:
              scale(1);
          }
        }


        @keyframes login-spin {

          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }


        @keyframes login-progress {

          0% {
            transform:
              scaleX(0.05);
            opacity: 0.5;
          }

          50% {
            transform:
              scaleX(0.65);
            opacity: 1;
          }

          100% {
            transform:
              scaleX(1);
            opacity: 0.5;
          }
        }


        /* =====================================
           REDUCED MOTION
           ===================================== */

        @media (prefers-reduced-motion: reduce) {

          .login-page,
          .login-card,
          .login-brand,
          .login-header,
          .login-form,
          .login-create-account,
          .login-security,
          .login-error,
          .login-success {

            animation: none !important;
          }


          .login-submit-spinner {

            animation:
              login-spin
              1.4s
              linear
              infinite !important;
          }


          .login-button-progress {

            animation: none !important;

            transform:
              scaleX(0.5);
          }


          .login-brand-mark,
          .login-forgot-link,
          .login-password-toggle,
          .login-register-link,
          .login-security svg,
          .login-submit-button,
          .login-field input {

            transition: none !important;
          }
        }


        /* =====================================
           RESPONSIVE
           ===================================== */

        @media (max-width: 480px) {

          .login-page {

            padding:
              20px 14px;
          }


          .login-card {

            padding:
              28px 22px 24px;

            border-radius: 13px;
          }


          .login-brand {

            margin-bottom: 25px;
          }


          .login-header h2 {

            font-size: 22px;
          }

        }

      `}</style>

    </div>
  );
};

export default Login;