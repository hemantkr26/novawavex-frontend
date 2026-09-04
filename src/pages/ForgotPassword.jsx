import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  Send,
} from "lucide-react";

import authService from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [resetLink, setResetLink] = useState("");

  const [loading, setLoading] = useState(false);


  // =========================================
  // HANDLE EMAIL CHANGE
  // =========================================

  const handleChange = (event) => {
    setEmail(event.target.value);

    setError("");

    setSuccess("");

    setResetLink("");
  };


  // =========================================
  // HANDLE FORGOT PASSWORD
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccess("");

    setResetLink("");

    const normalizedEmail =
      email.trim().toLowerCase();


    // =======================================
    // FRONTEND VALIDATION
    // =======================================

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(normalizedEmail)) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }


    setLoading(true);


    try {

      const response =
        await authService.forgotPassword(
          normalizedEmail
        );


      // =====================================
      // SUCCESS MESSAGE
      // =====================================

      setSuccess(
        response?.message ||
        "If an account exists with this email, password reset instructions have been generated."
      );


      // =====================================
      // DEVELOPMENT RESET LINK
      // =====================================
      //
      // The backend currently returns the
      // reset link directly for development
      // and end-to-end testing.
      //

      if (response?.resetLink) {

        setResetLink(
          response.resetLink
        );

      }


      setEmail("");

    } catch (error) {

      console.error(
        "Forgot password request failed:",
        error
      );


      if (
        error.response?.status === 400
      ) {

        setError(
          error.response?.data?.message ||
          "Please enter a valid email address."
        );

      } else if (
        error.response?.status === 404
      ) {

        setError(
          error.response?.data?.message ||
          "Unable to process the password reset request."
        );

      } else {

        setError(
          "Unable to connect to the server. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="forgot-password-page">

      {/* =====================================
          CARD
          ===================================== */}

      <div className="forgot-password-card">


        {/* ===================================
            BRAND
            =================================== */}

        <div className="forgot-password-brand">

          <div className="forgot-password-brand-mark">
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

        <div className="forgot-password-header">

          <div className="forgot-password-icon">
            <KeyRound size={21} />
          </div>


          <span className="forgot-password-eyebrow">
            ACCOUNT RECOVERY
          </span>


          <h2>
            Forgot Password?
          </h2>


          <p>
            Enter your registered email address
            and we'll help you reset your
            NovaWavex password.
          </p>

        </div>


        {/* ===================================
            SUCCESS STATE
            =================================== */}

        {success ? (

          <div className="forgot-password-success-wrapper">


            <div className="forgot-password-success-icon">
              <CheckCircle2 size={22} />
            </div>


            <div className="forgot-password-success">

              <strong>
                Request received
              </strong>


              <span>
                {success}
              </span>

            </div>


            {/* =================================
                RESET LINK
                ================================= */}

            {resetLink && (

              <div className="forgot-password-reset-link-box">

                <div className="forgot-password-reset-link-header">

                  <KeyRound size={14} />

                  <span>
                    Development Reset Link
                  </span>

                </div>


                <p>
                  Use this link to continue
                  directly to the password
                  reset page.
                </p>


                <a
                  href={resetLink}
                  className="forgot-password-reset-link"
                >
                  Open Reset Password
                </a>

              </div>

            )}


            {/* =================================
                BACK TO LOGIN
                ================================= */}

            <Link
              to="/login"
              className="forgot-password-back-button"
            >

              <ArrowLeft size={15} />

              <span>
                Back to Login
              </span>

            </Link>

          </div>

        ) : (

          /* =================================
             FORM
             ================================= */

          <form
            onSubmit={handleSubmit}
            className="forgot-password-form"
          >

            {/* EMAIL */}

            <div className="forgot-password-field">

              <label
                htmlFor="forgot-password-email"
              >
                Email
              </label>


              <div className="forgot-password-input-wrapper">

                <Mail
                  size={16}
                  className="forgot-password-input-icon"
                />


                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div
                className="forgot-password-error"
                role="alert"
              >
                {error}
              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="forgot-password-submit"
              disabled={loading}
            >

              {loading ? (

                <span>
                  Sending...
                </span>

              ) : (

                <>
                  <Send size={16} />

                  <span>
                    Send Reset Instructions
                  </span>
                </>

              )}

            </button>

          </form>

        )}


        {/* ===================================
            BACK TO LOGIN
            =================================== */}

        {!success && (

          <div className="forgot-password-login">

            <Link
              to="/login"
              className="forgot-password-login-link"
            >

              <ArrowLeft size={14} />

              <span>
                Back to Login
              </span>

            </Link>

          </div>

        )}


        {/* ===================================
            SECURITY INFORMATION
            =================================== */}

        <div className="forgot-password-security">

          <KeyRound size={13} />

          <span>
            Password recovery is secured by
            NovaWavex authentication.
          </span>

        </div>

      </div>


      {/* =====================================
          PAGE STYLES
          ===================================== */}

      <style>{`

        /* =====================================
           PAGE
           ===================================== */

        .forgot-password-page {

          min-height: 100vh;

          width: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          box-sizing: border-box;

          padding: 32px 20px;

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

        .forgot-password-card {

          width: 100%;

          max-width: 430px;

          padding:
            34px 36px 28px;

          box-sizing: border-box;

          border:
            1px solid #e3e8f0;

          border-radius: 16px;

          background: #ffffff;

          box-shadow:
            0 18px 45px
            rgba(
              31,
              45,
              70,
              0.10
            );
        }


        /* =====================================
           BRAND
           ===================================== */

        .forgot-password-brand {

          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 30px;
        }


        .forgot-password-brand-mark {

          width: 40px;

          height: 40px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          border-radius: 10px;

          color: #ffffff;

          background: #4f7df3;

          font-size: 12px;

          font-weight: 800;

          letter-spacing: 0.4px;
        }


        .forgot-password-brand h1 {

          margin: 0;

          color: #172033;

          font-size: 17px;

          font-weight: 800;
        }


        .forgot-password-brand p {

          margin: 3px 0 0;

          color: #7a8699;

          font-size: 10px;
        }


        /* =====================================
           HEADER
           ===================================== */

        .forgot-password-header {

          margin-bottom: 25px;
        }


        .forgot-password-icon {

          width: 42px;

          height: 42px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 13px;

          border-radius: 11px;

          color: #4f7df3;

          background: #eef4ff;
        }


        .forgot-password-eyebrow {

          display: block;

          margin-bottom: 7px;

          color: #6489ed;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.4px;
        }


        .forgot-password-header h2 {

          margin: 0;

          color: #172033;

          font-size: 25px;

          font-weight: 800;
        }


        .forgot-password-header p {

          margin: 7px 0 0;

          color: #68758a;

          font-size: 12px;

          line-height: 1.6;
        }


        /* =====================================
           FORM
           ===================================== */

        .forgot-password-form {

          display: flex;

          flex-direction: column;

          gap: 17px;
        }


        .forgot-password-field {

          display: flex;

          flex-direction: column;

          gap: 7px;
        }


        .forgot-password-field label {

          color: #25324a;

          font-size: 11px;

          font-weight: 700;
        }


        /* =====================================
           INPUT
           ===================================== */

        .forgot-password-input-wrapper {

          position: relative;

          width: 100%;
        }


        .forgot-password-input-icon {

          position: absolute;

          top: 50%;

          left: 12px;

          transform:
            translateY(-50%);

          color: #8995a8;

          pointer-events: none;
        }


        .forgot-password-input-wrapper input {

          width: 100%;

          min-height: 43px;

          padding:
            0 12px 0 38px;

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


        .forgot-password-input-wrapper
        input::placeholder {

          color: #9aa5b5;
        }


        .forgot-password-input-wrapper
        input:focus {

          border-color: #7d9df0;

          box-shadow:
            0 0 0 3px
            rgba(
              79,
              125,
              243,
              0.10
            );
        }


        .forgot-password-input-wrapper
        input:disabled {

          cursor: not-allowed;

          background: #f7f8fa;
        }


        /* =====================================
           ERROR
           ===================================== */

        .forgot-password-error {

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
           SUBMIT BUTTON
           ===================================== */

        .forgot-password-submit {

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


        .forgot-password-submit:hover:not(:disabled) {

          background: #416fe5;

          transform:
            translateY(-1px);

          box-shadow:
            0 6px 14px
            rgba(
              79,
              125,
              243,
              0.20
            );
        }


        .forgot-password-submit:disabled {

          opacity: 0.65;

          cursor: not-allowed;
        }


        /* =====================================
           SUCCESS
           ===================================== */

        .forgot-password-success-wrapper {

          display: flex;

          flex-direction: column;

          align-items: center;

          text-align: center;
        }


        .forgot-password-success-icon {

          width: 48px;

          height: 48px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 13px;

          border-radius: 50%;

          color: #15965a;

          background: #eaf9f1;
        }


        .forgot-password-success {

          display: flex;

          flex-direction: column;

          gap: 7px;

          margin-bottom: 20px;
        }


        .forgot-password-success strong {

          color: #172033;

          font-size: 14px;

          font-weight: 750;
        }


        .forgot-password-success span {

          color: #68758a;

          font-size: 11px;

          line-height: 1.6;
        }


        /* =====================================
           RESET LINK BOX
           ===================================== */

        .forgot-password-reset-link-box {

          width: 100%;

          box-sizing: border-box;

          margin-bottom: 18px;

          padding: 13px;

          border:
            1px solid #dce5f5;

          border-radius: 9px;

          background: #f7f9fe;

          text-align: left;
        }


        .forgot-password-reset-link-header {

          display: flex;

          align-items: center;

          gap: 6px;

          margin-bottom: 6px;

          color: #4f7df3;

          font-size: 10px;

          font-weight: 800;
        }


        .forgot-password-reset-link-header svg {

          flex-shrink: 0;
        }


        .forgot-password-reset-link-box p {

          margin: 0 0 10px;

          color: #68758a;

          font-size: 10px;

          line-height: 1.5;
        }


        .forgot-password-reset-link {

          width: 100%;

          min-height: 34px;

          display: flex;

          align-items: center;

          justify-content: center;

          box-sizing: border-box;

          border-radius: 7px;

          color: #ffffff;

          background: #4f7df3;

          font-size: 10px;

          font-weight: 750;

          text-decoration: none;

          transition:
            background 0.18s ease,
            transform 0.15s ease;
        }


        .forgot-password-reset-link:hover {

          background: #416fe5;

          transform:
            translateY(-1px);
        }


        /* =====================================
           BACK TO LOGIN
           ===================================== */

        .forgot-password-login {

          display: flex;

          align-items: center;

          justify-content: center;

          margin-top: 21px;
        }


        .forgot-password-login-link {

          display: inline-flex;

          align-items: center;

          gap: 5px;

          color: #4f7df3;

          font-size: 11px;

          font-weight: 750;

          text-decoration: none;
        }


        .forgot-password-login-link:hover {

          text-decoration: underline;
        }


        .forgot-password-back-button {

          min-height: 36px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          padding: 0 13px;

          box-sizing: border-box;

          border:
            1px solid #dce5f5;

          border-radius: 7px;

          color: #4f7df3;

          background: #f4f7fd;

          font-size: 10px;

          font-weight: 750;

          text-decoration: none;

          transition:
            background 0.18s ease,
            border-color 0.18s ease;
        }


        .forgot-password-back-button:hover {

          background: #edf3ff;

          border-color: #cbd9f5;
        }


        /* =====================================
           SECURITY
           ===================================== */

        .forgot-password-security {

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

          line-height: 1.4;

          text-align: center;
        }


        .forgot-password-security svg {

          flex-shrink: 0;

          color: #6489ed;
        }


        /* =====================================
           RESPONSIVE
           ===================================== */

        @media (max-width: 480px) {

          .forgot-password-page {

            padding:
              20px 14px;
          }


          .forgot-password-card {

            padding:
              28px 22px 24px;

            border-radius: 13px;
          }


          .forgot-password-brand {

            margin-bottom: 25px;
          }


          .forgot-password-header h2 {

            font-size: 22px;
          }

        }

      `}</style>

    </div>
  );
};


export default ForgotPassword;