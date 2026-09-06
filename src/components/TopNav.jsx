import { useEffect, useRef, useState } from "react";

import {
  Search,
  Bell,
  Command,
  Activity,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Workflow as WorkflowIcon,
  CheckCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import workflowService from "../services/workflowService";
import notificationService from "../services/notificationService";

const TopNav = () => {
  const {
    logout,
    notificationsEnabled,
    user,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // =========================================
  // PROFILE STATE
  // =========================================

  const [profileOpen, setProfileOpen] = useState(false);

  // =========================================
  // SEARCH STATE
  // =========================================

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [workflows, setWorkflows] = useState([]);

  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef(null);

  // =========================================
  // NOTIFICATION STATE
  // =========================================

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [notificationError, setNotificationError] =
    useState(null);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const notificationRef = useRef(null);

  // =========================================
  // SYSTEM HEALTH STATE
  // =========================================

  const [systemStatus, setSystemStatus] =
    useState("checking");

  // =========================================
  // PROFILE DATA
  // =========================================

  const profileName =
    user?.fullName ||
    user?.name ||
    "NovaWavex User";

  const profileEmail =
    user?.email ||
    "";

  const profileImage =
    user?.profileImage ||
    user?.profileImageUrl ||
    null;

  const getInitials = (name) => {
    if (!name) {
      return "JA";
    }

    const words = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "JA";
    }

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const profileInitials =
    getInitials(profileName);

  // =========================================
  // PROFILE AVATAR
  // =========================================

  const renderProfileAvatar = (
    className
  ) => {
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt={profileName}
          className={`${className} profile-avatar-image`}
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />
      );
    }

    return (
      <div className={className}>
        {profileInitials}
      </div>
    );
  };

  // =========================================
  // CHECK BACKEND HEALTH
  // =========================================

  const checkSystemHealth = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/actuator/health`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        setSystemStatus("degraded");
        return;
      }

      const data = await response.json();

      if (
        data &&
        String(data.status).toUpperCase() ===
          "UP"
      ) {
        setSystemStatus("operational");
      } else {
        setSystemStatus("degraded");
      }
    } catch (error) {
      console.error(
        "Failed to check backend health:",
        error
      );

      setSystemStatus("offline");
    }
  };

  // =========================================
  // INITIAL + PERIODIC HEALTH CHECK
  // =========================================

  useEffect(() => {
    checkSystemHealth();

    const healthInterval =
      setInterval(() => {
        checkSystemHealth();
      }, 30000);

    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  // =========================================
  // SYSTEM STATUS DISPLAY
  // =========================================

  const getSystemStatusLabel = () => {
    if (systemStatus === "operational") {
      return "Operational";
    }

    if (systemStatus === "degraded") {
      return "Degraded";
    }

    if (systemStatus === "offline") {
      return "Offline";
    }

    return "Checking";
  };

  const getSystemStatusClass = () => {
    if (systemStatus === "operational") {
      return "system-indicator system-operational";
    }

    if (systemStatus === "degraded") {
      return "system-indicator system-degraded";
    }

    if (systemStatus === "offline") {
      return "system-indicator system-offline";
    }

    return "system-indicator system-checking";
  };

  // =========================================
  // LOAD WORKFLOWS FOR SEARCH
  // =========================================

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const loadSearchWorkflows = async () => {
      try {
        setSearchLoading(true);

        const data =
          await workflowService.getAllWorkflows();

        setWorkflows(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load workflows for search:",
          error
        );

        setWorkflows([]);
      } finally {
        setSearchLoading(false);
      }
    };

    loadSearchWorkflows();
  }, [searchOpen]);

  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  const loadNotifications = async () => {
    if (!notificationsEnabled) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationError(null);
      setNotificationLoading(false);

      return;
    }

    try {
      setNotificationError(null);

      setNotificationLoading(true);

      const data =
        await notificationService.getAllNotifications();

      const notificationList =
        Array.isArray(data)
          ? data
          : [];

      setNotifications(
        notificationList
      );

      const unread =
        notificationList.filter(
          (notification) =>
            notification.read === false
        ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);
      setUnreadCount(0);

      setNotificationError(
        "Unable to load notifications."
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // =========================================
  // INITIAL NOTIFICATION LOAD
  // =========================================

  useEffect(() => {
    if (!notificationsEnabled) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationOpen(false);
      setNotificationError(null);

      return;
    }

    loadNotifications();
  }, [notificationsEnabled]);

  // =========================================
  // CLOSE SEARCH WHEN CLICKING OUTSIDE
  // =========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setSearchOpen(false);
        setSearchTerm("");
      }
    };

    if (searchOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [searchOpen]);

  // =========================================
  // CLOSE NOTIFICATIONS WHEN CLICKING OUTSIDE
  // =========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [notificationOpen]);

  // =========================================
  // CLOSE NOTIFICATION PANEL ON NAVIGATION
  // =========================================

  useEffect(() => {
    setNotificationOpen(false);
  }, [location.pathname]);

  // =========================================
  // SEARCH RESULTS
  // =========================================

  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  const filteredWorkflows =
    normalizedSearch.length === 0
      ? []
      : workflows
          .filter((workflow) => {
            const name =
              String(
                workflow.name || ""
              ).toLowerCase();

            const description =
              String(
                workflow.description || ""
              ).toLowerCase();

            const createdBy =
              String(
                typeof workflow.createdBy ===
                "object"
                  ? workflow.createdBy?.email ||
                    workflow.createdBy?.username ||
                    workflow.createdBy?.id ||
                    ""
                  : workflow.createdBy || ""
              ).toLowerCase();

            const id =
              String(
                workflow.id || ""
              ).toLowerCase();

            return (
              name.includes(
                normalizedSearch
              ) ||
              description.includes(
                normalizedSearch
              ) ||
              createdBy.includes(
                normalizedSearch
              ) ||
              id.includes(
                normalizedSearch
              )
            );
          })
          .slice(0, 6);

  // =========================================
  // OPEN / CLOSE SEARCH
  // =========================================

  const handleSearchClick = () => {
    setSearchOpen(
      (previous) => !previous
    );

    setProfileOpen(false);

    setNotificationOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
  };

  // =========================================
  // OPEN WORKFLOW
  // =========================================

  const handleWorkflowSearchResult = (
    workflowId
  ) => {
    closeSearch();

    navigate(
      `/workflows/${workflowId}`
    );
  };

  // =========================================
  // SEARCH KEYBOARD
  // =========================================

  const handleSearchKeyDown = (
    event
  ) => {
    if (event.key === "Escape") {
      closeSearch();
    }
  };

  // =========================================
  // CLEAR SEARCH TEXT
  // =========================================

  const clearSearch = () => {
    setSearchTerm("");
  };

  // =========================================
  // NOTIFICATION TOGGLE
  // =========================================

  const handleNotificationClick = async () => {
    if (!notificationsEnabled) {
      setNotificationOpen(false);
      setNotifications([]);
      setUnreadCount(0);

      return;
    }

    const willOpen =
      !notificationOpen;

    setNotificationOpen(
      willOpen
    );

    setProfileOpen(false);

    setSearchOpen(false);

    if (willOpen) {
      await loadNotifications();
    }
  };

  // =========================================
  // NOTIFICATION ICON
  // =========================================

  const getNotificationIcon = (
    notification
  ) => {
    const type =
      String(
        notification.type || ""
      ).toUpperCase();

    const priority =
      String(
        notification.priority || ""
      ).toUpperCase();

    if (
      priority === "ERROR" ||
      type.includes("FAILED")
    ) {
      return (
        <AlertCircle size={17} />
      );
    }

    if (
      priority === "WARNING" ||
      type.includes("CANCELLED")
    ) {
      return (
        <AlertTriangle size={17} />
      );
    }

    if (
      priority === "SUCCESS" ||
      type.includes("COMPLETED") ||
      type.includes("STARTED") ||
      type.includes("CREATED")
    ) {
      return (
        <CheckCircle2 size={17} />
      );
    }

    return (
      <Info size={17} />
    );
  };

  // =========================================
  // NOTIFICATION TYPE CLASS
  // =========================================

  const getNotificationClass =
    (notification) => {
      const priority =
        String(
          notification.priority || ""
        ).toUpperCase();

      if (priority === "ERROR") {
        return "notification-icon notification-error";
      }

      if (priority === "WARNING") {
        return "notification-icon notification-warning";
      }

      if (priority === "SUCCESS") {
        return "notification-icon notification-success";
      }

      return "notification-icon notification-info";
    };

  // =========================================
  // PARSE BACKEND TIMESTAMP
  // =========================================

  const parseBackendTimestamp =
    (timestamp) => {

      if (!timestamp) {
        return null;
      }

      if (typeof timestamp !== "string") {
        const date =
          new Date(timestamp);

        return Number.isNaN(
          date.getTime()
        )
          ? null
          : date;
      }

      const normalizedTimestamp =
        timestamp.endsWith("Z") ||
        /[+-]\d{2}:\d{2}$/.test(
          timestamp
        )
          ? timestamp
          : `${timestamp}Z`;

      const date =
        new Date(
          normalizedTimestamp
        );

      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    };

  // =========================================
  // FORMAT NOTIFICATION TIME
  // =========================================

  const formatNotificationTime =
    (timestamp) => {
      if (!timestamp) {
        return "Recently";
      }

      const date =
        parseBackendTimestamp(
          timestamp
        );

      if (!date) {
        return "Recently";
      }

      const now =
        new Date();

      const difference =
        now.getTime() -
        date.getTime();

      const seconds =
        Math.floor(
          difference / 1000
        );

      const minutes =
        Math.floor(
          seconds / 60
        );

      const hours =
        Math.floor(
          minutes / 60
        );

      const days =
        Math.floor(
          hours / 24
        );

      if (seconds < 60) {
        return "Just now";
      }

      if (minutes < 60) {
        return `${minutes} ${
          minutes === 1
            ? "minute"
            : "minutes"
        } ago`;
      }

      if (hours < 24) {
        return `${hours} ${
          hours === 1
            ? "hour"
            : "hours"
        } ago`;
      }

      if (days === 1) {
        return "Yesterday";
      }

      if (days < 7) {
        return `${days} days ago`;
      }

      return date.toLocaleDateString();
    };

  // =========================================
  // OPEN NOTIFICATION
  // =========================================

  const handleNotificationOpen =
    async (notification) => {
      if (!notificationsEnabled) {
        return;
      }

      try {
        if (
          notification.read === false
        ) {
          await notificationService.markAsRead(
            notification.id
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                item.id === notification.id
                  ? {
                      ...item,
                      read: true,
                    }
                  : item
            )
        );

        if (
          notification.read === false
        ) {
          setUnreadCount(
            (previous) =>
              Math.max(
                0,
                previous - 1
              )
          );
        }

        // =========================================
        // NAVIGATE TO RELATED WORKFLOW
        // =========================================

        if (
          notification.workflowId
        ) {
          setNotificationOpen(false);

          navigate(
            `/workflows/${notification.workflowId}`
          );

          return;
        }
      } catch (error) {
        console.error(
          "Failed to open notification:",
          error
        );
      }
    };

  // =========================================
  // MARK ALL AS READ
  // =========================================

  const handleMarkAllAsRead =
    async () => {
      if (
        !notificationsEnabled ||
        unreadCount === 0
      ) {
        return;
      }

      try {
        await notificationService.markAllAsRead();

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            )
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Failed to mark all notifications as read:",
          error
        );
      }
    };

  // =========================================
  // DELETE NOTIFICATION
  // =========================================

  const handleDeleteNotification =
    async (
      event,
      notificationId
    ) => {
      event.stopPropagation();

      if (!notificationsEnabled) {
        return;
      }

      try {
        const notification =
          notifications.find(
            (item) =>
              item.id ===
              notificationId
          );

        await notificationService.deleteNotification(
          notificationId
        );

        setNotifications(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                notificationId
            )
        );

        if (
          notification &&
          notification.read === false
        ) {
          setUnreadCount(
            (previous) =>
              Math.max(
                0,
                previous - 1
              )
          );
        }
      } catch (error) {
        console.error(
          "Failed to delete notification:",
          error
        );
      }
    };

  // =========================================
  // NOTIFICATION DISPLAY LIST
  // =========================================

  const displayedNotifications =
    notifications.slice(0, 8);

  return (
    <>
      <header className="top-nav">

        {/* =========================================
            BRAND
            ========================================= */}

        <div className="brand">

          <div className="brand-symbol">
            <Command size={20} />
          </div>

          <div>

            <h2>
              NovaWavex
            </h2>

            <span>
              Workflow Intelligence
            </span>

          </div>

        </div>


        {/* =========================================
            NAVIGATION
            ========================================= */}

        <nav className="top-navigation">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "top-nav-link active"
                : "top-nav-link"
            }
          >
            Command Center
          </NavLink>

          <NavLink
            to="/workflows"
            className={({ isActive }) =>
              isActive
                ? "top-nav-link active"
                : "top-nav-link"
            }
          >
            Workflows
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive
                ? "top-nav-link active"
                : "top-nav-link"
            }
          >
            Team
          </NavLink>

          <NavLink
            to="/activity"
            className={({ isActive }) =>
              isActive
                ? "top-nav-link active"
                : "top-nav-link"
            }
          >
            Activity
          </NavLink>

        </nav>


        {/* =========================================
            ACTIONS
            ========================================= */}

        <div className="top-actions">

          {/* =========================================
              SEARCH
              ========================================= */}

          <div
            className="top-search-container"
            ref={searchRef}
          >

            <button
              type="button"
              className="icon-button"
              title="Search workflows"
              onClick={handleSearchClick}
            >
              <Search size={19} />
            </button>

            {searchOpen && (
              <div className="top-search-panel">

                <button
                  type="button"
                  className="top-search-close"
                  onClick={closeSearch}
                  title="Close search"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>

                <div className="top-search-input-wrapper">

                  <Search
                    size={17}
                    className="top-search-input-icon"
                  />

                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleSearchKeyDown
                    }
                    placeholder="Search workflows..."
                    className="top-search-input"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      className="top-search-clear"
                      onClick={clearSearch}
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}

                </div>

                <div className="top-search-results">

                  {searchLoading && (
                    <div className="top-search-message">
                      Searching workflows...
                    </div>
                  )}

                  {!searchLoading &&
                    searchTerm.trim() === "" && (
                      <div className="top-search-message">

                        <Search size={18} />

                        <span>
                          Search your workflows by
                          name, description or creator.
                        </span>

                      </div>
                    )}

                  {!searchLoading &&
                    searchTerm.trim() !== "" &&
                    filteredWorkflows.length === 0 && (
                      <div className="top-search-message">

                        <WorkflowIcon size={18} />

                        <span>
                          No matching workflows found.
                        </span>

                      </div>
                    )}

                  {!searchLoading &&
                    filteredWorkflows.length > 0 && (
                      <>
                        <div className="top-search-result-label">
                          WORKFLOWS
                        </div>

                        {filteredWorkflows.map(
                          (workflow) => (
                            <button
                              type="button"
                              className="top-search-result"
                              key={workflow.id}
                              onClick={() =>
                                handleWorkflowSearchResult(
                                  workflow.id
                                )
                              }
                            >

                              <div className="top-search-result-icon">

                                <WorkflowIcon
                                  size={17}
                                />

                              </div>

                              <div className="top-search-result-content">

                                <strong>
                                  {workflow.name ||
                                    "Unnamed Workflow"}
                                </strong>

                                <span>
                                  {workflow.description ||
                                    "No description"}
                                </span>

                              </div>

                              <div className="top-search-result-arrow">
                                →
                              </div>

                            </button>
                          )
                        )}

                      </>
                    )}

                </div>

              </div>
            )}

          </div>


          {/* =========================================
              NOTIFICATIONS
              ========================================= */}

          <div
            className="notification-container"
            ref={notificationRef}
          >

            <button
              type="button"
              className={
                notificationsEnabled
                  ? "icon-button notification-button"
                  : "icon-button notification-button notification-disabled"
              }
              title={
                notificationsEnabled
                  ? "Notifications"
                  : "Notifications disabled in Settings"
              }
              onClick={
                handleNotificationClick
              }
              aria-label="Notifications"
              aria-disabled={
                !notificationsEnabled
              }
            >

              <Bell size={19} />

              {notificationsEnabled &&
                unreadCount > 0 && (
                  <span className="notification-badge">

                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}

                  </span>
                )}

            </button>


            {notificationOpen &&
              notificationsEnabled && (
                <div className="notification-panel">

                  <div className="notification-header">

                    <div>

                      <strong>
                        Notifications
                      </strong>

                      <span>
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "All caught up"}
                      </span>

                    </div>

                    <button
                      type="button"
                      className="notification-mark-all"
                      onClick={
                        handleMarkAllAsRead
                      }
                      disabled={
                        unreadCount === 0
                      }
                      title="Mark all as read"
                    >

                      <CheckCheck size={15} />

                      Mark all

                    </button>

                  </div>


                  {notificationError && (
                    <div className="notification-message notification-error-message">

                      <AlertCircle size={17} />

                      <span>
                        {notificationError}
                      </span>

                    </div>
                  )}


                  {notificationLoading && (
                    <div className="notification-message">

                      <div className="loading-spinner"></div>

                      <span>
                        Loading notifications...
                      </span>

                    </div>
                  )}


                  {!notificationLoading &&
                    !notificationError &&
                    displayedNotifications.length === 0 && (
                      <div className="notification-empty">

                        <Bell size={25} />

                        <strong>
                          No notifications
                        </strong>

                        <span>
                          You're all caught up.
                        </span>

                      </div>
                    )}


                  {!notificationLoading &&
                    displayedNotifications.length > 0 && (
                      <div className="notification-list">

                        {displayedNotifications.map(
                          (notification) => (
                            <div
                              key={
                                notification.id
                              }
                              className={
                                notification.read
                                  ? "notification-item"
                                  : "notification-item notification-unread"
                              }
                              onClick={() =>
                                handleNotificationOpen(
                                  notification
                                )
                              }
                            >

                              {!notification.read && (
                                <span className="notification-unread-dot"></span>
                              )}


                              <div
                                className={getNotificationClass(
                                  notification
                                )}
                              >

                                {getNotificationIcon(
                                  notification
                                )}

                              </div>


                              <div className="notification-content">

                                <strong>
                                  {notification.title ||
                                    "Notification"}
                                </strong>

                                <span className="notification-workflow-name">

                                  {notification.workflowName ||
                                    notification.workflow?.name ||
                                    "NovaWavex"}

                                </span>

                                <span className="notification-message-text">

                                  {notification.message ||
                                    "No message"}

                                </span>

                                <small>

                                  {formatNotificationTime(
                                    notification.createdAt
                                  )}

                                </small>

                              </div>


                              <button
                                type="button"
                                className="notification-delete"
                                onClick={(event) =>
                                  handleDeleteNotification(
                                    event,
                                    notification.id
                                  )
                                }
                                title="Delete notification"
                                aria-label="Delete notification"
                              >

                                <Trash2 size={14} />

                              </button>

                            </div>
                          )
                        )}

                      </div>
                    )}


                  <div className="notification-footer">

                    <button
                      type="button"
                      onClick={() => {

                        setNotificationOpen(false);

                        navigate(
                          "/notifications"
                        );

                      }}
                    >

                      View all notifications

                      <span>
                        →
                      </span>

                    </button>

                  </div>

                </div>
              )}

          </div>


          {/* =========================================
              SYSTEM STATUS
              ========================================= */}

          <div
            className={getSystemStatusClass()}
            title={`Backend status: ${getSystemStatusLabel()}`}
          >

            <Activity size={16} />

            <span>
              {getSystemStatusLabel()}
            </span>

          </div>


          {/* =========================================
              PROFILE
              ========================================= */}

          <div className="profile-container">

            <button
              className="profile-button"
              onClick={() =>
                setProfileOpen(
                  !profileOpen
                )
              }
              title="Account menu"
            >

              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profileName}
                  className="profile-avatar profile-avatar-image"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div className="profile-avatar">
                  {profileInitials}
                </div>
              )}

              <ChevronDown
                size={14}
                className={
                  profileOpen
                    ? "profile-chevron profile-chevron-open"
                    : "profile-chevron"
                }
              />

            </button>


            {profileOpen && (
              <div className="profile-menu">

                <div className="profile-menu-header">

                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={profileName}
                      className="profile-menu-avatar profile-avatar-image"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="profile-menu-avatar">
                      {profileInitials}
                    </div>
                  )}

                  <div>

                    <strong>
                      {profileName}
                    </strong>

                    <span>
                      {profileEmail ||
                        "NovaWavex User"}
                    </span>

                  </div>

                </div>


                <div className="profile-menu-divider"></div>


                <button
                  className="profile-menu-item"
                  onClick={() => {

                    setProfileOpen(false);

                    navigate(
                      "/profile"
                    );

                  }}
                >

                  <User size={16} />

                  <span>
                    Profile
                  </span>

                </button>


                <button
                  className="profile-menu-item"
                  onClick={() => {

                    setProfileOpen(false);

                    navigate(
                      "/settings"
                    );

                  }}
                >

                  <Settings size={16} />

                  <span>
                    Settings
                  </span>

                </button>


                <div className="profile-menu-divider"></div>


                <button
                  className="profile-menu-item logout-item"
                  onClick={logout}
                >

                  <LogOut size={16} />

                  <span>
                    Logout
                  </span>

                </button>

              </div>
            )}

          </div>

        </div>

      </header>


      <style>{`

        /* =========================================
           PROFILE IMAGE
           ========================================= */

        .profile-avatar-image {
          display: block;
          object-fit: cover;
          object-position: center;
          overflow: hidden;
        }


        /* =========================================
           SEARCH
           ========================================= */

        .top-search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .top-search-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 390px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          background:
            linear-gradient(
              145deg,
              rgba(20, 27, 43, 0.98),
              rgba(10, 15, 27, 0.98)
            );
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(18px);
          z-index: 1000;
        }

        .top-search-close {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: 0;
          border-radius: 7px;
          color: #8490a8;
          background: transparent;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .top-search-close:hover {
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.08);
        }

        .top-search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          padding: 12px 48px 12px 12px;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.07);
        }

        .top-search-input-icon {
          position: absolute;
          left: 25px;
          color: #69758c;
          pointer-events: none;
        }

        .top-search-input {
          width: 100%;
          box-sizing: border-box;
          height: 42px;
          padding: 0 38px 0 40px;
          border:
            1px solid rgba(255, 255, 255, 0.09);
          border-radius: 9px;
          outline: none;
          color: #e8eefc;
          background:
            rgba(255, 255, 255, 0.045);
          font-size: 13px;
        }

        .top-search-input::placeholder {
          color: #69758c;
        }

        .top-search-input:focus {
          border-color:
            rgba(77, 124, 255, 0.45);
          box-shadow:
            0 0 0 3px
            rgba(77, 124, 255, 0.08);
        }

        .top-search-clear {
          position: absolute;
          right: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          padding: 0;
          border: 0;
          border-radius: 6px;
          color: #8490a8;
          background: transparent;
          cursor: pointer;
        }

        .top-search-clear:hover {
          color: #e8eefc;
          background:
            rgba(255, 255, 255, 0.08);
        }

        .top-search-results {
          max-height: 360px;
          overflow-y: auto;
          padding: 8px;
        }

        .top-search-result-label {
          padding: 8px 10px 7px;
          color: #69758c;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .top-search-result {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 10px;
          border: 0;
          border-radius: 9px;
          color: #e8eefc;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .top-search-result:hover {
          background:
            rgba(77, 124, 255, 0.1);
        }

        .top-search-result-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          color: #9bb9ff;
          background:
            rgba(77, 124, 255, 0.1);
        }

        .top-search-result-content {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .top-search-result-content strong {
          overflow: hidden;
          color: #e8eefc;
          font-size: 13px;
          font-weight: 650;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .top-search-result-content span {
          overflow: hidden;
          color: #69758c;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .top-search-result-arrow {
          flex-shrink: 0;
          color: #69758c;
          font-size: 17px;
        }

        .top-search-message {
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 20px;
          color: #69758c;
          text-align: center;
          font-size: 12px;
          line-height: 1.5;
        }


        /* =========================================
           NOTIFICATIONS
           ========================================= */

        .notification-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .notification-button {
          position: relative;
        }

        .notification-disabled {
          color: #59657b;
          opacity: 0.55;
        }

        .notification-disabled:hover {
          color: #69758c;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0a0f1b;
          border-radius: 999px;
          color: #ffffff;
          background: #ef4444;
          font-size: 9px;
          font-weight: 800;
          line-height: 1;
          box-sizing: border-box;
        }

        .notification-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: -55px;
          width: 390px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          background:
            linear-gradient(
              145deg,
              rgba(20, 27, 43, 0.99),
              rgba(10, 15, 27, 0.99)
            );
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(18px);
          z-index: 1100;
        }

        .notification-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 17px;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.07);
        }

        .notification-header > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notification-header strong {
          color: #e8eefc;
          font-size: 14px;
          font-weight: 700;
        }

        .notification-header span {
          color: #69758c;
          font-size: 11px;
        }

        .notification-mark-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 9px;
          border: 0;
          border-radius: 7px;
          color: #9bb9ff;
          background: rgba(77, 124, 255, 0.08);
          font-size: 10px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .notification-mark-all:hover:not(:disabled) {
          background:
            rgba(77, 124, 255, 0.16);
        }

        .notification-mark-all:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .notification-list {
          max-height: 390px;
          overflow-y: auto;
          padding: 7px;
        }

        .notification-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .notification-item:hover {
          background:
            rgba(255, 255, 255, 0.045);
        }

        .notification-unread {
          background:
            rgba(77, 124, 255, 0.045);
        }

        .notification-unread:hover {
          background:
            rgba(77, 124, 255, 0.09);
        }

        .notification-unread-dot {
          position: absolute;
          top: 14px;
          left: 4px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #5b8cff;
          box-shadow:
            0 0 8px rgba(91, 140, 255, 0.7);
        }

        .notification-icon {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
        }

        .notification-success {
          color: #65d99b;
          background:
            rgba(46, 204, 113, 0.1);
        }

        .notification-warning {
          color: #f6c85f;
          background:
            rgba(246, 200, 95, 0.1);
        }

        .notification-error {
          color: #ff7272;
          background:
            rgba(255, 82, 82, 0.1);
        }

        .notification-info {
          color: #8eb1ff;
          background:
            rgba(77, 124, 255, 0.1);
        }

        .notification-content {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .notification-content strong {
          overflow: hidden;
          color: #e8eefc;
          font-size: 12px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notification-workflow-name {
          overflow: hidden;
          color: #9aa8c0;
          font-size: 11px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notification-message-text {
          display: -webkit-box;
          overflow: hidden;
          color: #69758c;
          font-size: 10px;
          line-height: 1.45;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notification-content small {
          margin-top: 2px;
          color: #566176;
          font-size: 9px;
        }

        .notification-delete {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 27px;
          height: 27px;
          padding: 0;
          border: 0;
          border-radius: 7px;
          color: #59657b;
          background: transparent;
          cursor: pointer;
          opacity: 0;
          transition: 0.15s ease;
        }

        .notification-item:hover .notification-delete {
          opacity: 1;
        }

        .notification-delete:hover {
          color: #ff7272;
          background:
            rgba(255, 82, 82, 0.09);
        }

        .notification-message {
          min-height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 20px;
          color: #69758c;
          text-align: center;
          font-size: 11px;
        }

        .notification-error-message {
          color: #ff8585;
        }

        .notification-empty {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          padding: 25px;
          color: #69758c;
          text-align: center;
        }

        .notification-empty svg {
          margin-bottom: 4px;
          color: #59657b;
        }

        .notification-empty strong {
          color: #aab6ca;
          font-size: 13px;
        }

        .notification-empty span {
          color: #59657b;
          font-size: 10px;
        }

        .notification-footer {
          padding: 9px;
          border-top:
            1px solid rgba(255, 255, 255, 0.07);
        }

        .notification-footer button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px;
          border: 0;
          border-radius: 8px;
          color: #9bb9ff;
          background:
            rgba(77, 124, 255, 0.07);
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .notification-footer button:hover {
          background:
            rgba(77, 124, 255, 0.13);
        }

        .notification-footer button span {
          font-size: 15px;
        }


        /* =========================================
           SYSTEM STATUS
           ========================================= */

        .system-indicator {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid transparent;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .system-operational {
          color: #65d99b;
          background: rgba(46, 204, 113, 0.08);
          border-color: rgba(46, 204, 113, 0.12);
        }

        .system-operational svg {
          filter:
            drop-shadow(
              0 0 5px
              rgba(46, 204, 113, 0.45)
            );
        }

        .system-degraded {
          color: #f6c85f;
          background: rgba(246, 200, 95, 0.08);
          border-color: rgba(246, 200, 95, 0.12);
        }

        .system-offline {
          color: #ff7272;
          background: rgba(255, 82, 82, 0.08);
          border-color: rgba(255, 82, 82, 0.12);
        }

        .system-checking {
          color: #9aa8c0;
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.07);
        }

        .system-checking svg {
          animation:
            system-status-pulse 1.4s ease-in-out infinite;
        }

        @keyframes system-status-pulse {

          0%,
          100% {
            opacity: 0.45;
          }

          50% {
            opacity: 1;
          }

        }


        /* =========================================
           LOADING SPINNER
           ========================================= */

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.12);
          border-top-color: #8eb1ff;
          border-radius: 50%;
          animation:
            notification-spin 0.8s linear infinite;
        }

        @keyframes notification-spin {

          to {
            transform: rotate(360deg);
          }

        }


        /* =========================================
           RESPONSIVE
           ========================================= */

        @media (max-width: 600px) {

          .top-search-panel {
            position: fixed;
            top: 70px;
            left: 15px;
            right: 15px;
            width: auto;
          }

          .notification-panel {
            position: fixed;
            top: 70px;
            left: 15px;
            right: 15px;
            width: auto;
          }

          .system-indicator {
            display: none;
          }

        }

      `}</style>
    </>
  );
};

export default TopNav;
