import { useEffect, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  Edit3,
  GitBranch,
  Loader2,
  Play,
  Check,
  RefreshCw,
  Workflow as WorkflowIcon,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import workflowService from "../services/workflowService";
import DeleteWorkflowButton from "../components/DeleteWorkflowButton";


const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    icon: Activity,
  },

  DRAFT: {
    label: "Draft",
    icon: Clock3,
  },

  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
  },

  CANCELLED: {
    label: "Cancelled",
    icon: AlertCircle,
  },
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};


const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[
      String(status || "").toUpperCase()
    ] || {
      label: status || "Unknown",
      icon: GitBranch,
    }
  );
};


const WorkflowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [retrying, setRetrying] = useState(false);

  const [startingExecution, setStartingExecution] =
    useState(false);

  const [completingExecution, setCompletingExecution] =
    useState(false);

  const [executionMessage, setExecutionMessage] =
    useState("");

  const [execution, setExecution] =
    useState(null);


  /*
   * =========================
   * LOAD WORKFLOW
   * =========================
   */

  const loadWorkflow = async (isRetry = false) => {
    if (isRetry) {
      if (retrying) {
        return;
      }

      setRetrying(true);
    } else {
      setLoading(true);
    }

    try {
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


  /*
   * =========================
   * RETRY WORKFLOW LOAD
   * =========================
   */

  const handleRetry = async () => {
    if (retrying || loading) {
      return;
    }

    await loadWorkflow(true);
  };


  /*
   * =========================
   * RESTORE EXECUTION
   * =========================
   *
   * Load the user's executions from
   * the backend and restore the latest
   * execution belonging to this workflow.
   *
   * This fixes the refresh problem.
   */

  const loadCurrentExecution = async () => {
    try {

      const executions =
        await workflowService.getMyExecutions();

      if (!Array.isArray(executions)) {
        setExecution(null);
        return;
      }


      /*
       * Find executions belonging to
       * the current workflow.
       */

      const workflowExecutions =
        executions.filter((item) => {

          const executionWorkflowId =
            item?.workflow?.id ??
            item?.workflowId;

          return (
            String(executionWorkflowId) ===
            String(id)
          );

        });


      /*
       * No execution exists for this workflow.
       */

      if (workflowExecutions.length === 0) {

        setExecution(null);

        return;
      }


      /*
       * Find the newest execution.
       *
       * Prefer updatedAt, then startedAt,
       * then createdAt.
       */

      const latestExecution =
        [...workflowExecutions].sort(
          (a, b) => {

            const dateA = new Date(
              a.updatedAt ||
              a.startedAt ||
              a.createdAt ||
              0
            ).getTime();

            const dateB = new Date(
              b.updatedAt ||
              b.startedAt ||
              b.createdAt ||
              0
            ).getTime();

            return dateB - dateA;
          }
        )[0];


      /*
       * Restore the execution into React state.
       */

      setExecution(latestExecution);

    } catch (err) {

      /*
       * Execution restoration should never
       * break the workflow details page.
       */

      console.error(
        "Failed to restore workflow execution:",
        err
      );

      setExecution(null);
    }
  };


  /*
   * =========================
   * INITIAL LOAD
   * =========================
   */

  useEffect(() => {

    if (!id) {
      return;
    }

    loadWorkflow();

    loadCurrentExecution();

  }, [id]);


  /*
   * =========================
   * START EXECUTION
   * =========================
   */

  const handleStartExecution = async () => {

    try {

      setStartingExecution(true);

      setExecutionMessage("");

      setError("");


      /*
       * Step 1:
       * Create execution.
       *
       * Initial status:
       * QUEUED
       */

      const createdExecution =
        await workflowService.createExecution(id);


      /*
       * Step 2:
       * Move execution:
       *
       * QUEUED → RUNNING
       */

      const runningExecution =
        await workflowService.startExecution(
          createdExecution.id
        );


      /*
       * Store current execution
       * so Complete Execution can
       * use its ID.
       */

      setExecution(
        runningExecution || {
          ...createdExecution,
          status: "RUNNING",
        }
      );


      setExecutionMessage(
        "Workflow execution started successfully."
      );

    } catch (err) {

      console.error(
        "Failed to start workflow execution:",
        err
      );

      const status = err.response?.status;

      if (status === 401) {

        setExecutionMessage(
          "Your session has expired. Please log in again."
        );

      } else if (status === 403) {

        setExecutionMessage(
          "You are not authorized to execute this workflow."
        );

      } else if (status === 404) {

        setExecutionMessage(
          "Workflow or execution was not found."
        );

      } else {

        setExecutionMessage(
          "Unable to start workflow execution. Please try again."
        );
      }

    } finally {

      setStartingExecution(false);

    }
  };


  /*
   * =========================
   * COMPLETE EXECUTION
   * =========================
   */

  const handleCompleteExecution = async () => {

    if (!execution?.id) {

      setExecutionMessage(
        "No running execution was found."
      );

      return;
    }


    try {

      setCompletingExecution(true);

      setExecutionMessage("");

      setError("");


      /*
       * RUNNING → COMPLETED
       */

      const completedExecution =
        await workflowService.completeExecution(
          execution.id
        );


      /*
       * Update UI with completed
       * execution returned by backend.
       */

      setExecution(
        completedExecution || {
          ...execution,
          status: "COMPLETED",
        }
      );


      setExecutionMessage(
        "Workflow execution completed successfully."
      );

    } catch (err) {

      console.error(
        "Failed to complete workflow execution:",
        err
      );

      const status = err.response?.status;

      if (status === 401) {

        setExecutionMessage(
          "Your session has expired. Please log in again."
        );

      } else if (status === 403) {

        setExecutionMessage(
          "You are not authorized to complete this execution."
        );

      } else if (status === 404) {

        setExecutionMessage(
          "Execution was not found."
        );

      } else {

        setExecutionMessage(
          "Unable to complete workflow execution. Please try again."
        );
      }

    } finally {

      setCompletingExecution(false);

    }
  };


  /*
   * =========================
   * LOADING STATE
   * =========================
   */

  if (loading) {

    return (
      <div className="workflow-details-page">

        <style>{`

          .workflow-details-page {
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


          .details-container {
            max-width: 1100px;

            margin: 0 auto;
          }


          /*
           * =========================
           * WORKFLOW DETAILS SKELETON
           * =========================
           */

          .details-loading-state {
            min-height: 500px;

            border:
              1px solid rgba(255, 255, 255, 0.07);

            border-radius: 20px;

            background:
              rgba(255, 255, 255, 0.025);

            overflow: hidden;

            padding: 24px;

            position: relative;
          }


          .details-loading-state::after {
            content: "";

            position: absolute;

            inset: 0;

            transform: translateX(-100%);

            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.045),
                transparent
              );

            animation:
              workflow-skeleton-shimmer 1.8s ease-in-out infinite;

            pointer-events: none;
          }


          .loading-topbar {
            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 20px;

            margin-bottom: 22px;
          }


          .loading-button-row {
            display: flex;

            gap: 10px;

            flex-wrap: wrap;
          }


          .loading-block {
            position: relative;

            overflow: hidden;

            border-radius: 9px;

            background:
              rgba(255, 255, 255, 0.065);
          }


          .loading-button {
            width: 150px;

            height: 40px;
          }


          .loading-context {
            width: 100px;

            height: 14px;
          }


          .loading-execution {
            margin-bottom: 20px;

            padding: 22px;

            border:
              1px solid rgba(255, 255, 255, 0.06);

            border-radius: 18px;

            background:
              rgba(255, 255, 255, 0.025);
          }


          .loading-heading {
            width: 180px;

            height: 16px;

            margin-bottom: 20px;
          }


          .loading-execution-grid {
            display: grid;

            grid-template-columns:
              repeat(3, minmax(0, 1fr));

            gap: 15px;
          }


          .loading-execution-item {
            height: 64px;

            border-radius: 12px;

            background:
              rgba(255, 255, 255, 0.035);
          }


          .loading-hero {
            margin-bottom: 20px;

            padding: 32px;

            min-height: 235px;

            border:
              1px solid rgba(255, 255, 255, 0.07);

            border-radius: 22px;

            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.045),
                rgba(255, 255, 255, 0.018)
              );
          }


          .loading-hero-top {
            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 20px;
          }


          .loading-title-area {
            display: flex;

            align-items: flex-start;

            gap: 16px;

            flex: 1;

            min-width: 0;
          }


          .loading-icon {
            width: 54px;

            height: 54px;

            flex-shrink: 0;

            border-radius: 16px;

            background:
              rgba(77, 124, 255, 0.1);
          }


          .loading-title-content {
            flex: 1;

            min-width: 0;
          }


          .loading-title {
            width: min(420px, 80%);

            height: 30px;

            margin-bottom: 10px;

            border-radius: 8px;
          }


          .loading-id {
            width: 150px;

            height: 12px;

            border-radius: 6px;
          }


          .loading-status {
            width: 95px;

            height: 32px;

            border-radius: 999px;
          }


          .loading-description {
            margin-top: 28px;

            padding-top: 22px;

            border-top:
              1px solid rgba(255, 255, 255, 0.06);
          }


          .loading-description-label {
            width: 90px;

            height: 11px;

            margin-bottom: 12px;
          }


          .loading-description-line {
            width: 90%;

            height: 12px;

            margin-bottom: 9px;

            border-radius: 6px;
          }


          .loading-description-line.short {
            width: 62%;

            margin-bottom: 0;
          }


          .loading-details-grid {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 18px;
          }


          .loading-detail-card {
            min-height: 245px;

            padding: 22px;

            border:
              1px solid rgba(255, 255, 255, 0.06);

            border-radius: 18px;

            background:
              rgba(255, 255, 255, 0.025);
          }


          .loading-detail-heading {
            width: 180px;

            height: 16px;

            margin-bottom: 24px;
          }


          .loading-detail-row {
            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 20px;

            padding: 14px 0;

            border-bottom:
              1px solid rgba(255, 255, 255, 0.05);
          }


          .loading-detail-row:last-child {
            border-bottom: 0;
          }


          .loading-detail-label {
            width: 90px;

            height: 12px;
          }


          .loading-detail-value {
            width: 130px;

            height: 12px;
          }


          .loading-status-indicator {
            position: absolute;

            left: 50%;

            bottom: 28px;

            width: 30px;

            height: 30px;

            display: flex;

            align-items: center;

            justify-content: center;

            transform: translateX(-50%);

            color: #9bb9ff;

            opacity: 0.9;
          }


          .loading-spinner {
            animation:
              workflow-details-spin 1s linear infinite;
          }


          @keyframes workflow-details-spin {

            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }

          }


          @keyframes workflow-skeleton-shimmer {

            0% {
              transform: translateX(-100%);
            }

            100% {
              transform: translateX(100%);
            }

          }


          @media (max-width: 800px) {

            .workflow-details-page {
              padding: 20px;
            }


            .details-loading-state {
              padding: 18px;
            }


            .loading-topbar {
              align-items: flex-start;

              flex-direction: column;
            }


            .loading-button-row {
              width: 100%;
            }


            .loading-button {
              flex: 1;

              min-width: 120px;
            }


            .loading-context {
              display: none;
            }


            .loading-execution-grid {
              grid-template-columns: 1fr;
            }


            .loading-hero {
              padding: 24px;
            }


            .loading-hero-top {
              flex-direction: column;
            }


            .loading-status {
              width: 90px;
            }


            .loading-details-grid {
              grid-template-columns: 1fr;
            }

          }


          @media (max-width: 500px) {

            .workflow-details-page {
              padding: 16px;
            }


            .details-loading-state {
              padding: 14px;
            }


            .loading-button-row {
              flex-direction: column;
            }


            .loading-button {
              width: 100%;

              flex: none;
            }


            .loading-hero {
              padding: 20px;
            }


            .loading-title-area {
              flex-direction: column;
            }


            .loading-title {
              width: 90%;

              height: 26px;
            }


            .loading-description-line {
              width: 100%;
            }


            .loading-description-line.short {
              width: 72%;
            }


            .loading-detail-row {
              align-items: flex-start;

              flex-direction: column;

              gap: 9px;
            }


            .loading-detail-value {
              width: 75%;
            }

          }


          @media (prefers-reduced-motion: reduce) {

            .details-loading-state::after {
              animation: none;
            }


            .loading-spinner {
              animation: none;
            }

          }

        `}</style>


        <div className="details-container">

          <div
            className="details-loading-state"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >

            <div className="loading-topbar">

              <div className="loading-button-row">

                <div
                  className="loading-block loading-button"
                  aria-hidden="true"
                />

                <div
                  className="loading-block loading-button"
                  aria-hidden="true"
                />

                <div
                  className="loading-block loading-button"
                  aria-hidden="true"
                />

              </div>

              <div
                className="loading-block loading-context"
                aria-hidden="true"
              />

            </div>


            <div className="loading-execution">

              <div
                className="loading-block loading-heading"
                aria-hidden="true"
              />

              <div className="loading-execution-grid">

                <div
                  className="loading-execution-item"
                  aria-hidden="true"
                />

                <div
                  className="loading-execution-item"
                  aria-hidden="true"
                />

                <div
                  className="loading-execution-item"
                  aria-hidden="true"
                />

              </div>

            </div>


            <div className="loading-hero">

              <div className="loading-hero-top">

                <div className="loading-title-area">

                  <div
                    className="loading-block loading-icon"
                    aria-hidden="true"
                  />

                  <div className="loading-title-content">

                    <div
                      className="loading-block loading-title"
                      aria-hidden="true"
                    />

                    <div
                      className="loading-block loading-id"
                      aria-hidden="true"
                    />

                  </div>

                </div>


                <div
                  className="loading-block loading-status"
                  aria-hidden="true"
                />

              </div>


              <div className="loading-description">

                <div
                  className="loading-block loading-description-label"
                  aria-hidden="true"
                />

                <div
                  className="loading-block loading-description-line"
                  aria-hidden="true"
                />

                <div
                  className="loading-block loading-description-line short"
                  aria-hidden="true"
                />

              </div>

            </div>


            <div className="loading-details-grid">

              <div className="loading-detail-card">

                <div
                  className="loading-block loading-detail-heading"
                  aria-hidden="true"
                />

                <div className="loading-detail-row">

                  <div
                    className="loading-block loading-detail-label"
                    aria-hidden="true"
                  />

                  <div
                    className="loading-block loading-detail-value"
                    aria-hidden="true"
                  />

                </div>

                <div className="loading-detail-row">

                  <div
                    className="loading-block loading-detail-label"
                    aria-hidden="true"
                  />

                  <div
                    className="loading-block loading-detail-value"
                    aria-hidden="true"
                  />

                </div>

                <div className="loading-detail-row">

                  <div
                    className="loading-block loading-detail-label"
                    aria-hidden="true"
                  />

                  <div
                    className="loading-block loading-detail-value"
                    aria-hidden="true"
                  />

                </div>

                <div className="loading-detail-row">

                  <div
                    className="loading-block loading-detail-label"
                    aria-hidden="true"
                  />

                  <div
                    className="loading-block loading-detail-value"
                    aria-hidden="true"
                  />

                </div>

              </div>


              <div className="loading-detail-card">

                <div
                  className="loading-block loading-detail-heading"
                  aria-hidden="true"
                />

                <div className="loading-detail-row">

                  <div
                    className="loading-block loading-detail-label"
                    aria-hidden="true"
                  />

                  <div
                    className="loading-block loading-detail-value"
                    aria-hidden="true"
                  />

                </div>

                <div className="loading-detail-row">

                  <div
                    className="loading-block loading-detail-label"
                    aria-hidden="true"
                  />

                  <div
                    className="loading-block loading-detail-value"
                    aria-hidden="true"
                  />

                </div>

              </div>

            </div>


            <div
              className="loading-status-indicator"
              aria-hidden="true"
            >

              <Loader2
                size={22}
                className="loading-spinner"
              />

            </div>

          </div>

        </div>

      </div>
    );
  }


  /*
   * =========================
   * ERROR STATE
   * =========================
   */

  if (error) {

    return (
      <div className="workflow-details-page">

        <style>{`

          .workflow-details-page {
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
                rgba(255, 77, 96, 0.06),
                transparent 30%
              ),

              #070b14;
          }


          .details-container {
            max-width: 1100px;

            margin: 0 auto;
          }


          /*
           * =========================
           * ERROR STATE
           * =========================
           */

          .details-state {
            position: relative;

            min-height: 500px;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 30px;

            overflow: hidden;

            border:
              1px solid rgba(255, 77, 96, 0.12);

            border-radius: 22px;

            background:
              radial-gradient(
                circle at 50% 35%,
                rgba(255, 77, 96, 0.07),
                transparent 38%
              ),

              rgba(255, 255, 255, 0.02);

            animation:
              workflow-error-enter 0.35s ease-out both;
          }


          .details-state::before {
            content: "";

            position: absolute;

            width: 260px;

            height: 260px;

            top: 50%;

            left: 50%;

            transform: translate(-50%, -50%);

            border:
              1px solid rgba(255, 77, 96, 0.06);

            border-radius: 50%;

            pointer-events: none;
          }


          .details-state::after {
            content: "";

            position: absolute;

            width: 360px;

            height: 360px;

            top: 50%;

            left: 50%;

            transform: translate(-50%, -50%);

            border:
              1px solid rgba(255, 77, 96, 0.035);

            border-radius: 50%;

            pointer-events: none;
          }


          .state-content {
            position: relative;

            z-index: 1;

            width: 100%;

            max-width: 470px;

            text-align: center;

            animation:
              workflow-error-content-enter 0.45s ease-out both;
          }


          .state-eyebrow {
            display: inline-flex;

            align-items: center;

            gap: 6px;

            margin-bottom: 16px;

            color: #ff8e9b;

            font-size: 10px;

            font-weight: 700;

            letter-spacing: 1.4px;

            text-transform: uppercase;
          }


          .state-icon {
            width: 64px;

            height: 64px;

            margin: 0 auto 20px;

            display: flex;

            align-items: center;

            justify-content: center;

            border:
              1px solid rgba(255, 77, 96, 0.2);

            border-radius: 18px;

            color: #ff9aa5;

            background:
              rgba(255, 77, 96, 0.1);

            box-shadow:
              0 0 0 8px rgba(255, 77, 96, 0.025);

            animation:
              workflow-error-icon-pulse 2.8s ease-in-out infinite;
          }


          .state-content h2 {
            margin: 0 0 10px;

            color: #f0f4ff;

            font-size: 23px;

            font-weight: 700;

            letter-spacing: -0.3px;
          }


          .state-content p {
            margin: 0;

            color: #8793aa;

            font-size: 14px;

            line-height: 1.7;
          }


          .error-detail {
            margin: 18px auto 0;

            display: inline-flex;

            align-items: center;

            gap: 8px;

            padding: 8px 12px;

            border:
              1px solid rgba(255, 255, 255, 0.06);

            border-radius: 999px;

            color: #69758c;

            background:
              rgba(255, 255, 255, 0.025);

            font-size: 11px;

            letter-spacing: 0.2px;
          }


          .error-detail-dot {
            width: 6px;

            height: 6px;

            flex-shrink: 0;

            border-radius: 50%;

            background: #ff7f8d;

            box-shadow:
              0 0 0 4px rgba(255, 77, 96, 0.08);
          }


          .state-actions {
            margin-top: 24px;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 10px;

            flex-wrap: wrap;
          }


          .retry-button,
          .back-button {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 8px;

            min-height: 40px;

            padding: 10px 15px;

            border-radius: 10px;

            font-size: 13px;

            font-weight: 600;

            cursor: pointer;

            transition:
              transform 0.2s ease,
              background 0.2s ease,
              border-color 0.2s ease,
              opacity 0.2s ease;
          }


          .retry-button {
            position: relative;

            overflow: hidden;

            border:
              1px solid rgba(77, 124, 255, 0.35);

            color: #dce5f8;

            background:
              rgba(77, 124, 255, 0.11);
          }


          .retry-button:hover:not(:disabled) {
            transform: translateY(-1px);

            border-color:
              rgba(77, 124, 255, 0.55);

            background:
              rgba(77, 124, 255, 0.18);
          }


          .retry-button:active:not(:disabled) {
            transform: translateY(0);
          }


          .retry-button:disabled {
            opacity: 0.65;

            cursor: not-allowed;
          }


          .back-button {
            border:
              1px solid rgba(255, 255, 255, 0.1);

            color: #cbd4e5;

            background:
              rgba(255, 255, 255, 0.04);
          }


          .back-button:hover {
            transform: translateX(-2px);

            background:
              rgba(255, 255, 255, 0.08);

            border-color:
              rgba(77, 124, 255, 0.35);
          }


          .retry-button:focus-visible,
          .back-button:focus-visible {
            outline:
              2px solid rgba(77, 124, 255, 0.8);

            outline-offset: 3px;
          }


          .retry-icon.spin {
            animation:
              workflow-details-spin 1s linear infinite;
          }


          .error-live-status {
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


          @keyframes workflow-error-enter {

            from {
              opacity: 0;

              transform: translateY(8px);
            }

            to {
              opacity: 1;

              transform: translateY(0);
            }

          }


          @keyframes workflow-error-content-enter {

            from {
              opacity: 0;

              transform: translateY(10px);
            }

            to {
              opacity: 1;

              transform: translateY(0);
            }

          }


          @keyframes workflow-error-icon-pulse {

            0%,
            100% {
              box-shadow:
                0 0 0 8px rgba(255, 77, 96, 0.025);
            }

            50% {
              box-shadow:
                0 0 0 12px rgba(255, 77, 96, 0.045);
            }

          }


          @keyframes workflow-details-spin {

            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }

          }


          @media (max-width: 800px) {

            .workflow-details-page {
              padding: 20px;
            }


            .details-state {
              min-height: 460px;

              padding: 24px;
            }

          }


          @media (max-width: 500px) {

            .workflow-details-page {
              padding: 16px;
            }


            .details-state {
              min-height: 430px;

              padding: 20px;
            }


            .state-content h2 {
              font-size: 20px;
            }


            .state-content p {
              font-size: 13px;
            }


            .state-actions {
              width: 100%;

              flex-direction: column;
            }


            .retry-button,
            .back-button {
              width: 100%;
            }

          }


          @media (prefers-reduced-motion: reduce) {

            .details-state,
            .state-content,
            .state-icon {
              animation: none;
            }


            .retry-icon.spin {
              animation: none;
            }


            .retry-button,
            .back-button {
              transition: none;
            }

          }

        `}</style>


        <div className="details-container">

          <div
            className="details-state"
            role="alert"
            aria-live="assertive"
            aria-busy={retrying}
          >

            <div className="state-content">

              <div className="state-eyebrow">
                <AlertCircle
                  size={11}
                  aria-hidden="true"
                />

                Workflow service
              </div>


              <div
                className="state-icon"
                aria-hidden="true"
              >

                <AlertCircle size={29} />

              </div>


              <h2>
                Unable to load workflow
              </h2>


              <p>
                {error}
              </p>


              <div
                className="error-detail"
                aria-hidden="true"
              >

                <span className="error-detail-dot" />

                Workflow request could not be completed

              </div>


              <div className="state-actions">

                <button
                  type="button"
                  className="retry-button"
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
                  aria-label="Return to workflows"
                >

                  <ArrowLeft
                    size={16}
                    aria-hidden="true"
                  />

                  Back to Workflows

                </button>

              </div>


              <span
                className="error-live-status"
                aria-live="polite"
              >
                {retrying
                  ? "Retrying the workflow request."
                  : ""}
              </span>

            </div>

          </div>

        </div>

      </div>
    );
  }


  /*
   * =========================
   * NO WORKFLOW
   * =========================
   */

  if (!workflow) {
    return null;
  }


  const status = String(
    workflow.status || "UNKNOWN"
  ).toUpperCase();


  const statusConfig =
    getStatusConfig(status);


  const StatusIcon =
    statusConfig.icon;


  const executionStatus =
    String(
      execution?.status || ""
    ).toUpperCase();


  /*
   * =========================
   * MAIN UI
   * =========================
   */

  return (

    <div className="workflow-details-page">

      <style>{`

        .workflow-details-page {
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


        .details-container {
          max-width: 1100px;

          margin: 0 auto;
        }


        .details-topbar {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 28px;
        }


        .topbar-actions {
          display: flex;

          align-items: center;

          gap: 10px;

          flex-wrap: wrap;
        }


        .back-button,
        .edit-button,
        .execute-button,
        .complete-button {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 10px 15px;

          border-radius: 10px;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .back-button {
          border:
            1px solid rgba(255, 255, 255, 0.1);

          color: #dce5f8;

          background:
            rgba(255, 255, 255, 0.04);
        }


        .back-button:hover {
          background:
            rgba(255, 255, 255, 0.08);

          border-color:
            rgba(77, 124, 255, 0.35);

          transform: translateX(-2px);
        }


        .edit-button {
          border:
            1px solid rgba(77, 124, 255, 0.3);

          color: #dce5f8;

          background:
            rgba(77, 124, 255, 0.1);
        }


        .edit-button:hover {
          background:
            rgba(77, 124, 255, 0.17);

          border-color:
            rgba(77, 124, 255, 0.5);
        }


        .execute-button {
          border:
            1px solid rgba(0, 212, 170, 0.35);

          color: #72f0d0;

          background:
            rgba(0, 212, 170, 0.1);
        }


        .execute-button:hover {
          background:
            rgba(0, 212, 170, 0.17);

          border-color:
            rgba(0, 212, 170, 0.55);
        }


        .complete-button {
          border:
            1px solid rgba(77, 124, 255, 0.35);

          color: #9bb9ff;

          background:
            rgba(77, 124, 255, 0.1);
        }


        .complete-button:hover {
          background:
            rgba(77, 124, 255, 0.18);

          border-color:
            rgba(77, 124, 255, 0.55);
        }


        .execute-button:disabled,
        .complete-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }


        .back-button:focus-visible,
        .edit-button:focus-visible,
        .execute-button:focus-visible,
        .complete-button:focus-visible {
          outline: 2px solid rgba(77, 124, 255, 0.75);

          outline-offset: 3px;
        }


        .page-context {
          color: #69758c;

          font-size: 12px;

          letter-spacing: 0.8px;

          text-transform: uppercase;
        }


        .execution-message {
          margin-bottom: 20px;

          padding: 13px 16px;

          border:
            1px solid rgba(0, 212, 170, 0.25);

          border-radius: 12px;

          color: #72f0d0;

          background:
            rgba(0, 212, 170, 0.08);

          font-size: 13px;
        }


        .execution-card {
          margin-bottom: 20px;

          padding: 22px;

          border:
            1px solid rgba(255, 255, 255, 0.07);

          border-radius: 18px;

          background:
            rgba(255, 255, 255, 0.035);
        }


        .execution-card h3 {
          display: flex;

          align-items: center;

          gap: 8px;

          margin: 0 0 18px;

          color: #e8eefc;

          font-size: 14px;
        }


        .execution-info {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 15px;
        }


        .execution-item {
          padding: 14px;

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.03);
        }


        .execution-item-label {
          display: block;

          margin-bottom: 6px;

          color: #69758c;

          font-size: 11px;

          text-transform: uppercase;

          letter-spacing: 0.8px;
        }


        .execution-item-value {
          color: #cbd4e5;

          font-size: 13px;
        }


        .running {
          color: #62e6c3;
        }


        .completed {
          color: #76b7ff;
        }


        .details-hero {
          position: relative;

          overflow: hidden;

          padding: 32px;

          margin-bottom: 20px;

          border:
            1px solid rgba(255, 255, 255, 0.08);

          border-radius: 22px;

          background:

            radial-gradient(
              circle at 100% 0%,
              rgba(77, 124, 255, 0.13),
              transparent 35%
            ),

            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.055),
              rgba(255, 255, 255, 0.018)
            );
        }


        .hero-top {
          position: relative;

          z-index: 1;

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 20px;
        }


        .hero-title-section {
          display: flex;

          align-items: flex-start;

          gap: 16px;

          min-width: 0;
        }


        .hero-icon {
          flex-shrink: 0;

          width: 54px;
          height: 54px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 16px;

          color: #9bb9ff;

          background:
            rgba(77, 124, 255, 0.12);

          border:
            1px solid rgba(77, 124, 255, 0.25);
        }


        .hero-title {
          margin: 0;

          color: #f0f4ff;

          font-size: 30px;

          font-weight: 700;

          letter-spacing: -0.6px;

          word-break: break-word;
        }


        .workflow-id {
          margin-top: 7px;

          color: #69758c;

          font-size: 12px;
        }


        .status-badge {
          flex-shrink: 0;

          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding: 8px 12px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 650;

          background:
            rgba(255, 255, 255, 0.06);

          color: #cdd7eb;
        }


        .status-badge.active {
          color: #62e6c3;

          background:
            rgba(0, 212, 170, 0.1);
        }


        .status-badge.draft {
          color: #aebbd3;

          background:
            rgba(148, 163, 184, 0.1);
        }


        .status-badge.completed {
          color: #76b7ff;

          background:
            rgba(77, 124, 255, 0.1);
        }


        .status-badge.cancelled {
          color: #ff8e9b;

          background:
            rgba(255, 77, 96, 0.1);
        }


        .description-section {
          position: relative;

          z-index: 1;

          margin-top: 28px;

          padding-top: 22px;

          border-top:
            1px solid rgba(255, 255, 255, 0.07);
        }


        .section-label {
          margin-bottom: 9px;

          color: #69758c;

          font-size: 11px;

          text-transform: uppercase;

          letter-spacing: 1px;
        }


        .description {
          margin: 0;

          color: #b5bfd1;

          font-size: 14px;

          line-height: 1.75;
        }


        .details-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 18px;
        }


        .detail-card {
          padding: 22px;

          border:
            1px solid rgba(255, 255, 255, 0.07);

          border-radius: 18px;

          background:
            rgba(255, 255, 255, 0.035);
        }


        .detail-card h3 {
          display: flex;

          align-items: center;

          gap: 8px;

          margin: 0 0 20px;

          color: #e8eefc;

          font-size: 14px;
        }


        .detail-row {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 20px;

          padding: 13px 0;

          border-bottom:
            1px solid rgba(255, 255, 255, 0.05);
        }


        .detail-row:first-of-type {
          padding-top: 0;
        }


        .detail-row:last-child {
          padding-bottom: 0;

          border-bottom: 0;
        }


        .detail-label {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #7f8ba3;

          font-size: 12px;
        }


        .detail-value {
          max-width: 65%;

          color: #cbd4e5;

          font-size: 12px;

          text-align: right;

          word-break: break-word;
        }


        .status-value {
          display: inline-flex;

          align-items: center;

          gap: 6px;
        }


        @media (max-width: 800px) {

          .workflow-details-page {
            padding: 20px;
          }

          .details-topbar {
            align-items: flex-start;

            flex-direction: column;
          }

          .hero-top {
            flex-direction: column;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .execution-info {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: 25px;
          }

        }


        @media (max-width: 500px) {

          .details-hero {
            padding: 22px;
          }

          .hero-title-section {
            flex-direction: column;
          }

          .detail-row {
            flex-direction: column;

            gap: 6px;
          }

          .detail-value {
            max-width: 100%;

            text-align: left;
          }

        }

      `}</style>


      <div className="details-container">


        {/* =========================
            TOP BAR
            ========================= */}

        <div
          className="details-topbar"
          aria-label="Workflow actions"
        >

          <div className="topbar-actions">

            <button
              type="button"
              className="back-button"
              onClick={() =>
                navigate("/workflows")
              }
              aria-label="Return to workflows"
            >

              <ArrowLeft
                size={16}
                aria-hidden="true"
              />

              Back to Workflows

            </button>


            <button
              type="button"
              className="edit-button"
              onClick={() =>
                navigate(
                  `/workflows/${id}/edit`
                )
              }
              aria-label={`Edit workflow ${
                workflow.name || ""
              }`}
            >

              <Edit3
                size={15}
                aria-hidden="true"
              />

              Edit Workflow

            </button>


            {/* START EXECUTION */}

            <button
              type="button"
              className="execute-button"
              onClick={handleStartExecution}
              disabled={
                startingExecution ||
                executionStatus === "RUNNING"
              }
              aria-label={
                startingExecution
                  ? "Starting workflow execution"
                  : executionStatus === "RUNNING"
                  ? "Workflow execution is currently running"
                  : `Start execution for ${
                      workflow.name || "this workflow"
                    }`
              }
              aria-busy={startingExecution}
            >

              {startingExecution ? (

                <Loader2
                  size={15}
                  className="spin"
                  aria-hidden="true"
                />

              ) : (

                <Play
                  size={15}
                  aria-hidden="true"
                />

              )}

              {startingExecution
                ? "Starting..."
                : executionStatus === "RUNNING"
                ? "Execution Running"
                : "Start Execution"}

            </button>


            {/* COMPLETE EXECUTION */}

            {executionStatus === "RUNNING" && (

              <button
                type="button"
                className="complete-button"
                onClick={handleCompleteExecution}
                disabled={completingExecution}
                aria-label={
                  completingExecution
                    ? "Completing workflow execution"
                    : "Complete current workflow execution"
                }
                aria-busy={completingExecution}
              >

                {completingExecution ? (

                  <Loader2
                    size={15}
                    className="spin"
                    aria-hidden="true"
                  />

                ) : (

                  <Check
                    size={15}
                    aria-hidden="true"
                  />

                )}

                {completingExecution
                  ? "Completing..."
                  : "Complete Execution"}

              </button>

            )}


            <DeleteWorkflowButton
              workflowId={id}
              onDeleted={() =>
                navigate("/workflows")
              }
            />

          </div>


          <div className="page-context">

            Workflow Details

          </div>

        </div>


        {/* =========================
            EXECUTION MESSAGE
            ========================= */}

        {executionMessage && (

          <div
            className="execution-message"
            role="status"
            aria-live="polite"
          >

            {executionMessage}

          </div>

        )}


        {/* =========================
            EXECUTION STATUS
            ========================= */}

        {execution && (

          <section
            className="execution-card"
            aria-labelledby="current-execution-heading"
          >

            <h3 id="current-execution-heading">

              <Activity
                size={16}
                aria-hidden="true"
              />

              Current Execution

            </h3>


            <div
              className="execution-info"
              aria-label="Current execution information"
            >

              <div className="execution-item">

                <span className="execution-item-label">
                  Execution ID
                </span>

                <span className="execution-item-value">
                  #{execution.id}
                </span>

              </div>


              <div className="execution-item">

                <span className="execution-item-label">
                  Status
                </span>

                <span
                  className={
                    `execution-item-value ${
                      executionStatus === "RUNNING"
                        ? "running"
                        : executionStatus === "COMPLETED"
                        ? "completed"
                        : ""
                    }`
                  }
                >

                  {executionStatus}

                </span>

              </div>


              <div className="execution-item">

                <span className="execution-item-label">
                  Started At
                </span>

                <span className="execution-item-value">

                  {formatDate(
                    execution.startedAt
                  )}

                </span>

              </div>

            </div>

          </section>

        )}


        {/* =========================
            HERO
            ========================= */}

        <section
          className="details-hero"
          aria-labelledby="workflow-details-heading"
        >

          <div className="hero-top">

            <div className="hero-title-section">

              <div
                className="hero-icon"
                aria-hidden="true"
              >

                <WorkflowIcon size={27} />

              </div>


              <div>

                <h1
                  id="workflow-details-heading"
                  className="hero-title"
                >

                  {workflow.name ||
                    "Unnamed Workflow"}

                </h1>


                <div className="workflow-id">

                  Workflow ID: {workflow.id}

                </div>

              </div>

            </div>


            <div
              className={
                `status-badge ${status.toLowerCase()}`
              }
              aria-label={`Workflow status: ${statusConfig.label}`}
            >

              <StatusIcon
                size={14}
                aria-hidden="true"
              />

              {statusConfig.label}

            </div>

          </div>


          <div className="description-section">

            <div
              className="section-label"
              id="workflow-description-label"
            >

              Description

            </div>


            <p
              className="description"
              aria-labelledby="workflow-description-label"
            >

              {workflow.description ||
                "No description has been provided for this workflow."}

            </p>

          </div>

        </section>


        {/* =========================
            DETAILS
            ========================= */}

        <section
          className="details-grid"
          aria-label="Workflow information and timeline"
        >


          {/* WORKFLOW INFORMATION */}

          <section
            className="detail-card"
            aria-labelledby="workflow-information-heading"
          >

            <h3 id="workflow-information-heading">

              <GitBranch
                size={16}
                aria-hidden="true"
              />

              Workflow Information

            </h3>


            <div className="detail-row">

              <div className="detail-label">

                <WorkflowIcon
                  size={14}
                  aria-hidden="true"
                />

                Name

              </div>

              <div className="detail-value">

                {workflow.name || "—"}

              </div>

            </div>


            <div className="detail-row">

              <div className="detail-label">

                <GitBranch
                  size={14}
                  aria-hidden="true"
                />

                Workflow ID

              </div>

              <div className="detail-value">

                {workflow.id ?? "—"}

              </div>

            </div>


            <div className="detail-row">

              <div className="detail-label">

                <Activity
                  size={14}
                  aria-hidden="true"
                />

                Status

              </div>

              <div className="detail-value status-value">

                <StatusIcon
                  size={13}
                  aria-hidden="true"
                />

                {statusConfig.label}

              </div>

            </div>


            <div className="detail-row">

              <div className="detail-label">

                <GitBranch
                  size={14}
                  aria-hidden="true"
                />

                Created By

              </div>

              <div className="detail-value">

                {
                  typeof workflow.createdBy ===
                  "object"

                    ? workflow.createdBy?.email ||
                      workflow.createdBy?.username ||
                      workflow.createdBy?.id ||
                      "User"

                    : workflow.createdBy ||
                      "—"
                }

              </div>

            </div>

          </section>


          {/* TIMELINE */}

          <section
            className="detail-card"
            aria-labelledby="timeline-heading"
          >

            <h3 id="timeline-heading">

              <Calendar
                size={16}
                aria-hidden="true"
              />

              Timeline

            </h3>


            <div className="detail-row">

              <div className="detail-label">

                <Calendar
                  size={14}
                  aria-hidden="true"
                />

                Created At

              </div>

              <div className="detail-value">

                {formatDate(
                  workflow.createdAt
                )}

              </div>

            </div>


            <div className="detail-row">

              <div className="detail-label">

                <Clock3
                  size={14}
                  aria-hidden="true"
                />

                Updated At

              </div>

              <div className="detail-value">

                {formatDate(
                  workflow.updatedAt
                )}

              </div>

            </div>


          </section>


        </section>


      </div>

    </div>
  );
};


export default WorkflowDetails;