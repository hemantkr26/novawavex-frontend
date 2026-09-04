import React, {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Monitor,
  Minimize2,
  ChevronDown,
  ShieldCheck,
  User,
  KeyRound,
  Clock3,
  Database,
  Bell,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";


const Settings = () => {

  const {
    isAuthenticated,
    user,
    notificationsEnabled,
    updateNotificationsEnabled,
    interfaceMode,
    updateInterfaceMode,
  } = useAuth();


  /*
   * =========================================
   * INTERFACE
   * =========================================
   */

  const currentInterfaceMode =
    interfaceMode || "default";


  /*
   * =========================================
   * JWT INFORMATION
   * =========================================
   */

  const [jwtInfo, setJwtInfo] = useState({
    exists: false,
    expiry: null,
    expired: false,
  });


  /*
   * =========================================
   * EXPANDED ROW
   * =========================================
   */

  const [expandedRow, setExpandedRow] =
    useState(null);


  /*
   * =========================================
   * CHANGE PASSWORD FORM
   * =========================================
   */

  const [changePasswordData, setChangePasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });


  /*
   * =========================================
   * CHANGE PASSWORD UI STATE
   * =========================================
   */

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    changePasswordLoading,
    setChangePasswordLoading,
  ] = useState(false);

  const [
    changePasswordError,
    setChangePasswordError,
  ] = useState("");

  const [
    changePasswordSuccess,
    setChangePasswordSuccess,
  ] = useState("");


  /*
   * =========================================
   * READ EXISTING JWT
   * =========================================
   */

  useEffect(() => {

    const readJwt = () => {

      const token =
        localStorage.getItem("token");


      if (!token) {

        setJwtInfo({
          exists: false,
          expiry: null,
          expired: false,
        });

        return;
      }


      try {

        const payload =
          token.split(".")[1];


        if (!payload) {
          throw new Error("Invalid JWT payload");
        }


        const decodedPayload =
          JSON.parse(
            atob(
              payload
                .replace(/-/g, "+")
                .replace(/_/g, "/")
            )
          );


        const expiry =
          decodedPayload.exp
            ? new Date(
                decodedPayload.exp * 1000
              )
            : null;


        setJwtInfo({
          exists: true,
          expiry,
          expired:
            expiry
              ? expiry.getTime() <= Date.now()
              : false,
        });

      } catch (error) {

        console.error(
          "Failed to read JWT information:",
          error
        );


        setJwtInfo({
          exists: false,
          expiry: null,
          expired: false,
        });

      }

    };


    readJwt();

  }, [isAuthenticated]);


  /*
   * =========================================
   * NOTIFICATIONS
   * =========================================
   */

  const handleNotificationToggle = () => {

    updateNotificationsEnabled(
      !notificationsEnabled
    );

  };


  /*
   * =========================================
   * INTERFACE
   * =========================================
   */

  const handleInterfaceToggle = () => {

    updateInterfaceMode(
      currentInterfaceMode === "default"
        ? "compact"
        : "default"
    );

  };


  const isDefaultInterface =
    currentInterfaceMode === "default";


  /*
   * =========================================
   * SESSION STATUS
   * =========================================
   */

  const authenticationStatus =
    isAuthenticated
      ? "Active"
      : "Inactive";


  const sessionType =
    isAuthenticated && jwtInfo.exists
      ? "JWT"
      : "None";


  const jwtStatus =
    isAuthenticated && jwtInfo.exists
      ? "Active"
      : "Inactive";


  const sessionSecurity =
    isAuthenticated && jwtInfo.exists
      ? "Secure"
      : "Inactive";


  /*
   * =========================================
   * JWT EXPIRY
   * =========================================
   */

  const formattedExpiry =
    jwtInfo.expiry
      ? jwtInfo.expiry.toLocaleString()
      : "Not available";


  /*
   * =========================================
   * TOGGLE ROW
   * =========================================
   */

  const toggleRow = (row) => {

    setExpandedRow(
      previousRow =>
        previousRow === row
          ? null
          : row
    );

  };


  /*
   * =========================================
   * STATUS CLASS
   * =========================================
   */

  const getStatusClass = (active) => {

    return active
      ? "settings-status"
      : "settings-status settings-status-inactive";

  };


  /*
   * =========================================
   * APPLICATION PREFERENCE STATUS
   * =========================================
   */

  const notificationStatus =
    notificationsEnabled
      ? "Enabled"
      : "Disabled";


  const interfaceStatus =
    isDefaultInterface
      ? "Default"
      : "Compact";


  /*
   * =========================================
   * CHANGE PASSWORD INPUT
   * =========================================
   */

  const handleChangePasswordInput = (event) => {

    const {
      name,
      value,
    } = event.target;


    setChangePasswordData(
      previous => ({
        ...previous,
        [name]: value,
      })
    );


    setChangePasswordError("");
    setChangePasswordSuccess("");

  };


  /*
   * =========================================
   * CHANGE PASSWORD VALIDATION
   * =========================================
   */

  const validateChangePassword = () => {

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = changePasswordData;


    if (!currentPassword) {

      return "Please enter your current password.";

    }


    if (!newPassword) {

      return "Please enter a new password.";

    }


    if (newPassword.length < 8) {

      return "New password must contain at least 8 characters.";

    }


    if (!confirmPassword) {

      return "Please confirm your new password.";

    }


    if (newPassword !== confirmPassword) {

      return "New passwords do not match.";

    }


    if (currentPassword === newPassword) {

      return "New password must be different from your current password.";

    }


    return "";

  };


  /*
   * =========================================
   * CHANGE PASSWORD SUBMIT
   * =========================================
   */

  const handleChangePasswordSubmit = async (
    event
  ) => {

    event.preventDefault();


    setChangePasswordError("");
    setChangePasswordSuccess("");


    const validationError =
      validateChangePassword();


    if (validationError) {

      setChangePasswordError(
        validationError
      );

      return;

    }


    setChangePasswordLoading(true);


    try {

      const response =
        await authService.changePassword(
          changePasswordData.currentPassword,
          changePasswordData.newPassword,
          changePasswordData.confirmPassword
        );


      setChangePasswordSuccess(
        response?.message ||
          "Password changed successfully."
      );


      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });


      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

    } catch (error) {

      console.error(
        "Change password failed:",
        error
      );


      const backendMessage =
        error.response?.data?.message;


      if (error.response?.status === 400) {

        setChangePasswordError(
          backendMessage ||
            "Please check your password details and try again."
        );

      } else if (
        error.response?.status === 401
      ) {

        setChangePasswordError(
          backendMessage ||
            "Your current password is incorrect or your session is no longer valid."
        );

      } else {

        setChangePasswordError(
          backendMessage ||
            "Unable to change your password. Please try again."
        );

      }

    } finally {

      setChangePasswordLoading(false);

    }

  };


  return (

    <div
      className={
        currentInterfaceMode === "compact"
          ? "settings-page settings-page-compact"
          : "settings-page"
      }
    >

      {/* =====================================
          HEADER
          ===================================== */}

      <div className="settings-page-header">

        <span className="settings-eyebrow">
          CONFIGURATION
        </span>

        <h1>
          Settings
        </h1>

        <p>
          Manage your NovaWavex application
          preferences and security settings.
        </p>

      </div>


      {/* =====================================
          APPLICATION PREFERENCES
          ===================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <h2>
            Application Preferences
          </h2>

          <p>
            Configure how NovaWavex behaves
            for your account.
          </p>

        </div>


        {/* =====================================
            NOTIFICATIONS
            ===================================== */}

        <button
          type="button"
          className={
            expandedRow === "notifications"
              ? "settings-info-row settings-info-row-open"
              : "settings-info-row"
          }
          onClick={() =>
            toggleRow("notifications")
          }
        >

          <div className="settings-info-left">

            <div className="settings-info-icon">

              <Bell size={17} />

            </div>


            <div className="settings-info-text">

              <strong>
                Notifications
              </strong>

              <span>
                Manage application notification
                preferences.
              </span>

            </div>

          </div>


          <div className="settings-row-right">

            <span
              className={
                getStatusClass(
                  notificationsEnabled
                )
              }
            >
              {notificationStatus}
            </span>


            <ChevronDown
              size={17}
              className={
                expandedRow === "notifications"
                  ? "settings-chevron settings-chevron-open"
                  : "settings-chevron"
              }
            />

          </div>

        </button>


        {expandedRow === "notifications" && (

          <div className="settings-details">

            <div className="settings-detail-line">

              <Bell size={15} />

              <span>
                Notification Status
              </span>

              <strong>
                {notificationsEnabled
                  ? "Enabled"
                  : "Disabled"}
              </strong>

            </div>


            <div className="settings-detail-action">

              <button
                type="button"
                className={
                  notificationsEnabled
                    ? "settings-action-button settings-action-button-active"
                    : "settings-action-button"
                }
                onClick={
                  handleNotificationToggle
                }
              >

                <span className="settings-action-toggle">

                  <span
                    className={
                      notificationsEnabled
                        ? "settings-action-toggle-thumb settings-action-toggle-thumb-active"
                        : "settings-action-toggle-thumb"
                    }
                  >
                    {notificationsEnabled && (
                      <Check size={11} />
                    )}
                  </span>

                </span>


                <span>
                  {notificationsEnabled
                    ? "Disable Notifications"
                    : "Enable Notifications"}
                </span>

              </button>

            </div>

          </div>

        )}


        {/* =====================================
            INTERFACE
            ===================================== */}

        <button
          type="button"
          className={
            expandedRow === "interface"
              ? "settings-info-row settings-info-row-open"
              : "settings-info-row"
          }
          onClick={() =>
            toggleRow("interface")
          }
        >

          <div className="settings-info-left">

            <div className="settings-info-icon">

              {isDefaultInterface ? (
                <Monitor size={17} />
              ) : (
                <Minimize2 size={17} />
              )}

            </div>


            <div className="settings-info-text">

              <strong>
                Interface
              </strong>

              <span>
                Choose how compact the NovaWavex
                interface should be.
              </span>

            </div>

          </div>


          <div className="settings-row-right">

            <span
              className={
                getStatusClass(true)
              }
            >
              {interfaceStatus}
            </span>


            <ChevronDown
              size={17}
              className={
                expandedRow === "interface"
                  ? "settings-chevron settings-chevron-open"
                  : "settings-chevron"
              }
            />

          </div>

        </button>


        {expandedRow === "interface" && (

          <div className="settings-details">

            <div className="settings-detail-line">

              {isDefaultInterface ? (
                <Monitor size={15} />
              ) : (
                <Minimize2 size={15} />
              )}

              <span>
                Interface Mode
              </span>

              <strong>
                {isDefaultInterface
                  ? "Default"
                  : "Compact"}
              </strong>

            </div>


            <div className="settings-detail-line">

              <Monitor size={15} />

              <span>
                Current Layout
              </span>

              <strong>
                NovaWavex Command Center
              </strong>

            </div>


            <div className="settings-detail-action">

              <button
                type="button"
                className="settings-action-button"
                onClick={
                  handleInterfaceToggle
                }
              >

                {isDefaultInterface ? (
                  <Minimize2 size={14} />
                ) : (
                  <Monitor size={14} />
                )}

                <span>
                  {isDefaultInterface
                    ? "Switch to Compact"
                    : "Switch to Default"}
                </span>

              </button>

            </div>

          </div>

        )}

      </div>


      {/* =====================================
          SESSION INFORMATION
          ===================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <h2>
            Session Information
          </h2>

          <p>
            Information about your current
            authentication session.
          </p>

        </div>


        {/* AUTHENTICATION */}

        <button
          type="button"
          className={
            expandedRow === "authentication"
              ? "settings-info-row settings-info-row-open"
              : "settings-info-row"
          }
          onClick={() =>
            toggleRow("authentication")
          }
        >

          <div className="settings-info-left">

            <div className="settings-info-icon">

              <ShieldCheck size={17} />

            </div>


            <div className="settings-info-text">

              <strong>
                Authentication
              </strong>

              <span>
                JSON Web Token authentication
              </span>

            </div>

          </div>


          <div className="settings-row-right">

            <span
              className={
                getStatusClass(
                  isAuthenticated
                )
              }
            >
              {authenticationStatus}
            </span>


            <ChevronDown
              size={17}
              className={
                expandedRow === "authentication"
                  ? "settings-chevron settings-chevron-open"
                  : "settings-chevron"
              }
            />

          </div>

        </button>


        {expandedRow === "authentication" && (

          <div className="settings-details">

            <div className="settings-detail-line">

              <User size={15} />

              <span>
                Current User
              </span>

              <strong>
                {user?.email || "Unknown"}
              </strong>

            </div>


            <div className="settings-detail-line">

              <ShieldCheck size={15} />

              <span>
                Authentication State
              </span>

              <strong>
                {isAuthenticated
                  ? "Authenticated"
                  : "Not authenticated"}
              </strong>

            </div>

          </div>

        )}


        {/* SESSION TYPE */}

        <button
          type="button"
          className={
            expandedRow === "session"
              ? "settings-info-row settings-info-row-open"
              : "settings-info-row"
          }
          onClick={() =>
            toggleRow("session")
          }
        >

          <div className="settings-info-left">

            <div className="settings-info-icon">

              <KeyRound size={17} />

            </div>


            <div className="settings-info-text">

              <strong>
                Session Type
              </strong>

              <span>
                Stateless authentication session
              </span>

            </div>

          </div>


          <div className="settings-row-right">

            <span
              className={
                getStatusClass(
                  sessionType === "JWT"
                )
              }
            >
              {sessionType}
            </span>


            <ChevronDown
              size={17}
              className={
                expandedRow === "session"
                  ? "settings-chevron settings-chevron-open"
                  : "settings-chevron"
              }
            />

          </div>

        </button>


        {expandedRow === "session" && (

          <div className="settings-details">

            <div className="settings-detail-line">

              <KeyRound size={15} />

              <span>
                Authentication Method
              </span>

              <strong>
                JSON Web Token
              </strong>

            </div>


            <div className="settings-detail-line">

              <Database size={15} />

              <span>
                Session Model
              </span>

              <strong>
                Stateless
              </strong>

            </div>

          </div>

        )}

      </div>


      {/* =====================================
          SECURITY
          ===================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <h2>
            Security
          </h2>

          <p>
            Security-related information
            for your account.
          </p>

        </div>


        {/* =====================================
            CHANGE PASSWORD
            ===================================== */}

        <button
          type="button"
          className={
            expandedRow === "change-password"
              ? "settings-info-row settings-info-row-open"
              : "settings-info-row"
          }
          onClick={() =>
            toggleRow("change-password")
          }
        >

          <div className="settings-info-left">

            <div className="settings-info-icon">

              <LockKeyhole size={17} />

            </div>


            <div className="settings-info-text">

              <strong>
                Change Password
              </strong>

              <span>
                Update your account password
                securely.
              </span>

            </div>

          </div>


          <div className="settings-row-right">

            <span
              className={
                getStatusClass(true)
              }
            >
              Available
            </span>


            <ChevronDown
              size={17}
              className={
                expandedRow === "change-password"
                  ? "settings-chevron settings-chevron-open"
                  : "settings-chevron"
              }
            />

          </div>

        </button>


        {expandedRow === "change-password" && (

          <div className="settings-details settings-change-password-details">

            <form
              className="settings-change-password-form"
              onSubmit={
                handleChangePasswordSubmit
              }
            >

              {/* CURRENT PASSWORD */}

              <div className="settings-password-field">

                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <div className="settings-password-input-wrapper">

                  <LockKeyhole
                    size={15}
                    className="settings-password-input-icon"
                  />

                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      changePasswordData.currentPassword
                    }
                    onChange={
                      handleChangePasswordInput
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    disabled={
                      changePasswordLoading
                    }
                    required
                  />

                  <button
                    type="button"
                    className="settings-password-visibility"
                    onClick={() =>
                      setShowCurrentPassword(
                        previous =>
                          !previous
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    disabled={
                      changePasswordLoading
                    }
                  >

                    {showCurrentPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}

                  </button>

                </div>

              </div>


              {/* NEW PASSWORD */}

              <div className="settings-password-field">

                <label htmlFor="newPassword">
                  New Password
                </label>

                <div className="settings-password-input-wrapper">

                  <LockKeyhole
                    size={15}
                    className="settings-password-input-icon"
                  />

                  <input
                    id="newPassword"
                    name="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      changePasswordData.newPassword
                    }
                    onChange={
                      handleChangePasswordInput
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={
                      changePasswordLoading
                    }
                    required
                  />

                  <button
                    type="button"
                    className="settings-password-visibility"
                    onClick={() =>
                      setShowNewPassword(
                        previous =>
                          !previous
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    disabled={
                      changePasswordLoading
                    }
                  >

                    {showNewPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}

                  </button>

                </div>

                <span className="settings-password-help">
                  Minimum 8 characters.
                </span>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="settings-password-field">

                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div className="settings-password-input-wrapper">

                  <LockKeyhole
                    size={15}
                    className="settings-password-input-icon"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      changePasswordData.confirmPassword
                    }
                    onChange={
                      handleChangePasswordInput
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={
                      changePasswordLoading
                    }
                    required
                  />

                  <button
                    type="button"
                    className="settings-password-visibility"
                    onClick={() =>
                      setShowConfirmPassword(
                        previous =>
                          !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    disabled={
                      changePasswordLoading
                    }
                  >

                    {showConfirmPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}

                  </button>

                </div>

              </div>


              {/* ERROR */}

              {changePasswordError && (

                <div
                  className="settings-change-password-error"
                  role="alert"
                >

                  <span>
                    {changePasswordError}
                  </span>

                </div>

              )}


              {/* SUCCESS */}

              {changePasswordSuccess && (

                <div
                  className="settings-change-password-success"
                  role="status"
                >

                  <Check size={15} />

                  <span>
                    {changePasswordSuccess}
                  </span>

                </div>

              )}


              {/* ACTION */}

              <div className="settings-change-password-action">

                <button
                  type="submit"
                  className="settings-action-button settings-change-password-button"
                  disabled={
                    changePasswordLoading
                  }
                >

                  <LockKeyhole size={14} />

                  <span>
                    {changePasswordLoading
                      ? "Changing Password..."
                      : "Change Password"}
                  </span>

                </button>

              </div>

            </form>

          </div>

        )}


        {/* =====================================
            JWT AUTHENTICATION
            ===================================== */}

        <button
          type="button"
          className={
            expandedRow === "jwt"
              ? "settings-info-row settings-info-row-open"
              : "settings-info-row"
          }
          onClick={() =>
            toggleRow("jwt")
          }
        >

          <div className="settings-info-left">

            <div className="settings-info-icon">

              <KeyRound size={17} />

            </div>


            <div className="settings-info-text">

              <strong>
                JWT Authentication
              </strong>

              <span>
                Your requests are authenticated
                using JWT.
              </span>

            </div>

          </div>


          <div className="settings-row-right">

            <span
              className={
                getStatusClass(
                  jwtStatus === "Active"
                )
              }
            >
              {jwtStatus}
            </span>


            <ChevronDown
              size={17}
              className={
                expandedRow === "jwt"
                  ? "settings-chevron settings-chevron-open"
                  : "settings-chevron"
              }
            />

          </div>

        </button>


        {expandedRow === "jwt" && (

          <div className="settings-details">

            <div className="settings-detail-line">

              <KeyRound size={15} />

              <span>
                Token Status
              </span>

              <strong>
                {jwtInfo.exists
                  ? "Token Present"
                  : "Token Not Found"}
              </strong>

            </div>


            <div className="settings-detail-line">

              <Clock3 size={15} />

              <span>
                Token Expiry
              </span>

              <strong>
                {formattedExpiry}
              </strong>

            </div>


            <div
              className={
                jwtInfo.expired
                  ? "settings-detail-warning"
                  : "settings-detail-success"
              }
            >

              {jwtInfo.expired
                ? "The JWT payload indicates that this token has expired."
                : jwtInfo.exists
                  ? "JWT token is currently present in local storage."
                  : "No JWT token is currently available."}

            </div>

          </div>

        )}


        {/* =====================================
            SESSION SECURITY
            ===================================== */}

        <button
          type="button"
          className={
            expandedRow === "security"
              ? "settings-info-row settings-info-row-open"
              : "settings-info-row"
          }
          onClick={() =>
            toggleRow("security")
          }
        >

          <div className="settings-info-left">

            <div className="settings-info-icon">

              <ShieldCheck size={17} />

            </div>


            <div className="settings-info-text">

              <strong>
                Session Security
              </strong>

              <span>
                Application sessions use
                stateless authentication.
              </span>

            </div>

          </div>


          <div className="settings-row-right">

            <span
              className={
                getStatusClass(
                  sessionSecurity === "Secure"
                )
              }
            >
              {sessionSecurity}
            </span>


            <ChevronDown
              size={17}
              className={
                expandedRow === "security"
                  ? "settings-chevron settings-chevron-open"
                  : "settings-chevron"
              }
            />

          </div>

        </button>


        {expandedRow === "security" && (

          <div className="settings-details">

            <div className="settings-detail-line">

              <ShieldCheck size={15} />

              <span>
                Authentication
              </span>

              <strong>
                {isAuthenticated
                  ? "Authenticated"
                  : "Not authenticated"}
              </strong>

            </div>


            <div className="settings-detail-line">

              <Database size={15} />

              <span>
                Token Storage
              </span>

              <strong>
                Local Storage
              </strong>

            </div>


            <div className="settings-detail-line">

              <ShieldCheck size={15} />

              <span>
                Session Model
              </span>

              <strong>
                Stateless JWT
              </strong>

            </div>

          </div>

        )}

      </div>


      {/* =====================================
          SETTINGS STYLES
          ===================================== */}

      <style>{`

        /* =========================================
           CARD SPACING
           ========================================= */

        .settings-card {
          margin-bottom: 16px;
        }


        .settings-card:last-child {
          margin-bottom: 0;
        }


        /* =========================================
           INFORMATION ROW
           ========================================= */

        .settings-info-row {
          width: 100%;

          min-height: 64px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding: 10px 16px;

          margin: 0;

          border: 0;
          border-bottom: 1px solid #edf0f5;

          background: transparent;

          cursor: pointer;

          text-align: left;

          color: #172033;

          box-sizing: border-box;

          transition:
            background 0.18s ease;
        }


        .settings-info-row:last-of-type {
          border-bottom: 0;
        }


        .settings-info-row:hover {
          background: #f8faff;

          border-radius: 8px;
        }


        .settings-info-row-open {
          background: #f8faff;

          border-radius: 8px 8px 0 0;
        }


        /* =========================================
           INFORMATION LEFT
           ========================================= */

        .settings-info-left {
          min-width: 0;

          flex: 1;

          display: flex;
          align-items: center;

          gap: 13px;
        }


        .settings-info-icon {
          width: 34px;
          height: 34px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #4f7df3;

          background: #eef4ff;
        }


        .settings-info-text {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 3px;
        }


        .settings-info-text strong {
          color: #172033 !important;

          font-size: 13px;

          font-weight: 700;

          line-height: 1.25;
        }


        .settings-info-text span {
          color: #68758a !important;

          font-size: 11px;

          line-height: 1.4;
        }


        /* =========================================
           RIGHT SIDE
           ========================================= */

        .settings-row-right {
          flex-shrink: 0;

          display: flex;
          align-items: center;

          gap: 10px;
        }


        .settings-chevron {
          width: 17px;
          height: 17px;

          flex-shrink: 0;

          color: #7c8799;

          transition:
            transform 0.2s ease,
            color 0.2s ease;
        }


        .settings-chevron-open {
          transform: rotate(180deg);

          color: #4f7df3;
        }


        /* =========================================
           STATUS
           ========================================= */

        .settings-status {
          flex-shrink: 0;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-height: 26px;

          padding: 0 9px;

          border-radius: 7px;

          color: #15965a !important;

          background: #eaf9f1;

          font-size: 10px;

          font-weight: 750;

          line-height: 1;
        }


        .settings-status-inactive {
          color: #d34c4c !important;

          background: #fff0f0;
        }


        /* =========================================
           EXPANDED DETAILS
           ========================================= */

        .settings-details {
          margin: 0 16px 6px;

          padding: 6px 12px;

          border: 1px solid #e7ebf2;

          border-radius: 0 0 8px 8px;

          background: #fafbfd;

          box-sizing: border-box;

          animation:
            settings-details-enter
            0.18s ease both;
        }


        @keyframes settings-details-enter {

          from {
            opacity: 0;
            transform: translateY(-3px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }


        /* =========================================
           DETAIL LINE
           ========================================= */

        .settings-detail-line {
          min-height: 34px;

          display: flex;
          align-items: center;

          gap: 9px;

          color: #718096;

          font-size: 11px;

          border-bottom:
            1px solid #edf0f5;
        }


        .settings-detail-line:last-child {
          border-bottom: 0;
        }


        .settings-detail-line svg {
          flex-shrink: 0;

          color: #6489ed;
        }


        .settings-detail-line span {
          flex: 1;

          color: #68758a !important;
        }


        .settings-detail-line strong {
          color: #25324a !important;

          font-size: 11px;

          font-weight: 650;

          text-align: right;
        }


        /* =========================================
           ACTION
           ========================================= */

        .settings-detail-action {
          display: flex;

          justify-content: flex-end;

          padding-top: 7px;

          padding-bottom: 3px;
        }


        .settings-action-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          min-height: 32px;

          padding: 0 11px;

          border:
            1px solid #dce5f5;

          border-radius: 7px;

          color: #4f7df3;

          background: #f4f7fd;

          cursor: pointer;

          font-size: 10px;

          font-weight: 750;

          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.15s ease;
        }


        .settings-action-button:hover {
          background: #edf3ff;

          border-color: #cbd9f5;

          transform: translateY(-1px);
        }


        .settings-action-button-active {
          color: #15965a;

          background: #edf9f3;

          border-color: #d2efdf;
        }


        .settings-action-button-active:hover {
          background: #e7f7ee;

          border-color: #bfe5cf;
        }


        /* =========================================
           ACTION TOGGLE
           ========================================= */

        .settings-action-toggle {
          position: relative;

          display: flex;
          align-items: center;

          width: 32px;
          height: 18px;

          padding: 2px;

          box-sizing: border-box;

          border-radius: 999px;

          background: #d9dee7;
        }


        .settings-action-button-active
        .settings-action-toggle {
          background: #b9ebd0;
        }


        .settings-action-toggle-thumb {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 14px;
          height: 14px;

          border-radius: 50%;

          color: white;

          background: #7b8799;

          box-shadow:
            0 2px 4px
            rgba(0, 0, 0, 0.14);

          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }


        .settings-action-button-active
        .settings-action-toggle-thumb-active {
          background: #27b86b;

          transform:
            translateX(14px);
        }


        /* =========================================
           CHANGE PASSWORD
           ========================================= */

        .settings-change-password-details {
          padding:
            12px;
        }


        .settings-change-password-form {
          display: flex;

          flex-direction: column;

          gap: 13px;
        }


        .settings-password-field {
          display: flex;

          flex-direction: column;

          gap: 6px;
        }


        .settings-password-field label {
          color: #344054;

          font-size: 10px;

          font-weight: 700;
        }


        .settings-password-input-wrapper {
          position: relative;

          display: flex;

          align-items: center;
        }


        .settings-password-input-wrapper input {
          width: 100%;

          min-height: 40px;

          box-sizing: border-box;

          padding:
            0 39px 0 37px;

          border:
            1px solid #dce2eb;

          border-radius: 8px;

          outline: none;

          color: #172033;

          background: white;

          font-size: 11px;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }


        .settings-password-input-wrapper input::placeholder {
          color: #a2acbb;
        }


        .settings-password-input-wrapper input:focus {
          border-color: #7e9fee;

          box-shadow:
            0 0 0 3px
            rgba(79, 125, 243, 0.10);
        }


        .settings-password-input-wrapper input:disabled {
          background: #f5f7fa;

          cursor: not-allowed;
        }


        .settings-password-input-icon {
          position: absolute;

          left: 12px;

          color: #8a96a8;

          pointer-events: none;
        }


        .settings-password-visibility {
          position: absolute;

          right: 6px;

          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;

          border-radius: 6px;

          color: #7c8798;

          background: transparent;

          cursor: pointer;
        }


        .settings-password-visibility:hover {
          color: #4f7df3;

          background: #f2f5fb;
        }


        .settings-password-visibility:disabled {
          cursor: not-allowed;

          opacity: 0.55;
        }


        .settings-password-help {
          color: #8a96a8;

          font-size: 9px;
        }


        /* =========================================
           CHANGE PASSWORD ERROR
           ========================================= */

        .settings-change-password-error {
          display: flex;

          align-items: center;

          min-height: 34px;

          box-sizing: border-box;

          padding:
            7px 9px;

          border:
            1px solid #f1d5d5;

          border-radius: 7px;

          color: #b54747;

          background: #fff5f5;

          font-size: 10px;

          line-height: 1.4;
        }


        /* =========================================
           CHANGE PASSWORD SUCCESS
           ========================================= */

        .settings-change-password-success {
          display: flex;

          align-items: center;

          gap: 7px;

          min-height: 34px;

          box-sizing: border-box;

          padding:
            7px 9px;

          border:
            1px solid #d5efdf;

          border-radius: 7px;

          color: #18794e;

          background: #f0faf4;

          font-size: 10px;

          line-height: 1.4;
        }


        .settings-change-password-success svg {
          flex-shrink: 0;
        }


        /* =========================================
           CHANGE PASSWORD BUTTON
           ========================================= */

        .settings-change-password-action {
          display: flex;

          justify-content: flex-end;

          padding-top: 2px;
        }


        .settings-change-password-button {
          min-height: 34px;

          color: white;

          border-color: #4f7df3;

          background:
            linear-gradient(
              135deg,
              #4f7df3,
              #648cf4
            );

          box-shadow:
            0 5px 12px
            rgba(79, 125, 243, 0.14);
        }


        .settings-change-password-button:hover:not(:disabled) {
          color: white;

          background:
            linear-gradient(
              135deg,
              #466fdb,
              #5b82e8
            );

          border-color: #466fdb;
        }


        .settings-change-password-button:disabled {
          cursor: not-allowed;

          opacity: 0.65;

          transform: none;
        }


        /* =========================================
           JWT MESSAGE
           ========================================= */

        .settings-detail-success {
          margin-top: 8px;
          margin-bottom: 3px;

          padding: 8px 10px;

          border-radius: 7px;

          color: #18794e !important;

          background: #edf9f3;

          border:
            1px solid #d6f0e1;

          font-size: 10px;

          line-height: 1.5;
        }


        .settings-detail-warning {
          margin-top: 8px;
          margin-bottom: 3px;

          padding: 8px 10px;

          border-radius: 7px;

          color: #b54747 !important;

          background: #fff2f2;

          border:
            1px solid #f5dada;

          font-size: 10px;

          line-height: 1.5;
        }


        /* =========================================
           COMPACT MODE
           ========================================= */

        .settings-page-compact
        .settings-info-row {
          min-height: 56px;
        }


        .settings-page-compact
        .settings-info-icon {
          width: 32px;
          height: 32px;
        }


        .settings-page-compact
        .settings-detail-line {
          min-height: 32px;
        }


        /* =========================================
           RESPONSIVE
           ========================================= */

        @media (max-width: 600px) {

          .settings-info-row {
            min-height: 60px;

            padding-left: 12px;
            padding-right: 12px;

            align-items: flex-start;
          }


          .settings-info-left {
            align-items: flex-start;
          }


          .settings-info-icon {
            margin-top: 1px;
          }


          .settings-row-right {
            margin-top: 2px;

            gap: 7px;
          }


          .settings-details {
            margin-left: 12px;
            margin-right: 12px;

            padding-left: 10px;
            padding-right: 10px;
          }


          .settings-detail-line {
            align-items: flex-start;

            padding: 7px 0;
          }


          .settings-detail-line strong {
            max-width: 45%;

            word-break: break-word;
          }


          .settings-change-password-details {
            padding: 10px;
          }


          .settings-change-password-action {
            justify-content: stretch;
          }


          .settings-change-password-button {
            width: 100%;
          }

        }

      `}</style>

    </div>

  );

};


export default Settings;