import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import authService from "../services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  /*
   * =========================================
   * RESET TOKEN
   * =========================================
   *
   * Expected URL:
   *
   * /reset-password?token=YOUR_RESET_TOKEN
   *
   */

  const resetToken =
    searchParams.get("token") || "";


  /*
   * =========================================
   * FORM STATE
   * =========================================
   */

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });


  /*
   * =========================================
   * UI STATE
   * =========================================
   */

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  /*
   * =========================================
   * HANDLE INPUT
   * =========================================
   */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  /*
   * =========================================
   * PASSWORD VALIDATION
   * =========================================
   */

  const validatePassword = () => {
    const password =
      formData.newPassword;

    if (!password) {
      return "Please enter a new password.";
    }

    if (password.length < 8) {
      return (
        "Password must contain at least 8 characters."
      );
    }

    if (!formData.confirmPassword) {
      return (
        "Please confirm your new password."
      );
    }

    if (
      password !==
      formData.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return "";
  };


  /*
   * =========================================
   * RESET PASSWORD
   * =========================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Token validation
     */

    if (!resetToken) {
      setError(
        "This password reset link is invalid or incomplete."
      );

      return;
    }

    /*
     * Password validation
     */

    const validationError =
      validatePassword();

    if (validationError) {
      setError(validationError);

      return;
    }

    setLoading(true);

    try {
      const response =
        await authService.resetPassword(
          resetToken,
          formData.newPassword,
          formData.confirmPassword
        );

      setSuccess(
        response?.message ||
          "Password reset successfully."
      );

      /*
       * Give the user a moment to read
       * the success message before going
       * back to Login.
       */

      setTimeout(() => {
        navigate("/login");
      }, 1800);

    } catch (error) {
      console.error(
        "Password reset failed:",
        error
      );

      const backendMessage =
        error.response?.data?.message;

      if (
        error.response?.status === 400
      ) {
        setError(
          backendMessage ||
            "The reset link is invalid or has expired."
        );

      } else if (
        error.response?.status === 401
      ) {
        setError(
          "This password reset link is no longer valid."
        );

      } else {
        setError(
          backendMessage ||
            "Unable to reset your password. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  /*
   * =========================================
   * RETURN
   * =========================================
   */

  return (
    <div className="reset-password-page">

      {/* =====================================
          LEFT / BRAND AREA
          ===================================== */}

      <div className="reset-password-brand">

        <div className="reset-password-brand-content">

          <div className="reset-password-brand-mark">
            NW
          </div>

          <span className="reset-password-brand-eyebrow">
            NOVAWAVEX
          </span>

          <h1>
            Secure access.
            <br />
            Simplified.
          </h1>

          <p>
            Reset your NovaWavex account
            password securely and continue
            managing your workflows.
          </p>

        </div>

      </div>


      {/* =====================================
          RIGHT / FORM AREA
          ===================================== */}

      <div className="reset-password-content">

        <div className="reset-password-container">

          {/* =================================
              HEADER
              ================================= */}

          <div className="reset-password-header">

            <div className="reset-password-icon">

              <KeyRound size={22} />

            </div>

            <span className="reset-password-eyebrow">
              ACCOUNT SECURITY
            </span>

            <h2>
              Reset Password
            </h2>

            <p>
              Create a new password for your
              NovaWavex account.
            </p>

          </div>


          {/* =================================
              SECURITY NOTICE
              ================================= */}

          <div className="reset-password-security">

            <ShieldCheck size={17} />

            <div>

              <strong>
                Secure password reset
              </strong>

              <span>
                Your reset link is temporary
                and can only be used once.
              </span>

            </div>

          </div>


          {/* =================================
              INVALID TOKEN
              ================================= */}

          {!resetToken && (

            <div className="reset-password-error">

              <span>
                This password reset link is
                invalid or incomplete.
              </span>

            </div>

          )}


          {/* =================================
              FORM
              ================================= */}

          {resetToken && (

            <form
              className="reset-password-form"
              onSubmit={handleSubmit}
            >

              {/* =============================
                  NEW PASSWORD
                  ============================= */}

              <div className="reset-password-field">

                <label htmlFor="newPassword">
                  New Password
                </label>

                <div className="reset-password-input-wrapper">

                  <LockKeyhole
                    size={17}
                    className="reset-password-input-icon"
                  />

                  <input
                    id="newPassword"
                    name="newPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.newPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="reset-password-visibility"
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

                <span className="reset-password-help">
                  Minimum 8 characters.
                </span>

              </div>


              {/* =============================
                  CONFIRM PASSWORD
                  ============================= */}

              <div className="reset-password-field">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="reset-password-input-wrapper">

                  <LockKeyhole
                    size={17}
                    className="reset-password-input-icon"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="reset-password-visibility"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >

                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}

                  </button>

                </div>

              </div>


              {/* =============================
                  ERROR
                  ============================= */}

              {error && (

                <div
                  className="reset-password-error"
                  role="alert"
                >

                  <span>
                    {error}
                  </span>

                </div>

              )}


              {/* =============================
                  SUCCESS
                  ============================= */}

              {success && (

                <div
                  className="reset-password-success"
                  role="status"
                >

                  <ShieldCheck
                    size={16}
                  />

                  <span>
                    {success}
                  </span>

                </div>

              )}


              {/* =============================
                  SUBMIT
                  ============================= */}

              <button
                type="submit"
                className="reset-password-submit"
                disabled={loading}
              >

                {loading
                  ? "Resetting Password..."
                  : "Reset Password"}

              </button>

            </form>

          )}


          {/* =================================
              FOOTER
              ================================= */}

          <div className="reset-password-footer">

            <span>
              Remember your password?
            </span>

            <Link to="/login">
              Back to Login
            </Link>

          </div>

        </div>

      </div>


      {/* =====================================
          PAGE STYLES
          ===================================== */}

      <style>{`

        /* =====================================
           PAGE
           ===================================== */

        .reset-password-page {
          min-height: 100vh;

          display: grid;
          grid-template-columns:
            minmax(320px, 0.85fr)
            minmax(420px, 1.15fr);

          background: #f7f9fc;

          color: #172033;
        }


        /* =====================================
           BRAND
           ===================================== */

        .reset-password-brand {
          position: relative;

          display: flex;
          align-items: center;

          padding: 56px;

          overflow: hidden;

          background:
            linear-gradient(
              145deg,
              #15233f 0%,
              #1d3157 52%,
              #29477b 100%
            );

          color: white;
        }


        .reset-password-brand::before {
          content: "";

          position: absolute;

          width: 360px;
          height: 360px;

          right: -150px;
          top: -120px;

          border-radius: 50%;

          background:
            rgba(112, 157, 255, 0.13);
        }


        .reset-password-brand::after {
          content: "";

          position: absolute;

          width: 280px;
          height: 280px;

          left: -130px;
          bottom: -110px;

          border-radius: 50%;

          background:
            rgba(112, 157, 255, 0.08);
        }


        .reset-password-brand-content {
          position: relative;

          z-index: 1;

          max-width: 430px;
        }


        .reset-password-brand-mark {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 26px;

          border:
            1px solid
            rgba(255, 255, 255, 0.18);

          border-radius: 13px;

          background:
            rgba(255, 255, 255, 0.08);

          font-size: 14px;
          font-weight: 800;

          letter-spacing: 0.08em;
        }


        .reset-password-brand-eyebrow {
          display: block;

          margin-bottom: 12px;

          color:
            rgba(255, 255, 255, 0.62);

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 0.18em;
        }


        .reset-password-brand h1 {
          margin: 0 0 18px;

          color: white;

          font-size: 38px;

          line-height: 1.12;

          font-weight: 760;

          letter-spacing: -0.035em;
        }


        .reset-password-brand-content > p {
          margin: 0;

          max-width: 380px;

          color:
            rgba(255, 255, 255, 0.68);

          font-size: 13px;

          line-height: 1.7;
        }


        /* =====================================
           CONTENT
           ===================================== */

        .reset-password-content {
          min-width: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 48px 64px;
        }


        .reset-password-container {
          width: 100%;

          max-width: 460px;
        }


        /* =====================================
           HEADER
           ===================================== */

        .reset-password-header {
          margin-bottom: 22px;
        }


        .reset-password-icon {
          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 17px;

          border-radius: 12px;

          color: #4f7df3;

          background: #edf3ff;

          box-shadow:
            0 5px 14px
            rgba(79, 125, 243, 0.10);
        }


        .reset-password-eyebrow {
          display: block;

          margin-bottom: 7px;

          color: #718096;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 0.15em;
        }


        .reset-password-header h2 {
          margin: 0 0 7px;

          color: #172033;

          font-size: 27px;

          font-weight: 760;

          letter-spacing: -0.025em;
        }


        .reset-password-header p {
          margin: 0;

          color: #68758a;

          font-size: 12px;

          line-height: 1.6;
        }


        /* =====================================
           SECURITY NOTICE
           ===================================== */

        .reset-password-security {
          display: flex;

          align-items: flex-start;

          gap: 10px;

          margin-bottom: 22px;

          padding: 12px 13px;

          border:
            1px solid #dce7fa;

          border-radius: 9px;

          background: #f4f8ff;

          color: #5573a9;
        }


        .reset-password-security svg {
          flex-shrink: 0;

          margin-top: 1px;
        }


        .reset-password-security div {
          display: flex;

          flex-direction: column;

          gap: 3px;
        }


        .reset-password-security strong {
          color: #3c5f9b;

          font-size: 11px;

          font-weight: 750;
        }


        .reset-password-security span {
          color: #7183a1;

          font-size: 10px;

          line-height: 1.45;
        }


        /* =====================================
           FORM
           ===================================== */

        .reset-password-form {
          display: flex;

          flex-direction: column;

          gap: 17px;
        }


        .reset-password-field {
          display: flex;

          flex-direction: column;

          gap: 7px;
        }


        .reset-password-field label {
          color: #344054;

          font-size: 11px;

          font-weight: 700;
        }


        .reset-password-input-wrapper {
          position: relative;

          display: flex;

          align-items: center;
        }


        .reset-password-input-wrapper input {
          width: 100%;

          min-height: 44px;

          box-sizing: border-box;

          padding:
            0 42px 0 41px;

          border:
            1px solid #dce2eb;

          border-radius: 9px;

          outline: none;

          color: #172033;

          background: white;

          font-size: 12px;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }


        .reset-password-input-wrapper input::placeholder {
          color: #a2acbb;
        }


        .reset-password-input-wrapper input:focus {
          border-color: #7e9fee;

          box-shadow:
            0 0 0 3px
            rgba(79, 125, 243, 0.10);
        }


        .reset-password-input-icon {
          position: absolute;

          left: 14px;

          color: #8a96a8;

          pointer-events: none;
        }


        .reset-password-visibility {
          position: absolute;

          right: 7px;

          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;

          border-radius: 7px;

          color: #7c8798;

          background: transparent;

          cursor: pointer;
        }


        .reset-password-visibility:hover {
          color: #4f7df3;

          background: #f2f5fb;
        }


        .reset-password-visibility:disabled {
          cursor: not-allowed;

          opacity: 0.55;
        }


        .reset-password-help {
          color: #8a96a8;

          font-size: 9px;
        }


        /* =====================================
           ERROR
           ===================================== */

        .reset-password-error {
          display: flex;

          align-items: center;

          min-height: 38px;

          box-sizing: border-box;

          padding: 8px 11px;

          border:
            1px solid #f1d5d5;

          border-radius: 8px;

          color: #b54747;

          background: #fff5f5;

          font-size: 10px;

          line-height: 1.45;
        }


        /* =====================================
           SUCCESS
           ===================================== */

        .reset-password-success {
          display: flex;

          align-items: center;

          gap: 8px;

          min-height: 38px;

          box-sizing: border-box;

          padding: 8px 11px;

          border:
            1px solid #d5efdf;

          border-radius: 8px;

          color: #18794e;

          background: #f0faf4;

          font-size: 10px;

          line-height: 1.45;
        }


        .reset-password-success svg {
          flex-shrink: 0;
        }


        /* =====================================
           SUBMIT
           ===================================== */

        .reset-password-submit {
          width: 100%;

          min-height: 44px;

          margin-top: 2px;

          border: 0;

          border-radius: 9px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #4f7df3,
              #648cf4
            );

          box-shadow:
            0 7px 17px
            rgba(79, 125, 243, 0.18);

          cursor: pointer;

          font-size: 11px;

          font-weight: 750;

          transition:
            transform 0.15s ease,
            box-shadow 0.18s ease,
            opacity 0.18s ease;
        }


        .reset-password-submit:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 9px 20px
            rgba(79, 125, 243, 0.24);
        }


        .reset-password-submit:disabled {
          cursor: not-allowed;

          opacity: 0.65;
        }


        /* =====================================
           FOOTER
           ===================================== */

        .reset-password-footer {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 5px;

          margin-top: 24px;

          color: #7b8798;

          font-size: 10px;
        }


        .reset-password-footer a {
          color: #4f7df3;

          font-weight: 750;

          text-decoration: none;
        }


        .reset-password-footer a:hover {
          text-decoration: underline;
        }


        /* =====================================
           RESPONSIVE
           ===================================== */

        @media (max-width: 850px) {

          .reset-password-page {
            grid-template-columns: 1fr;
          }


          .reset-password-brand {
            min-height: 260px;

            padding: 38px 32px;
          }


          .reset-password-brand h1 {
            font-size: 30px;
          }


          .reset-password-content {
            padding: 42px 32px;
          }

        }


        @media (max-width: 500px) {

          .reset-password-brand {
            min-height: 220px;

            padding: 30px 24px;
          }


          .reset-password-brand-mark {
            width: 42px;
            height: 42px;

            margin-bottom: 18px;
          }


          .reset-password-brand h1 {
            font-size: 27px;
          }


          .reset-password-brand-content > p {
            font-size: 11px;
          }


          .reset-password-content {
            padding:
              34px 20px;
          }


          .reset-password-header h2 {
            font-size: 24px;
          }

        }

      `}</style>

    </div>
  );
};

export default ResetPassword;