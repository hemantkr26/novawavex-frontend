import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import workflowService from "../services/workflowService";
import EditWorkflow from "../components/EditWorkflow";

const EditWorkflowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await workflowService.getWorkflowById(id);

      setWorkflow(data);
    } catch (err) {
      console.error("Failed to load workflow:", err);

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

  useEffect(() => {
    if (id) {
      loadWorkflow();
    }
  }, [id]);

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
            min-height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.025);
          }

          .loading-content {
            text-align: center;
          }

          .loading-icon {
            width: 58px;
            height: 58px;
            margin: 0 auto 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            color: #9bb9ff;
            background: rgba(77, 124, 255, 0.1);
            border: 1px solid rgba(77, 124, 255, 0.2);
          }

          .loading-content h2 {
            margin: 0 0 8px;
            color: #eef3ff;
            font-size: 20px;
          }

          .loading-content p {
            margin: 0;
            color: #7f8ba3;
            font-size: 13px;
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

        <div className="edit-workflow-container">
          <div className="loading-state">
            <div className="loading-content">
              <div className="loading-icon">
                <Loader2
                  size={28}
                  className="spin"
                />
              </div>

              <h2>Loading workflow</h2>

              <p>
                Retrieving workflow information...
              </p>
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
            min-height: 500px;
            padding: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.025);
          }

          .error-content {
            max-width: 460px;
            text-align: center;
          }

          .error-icon {
            width: 58px;
            height: 58px;
            margin: 0 auto 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            color: #ff9aa5;
            background: rgba(255, 77, 96, 0.1);
            border: 1px solid rgba(255, 77, 96, 0.2);
          }

          .error-content h2 {
            margin: 0 0 8px;
            color: #eef3ff;
            font-size: 20px;
          }

          .error-content p {
            margin: 0;
            color: #7f8ba3;
            font-size: 13px;
            line-height: 1.6;
          }

          .back-button {
            margin-top: 22px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 15px;
            border: 1px solid rgba(77, 124, 255, 0.3);
            border-radius: 10px;
            color: #dce5f8;
            background: rgba(77, 124, 255, 0.1);
            cursor: pointer;
            transition: 0.2s ease;
          }

          .back-button:hover {
            background: rgba(77, 124, 255, 0.17);
            border-color: rgba(77, 124, 255, 0.5);
          }
        `}</style>

        <div className="edit-workflow-container">
          <div className="error-state">
            <div className="error-content">
              <div className="error-icon">
                <AlertCircle size={28} />
              </div>

              <h2>Unable to load workflow</h2>

              <p>{error}</p>

              <button
                type="button"
                className="back-button"
                onClick={() => navigate("/workflows")}
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