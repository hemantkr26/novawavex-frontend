import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, KeyRound } from "lucide-react";

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

    setLoading(true);

    try {
      await login(
        email,
        formData.password
      );

      navigate("/dashboard");
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
    } finally {
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

          <div>
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
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
            >
              {error}
            </div>
          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >

            {loading ? (
              <span>
                Logging in...
              </span>
            ) : (
              <>
                <LogIn size={17} />

                <span>
                  Login
                </span>
              </>
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
          >
            <UserPlus size={15} />

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
        }


        /* =====================================
           BRAND
           ===================================== */

        .login-brand {

          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 30px;
        }


        .login-brand-mark {

          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color: #ffffff;

          background: #4f7df3;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 0.4px;
        }


        .login-brand h1 {

          margin: 0;

          color: #172033;

          font-size: 17px;
          font-weight: 800;
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
        }


        .login-forgot-link:hover {

          text-decoration: underline;
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
            box-shadow 0.18s ease;
        }


        .login-field input::placeholder {

          color: #9aa5b5;
        }


        .login-field input:focus {

          border-color: #7d9df0;

          box-shadow:
            0 0 0 3px
            rgba(79, 125, 243, 0.10);
        }


        .login-field input:disabled {

          cursor: not-allowed;

          background: #f7f8fa;
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
        }


        .login-password-toggle:hover {

          color: #4f7df3;

          background: #f3f6fc;
        }


        /* =====================================
           ERROR
           ===================================== */

        .login-error {

          padding:
            9px 11px;

          border:
            1px solid #f1d4d4;

          border-radius: 7px;

          color: #b54747;

          background: #fff3f3;

          font-size: 10px;

          line-height: 1.45;
        }


        /* =====================================
           LOGIN BUTTON
           ===================================== */

        .login-submit-button {

          width: 100%;

          min-height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          margin-top: 2px;

          border: 0;

          border-radius: 8px;

          color: #ffffff;

          background: #4f7df3;

          cursor: pointer;

          font-size: 12px;
          font-weight: 750;

          transition:
            background 0.18s ease,
            transform 0.15s ease,
            box-shadow 0.18s ease;
        }


        .login-submit-button:hover:not(:disabled) {

          background: #416fe5;

          transform: translateY(-1px);

          box-shadow:
            0 6px 14px
            rgba(79, 125, 243, 0.20);
        }


        .login-submit-button:disabled {

          opacity: 0.65;

          cursor: not-allowed;
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
        }


        .login-register-link {

          display: inline-flex;
          align-items: center;

          gap: 5px;

          color: #4f7df3;

          font-weight: 750;

          text-decoration: none;
        }


        .login-register-link:hover {

          text-decoration: underline;
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
        }


        .login-security svg {

          color: #6489ed;
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