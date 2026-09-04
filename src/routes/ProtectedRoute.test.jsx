import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should render protected content when user is authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<div>Protected Dashboard</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Protected Dashboard")
    ).toBeInTheDocument();
  });

  test("should redirect unauthenticated user to login", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<div>Protected Dashboard</div>}
            />
          </Route>

          <Route
            path="/login"
            element={<div>Login Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Protected Dashboard")
    ).not.toBeInTheDocument();
  });
});