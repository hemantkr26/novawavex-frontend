import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ImagePlus, UserPlus } from "lucide-react";
import authService from "../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
  });

  const [imagePreview, setImagePreview] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

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
    setSuccess("");
  };


  // =========================================
  // HANDLE PROFILE IMAGE
  // =========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    // -----------------------------------------
    // IMAGE TYPE VALIDATION
    // -----------------------------------------

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }


    // -----------------------------------------
    // IMAGE SIZE VALIDATION
    // -----------------------------------------

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile image must be smaller than 2 MB.");
      return;
    }


    // -----------------------------------------
    // READ IMAGE
    // -----------------------------------------

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageData = reader.result;

      setFormData((previous) => ({
        ...previous,
        profileImage: imageData,
      }));

      setImagePreview(imageData);
    };

    reader.readAsDataURL(file);
  };


  // =========================================
  // HANDLE SUBMIT
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");


    // -----------------------------------------
    // FULL NAME
    // -----------------------------------------

    if (!formData.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (formData.fullName.trim().length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }


    // -----------------------------------------
    // EMAIL
    // -----------------------------------------

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }


    // -----------------------------------------
    // PASSWORD
    // -----------------------------------------

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }


    // -----------------------------------------
    // CONFIRM PASSWORD
    // -----------------------------------------

    if (!formData.confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }


    setLoading(true);

    try {
      await authService.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        profileImage: formData.profileImage || null,
      });

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      if (error.response?.status === 409) {
        setError(
          "An account with this email already exists."
        );
      } else if (
        error.response?.status === 400
      ) {
        setError(
          error.response?.data?.message ||
          "Please check the registration details."
        );
      } else {
        setError(
          error.response?.data?.message ||
          "Unable to create the account. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="register-page">

      {/* =======================================
          REGISTER CARD
          ======================================= */}

      <div className="register-card">

        {/* =====================================
            HEADER
            ===================================== */}

        <div className="register-header">

          <div className="register-logo">
            NovaWavex
          </div>

          <div className="register-eyebrow">
            ACCOUNT
          </div>

          <h1>
            Create Account
          </h1>

          <p>
            Create your NovaWavex account to
            get started.
          </p>

        </div>


        {/* =====================================
            PROFILE IMAGE
            ===================================== */}

        <div className="register-image-section">

          <label
            htmlFor="profileImage"
            className="register-image-upload"
          >

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile preview"
                className="register-image-preview"
              />
            ) : (
              <div className="register-image-placeholder">

                <ImagePlus size={25} />

                <span>
                  Add Photo
                </span>

              </div>
            )}

          </label>

          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />

          <span className="register-image-help">
            Optional · JPG, PNG or WebP · Max 2 MB
          </span>

        </div>


        {/* =====================================
            FORM
            ===================================== */}

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          {/* FULL NAME */}

          <div className="register-field">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />

          </div>


          {/* EMAIL */}

          <div className="register-field">

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
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="register-field">

            <label htmlFor="password">
              Password
            </label>

            <div className="register-password-wrapper">

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
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

            <span className="register-field-help">
              Minimum 8 characters
            </span>

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="register-field">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="register-password-wrapper">

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
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
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
              className="register-message register-error"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div
              className="register-message register-success"
              role="status"
            >
              {success}
            </div>
          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >

            <UserPlus size={17} />

            <span>
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </span>

          </button>

        </form>


        {/* =====================================
            LOGIN LINK
            ===================================== */}

        <div className="register-login">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Sign in
          </Link>

        </div>

      </div>


      {/* =======================================
          STYLES
          ======================================= */}

      <style>{`

        .register-page {
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


        .register-card {
          width: 100%;
          max-width: 470px;

          padding: 34px;

          box-sizing: border-box;

          border:
            1px solid #e4e9f1;

          border-radius: 18px;

          background: #ffffff;

          box-shadow:
            0 18px 50px
            rgba(31, 48, 80, 0.09);
        }


        .register-header {
          text-align: center;

          margin-bottom: 24px;
        }


        .register-logo {
          color: #4f7df3;

          font-size: 18px;
          font-weight: 800;

          letter-spacing: -0.3px;

          margin-bottom: 18px;
        }


        .register-eyebrow {
          color: #6f7c91;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1.5px;

          margin-bottom: 7px;
        }


        .register-header h1 {
          margin: 0;

          color: #172033;

          font-size: 26px;
          font-weight: 800;

          letter-spacing: -0.5px;
        }


        .register-header p {
          margin: 8px 0 0;

          color: #68758a;

          font-size: 12px;

          line-height: 1.5;
        }


        .register-image-section {
          display: flex;
          flex-direction: column;
          align-items: center;

          margin-bottom: 24px;
        }


        .register-image-upload {
          width: 82px;
          height: 82px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px dashed #cbd6e8;

          border-radius: 50%;

          background: #f7f9fd;

          cursor: pointer;

          overflow: hidden;

          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            transform 0.18s ease;
        }


        .register-image-upload:hover {
          border-color: #7e9eef;

          background: #f1f5ff;

          transform: translateY(-1px);
        }


        .register-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 4px;

          color: #6c86c9;

          font-size: 9px;
          font-weight: 700;
        }


        .register-image-preview {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }


        .register-image-help {
          margin-top: 8px;

          color: #8994a7;

          font-size: 9px;

          text-align: center;
        }


        .register-form {
          display: flex;
          flex-direction: column;

          gap: 16px;
        }


        .register-field {
          display: flex;
          flex-direction: column;

          gap: 6px;
        }


        .register-field label {
          color: #25324a;

          font-size: 11px;
          font-weight: 750;
        }


        .register-field input {
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


        .register-field input::placeholder {
          color: #a0a9b8;
        }


        .register-field input:focus {
          border-color: #7192ed;

          box-shadow:
            0 0 0 3px
            rgba(79, 125, 243, 0.10);
        }


        .register-password-wrapper {
          position: relative;
        }


        .register-password-wrapper input {
          padding-right: 42px;
        }


        .register-password-toggle {
          position: absolute;

          top: 50%;
          right: 10px;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 28px;
          height: 28px;

          padding: 0;

          transform:
            translateY(-50%);

          border: 0;

          border-radius: 6px;

          color: #78869b;

          background: transparent;

          cursor: pointer;
        }


        .register-password-toggle:hover {
          color: #4f7df3;

          background: #f1f5ff;
        }


        .register-field-help {
          color: #8b96a8;

          font-size: 9px;
        }


        .register-message {
          padding: 10px 12px;

          border-radius: 8px;

          font-size: 10px;

          line-height: 1.45;
        }


        .register-error {
          color: #b54646;

          background: #fff2f2;

          border:
            1px solid #f3d7d7;
        }


        .register-success {
          color: #18794e;

          background: #edf9f3;

          border:
            1px solid #d5efdf;
        }


        .register-submit {
          width: 100%;

          min-height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

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
            opacity 0.18s ease;
        }


        .register-submit:hover:not(:disabled) {
          background: #416edc;

          transform: translateY(-1px);
        }


        .register-submit:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }


        .register-login {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 5px;

          margin-top: 22px;

          color: #7b8799;

          font-size: 10px;
        }


        .register-login a {
          color: #4f7df3;

          font-weight: 750;

          text-decoration: none;
        }


        .register-login a:hover {
          text-decoration: underline;
        }


        @media (max-width: 520px) {

          .register-page {
            padding: 20px 14px;
          }


          .register-card {
            padding: 26px 20px;
          }

        }

      `}</style>

    </div>
  );
};

export default Register;