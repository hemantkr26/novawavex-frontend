import React, { useEffect, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  GitBranch,
  Play,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import workflowService from "../services/workflowService";
import api from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [health, setHealth] = useState(null);

  const [loading, setLoading] = useState(true);
  const [executionLoading, setExecutionLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [healthError, setHealthError] = useState(null);

  /*
   * =========================================
   * LOAD WORKFLOWS
   * =========================================
   */

  const loadWorkflows = async () => {
    try {
      setError(null);

      const data = await workflowService.getAllWorkflows();

      console.log("NovaWavex workflows:", data);

      setWorkflows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load workflows:", err);

      setWorkflows([]);

      setError(
        "We couldn't retrieve your workflow data right now."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================
   * LOAD EXECUTIONS
   * =========================================
   */

  const loadExecutions = async () => {
    try {
      setExecutionError(null);

      const response = await api.get("/api/executions");

      console.log(
        "NovaWavex executions:",
        response.data
      );

      setExecutions(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load executions:",
        err
      );

      setExecutions([]);

      setExecutionError(
        "We couldn't retrieve recent execution activity."
      );
    } finally {
      setExecutionLoading(false);
    }
  };

  /*
   * =========================================
   * LOAD SYSTEM HEALTH
   * =========================================
   */

  const loadHealth = async () => {
    try {
      setHealthError(null);

      const response = await api.get(
        "/actuator/health"
      );

      console.log(
        "NovaWavex system health:",
        response.data
      );

      setHealth(response.data);
    } catch (err) {
      console.error(
        "Failed to load system health:",
        err
      );

      setHealth(null);

      setHealthError(
        "We couldn't verify system health right now."
      );
    } finally {
      setHealthLoading(false);
    }
  };

  /*
   * =========================================
   * INITIAL DASHBOARD LOAD
   * =========================================
   */

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
    loadHealth();
  }, []);

  /*
   * =========================================
   * DASHBOARD REFRESH
   * =========================================
   */

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);

      await Promise.all([
        loadWorkflows(),
        loadExecutions(),
        loadHealth(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  /*
   * =========================================
   * INDIVIDUAL ERROR RETRIES
   * =========================================
   */

  const handleRetryWorkflows = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    await loadWorkflows();
  };

  const handleRetryExecutions = async () => {
    if (executionLoading) {
      return;
    }

    setExecutionLoading(true);

    await loadExecutions();
  };

  const handleRetryHealth = async () => {
    if (healthLoading) {
      return;
    }

    setHealthLoading(true);

    await loadHealth();
  };

  /*
   * =========================================
   * WORKFLOW NAVIGATION
   * =========================================
   */

  const handleWorkflowClick = (workflowId) => {
    navigate(`/workflows/${workflowId}`);
  };

  const handleWorkflowKeyDown = (
    event,
    workflowId
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      handleWorkflowClick(workflowId);
    }
  };

  /*
   * =========================================
   * TIMESTAMP PARSING
   * =========================================
   */

  const parseBackendTimestamp = (
    timestamp
  ) => {
    if (!timestamp) {
      return null;
    }

    if (typeof timestamp !== "string") {
      const date = new Date(timestamp);

      return Number.isNaN(date.getTime())
        ? null
        : date;
    }

    const normalizedTimestamp =
      timestamp.endsWith("Z") ||
      /[+-]\d{2}:\d{2}$/.test(timestamp)
        ? timestamp
        : `${timestamp}Z`;

    const date = new Date(
      normalizedTimestamp
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  /*
   * =========================================
   * RECENT ACTIVITY TIME
   * =========================================
   */

  const formatActivityTime = (
    timestamp
  ) => {
    if (!timestamp) {
      return "Recently";
    }

    const date =
      parseBackendTimestamp(timestamp);

    if (!date) {
      return "Recently";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    const minutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return date.toLocaleDateString();
  };

  /*
   * =========================================
   * RECENT WORKFLOW ACTIVITY
   * =========================================
   */

  const recentWorkflows = [...workflows]
    .sort((a, b) => {
      const dateA =
        parseBackendTimestamp(
          a.updatedAt || a.createdAt
        )?.getTime() || 0;

      const dateB =
        parseBackendTimestamp(
          b.updatedAt || b.createdAt
        )?.getTime() || 0;

      return dateB - dateA;
    })
    .slice(0, 5);

  /*
   * =========================================
   * RECENT EXECUTION ACTIVITY
   * =========================================
   */

  const recentExecutions = [...executions]
    .sort((a, b) => {
      const dateA =
        parseBackendTimestamp(
          a.updatedAt ||
            a.createdAt ||
            a.startedAt
        )?.getTime() || 0;

      const dateB =
        parseBackendTimestamp(
          b.updatedAt ||
            b.createdAt ||
            b.startedAt
        )?.getTime() || 0;

      return dateB - dateA;
    })
    .slice(0, 5);

  /*
   * =========================================
   * COMMAND CENTER ACTIVITY
   * =========================================
   */

  const activityWindow =
    5 * 60 * 1000;

  const latestWorkflow =
    recentWorkflows[0];

  const latestWorkflowTimestamp =
    latestWorkflow?.updatedAt ||
    latestWorkflow?.createdAt;

  const latestWorkflowDate =
    latestWorkflowTimestamp
      ? parseBackendTimestamp(
          latestWorkflowTimestamp
        )
      : null;

  const latestExecution =
    recentExecutions[0];

  const latestExecutionTimestamp =
    latestExecution?.updatedAt ||
    latestExecution?.createdAt;

  const latestExecutionDate =
    latestExecutionTimestamp
      ? parseBackendTimestamp(
          latestExecutionTimestamp
        )
      : null;

  const hasRecentWorkflowActivity =
    latestWorkflowDate &&
    !Number.isNaN(
      latestWorkflowDate.getTime()
    ) &&
    Date.now() -
      latestWorkflowDate.getTime() <=
      activityWindow;

  const hasRecentExecutionActivity =
    latestExecutionDate &&
    !Number.isNaN(
      latestExecutionDate.getTime()
    ) &&
    Date.now() -
      latestExecutionDate.getTime() <=
      activityWindow;

  const hasRecentActivity =
    hasRecentWorkflowActivity ||
    hasRecentExecutionActivity;

  /*
   * =========================================
   * WORKFLOW STATISTICS
   * =========================================
   */

  const totalWorkflows =
    workflows.length;

  const completedWorkflows =
    workflows.filter(
      (workflow) =>
        String(
          workflow.status
        ).toUpperCase() ===
        "COMPLETED"
    ).length;

  /*
   * =========================================
   * EXECUTION STATISTICS
   * =========================================
   */

  const totalExecutions =
    executions.length;

  const completedExecutions =
    executions.filter(
      (execution) =>
        String(
          execution.status
        ).toUpperCase() ===
        "COMPLETED"
    ).length;

  const executionSuccessRate =
    totalExecutions === 0
      ? 0
      : Math.round(
          (completedExecutions /
            totalExecutions) *
            100
        );

  const workflowSuccessRate =
    totalWorkflows === 0
      ? 0
      : Math.round(
          (completedWorkflows /
            totalWorkflows) *
            100
        );

  /*
   * =========================================
   * SYSTEM HEALTH
   * =========================================
   */

  const systemStatus =
    health?.status === "UP";

  const apiHealth =
    healthLoading
      ? null
      : systemStatus
        ? 100
        : 0;

  const databaseHealth =
    healthLoading
      ? null
      : health?.components?.db?.status ===
        "UP"
        ? 100
        : 0;

  /*
   * =========================================
   * WORKFLOW UNIVERSE
   * =========================================
   */

  const universeLatestExecution =
    [...executions]
      .sort((a, b) => {
        const dateA =
          parseBackendTimestamp(
            a.updatedAt ||
              a.createdAt ||
              a.startedAt
          )?.getTime() || 0;

        const dateB =
          parseBackendTimestamp(
            b.updatedAt ||
              b.createdAt ||
              b.startedAt
          )?.getTime() || 0;

        return dateB - dateA;
      })[0] || null;

  const universeExecutionWorkflowId =
    universeLatestExecution?.workflow?.id ??
    universeLatestExecution?.workflowId ??
    null;

  const executionWorkflow =
    universeExecutionWorkflowId !== null
      ? workflows.find(
          (workflow) =>
            String(workflow.id) ===
            String(
              universeExecutionWorkflowId
            )
        )
      : null;

  const universeWorkflow =
    executionWorkflow ||
    recentWorkflows[0] ||
    null;

  const universeWorkflowStatus =
    String(
      universeWorkflow?.status ||
        "UNKNOWN"
    ).toUpperCase();

  const universeExecutionStatus =
    String(
      universeLatestExecution?.status ||
        ""
    ).toUpperCase();

  const universeWorkflowName =
    universeWorkflow?.name ||
    null;

  const universeWorkflowDescription =
    universeWorkflow?.description ||
    null;

  const universeWorkflowTime =
    universeLatestExecution?.updatedAt ||
    universeLatestExecution?.createdAt ||
    universeWorkflow?.updatedAt ||
    universeWorkflow?.createdAt ||
    null;

  /*
   * =========================================
   * WORKFLOW UNIVERSE EXECUTION STATE
   * =========================================
   */

  const universeHasExecution =
    universeLatestExecution &&
    universeExecutionWorkflowId !== null &&
    universeWorkflow !== null;

  const universeExecutionRunning =
    universeHasExecution &&
    universeExecutionStatus === "RUNNING";

  const universeExecutionCompleted =
    universeHasExecution &&
    universeExecutionStatus === "COMPLETED";

  const universeExecutionFailed =
    universeHasExecution &&
    universeExecutionStatus === "FAILED";

  const universeExecutionCancelled =
    universeHasExecution &&
    universeExecutionStatus === "CANCELLED";

  /*
   * Trigger stage
   */

  const universeTriggerActive =
    universeExecutionRunning ||
    universeExecutionCompleted;

  /*
   * Validate stage
   */

  const universeValidateActive =
    universeExecutionRunning ||
    universeExecutionCompleted;

  /*
   * Approve stage
   */

  const universeApproveActive =
    universeExecutionRunning ||
    universeExecutionCompleted;

  /*
   * Execute stage
   */

  const universeExecuteActive =
    universeExecutionRunning ||
    universeExecutionCompleted;

  /*
   * Flow activity
   */

  const universeFlowActive =
    universeExecutionRunning ||
    universeExecutionCompleted;

  /*
   * Overall Universe activity
   */

  const universeHasRecentExecution =
    universeExecutionRunning ||
    universeExecutionCompleted ||
    universeExecutionFailed ||
    universeExecutionCancelled;

  /*
   * =========================================
   * RETURN
   * =========================================
   */

  return (
    <div className="command-center">

      {/* =========================================
          COMMAND CENTER HEADER
          ========================================= */}

      <section className="command-header">

        <div>

          <div className="eyebrow">

            <span
              className="eyebrow-dot"
              aria-hidden="true"
            ></span>

            NOVAWAVEX COMMAND CENTER

          </div>

          <h1>
            Workflow intelligence,
            <br />
            <span>
              without the noise.
            </span>
          </h1>

          <p>
            Monitor, execute and understand
            everything happening across your
            automation environment.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label={
              refreshing
                ? "Refreshing dashboard"
                : "Refresh dashboard"
            }
            aria-busy={refreshing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              border:
                "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              color: "#dce5f8",
              background:
                "rgba(255, 255, 255, 0.04)",
              cursor: refreshing
                ? "not-allowed"
                : "pointer",
              opacity: refreshing ? 0.65 : 1,
              transition: "0.2s ease",
            }}
          >

            <RefreshCw
              size={15}
              aria-hidden="true"
              style={{
                animation: refreshing
                  ? "dashboard-refresh-spin 1s linear infinite"
                  : "none",
              }}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Dashboard"}

          </button>

          <div
            className="system-status"
            role="status"
            aria-live="polite"
            aria-busy={healthLoading}
          >

            <div
              className={
                systemStatus
                  ? "status-pulse"
                  : "status-pulse status-danger"
              }
              aria-hidden="true"
            ></div>

            <div>

              <strong>
                {healthLoading
                  ? "Checking System..."
                  : systemStatus
                    ? "System Operational"
                    : "System Degraded"}
              </strong>

              <span>
                {healthLoading
                  ? "Connecting to backend..."
                  : systemStatus
                    ? "All services running normally"
                    : "One or more services need attention"}
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          WORKFLOW UNIVERSE
          ========================================= */}

      <section
        className={
          universeHasRecentExecution &&
          !error
            ? "workflow-universe workflow-active"
            : "workflow-universe"
        }
        aria-busy={loading}
        aria-live="polite"
      >

        <div className="universe-header">

          <div>

            <span className="section-label">
              WORKFLOW UNIVERSE
            </span>

            <h2>
              Automation flow
            </h2>

          </div>

          <div className="universe-meta">

            <GitBranch
              size={16}
              aria-hidden="true"
            />

            {loading
              ? "Loading workflows..."
              : error
                ? "Workflow data unavailable"
                : universeWorkflowName
                  ? universeWorkflowName
                  : `${totalWorkflows} workflows available`}

          </div>

        </div>

        {loading && (

          <div
            className="dashboard-loading-state workflow-loading-state"
            role="status"
            aria-live="polite"
            aria-label="Loading workflows"
          >

            <div
              className="dashboard-loading-orbit"
              aria-hidden="true"
            >
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="dashboard-loading-content">

              <strong>
                Loading workflow universe
              </strong>

              <span>
                Connecting to your automation environment...
              </span>

            </div>

          </div>

        )}

        {!loading && error && (

          <div
            className="dashboard-error-state dashboard-error-state-primary"
            role="alert"
            aria-live="assertive"
          >

            <div
              className="dashboard-error-icon"
              aria-hidden="true"
            >
              <AlertCircle size={23} />
            </div>

            <div className="dashboard-error-content">

              <span className="dashboard-error-eyebrow">
                WORKFLOW DATA
              </span>

              <strong>
                We couldn't load your workflows
              </strong>

              <span>
                {error}
              </span>

              <small className="dashboard-error-help">
                Your workflows are still safe.
                This only affects the dashboard display.
              </small>

              <button
                type="button"
                className="dashboard-error-retry"
                onClick={handleRetryWorkflows}
                disabled={loading}
                aria-busy={loading}
              >

                <RefreshCw
                  size={14}
                  aria-hidden="true"
                  className={
                    loading
                      ? "dashboard-error-retry-icon spinning"
                      : "dashboard-error-retry-icon"
                  }
                />

                {loading
                  ? "Retrying..."
                  : "Try Again"}

              </button>

            </div>

          </div>

        )}

        {!loading &&
          !error &&
          workflows.length === 0 && (

            <div className="empty-state">

              <GitBranch
                size={25}
                aria-hidden="true"
              />

              <strong>
                No workflows yet
              </strong>

              <span>
                Create a workflow to see
                automation activity here.
              </span>

            </div>
          )}

        {!loading &&
          !error &&
          workflows.length > 0 &&
          universeWorkflow && (

          <div
            className="workflow-flow"
            aria-label="Workflow automation flow"
          >

            {/* TRIGGER */}

            <div
              className={
                universeTriggerActive
                  ? "workflow-node active-node"
                  : "workflow-node"
              }
              role="button"
              tabIndex={0}
              onClick={() =>
                handleWorkflowClick(
                  universeWorkflow.id
                )
              }
              onKeyDown={(event) =>
                handleWorkflowKeyDown(
                  event,
                  universeWorkflow.id
                )
              }
              aria-label={
                universeWorkflowName
                  ? `Open ${universeWorkflowName}`
                  : "Open workflow"
              }
            >

              <div className="node-icon">

                <Zap
                  size={20}
                  aria-hidden="true"
                />

              </div>

              <div>

                <strong>
                  Trigger
                </strong>

                <span>
                  {universeExecutionRunning
                    ? "Event received"
                    : universeExecutionCompleted
                      ? "Event received"
                      : universeExecutionFailed
                        ? "Execution failed"
                        : universeExecutionCancelled
                          ? "Execution cancelled"
                          : universeWorkflowStatus ===
                              "DRAFT"
                            ? "Waiting for event"
                            : universeWorkflowStatus ===
                                "CANCELLED"
                              ? "Workflow cancelled"
                              : universeWorkflowStatus ===
                                  "COMPLETED"
                                ? "Workflow completed"
                                : "Waiting for event"}
                </span>

              </div>

            </div>

            <div
              className={
                universeFlowActive
                  ? "flow-line flow-active"
                  : "flow-line"
              }
              aria-hidden="true"
            >

              {universeFlowActive && (
                <div className="flow-pulse"></div>
              )}

            </div>

            {/* VALIDATE */}

            <div
              className={
                universeValidateActive
                  ? "workflow-node activity-node"
                  : "workflow-node"
              }
              role="button"
              tabIndex={0}
              onClick={() =>
                handleWorkflowClick(
                  universeWorkflow.id
                )
              }
              onKeyDown={(event) =>
                handleWorkflowKeyDown(
                  event,
                  universeWorkflow.id
                )
              }
              aria-label={
                universeWorkflowName
                  ? `Open ${universeWorkflowName} validation`
                  : "Open workflow validation"
              }
            >

              <div className="node-icon">

                <Activity
                  size={20}
                  aria-hidden="true"
                />

              </div>

              <div>

                <strong>
                  Validate
                </strong>

                <span>
                  {universeExecutionRunning
                    ? "Validation in progress"
                    : universeExecutionCompleted
                      ? universeWorkflowDescription ||
                        "Validation completed"
                      : universeWorkflowDescription ||
                        "Process data"}
                </span>

              </div>

            </div>

            <div
              className={
                universeFlowActive
                  ? "flow-line flow-active"
                  : "flow-line"
              }
              aria-hidden="true"
            >

              {universeFlowActive && (
                <div className="flow-pulse"></div>
              )}

            </div>

            {/* APPROVE */}

            <div
              className={
                universeApproveActive
                  ? "workflow-node activity-node"
                  : "workflow-node"
              }
              role="button"
              tabIndex={0}
              onClick={() =>
                handleWorkflowClick(
                  universeWorkflow.id
                )
              }
              onKeyDown={(event) =>
                handleWorkflowKeyDown(
                  event,
                  universeWorkflow.id
                )
              }
              aria-label={
                universeWorkflowName
                  ? `Open ${universeWorkflowName} approval`
                  : "Open workflow approval"
              }
            >

              <div className="node-icon">

                <Clock3
                  size={20}
                  aria-hidden="true"
                />

              </div>

              <div>

                <strong>
                  Approve
                </strong>

                <span>
                  {universeExecutionRunning
                    ? "Decision in progress"
                    : universeExecutionCompleted
                      ? "Decision completed"
                      : universeWorkflowStatus ===
                          "ACTIVE"
                        ? "Human decision"
                        : "Human decision"}
                </span>

              </div>

            </div>

            <div
              className={
                universeFlowActive
                  ? "flow-line flow-active"
                  : "flow-line"
              }
              aria-hidden="true"
            >

              {universeFlowActive && (
                <div className="flow-pulse"></div>
              )}

            </div>

            {/* EXECUTE */}

            <div
              className={
                universeExecuteActive
                  ? "workflow-node activity-node"
                  : "workflow-node"
              }
              role="button"
              tabIndex={0}
              onClick={() =>
                handleWorkflowClick(
                  universeWorkflow.id
                )
              }
              onKeyDown={(event) =>
                handleWorkflowKeyDown(
                  event,
                  universeWorkflow.id
                )
              }
              aria-label={
                universeWorkflowName
                  ? `Open ${universeWorkflowName} execution`
                  : "Open workflow execution"
              }
            >

              <div className="node-icon">

                <Play
                  size={20}
                  aria-hidden="true"
                />

              </div>

              <div>

                <strong>
                  Execute
                </strong>

                <span>
                  {universeExecutionRunning
                    ? "Action running"
                    : universeExecutionCompleted
                      ? "Action completed"
                      : universeExecutionFailed
                        ? "Action failed"
                        : universeExecutionCancelled
                          ? "Action cancelled"
                          : universeWorkflowStatus ===
                              "ACTIVE"
                            ? "Waiting for action"
                            : "Waiting for action"}
                </span>

              </div>

            </div>

          </div>

        )}

        {!loading &&
          !error &&
          universeWorkflow && (

          <div
            style={{
              marginTop: "16px",
              fontSize: "12px",
              opacity: 0.7,
            }}
          >

            {universeWorkflowName && (
              <span>
                {universeWorkflowName}
              </span>
            )}

            {" · "}

            <span>
              {universeExecutionStatus ||
                universeWorkflowStatus}
            </span>

            {universeWorkflowTime && (
              <>
                {" · "}
                <span>
                  Updated{" "}
                  {formatActivityTime(
                    universeWorkflowTime
                  )}
                </span>
              </>
            )}

          </div>

        )}

      </section>

      {/* =========================================
          LOWER GRID
          ========================================= */}

      <section className="command-grid">

        {/* LIVE EXECUTIONS */}

        <div className="command-panel">

          <div className="panel-heading">

            <div>

              <span className="section-label">
                LIVE EXECUTIONS
              </span>

              <h2>
                What's happening now
              </h2>

            </div>

            <Activity
              size={20}
              aria-hidden="true"
            />

          </div>

          {executionLoading && (

            <div
              className="dashboard-loading-state execution-loading-state"
              role="status"
              aria-live="polite"
              aria-label="Loading executions"
            >

              <div
                className="dashboard-loading-spinner"
                aria-hidden="true"
              ></div>

              <div className="dashboard-loading-content">

                <strong>
                  Loading executions
                </strong>

                <span>
                  Fetching recent workflow activity...
                </span>

              </div>

            </div>
          )}

          {!executionLoading &&
            executionError && (

              <div
                className="dashboard-error-state dashboard-error-state-compact"
                role="alert"
                aria-live="assertive"
              >

                <div
                  className="dashboard-error-icon"
                  aria-hidden="true"
                >
                  <AlertCircle size={20} />
                </div>

                <div className="dashboard-error-content">

                  <span className="dashboard-error-eyebrow">
                    EXECUTION DATA
                  </span>

                  <strong>
                    Live activity is unavailable
                  </strong>

                  <span>
                    {executionError}
                  </span>

                  <small className="dashboard-error-help">
                    Workflow information remains available
                    elsewhere in the dashboard.
                  </small>

                  <button
                    type="button"
                    className="dashboard-error-retry"
                    onClick={handleRetryExecutions}
                    disabled={executionLoading}
                    aria-busy={executionLoading}
                  >

                    <RefreshCw
                      size={14}
                      aria-hidden="true"
                      className={
                        executionLoading
                          ? "dashboard-error-retry-icon spinning"
                          : "dashboard-error-retry-icon"
                      }
                    />

                    {executionLoading
                      ? "Retrying..."
                      : "Try Again"}

                  </button>

                </div>

              </div>
            )}

          {!executionLoading &&
            !executionError &&
            executions.length === 0 && (

              <div className="empty-state">

                <Play
                  size={25}
                  aria-hidden="true"
                />

                <strong>
                  No executions yet
                </strong>

                <span>
                  Start a workflow execution
                  to see activity here.
                </span>

              </div>
            )}

          {!executionLoading &&
            !executionError &&
            recentExecutions.length > 0 && (

              <div className="execution-list">

                {recentExecutions.map(
                  (execution) => {

                    const workflowName =
                      execution.workflow?.name ||
                      `Workflow #${execution.workflow?.id || "Unknown"}`;

                    const executionStatus =
                      String(
                        execution.status ||
                          "UNKNOWN"
                      ).toLowerCase();

                    return (
                      <div
                        className="execution-row"
                        key={execution.id}
                      >

                        <div className="execution-indicator">
                          <span></span>
                        </div>

                        <div className="execution-main">

                          <strong>
                            {workflowName}
                          </strong>

                          <span>
                            Execution #
                            {execution.id}
                          </span>

                        </div>

                        <div className="execution-status">

                          <span
                            className={
                              `status-${executionStatus}`
                            }
                          >
                            {execution.status}
                          </span>

                          <small>
                            {formatActivityTime(
                              execution.updatedAt ||
                                execution.createdAt
                            )}
                          </small>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          {!loading &&
            !error &&
            workflows.length > 0 && (

              <button
                type="button"
                className="panel-action"
                onClick={() =>
                  navigate("/workflows")
                }
              >

                View all workflows

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />

              </button>
            )}

        </div>

        {/* SYSTEM PULSE */}

        <div className="command-panel system-panel">

          <div className="panel-heading">

            <div>

              <span className="section-label">
                SYSTEM PULSE
              </span>

              <h2>
                Environment health
              </h2>

            </div>

            <CheckCircle2
              size={20}
              aria-hidden="true"
            />

          </div>

          <div className="health-score">

            <div
              className={
                executionLoading
                  ? "health-number health-number-loading"
                  : "health-number"
              }
              aria-live="polite"
            >

              {executionLoading
                ? "--"
                : totalExecutions}

            </div>

            <div className="health-label">
              executions recorded
            </div>

          </div>

          <div
            className="health-bars"
            aria-busy={healthLoading}
          >

            <div>

              <span>

                <Server
                  size={13}
                  aria-hidden="true"
                  style={{
                    marginRight: "5px",
                    verticalAlign: "middle",
                  }}
                />

                API Services

              </span>

              <strong>

                {apiHealth === null
                  ? "--"
                  : `${apiHealth}%`}

              </strong>

            </div>

            <div className="health-track">

              <div
                className={
                  apiHealth === null
                    ? "health-fill health-fill-loading"
                    : "health-fill"
                }
                style={{
                  width:
                    apiHealth === null
                      ? "35%"
                      : `${apiHealth}%`,
                }}
              ></div>

            </div>

            <div>

              <span>

                <Activity
                  size={13}
                  aria-hidden="true"
                  style={{
                    marginRight: "5px",
                    verticalAlign: "middle",
                  }}
                />

                Workflow Engine

              </span>

              <strong>

                {executionLoading
                  ? "--"
                  : `${executionSuccessRate}%`}

              </strong>

            </div>

            <div className="health-track">

              <div
                className={
                  executionLoading
                    ? "health-fill health-fill-loading"
                    : "health-fill"
                }
                style={{
                  width:
                    executionLoading
                      ? "35%"
                      : `${executionSuccessRate}%`,
                }}
              ></div>

            </div>

            <div>

              <span>

                <Database
                  size={13}
                  aria-hidden="true"
                  style={{
                    marginRight: "5px",
                    verticalAlign: "middle",
                  }}
                />

                Database

              </span>

              <strong>

                {databaseHealth === null
                  ? "--"
                  : `${databaseHealth}%`}

              </strong>

            </div>

            <div className="health-track">

              <div
                className={
                  databaseHealth === null
                    ? "health-fill health-fill-loading"
                    : "health-fill"
                }
                style={{
                  width:
                    databaseHealth === null
                      ? "35%"
                      : `${databaseHealth}%`,
                }}
              ></div>

            </div>

          </div>

          {healthLoading && (

            <div
              className="dashboard-health-loading"
              role="status"
              aria-live="polite"
            >

              <span
                className="dashboard-mini-spinner"
                aria-hidden="true"
              ></span>

              Checking environment health...

            </div>

          )}

          {healthError && (

            <div
              className="dashboard-health-error"
              role="alert"
              aria-live="assertive"
            >

              <div className="dashboard-health-error-main">

                <AlertCircle
                  size={15}
                  aria-hidden="true"
                />

                <div className="dashboard-health-error-copy">

                  <strong>
                    System health unavailable
                  </strong>

                  <span>
                    {healthError}
                  </span>

                </div>

              </div>

              <button
                type="button"
                className="dashboard-health-retry"
                onClick={handleRetryHealth}
                disabled={healthLoading}
                aria-busy={healthLoading}
                aria-label={
                  healthLoading
                    ? "Retrying system health check"
                    : "Retry system health check"
                }
              >

                <RefreshCw
                  size={13}
                  aria-hidden="true"
                  className={
                    healthLoading
                      ? "spinning"
                      : ""
                  }
                />

                {healthLoading
                  ? "Checking..."
                  : "Retry"}

              </button>

            </div>

          )}

        </div>

      </section>

      {/* =========================================
          DASHBOARD STYLES
          ========================================= */}

      <style>{`
        @keyframes dashboard-refresh-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes dashboard-loader-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes dashboard-loader-pulse {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.85);
          }

          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes dashboard-loader-shimmer {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(300%);
          }
        }

        @keyframes dashboard-loading-dots {
          0%,
          100% {
            opacity: 0.35;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes dashboard-error-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboard-error-icon-pulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.06);
          }
        }

        @keyframes dashboard-error-border-pulse {
          0%,
          100% {
            border-color:
              rgba(248, 113, 113, 0.16);
          }

          50% {
            border-color:
              rgba(248, 113, 113, 0.27);
          }
        }

        .dashboard-loading-state {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-height: 150px;
          padding: 28px 20px;
          overflow: hidden;
        }

        .dashboard-loading-state::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.035) 45%,
              rgba(255, 255, 255, 0.07) 50%,
              rgba(255, 255, 255, 0.035) 55%,
              transparent 100%
            );
          transform: translateX(-100%);
          animation:
            dashboard-loader-shimmer
            2.4s ease-in-out infinite;
          pointer-events: none;
        }

        .dashboard-loading-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
          position: relative;
          z-index: 1;
        }

        .dashboard-loading-content strong {
          font-size: 13px;
          font-weight: 600;
        }

        .dashboard-loading-content span {
          font-size: 12px;
          opacity: 0.58;
        }

        .workflow-loading-state {
          min-height: 210px;
        }

        .dashboard-loading-orbit {
          position: relative;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          animation:
            dashboard-loader-spin
            1.8s linear infinite;
        }

        .dashboard-loading-orbit::before {
          content: "";
          position: absolute;
          inset: 6px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }

        .dashboard-loading-orbit span {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation:
            dashboard-loader-pulse
            1.4s ease-in-out infinite;
        }

        .dashboard-loading-orbit span:nth-child(1) {
          top: -3px;
          left: 18px;
        }

        .dashboard-loading-orbit span:nth-child(2) {
          right: -3px;
          top: 18px;
          animation-delay: 0.2s;
        }

        .dashboard-loading-orbit span:nth-child(3) {
          bottom: -3px;
          left: 18px;
          animation-delay: 0.4s;
        }

        .dashboard-loading-orbit span:nth-child(4) {
          left: -3px;
          top: 18px;
          animation-delay: 0.6s;
        }

        .execution-loading-state {
          min-height: 130px;
        }

        .dashboard-loading-spinner {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: currentColor;
          border-radius: 50%;
          animation:
            dashboard-loader-spin
            0.85s linear infinite;
        }

        .dashboard-health-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          font-size: 11px;
          opacity: 0.55;
        }

        .dashboard-mini-spinner {
          width: 11px;
          height: 11px;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-top-color: currentColor;
          border-radius: 50%;
          animation:
            dashboard-loader-spin
            0.8s linear infinite;
        }

        .health-number-loading {
          animation:
            dashboard-loading-dots
            1.2s ease-in-out infinite;
        }

        .health-fill-loading {
          position: relative;
          overflow: hidden;
        }

        .health-fill-loading::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
          transform: translateX(-100%);
          animation:
            dashboard-loader-shimmer
            1.8s ease-in-out infinite;
        }

        /*
         * =========================================
         * ERROR STATES
         * =========================================
         */

        .dashboard-error-state {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 18px 0;
          padding: 20px;
          border: 1px solid rgba(248, 113, 113, 0.18);
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              rgba(248, 113, 113, 0.07),
              rgba(255, 255, 255, 0.025)
            );
          animation:
            dashboard-error-enter
            0.3s ease-out both;
        }

        .dashboard-error-state-primary {
          animation:
            dashboard-error-enter 0.3s ease-out both,
            dashboard-error-border-pulse 3s ease-in-out 0.4s infinite;
        }

        .dashboard-error-state-compact {
          margin: 16px 0;
          padding: 16px;
        }

        .dashboard-error-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 12px;
          color: #fca5a5;
          background:
            rgba(248, 113, 113, 0.08);
          animation:
            dashboard-error-icon-pulse
            2.2s ease-in-out infinite;
        }

        .dashboard-error-state-compact
          .dashboard-error-icon {
          width: 38px;
          height: 38px;
          flex-basis: 38px;
          border-radius: 10px;
        }

        .dashboard-error-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          min-width: 0;
        }

        .dashboard-error-eyebrow {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          opacity: 0.48;
        }

        .dashboard-error-content strong {
          font-size: 14px;
          font-weight: 650;
          line-height: 1.35;
        }

        .dashboard-error-content > span:not(
          .dashboard-error-eyebrow
        ) {
          font-size: 12px;
          line-height: 1.55;
          opacity: 0.6;
        }

        .dashboard-error-help {
          max-width: 620px;
          margin-top: 1px;
          font-size: 10px;
          line-height: 1.5;
          opacity: 0.43;
        }

        .dashboard-error-retry {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 8px;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9px;
          color: #e7edf8;
          background: rgba(255, 255, 255, 0.05);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .dashboard-error-retry:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.17);
          transform: translateY(-1px);
        }

        .dashboard-error-retry:active:not(:disabled) {
          transform: translateY(0);
        }

        .dashboard-error-retry:focus-visible {
          outline: 2px solid rgba(252, 165, 165, 0.8);
          outline-offset: 3px;
        }

        .dashboard-error-retry:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .dashboard-error-retry-icon {
          transition: transform 0.2s ease;
        }

        .dashboard-error-retry-icon.spinning,
        .spinning {
          animation:
            dashboard-refresh-spin
            0.8s linear infinite;
        }

        /*
         * =========================================
         * SYSTEM HEALTH ERROR
         * =========================================
         */

        .dashboard-health-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 18px;
          padding: 11px 12px;
          border: 1px solid rgba(248, 113, 113, 0.16);
          border-radius: 10px;
          background:
            rgba(248, 113, 113, 0.055);
          animation:
            dashboard-error-enter
            0.3s ease-out both;
        }

        .dashboard-health-error-main {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          min-width: 0;
          color: #fca5a5;
          font-size: 11px;
        }

        .dashboard-health-error-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .dashboard-health-error-copy strong {
          font-size: 11px;
          font-weight: 650;
        }

        .dashboard-health-error-copy span {
          color: inherit;
          opacity: 0.72;
          line-height: 1.45;
        }

        .dashboard-health-retry {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          padding: 6px 9px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 7px;
          color: #dce5f8;
          background: rgba(255, 255, 255, 0.04);
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            opacity 0.2s ease;
        }

        .dashboard-health-retry:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.14);
        }

        .dashboard-health-retry:focus-visible {
          outline: 2px solid rgba(252, 165, 165, 0.8);
          outline-offset: 3px;
        }

        .dashboard-health-retry:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        /*
         * =========================================
         * WORKFLOW UNIVERSE NODE FIX
         * =========================================
         */

        .workflow-node {
          min-width: 0;
          width: 150px;
          max-width: 150px;
          min-height: 78px;
          max-height: 78px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .workflow-node > div:last-child {
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
        }

        .workflow-node > div:last-child span {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.35;
          max-height: 2.7em;
          min-width: 0;
          max-width: 100%;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        /*
         * =========================================
         * MOBILE WORKFLOW NODE FIX
         * =========================================
         */

        @media (max-width: 700px) {
          .workflow-node {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            min-height: 78px;
            max-height: 78px;
            box-sizing: border-box;
            overflow: hidden;
          }

          .workflow-node > div:last-child {
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
          }

          .workflow-node > div:last-child strong,
          .workflow-node > div:last-child span {
            min-width: 0;
            max-width: 100%;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .workflow-node > div:last-child span {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.35;
            max-height: 2.7em;
          }
        }

        /*
         * =========================================
         * REDUCED MOTION
         * =========================================
         */

        @media (prefers-reduced-motion: reduce) {
          .dashboard-loading-state::before,
          .dashboard-loading-orbit,
          .dashboard-loading-orbit span,
          .dashboard-loading-spinner,
          .dashboard-mini-spinner,
          .health-number-loading,
          .health-fill-loading::after,
          .dashboard-error-state,
          .dashboard-error-state-primary,
          .dashboard-error-icon,
          .dashboard-health-error,
          .dashboard-error-retry-icon.spinning,
          .spinning {
            animation: none !important;
          }

          .dashboard-loading-state::before {
            display: none;
          }

          .dashboard-error-retry,
          .dashboard-health-retry {
            transition: none;
          }
        }

        /*
         * =========================================
         * RESPONSIVE ERROR STATES
         * =========================================
         */

        @media (max-width: 700px) {
          .dashboard-error-state {
            align-items: flex-start;
            padding: 16px;
            gap: 12px;
          }

          .dashboard-error-icon {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
          }

          .dashboard-health-error {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-health-retry {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .dashboard-error-state {
            flex-direction: column;
          }

          .dashboard-error-content {
            width: 100%;
          }

          .dashboard-error-retry {
            width: 100%;
          }

          .dashboard-error-help {
            max-width: none;
          }
        }
      `}</style>

    </div>
  );
};

export default Dashboard;