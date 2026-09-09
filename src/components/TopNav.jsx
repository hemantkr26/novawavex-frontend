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

  const profileButtonRef = useRef(null);

  // =========================================
  // SEARCH STATE
  // =========================================

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [workflows, setWorkflows] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);

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
  const notificationButtonRef = useRef(null);

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
          alt=""
          className={`${className} profile-avatar-image`}
          aria-hidden="true"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />
      );
    }

    return (
      <div
        className={className}
        aria-hidden="true"
      >
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
  // CLOSE OVERLAYS ON ESCAPE
  // =========================================

  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (searchOpen) {
        setSearchOpen(false);
        setSearchTerm("");

        requestAnimationFrame(() => {
          searchButtonRef.current?.focus();
        });

        return;
      }

      if (notificationOpen) {
        setNotificationOpen(false);

        requestAnimationFrame(() => {
          notificationButtonRef.current?.focus();
        });

        return;
      }

      if (profileOpen) {
        setProfileOpen(false);

        requestAnimationFrame(() => {
          profileButtonRef.current?.focus();
        });
      }
    };

    document.addEventListener(
      "keydown",
      handleGlobalKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleGlobalKeyDown
      );
    };
  }, [
    searchOpen,
    notificationOpen,
    profileOpen,
  ]);

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

      requestAnimationFrame(() => {
        searchButtonRef.current?.focus();
      });
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
  // NOTIFICATION KEYBOARD HANDLER
  // =========================================

  const handleNotificationKeyDown = (
    event,
    notification
  ) => {
    // Do not trigger the notification when
    // the keyboard event originated from the
    // nested delete button.
    if (
      event.target.closest &&
      event.target.closest("button")
    ) {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      handleNotificationOpen(
        notification
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
  // PROFILE TOGGLE
  // =========================================

  const handleProfileClick = () => {
    setProfileOpen(
      (previous) => !previous
    );

    setSearchOpen(false);
    setNotificationOpen(false);
  };

  // =========================================
  // PROFILE KEYBOARD
  // =========================================

  const handleProfileKeyDown = (
    event
  ) => {
    if (event.key === "Escape") {
      setProfileOpen(false);

      requestAnimationFrame(() => {
        profileButtonRef.current?.focus();
      });
    }
  };

  // =========================================
  // NOTIFICATION DISPLAY LIST
  // =========================================

  const displayedNotifications =
    notifications.slice(0, 8);

  return (
    <>
      <header
        className="top-nav"
        aria-label="NovaWavex application header"
      >

        {/* =========================================
            BRAND
            ========================================= */}

        <div className="brand">

          <div
            className="brand-symbol"
            aria-hidden="true"
          >
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

        <nav
          className="top-navigation"
          aria-label="Primary navigation"
        >

          <NavLink
            to="/dashboard"
            end
            className={
              location.pathname === "/dashboard"
                ? "top-nav-link active"
                : "top-nav-link"
            }
            aria-label="Command Center"
          >
            <span className="top-nav-label">Command Center</span>
          </NavLink>

          <NavLink
            to="/workflows"
            className={
              location.pathname === "/workflows" ||
              location.pathname.startsWith("/workflows/")
                ? "top-nav-link active"
                : "top-nav-link"
            }
            aria-label="Workflows"
          >
            <span className="top-nav-label">Workflows</span>
          </NavLink>

          <NavLink
            to="/users"
            className={
              location.pathname === "/users" ||
              location.pathname.startsWith("/users/")
                ? "top-nav-link active"
                : "top-nav-link"
            }
            aria-label="Team"
          >
            <span className="top-nav-label">Team</span>
          </NavLink>

          <NavLink
            to="/activity"
            className={
              location.pathname === "/activity" ||
              location.pathname.startsWith("/activity/")
                ? "top-nav-link active"
                : "top-nav-link"
            }
            aria-label="Activity"
          >
            <span className="top-nav-label">Activity</span>
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
              ref={searchButtonRef}
              type="button"
              className="icon-button"
              title="Search workflows"
              aria-label={
                searchOpen
                  ? "Close workflow search"
                  : "Search workflows"
              }
              aria-expanded={searchOpen}
              aria-controls="top-search-panel"
              aria-haspopup="dialog"
              onClick={handleSearchClick}
            >
              <Search
                size={19}
                aria-hidden="true"
              />
            </button>

            {searchOpen && (
              <div
                className="top-search-panel"
                id="top-search-panel"
                role="dialog"
                aria-label="Workflow search"
              >

                <button
                  type="button"
                  className="top-search-close"
                  onClick={() => {
                    closeSearch();

                    requestAnimationFrame(() => {
                      searchButtonRef.current?.focus();
                    });
                  }}
                  title="Close search"
                  aria-label="Close workflow search"
                >
                  <X
                    size={16}
                    aria-hidden="true"
                  />
                </button>

                <div className="top-search-input-wrapper">

                  <Search
                    size={17}
                    className="top-search-input-icon"
                    aria-hidden="true"
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
                    aria-label="Search workflows"
                    aria-controls="top-search-results"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      className="top-search-clear"
                      onClick={clearSearch}
                      title="Clear search"
                      aria-label="Clear workflow search text"
                    >
                      <X
                        size={14}
                        aria-hidden="true"
                      />
                    </button>
                  )}

                </div>

                <div
                  className="top-search-results"
                  id="top-search-results"
                  aria-live="polite"
                  aria-atomic="false"
                >

                  {searchLoading && (
                    <div
                      className="top-search-message"
                      role="status"
                    >

                      <span>
                        Searching workflows...
                      </span>

                    </div>
                  )}

                  {!searchLoading &&
                    searchTerm.trim() === "" && (
                      <div className="top-search-message">

                        <Search
                          size={18}
                          aria-hidden="true"
                        />

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

                        <WorkflowIcon
                          size={18}
                          aria-hidden="true"
                        />

                        <span>
                          No matching workflows found.
                        </span>

                      </div>
                    )}

                  {!searchLoading &&
                    filteredWorkflows.length > 0 && (
                      <>

                        <div
                          className="top-search-result-label"
                          aria-hidden="true"
                        >
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
                              aria-label={`Open workflow ${
                                workflow.name ||
                                "Unnamed Workflow"
                              }${
                                workflow.description
                                  ? `, ${workflow.description}`
                                  : ""
                              }`}
                            >

                              <div
                                className="top-search-result-icon"
                                aria-hidden="true"
                              >

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

                              <div
                                className="top-search-result-arrow"
                                aria-hidden="true"
                              >
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
              ref={notificationButtonRef}
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
              aria-label={
                notificationsEnabled
                  ? unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
                  : "Notifications disabled in Settings"
              }
              aria-expanded={
                notificationsEnabled
                  ? notificationOpen
                  : false
              }
              aria-controls="notification-panel"
              aria-haspopup="dialog"
              aria-disabled={
                !notificationsEnabled
              }
            >

              <Bell
                size={19}
                aria-hidden="true"
              />

              {notificationsEnabled &&
                unreadCount > 0 && (
                  <span
                    className="notification-badge"
                    aria-hidden="true"
                  >

                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}

                  </span>
                )}

            </button>


            {notificationOpen &&
              notificationsEnabled && (
                <div
                  className="notification-panel"
                  id="notification-panel"
                  role="dialog"
                  aria-label="Notifications"
                >

                  <div className="notification-header">

                    <div>

                      <strong>
                        Notifications
                      </strong>

                      <span
                        aria-live="polite"
                        aria-atomic="true"
                      >
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
                      aria-label="Mark all notifications as read"
                    >

                      <CheckCheck
                        size={15}
                        aria-hidden="true"
                      />

                      Mark all

                    </button>

                  </div>


                  {notificationError && (
                    <div
                      className="notification-message notification-error-message"
                      role="alert"
                    >

                      <AlertCircle
                        size={17}
                        aria-hidden="true"
                      />

                      <span>
                        {notificationError}
                      </span>

                    </div>
                  )}


                  {notificationLoading && (
                    <div
                      className="notification-message"
                      role="status"
                      aria-live="polite"
                    >

                      <div
                        className="loading-spinner"
                        aria-hidden="true"
                      ></div>

                      <span>
                        Loading notifications...
                      </span>

                    </div>
                  )}


                  {!notificationLoading &&
                    !notificationError &&
                    displayedNotifications.length === 0 && (
                      <div className="notification-empty">

                        <Bell
                          size={25}
                          aria-hidden="true"
                        />

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
                      <div
                        className="notification-list"
                        aria-label="Notification list"
                      >

                        {displayedNotifications.map(
                          (notification) => {
                            const notificationName =
                              notification.title ||
                              "Notification";

                            const workflowName =
                              notification.workflowName ||
                              notification.workflow?.name ||
                              "";

                            return (
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
                                onKeyDown={(event) =>
                                  handleNotificationKeyDown(
                                    event,
                                    notification
                                  )
                                }
                                role="button"
                                tabIndex={0}
                                aria-label={`${
                                  notification.read
                                    ? ""
                                    : "Unread "
                                }${notificationName}${
                                  workflowName
                                    ? `, ${workflowName}`
                                    : ""
                                }`}
                                aria-describedby={`notification-message-${notification.id}`}
                              >

                                {!notification.read && (
                                  <span
                                    className="notification-unread-dot"
                                    aria-hidden="true"
                                  ></span>
                                )}


                                <div
                                  className={getNotificationClass(
                                    notification
                                  )}
                                  aria-hidden="true"
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

                                  <span
                                    className="notification-message-text"
                                    id={`notification-message-${notification.id}`}
                                  >

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
                                  onKeyDown={(event) =>
                                    event.stopPropagation()
                                  }
                                  title="Delete notification"
                                  aria-label={`Delete notification: ${
                                    notification.title ||
                                    "Notification"
                                  }`}
                                >

                                  <Trash2
                                    size={14}
                                    aria-hidden="true"
                                  />

                                </button>

                              </div>
                            );
                          }
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
                      aria-label="View all notifications"
                    >

                      View all notifications

                      <span aria-hidden="true">
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
            role="status"
            aria-label={`Backend status: ${getSystemStatusLabel()}`}
            aria-live="polite"
          >

            <Activity
              size={16}
              aria-hidden="true"
            />

            <span>
              {getSystemStatusLabel()}
            </span>

          </div>


          {/* =========================================
              PROFILE
              ========================================= */}

          <div className="profile-container">

            <button
              ref={profileButtonRef}
              type="button"
              className="profile-button"
              onClick={handleProfileClick}
              onKeyDown={handleProfileKeyDown}
              title="Account menu"
              aria-label={`Account menu for ${profileName}`}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-controls="profile-menu"
            >

              {profileImage ? (
                <img
                  src={profileImage}
                  alt=""
                  className="profile-avatar profile-avatar-image"
                  aria-hidden="true"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div
                  className="profile-avatar"
                  aria-hidden="true"
                >
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
                aria-hidden="true"
              />

            </button>


            {profileOpen && (
              <div
                className="profile-menu"
                id="profile-menu"
                role="menu"
                aria-label="Account menu"
              >

                <div className="profile-menu-header">

                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt=""
                      className="profile-menu-avatar profile-avatar-image"
                      aria-hidden="true"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div
                      className="profile-menu-avatar"
                      aria-hidden="true"
                    >
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


                <div
                  className="profile-menu-divider"
                  role="separator"
                ></div>


                <button
                  type="button"
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => {

                    setProfileOpen(false);

                    navigate(
                      "/profile"
                    );

                  }}
                >

                  <User
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    Profile
                  </span>

                </button>


                <button
                  type="button"
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => {

                    setProfileOpen(false);

                    navigate(
                      "/settings"
                    );

                  }}
                >

                  <Settings
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    Settings
                  </span>

                </button>


                <div
                  className="profile-menu-divider"
                  role="separator"
                ></div>


                <button
                  type="button"
                  className="profile-menu-item logout-item"
                  role="menuitem"
                  onClick={logout}
                >

                  <LogOut
                    size={16}
                    aria-hidden="true"
                  />

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
           PHASE 13.9 — MICRO-INTERACTIONS
           ========================================= */

        /* -----------------------------------------
           PROFILE IMAGE
           ----------------------------------------- */

        .profile-avatar-image {
          display: block;
          object-fit: cover;
          object-position: center;
          overflow: hidden;
        }


        /* -----------------------------------------
           TOP NAVIGATION
           ----------------------------------------- */

        .top-navigation {
          align-items: center;
        }

        .top-nav-link {
          position: relative;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            transform 0.18s ease;
        }

        .top-nav-link::after {
          display: none;
        }

        .top-nav-label {
          position: relative;
          display: inline-block;
        }

        .top-nav-label::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -23px;
          width: 0;
          height: 3px;
          border-radius: 999px;
          background: #2563eb;
          opacity: 0;
          transform: translateX(-50%);
          transition:
            width 0.22s ease,
            opacity 0.2s ease;
        }

        .top-nav-link:hover {
          transform: translateY(-1px);
        }

        .top-nav-link:hover .top-nav-label::after {
          width: 16px;
          opacity: 0.45;
        }

        .top-nav-link.active {
          transform: translateY(0);
        }

        .top-nav-link.active .top-nav-label::after {
          width: 42px;
          opacity: 0.95;
        }

        .top-nav-link:active {
          transform: translateY(0) scale(0.98);
        }


        /* -----------------------------------------
           GLOBAL TOP ACTION MICRO-INTERACTIONS
           ----------------------------------------- */

        .top-actions > * {
          transition:
            transform 0.18s ease;
        }

        .icon-button {
          transition:
            color 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            transform 0.18s ease;
        }

        .icon-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .icon-button:active:not(:disabled) {
          transform: translateY(0) scale(0.94);
        }


        /* -----------------------------------------
           BRAND MICRO-INTERACTION
           ----------------------------------------- */

        .brand-symbol {
          transition:
            transform 0.28s ease,
            box-shadow 0.28s ease;
        }

        .brand:hover .brand-symbol {
          transform:
            translateY(-1px)
            rotate(-4deg)
            scale(1.035);
        }

        .brand:active .brand-symbol {
          transform:
            translateY(0)
            rotate(0deg)
            scale(0.98);
        }


        /* -----------------------------------------
           SEARCH
           ----------------------------------------- */

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

          animation:
            top-panel-enter 0.2s ease-out both;
          transform-origin:
            top right;
        }

        @keyframes top-panel-enter {
          from {
            opacity: 0;
            transform:
              translateY(-7px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
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
          transition:
            color 0.15s ease,
            background 0.15s ease,
            transform 0.15s ease;
        }

        .top-search-close:hover {
          color: #e8eefc;
          background: rgba(255, 255, 255, 0.08);
          transform: rotate(4deg) scale(1.04);
        }

        .top-search-close:active {
          transform: scale(0.92);
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
          transition:
            color 0.18s ease,
            transform 0.18s ease;
        }

        .top-search-input-wrapper:focus-within
          .top-search-input-icon {
          color: #8eb1ff;
          transform: scale(1.04);
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
          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .top-search-input::placeholder {
          color: #69758c;
        }

        .top-search-input:hover {
          background:
            rgba(255, 255, 255, 0.06);
        }

        .top-search-input:focus {
          border-color:
            rgba(77, 124, 255, 0.45);
          background:
            rgba(255, 255, 255, 0.055);
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
          transition:
            color 0.15s ease,
            background 0.15s ease,
            transform 0.15s ease;
        }

        .top-search-clear:hover {
          color: #e8eefc;
          background:
            rgba(255, 255, 255, 0.08);
          transform: scale(1.06);
        }

        .top-search-clear:active {
          transform: scale(0.9);
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
          transition:
            background 0.17s ease,
            transform 0.17s ease;
        }

        .top-search-result:hover {
          background:
            rgba(77, 124, 255, 0.1);
          transform:
            translateX(2px);
        }

        .top-search-result:active {
          transform:
            translateX(1px)
            scale(0.995);
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
          transition:
            transform 0.18s ease,
            background 0.18s ease;
        }

        .top-search-result:hover
          .top-search-result-icon {
          transform:
            translateX(1px)
            scale(1.04);
          background:
            rgba(77, 124, 255, 0.15);
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
          transition:
            color 0.17s ease,
            transform 0.17s ease;
        }

        .top-search-result:hover
          .top-search-result-arrow {
          color: #9bb9ff;
          transform: translateX(3px);
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


        /* -----------------------------------------
           NOTIFICATIONS
           ----------------------------------------- */

        .notification-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .notification-button {
          position: relative;
        }

        .notification-button:not(.notification-disabled):hover
          svg {
          animation:
            notification-bell-hover 0.42s ease;
        }

        @keyframes notification-bell-hover {
          0%,
          100% {
            transform: rotate(0deg);
          }

          25% {
            transform: rotate(-7deg);
          }

          50% {
            transform: rotate(6deg);
          }

          75% {
            transform: rotate(-3deg);
          }
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

          animation:
            notification-badge-enter 0.28s
            ease-out both;
        }

        @keyframes notification-badge-enter {
          from {
            opacity: 0;
            transform:
              scale(0.65)
              translateY(-2px);
          }

          65% {
            transform:
              scale(1.08)
              translateY(0);
          }

          to {
            opacity: 1;
            transform:
              scale(1)
              translateY(0);
          }
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

          animation:
            top-panel-enter 0.2s ease-out both;
          transform-origin:
            top right;
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
          transition:
            background 0.17s ease,
            color 0.17s ease,
            transform 0.17s ease;
        }

        .notification-mark-all:hover:not(:disabled) {
          background:
            rgba(77, 124, 255, 0.16);
          color: #b5caff;
          transform: translateY(-1px);
        }

        .notification-mark-all:active:not(:disabled) {
          transform: scale(0.96);
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
          transition:
            background 0.17s ease,
            transform 0.17s ease;
        }

        .notification-item:hover {
          background:
            rgba(255, 255, 255, 0.045);
          transform: translateX(1px);
        }

        .notification-item:active {
          transform:
            translateX(1px)
            scale(0.995);
        }

        .notification-item:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
          background:
            rgba(77, 124, 255, 0.08);
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

          animation:
            unread-dot-pulse 2s ease-in-out infinite;
        }

        @keyframes unread-dot-pulse {
          0%,
          100% {
            opacity: 0.75;
            transform: scale(0.9);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        .notification-icon {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          transition:
            transform 0.18s ease,
            background 0.18s ease;
        }

        .notification-item:hover
          .notification-icon {
          transform:
            translateY(-1px)
            scale(1.04);
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
          transition:
            opacity 0.15s ease,
            color 0.15s ease,
            background 0.15s ease,
            transform 0.15s ease;
        }

        .notification-item:hover .notification-delete,
        .notification-item:focus-within .notification-delete {
          opacity: 1;
        }

        .notification-delete:hover {
          color: #ff7272;
          background:
            rgba(255, 82, 82, 0.09);
          transform: scale(1.05);
        }

        .notification-delete:active {
          transform: scale(0.9);
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
          transition:
            transform 0.25s ease;
        }

        .notification-empty:hover svg {
          transform:
            translateY(-2px)
            scale(1.04);
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
          transition:
            background 0.17s ease,
            color 0.17s ease,
            transform 0.17s ease;
        }

        .notification-footer button:hover {
          background:
            rgba(77, 124, 255, 0.13);
          color: #b5caff;
          transform: translateY(-1px);
        }

        .notification-footer button:active {
          transform: scale(0.98);
        }

        .notification-footer button span {
          font-size: 15px;
          transition:
            transform 0.17s ease;
        }

        .notification-footer button:hover span {
          transform: translateX(3px);
        }


        /* -----------------------------------------
           SYSTEM STATUS
           ----------------------------------------- */

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
            border-color 0.2s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .system-indicator:hover {
          transform: translateY(-1px);
        }

        .system-operational {
          color: #65d99b;
          background: rgba(46, 204, 113, 0.08);
          border-color: rgba(46, 204, 113, 0.12);
        }

        .system-operational:hover {
          background: rgba(46, 204, 113, 0.11);
          border-color: rgba(46, 204, 113, 0.18);
          box-shadow:
            0 5px 18px
            rgba(46, 204, 113, 0.07);
        }

        .system-operational svg {
          filter:
            drop-shadow(
              0 0 5px
              rgba(46, 204, 113, 0.45)
            );
          transition:
            transform 0.2s ease;
        }

        .system-operational:hover svg {
          transform: scale(1.06);
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


        /* -----------------------------------------
           PROFILE
           ----------------------------------------- */

        .profile-button {
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            transform 0.18s ease;
        }

        .profile-button:hover {
          transform: translateY(-1px);
        }

        .profile-button:active {
          transform: scale(0.97);
        }

        .profile-avatar {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .profile-button:hover .profile-avatar {
          transform: scale(1.035);
        }

        .profile-chevron {
          transition:
            transform 0.2s ease,
            color 0.18s ease;
        }

        .profile-chevron-open {
          transform: rotate(180deg);
        }

        .profile-button:hover
          .profile-chevron {
          color: #9bb9ff;
        }

        .profile-menu {
          animation:
            profile-menu-enter 0.2s ease-out both;
          transform-origin:
            top right;
        }

        @keyframes profile-menu-enter {
          from {
            opacity: 0;
            transform:
              translateY(-6px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        .profile-menu-item {
          transition:
            background 0.16s ease,
            color 0.16s ease,
            transform 0.16s ease;
        }

        .profile-menu-item:hover {
          transform: translateX(2px);
        }

        .profile-menu-item:active {
          transform:
            translateX(1px)
            scale(0.985);
        }

        .profile-menu-item svg {
          transition:
            transform 0.17s ease;
        }

        .profile-menu-item:hover svg {
          transform: scale(1.05);
        }


        /* -----------------------------------------
           LOADING SPINNER
           ----------------------------------------- */

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
           REDUCED MOTION
           ========================================= */

        @media (prefers-reduced-motion: reduce) {

          .top-nav-link,
          .top-nav-link::after,
          .icon-button,
          .brand-symbol,
          .top-search-panel,
          .top-search-close,
          .top-search-input-icon,
          .top-search-input,
          .top-search-clear,
          .top-search-result,
          .top-search-result-icon,
          .top-search-result-arrow,
          .notification-button svg,
          .notification-badge,
          .notification-mark-all,
          .notification-item,
          .notification-unread-dot,
          .notification-icon,
          .notification-delete,
          .notification-footer button,
          .notification-footer button span,
          .system-indicator,
          .system-operational svg,
          .profile-button,
          .profile-avatar,
          .profile-chevron,
          .profile-menu,
          .profile-menu-item,
          .profile-menu-item svg,
          .notification-empty svg {
            animation: none !important;
            transition: none !important;
          }

          .top-nav-link:hover,
          .top-nav-link:active,
          .icon-button:hover,
          .icon-button:active,
          .brand:hover .brand-symbol,
          .top-search-result:hover,
          .top-search-result:active,
          .notification-item:hover,
          .notification-item:active,
          .notification-delete:hover,
          .notification-delete:active,
          .notification-mark-all:hover,
          .notification-mark-all:active,
          .notification-footer button:hover,
          .notification-footer button:active,
          .system-indicator:hover,
          .profile-button:hover,
          .profile-button:active,
          .profile-menu-item:hover,
          .profile-menu-item:active {
            transform: none !important;
          }

        }


        /* =========================================
           PHASE 13.2 — TABLET
           ========================================= */

        @media (max-width: 1050px) and (min-width: 901px) {

          .top-nav {
            gap: 18px;
          }

          .brand {
            flex-shrink: 0;
          }

          .brand-symbol {
            width: 36px;
            height: 36px;
          }

          .brand h2 {
            font-size: 16px;
          }

          .brand span {
            font-size: 9px;
          }

          .top-navigation {
            gap: 4px;
          }

          .top-nav-link {
            padding: 7px 8px;
            font-size: 11px;
          }

          .top-actions {
            gap: 7px;
          }

          .icon-button {
            width: 34px;
            height: 34px;
          }

          .system-indicator {
            padding: 6px 8px;
            gap: 5px;
            font-size: 9px;
          }

          .profile-button {
            padding: 5px 6px;
          }

          .profile-avatar {
            width: 30px;
            height: 30px;
          }

        }


        @media (max-width: 900px) and (min-width: 769px) {

          .top-nav {
            gap: 14px;
          }

          .brand {
            min-width: auto;
            flex-shrink: 0;
          }

          .brand span {
            display: none;
          }

          .brand h2 {
            font-size: 16px;
          }

          .top-navigation {
            display: none;
          }

          .top-actions {
            margin-left: auto;
            gap: 8px;
          }

          .icon-button {
            width: 35px;
            height: 35px;
          }

          .system-indicator {
            padding: 6px 8px;
            font-size: 9px;
          }

          .profile-button {
            padding: 4px 5px;
          }

          .profile-avatar {
            width: 31px;
            height: 31px;
          }

          .profile-chevron {
            margin-left: 2px;
          }

          .top-search-panel {
            right: 0;
            width: 360px;
          }

          .notification-panel {
            right: -35px;
            width: 360px;
          }

        }


        /* =========================================
           MOBILE
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