import { useEffect, useState } from "react";

import {
  Activity as ActivityIcon,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCw,
  Play,
} from "lucide-react";

import api from "../services/api";

const Activity = () => {
  const [executions, setExecutions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const loadExecutions = async () => {
    try {
      setError(null);

      const response = await api.get(
        "/api/executions"
      );

      console.log(
        "NovaWavex activity executions:",
        response.data
      );

      setExecutions(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load activity:",
        err
      );

      setError(
        "Unable to load activity."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, []);

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);

      await loadExecutions();
    } finally {
      setRefreshing(false);
    }
  };

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

  const getStatusIcon = (status) => {
    const normalizedStatus =
      String(
        status || "UNKNOWN"
      ).toUpperCase();

    if (
      normalizedStatus ===
      "COMPLETED"
    ) {
      return (
        <CheckCircle2
          size={18}
        />
      );
    }

    if (
      normalizedStatus ===
        "FAILED" ||
      normalizedStatus ===
        "CANCELLED"
    ) {
      return (
        <XCircle
          size={18}
        />
      );
    }

    if (
      normalizedStatus ===
        "RUNNING" ||
      normalizedStatus ===
        "IN_PROGRESS"
    ) {
      return (
        <Play
          size={18}
        />
      );
    }

    return (
      <Clock3
        size={18}
      />
    );
  };

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

  const failedExecutions =
    executions.filter(
      (execution) => {
        const status =
          String(
            execution.status
          ).toUpperCase();

        return (
          status === "FAILED" ||
          status === "CANCELLED"
        );
      }
    ).length;

  const runningExecutions =
    executions.filter(
      (execution) => {
        const status =
          String(
            execution.status
          ).toUpperCase();

        return (
          status === "RUNNING" ||
          status ===
            "IN_PROGRESS"
        );
      }
    ).length;

  const recentExecutions =
    [...executions]
      .sort((a, b) => {
        const dateA =
          new Date(
            a.updatedAt ||
              a.createdAt ||
              0
          ).getTime();

        const dateB =
          new Date(
            b.updatedAt ||
              b.createdAt ||
              0
          ).getTime();

        return dateB - dateA;
      });

  return (
    <div className="command-center">

      {/* =========================================
          HEADER
          ========================================= */}

      <section className="command-header">

        <div>

          <div className="eyebrow">

            <span className="eyebrow-dot"></span>

            NOVAWAVEX ACTIVITY

          </div>

          <h1>
            Workflow activity,
            <br />
            <span>
              without the noise.
            </span>
          </h1>

          <p>
            Monitor recent workflow
            executions and understand
            what is happening across
            your automation environment.
          </p>

        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh activity"
          style={{
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: "8px",
            padding:
              "10px 14px",
            border:
              "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius:
              "10px",
            color:
              "#dce5f8",
            background:
              "rgba(255, 255, 255, 0.04)",
            cursor:
              refreshing
                ? "not-allowed"
                : "pointer",
            opacity:
              refreshing
                ? 0.65
                : 1,
          }}
        >

          <RefreshCw
            size={15}
            style={{
              animation:
                refreshing
                  ? "activity-refresh-spin 1s linear infinite"
                  : "none",
            }}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Activity"}

        </button>

      </section>


      {/* =========================================
          ACTIVITY STATISTICS
          ========================================= */}

      <section
        className="command-grid"
        style={{
          marginBottom:
            "24px",
        }}
      >

        <div className="command-panel">

          <div className="panel-heading">

            <div>

              <span className="section-label">
                TOTAL EXECUTIONS
              </span>

              <h2>
                Recorded activity
              </h2>

            </div>

            <ActivityIcon
              size={20}
            />

          </div>

          <div className="health-score">

            <div className="health-number">
              {loading
                ? "--"
                : totalExecutions}
            </div>

            <div className="health-label">
              executions recorded
            </div>

          </div>

        </div>


        <div className="command-panel">

          <div className="panel-heading">

            <div>

              <span className="section-label">
                COMPLETED
              </span>

              <h2>
                Successful executions
              </h2>

            </div>

            <CheckCircle2
              size={20}
            />

          </div>

          <div className="health-score">

            <div className="health-number">
              {loading
                ? "--"
                : completedExecutions}
            </div>

            <div className="health-label">
              completed
            </div>

          </div>

        </div>


        <div className="command-panel">

          <div className="panel-heading">

            <div>

              <span className="section-label">
                RUNNING
              </span>

              <h2>
                Active executions
              </h2>

            </div>

            <Play
              size={20}
            />

          </div>

          <div className="health-score">

            <div className="health-number">
              {loading
                ? "--"
                : runningExecutions}
            </div>

            <div className="health-label">
              currently running
            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          ACTIVITY PANEL
          ========================================= */}

      <section className="command-panel">

        <div className="panel-heading">

          <div>

            <span className="section-label">
              COMMAND CENTER ACTIVITY
            </span>

            <h2>
              Recent executions
            </h2>

          </div>

          <ActivityIcon
            size={20}
          />

        </div>


        {/* Loading */}

        {loading && (

          <div className="empty-state">

            <div className="loading-spinner"></div>

            <span>
              Loading activity...
            </span>

          </div>

        )}


        {/* Error */}

        {!loading &&
          error && (

            <div className="empty-state error-state">

              <span>
                {error}
              </span>

            </div>

          )}


        {/* Empty */}

        {!loading &&
          !error &&
          recentExecutions.length ===
            0 && (

            <div className="empty-state">

              <ActivityIcon
                size={25}
              />

              <strong>
                No activity yet
              </strong>

              <span>
                Workflow executions
                will appear here.
              </span>

            </div>

          )}


        {/* Execution List */}

        {!loading &&
          !error &&
          recentExecutions.length >
            0 && (

            <div className="execution-list">

              {recentExecutions.map(
                (execution) => {

                  const workflowName =
                    execution.workflow
                      ?.name ||
                    `Workflow #${
                      execution.workflow
                        ?.id ||
                      "Unknown"
                    }`;

                  const status =
                    String(
                      execution.status ||
                        "UNKNOWN"
                    ).toLowerCase();

                  return (

                    <div
                      className="execution-row"
                      key={
                        execution.id
                      }
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


                      <div
                        className="execution-status"
                      >

                        <span
                          className={
                            `status-${status}`
                          }
                        >

                          {getStatusIcon(
                            execution.status
                          )}

                          {execution.status ||
                            "UNKNOWN"}

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

      </section>


      {/* =========================================
          REFRESH ANIMATION
          ========================================= */}

      <style>{`
        @keyframes activity-refresh-spin {
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

export default Activity;