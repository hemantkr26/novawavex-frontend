import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import workflowService from "../services/workflowService";
import EditWorkflow from "../components/EditWorkflow";

const EditWorkflowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  const loadWorkflow = async (isRetry = false) => {
    if (isRetry && retrying) {
      return;
    }

    try {
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data =
        await workflowService.getWorkflowById(id);

      setWorkflow(data);
    } catch (err) {
      console.error(
        "Failed to load workflow:",
        err
      );

      const status = err.response?.status;

      if (status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (status === 403) {
        setError(
          "You are not authorized to access this workflow."
        );
      } else if (status === 404) {
        setError(
          "The requested workflow was not found."
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
          "Unable to load this workflow. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadWorkflow();
    }
  }, [id]);

  const handleRetry = async () => {
    if (retrying) {
      return;
    }

    await loadWorkflow(true);
  };

  const handleUpdated = (updatedWorkflow) => {
    setWorkflow(updatedWorkflow);

    navigate(`/workflows/${id}`, {
      state: {
        message: "Workflow updated successfully.",
      },
    });
  };

  const handleCancel = () => {
    navigate(`/workflows/${id}`);
  };

  if (loading) {
    return (
      <div className="edit-workflow-page">
        <style>{`
          .edit-workflow-page {
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

          .edit-workflow-container {
            max-width: 1000px;
            margin: 0 auto;
          }

          .loading-state {
            position: relative;
            overflow: hidden;
            min-height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 20px;
            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.045),
                rgba(255, 255, 255, 0.018)
              );
            box-shadow:
              0 18px 45px rgba(0, 0, 0, 0.18);
            backdrop-filter: blur(12px);
          }

          .loading-state::before {
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
              rgba(255, 255, 255, 0.045),
              transparent
            );
            transform: skewX(-18deg);
            animation: loading-shimmer 1.8s ease-in-out
              infinite;
          }

          .loading-content {
            position: relative;
            z-index: 1;
            width: min(460px, 90%);
            text-align: center;
          }

          .loading-icon {
            position: relative;
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 17px;
            color: #9bb9ff;
            background:
              linear-gradient(
                145deg,
                rgba(77, 124, 255, 0.15),
                rgba(77, 124, 255, 0.06)
              );
            border: 1px solid rgba(77, 124, 255, 0.25);
            box-shadow:
              0 0 0 7px rgba(77, 124, 255, 0.035),
              0 12px 30px rgba(0, 0, 0, 0.16);
            animation: loading-icon-pulse 1.8s ease-in-out
              infinite;
          }

          .loading-icon::after {
            content: "";
            position: absolute;
            inset: -7px;
            border: 1px solid rgba(77, 124, 255, 0.12);
            border-radius: 21px;
            animation: loading-ring 1.8s ease-in-out
              infinite;
          }

          .loading-content h2 {
            margin: 0 0 9px;
            color: #eef3ff;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.2px;
          }

          .loading-content p {
            margin: 0;
            color: #7f8ba3;
            font-size: 13px;
            line-height: 1.6;
          }

          .loading-progress {
            width: min(240px, 70%);
            height: 3px;
            margin: 22px auto 0;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.06);
          }

          .loading-progress-bar {
            width: 40%;
            height: 100%;
            border-radius: inherit;
            background: rgba(77, 124, 255, 0.7);
            animation: loading-progress 1.5s ease-in-out
              infinite;
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

          @keyframes loading-shimmer {
            0% {
              left: -120%;
            }

            100% {
              left: 150%;
            }
          }

          @keyframes loading-icon-pulse {
            0%,
            100% {
              transform: scale(1);
              box-shadow:
                0 0 0 7px rgba(77, 124, 255, 0.035),
                0 12px 30px rgba(0, 0, 0, 0.16);
            }

            50% {
              transform: scale(1.025);
              box-shadow:
                0 0 0 10px rgba(77, 124, 255, 0.025),
                0 14px 34px rgba(0, 0, 0, 0.2);
            }
          }

          @keyframes loading-ring {
            0%,
            100% {
              opacity: 0.35;
              transform: scale(0.96);
            }

            50% {
              opacity: 0.8;
              transform: scale(1.04);
            }
          }

          @keyframes loading-progress {
            0% {
              transform: translateX(-130%);
            }

            100% {
              transform: translateX(330%);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .loading-state::before,
            .loading-icon,
            .loading-icon::after,
            .loading-progress-bar,
            .spin {
              animation: none !important;
            }

            .loading-progress-bar {
              width: 60%;
              transform: none;
            }
          }

          @media (max-width: 650px) {
            .edit-workflow-page {
              padding: 20px;
            }

            .loading-state {
              min-height: 440px;
            }

            .loading-content h2 {
              font-size: 19px;
            }
          }
        `}</style>

        <div className="edit-workflow-container">
          <div
            className="loading-state"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="loading-content">
              <div
                className="loading-icon"
                aria-hidden="true"
              >
                <Loader2
                  size={29}
                  className="spin"
                />
              </div>

              <h2>Loading workflow</h2>

              <p>
                Retrieving workflow information...
              </p>

              <div
                className="loading-progress"
                aria-hidden="true"
              >
                <div className="loading-progress-bar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-workflow-page">
        <style>{`
          .edit-workflow-page {
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

          .edit-workflow-container {
            max-width: 1000px;
            margin: 0 auto;
          }

          .error-state {
            position: relative;
            overflow: hidden;
            min-height: 500px;
            padding: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 20px;
            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.035),
                rgba(255, 255, 255, 0.015)
              );
            box-shadow:
              0 18px 45px rgba(0, 0, 0, 0.18);
            backdrop-filter: blur(12px);
            animation: error-state-enter 0.3s ease-out;
          }

          .error-state::before,
          .error-state::after {
            content: "";
            position: absolute;
            border: 1px solid rgba(255, 77, 96, 0.08);
            border-radius: 50%;
            pointer-events: none;
          }

          .error-state::before {
            width: 310px;
            height: 310px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }

          .error-state::after {
            width: 430px;
            height: 430px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-color: rgba(77, 124, 255, 0.05);
          }

          .error-content {
            position: relative;
            z-index: 1;
            max-width: 500px;
            text-align: center;
          }

          .error-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 14px;
            color: #8b96aa;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.4px;
            text-transform: uppercase;
          }

          .error-icon {
            position: relative;
            width: 64px;
            height: 64px;
            margin: 0 auto 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 17px;
            color: #ff9aa5;
            background:
              linear-gradient(
                145deg,
                rgba(255, 77, 96, 0.13),
                rgba(255, 77, 96, 0.055)
              );
            border: 1px solid rgba(255, 77, 96, 0.22);
            box-shadow:
              0 0 0 7px rgba(255, 77, 96, 0.025),
              0 14px 34px rgba(0, 0, 0, 0.16);
            animation: error-icon-pulse 2.2s ease-in-out
              infinite;
          }

          .error-icon::after {
            content: "";
            position: absolute;
            inset: -7px;
            border: 1px solid rgba(255, 77, 96, 0.09);
            border-radius: 21px;
            animation: error-ring 2.2s ease-in-out
              infinite;
          }

          .error-content h2 {
            margin: 0 0 9px;
            color: #eef3ff;
            font-size: 21px;
            font-weight: 700;
            letter-spacing: -0.2px;
          }

          .error-message {
            margin: 0 auto;
            max-width: 430px;
            color: #8490a8;
            font-size: 13px;
            line-height: 1.65;
          }

          .error-detail {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 17px;
            padding: 8px 11px;
            border: 1px solid rgba(255, 255, 255, 0.055);
            border-radius: 999px;
            color: #68748b;
            background: rgba(255, 255, 255, 0.025);
            font-size: 11px;
          }

          .error-detail-dot {
            width: 6px;
            height: 6px;
            flex-shrink: 0;
            border-radius: 50%;
            background: #ff7e8c;
            box-shadow:
              0 0 0 3px rgba(255, 77, 96, 0.08);
          }

          .error-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 24px;
          }

          .retry-button,
          .back-button {
            min-height: 42px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 0 16px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 650;
            cursor: pointer;
            transition:
              background 0.2s ease,
              border-color 0.2s ease,
              color 0.2s ease,
              transform 0.2s ease;
          }

          .retry-button {
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(77, 124, 255, 0.35);
            color: #ffffff;
            background: rgba(77, 124, 255, 0.78);
            box-shadow:
              0 8px 20px rgba(77, 124, 255, 0.12);
          }

          .retry-button:hover:not(:disabled) {
            background: rgba(77, 124, 255, 0.95);
            border-color: rgba(77, 124, 255, 0.55);
            transform: translateY(-1px);
          }

          .retry-button.is-retrying {
            cursor: wait;
            background: rgba(77, 124, 255, 0.65);
          }

          .retry-button.is-retrying::before {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            transform-origin: left;
            background: rgba(255, 255, 255, 0.7);
            animation: retry-progress 1.3s ease-in-out
              infinite;
          }

          .back-button {
            border: 1px solid rgba(255, 255, 255, 0.09);
            color: #aebbd3;
            background: rgba(255, 255, 255, 0.035);
          }

          .back-button:hover:not(:disabled) {
            color: #e8eefc;
            background: rgba(255, 255, 255, 0.07);
            border-color: rgba(255, 255, 255, 0.13);
            transform: translateY(-1px);
          }

          .retry-button:focus-visible,
          .back-button:focus-visible {
            outline: 2px solid rgba(77, 124, 255, 0.8);
            outline-offset: 3px;
          }

          .retry-button:disabled {
            opacity: 0.8;
            cursor: wait;
          }

          .retry-status {
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

          .retry-icon.spin {
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

          @keyframes error-state-enter {
            from {
              opacity: 0;
              transform: translateY(8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes error-icon-pulse {
            0%,
            100% {
              transform: scale(1);
              box-shadow:
                0 0 0 7px rgba(255, 77, 96, 0.025),
                0 14px 34px rgba(0, 0, 0, 0.16);
            }

            50% {
              transform: scale(1.025);
              box-shadow:
                0 0 0 10px rgba(255, 77, 96, 0.018),
                0 16px 38px rgba(0, 0, 0, 0.2);
            }
          }

          @keyframes error-ring {
            0%,
            100% {
              opacity: 0.3;
              transform: scale(0.96);
            }

            50% {
              opacity: 0.75;
              transform: scale(1.04);
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

          @media (prefers-reduced-motion: reduce) {
            .error-state,
            .error-icon,
            .error-icon::after,
            .retry-icon.spin,
            .retry-button.is-retrying::before {
              animation: none !important;
            }

            .retry-button:hover:not(:disabled),
            .back-button:hover:not(:disabled) {
              transform: none;
            }
          }

          @media (max-width: 650px) {
            .edit-workflow-page {
              padding: 20px;
            }

            .error-state {
              min-height: 440px;
              padding: 20px;
            }

            .error-content h2 {
              font-size: 19px;
            }

            .error-actions {
              flex-direction: column;
              width: 100%;
            }

            .retry-button,
            .back-button {
              width: 100%;
            }
          }
        `}</style>

        <div className="edit-workflow-container">
          <div
            className="error-state"
            role="alert"
            aria-live="assertive"
            aria-busy={retrying}
          >
            <div className="error-content">
              <div className="error-eyebrow">
                <AlertCircle
                  size={11}
                  aria-hidden="true"
                />
                Workflow service
              </div>

              <div
                className="error-icon"
                aria-hidden="true"
              >
                <AlertCircle size={28} />
              </div>

              <h2>Unable to load workflow</h2>

              <p className="error-message">
                {error}
              </p>

              <div
                className="error-detail"
                aria-hidden="true"
              >
                <span className="error-detail-dot" />
                Workflow request could not be completed
              </div>

              <div className="error-actions">
                <button
                  type="button"
                  className={`retry-button ${
                    retrying ? "is-retrying" : ""
                  }`}
                  onClick={handleRetry}
                  disabled={retrying}
                  aria-label={
                    retrying
                      ? "Retrying workflow request"
                      : "Try loading workflow again"
                  }
                  aria-busy={retrying}
                >
                  <RefreshCw
                    size={15}
                    className={
                      retrying
                        ? "retry-icon spin"
                        : "retry-icon"
                    }
                    aria-hidden="true"
                  />

                  {retrying
                    ? "Retrying..."
                    : "Try Again"}
                </button>

                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    navigate("/workflows")
                  }
                  disabled={retrying}
                >
                  <ArrowLeft
                    size={16}
                    aria-hidden="true"
                  />
                  Back to Workflows
                </button>
              </div>

              <span
                className="retry-status"
                aria-live="polite"
              >
                {retrying
                  ? "Retrying the workflow service connection."
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return null;
  }

  return (
    <EditWorkflow
      workflow={workflow}
      onUpdated={handleUpdated}
      onCancel={handleCancel}
    />
  );
};

export default EditWorkflowPage;