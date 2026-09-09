import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

import workflowService from "../services/workflowService";

const DeleteWorkflowButton = ({ workflowId, workflowName, onDeleted }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const closeModal = () => {
    if (!deleting) {
      setShowConfirm(false);
      setError("");
    }
  };

  const openModal = () => {
    if (deleting) return;

    setError("");
    setShowConfirm(true);
  };

  useEffect(() => {
    if (!showConfirm) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !deleting) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showConfirm, deleting]);

  const handleDelete = async () => {
    if (deleting) return;

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
        onClick={openModal}
        aria-haspopup="dialog"
      >
        <Trash2 size={15} aria-hidden="true" />
        Delete Workflow
      </button>


      {/* Confirmation Modal */}

      {showConfirm && (
        <div
          className="delete-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-workflow-title"
            aria-describedby="delete-workflow-description"
            aria-busy={deleting}
          >
            {/* Screen-reader live status */}

            <div
              className="delete-sr-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {deleting
                ? "Deleting workflow. Please wait."
                : error
                  ? error
                  : ""}
            </div>


            {/* Close */}

            <button
              type="button"
              className="delete-modal-close"
              onClick={closeModal}
              disabled={deleting}
              aria-label="Close delete confirmation"
            >
              <X size={18} aria-hidden="true" />
            </button>


            {/* Icon */}

            <div
              className={`delete-modal-icon ${
                deleting ? "delete-modal-icon-loading" : ""
              }`}
              aria-hidden="true"
            >
              {deleting ? (
                <span className="delete-modal-icon-spinner"></span>
              ) : (
                <AlertTriangle size={25} />
              )}
            </div>


            {/* Content */}

            <h2 id="delete-workflow-title">
              {deleting
                ? "Deleting Workflow..."
                : "Delete Workflow?"}
            </h2>

            <p id="delete-workflow-description">
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
              <div
                className="delete-error"
                role="alert"
                aria-live="assertive"
              >
                <AlertTriangle
                  size={14}
                  aria-hidden="true"
                />

                <span>{error}</span>
              </div>
            )}


            {/* Actions */}

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-cancel-button"
                onClick={closeModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`delete-confirm-button ${
                  deleting ? "delete-confirming" : ""
                }`}
                onClick={handleDelete}
                disabled={deleting}
                aria-busy={deleting}
              >
                {deleting ? (
                  <>
                    <span
                      className="delete-spinner"
                      aria-hidden="true"
                    />

                    <span>Deleting...</span>

                    <span
                      className="delete-button-progress"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    <Trash2
                      size={15}
                      aria-hidden="true"
                    />

                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Component CSS */}

      <style>{`

        /* Screen reader only */

        .delete-sr-status {
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


        /* Delete Button */

        .delete-workflow-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 10px 15px;

          border: 1px solid rgba(255, 77, 96, 0.3);
          border-radius: 10px;

          color: #ff8e9b;
          background: rgba(255, 77, 96, 0.08);

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .delete-workflow-button:hover {
          background: rgba(255, 77, 96, 0.14);
          border-color: rgba(255, 77, 96, 0.5);
          transform: translateY(-1px);
          box-shadow:
            0 8px 22px rgba(255, 77, 96, 0.08);
        }

        .delete-workflow-button:active {
          transform: translateY(0);
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

          background: rgba(3, 7, 18, 0.72);

          backdrop-filter: blur(7px);

          animation: delete-overlay-enter 0.2s ease both;
        }

        @keyframes delete-overlay-enter {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }


        /* Modal */

        .delete-modal {
          position: relative;

          width: 100%;
          max-width: 430px;

          padding: 28px;

          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(17, 27, 48, 0.98),
              rgba(10, 17, 32, 0.98)
            );

          color: #e8eefc;

          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.48),
            0 0 0 1px rgba(255, 255, 255, 0.02);

          animation: delete-modal-enter 0.24s cubic-bezier(
            0.22,
            1,
            0.36,
            1
          ) both;
        }

        @keyframes delete-modal-enter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.96);
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

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .delete-modal-close:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          color: white;
          transform: rotate(4deg);
        }


        /* Icon */

        .delete-modal-icon {
          width: 50px;
          height: 50px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 18px;

          border: 1px solid rgba(255, 77, 96, 0.12);
          border-radius: 14px;

          color: #ff8e9b;
          background:
            linear-gradient(
              145deg,
              rgba(255, 77, 96, 0.13),
              rgba(255, 77, 96, 0.06)
            );

          animation: delete-icon-enter 0.3s 0.05s ease both;
        }

        @keyframes delete-icon-enter {
          from {
            opacity: 0;
            transform: scale(0.8);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .delete-modal-icon-loading {
          animation: delete-icon-pulse 1.2s ease-in-out infinite;
        }

        @keyframes delete-icon-pulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow:
              0 0 0 0 rgba(255, 77, 96, 0.16);
          }

          50% {
            transform: scale(1.04);
            box-shadow:
              0 0 0 8px rgba(255, 77, 96, 0);
          }
        }

        .delete-modal-icon-spinner {
          width: 22px;
          height: 22px;

          border: 2px solid rgba(255, 142, 155, 0.25);
          border-top-color: #ff8e9b;

          border-radius: 50%;

          animation: delete-spin 0.7s linear infinite;
        }


        /* Text */

        .delete-modal h2 {
          margin: 0 0 9px;

          color: #f0f4ff;

          font-size: 21px;
          font-weight: 700;

          letter-spacing: -0.2px;

          animation: delete-content-enter 0.25s 0.06s ease both;
        }

        .delete-modal p {
          margin: 0;

          color: #aebbd3;

          font-size: 13px;
          line-height: 1.6;

          animation: delete-content-enter 0.25s 0.08s ease both;
        }

        .delete-modal p strong {
          color: #e8eefc;
        }

        .delete-warning {
          display: block;

          margin-top: 8px;

          color: #7f8ba3;

          font-size: 11px;

          animation: delete-content-enter 0.25s 0.1s ease both;
        }

        @keyframes delete-content-enter {
          from {
            opacity: 0;
            transform: translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        /* Error */

        .delete-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          margin-top: 16px;

          padding: 10px 12px;

          border: 1px solid rgba(255, 77, 96, 0.2);
          border-radius: 9px;

          color: #ff9aa5;
          background: rgba(255, 77, 96, 0.08);

          font-size: 11px;
          line-height: 1.5;

          animation: delete-error-enter 0.22s ease both;
        }

        @keyframes delete-error-enter {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          position: relative;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          min-width: 90px;

          min-height: 38px;

          padding: 10px 14px;

          overflow: hidden;

          border-radius: 9px;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }


        /* Cancel */

        .delete-cancel-button {
          border: 1px solid rgba(255, 255, 255, 0.1);

          background: rgba(255, 255, 255, 0.04);

          color: #cbd4e5;
        }

        .delete-cancel-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }


        /* Confirm */

        .delete-confirm-button {
          border: 1px solid rgba(255, 77, 96, 0.35);

          background: #dc2626;

          color: white;
        }

        .delete-confirm-button:hover:not(:disabled) {
          background: #b91c1c;

          box-shadow:
            0 8px 22px rgba(220, 38, 38, 0.18);

          transform: translateY(-1px);
        }

        .delete-confirm-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .delete-confirming {
          background: #b91c1c;
          cursor: wait;
        }


        /* Progress line */

        .delete-button-progress {
          position: absolute;

          left: 0;
          bottom: 0;

          width: 100%;
          height: 2px;

          transform-origin: left;

          background: rgba(255, 255, 255, 0.8);

          animation: delete-progress 1.2s ease-in-out infinite;
        }

        @keyframes delete-progress {
          0% {
            transform: scaleX(0);
            opacity: 0.4;
          }

          50% {
            transform: scaleX(0.7);
            opacity: 0.9;
          }

          100% {
            transform: scaleX(1);
            opacity: 0.2;
          }
        }


        /* Disabled */

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

          flex-shrink: 0;

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


        /* Mobile */

        @media (max-width: 520px) {
          .delete-modal-overlay {
            padding: 16px;
          }

          .delete-modal {
            max-width: 100%;
            padding: 24px 20px;
            border-radius: 16px;
          }

          .delete-modal-actions {
            flex-direction: column-reverse;
          }

          .delete-cancel-button,
          .delete-confirm-button {
            width: 100%;
          }
        }


        /* Reduced motion */

        @media (prefers-reduced-motion: reduce) {
          .delete-modal-overlay,
          .delete-modal,
          .delete-modal-icon,
          .delete-modal h2,
          .delete-modal p,
          .delete-warning,
          .delete-error {
            animation: none !important;
          }

          .delete-button-progress {
            animation: none !important;
            transform: scaleX(1);
          }

          .delete-spinner,
          .delete-modal-icon-spinner {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }

          .delete-workflow-button,
          .delete-cancel-button,
          .delete-confirm-button,
          .delete-modal-close {
            transition: none !important;
          }
        }

      `}</style>
    </>
  );
};

export default DeleteWorkflowButton;