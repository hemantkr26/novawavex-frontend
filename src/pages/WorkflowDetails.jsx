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

  const loadWorkflow = async () => {
    try {
      setLoading(true);

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

    }
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

          .details-state {
            min-height: 500px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: 1px dashed rgba(255, 255, 255, 0.1);

            border-radius: 20px;

            background:
              rgba(255, 255, 255, 0.02);
          }

          .state-content {
            text-align: center;
          }

          .state-icon {
            width: 56px;
            height: 56px;

            margin: 0 auto 18px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 16px;

            color: #9bb9ff;

            background:
              rgba(77, 124, 255, 0.1);
          }

          .state-content h2 {
            margin: 0 0 8px;

            font-size: 21px;
          }

          .state-content p {
            margin: 0;

            color: #7f8ba3;

            font-size: 14px;
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

        `}</style>


        <div className="details-container">

          <div className="details-state">

            <div className="state-content">

              <div className="state-icon">

                <Loader2
                  size={27}
                  className="spin"
                />

              </div>

              <h2>
                Loading workflow
              </h2>

              <p>
                Connecting to the NovaWavex workflow engine...
              </p>

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

              #070b14;
          }

          .details-container {
            max-width: 1100px;

            margin: 0 auto;
          }

          .details-state {
            min-height: 500px;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 30px;

            border:
              1px dashed rgba(255, 255, 255, 0.1);

            border-radius: 20px;

            background:
              rgba(255, 255, 255, 0.02);
          }

          .state-content {
            text-align: center;

            max-width: 440px;
          }

          .state-icon {
            width: 56px;
            height: 56px;

            margin: 0 auto 18px;

            display: flex;

            align-items: center;
            justify-content: center;

            border-radius: 16px;

            color: #ff9aa5;

            background:
              rgba(255, 77, 96, 0.1);
          }

          .state-content h2 {
            margin: 0 0 8px;

            font-size: 21px;
          }

          .state-content p {
            margin: 0;

            color: #7f8ba3;

            font-size: 14px;

            line-height: 1.6;
          }

          .back-button {
            margin-top: 20px;

            display: inline-flex;

            align-items: center;

            gap: 8px;

            padding: 10px 15px;

            border:
              1px solid rgba(77, 124, 255, 0.3);

            border-radius: 10px;

            color: #dce5f8;

            background:
              rgba(77, 124, 255, 0.1);

            cursor: pointer;
          }

        `}</style>


        <div className="details-container">

          <div className="details-state">

            <div className="state-content">

              <div className="state-icon">

                <AlertCircle size={27} />

              </div>

              <h2>
                Unable to load workflow
              </h2>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="back-button"
                onClick={() =>
                  navigate("/workflows")
                }
              >

                <ArrowLeft size={16} />

                Back to Workflows

              </button>

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

        <div className="details-topbar">

          <div className="topbar-actions">

            <button
              type="button"
              className="back-button"
              onClick={() =>
                navigate("/workflows")
              }
            >

              <ArrowLeft size={16} />

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
            >

              <Edit3 size={15} />

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
            >

              {startingExecution ? (

                <Loader2
                  size={15}
                  className="spin"
                />

              ) : (

                <Play size={15} />

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
              >

                {completingExecution ? (

                  <Loader2
                    size={15}
                    className="spin"
                  />

                ) : (

                  <Check size={15} />

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

          <div className="execution-message">

            {executionMessage}

          </div>

        )}


        {/* =========================
            EXECUTION STATUS
            ========================= */}

        {execution && (

          <section className="execution-card">

            <h3>

              <Activity size={16} />

              Current Execution

            </h3>


            <div className="execution-info">

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

        <section className="details-hero">

          <div className="hero-top">

            <div className="hero-title-section">

              <div className="hero-icon">

                <WorkflowIcon size={27} />

              </div>


              <div>

                <h1 className="hero-title">

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
            >

              <StatusIcon size={14} />

              {statusConfig.label}

            </div>

          </div>


          <div className="description-section">

            <div className="section-label">

              Description

            </div>


            <p className="description">

              {workflow.description ||
                "No description has been provided for this workflow."}

            </p>

          </div>

        </section>


        {/* =========================
            DETAILS
            ========================= */}

        <section className="details-grid">


          {/* WORKFLOW INFORMATION */}

          <div className="detail-card">

            <h3>

              <GitBranch size={16} />

              Workflow Information

            </h3>


            <div className="detail-row">

              <div className="detail-label">

                <WorkflowIcon size={14} />

                Name

              </div>

              <div className="detail-value">

                {workflow.name || "—"}

              </div>

            </div>


            <div className="detail-row">

              <div className="detail-label">

                <GitBranch size={14} />

                Workflow ID

              </div>

              <div className="detail-value">

                {workflow.id ?? "—"}

              </div>

            </div>


            <div className="detail-row">

              <div className="detail-label">

                <Activity size={14} />

                Status

              </div>

              <div className="detail-value status-value">

                <StatusIcon size={13} />

                {statusConfig.label}

              </div>

            </div>


            <div className="detail-row">

              <div className="detail-label">

                <GitBranch size={14} />

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

          </div>


          {/* TIMELINE */}

          <div className="detail-card">

            <h3>

              <Calendar size={16} />

              Timeline

            </h3>


            <div className="detail-row">

              <div className="detail-label">

                <Calendar size={14} />

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

                <Clock3 size={14} />

                Updated At

              </div>

              <div className="detail-value">

                {formatDate(
                  workflow.updatedAt
                )}

              </div>

            </div>


          </div>


        </section>


      </div>

    </div>
  );
};


export default WorkflowDetails;