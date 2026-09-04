import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

import workflowService from "../services/workflowService";

const DeleteWorkflowButton = ({ workflowId, workflowName, onDeleted }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      await workflowService.deleteWorkflow(workflowId);

      setShowConfirm(false);

      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      console.error("Failed to delete workflow:", err);

      const status = err.response?.status;

      if (status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (status === 403) {
        setError(
          "You are not authorized to delete this workflow."
        );
      } else if (status === 404) {
        setError(
          "This workflow was not found."
        );
      } else {
        setError(
          "Unable to delete this workflow. Please try again."
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Button */}

      <button
        type="button"
        className="delete-workflow-button"
        onClick={() => {
          setError("");
          setShowConfirm(true);
        }}
      >
        <Trash2 size={15} />
        Delete Workflow
      </button>


      {/* Confirmation Modal */}

      {showConfirm && (
        <div className="delete-modal-overlay">

          <div className="delete-modal">

            {/* Close */}

            <button
              type="button"
              className="delete-modal-close"
              onClick={() => {
                if (!deleting) {
                  setShowConfirm(false);
                }
              }}
              disabled={deleting}
            >
              <X size={18} />
            </button>


            {/* Icon */}

            <div className="delete-modal-icon">
              <AlertTriangle size={25} />
            </div>


            {/* Content */}

            <h2>
              Delete Workflow?
            </h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {workflowName || "this workflow"}
              </strong>
              ?
            </p>

            <span className="delete-warning">
              This action cannot be undone.
            </span>


            {/* Error */}

            {error && (
              <div className="delete-error">
                {error}
              </div>
            )}


            {/* Actions */}

            <div className="delete-modal-actions">

              <button
                type="button"
                className="delete-cancel-button"
                onClick={() => {
                  if (!deleting) {
                    setShowConfirm(false);
                  }
                }}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="delete-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}


      {/* Component CSS */}

      <style>{`

        .delete-workflow-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 10px 15px;

          border: 1px solid rgba(255, 77, 96, 0.3);
          border-radius: 10px;

          color: #ff8e9b;
          background: rgba(255, 77, 96, 0.08);

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .delete-workflow-button:hover {
          background: rgba(255, 77, 96, 0.14);
          border-color: rgba(255, 77, 96, 0.5);
          transform: translateY(-1px);
        }


        /* Overlay */

        .delete-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background: rgba(3, 7, 18, 0.68);

          backdrop-filter: blur(6px);
        }


        /* Modal */

        .delete-modal {
          position: relative;

          width: 100%;
          max-width: 430px;

          padding: 28px;

          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;

          background: #0f172a;

          color: #e8eefc;

          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.45);

          animation: delete-modal-enter 0.2s ease both;
        }

        @keyframes delete-modal-enter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }


        /* Close */

        .delete-modal-close {
          position: absolute;

          top: 14px;
          right: 14px;

          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: none;
          border-radius: 8px;

          background: transparent;
          color: #7f8ba3;

          cursor: pointer;
        }

        .delete-modal-close:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white;
        }


        /* Icon */

        .delete-modal-icon {
          width: 50px;
          height: 50px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 18px;

          border-radius: 14px;

          color: #ff8e9b;
          background: rgba(255, 77, 96, 0.1);
        }


        /* Text */

        .delete-modal h2 {
          margin: 0 0 9px;

          color: #f0f4ff;

          font-size: 21px;
        }

        .delete-modal p {
          margin: 0;

          color: #aebbd3;

          font-size: 13px;
          line-height: 1.6;
        }

        .delete-modal p strong {
          color: #e8eefc;
        }

        .delete-warning {
          display: block;

          margin-top: 8px;

          color: #7f8ba3;

          font-size: 11px;
        }


        /* Error */

        .delete-error {
          margin-top: 16px;

          padding: 10px 12px;

          border: 1px solid rgba(255, 77, 96, 0.2);
          border-radius: 9px;

          color: #ff9aa5;
          background: rgba(255, 77, 96, 0.08);

          font-size: 11px;
          line-height: 1.5;
        }


        /* Actions */

        .delete-modal-actions {
          display: flex;

          justify-content: flex-end;

          gap: 10px;

          margin-top: 24px;
        }

        .delete-cancel-button,
        .delete-confirm-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          min-width: 90px;

          padding: 10px 14px;

          border-radius: 9px;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .delete-cancel-button {
          border: 1px solid rgba(255, 255, 255, 0.1);

          background: rgba(255, 255, 255, 0.04);

          color: #cbd4e5;
        }

        .delete-cancel-button:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .delete-confirm-button {
          border: 1px solid rgba(255, 77, 96, 0.35);

          background: #dc2626;

          color: white;
        }

        .delete-confirm-button:hover {
          background: #b91c1c;
        }

        .delete-cancel-button:disabled,
        .delete-confirm-button:disabled,
        .delete-modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }


        /* Spinner */

        .delete-spinner {
          width: 13px;
          height: 13px;

          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: white;

          border-radius: 50%;

          animation: delete-spin 0.7s linear infinite;
        }

        @keyframes delete-spin {
          to {
            transform: rotate(360deg);
          }
        }

      `}</style>
    </>
  );
};

export default DeleteWorkflowButton;