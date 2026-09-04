import React from "react";

import { describe, it, expect, beforeEach, vi } from "vitest";

import authService from "./authService";

import api from "./api";


vi.mock("./api", () => ({
  default: {
    post: vi.fn(),
  },
}));


describe("authService", () => {

  beforeEach(() => {

    localStorage.clear();

    vi.clearAllMocks();

  });


  // =========================================================
  // 1. LOGIN
  // =========================================================

  it("should login successfully and store token", async () => {

    api.post.mockResolvedValue({
      data: {
        token: "test-jwt-token",
        tokenType: "Bearer",
      },
    });


    const response =
      await authService.login(
        "test@novawavex.com",
        "Password123"
      );


    expect(api.post).toHaveBeenCalledWith(
      "/api/auth/login",
      {
        email: "test@novawavex.com",
        password: "Password123",
      }
    );


    expect(response).toEqual({
      token: "test-jwt-token",
      tokenType: "Bearer",
    });


    expect(
      localStorage.getItem("token")
    ).toBe("test-jwt-token");


    expect(
      localStorage.getItem("tokenType")
    ).toBe("Bearer");

  });


  // =========================================================
  // 2. LOGIN - API ERROR
  // =========================================================

  it("should throw error when login fails", async () => {

    const error = new Error(
      "Invalid credentials"
    );


    api.post.mockRejectedValue(error);


    await expect(
      authService.login(
        "wrong@novawavex.com",
        "WrongPassword"
      )
    ).rejects.toThrow(
      "Invalid credentials"
    );


    expect(
      localStorage.getItem("token")
    ).toBeNull();


    expect(
      localStorage.getItem("tokenType")
    ).toBeNull();

  });


  // =========================================================
  // 3. LOGOUT
  // =========================================================

  it("should remove token and tokenType on logout", () => {

    localStorage.setItem(
      "token",
      "test-jwt-token"
    );

    localStorage.setItem(
      "tokenType",
      "Bearer"
    );


    authService.logout();


    expect(
      localStorage.getItem("token")
    ).toBeNull();


    expect(
      localStorage.getItem("tokenType")
    ).toBeNull();

  });


  // =========================================================
  // 4. AUTHENTICATED
  // =========================================================

  it("should return true when token exists", () => {

    localStorage.setItem(
      "token",
      "test-jwt-token"
    );


    expect(
      authService.isAuthenticated()
    ).toBe(true);

  });


  // =========================================================
  // 5. NOT AUTHENTICATED
  // =========================================================

  it("should return false when token does not exist", () => {

    localStorage.removeItem("token");


    expect(
      authService.isAuthenticated()
    ).toBe(false);

  });

});