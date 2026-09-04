import React from "react";

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import api from "./api";


describe("api service", () => {

  beforeEach(() => {

    localStorage.clear();

    vi.restoreAllMocks();

  });


  afterEach(() => {

    vi.restoreAllMocks();

  });


  // =========================================================
  // 1. API BASE CONFIGURATION
  // =========================================================

  it("should use the correct backend base URL", () => {

    expect(api.defaults.baseURL)
      .toBe("http://localhost:8080");

  });


  // =========================================================
  // 2. API CONTENT TYPE
  // =========================================================

  it("should use application/json content type", () => {

    expect(
      api.defaults.headers["Content-Type"]
    ).toBe("application/json");

  });


  // =========================================================
  // 3. REQUEST INTERCEPTOR - JWT
  // =========================================================

  it("should add JWT token to Authorization header", () => {

    localStorage.setItem(
      "token",
      "test-jwt-token"
    );


    const config = {
      headers: {},
    };


    const interceptor =
      api.interceptors.request.handlers[0].fulfilled;


    const result =
      interceptor(config);


    expect(
      result.headers.Authorization
    ).toBe(
      "Bearer test-jwt-token"
    );

  });


  // =========================================================
  // 4. REQUEST INTERCEPTOR - NO JWT
  // =========================================================

  it("should not add Authorization header when token is missing", () => {

    localStorage.removeItem("token");


    const config = {
      headers: {},
    };


    const interceptor =
      api.interceptors.request.handlers[0].fulfilled;


    const result =
      interceptor(config);


    expect(
      result.headers.Authorization
    ).toBeUndefined();

  });


  // =========================================================
  // 5. REQUEST INTERCEPTOR - ERROR
  // =========================================================

  it("should reject request interceptor errors", async () => {

    const error = new Error(
      "Request interceptor error"
    );


    const interceptor =
      api.interceptors.request.handlers[0].rejected;


    await expect(
      interceptor(error)
    ).rejects.toThrow(
      "Request interceptor error"
    );

  });


  // =========================================================
  // 6. RESPONSE INTERCEPTOR - SUCCESS
  // =========================================================

  it("should return successful response unchanged", () => {

    const response = {
      status: 200,
      data: {
        message: "Success",
      },
    };


    const interceptor =
      api.interceptors.response.handlers[0].fulfilled;


    const result =
      interceptor(response);


    expect(result).toBe(response);

  });


  // =========================================================
  // 7. RESPONSE INTERCEPTOR - 401
  // =========================================================

  it("should remove authentication and redirect on 401", async () => {

    localStorage.setItem(
      "token",
      "test-jwt-token"
    );

    localStorage.setItem(
      "tokenType",
      "Bearer"
    );


    const originalLocation =
      window.location;


    const locationMock = {
      href: "",
    };


    Object.defineProperty(
      window,
      "location",
      {
        configurable: true,
        value: locationMock,
      }
    );


    const error = {
      response: {
        status: 401,
      },
    };


    const interceptor =
      api.interceptors.response.handlers[0].rejected;


    await expect(
      interceptor(error)
    ).rejects.toBe(error);


    expect(
      localStorage.getItem("token")
    ).toBeNull();


    expect(
      localStorage.getItem("tokenType")
    ).toBeNull();


    expect(
      window.location.href
    ).toBe("/login");


    Object.defineProperty(
      window,
      "location",
      {
        configurable: true,
        value: originalLocation,
      }
    );

  });


  // =========================================================
  // 8. RESPONSE INTERCEPTOR - 403
  // =========================================================

  it("should log access denied on 403 and keep authentication", async () => {

    localStorage.setItem(
      "token",
      "test-jwt-token"
    );

    localStorage.setItem(
      "tokenType",
      "Bearer"
    );


    const consoleErrorSpy =
      vi
        .spyOn(console, "error")
        .mockImplementation(() => {});


    const error = {
      response: {
        status: 403,
      },
    };


    const interceptor =
      api.interceptors.response.handlers[0].rejected;


    await expect(
      interceptor(error)
    ).rejects.toBe(error);


    expect(
      consoleErrorSpy
    ).toHaveBeenCalledWith(
      "NovaWavex: Access denied. Admin permission required."
    );


    expect(
      localStorage.getItem("token")
    ).toBe("test-jwt-token");


    expect(
      localStorage.getItem("tokenType")
    ).toBe("Bearer");

  });


  // =========================================================
  // 9. RESPONSE INTERCEPTOR - OTHER ERROR
  // =========================================================

  it("should reject other response errors without changing authentication", async () => {

    localStorage.setItem(
      "token",
      "test-jwt-token"
    );


    const error = {
      response: {
        status: 500,
      },
    };


    const interceptor =
      api.interceptors.response.handlers[0].rejected;


    await expect(
      interceptor(error)
    ).rejects.toBe(error);


    expect(
      localStorage.getItem("token")
    ).toBe("test-jwt-token");

  });

});