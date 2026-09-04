import React from "react";

import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from "vitest";

import {
  render,
  screen,
  act,
} from "@testing-library/react";

import { AuthProvider, useAuth } from "./AuthContext";

import authService from "../services/authService";


// =========================================
// MOCK AUTH SERVICE
// =========================================

vi.mock("../services/authService", () => ({
  default: {
    isAuthenticated: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));


// =========================================
// TEST COMPONENT
// =========================================

const TestComponent = () => {

  const {
    isAuthenticated,
    user,
    login,
    logout,
  } = useAuth();


  return (
    <div>

      <div data-testid="authenticated">
        {String(isAuthenticated)}
      </div>

      <div data-testid="email">
        {user?.email || "no-user"}
      </div>

      <div data-testid="role">
        {user?.role || "no-role"}
      </div>

      <button
        onClick={() =>
          login(
            "test@novawavex.com",
            "Password123"
          )
        }
      >
        Login
      </button>

      <button
        onClick={logout}
      >
        Logout
      </button>

    </div>
  );
};


// =========================================
// TESTS
// =========================================

describe("AuthContext", () => {

  beforeEach(() => {

    vi.clearAllMocks();

    localStorage.clear();

  });


  // =======================================
  // TEST 1
  // INITIAL UNAUTHENTICATED STATE
  // =======================================

  it(
    "should start unauthenticated when no token exists",
    () => {

      authService.isAuthenticated.mockReturnValue(
        false
      );


      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );


      expect(
        screen.getByTestId("authenticated")
      ).toHaveTextContent("false");


      expect(
        screen.getByTestId("email")
      ).toHaveTextContent("no-user");


      expect(
        screen.getByTestId("role")
      ).toHaveTextContent("no-role");

    }
  );


  // =======================================
  // TEST 2
  // INITIAL AUTHENTICATED STATE
  // =======================================

  it(
    "should restore authenticated state from token",
    () => {

      const payload = {
        email: "test@novawavex.com",
        role: "USER",
        id: 1,
        fullName: "Test User",
      };


      const encodedPayload = btoa(
        JSON.stringify(payload)
      );


      const token =
        `header.${encodedPayload}.signature`;


      localStorage.setItem(
        "token",
        token
      );


      authService.isAuthenticated.mockReturnValue(
        true
      );


      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );


      expect(
        screen.getByTestId("authenticated")
      ).toHaveTextContent("true");


      expect(
        screen.getByTestId("email")
      ).toHaveTextContent(
        "test@novawavex.com"
      );


      expect(
        screen.getByTestId("role")
      ).toHaveTextContent(
        "USER"
      );

    }
  );


  // =======================================
  // TEST 3
  // LOGIN
  // =======================================

  it(
    "should login and update authentication state",
    async () => {

      authService.isAuthenticated.mockReturnValue(
        false
      );


      authService.login.mockImplementation(
        async () => {

          const payload = {
            email: "test@novawavex.com",
            role: "USER",
            id: 1,
            fullName: "Test User",
          };


          const encodedPayload = btoa(
            JSON.stringify(payload)
          );


          localStorage.setItem(
            "token",
            `header.${encodedPayload}.signature`
          );

        }
      );


      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );


      expect(
        screen.getByTestId("authenticated")
      ).toHaveTextContent("false");


      await act(
        async () => {

          screen
            .getByText("Login")
            .click();

        }
      );


      expect(
        authService.login
      ).toHaveBeenCalledWith(
        "test@novawavex.com",
        "Password123"
      );


      expect(
        screen.getByTestId("authenticated")
      ).toHaveTextContent("true");


      expect(
        screen.getByTestId("email")
      ).toHaveTextContent(
        "test@novawavex.com"
      );


      expect(
        screen.getByTestId("role")
      ).toHaveTextContent(
        "USER"
      );

    }
  );


  // =======================================
  // TEST 4
  // LOGOUT
  // =======================================

  it(
    "should logout and clear authentication state",
    () => {

      authService.isAuthenticated.mockReturnValue(
        true
      );


      const payload = {
        email: "test@novawavex.com",
        role: "USER",
      };


      const encodedPayload = btoa(
        JSON.stringify(payload)
      );


      localStorage.setItem(
        "token",
        `header.${encodedPayload}.signature`
      );


      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );


      expect(
        screen.getByTestId("authenticated")
      ).toHaveTextContent("true");


      act(() => {

        screen
          .getByText("Logout")
          .click();

      });


      expect(
        authService.logout
      ).toHaveBeenCalledTimes(1);


      expect(
        screen.getByTestId("authenticated")
      ).toHaveTextContent("false");


      expect(
        screen.getByTestId("email")
      ).toHaveTextContent(
        "no-user"
      );

    }
  );

});