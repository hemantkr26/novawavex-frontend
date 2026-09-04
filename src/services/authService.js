import axios from "axios";
import api from "./api";


/*
 * =========================================
 * PUBLIC AUTH API
 * =========================================
 *
 * Used for authentication endpoints that
 * must NOT depend on an existing JWT.
 *
 * This is intentionally separate from the
 * protected "api" instance.
 *
 * This prevents an expired/invalid JWT stored
 * in localStorage from interfering with:
 *
 * - Login
 * - Registration
 * - Forgot Password
 * - Reset Password
 * =========================================
 */

const publicAuthApi = axios.create({

  baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

});


/*
 * =========================================
 * LOGIN
 * =========================================
 */

const login = async (
  email,
  password
) => {

  const response =
    await publicAuthApi.post(
      "/api/auth/login",
      {
        email,
        password,
      }
    );

  const {
    token,
    tokenType,
  } = response.data;


  /*
   * Save JWT only after successful login.
   */

  localStorage.setItem(
    "token",
    token
  );

  localStorage.setItem(
    "tokenType",
    tokenType
  );


  return response.data;
};


/*
 * =========================================
 * REGISTER
 * =========================================
 *
 * IMPORTANT:
 *
 * Registration is a public endpoint.
 *
 * It must NOT send an existing JWT.
 * =========================================
 */

const register = async (
  registrationData
) => {

  const response =
    await publicAuthApi.post(
      "/api/auth/register",
      registrationData
    );

  return response.data;
};


/*
 * =========================================
 * FORGOT PASSWORD
 * =========================================
 *
 * Public endpoint.
 *
 * No JWT is required.
 * =========================================
 */

const forgotPassword = async (
  email
) => {

  const response =
    await publicAuthApi.post(
      "/api/auth/forgot-password",
      {
        email,
      }
    );

  return response.data;
};


/*
 * =========================================
 * RESET PASSWORD
 * =========================================
 *
 * Public endpoint.
 *
 * The reset token itself is sent in the
 * request body.
 *
 * No login JWT is required.
 * =========================================
 */

const resetPassword = async (
  resetToken,
  newPassword,
  confirmPassword
) => {

  const response =
    await publicAuthApi.post(
      "/api/auth/reset-password",
      {
        resetToken,
        newPassword,
        confirmPassword,
      }
    );

  return response.data;
};


/*
 * =========================================
 * CHANGE PASSWORD
 * =========================================
 *
 * This endpoint requires authentication.
 *
 * Therefore it intentionally uses the
 * protected "api" instance.
 *
 * The existing JWT interceptor will attach
 * the Authorization header automatically.
 * =========================================
 */

const changePassword = async (
  currentPassword,
  newPassword,
  confirmPassword
) => {

  const response =
    await api.post(
      "/api/auth/change-password",
      {
        currentPassword,
        newPassword,
        confirmPassword,
      }
    );

  return response.data;
};


/*
 * =========================================
 * LOGOUT
 * =========================================
 */

const logout = () => {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "tokenType"
  );
};


/*
 * =========================================
 * AUTHENTICATION CHECK
 * =========================================
 */

const isAuthenticated = () => {

  return !!localStorage.getItem(
    "token"
  );
};


/*
 * =========================================
 * AUTH SERVICE
 * =========================================
 */

const authService = {

  login,

  register,

  forgotPassword,

  resetPassword,

  changePassword,

  logout,

  isAuthenticated,

};


export default authService;