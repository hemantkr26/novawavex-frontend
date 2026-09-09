import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  GitBranch,
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
  const [retrying, setRetrying] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadWorkflows = async (isRetry = false) => {
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

      const data = await workflowService.getAllWorkflows();

      console.log("NovaWavex workflows:", data);

      setWorkflows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load workflows:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to access these workflows."
        );
      } else if (err.response?.status === 404) {
        setError(
          "The workflow service could not be found."
        );
      } else {
        setError(
          "Unable to load workflows. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRetrying(false);
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
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      navigate(`/workflows/${workflowId}`);
    }
  };

  const handleCreateWorkflow = () => {
    navigate("/workflows/create");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const handleRetry = () => {
    if (retrying) {
      return;
    }

    loadWorkflows(true);
  };

  const actionsDisabled = loading || retrying;

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

        /* =========================
           LOADING SKELETON
           ========================= */

        .workflow-loading-state {
          display: grid;
          gap: 20px;
        }

        .loading-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .loading-summary-card {
          min-height: 94px;
          padding: 20px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
          overflow: hidden;
        }

        .loading-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 76px;
          padding: 16px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.025);
          overflow: hidden;
        }

        .loading-search {
          width: min(500px, 100%);
          height: 40px;
          border-radius: 10px;
        }

        .loading-filters {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .loading-filter {
          width: 62px;
          height: 34px;
          border-radius: 9px;
        }

        .loading-filter:nth-child(2) {
          width: 70px;
        }

        .loading-filter:nth-child(3) {
          width: 66px;
        }

        .loading-filter:nth-child(4) {
          width: 84px;
        }

        .loading-filter:nth-child(5) {
          width: 78px;
        }

        .loading-results-label {
          width: 180px;
          height: 14px;
          margin-bottom: 0;
          border-radius: 6px;
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .workflow-skeleton-card {
          position: relative;
          min-height: 230px;
          padding: 22px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.055),
              rgba(255, 255, 255, 0.018)
            );
          overflow: hidden;
        }

        .skeleton {
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.065);
        }

        .skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.08),
              transparent
            );
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
        }

        .skeleton-title {
          width: 58%;
          height: 19px;
          border-radius: 6px;
        }

        .skeleton-id {
          width: 34%;
          height: 11px;
          margin-top: 9px;
          border-radius: 5px;
        }

        .skeleton-status {
          width: 76px;
          height: 27px;
          border-radius: 999px;
        }

        .skeleton-description {
          width: 92%;
          height: 12px;
          margin-top: 23px;
          border-radius: 5px;
        }

        .skeleton-description.short {
          width: 70%;
          margin-top: 9px;
        }

        .skeleton-meta {
          width: 75%;
          height: 11px;
          margin-top: 18px;
          border-radius: 5px;
        }

        .skeleton-meta.second {
          width: 62%;
          margin-top: 11px;
        }

        .skeleton-meta.third {
          width: 55%;
          margin-top: 11px;
        }

        @keyframes skeleton-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .loading-orbit {
          width: 54px;
          height: 54px;
          margin: 0 auto;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-orbit::before,
        .loading-orbit::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(77, 124, 255, 0.28);
        }

        .loading-orbit::before {
          inset: 2px;
          border-top-color: rgba(77, 124, 255, 0.9);
          animation: loading-orbit-spin 1.4s linear infinite;
        }

        .loading-orbit::after {
          inset: 10px;
          border-bottom-color: rgba(0, 212, 170, 0.8);
          animation: loading-orbit-spin-reverse 1.1s linear infinite;
        }

        .loading-orbit-icon {
          color: #9bb9ff;
          animation: loading-pulse 1.5s ease-in-out infinite;
        }

        @keyframes loading-orbit-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loading-orbit-spin-reverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes loading-pulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(0.94);
          }

          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* =========================
           EMPTY / ERROR STATES
           ========================= */

        .state-container {
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          box-sizing: border-box;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          background:
            radial-gradient(
              circle at center,
              rgba(77, 124, 255, 0.045),
              transparent 55%
            ),
            rgba(255, 255, 255, 0.02);
          overflow: hidden;

          animation:
            state-container-enter 0.38s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .state-container::before {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(77, 124, 255, 0.06);
          pointer-events: none;
          animation: state-orbit-pulse 4s ease-in-out infinite;
        }

        .state-container::after {
          content: "";
          position: absolute;
          width: 190px;
          height: 190px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(0, 212, 170, 0.045);
          pointer-events: none;
          animation: state-orbit-pulse-reverse 4.5s ease-in-out infinite;
        }

        @keyframes state-container-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes state-orbit-pulse {
          0%,
          100% {
            opacity: 0.45;
            transform: translate(-50%, -50%) scale(0.96);
          }

          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes state-orbit-pulse-reverse {
          0%,
          100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }

          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0.94);
          }
        }

        .state-content {
          position: relative;
          z-index: 1;
          max-width: 460px;
          text-align: center;

          animation:
            state-content-enter 0.42s 0.04s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes state-content-enter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* =========================
           EMPTY STATE ICON
           ========================= */

        .state-icon {
          position: relative;
          width: 58px;
          height: 58px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(77, 124, 255, 0.18);
          border-radius: 17px;
          color: #9bb9ff;
          background:
            linear-gradient(
              145deg,
              rgba(77, 124, 255, 0.14),
              rgba(77, 124, 255, 0.055)
            );
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.18),
            0 0 0 7px rgba(77, 124, 255, 0.025);

          animation:
            empty-icon-enter 0.45s 0.08s
              cubic-bezier(0.22, 1, 0.36, 1) both,
            empty-icon-float 3.5s 0.55s ease-in-out infinite;
        }

        .state-icon::before {
          content: "";
          position: absolute;
          inset: -7px;
          border-radius: 21px;
          border: 1px solid rgba(77, 124, 255, 0.07);
          pointer-events: none;

          animation:
            empty-icon-ring 2.8s 0.7s
            ease-in-out infinite;
        }

        .state-icon::after {
          content: "";
          position: absolute;
          inset: -13px;
          border-radius: 27px;
          border: 1px solid rgba(77, 124, 255, 0.025);
          pointer-events: none;
        }

        @keyframes empty-icon-enter {
          from {
            opacity: 0;
            transform: scale(0.75) rotate(-5deg);
          }

          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes empty-icon-float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes empty-icon-ring {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.98);
          }

          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        /* =========================
           EMPTY UNIVERSE STATE
           ========================= */

        .empty-state {
          background:
            radial-gradient(
              circle at center,
              rgba(77, 124, 255, 0.065),
              transparent 58%
            ),
            rgba(255, 255, 255, 0.02);
        }

        .empty-state .state-icon {
          color: #a6c0ff;
          background:
            linear-gradient(
              145deg,
              rgba(77, 124, 255, 0.17),
              rgba(0, 212, 170, 0.055)
            );
          border-color: rgba(77, 124, 255, 0.24);

          box-shadow:
            0 12px 34px rgba(0, 0, 0, 0.2),
            0 0 0 7px rgba(77, 124, 255, 0.035),
            0 0 30px rgba(77, 124, 255, 0.05);
        }

        .empty-state .state-icon svg {
          animation: workflow-empty-icon-pulse 2.8s
            ease-in-out infinite;
        }

        @keyframes workflow-empty-icon-pulse {
          0%,
          100% {
            opacity: 0.75;
            transform: scale(0.96);
          }

          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        /* =========================
           SEARCH EMPTY STATE
           ========================= */

        .search-empty-state {
          background:
            radial-gradient(
              circle at center,
              rgba(148, 163, 184, 0.035),
              transparent 58%
            ),
            rgba(255, 255, 255, 0.018);
        }

        .search-empty-state::before {
          border-color: rgba(148, 163, 184, 0.055);
        }

        .search-empty-state::after {
          border-color: rgba(77, 124, 255, 0.035);
        }

        .search-empty-state .state-icon {
          color: #aab8d5;
          background:
            linear-gradient(
              145deg,
              rgba(148, 163, 184, 0.13),
              rgba(77, 124, 255, 0.055)
            );
          border-color: rgba(148, 163, 184, 0.15);
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.18),
            0 0 0 7px rgba(148, 163, 184, 0.02);
        }

        .search-empty-state .state-icon svg {
          animation: search-empty-icon-pulse 3s
            ease-in-out infinite;
        }

        @keyframes search-empty-icon-pulse {
          0%,
          100% {
            opacity: 0.65;
            transform: scale(0.96);
          }

          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        /* =========================
           EMPTY STATE CONTENT
           ========================= */

        .state-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          padding: 5px 9px;
          border: 1px solid rgba(77, 124, 255, 0.12);
          border-radius: 999px;
          color: #849ed4;
          background: rgba(77, 124, 255, 0.06);
          font-size: 10px;
          font-weight: 650;
          letter-spacing: 0.6px;
          text-transform: uppercase;

          animation:
            empty-eyebrow-enter 0.3s 0.12s ease both;
        }

        @keyframes empty-eyebrow-enter {
          from {
            opacity: 0;
            transform: translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .state-content h2 {
          margin: 0 0 9px;
          color: #f0f4ff;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: -0.2px;

          animation:
            empty-heading-enter 0.32s 0.15s ease both;
        }

        @keyframes empty-heading-enter {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .state-content p {
          margin: 0 auto;
          max-width: 400px;
          color: #7f8ba3;
          line-height: 1.65;
          font-size: 13px;

          animation:
            empty-description-enter 0.32s 0.18s ease both;
        }

        @keyframes empty-description-enter {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .state-action {
          margin-top: 22px;
          display: inline-flex;

          animation:
            empty-action-enter 0.38s 0.23s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes empty-action-enter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .empty-create-button {
          min-width: 190px;
        }

        .empty-create-button svg {
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .empty-create-button:hover svg {
          transform: rotate(90deg);
        }

        .empty-secondary-action {
          margin-top: 12px;
          color: #69758c;
          font-size: 11px;

          animation:
            empty-secondary-enter 0.3s 0.3s ease both;
        }

        @keyframes empty-secondary-enter {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .empty-secondary-action strong {
          color: #8490a8;
          font-weight: 600;
        }

        .search-empty-icon {
          color: #9caed2;
          background:
            linear-gradient(
              145deg,
              rgba(148, 163, 184, 0.12),
              rgba(77, 124, 255, 0.055)
            );
          border-color: rgba(148, 163, 184, 0.14);
        }

        /* =========================
           ERROR STATE
           ========================= */

        .error-state {
          border-color: rgba(255, 77, 96, 0.14);
          background:
            radial-gradient(
              circle at center,
              rgba(255, 77, 96, 0.045),
              transparent 58%
            ),
            rgba(255, 255, 255, 0.018);
        }

        .error-state::before {
          width: 300px;
          height: 300px;
          border-color: rgba(255, 77, 96, 0.055);
          animation: error-orbit-pulse 3.8s ease-in-out infinite;
        }

        .error-state::after {
          width: 205px;
          height: 205px;
          border-color: rgba(255, 77, 96, 0.035);
          animation: error-orbit-pulse-reverse 4.2s ease-in-out infinite;
        }

        @keyframes error-orbit-pulse {
          0%,
          100% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(0.96);
          }

          50% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.02);
          }
        }

        @keyframes error-orbit-pulse-reverse {
          0%,
          100% {
            opacity: 0.25;
            transform: translate(-50%, -50%) scale(1);
          }

          50% {
            opacity: 0.65;
            transform: translate(-50%, -50%) scale(0.94);
          }
        }

        .error-state .state-eyebrow {
          color: #e9a0a8;
          border-color: rgba(255, 77, 96, 0.14);
          background: rgba(255, 77, 96, 0.055);
        }

        .error-state .state-icon {
          color: #ff9aa5;
          background:
            linear-gradient(
              145deg,
              rgba(255, 77, 96, 0.15),
              rgba(255, 77, 96, 0.045)
            );
          border-color: rgba(255, 77, 96, 0.2);
          box-shadow:
            0 10px 30px rgba(255, 77, 96, 0.08),
            0 0 0 7px rgba(255, 77, 96, 0.025),
            0 0 30px rgba(255, 77, 96, 0.035);

          animation:
            error-icon-enter 0.45s 0.08s
              cubic-bezier(0.22, 1, 0.36, 1) both,
            error-icon-pulse 2.8s 0.55s ease-in-out infinite;
        }

        .error-state .state-icon::before {
          border-color: rgba(255, 77, 96, 0.1);
          animation: error-icon-ring 2.6s 0.7s ease-in-out infinite;
        }

        .error-state .state-icon::after {
          border-color: rgba(255, 77, 96, 0.04);
        }

        .error-state .state-icon svg {
          animation: error-symbol-pulse 2.8s 0.65s ease-in-out infinite;
        }

        @keyframes error-icon-enter {
          from {
            opacity: 0;
            transform: scale(0.72) rotate(-8deg);
          }

          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes error-icon-pulse {
          0%,
          100% {
            box-shadow:
              0 10px 30px rgba(255, 77, 96, 0.08),
              0 0 0 7px rgba(255, 77, 96, 0.025),
              0 0 30px rgba(255, 77, 96, 0.035);
          }

          50% {
            box-shadow:
              0 12px 34px rgba(255, 77, 96, 0.12),
              0 0 0 10px rgba(255, 77, 96, 0.035),
              0 0 38px rgba(255, 77, 96, 0.06);
          }
        }

        @keyframes error-icon-ring {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.98);
          }

          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }

        @keyframes error-symbol-pulse {
          0%,
          100% {
            opacity: 0.75;
            transform: scale(0.96);
          }

          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .error-state .state-content h2 {
          color: #f3e8eb;
        }

        .error-state .state-content p {
          color: #8993a8;
        }

        .error-detail {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 14px;
          padding: 7px 10px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: #6f7b91;
          background: rgba(255, 255, 255, 0.025);
          font-size: 10px;
          letter-spacing: 0.35px;

          animation:
            error-detail-enter 0.3s 0.22s ease both;
        }

        .error-detail-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff6f7e;
          box-shadow: 0 0 10px rgba(255, 77, 96, 0.45);
          animation: error-dot-pulse 1.8s ease-in-out infinite;
        }

        @keyframes error-detail-enter {
          from {
            opacity: 0;
            transform: translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes error-dot-pulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(0.9);
          }

          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        .retry-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 20px;
          min-height: 38px;
          min-width: 112px;
          padding: 10px 15px;
          border: 1px solid rgba(77, 124, 255, 0.3);
          border-radius: 9px;
          color: #dce5f8;
          background: rgba(77, 124, 255, 0.1);
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .retry-button:hover {
          background: rgba(77, 124, 255, 0.16);
          border-color: rgba(77, 124, 255, 0.4);
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px rgba(77, 124, 255, 0.1);
        }

        .retry-button:active {
          transform: translateY(0);
        }

        .retry-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .retry-button .retry-icon {
          flex-shrink: 0;
        }

        .empty-clear-button {
          min-width: 130px;
        }

        .empty-clear-button svg {
          transition: transform 0.2s ease;
        }

        .empty-clear-button:hover svg {
          transform: rotate(90deg);
        }

        /* =========================
           SPIN
           ========================= */

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

        /* =========================
           REDUCED MOTION
           ========================= */

        @media (prefers-reduced-motion: reduce) {
          .skeleton::after,
          .loading-orbit::before,
          .loading-orbit::after,
          .loading-orbit-icon,
          .spin,
          .state-container,
          .state-container::before,
          .state-container::after,
          .state-content,
          .state-eyebrow,
          .state-icon,
          .state-icon::before,
          .empty-state .state-icon svg,
          .search-empty-state .state-icon svg,
          .error-state::before,
          .error-state::after,
          .error-state .state-icon,
          .error-state .state-icon::before,
          .error-state .state-icon svg,
          .error-detail,
          .error-detail-dot,
          .state-content h2,
          .state-content p,
          .state-action,
          .empty-secondary-action {
            animation: none !important;
          }

          .empty-create-button svg,
          .empty-clear-button svg,
          .retry-button,
          .create-button,
          .refresh-button,
          .workflow-card {
            transition: none !important;
          }
        }

        /* =========================
           RESPONSIVE
           ========================= */

        @media (max-width: 1150px) {
          .workflows-grid,
          .loading-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .workflow-controls,
          .loading-controls {
            align-items: flex-start;
            flex-direction: column;
          }

          .search-wrapper {
            max-width: none;
            width: 100%;
          }

          .loading-search {
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

          .workflow-summary,
          .loading-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .workflows-grid,
          .loading-grid {
            grid-template-columns: 1fr;
          }

          .loading-controls {
            align-items: stretch;
          }

          .loading-filters {
            width: 100%;
          }

          .state-container {
            min-height: 380px;
            padding: 24px;
          }
        }

        @media (max-width: 500px) {
          .workflow-summary,
          .loading-summary {
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

          .loading-filters {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .loading-filter,
          .loading-filter:nth-child(2),
          .loading-filter:nth-child(3),
          .loading-filter:nth-child(4),
          .loading-filter:nth-child(5) {
            width: 100%;
          }

          .state-container {
            min-height: 340px;
            padding: 22px 16px;
          }

          .state-content h2 {
            font-size: 19px;
          }

          .state-content p {
            font-size: 12px;
          }

          .empty-create-button {
            width: 100%;
          }

          .error-detail {
            max-width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>

      <div className="workflows-container">

        {/* =========================
            HEADER
            ========================= */}

        <header className="workflows-header">

          <div className="workflows-heading">

            <div
              className="workflows-icon"
              aria-hidden="true"
            >
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

            <button
              type="button"
              className="create-button"
              onClick={handleCreateWorkflow}
              disabled={actionsDisabled}
              aria-label="Create a new workflow"
            >
              <Plus
                size={16}
                aria-hidden="true"
              />

              Create Workflow
            </button>

            <button
              type="button"
              className="refresh-button"
              onClick={() => loadWorkflows()}
              disabled={actionsDisabled}
              aria-label={
                loading
                  ? "Refreshing workflows"
                  : retrying
                    ? "Retrying workflows"
                    : "Refresh workflows"
              }
              aria-busy={loading || retrying}
            >
              <RefreshCw
                size={15}
                className={
                  loading || retrying
                    ? "spin"
                    : ""
                }
                aria-hidden="true"
              />

              {loading
                ? "Refreshing..."
                : retrying
                  ? "Retrying..."
                  : "Refresh"}
            </button>

          </div>

        </header>

        {/* =========================
            LOADING
            ========================= */}

        {loading && (
          <div
            className="workflow-loading-state"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >

            <div
              className="loading-summary"
              aria-hidden="true"
            >

              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="loading-summary-card"
                  key={`summary-skeleton-${index}`}
                >
                  <div
                    className="skeleton"
                    style={{
                      width:
                        index === 0
                          ? "38%"
                          : "44%",
                      height: "11px",
                      borderRadius: "5px",
                    }}
                  />

                  <div
                    className="skeleton"
                    style={{
                      width: "28%",
                      height: "28px",
                      marginTop: "12px",
                      borderRadius: "7px",
                    }}
                  />
                </div>
              ))}

            </div>

            <div
              className="loading-controls"
              aria-hidden="true"
            >

              <div className="skeleton loading-search" />

              <div className="loading-filters">

                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    className="skeleton loading-filter"
                    key={`filter-skeleton-${index}`}
                  />
                ))}

              </div>

            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "4px 0 0",
              }}
            >

              <div className="loading-orbit">
                <WorkflowIcon
                  size={20}
                  className="loading-orbit-icon"
                  aria-hidden="true"
                />
              </div>

              <div
                style={{
                  color: "#8d99b0",
                  fontSize: "13px",
                  fontWeight: 550,
                }}
              >
                Synchronizing workflow universe...
              </div>

            </div>

            <div
              className="skeleton loading-results-label"
              aria-hidden="true"
            />

            <div
              className="loading-grid"
              aria-hidden="true"
            >

              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  className="workflow-skeleton-card"
                  key={`workflow-skeleton-${index}`}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >

                    <div style={{ minWidth: 0, flex: 1 }}>

                      <div className="skeleton skeleton-title" />

                      <div className="skeleton skeleton-id" />

                    </div>

                    <div className="skeleton skeleton-status" />

                  </div>

                  <div className="skeleton skeleton-description" />

                  <div className="skeleton skeleton-description short" />

                  <div
                    style={{
                      marginTop: "26px",
                      paddingTop: "16px",
                      borderTop:
                        "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >

                    <div className="skeleton skeleton-meta" />

                    <div className="skeleton skeleton-meta second" />

                    <div className="skeleton skeleton-meta third" />

                  </div>

                </div>
              ))}

            </div>

            <span
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: 0,
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              Loading workflows from the NovaWavex workflow engine.
            </span>

          </div>
        )}

        {/* =========================
            SUMMARY
            ========================= */}

        {!loading && !error && (
          <>
            <section
              className="workflow-summary"
              aria-label="Workflow summary"
            >

              <div className="summary-card">
                <div className="summary-label">
                  Total
                </div>

                <div
                  className="summary-value"
                  aria-label={`${totalWorkflows} total workflows`}
                >
                  {totalWorkflows}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  Active
                </div>

                <div
                  className="summary-value"
                  aria-label={`${activeWorkflows} active workflows`}
                >
                  {activeWorkflows}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  Draft
                </div>

                <div
                  className="summary-value"
                  aria-label={`${draftWorkflows} draft workflows`}
                >
                  {draftWorkflows}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  Completed
                </div>

                <div
                  className="summary-value"
                  aria-label={`${completedWorkflows} completed workflows`}
                >
                  {completedWorkflows}
                </div>
              </div>

            </section>

            {/* =========================
                SEARCH + FILTER
                ========================= */}

            <section
              className="workflow-controls"
              aria-label="Workflow search and filters"
            >

              <div className="search-wrapper">

                <Search
                  size={17}
                  className="search-icon"
                  aria-hidden="true"
                />

                <input
                  type="text"
                  className="search-input"
                  placeholder="Search workflows by name, description or creator..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  aria-label="Search workflows by name, description or creator"
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={clearSearch}
                    aria-label="Clear workflow search"
                  >
                    <X
                      size={14}
                      aria-hidden="true"
                    />
                  </button>
                )}

              </div>

              <div
                className="status-filters"
                aria-label="Filter workflows by status"
              >

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
                    aria-pressed={
                      statusFilter === filter
                    }
                    aria-label={`Show ${
                      filter === "ALL"
                        ? "all workflows"
                        : `${STATUS_CONFIG[filter]?.label || filter.toLowerCase()} workflows`
                    }`}
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
            ERROR
            ========================= */}

        {!loading && error && (
          <div
            className="state-container error-state"
            role="alert"
            aria-live="assertive"
            aria-busy={retrying}
          >

            <div className="state-content">

              <div
                className="state-eyebrow"
                aria-hidden="true"
              >
                <AlertCircle size={11} />
                Workflow service
              </div>

              <div
                className="state-icon"
                aria-hidden="true"
              >
                <AlertCircle size={25} />
              </div>

              <h2>
                Unable to load workflows
              </h2>

              <p>
                {error}
              </p>

              <div
                className="error-detail"
                aria-hidden="true"
              >
                <span className="error-detail-dot" />
                Connection to workflow service interrupted
              </div>

              <div className="state-action">

                <button
                  type="button"
                  className="retry-button"
                  onClick={handleRetry}
                  disabled={retrying}
                  aria-label={
                    retrying
                      ? "Retrying workflow request"
                      : "Try loading workflows again"
                  }
                  aria-busy={retrying}
                >
                  <RefreshCw
                    size={14}
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

              </div>

              <span
                style={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: 0,
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  border: 0,
                }}
                aria-live="polite"
              >
                {retrying
                  ? "Retrying the workflow service connection."
                  : ""}
              </span>

            </div>

          </div>
        )}

        {/* =========================
            NO WORKFLOWS
            ========================= */}

        {!loading &&
          !error &&
          workflows.length === 0 && (

            <div
              className="state-container empty-state"
              role="status"
              aria-live="polite"
            >

              <div className="state-content">

                <div
                  className="state-eyebrow"
                  aria-hidden="true"
                >
                  <WorkflowIcon size={11} />
                  Workflow Universe
                </div>

                <div
                  className="state-icon"
                  aria-hidden="true"
                >
                  <WorkflowIcon size={27} />
                </div>

                <h2>
                  Your workflow universe is empty
                </h2>

                <p>
                  You don't have any workflows yet.
                  Create your first workflow to start
                  building and managing your automation.
                </p>

                <div className="state-action">
                  <button
                    type="button"
                    className="create-button empty-create-button"
                    onClick={handleCreateWorkflow}
                    aria-label="Create your first workflow"
                  >
                    <Plus
                      size={16}
                      aria-hidden="true"
                    />

                    Create Your First Workflow
                  </button>
                </div>

                <div className="empty-secondary-action">
                  Start with a <strong>Draft</strong> and
                  activate it when you're ready.
                </div>

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

            <div
              className="state-container search-empty-state"
              role="status"
              aria-live="polite"
            >

              <div className="state-content">

                <div
                  className="state-eyebrow"
                  aria-hidden="true"
                >
                  <Search size={11} />
                  Search results
                </div>

                <div
                  className="state-icon search-empty-icon"
                  aria-hidden="true"
                >
                  <Search size={25} />
                </div>

                <h2>
                  No matching workflows
                </h2>

                <p>
                  No workflows match your current search
                  or status filter. Try adjusting your
                  search or clearing the active filters.
                </p>

                <div className="state-action">
                  <button
                    type="button"
                    className="retry-button empty-clear-button"
                    onClick={clearFilters}
                    aria-label="Clear workflow search and status filters"
                  >
                    <X
                      size={14}
                      aria-hidden="true"
                    />

                    Clear Filters
                  </button>
                </div>

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

              <div
                className="results-info"
                role="status"
                aria-live="polite"
              >
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

              <section
                className="workflows-grid"
                aria-label="Available workflows"
              >

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

                  const workflowName =
                    workflow.name ||
                    "Unnamed Workflow";

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
                      aria-label={`Open workflow ${workflowName}, status ${statusConfig.label}`}
                    >

                      <div className="workflow-card-header">

                        <div className="workflow-title-wrapper">

                          <h2 className="workflow-title">
                            {workflowName}
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
                          aria-label={`Status: ${statusConfig.label}`}
                        >
                          <StatusIcon
                            size={13}
                            aria-hidden="true"
                          />

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

                            <Calendar
                              size={14}
                              aria-hidden="true"
                            />

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

                            <Clock3
                              size={14}
                              aria-hidden="true"
                            />

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

                            <GitBranch
                              size={14}
                              aria-hidden="true"
                            />

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