import React from "react";

import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from "vitest";

import workflowService from "./workflowService";

import api from "./api";


vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));


describe("workflowService", () => {

  beforeEach(() => {

    vi.clearAllMocks();

  });


  // =========================================================
  // WORKFLOW APIs
  // =========================================================


  // =========================================================
  // 1. GET ALL WORKFLOWS
  // =========================================================

  it("should get all workflows", async () => {

    const workflows = [
      {
        id: 1,
        name: "Workflow 1",
      },
      {
        id: 2,
        name: "Workflow 2",
      },
    ];


    api.get.mockResolvedValue({
      data: workflows,
    });


    const result =
      await workflowService.getAllWorkflows();


    expect(api.get)
      .toHaveBeenCalledWith(
        "/api/workflows"
      );


    expect(result)
      .toEqual(workflows);

  });


  // =========================================================
  // 2. GET WORKFLOW BY ID
  // =========================================================

  it("should get workflow by id", async () => {

    const workflow = {
      id: 1,
      name: "Test Workflow",
    };


    api.get.mockResolvedValue({
      data: workflow,
    });


    const result =
      await workflowService.getWorkflowById(1);


    expect(api.get)
      .toHaveBeenCalledWith(
        "/api/workflows/1"
      );


    expect(result)
      .toEqual(workflow);

  });


  // =========================================================
  // 3. CREATE WORKFLOW
  // =========================================================

  it("should create workflow", async () => {

    const workflowData = {
      name: "New Workflow",
      description: "Test description",
      status: "DRAFT",
    };


    const createdWorkflow = {
      id: 1,
      ...workflowData,
    };


    api.post.mockResolvedValue({
      data: createdWorkflow,
    });


    const result =
      await workflowService.createWorkflow(
        workflowData
      );


    expect(api.post)
      .toHaveBeenCalledWith(
        "/api/workflows",
        workflowData
      );


    expect(result)
      .toEqual(createdWorkflow);

  });


  // =========================================================
  // 4. UPDATE WORKFLOW
  // =========================================================

  it("should update workflow", async () => {

    const workflowData = {
      name: "Updated Workflow",
      description: "Updated description",
      status: "ACTIVE",
    };


    const updatedWorkflow = {
      id: 1,
      ...workflowData,
    };


    api.put.mockResolvedValue({
      data: updatedWorkflow,
    });


    const result =
      await workflowService.updateWorkflow(
        1,
        workflowData
      );


    expect(api.put)
      .toHaveBeenCalledWith(
        "/api/workflows/1",
        workflowData
      );


    expect(result)
      .toEqual(updatedWorkflow);

  });


  // =========================================================
  // 5. DELETE WORKFLOW
  // =========================================================

  it("should delete workflow", async () => {

    api.delete.mockResolvedValue({
      status: 204,
    });


    const result =
      await workflowService.deleteWorkflow(1);


    expect(api.delete)
      .toHaveBeenCalledWith(
        "/api/workflows/1"
      );


    expect(result)
      .toBeUndefined();

  });


  // =========================================================
  // EXECUTION APIs
  // =========================================================


  // =========================================================
  // 6. CREATE EXECUTION
  // =========================================================

  it("should create workflow execution", async () => {

    const execution = {
      id: 10,
      status: "QUEUED",
    };


    api.post.mockResolvedValue({
      data: execution,
    });


    const result =
      await workflowService.createExecution(5);


    expect(api.post)
      .toHaveBeenCalledWith(
        "/api/executions/workflow/5"
      );


    expect(result)
      .toEqual(execution);

  });


  // =========================================================
  // 7. GET EXECUTION BY ID
  // =========================================================

  it("should get execution by id", async () => {

    const execution = {
      id: 10,
      status: "RUNNING",
    };


    api.get.mockResolvedValue({
      data: execution,
    });


    const result =
      await workflowService.getExecutionById(10);


    expect(api.get)
      .toHaveBeenCalledWith(
        "/api/executions/10"
      );


    expect(result)
      .toEqual(execution);

  });


  // =========================================================
  // 8. GET MY EXECUTIONS
  // =========================================================

  it("should get current user's executions", async () => {

    const executions = [
      {
        id: 10,
        status: "COMPLETED",
      },
      {
        id: 11,
        status: "FAILED",
      },
    ];


    api.get.mockResolvedValue({
      data: executions,
    });


    const result =
      await workflowService.getMyExecutions();


    expect(api.get)
      .toHaveBeenCalledWith(
        "/api/executions"
      );


    expect(result)
      .toEqual(executions);

  });


  // =========================================================
  // 9. START EXECUTION
  // =========================================================

  it("should start execution", async () => {

    const execution = {
      id: 10,
      status: "RUNNING",
    };


    api.post.mockResolvedValue({
      data: execution,
    });


    const result =
      await workflowService.startExecution(10);


    expect(api.post)
      .toHaveBeenCalledWith(
        "/api/executions/10/start"
      );


    expect(result)
      .toEqual(execution);

  });


  // =========================================================
  // 10. COMPLETE EXECUTION
  // =========================================================

  it("should complete execution", async () => {

    const execution = {
      id: 10,
      status: "COMPLETED",
    };


    api.post.mockResolvedValue({
      data: execution,
    });


    const result =
      await workflowService.completeExecution(10);


    expect(api.post)
      .toHaveBeenCalledWith(
        "/api/executions/10/complete"
      );


    expect(result)
      .toEqual(execution);

  });


  // =========================================================
  // 11. FAIL EXECUTION WITH ERROR MESSAGE
  // =========================================================

  it("should fail execution with error message", async () => {

    const execution = {
      id: 10,
      status: "FAILED",
      errorMessage: "Test failure",
    };


    api.post.mockResolvedValue({
      data: execution,
    });


    const result =
      await workflowService.failExecution(
        10,
        "Test failure"
      );


    expect(api.post)
      .toHaveBeenCalledWith(
        "/api/executions/10/fail",
        null,
        {
          params: {
            errorMessage: "Test failure",
          },
        }
      );


    expect(result)
      .toEqual(execution);

  });


  // =========================================================
  // 12. FAIL EXECUTION WITHOUT ERROR MESSAGE
  // =========================================================

  it("should fail execution without error message", async () => {

    const execution = {
      id: 10,
      status: "FAILED",
    };


    api.post.mockResolvedValue({
      data: execution,
    });


    const result =
      await workflowService.failExecution(10);


    expect(api.post)
      .toHaveBeenCalledWith(
        "/api/executions/10/fail",
        null,
        {
          params: {},
        }
      );


    expect(result)
      .toEqual(execution);

  });


  // =========================================================
  // 13. CANCEL EXECUTION
  // =========================================================

  it("should cancel execution", async () => {

    const execution = {
      id: 10,
      status: "CANCELLED",
    };


    api.post.mockResolvedValue({
      data: execution,
    });


    const result =
      await workflowService.cancelExecution(10);


    expect(api.post)
      .toHaveBeenCalledWith(
        "/api/executions/10/cancel"
      );


    expect(result)
      .toEqual(execution);

  });


  // =========================================================
  // 14. RETRY EXECUTION
  // =========================================================

  it("should retry execution", async () => {

    const execution = {
      id: 11,
      status: "QUEUED",
    };


    api.post.mockResolvedValue({
      data: execution,
    });


    const result =
      await workflowService.retryExecution(11);


    expect(api.post)
      .toHaveBeenCalledWith(
        "/api/executions/11/retry"
      );


    expect(result)
      .toEqual(execution);

  });

});