import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";
import userService from "../services/userService";

const AuthContext = createContext(null);

/*
 * =========================================
 * DECODE JWT PAYLOAD
 * =========================================
 */

const getUserFromToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(
      atob(
        payload
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    return {
      email:
        decodedPayload.email ||
        decodedPayload.sub ||
        null,

      role:
        decodedPayload.role ||
        "USER",

      id:
        decodedPayload.id ||
        null,

      fullName:
        decodedPayload.fullName ||
        null,

      profileImage:
        decodedPayload.profileImage ||
        null,
    };
  } catch (error) {
    console.error(
      "Failed to decode JWT:",
      error
    );

    return null;
  }
};

/*
 * =========================================
 * GET SAVED INTERFACE MODE
 * =========================================
 */

const getSavedInterfaceMode = () => {
  const savedMode =
    localStorage.getItem(
      "novawavex_interface_mode"
    );

  if (savedMode === "compact") {
    return "compact";
  }

  return "default";
};

/*
 * =========================================
 * AUTH PROVIDER
 * =========================================
 */

export const AuthProvider = ({
  children,
}) => {
  /*
   * =========================================
   * AUTHENTICATION STATE
   * =========================================
   */

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(
    authService.isAuthenticated()
  );

  /*
   * =========================================
   * USER STATE
   * =========================================
   *
   * Initially load basic information from
   * the JWT.
   *
   * The real profile is then loaded from
   * /api/users/me.
   * =========================================
   */

  const [
    user,
    setUser,
  ] = useState(
    getUserFromToken()
  );

  /*
   * =========================================
   * NOTIFICATION PREFERENCE
   * =========================================
   */

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(() => {
    const savedPreference =
      localStorage.getItem(
        "novawavex_notifications_enabled"
      );

    if (
      savedPreference === null
    ) {
      return true;
    }

    return savedPreference === "true";
  });

  /*
   * =========================================
   * INTERFACE PREFERENCE
   * =========================================
   */

  const [
    interfaceMode,
    setInterfaceMode,
  ] = useState(
    getSavedInterfaceMode()
  );

  /*
   * =========================================
   * LOAD CURRENT USER PROFILE
   * =========================================
   *
   * The JWT may not contain profileImage.
   *
   * Therefore the authoritative user data
   * comes from:
   *
   * GET /api/users/me
   *
   * This keeps TopNav, Profile and other
   * components synchronized with the backend.
   * =========================================
   */

  const loadCurrentUser = async () => {
    if (!authService.isAuthenticated()) {
      return;
    }

    try {
      const currentUser =
        await userService.getCurrentUser();

      if (!currentUser) {
        return;
      }

      setUser(
        (previousUser) => ({
          ...(previousUser || {}),
          ...currentUser,
        })
      );
    } catch (error) {
      console.error(
        "Failed to load current user profile:",
        error
      );
    }
  };

  /*
   * =========================================
   * LOAD PROFILE WHEN AUTHENTICATED
   * =========================================
   *
   * This runs:
   *
   * - When the application starts
   * - After login
   * - When authentication state changes
   *
   * Therefore TopNav gets the latest
   * profileImage from the backend.
   * =========================================
   */

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    loadCurrentUser();
  }, [
    isAuthenticated,
  ]);

  /*
   * =========================================
   * SAVE NOTIFICATION PREFERENCE
   * =========================================
   */

  useEffect(() => {
    localStorage.setItem(
      "novawavex_notifications_enabled",
      String(notificationsEnabled)
    );
  }, [
    notificationsEnabled,
  ]);

  /*
   * =========================================
   * SAVE + APPLY INTERFACE PREFERENCE
   * =========================================
   */

  useEffect(() => {
    /*
     * Save preference
     */

    localStorage.setItem(
      "novawavex_interface_mode",
      interfaceMode
    );

    /*
     * Remove previous interface classes
     */

    document.body.classList.remove(
      "novawavex-interface-default",
      "novawavex-interface-compact"
    );

    /*
     * Apply current interface class
     */

    document.body.classList.add(
      interfaceMode === "compact"
        ? "novawavex-interface-compact"
        : "novawavex-interface-default"
    );
  }, [
    interfaceMode,
  ]);

  /*
   * =========================================
   * LOGIN
   * =========================================
   */

  const login = async (
    email,
    password
  ) => {
    /*
     * Perform login.
     */

    await authService.login(
      email,
      password
    );

    /*
     * Mark user authenticated.
     */

    setIsAuthenticated(true);

    /*
     * Initially load JWT information.
     */

    const tokenUser =
      getUserFromToken();

    setUser(tokenUser);

    /*
     * Then immediately fetch the authoritative
     * backend profile.
     *
     * This is important because the JWT may
     * not contain profileImage.
     */

    try {
      const currentUser =
        await userService.getCurrentUser();

      if (currentUser) {
        setUser(
          (previousUser) => ({
            ...(previousUser || {}),
            ...currentUser,
          })
        );
      }
    } catch (error) {
      console.error(
        "Failed to load user profile after login:",
        error
      );
    }
  };

  /*
   * =========================================
   * UPDATE USER
   * =========================================
   *
   * Used by Profile.jsx and other components
   * after receiving updated user information
   * from the backend.
   *
   * IMPORTANT:
   *
   * The new user data is merged with the
   * existing user object.
   * =========================================
   */

  const updateUser = (
    updatedUser
  ) => {
    if (!updatedUser) {
      return;
    }

    setUser(
      (previousUser) => ({
        ...(previousUser || {}),
        ...updatedUser,
      })
    );
  };

  /*
   * =========================================
   * REFRESH CURRENT USER
   * =========================================
   *
   * Allows any component to explicitly
   * refresh the authenticated user's profile.
   * =========================================
   */

  const refreshUser = async () => {
    if (!authService.isAuthenticated()) {
      return null;
    }

    try {
      const currentUser =
        await userService.getCurrentUser();

      if (!currentUser) {
        return null;
      }

      setUser(
        (previousUser) => ({
          ...(previousUser || {}),
          ...currentUser,
        })
      );

      return currentUser;
    } catch (error) {
      console.error(
        "Failed to refresh current user:",
        error
      );

      return null;
    }
  };

  /*
   * =========================================
   * LOGOUT
   * =========================================
   */

  const logout = () => {
    authService.logout();

    setIsAuthenticated(false);

    setUser(null);
  };

  /*
   * =========================================
   * UPDATE NOTIFICATION PREFERENCE
   * =========================================
   */

  const updateNotificationsEnabled = (
    enabled
  ) => {
    setNotificationsEnabled(
      Boolean(enabled)
    );
  };

  /*
   * =========================================
   * UPDATE INTERFACE MODE
   * =========================================
   */

  const updateInterfaceMode = (
    mode
  ) => {
    if (
      mode !== "default" &&
      mode !== "compact"
    ) {
      return;
    }

    setInterfaceMode(mode);
  };

  /*
   * =========================================
   * TOGGLE INTERFACE MODE
   * =========================================
   */

  const toggleInterfaceMode = () => {
    setInterfaceMode(
      (previousMode) =>
        previousMode === "default"
          ? "compact"
          : "default"
    );
  };

  /*
   * =========================================
   * CONTEXT PROVIDER
   * =========================================
   */

  return (
    <AuthContext.Provider
      value={{
        /*
         * Authentication
         */

        isAuthenticated,

        user,

        login,

        logout,

        /*
         * Live User/Profile
         */

        updateUser,

        refreshUser,

        /*
         * Notifications
         */

        notificationsEnabled,

        updateNotificationsEnabled,

        /*
         * Interface
         */

        interfaceMode,

        updateInterfaceMode,

        toggleInterfaceMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/*
 * =========================================
 * USE AUTH
 * =========================================
 */

export const useAuth = () => {
  return useContext(
    AuthContext
  );
};