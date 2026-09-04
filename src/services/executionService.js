import api from "./api";

const executionService = {
  // Get all executions for the logged-in user
  getMyExecutions: async () => {
    const response = await api.get("/api/executions");
    return response.data;
  },

  // Get execution by ID
  getExecutionById: async (id) => {
    const response = await api.get(`/api/executions/${id}`);
    return response.data;
  },

  // Create a new execution for a workflow
  createExecution: async (workflowId) => {
    const response = await api.post(
      `/api/executions/workflow/${workflowId}`
    );

    return response.data;
  },

  // Start execution
  startExecution: async (executionId) => {
    const response = await api.post(
      `/api/executions/${executionId}/start`
    );

    return response.data;
  },

  // Complete execution
  completeExecution: async (executionId) => {
    const response = await api.post(
      `/api/executions/${executionId}/complete`
    );

    return response.data;
  },

  // Fail execution
  failExecution: async (executionId, errorMessage) => {
    const response = await api.post(
      `/api/executions/${executionId}/fail`,
      null,
      {
        params: {
          errorMessage,
        },
      }
    );

    return response.data;
  },

  // Cancel execution
  cancelExecution: async (executionId) => {
    const response = await api.post(
      `/api/executions/${executionId}/cancel`
    );

    return response.data;
  },

  // Retry failed execution
  retryExecution: async (executionId) => {
    const response = await api.post(
      `/api/executions/${executionId}/retry`
    );

    return response.data;
  },
};

export default executionService;