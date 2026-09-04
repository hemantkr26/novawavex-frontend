import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Dashboard from "../pages/Dashboard";

import workflowService from "../services/workflowService";
import api from "../services/api";

vi.mock("../services/workflowService", () => ({
  default: {
    getAllWorkflows: vi.fn(),
  },
}));

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    workflowService.getAllWorkflows.mockResolvedValue([
      {
        id: 1,
        name: "Test Workflow",
        description: "Test description",
        status: "COMPLETED",
        createdAt: "2026-08-21T08:00:00",
        updatedAt: "2026-08-21T09:00:00",
      },
      {
        id: 2,
        name: "Second Workflow",
        description: "Second description",
        status: "DRAFT",
        createdAt: "2026-08-21T07:00:00",
        updatedAt: "2026-08-21T07:30:00",
      },
    ]);

    api.get.mockImplementation((url) => {
      if (url === "/api/executions") {
        return Promise.resolve({
          data: [
            {
              id: 101,
              status: "COMPLETED",
              createdAt: "2026-08-21T08:30:00",
              updatedAt: "2026-08-21T09:00:00",
              workflow: {
                id: 1,
                name: "Test Workflow",
              },
            },
            {
              id: 102,
              status: "RUNNING",
              createdAt: "2026-08-21T08:00:00",
              updatedAt: "2026-08-21T08:15:00",
              workflow: {
                id: 2,
                name: "Second Workflow",
              },
            },
          ],
        });
      }

      if (url === "/actuator/health") {
        return Promise.resolve({
          data: {
            status: "UP",
            components: {
              db: {
                status: "UP",
              },
            },
          },
        });
      }

      return Promise.reject(
        new Error(`Unexpected API URL: ${url}`)
      );
    });
  });

  it("should render dashboard and load workflows, executions and health", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(
      screen.getByText("NOVAWAVEX COMMAND CENTER")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        workflowService.getAllWorkflows
      ).toHaveBeenCalledTimes(1);

      expect(api.get).toHaveBeenCalledWith(
        "/api/executions"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/actuator/health"
      );
    });

    expect(
      await screen.findByText("Test Workflow")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Second Workflow")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Execution #101")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Execution #102")
    ).toBeInTheDocument();

    expect(
      screen.getByText("System Operational")
    ).toBeInTheDocument();
  });

  it("should display correct execution count and health", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("executions recorded")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("2", {
        selector: ".health-number",
      })
    ).toBeInTheDocument();

    const healthPercentages =
      screen.getAllByText("100%", {
        selector: ".health-bars strong",
      });

    expect(healthPercentages).toHaveLength(2);

    healthPercentages.forEach((element) => {
      expect(element).toBeInTheDocument();
    });
  });

  it("should navigate to workflows when View all workflows is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const button =
      await screen.findByRole("button", {
        name: /view all workflows/i,
      });

    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/workflows"
    );
  });

  it("should refresh dashboard data", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        workflowService.getAllWorkflows
      ).toHaveBeenCalledTimes(1);
    });

    const refreshButton =
      screen.getByRole("button", {
        name: /refresh dashboard/i,
      });

    await user.click(refreshButton);

    await waitFor(() => {
      expect(
        workflowService.getAllWorkflows
      ).toHaveBeenCalledTimes(2);

      expect(api.get).toHaveBeenCalledWith(
        "/api/executions"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/actuator/health"
      );
    });
  });

  it("should handle workflow loading failure", async () => {
    workflowService.getAllWorkflows.mockRejectedValue(
      new Error("Workflow API failed")
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Unable to load workflows/i
        )
      ).toBeInTheDocument();
    });
  });

  it("should handle execution loading failure", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/executions") {
        return Promise.reject(
          new Error("Execution API failed")
        );
      }

      if (url === "/actuator/health") {
        return Promise.resolve({
          data: {
            status: "UP",
            components: {
              db: {
                status: "UP",
              },
            },
          },
        });
      }

      return Promise.reject(
        new Error(`Unexpected API URL: ${url}`)
      );
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Unable to load executions."
        )
      ).toBeInTheDocument();
    });
  });

  it("should handle system health failure", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/executions") {
        return Promise.resolve({
          data: [],
        });
      }

      if (url === "/actuator/health") {
        return Promise.reject(
          new Error("Health API failed")
        );
      }

      return Promise.reject(
        new Error(`Unexpected API URL: ${url}`)
      );
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Unable to read system health."
        )
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("System Degraded")
    ).toBeInTheDocument();
  });
});
