import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      setSaving(true);
      setError("");

      const updatedWorkflow =
        await workflowService.updateWorkflow(workflow.id, {
          name,
          description,
          status: formData.status,
        });

      console.log(
        "Workflow updated successfully:",
        updatedWorkflow
      );

      if (onUpdated) {
        onUpdated(updatedWorkflow);
      } else {
        navigate(`/workflows/${workflow.id}`);
      }
    } catch (err) {
      console.error(
        "Failed to update workflow:",
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
          "You are not authorized to update this workflow."
        );
      } else if (status === 404) {
        setError(
          "The requested workflow was not found."
        );
      } else {
        setError(
          "Unable to update workflow. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="edit-workflow-page">
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

        .back-button:hover {
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
        }

        .close-button:hover {
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.08);
        }

        .edit-body {
          padding: 30px;
        }

        .alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 20px;
          padding: 13px 15px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .alert-error {
          color: #ffb0b8;
          background: rgba(255, 77, 96, 0.08);
          border: 1px solid rgba(255, 77, 96, 0.2);
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
          transition: 0.2s ease;
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

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #5f6b81;
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

        .cancel-button:hover {
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.08);
        }

        .save-button {
          border: 1px solid rgba(77, 124, 255, 0.4);
          color: #ffffff;
          background: rgba(77, 124, 255, 0.8);
        }

        .save-button:hover {
          background: rgba(77, 124, 255, 0.95);
          transform: translateY(-1px);
        }

        .cancel-button:disabled,
        .save-button:disabled,
        .close-button:disabled,
        .back-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
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
            <ArrowLeft size={16} />
            Back to Workflow
          </button>

          <div className="page-context">
            Edit Workflow
          </div>
        </div>

        <section className="edit-card">
          <div className="edit-card-header">
            <div className="header-content">
              <div className="header-icon">
                <WorkflowIcon size={25} />
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
              <X size={17} />
            </button>
          </div>

          <div className="edit-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle
                  size={17}
                  style={{ flexShrink: 0 }}
                />

                <div>{error}</div>
              </div>
            )}

            <form
              className="edit-form"
              onSubmit={handleSubmit}
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
                />

                <div className="character-count">
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
                  className="save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={15}
                        className="spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
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