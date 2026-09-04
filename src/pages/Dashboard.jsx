import React, { useEffect, useState } from "react";

import {
  Activity,
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

      setWorkflows(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load workflows:",
        err
      );

      setWorkflows([]);

      setError(
        "Unable to load workflows."
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

      const response = await api.get(
        "/api/executions"
      );

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
        "Unable to load executions."
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
        "Unable to read system health."
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
   * WORKFLOW NAVIGATION
   * =========================================
   */

  const handleWorkflowClick = (
    workflowId
  ) => {
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
   * RECENT ACTIVITY TIME
   * =========================================
   */

  const formatActivityTime = (
    timestamp
  ) => {
    if (!timestamp) {
      return "Recently";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
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
      const dateA = new Date(
        a.updatedAt ||
          a.createdAt ||
          0
      ).getTime();

      const dateB = new Date(
        b.updatedAt ||
          b.createdAt ||
          0
      ).getTime();

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
      const dateA = new Date(
        a.updatedAt ||
          a.createdAt ||
          0
      ).getTime();

      const dateB = new Date(
        b.updatedAt ||
          b.createdAt ||
          0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  /*
   * =========================================
   * COMMAND CENTER ACTIVITY
   * =========================================
   */

  const activityWindow = 5 * 60 * 1000;

  const latestWorkflow = recentWorkflows[0];

  const latestWorkflowTimestamp =
    latestWorkflow?.updatedAt ||
    latestWorkflow?.createdAt;

  const latestWorkflowDate =
    latestWorkflowTimestamp
      ? new Date(
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
      ? new Date(
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
   *
   * IMPORTANT:
   *
   * Previously the Universe always used:
   *
   * recentWorkflows[0]
   *
   * That meant the newest workflow was
   * always displayed, even when another
   * existing workflow had just been executed.
   *
   * Now we first find the most recent
   * execution and then find the workflow
   * belonging to that execution.
   *
   * If there are no executions yet, we
   * safely fall back to the newest workflow.
   */

  const universeLatestExecution =
    [...executions]
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt ||
            a.createdAt ||
            a.startedAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.updatedAt ||
            b.createdAt ||
            b.startedAt ||
            0
        ).getTime();

        return dateB - dateA;
      })[0] || null;

  /*
   * Get workflow ID from the execution.
   *
   * Depending on the backend response,
   * workflow may be returned as an object:
   *
   * execution.workflow.id
   *
   * or the execution may expose:
   *
   * execution.workflowId
   */

  const universeExecutionWorkflowId =
    universeLatestExecution?.workflow?.id ??
    universeLatestExecution?.workflowId ??
    null;

  /*
   * Find the actual workflow from the
   * workflows loaded from the backend.
   */

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

  /*
   * If an execution exists and its workflow
   * is available, use that workflow.
   *
   * Otherwise use the newest workflow.
   */

  const universeWorkflow =
    executionWorkflow ||
    recentWorkflows[0] ||
    null;

  /*
   * Workflow status.
   */

  const universeWorkflowStatus =
    String(
      universeWorkflow?.status ||
        "UNKNOWN"
    ).toUpperCase();

  /*
   * Execution status.
   */

  const universeExecutionStatus =
    String(
      universeLatestExecution?.status ||
        ""
    ).toUpperCase();

  /*
   * Workflow information.
   */

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
   *
   * The execution state controls the visual
   * progression of the Universe.
   *
   * RUNNING:
   * Trigger → Validate → Approve →
   * Execute
   *
   * COMPLETED:
   * Trigger ✓
   * Validate ✓
   * Approve ✓
   * Execute ✓
   *
   * For other execution states, the workflow
   * itself is used as the fallback.
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
   * Flow activity.
   *
   * Only the actual execution should make
   * the flow pulse.
   */

  const universeFlowActive =
    universeExecutionRunning ||
    universeExecutionCompleted;

  /*
   * Overall Universe activity.
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

            <span className="eyebrow-dot"></span>

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

          {/* Refresh Dashboard */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard"
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

          {/* System Status */}

          <div className="system-status">

            <div
              className={
                systemStatus
                  ? "status-pulse"
                  : "status-pulse status-danger"
              }
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

            <GitBranch size={16} />

            {loading
              ? "Loading workflows..."
              : error
                ? "Workflow data unavailable"
                : universeWorkflowName
                  ? universeWorkflowName
                  : `${totalWorkflows} workflows available`}

          </div>

        </div>

        {/* Workflow Error */}

        {!loading && error && (

          <div className="empty-state error-state">

            <span>
              {error}
            </span>

          </div>

        )}

        {/* No Workflow */}

        {!loading &&
          !error &&
          workflows.length === 0 && (

            <div className="empty-state">

              <GitBranch size={25} />

              <strong>
                No workflows yet
              </strong>

              <span>
                Create a workflow to see
                automation activity here.
              </span>

            </div>
          )}

        {/* Workflow Flow */}

        {!loading &&
          !error &&
          workflows.length > 0 &&
          universeWorkflow && (

          <div className="workflow-flow">

            {/* =========================================
                TRIGGER
                ========================================= */}

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
                <Zap size={20} />
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

            {/* FLOW LINE */}

            <div
              className={
                universeFlowActive
                  ? "flow-line flow-active"
                  : "flow-line"
              }
            >
              {universeFlowActive && (
                <div className="flow-pulse"></div>
              )}
            </div>

            {/* =========================================
                VALIDATE
                ========================================= */}

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
            >

              <div className="node-icon">
                <Activity size={20} />
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

            {/* FLOW LINE */}

            <div
              className={
                universeFlowActive
                  ? "flow-line flow-active"
                  : "flow-line"
              }
            >
              {universeFlowActive && (
                <div className="flow-pulse"></div>
              )}
            </div>

            {/* =========================================
                APPROVE
                ========================================= */}

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
            >

              <div className="node-icon">
                <Clock3 size={20} />
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

            {/* FLOW LINE */}

            <div
              className={
                universeFlowActive
                  ? "flow-line flow-active"
                  : "flow-line"
              }
            >
              {universeFlowActive && (
                <div className="flow-pulse"></div>
              )}
            </div>

            {/* =========================================
                EXECUTE
                ========================================= */}

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
            >

              <div className="node-icon">
                <Play size={20} />
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

        {/* Current Workflow Information */}

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

        {/* =========================================
            LIVE EXECUTIONS
            ========================================= */}

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

            <Activity size={20} />

          </div>

          {/* Loading */}

          {executionLoading && (
            <div className="empty-state">

              <div className="loading-spinner"></div>

              <span>
                Loading executions...
              </span>

            </div>
          )}

          {/* Error */}

          {!executionLoading &&
            executionError && (
              <div className="empty-state error-state">

                <span>
                  {executionError}
                </span>

              </div>
            )}

          {/* No executions */}

          {!executionLoading &&
            !executionError &&
            executions.length === 0 && (

              <div className="empty-state">

                <Play size={25} />

                <strong>
                  No executions yet
                </strong>

                <span>
                  Start a workflow execution
                  to see activity here.
                </span>

              </div>
            )}

          {/* Recent Executions */}

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

          {/* View all workflows */}

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

                <ArrowRight size={16} />

              </button>
            )}

        </div>

        {/* =========================================
            SYSTEM PULSE
            ========================================= */}

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

            <CheckCircle2 size={20} />

          </div>

          {/* Execution Count */}

          <div className="health-score">

            <div className="health-number">

              {executionLoading
                ? "--"
                : totalExecutions}

            </div>

            <div className="health-label">
              executions recorded
            </div>

          </div>

          {/* Health Bars */}

          <div className="health-bars">

            {/* API Services */}

            <div>

              <span>

                <Server
                  size={13}
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
                className="health-fill"
                style={{
                  width:
                    apiHealth === null
                      ? "0%"
                      : `${apiHealth}%`,
                }}
              ></div>

            </div>

            {/* Workflow Engine */}

            <div>

              <span>

                <Activity
                  size={13}
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
                className="health-fill"
                style={{
                  width:
                    `${executionSuccessRate}%`,
                }}
              ></div>

            </div>

            {/* Database */}

            <div>

              <span>

                <Database
                  size={13}
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
                className="health-fill"
                style={{
                  width:
                    databaseHealth === null
                      ? "0%"
                      : `${databaseHealth}%`,
                }}
              ></div>

            </div>

          </div>

          {/* Health Error */}

          {healthError && (

            <div className="health-error">

              {healthError}

            </div>

          )}

        </div>

      </section>

      {/* =========================================
          DASHBOARD REFRESH ANIMATION
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
      `}</style>

    </div>
  );
};

export default Dashboard;