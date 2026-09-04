import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  GitBranch,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Workflow as WorkflowIcon,
  X,
} from "lucide-react";

import workflowService from "../services/workflowService";

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

const STATUS_FILTERS = [
  "ALL",
  "ACTIVE",
  "DRAFT",
  "COMPLETED",
  "CANCELLED",
];

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
    STATUS_CONFIG[String(status || "").toUpperCase()] || {
      label: status || "Unknown",
      icon: GitBranch,
    }
  );
};

const Workflows = () => {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await workflowService.getAllWorkflows();

      console.log("NovaWavex workflows:", data);

      setWorkflows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load workflows:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to access these workflows.");
      } else if (err.response?.status === 404) {
        setError("The workflow service could not be found.");
      } else {
        setError("Unable to load workflows. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const filteredWorkflows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return workflows.filter((workflow) => {
      const status = String(
        workflow.status || ""
      ).toUpperCase();

      const name = String(
        workflow.name || ""
      ).toLowerCase();

      const description = String(
        workflow.description || ""
      ).toLowerCase();

      const createdBy = String(
        typeof workflow.createdBy === "object"
          ? workflow.createdBy?.email ||
              workflow.createdBy?.username ||
              workflow.createdBy?.id ||
              ""
          : workflow.createdBy || ""
      ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        createdBy.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchTerm, statusFilter]);

  const totalWorkflows = workflows.length;

  const activeWorkflows = workflows.filter(
    (workflow) =>
      String(workflow.status).toUpperCase() === "ACTIVE"
  ).length;

  const draftWorkflows = workflows.filter(
    (workflow) =>
      String(workflow.status).toUpperCase() === "DRAFT"
  ).length;

  const completedWorkflows = workflows.filter(
    (workflow) =>
      String(workflow.status).toUpperCase() === "COMPLETED"
  ).length;

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleWorkflowKeyDown = (event, workflowId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      navigate(`/workflows/${workflowId}`);
    }
  };

  const handleCreateWorkflow = () => {
    navigate("/workflows/create");
  };

  return (
    <div className="workflows-page">
      <style>{`
        .workflows-page {
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

        .workflows-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .workflows-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .workflows-heading {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .workflows-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(77, 124, 255, 0.12);
          border: 1px solid rgba(77, 124, 255, 0.25);
        }

        .workflows-heading h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .workflows-heading p {
          margin: 5px 0 0;
          color: #8490a8;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .create-button,
        .refresh-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .create-button {
          border: 1px solid rgba(77, 124, 255, 0.45);
          color: #ffffff;
          background: rgba(77, 124, 255, 0.85);
          box-shadow: 0 8px 20px rgba(77, 124, 255, 0.15);
        }

        .create-button:hover {
          background: rgba(77, 124, 255, 1);
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(77, 124, 255, 0.22);
        }

        .refresh-button {
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #dce5f8;
          background: rgba(255, 255, 255, 0.04);
        }

        .refresh-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(77, 124, 255, 0.35);
        }

        .refresh-button:disabled,
        .create-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .workflow-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
          backdrop-filter: blur(10px);
        }

        .summary-label {
          color: #7f8ba3;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .summary-value {
          margin-top: 8px;
          font-size: 28px;
          font-weight: 700;
        }

        .workflow-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.025);
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          max-width: 500px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #69758c;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 42px 12px 42px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 10px;
          outline: none;
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.04);
          font-size: 13px;
          transition: 0.2s ease;
        }

        .search-input::placeholder {
          color: #69758c;
        }

        .search-input:focus {
          border-color: rgba(77, 124, 255, 0.5);
          background: rgba(255, 255, 255, 0.055);
          box-shadow: 0 0 0 3px rgba(77, 124, 255, 0.08);
        }

        .clear-search {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border: 0;
          border-radius: 7px;
          color: #8490a8;
          background: transparent;
          cursor: pointer;
        }

        .clear-search:hover {
          color: #dce5f8;
          background: rgba(255, 255, 255, 0.08);
        }

        .status-filters {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .status-filter {
          padding: 9px 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          color: #8490a8;
          background: rgba(255, 255, 255, 0.025);
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
          letter-spacing: 0.3px;
          transition: 0.2s ease;
        }

        .status-filter:hover {
          color: #dce5f8;
          background: rgba(255, 255, 255, 0.06);
        }

        .status-filter.active {
          color: #dce5f8;
          background: rgba(77, 124, 255, 0.14);
          border-color: rgba(77, 124, 255, 0.35);
        }

        .results-info {
          margin-bottom: 16px;
          color: #69758c;
          font-size: 12px;
        }

        .results-info strong {
          color: #aebbd3;
        }

        .workflows-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .workflow-card {
          position: relative;
          min-height: 230px;
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.055),
              rgba(255, 255, 255, 0.018)
            );
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.18);
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .workflow-card:hover {
          transform: translateY(-3px);
          border-color: rgba(77, 124, 255, 0.3);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
        }

        .workflow-card:focus-visible {
          outline: 2px solid rgba(77, 124, 255, 0.65);
          outline-offset: 3px;
        }

        .workflow-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .workflow-title-wrapper {
          min-width: 0;
        }

        .workflow-title {
          margin: 0;
          color: #f0f4ff;
          font-size: 18px;
          font-weight: 650;
          word-break: break-word;
        }

        .workflow-id {
          margin-top: 5px;
          color: #69758c;
          font-size: 11px;
          word-break: break-all;
        }

        .status-badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 650;
          background: rgba(255, 255, 255, 0.06);
          color: #cdd7eb;
        }

        .status-badge.active {
          color: #62e6c3;
          background: rgba(0, 212, 170, 0.1);
        }

        .status-badge.draft {
          color: #aebbd3;
          background: rgba(148, 163, 184, 0.1);
        }

        .status-badge.completed {
          color: #76b7ff;
          background: rgba(77, 124, 255, 0.1);
        }

        .status-badge.cancelled {
          color: #ff8e9b;
          background: rgba(255, 77, 96, 0.1);
        }

        .workflow-description {
          min-height: 48px;
          margin: 22px 0;
          color: #8d99b0;
          font-size: 13px;
          line-height: 1.65;
        }

        .workflow-meta {
          display: grid;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7f8ba3;
          font-size: 12px;
        }

        .meta-row span {
          color: #b5bfd1;
          word-break: break-word;
        }

        .state-container {
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.02);
        }

        .state-content {
          max-width: 440px;
          text-align: center;
        }

        .state-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          color: #9bb9ff;
          background: rgba(77, 124, 255, 0.1);
        }

        .state-content h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .state-content p {
          margin: 0;
          color: #7f8ba3;
          line-height: 1.6;
          font-size: 14px;
        }

        .retry-button {
          margin-top: 18px;
          padding: 10px 15px;
          border: 1px solid rgba(77, 124, 255, 0.3);
          border-radius: 9px;
          color: #dce5f8;
          background: rgba(77, 124, 255, 0.1);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .retry-button:hover {
          background: rgba(77, 124, 255, 0.16);
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

        @media (max-width: 1150px) {
          .workflows-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .workflow-controls {
            align-items: flex-start;
            flex-direction: column;
          }

          .search-wrapper {
            max-width: none;
            width: 100%;
          }
        }

        @media (max-width: 800px) {
          .workflows-page {
            padding: 20px;
          }

          .workflows-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .create-button,
          .refresh-button {
            flex: 1;
          }

          .workflow-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .workflows-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .workflow-summary {
            grid-template-columns: 1fr;
          }

          .workflows-heading h1 {
            font-size: 26px;
          }

          .status-filters {
            width: 100%;
          }

          .status-filter {
            flex: 1;
          }

          .header-actions {
            flex-direction: column;
          }

          .create-button,
          .refresh-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="workflows-container">

        {/* =========================
            HEADER
            ========================= */}

        <header className="workflows-header">

          <div className="workflows-heading">

            <div className="workflows-icon">
              <WorkflowIcon size={25} />
            </div>

            <div>
              <h1>Workflow Universe</h1>

              <p>
                Manage and monitor your NovaWavex workflows.
              </p>
            </div>

          </div>

          <div className="header-actions">

            {/* CREATE WORKFLOW BUTTON */}

            <button
              type="button"
              className="create-button"
              onClick={handleCreateWorkflow}
              disabled={loading}
            >
              <Plus size={16} />
              Create Workflow
            </button>

            {/* REFRESH BUTTON */}

            <button
              type="button"
              className="refresh-button"
              onClick={loadWorkflows}
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={loading ? "spin" : ""}
              />

              Refresh
            </button>

          </div>

        </header>

        {/* =========================
            SUMMARY
            ========================= */}

        {!loading && !error && (
          <>
            <section className="workflow-summary">

              <div className="summary-card">
                <div className="summary-label">
                  Total
                </div>

                <div className="summary-value">
                  {totalWorkflows}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  Active
                </div>

                <div className="summary-value">
                  {activeWorkflows}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  Draft
                </div>

                <div className="summary-value">
                  {draftWorkflows}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  Completed
                </div>

                <div className="summary-value">
                  {completedWorkflows}
                </div>
              </div>

            </section>

            {/* =========================
                SEARCH + FILTER
                ========================= */}

            <section className="workflow-controls">

              <div className="search-wrapper">

                <Search
                  size={17}
                  className="search-icon"
                />

                <input
                  type="text"
                  className="search-input"
                  placeholder="Search workflows by name, description or creator..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}

              </div>

              <div className="status-filters">

                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`status-filter ${
                      statusFilter === filter
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setStatusFilter(filter)
                    }
                  >
                    {filter === "ALL"
                      ? "All"
                      : STATUS_CONFIG[filter]?.label ||
                        filter}
                  </button>
                ))}

              </div>

            </section>
          </>
        )}

        {/* =========================
            LOADING
            ========================= */}

        {loading && (
          <div className="state-container">

            <div className="state-content">

              <div className="state-icon">
                <Loader2
                  size={25}
                  className="spin"
                />
              </div>

              <h2>Loading workflows</h2>

              <p>
                Connecting to the NovaWavex workflow engine
                and retrieving your workflows.
              </p>

            </div>

          </div>
        )}

        {/* =========================
            ERROR
            ========================= */}

        {!loading && error && (
          <div className="state-container">

            <div className="state-content">

              <div className="state-icon">
                <AlertCircle size={25} />
              </div>

              <h2>Unable to load workflows</h2>

              <p>{error}</p>

              <button
                type="button"
                className="retry-button"
                onClick={loadWorkflows}
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* =========================
            NO WORKFLOWS
            ========================= */}

        {!loading &&
          !error &&
          workflows.length === 0 && (

            <div className="state-container">

              <div className="state-content">

                <div className="state-icon">
                  <WorkflowIcon size={25} />
                </div>

                <h2>No workflows found</h2>

                <p>
                  There are currently no workflows available
                  for your account.
                </p>

                {/* CREATE FROM EMPTY STATE */}

                <button
                  type="button"
                  className="create-button"
                  onClick={handleCreateWorkflow}
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <Plus size={16} />
                  Create Your First Workflow
                </button>

              </div>

            </div>
          )}

        {/* =========================
            NO SEARCH RESULTS
            ========================= */}

        {!loading &&
          !error &&
          workflows.length > 0 &&
          filteredWorkflows.length === 0 && (

            <div className="state-container">

              <div className="state-content">

                <div className="state-icon">
                  <Search size={25} />
                </div>

                <h2>No matching workflows</h2>

                <p>
                  No workflows match your current search or
                  status filter.
                </p>

                <button
                  type="button"
                  className="retry-button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </button>

              </div>

            </div>
          )}

        {/* =========================
            WORKFLOW CARDS
            ========================= */}

        {!loading &&
          !error &&
          filteredWorkflows.length > 0 && (

            <>

              <div className="results-info">

                Showing{" "}

                <strong>
                  {filteredWorkflows.length}
                </strong>{" "}

                of{" "}

                <strong>
                  {workflows.length}
                </strong>{" "}

                workflows

              </div>

              <section className="workflows-grid">

                {filteredWorkflows.map((workflow) => {

                  const status = String(
                    workflow.status || "UNKNOWN"
                  ).toUpperCase();

                  const statusConfig =
                    getStatusConfig(status);

                  const StatusIcon =
                    statusConfig.icon;

                  const createdBy =
                    typeof workflow.createdBy === "object"
                      ? workflow.createdBy?.email ||
                        workflow.createdBy?.username ||
                        workflow.createdBy?.id ||
                        "User"
                      : workflow.createdBy;

                  return (
                    <article
                      className="workflow-card"
                      key={workflow.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(
                          `/workflows/${workflow.id}`
                        )
                      }
                      onKeyDown={(event) =>
                        handleWorkflowKeyDown(
                          event,
                          workflow.id
                        )
                      }
                    >

                      <div className="workflow-card-header">

                        <div className="workflow-title-wrapper">

                          <h2 className="workflow-title">
                            {workflow.name ||
                              "Unnamed Workflow"}
                          </h2>

                          {workflow.id !== undefined &&
                            workflow.id !== null && (
                              <div className="workflow-id">
                                ID: {workflow.id}
                              </div>
                            )}

                        </div>

                        <div
                          className={`status-badge ${status.toLowerCase()}`}
                        >
                          <StatusIcon size={13} />

                          {statusConfig.label}
                        </div>

                      </div>

                      <p className="workflow-description">

                        {workflow.description ||
                          "No description has been provided for this workflow."}

                      </p>

                      <div className="workflow-meta">

                        {workflow.createdAt && (
                          <div className="meta-row">

                            <Calendar size={14} />

                            Created:

                            <span>
                              {formatDate(
                                workflow.createdAt
                              )}
                            </span>

                          </div>
                        )}

                        {workflow.updatedAt && (
                          <div className="meta-row">

                            <Clock3 size={14} />

                            Updated:

                            <span>
                              {formatDate(
                                workflow.updatedAt
                              )}
                            </span>

                          </div>
                        )}

                        {workflow.createdBy && (
                          <div className="meta-row">

                            <GitBranch size={14} />

                            Created by:

                            <span>
                              {createdBy}
                            </span>

                          </div>
                        )}

                      </div>

                    </article>
                  );
                })}

              </section>

            </>
          )}

      </div>
    </div>
  );
};

export default Workflows;