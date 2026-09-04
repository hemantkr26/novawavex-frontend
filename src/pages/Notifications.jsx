import { useEffect, useState } from "react";

import {
  Bell,
  CheckCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import notificationService from "../services/notificationService";


const Notifications = () => {

  const navigate = useNavigate();


  // =========================================
  // STATE
  // =========================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);


  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  const loadNotifications = async () => {

    try {

      setError(null);
      setLoading(true);

      const data =
        await notificationService
          .getAllNotifications();

      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);

      setError(
        "Unable to load notifications."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    loadNotifications();

  }, []);


  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.read === false
    ).length;


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
        <AlertCircle size={20} />
      );

    }


    if (
      priority === "WARNING" ||
      type.includes("CANCELLED")
    ) {

      return (
        <AlertTriangle size={20} />
      );

    }


    if (
      priority === "SUCCESS" ||
      type.includes("COMPLETED") ||
      type.includes("STARTED") ||
      type.includes("CREATED") ||
      type.includes("UPDATED") ||
      type.includes("DELETED")
    ) {

      return (
        <CheckCircle2 size={20} />
      );

    }


    return (
      <Info size={20} />
    );

  };


  // =========================================
  // NOTIFICATION CLASS
  // =========================================

  const getNotificationClass =
    (notification) => {

      const priority =
        String(
          notification.priority || ""
        ).toUpperCase();


      if (priority === "ERROR") {

        return "notifications-page-icon notifications-page-error";

      }


      if (priority === "WARNING") {

        return "notifications-page-icon notifications-page-warning";

      }


      if (priority === "SUCCESS") {

        return "notifications-page-icon notifications-page-success";

      }


      return "notifications-page-icon notifications-page-info";

    };


  // =========================================
  // FORMAT TIME
  // =========================================

  const formatNotificationTime =
    (timestamp) => {

      if (!timestamp) {

        return "Recently";

      }


      const date =
        new Date(timestamp);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

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

      try {

        if (
          notification.read === false
        ) {

          await notificationService
            .markAsRead(
              notification.id
            );


          setNotifications(
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  notification.id
                    ? {
                        ...item,
                        read: true,
                      }
                    : item
              )
          );

        }


        if (
          notification.workflowId
        ) {

          navigate(
            `/workflows/${notification.workflowId}`
          );

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

      if (unreadCount === 0) {

        return;

      }


      try {

        await notificationService
          .markAllAsRead();


        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            )
        );

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


      try {

        await notificationService
          .deleteNotification(
            notificationId
          );


        setNotifications(
          (previous) =>
            previous.filter(
              (notification) =>
                notification.id !==
                notificationId
            )
        );

      } catch (error) {

        console.error(
          "Failed to delete notification:",
          error
        );

      }

    };


  // =========================================
  // BACK
  // =========================================

  const handleBack = () => {

    navigate(-1);

  };


  // =========================================
  // RENDER
  // =========================================

  return (

    <div className="notifications-page">

      {/* =========================================
          HEADER
          ========================================= */}

      <div className="notifications-page-header">

        <div className="notifications-page-heading">

          <button
            type="button"
            className="notifications-page-back"
            onClick={handleBack}
            title="Go back"
            aria-label="Go back"
          >

            <ArrowLeft size={18} />

          </button>


          <div className="notifications-page-title-icon">

            <Bell size={22} />

          </div>


          <div>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with your workflow activity.
            </p>

          </div>

        </div>


        <div className="notifications-page-actions">

          <button
            type="button"
            className="notifications-page-refresh"
            onClick={loadNotifications}
            disabled={loading}
            title="Refresh notifications"
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "notifications-refresh-spinning"
                  : ""
              }
            />

            Refresh

          </button>


          <button
            type="button"
            className="notifications-page-mark-all"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >

            <CheckCheck size={16} />

            Mark all as read

          </button>

        </div>

      </div>


      {/* =========================================
          SUMMARY
          ========================================= */}

      <div className="notifications-page-summary">

        <div className="notifications-summary-card">

          <div className="notifications-summary-icon">

            <Bell size={19} />

          </div>


          <div>

            <strong>
              {notifications.length}
            </strong>

            <span>
              Total notifications
            </span>

          </div>

        </div>


        <div className="notifications-summary-card">

          <div className="notifications-summary-icon unread-summary-icon">

            <div className="notifications-summary-dot"></div>

          </div>


          <div>

            <strong>
              {unreadCount}
            </strong>

            <span>
              Unread notifications
            </span>

          </div>

        </div>

      </div>


      {/* =========================================
          CONTENT
          ========================================= */}

      <div className="notifications-page-content">

        {loading && (

          <div className="notifications-page-message">

            <div className="notifications-page-spinner"></div>

            <strong>
              Loading notifications...
            </strong>

          </div>

        )}


        {!loading && error && (

          <div className="notifications-page-message notifications-page-error-message">

            <AlertCircle size={20} />

            <strong>
              {error}
            </strong>

            <button
              type="button"
              onClick={loadNotifications}
            >
              Try again
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          notifications.length === 0 && (

            <div className="notifications-page-empty">

              <Bell size={42} />

              <h2>
                No notifications
              </h2>

              <p>
                You're all caught up.
              </p>

            </div>

          )}


        {!loading &&
          !error &&
          notifications.length > 0 && (

            <div className="notifications-page-list">

              {notifications.map(
                (notification) => (

                  <div
                    key={
                      notification.id
                    }
                    className={
                      notification.read
                        ? "notifications-page-item"
                        : "notifications-page-item notifications-page-item-unread"
                    }
                    onClick={() =>
                      handleNotificationOpen(
                        notification
                      )
                    }
                  >

                    {/* Unread indicator */}

                    {!notification.read && (

                      <span className="notifications-page-unread-dot"></span>

                    )}


                    {/* Icon */}

                    <div
                      className={getNotificationClass(
                        notification
                      )}
                    >

                      {getNotificationIcon(
                        notification
                      )}

                    </div>


                    {/* Content */}

                    <div className="notifications-page-item-content">

                      <div className="notifications-page-item-top">

                        <strong>
                          {notification.title ||
                            "Notification"}
                        </strong>

                        <span>
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </span>

                      </div>


                      <div className="notifications-page-workflow">

                        {notification.workflowName ||
                          notification.workflow?.name ||
                          "NovaWavex"}

                      </div>


                      <p>
                        {notification.message ||
                          "No message"}
                      </p>


                      <div className="notifications-page-meta">

                        <span>
                          {notification.type ||
                            "NOTIFICATION"}
                        </span>

                        <span>
                          {notification.priority ||
                            "INFO"}
                        </span>

                        {notification.workflowId && (

                          <span>
                            Workflow #
                            {notification.workflowId}
                          </span>

                        )}

                      </div>

                    </div>


                    {/* Delete */}

                    <button
                      type="button"
                      className="notifications-page-delete"
                      onClick={(event) =>
                        handleDeleteNotification(
                          event,
                          notification.id
                        )
                      }
                      title="Delete notification"
                      aria-label="Delete notification"
                    >

                      <Trash2 size={17} />

                    </button>

                  </div>

                )
              )}

            </div>

          )}

      </div>


      {/* =========================================
          PAGE STYLES
          ========================================= */}

      <style>{`

        /* =========================================
           MAIN PAGE
           ========================================= */

        .notifications-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 30px;
          box-sizing: border-box;
        }


        /* =========================================
           HEADER
           ========================================= */

        .notifications-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }


        .notifications-page-heading {
          display: flex;
          align-items: center;
          gap: 14px;
        }


        .notifications-page-back {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid #d7dce5;
          border-radius: 9px;

          color: #263247;
          background: #ffffff;

          cursor: pointer;
          transition: 0.15s ease;
        }


        .notifications-page-back:hover {
          color: #111827;
          background: #f1f4f8;
          border-color: #c5ccd8;
        }


        .notifications-page-title-icon {
          width: 46px;
          height: 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          color: #315fc5;
          background: #e8efff;
          border: 1px solid #d5e2ff;
        }


        .notifications-page-heading h1 {
          margin: 0;

          color: #111827;

          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }


        .notifications-page-heading p {
          margin: 4px 0 0;

          color: #4b5563;

          font-size: 12px;
          font-weight: 600;
        }


        /* =========================================
           ACTIONS
           ========================================= */

        .notifications-page-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }


        .notifications-page-refresh,
        .notifications-page-mark-all {

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          padding: 10px 13px;

          border: 1px solid #d5dbe5;
          border-radius: 8px;

          color: #1f2937;
          background: #ffffff;

          font-size: 11px;
          font-weight: 750;

          cursor: pointer;
          transition: 0.15s ease;
        }


        .notifications-page-refresh:hover:not(:disabled),
        .notifications-page-mark-all:hover:not(:disabled) {

          color: #111827;
          background: #f1f4f8;
          border-color: #c3cad6;
        }


        .notifications-page-mark-all {

          color: #244ea5;
          border-color: #c7d6fa;
          background: #edf3ff;
        }


        .notifications-page-mark-all:hover:not(:disabled) {

          color: #173b85;
          background: #e1ebff;
        }


        .notifications-page-refresh:disabled,
        .notifications-page-mark-all:disabled {

          opacity: 0.45;
          cursor: not-allowed;
        }


        /* =========================================
           SUMMARY
           ========================================= */

        .notifications-page-summary {

          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 15px;

          margin-bottom: 18px;
        }


        .notifications-summary-card {

          display: flex;
          align-items: center;
          gap: 13px;

          padding: 17px;

          border: 1px solid #d9dee7;
          border-radius: 12px;

          background: #ffffff;

          box-shadow:
            0 4px 14px rgba(15, 23, 42, 0.06);
        }


        .notifications-summary-icon {

          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #315fc5;
          background: #eaf1ff;
        }


        .unread-summary-icon {

          color: #1f56c7;
          background: #e8f0ff;
        }


        .notifications-summary-card > div:last-child {

          display: flex;
          flex-direction: column;
          gap: 3px;
        }


        .notifications-summary-card strong {

          color: #111827;

          font-size: 19px;
          font-weight: 850;
        }


        .notifications-summary-card span {

          color: #374151;

          font-size: 10px;
          font-weight: 700;
        }


        .notifications-summary-dot {

          width: 10px;
          height: 10px;

          border-radius: 50%;

          background: #315fc5;

          box-shadow:
            0 0 8px rgba(49, 95, 197, 0.35);
        }


        /* =========================================
           CONTENT CONTAINER
           ========================================= */

        .notifications-page-content {

          border: 1px solid #d7dce5;
          border-radius: 14px;

          overflow: hidden;

          background: #f8fafc;

          box-shadow:
            0 8px 25px rgba(15, 23, 42, 0.07);
        }


        /* =========================================
           LIST
           ========================================= */

        .notifications-page-list {
          padding: 9px;
        }


        .notifications-page-item {

          position: relative;

          display: flex;
          align-items: flex-start;

          gap: 15px;

          padding: 18px;

          margin-bottom: 7px;

          border: 1px solid #e1e5eb;
          border-radius: 11px;

          background: #ffffff;

          cursor: pointer;

          box-shadow:
            0 2px 7px rgba(15, 23, 42, 0.04);

          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }


        .notifications-page-item:last-child {
          margin-bottom: 0;
        }


        .notifications-page-item:hover {

          background: #f8fafc;

          border-color: #cbd3df;

          transform: translateY(-1px);

          box-shadow:
            0 5px 15px rgba(15, 23, 42, 0.08);
        }


        /* =========================================
           UNREAD
           ========================================= */

        .notifications-page-item-unread {

          background: #f0f5ff;

          border-color: #c9d8f5;

          box-shadow:
            0 3px 10px rgba(49, 95, 197, 0.08);
        }


        .notifications-page-item-unread:hover {

          background: #e9f1ff;

          border-color: #b8caee;
        }


        .notifications-page-unread-dot {

          position: absolute;

          top: 22px;
          left: 8px;

          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #2459c2;

          box-shadow:
            0 0 7px rgba(36, 89, 194, 0.4);
        }


        /* =========================================
           ICONS
           ========================================= */

        .notifications-page-icon {

          flex-shrink: 0;

          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;
        }


        .notifications-page-success {

          color: #147a45;

          background: #e8f7ee;

          border: 1px solid #c8ecd8;
        }


        .notifications-page-warning {

          color: #956800;

          background: #fff7df;

          border: 1px solid #f2df9f;
        }


        .notifications-page-error {

          color: #b42318;

          background: #ffebe9;

          border: 1px solid #f5c7c3;
        }


        .notifications-page-info {

          color: #2459b8;

          background: #eaf1ff;

          border: 1px solid #cfddfa;
        }


        /* =========================================
           CONTENT
           ========================================= */

        .notifications-page-item-content {

          min-width: 0;

          flex: 1;
        }


        .notifications-page-item-top {

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;
        }


        .notifications-page-item-top strong {

          color: #111827;

          font-size: 14px;
          font-weight: 850;

          letter-spacing: -0.1px;
        }


        .notifications-page-item-top span {

          flex-shrink: 0;

          color: #374151;

          font-size: 10px;
          font-weight: 750;
        }


        .notifications-page-workflow {

          margin-top: 5px;

          color: #1f2937;

          font-size: 12px;
          font-weight: 800;
        }


        .notifications-page-item-content p {

          margin: 7px 0 10px;

          color: #374151;

          font-size: 12px;
          font-weight: 600;

          line-height: 1.55;
        }


        /* =========================================
           META
           ========================================= */

        .notifications-page-meta {

          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }


        .notifications-page-meta span {

          padding: 5px 8px;

          border: 1px solid #d9dee7;
          border-radius: 5px;

          color: #374151;

          background: #f3f5f8;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 0.25px;
        }


        /* =========================================
           DELETE
           ========================================= */

        .notifications-page-delete {

          flex-shrink: 0;

          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border: 1px solid transparent;
          border-radius: 8px;

          color: #4b5563;
          background: transparent;

          cursor: pointer;

          opacity: 0;

          transition: 0.15s ease;
        }


        .notifications-page-item:hover
        .notifications-page-delete {

          opacity: 1;
        }


        .notifications-page-delete:hover {

          color: #b42318;

          background: #ffebe9;

          border-color: #f5c7c3;
        }


        /* =========================================
           MESSAGES
           ========================================= */

        .notifications-page-message {

          min-height: 280px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-direction: column;

          gap: 10px;

          color: #374151;

          font-size: 13px;
        }


        .notifications-page-message strong {

          color: #1f2937;

          font-size: 13px;
          font-weight: 750;
        }


        .notifications-page-error-message {

          color: #b42318;
        }


        .notifications-page-error-message strong {

          color: #991b1b;
        }


        .notifications-page-error-message button {

          margin-top: 4px;

          padding: 8px 13px;

          border: 1px solid #d1d5db;
          border-radius: 7px;

          color: #1f2937;

          background: #ffffff;

          font-size: 11px;
          font-weight: 750;

          cursor: pointer;
        }


        .notifications-page-error-message button:hover {

          background: #f3f4f6;
        }


        /* =========================================
           SPINNER
           ========================================= */

        .notifications-page-spinner {

          width: 22px;
          height: 22px;

          border: 3px solid #dbe2ec;

          border-top-color: #315fc5;

          border-radius: 50%;

          animation:
            notifications-page-spin
            0.8s
            linear
            infinite;
        }


        /* =========================================
           EMPTY STATE
           ========================================= */

        .notifications-page-empty {

          min-height: 340px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-direction: column;

          gap: 9px;

          color: #64748b;
        }


        .notifications-page-empty svg {

          color: #64748b;

          margin-bottom: 5px;
        }


        .notifications-page-empty h2 {

          margin: 5px 0 0;

          color: #1f2937;

          font-size: 17px;
          font-weight: 850;
        }


        .notifications-page-empty p {

          margin: 0;

          color: #4b5563;

          font-size: 12px;
          font-weight: 600;
        }


        /* =========================================
           ANIMATION
           ========================================= */

        @keyframes notifications-page-spin {

          to {
            transform: rotate(360deg);
          }

        }


        /* =========================================
           RESPONSIVE
           ========================================= */

        @media (max-width: 700px) {

          .notifications-page {

            padding: 18px;

          }


          .notifications-page-header {

            align-items: flex-start;

            flex-direction: column;

          }


          .notifications-page-actions {

            width: 100%;

          }


          .notifications-page-refresh,
          .notifications-page-mark-all {

            flex: 1;

          }


          .notifications-page-summary {

            grid-template-columns: 1fr;

          }


          .notifications-page-item {

            padding: 14px;

          }


          .notifications-page-item-top {

            align-items: flex-start;

            flex-direction: column;

            gap: 4px;

          }

        }

      `}</style>

    </div>

  );

};


export default Notifications;