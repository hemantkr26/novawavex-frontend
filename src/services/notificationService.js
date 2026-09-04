
import api from "./api";

/*
 * =========================================
 * NOTIFICATION SERVICE
 * =========================================
 *
 * Handles all notification API operations.
 *
 * The backend notification endpoints require
 * the authenticated user's ID as a request
 * parameter.
 *
 * We get the current user from:
 *
 * GET /api/users/me
 *
 * and use the returned ID automatically.
 */


/*
 * =========================================
 * GET CURRENT USER ID
 * =========================================
 */

const getCurrentUserId = async () => {

  const response = await api.get(
    "/api/users/me"
  );

  return response.data.id;
};


/*
 * =========================================
 * NOTIFICATION SERVICE
 * =========================================
 */

const notificationService = {


  /*
   * =========================================
   * GET ALL NOTIFICATIONS
   * =========================================
   */

  getAllNotifications: async () => {

    const userId =
      await getCurrentUserId();

    const response =
      await api.get(
        "/api/notifications",
        {
          params: {
            userId,
          },
        }
      );

    return response.data;
  },


  /*
   * =========================================
   * GET UNREAD NOTIFICATIONS
   * =========================================
   */

  getUnreadNotifications: async () => {

    const userId =
      await getCurrentUserId();

    const response =
      await api.get(
        "/api/notifications/unread",
        {
          params: {
            userId,
          },
        }
      );

    return response.data;
  },


  /*
   * =========================================
   * GET UNREAD COUNT
   * =========================================
   */

  getUnreadCount: async () => {

    const userId =
      await getCurrentUserId();

    const response =
      await api.get(
        "/api/notifications/unread-count",
        {
          params: {
            userId,
          },
        }
      );

    return response.data;
  },


  /*
   * =========================================
   * MARK ONE NOTIFICATION AS READ
   * =========================================
   */

  markAsRead: async (
    notificationId
  ) => {

    const response =
      await api.put(
        `/api/notifications/${notificationId}/read`
      );

    return response.data;
  },


  /*
   * =========================================
   * MARK ALL NOTIFICATIONS AS READ
   * =========================================
   */

  markAllAsRead: async () => {

    const userId =
      await getCurrentUserId();

    const response =
      await api.put(
        "/api/notifications/read-all",
        null,
        {
          params: {
            userId,
          },
        }
      );

    return response.data;
  },


  /*
   * =========================================
   * DELETE NOTIFICATION
   * =========================================
   */

  deleteNotification: async (
    notificationId
  ) => {

    const response =
      await api.delete(
        `/api/notifications/${notificationId}`
      );

    return response.data;
  },

};


export default notificationService;
