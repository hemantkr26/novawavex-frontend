import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Workflow as WorkflowIcon,
} from "lucide-react";
import workflowService from "../services/workflowService";

const CreateWorkflow = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "DRAFT",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError("Workflow name is required.");
      return;
    }

    if (name.length < 3) {
      setError(
        "Workflow name must contain at least 3 characters."
      );
      return;
    }

    if (name.length > 100) {
      setError(
        "Workflow name must not exceed 100 characters."
      );
      return;
    }

    if (description.length > 500) {
      setError(
        "Description must not exceed 500 characters."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const createdWorkflow =
        await workflowService.createWorkflow({
          name,
          description,
          status: formData.status,
        });

      console.log(
        "Workflow created successfully:",
        createdWorkflow
      );

      setSuccess("Workflow created successfully.");

      setTimeout(() => {
        navigate("/workflows");
      }, 700);
    } catch (err) {
      console.error(
        "Failed to create workflow:",
        err
      );

      const status = err.response?.status;

      if (status === 400) {
        setError(
          err.response?.data?.message ||
            "Invalid workflow data. Please check the form."
        );
      } else if (status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (status === 403) {
        setError(
          "You are not authorized to create workflows."
        );
      } else if (status === 404) {
        setError(
          "The workflow service could not be found."
        );
      } else if (status >= 500) {
        setError(
          "The workflow service is temporarily unavailable. Please try again."
        );
      } else if (err.request && !err.response) {
        setError(
          "Unable to reach the workflow service. Check your connection and try again."
        );
      } else {
        setError(
          "Unable to create workflow. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`create-workflow-page ${
        loading ? "is-submitting" : ""
      }`}
    >
      <style>{`
        .create-workflow-page {
          min-height: 100vh;
          padding: 32px;
          color: #e8eefc;
          background:
            radial-gradient(
              circle at top right,
              rgba(77, 124, 255, 0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(0, 212, 170, 0.08),
              transparent 30%
            ),
            #070b14;
        }

        .create-workflow-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .create-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .back-button {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 11px;
          color: #aebbd3;
          background: rgba(255, 255, 255, 0.035);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .back-button:hover:not(:disabled) {
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(77, 124, 255, 0.3);
          transform: translateX(-2px);
        }

        .back-button:focus-visible,
        .cancel-button:focus-visible,
        .submit-button:focus-visible {
          outline: 2px solid rgba(77, 124, 255, 0.8);
          outline-offset: 3px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: #a8c0ff;
          background: rgba(77, 124, 255, 0.12);
          border: 1px solid rgba(77, 124, 255, 0.25);
        }

        .create-header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .create-header p {
          margin: 5px 0 0;
          color: #8490a8;
          font-size: 14px;
        }

        .workflow-form-card {
          position: relative;
          overflow: hidden;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.055),
              rgba(255, 255, 255, 0.018)
            );
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(12px);
        }

        .workflow-form-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 45%;
          height: 100%;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.035),
            transparent
          );
          transform: skewX(-18deg);
          opacity: 0;
        }

        .create-workflow-page.is-submitting
          .workflow-form-card::after {
          opacity: 1;
          animation: form-submit-shimmer 1.8s ease-in-out
            infinite;
        }

        .form-section {
          margin-bottom: 28px;
        }

        .form-section:last-of-type {
          margin-bottom: 0;
        }

        .section-heading {
          margin-bottom: 18px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 650;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: #69758c;
          font-size: 12px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #cdd7eb;
          font-size: 13px;
          font-weight: 600;
        }

        .required {
          color: #ff7e8c;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 11px;
          outline: none;
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.035);
          font-size: 14px;
          transition: 0.2s ease;
        }

        .form-input,
        .form-select {
          height: 46px;
          padding: 0 14px;
        }

        .form-textarea {
          min-height: 130px;
          padding: 13px 14px;
          resize: vertical;
          line-height: 1.6;
          font-family: inherit;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #5f6b81;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          border-color: rgba(77, 124, 255, 0.55);
          background: rgba(255, 255, 255, 0.05);
          box-shadow:
            0 0 0 3px rgba(77, 124, 255, 0.08);
        }

        .form-input:disabled,
        .form-textarea:disabled,
        .form-select:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .form-select option {
          color: #111827;
          background: #ffffff;
        }

        .field-hint {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 6px;
          color: #5f6b81;
          font-size: 11px;
        }

        .alert {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 22px;
          padding: 14px 15px;
          border-radius: 11px;
          font-size: 13px;
          line-height: 1.5;
        }

        .alert.error {
          color: #ffb0b8;
          background:
            linear-gradient(
              135deg,
              rgba(255, 77, 96, 0.1),
              rgba(255, 77, 96, 0.055)
            );
          border: 1px solid rgba(255, 77, 96, 0.25);
          box-shadow:
            0 8px 24px rgba(255, 77, 96, 0.05);
          animation: alert-enter 0.25s ease-out;
        }

        .alert.error::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
          width: 2px;
          border-radius: 2px;
          background: rgba(255, 126, 140, 0.8);
        }

        .alert.success {
          color: #8df0d4;
          background:
            linear-gradient(
              135deg,
              rgba(0, 212, 170, 0.1),
              rgba(0, 212, 170, 0.055)
            );
          border: 1px solid rgba(0, 212, 170, 0.2);
          box-shadow:
            0 8px 24px rgba(0, 212, 170, 0.04);
          animation: success-enter 0.3s ease-out;
        }

        .success-icon {
          flex-shrink: 0;
          animation: success-pop 0.35s ease-out;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 30px;
          padding-top: 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .cancel-button,
        .submit-button {
          min-width: 130px;
          height: 44px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .cancel-button {
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #aebbd3;
          background: rgba(255, 255, 255, 0.035);
        }

        .cancel-button:hover:not(:disabled) {
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.07);
          transform: translateY(-1px);
        }

        .submit-button {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(77, 124, 255, 0.4);
          color: #ffffff;
          background: rgba(77, 124, 255, 0.8);
          box-shadow:
            0 8px 20px rgba(77, 124, 255, 0.15);
        }

        .submit-button:hover:not(:disabled) {
          background: rgba(77, 124, 255, 0.95);
          transform: translateY(-1px);
        }

        .submit-button.is-loading {
          cursor: wait;
          background: rgba(77, 124, 255, 0.68);
        }

        .submit-button.is-loading::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          transform-origin: left;
          background: rgba(255, 255, 255, 0.7);
          animation: submit-progress 1.4s ease-in-out
            infinite;
        }

        .submit-button-content {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cancel-button:disabled,
        .submit-button:disabled,
        .back-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .submit-button.is-loading:disabled {
          opacity: 0.9;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes submit-progress {
          0% {
            transform: scaleX(0.08);
            opacity: 0.35;
          }

          45% {
            transform: scaleX(0.55);
            opacity: 0.8;
          }

          100% {
            transform: scaleX(0.95);
            opacity: 0.35;
          }
        }

        @keyframes form-submit-shimmer {
          0% {
            left: -120%;
          }

          100% {
            left: 150%;
          }
        }

        @keyframes success-enter {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes success-pop {
          0% {
            opacity: 0;
            transform: scale(0.7);
          }

          70% {
            transform: scale(1.08);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes alert-enter {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .workflow-form-card::after,
          .submit-button.is-loading::before,
          .spin,
          .alert,
          .success-icon {
            animation: none !important;
          }

          .submit-button:hover:not(:disabled),
          .cancel-button:hover:not(:disabled),
          .back-button:hover:not(:disabled) {
            transform: none;
          }
        }

        @media (max-width: 650px) {
          .create-workflow-page {
            padding: 20px;
          }

          .create-header {
            align-items: flex-start;
          }

          .create-header h1 {
            font-size: 25px;
          }

          .workflow-form-card {
            padding: 20px;
          }

          .form-footer {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .submit-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="create-workflow-container">
        <header className="create-header">
          <div className="header-left">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/workflows")}
              disabled={loading}
              aria-label="Back to workflows"
              title="Back to workflows"
            >
              <ArrowLeft
                size={18}
                aria-hidden="true"
              />
            </button>

            <div
              className="header-icon"
              aria-hidden="true"
            >
              <WorkflowIcon size={25} />
            </div>

            <div>
              <h1>Create Workflow</h1>

              <p>
                Create a new workflow in the NovaWavex
                workflow engine.
              </p>
            </div>
          </div>
        </header>

        <form
          className="workflow-form-card"
          onSubmit={handleSubmit}
          aria-busy={loading}
          noValidate
        >
          {error && (
            <div
              className="alert error"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle
                size={18}
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              />

              <div>{error}</div>
            </div>
          )}

          {success && (
            <div
              className="alert success"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2
                size={18}
                className="success-icon"
                aria-hidden="true"
              />

              <div>{success}</div>
            </div>
          )}

          {loading && (
            <div
              className="sr-only"
              role="status"
              aria-live="polite"
            >
              Creating workflow. Please wait.
            </div>
          )}

          <section className="form-section">
            <div className="section-heading">
              <h2>Workflow Information</h2>

              <p>
                Define the basic information for your
                workflow.
              </p>
            </div>

            <div className="form-group">
              <label
                htmlFor="workflow-name"
                className="form-label"
              >
                Workflow Name{" "}
                <span className="required">*</span>
              </label>

              <input
                id="workflow-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Employee Onboarding"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                autoComplete="off"
                aria-required="true"
                aria-invalid={
                  Boolean(error) &&
                  !formData.name.trim()
                }
              />

              <div className="field-hint">
                <span>
                  Give your workflow a clear name.
                </span>

                <span>
                  {formData.name.length}/100
                </span>
              </div>
            </div>

            <div className="form-group">
              <label
                htmlFor="workflow-description"
                className="form-label"
              >
                Description
              </label>

              <textarea
                id="workflow-description"
                name="description"
                className="form-textarea"
                placeholder="Describe what this workflow is used for..."
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
                disabled={loading}
              />

              <div className="field-hint">
                <span>
                  Optional workflow description.
                </span>

                <span>
                  {formData.description.length}/500
                </span>
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <h2>Workflow Status</h2>

              <p>
                Choose the initial status of the workflow.
              </p>
            </div>

            <div className="form-group">
              <label
                htmlFor="workflow-status"
                className="form-label"
              >
                Status
              </label>

              <select
                id="workflow-status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">
                  Completed
                </option>
                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>
          </section>

          <div className="form-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/workflows")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`submit-button ${
                loading ? "is-loading" : ""
              }`}
              disabled={loading}
              aria-busy={loading}
            >
              <span className="submit-button-content">
                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      className="spin"
                      aria-hidden="true"
                    />

                    Creating...
                  </>
                ) : (
                  <>
                    <Save
                      size={16}
                      aria-hidden="true"
                    />

                    Create Workflow
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkflow;