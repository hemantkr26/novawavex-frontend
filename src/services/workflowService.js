import api from "./api";

const workflowService = {
  getAllWorkflows: async () => {
    const response = await api.get("/api/workflows");
    return response.data;
  },

  getWorkflowById: async (id) => {
    const response = await api.get(`/api/workflows/${id}`);
    return response.data;
  },

  createWorkflow: async (workflowData) => {
    const response = await api.post(
      "/api/workflows",
      workflowData
    );

    return response.data;
  },

  updateWorkflow: async (id, workflowData) => {
    const response = await api.put(
      `/api/workflows/${id}`,
      workflowData
    );

    return response.data;
  },

  deleteWorkflow: async (id) => {
    await api.delete(`/api/workflows/${id}`);
  },

  // =========================================
  // EXECUTION APIs
  // =========================================

  createExecution: async (workflowId) => {
    const response = await api.post(
      `/api/executions/workflow/${workflowId}`
    );

    return response.data;
  },

  getExecutionById: async (executionId) => {
    const response = await api.get(
      `/api/executions/${executionId}`
    );

    return response.data;
  },

  getMyExecutions: async () => {
    const response = await api.get(
      "/api/executions"
    );

    return response.data;
  },

  startExecution: async (executionId) => {
    const response = await api.post(
      `/api/executions/${executionId}/start`
    );

    return response.data;
  },

  completeExecution: async (executionId) => {
    const response = await api.post(
      `/api/executions/${executionId}/complete`
    );

    return response.data;
  },

  failExecution: async (
    executionId,
    errorMessage
  ) => {
    const response = await api.post(
      `/api/executions/${executionId}/fail`,
      null,
      {
        params: errorMessage
          ? { errorMessage }
          : {},
      }
    );

    return response.data;
  },

  cancelExecution: async (executionId) => {
    const response = await api.post(
      `/api/executions/${executionId}/cancel`
    );

    return response.data;
  },

  retryExecution: async (executionId) => {
    const response = await api.post(
      `/api/executions/${executionId}/retry`
    );

    return response.data;
  },
};

export default workflowService;