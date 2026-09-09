import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  X,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import workflowService from "../services/workflowService";

const EditWorkflow = ({ workflow, onUpdated, onCancel }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "DRAFT",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!workflow) {
      return;
    }

    setFormData({
      name: workflow.name || "",
      description: workflow.description || "",
      status: workflow.status || "DRAFT",
    });

    setError("");
    setSuccess(false);
  }, [workflow]);

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
      setSuccess(false);
    }
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError("Workflow name is required.");
      return false;
    }

    if (name.length < 3) {
      setError(
        "Workflow name must contain at least 3 characters."
      );
      return false;
    }

    if (name.length > 100) {
      setError(
        "Workflow name must not exceed 100 characters."
      );
      return false;
    }

    if (description.length > 500) {
      setError(
        "Description must not exceed 500 characters."
      );
      return false;
    }

    return true;
  };

  const getUpdateErrorMessage = (err, isRetry = false) => {
    const status = err.response?.status;

    if (status === 400) {
      return (
        err.response?.data?.message ||
        "Invalid workflow data. Please check the form."
      );
    }

    if (status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (status === 403) {
      return "You are not authorized to update this workflow.";
    }

    if (status === 404) {
      return "The requested workflow was not found.";
    }

    if (status >= 500) {
      return isRetry
        ? "The workflow service is still unavailable. Please try again."
        : "The workflow service is temporarily unavailable. Please try again.";
    }

    if (err.request && !err.response) {
      return isRetry
        ? "The workflow service could not be reached. Check your connection and try again."
        : "Unable to reach the workflow service. Check your connection and try again.";
    }

    return isRetry
      ? "The update could not be completed. Please try again."
      : "Unable to update workflow. Please try again.";
  };

  const updateWorkflow = async (isRetry = false) => {
    if (saving) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const name = formData.name.trim();
    const description = formData.description.trim();

    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      const updatedWorkflow =
        await workflowService.updateWorkflow(workflow.id, {
          name,
          description,
          status: formData.status,
        });

      console.log(
        isRetry
          ? "Workflow updated successfully after retry:"
          : "Workflow updated successfully:",
        updatedWorkflow
      );

      setSuccess(true);

      if (onUpdated) {
        setTimeout(() => {
          onUpdated(updatedWorkflow);
        }, 550);
      } else {
        setTimeout(() => {
          navigate(`/workflows/${workflow.id}`);
        }, 550);
      }
    } catch (err) {
      console.error(
        isRetry
          ? "Retry failed while updating workflow:"
          : "Failed to update workflow:",
        err
      );

      setError(getUpdateErrorMessage(err, isRetry));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    await updateWorkflow(false);
  };

  const handleRetry = async () => {
    if (saving) {
      return;
    }

    await updateWorkflow(true);
  };

  const handleCancel = () => {
    if (saving) {
      return;
    }

    if (onCancel) {
      onCancel();
      return;
    }

    navigate(`/workflows/${workflow.id}`);
  };

  if (!workflow) {
    return null;
  }

  const nameInvalid =
    Boolean(error) &&
    formData.name.trim().length === 0;

  return (
    <div
      className={`edit-workflow-page ${
        saving ? "is-saving" : ""
      } ${success ? "is-success" : ""}`}
    >
      <style>{`
        .edit-workflow-page {
          min-height: 100vh;
          padding: 32px;
          box-sizing: border-box;
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

        .edit-workflow-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }

        .edit-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #dce5f8;
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: 0.2s ease;
          font-family: inherit;
          font-size: 13px;
        }

        .back-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(77, 124, 255, 0.35);
          transform: translateX(-2px);
        }

        .page-context {
          color: #69758c;
          font-size: 12px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .edit-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(77, 124, 255, 0.12),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.055),
              rgba(255, 255, 255, 0.018)
            );
          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.2);
        }

        .edit-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 42%;
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

        .edit-workflow-page.is-saving
          .edit-card::after {
          opacity: 1;
          animation: save-shimmer 1.7s ease-in-out
            infinite;
        }

        .edit-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .header-content {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          min-width: 0;
        }

        .header-icon {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: #9bb9ff;
          background: rgba(77, 124, 255, 0.12);
          border: 1px solid rgba(77, 124, 255, 0.25);
          transition: 0.25s ease;
        }

        .edit-workflow-page.is-saving
          .header-icon {
          animation: header-icon-pulse 1.5s ease-in-out
            infinite;
        }

        .edit-workflow-page.is-success
          .header-icon {
          color: #8df0d4;
          background: rgba(0, 212, 170, 0.1);
          border-color: rgba(0, 212, 170, 0.22);
        }

        .header-content h1 {
          margin: 0;
          color: #f0f4ff;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: -0.4px;
        }

        .header-content p {
          margin: 7px 0 0;
          color: #7f8ba3;
          font-size: 13px;
          line-height: 1.5;
        }

        .workflow-meta {
          margin-top: 8px;
          color: #69758c;
          font-size: 12px;
        }

        .close-button {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          color: #9ba7bc;
          background: rgba(255, 255, 255, 0.035);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .close-button:hover:not(:disabled) {
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.13);
        }

        .edit-body {
          position: relative;
          padding: 30px;
        }

        .alert {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 20px;
          padding: 14px 15px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .alert-error {
          color: #ffb0b8;
          background:
            linear-gradient(
              135deg,
              rgba(255, 77, 96, 0.1),
              rgba(255, 77, 96, 0.055)
            );
          border: 1px solid rgba(255, 77, 96, 0.24);
          box-shadow:
            0 8px 24px rgba(255, 77, 96, 0.05);
          animation: alert-enter 0.25s ease-out;
        }

        .alert-error::before {
          content: "";
          position: absolute;
          left: 0;
          top: 9px;
          bottom: 9px;
          width: 2px;
          border-radius: 2px;
          background: rgba(255, 126, 140, 0.85);
        }

        .alert-error::after {
          content: "";
          position: absolute;
          top: -32px;
          right: -32px;
          width: 90px;
          height: 90px;
          border: 1px solid rgba(255, 77, 96, 0.08);
          border-radius: 50%;
          pointer-events: none;
        }

        .alert-error-icon {
          flex-shrink: 0;
          margin-top: 1px;
          animation: error-icon-pulse 1.8s ease-in-out
            infinite;
        }

        .alert-error-content {
          flex: 1;
          min-width: 0;
        }

        .alert-error-title {
          margin-bottom: 3px;
          color: #ffc1c7;
          font-size: 12px;
          font-weight: 700;
        }

        .alert-error-message {
          color: #ffb0b8;
        }

        .error-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 11px;
        }

        .retry-button {
          position: relative;
          overflow: hidden;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid rgba(255, 126, 140, 0.25);
          border-radius: 8px;
          color: #ffd9dd;
          background: rgba(255, 77, 96, 0.08);
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 650;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .retry-button:hover:not(:disabled) {
          background: rgba(255, 77, 96, 0.14);
          border-color: rgba(255, 126, 140, 0.4);
          transform: translateY(-1px);
        }

        .retry-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .retry-button.is-retrying {
          cursor: wait;
          background: rgba(255, 77, 96, 0.11);
        }

        .retry-button.is-retrying::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          transform-origin: left;
          background: rgba(255, 174, 184, 0.7);
          animation: retry-progress 1.3s ease-in-out
            infinite;
        }

        .retry-button:disabled {
          opacity: 0.75;
          cursor: wait;
        }

        .alert-success {
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

        .edit-form {
          display: grid;
          gap: 22px;
        }

        .form-field {
          display: grid;
          gap: 8px;
        }

        .form-field label {
          color: #cdd7eb;
          font-size: 12px;
          font-weight: 600;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          width: 100%;
          box-sizing: border-box;
          outline: none;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 11px;
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.035);
          font-family: inherit;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .form-field input,
        .form-field select {
          height: 46px;
          padding: 0 14px;
        }

        .form-field textarea {
          min-height: 130px;
          padding: 13px 14px;
          resize: vertical;
          line-height: 1.6;
        }

        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          border-color: rgba(77, 124, 255, 0.55);
          box-shadow:
            0 0 0 3px rgba(77, 124, 255, 0.08);
        }

        .form-field input[aria-invalid="true"],
        .form-field textarea[aria-invalid="true"],
        .form-field select[aria-invalid="true"] {
          border-color: rgba(255, 77, 96, 0.45);
          box-shadow:
            0 0 0 3px rgba(255, 77, 96, 0.055);
        }

        .form-field input[aria-invalid="true"]:focus,
        .form-field textarea[aria-invalid="true"]:focus,
        .form-field select[aria-invalid="true"]:focus {
          border-color: rgba(255, 77, 96, 0.65);
          box-shadow:
            0 0 0 3px rgba(255, 77, 96, 0.09);
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #5f6b81;
        }

        .form-field input:disabled,
        .form-field textarea:disabled,
        .form-field select:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .form-field select option {
          color: #111827;
          background: #ffffff;
        }

        .character-count {
          color: #5f6b81;
          font-size: 11px;
          text-align: right;
        }

        .character-count.is-invalid {
          color: #ff8f9b;
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .cancel-button,
        .save-button {
          min-width: 130px;
          height: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 17px;
          border-radius: 9px;
          font-family: inherit;
          font-size: 12px;
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
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .save-button {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(77, 124, 255, 0.4);
          color: #ffffff;
          background: rgba(77, 124, 255, 0.8);
          box-shadow:
            0 8px 20px rgba(77, 124, 255, 0.12);
        }

        .save-button:hover:not(:disabled) {
          background: rgba(77, 124, 255, 0.95);
          transform: translateY(-1px);
        }

        .save-button.is-saving {
          cursor: wait;
          background: rgba(77, 124, 255, 0.68);
          box-shadow:
            0 8px 24px rgba(77, 124, 255, 0.18);
        }

        .save-button.is-saving::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          transform-origin: left;
          background: rgba(255, 255, 255, 0.72);
          animation: save-progress 1.35s ease-in-out
            infinite;
        }

        .save-button-content {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cancel-button:disabled,
        .save-button:disabled,
        .close-button:disabled,
        .back-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .save-button.is-saving:disabled {
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

        @keyframes save-shimmer {
          0% {
            left: -120%;
          }

          100% {
            left: 150%;
          }
        }

        @keyframes save-progress {
          0% {
            transform: scaleX(0.08);
            opacity: 0.35;
          }

          45% {
            transform: scaleX(0.55);
            opacity: 0.85;
          }

          100% {
            transform: scaleX(0.95);
            opacity: 0.35;
          }
        }

        @keyframes retry-progress {
          0% {
            transform: scaleX(0.08);
            opacity: 0.3;
          }

          45% {
            transform: scaleX(0.55);
            opacity: 0.8;
          }

          100% {
            transform: scaleX(0.95);
            opacity: 0.3;
          }
        }

        @keyframes header-icon-pulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.035);
          }
        }

        @keyframes error-icon-pulse {
          0%,
          100% {
            opacity: 0.85;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.04);
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
          .edit-card::after,
          .header-icon,
          .save-button.is-saving::before,
          .retry-button.is-retrying::before,
          .spin,
          .alert,
          .success-icon,
          .alert-error-icon {
            animation: none !important;
          }

          .back-button:hover:not(:disabled),
          .save-button:hover:not(:disabled),
          .cancel-button:hover:not(:disabled),
          .retry-button:hover:not(:disabled) {
            transform: none;
          }
        }

        @media (max-width: 700px) {
          .edit-workflow-page {
            padding: 20px;
          }

          .edit-topbar {
            align-items: flex-start;
          }

          .page-context {
            display: none;
          }

          .edit-card-header,
          .edit-body {
            padding: 22px;
          }

          .header-content h1 {
            font-size: 22px;
          }

          .error-actions {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 500px) {
          .edit-topbar {
            display: block;
          }

          .back-button {
            width: 100%;
            justify-content: center;
          }

          .header-content {
            flex-direction: column;
          }

          .edit-card-header {
            gap: 10px;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .save-button {
            width: 100%;
          }

          .alert-error {
            flex-wrap: wrap;
          }

          .error-actions {
            width: 100%;
            margin-left: 27px;
          }

          .retry-button {
            width: calc(100% - 27px);
          }
        }
      `}</style>

      <div className="edit-workflow-container">
        <div className="edit-topbar">
          <button
            type="button"
            className="back-button"
            onClick={handleCancel}
            disabled={saving}
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />
            Back to Workflow
          </button>

          <div className="page-context">
            Edit Workflow
          </div>
        </div>

        <section
          className="edit-card"
          aria-busy={saving}
          aria-label="Edit workflow"
        >
          <div className="edit-card-header">
            <div className="header-content">
              <div
                className="header-icon"
                aria-hidden="true"
              >
                {success ? (
                  <CheckCircle2 size={25} />
                ) : (
                  <WorkflowIcon size={25} />
                )}
              </div>

              <div>
                <h1>Edit Workflow</h1>

                <p>
                  Update the workflow information and status.
                </p>

                <div className="workflow-meta">
                  Editing:{" "}
                  {workflow.name || "Unnamed Workflow"}
                  {" · "}
                  ID #{workflow.id}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={handleCancel}
              disabled={saving}
              aria-label="Close edit page"
              title="Close"
            >
              <X
                size={17}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="edit-body">
            {error && (
              <div
                id="workflow-update-error"
                className="alert alert-error"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <AlertCircle
                  size={18}
                  className="alert-error-icon"
                  aria-hidden="true"
                />

                <div className="alert-error-content">
                  <div className="alert-error-title">
                    Workflow update failed
                  </div>

                  <div className="alert-error-message">
                    {error}
                  </div>

                  <div className="error-actions">
                    <button
                      type="button"
                      className={`retry-button ${
                        saving ? "is-retrying" : ""
                      }`}
                      onClick={handleRetry}
                      disabled={saving}
                      aria-label={
                        saving
                          ? "Retrying workflow update"
                          : "Try updating workflow again"
                      }
                      aria-busy={saving}
                    >
                      <RefreshCw
                        size={13}
                        className={
                          saving
                            ? "spin"
                            : ""
                        }
                        aria-hidden="true"
                      />

                      {saving
                        ? "Retrying..."
                        : "Try Again"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div
                className="alert alert-success"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <CheckCircle2
                  size={17}
                  className="success-icon"
                  aria-hidden="true"
                />

                <div>
                  Workflow updated successfully.
                  Redirecting...
                </div>
              </div>
            )}

            {saving && (
              <div
                className="sr-only"
                role="status"
                aria-live="polite"
              >
                Saving workflow changes. Please wait.
              </div>
            )}

            <form
              className="edit-form"
              onSubmit={handleSubmit}
              noValidate
              aria-describedby={
                error
                  ? "workflow-update-error"
                  : undefined
              }
            >
              <div className="form-field">
                <label htmlFor="workflow-name">
                  Workflow Name
                </label>

                <input
                  id="workflow-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter workflow name"
                  maxLength={100}
                  disabled={saving}
                  autoComplete="off"
                  aria-required="true"
                  aria-invalid={
                    nameInvalid
                  }
                  aria-describedby={
                    nameInvalid
                      ? "workflow-update-error"
                      : undefined
                  }
                />

                <div
                  className={`character-count ${
                    nameInvalid
                      ? "is-invalid"
                      : ""
                  }`}
                >
                  {formData.name.length}/100
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="workflow-description">
                  Description
                </label>

                <textarea
                  id="workflow-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what this workflow does"
                  maxLength={500}
                  disabled={saving}
                  aria-describedby={
                    error
                      ? "workflow-update-error"
                      : undefined
                  }
                />

                <div className="character-count">
                  {formData.description.length}/500
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="workflow-status">
                  Status
                </label>

                <select
                  id="workflow-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={saving}
                  aria-describedby={
                    error
                      ? "workflow-update-error"
                      : undefined
                  }
                >
                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`save-button ${
                    saving ? "is-saving" : ""
                  }`}
                  disabled={saving}
                  aria-busy={saving}
                >
                  <span className="save-button-content">
                    {saving ? (
                      <>
                        <Loader2
                          size={15}
                          className="spin"
                          aria-hidden="true"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save
                          size={15}
                          aria-hidden="true"
                        />
                        Save Changes
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditWorkflow;