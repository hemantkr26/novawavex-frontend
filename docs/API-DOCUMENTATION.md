# NovaWavex API Documentation

> Professional REST API documentation for the NovaWavex Java Full Stack Workflow Platform.

---

## 1. Overview

NovaWavex provides a RESTful backend API for managing:

* User authentication
* User registration and profiles
* Password management
* User administration
* Workflow creation and management
* Workflow ownership
* Notifications
* Workflow-related status and activity information

The backend is built using:

* **Java 26**
* **Spring Boot 4.1.0**
* **Spring Security**
* **JWT Authentication**
* **Spring Data JPA / Hibernate**
* **PostgreSQL**
* **Bean Validation**
* **Spring Boot Actuator**

---

## 2. Base URLs

### Local Development

```text
http://localhost:8080
```

### Production

```text
https://novawavex-backend.onrender.com
```

All endpoint paths shown in this document are relative to the selected base URL.

For example:

```text
POST https://novawavex-backend.onrender.com/api/auth/login
```

---

# 3. Authentication

NovaWavex uses **JWT (JSON Web Token)** authentication.

After successful login, the API returns a JWT token.

For protected endpoints, send the token using the HTTP `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Example

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Public endpoints

The following authentication endpoints do not require an existing JWT:

* `POST /api/auth/login`
* `POST /api/auth/register`
* `POST /api/auth/forgot-password`
* `POST /api/auth/reset-password`

### Authenticated endpoints

The following require authentication:

* `POST /api/auth/change-password`
* User profile endpoints
* Workflow endpoints

### Admin endpoints

The following user-management operations are restricted to administrators:

* `GET /api/users`
* `GET /api/users/{id}`
* `PUT /api/users/{id}/role`
* `PUT /api/users/{id}/status`
* `DELETE /api/users/{id}`

---

# 4. API Endpoint Summary

NovaWavex currently exposes **26 REST API endpoints**.

| Module          | Endpoints |
| --------------- | --------: |
| Authentication  |         5 |
| User Management |        10 |
| Workflows       |         5 |
| Notifications   |         6 |
| **Total**       |    **26** |

---

# 5. Authentication API

Base path:

```text
/api/auth
```

---

## 5.1 Login

Authenticates a user and returns a JWT token.

### Endpoint

```http
POST /api/auth/login
```

### Authentication

**Public**

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Request Fields

| Field      | Type   | Required | Validation                          |
| ---------- | ------ | -------- | ----------------------------------- |
| `email`    | String | Yes      | Valid email, maximum 150 characters |
| `password` | String | Yes      | 8–100 characters                    |

### Successful Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer"
}
```

### Response Fields

| Field       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `token`     | String | JWT authentication token |
| `tokenType` | String | Token type               |

---

## 5.2 Register

Creates a new user account.

### Endpoint

```http
POST /api/auth/register
```

### Authentication

**Public**

### Request Body

```json
{
  "fullName": "Hemant Kumar",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "profileImage": "https://example.com/profile.jpg"
}
```

### Request Fields

| Field             | Type   | Required | Validation                          |
| ----------------- | ------ | -------- | ----------------------------------- |
| `fullName`        | String | Yes      | 2–100 characters                    |
| `email`           | String | Yes      | Valid email, maximum 150 characters |
| `password`        | String | Yes      | 8–100 characters                    |
| `confirmPassword` | String | Yes      | Required                            |
| `profileImage`    | String | No       | Optional                            |

### Successful Response

```json
{
  "id": 1,
  "fullName": "Hemant Kumar",
  "email": "user@example.com",
  "role": "USER",
  "profileImage": "https://example.com/profile.jpg"
}
```

### Response Fields

| Field          | Type   | Description          |
| -------------- | ------ | -------------------- |
| `id`           | Long   | User ID              |
| `fullName`     | String | User's full name     |
| `email`        | String | User's email address |
| `role`         | String | Assigned user role   |
| `profileImage` | String | Profile image value  |

---

## 5.3 Change Password

Changes the password of the currently authenticated user.

### Endpoint

```http
POST /api/auth/change-password
```

### Authentication

**JWT required**

### Request Body

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Request Fields

| Field             | Type   | Required | Validation           |
| ----------------- | ------ | -------- | -------------------- |
| `currentPassword` | String | Yes      | Required             |
| `newPassword`     | String | Yes      | Minimum 8 characters |
| `confirmPassword` | String | Yes      | Required             |

### Successful Response

```text
Password changed successfully.
```

---

## 5.4 Forgot Password

Starts the password-reset process for a user's email address.

### Endpoint

```http
POST /api/auth/forgot-password
```

### Authentication

**Public**

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Request Fields

| Field   | Type   | Required | Validation         |
| ------- | ------ | -------- | ------------------ |
| `email` | String | Yes      | Valid email format |

### Successful Response

```json
{
  "message": "Password reset instructions have been sent."
}
```

### Response Fields

| Field     | Type   | Description           |
| --------- | ------ | --------------------- |
| `message` | String | Result/status message |

> The exact message is generated by the backend and may vary depending on the result of the password-reset operation.

---

## 5.5 Reset Password

Resets a user's password using a valid reset token.

### Endpoint

```http
POST /api/auth/reset-password
```

### Authentication

**Public**

### Request Body

```json
{
  "resetToken": "reset-token-value",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Request Fields

| Field             | Type   | Required | Validation           |
| ----------------- | ------ | -------- | -------------------- |
| `resetToken`      | String | Yes      | Required             |
| `newPassword`     | String | Yes      | Minimum 8 characters |
| `confirmPassword` | String | Yes      | Required             |

### Successful Response

```json
{
  "message": "Password reset successfully."
}
```

### Response Fields

| Field     | Type   | Description           |
| --------- | ------ | --------------------- |
| `message` | String | Result/status message |

---

# 6. User API

Base path:

```text
/api/users
```

The user controller uses JWT bearer authentication.

---

## 6.1 Create User

Creates a new user.

### Endpoint

```http
POST /api/users
```

### Authentication

**JWT required**

### Authorization

**Admin**

### Request Body

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Request Fields

| Field      | Type   | Required | Validation                          |
| ---------- | ------ | -------- | ----------------------------------- |
| `fullName` | String | Yes      | Maximum 100 characters              |
| `email`    | String | Yes      | Valid email, maximum 150 characters |
| `password` | String | Yes      | 8–100 characters                    |

### Response

Returns a `UserResponse`.

```json
{
  "id": 2,
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "profileImage": null,
  "enabled": true
}
```

---

## 6.2 Get All Users

Returns all users.

### Endpoint

```http
GET /api/users
```

### Authentication

**JWT required**

### Authorization

**Admin**

### Response

Returns a list of `UserResponse` objects.

```json
[
  {
    "id": 1,
    "fullName": "Hemant Kumar",
    "email": "user@example.com",
    "role": "ADMIN",
    "profileImage": null,
    "enabled": true
  }
]
```

---

## 6.3 Get Current User

Returns the currently authenticated user's information.

### Endpoint

```http
GET /api/users/me
```

### Authentication

**JWT required**

### Response

```json
{
  "id": 1,
  "fullName": "Hemant Kumar",
  "email": "user@example.com",
  "role": "USER",
  "profileImage": null,
  "enabled": true
}
```

---

## 6.4 Update Profile Name

Updates the full name of the currently authenticated user.

### Endpoint

```http
PUT /api/users/me/name
```

### Authentication

**JWT required**

### Request Body

```json
{
  "fullName": "Hemant Kumar"
}
```

### Request Fields

| Field      | Type   | Required | Validation       |
| ---------- | ------ | -------- | ---------------- |
| `fullName` | String | Yes      | 2–100 characters |

### Response

Returns the updated user information.

---

## 6.5 Update Profile Image

Updates the profile image of the currently authenticated user.

### Endpoint

```http
PUT /api/users/me/profile-image
```

### Authentication

**JWT required**

### Request Body

```json
{
  "profileImage": "https://example.com/profile.jpg"
}
```

### Request Fields

| Field          | Type   | Required | Validation      |
| -------------- | ------ | -------- | --------------- |
| `profileImage` | String | Yes      | Cannot be blank |

### Response

Returns the updated user information.

---

## 6.6 Delete Current User Account

Deletes the currently authenticated user's account.

### Endpoint

```http
DELETE /api/users/me
```

### Authentication

**JWT required**

### Response

The operation deletes the authenticated user's account.

---

## 6.7 Get User By ID

Retrieves a specific user by ID.

### Endpoint

```http
GET /api/users/{id}
```

### Authentication

**JWT required**

### Authorization

**Admin**

### Path Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | Long | Yes      | User ID     |

### Example

```http
GET /api/users/2
```

### Response

Returns a `UserResponse`.

---

## 6.8 Update User Role

Updates the role of a user.

### Endpoint

```http
PUT /api/users/{id}/role
```

### Authentication

**JWT required**

### Authorization

**Admin**

### Path Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | Long | Yes      | User ID     |

### Request Body

```json
{
  "role": "ADMIN"
}
```

### Request Fields

| Field  | Type   | Required |
| ------ | ------ | -------- |
| `role` | String | Yes      |

### Response

Returns the updated user information.

---

## 6.9 Update User Account Status

Enables or disables a user account.

### Endpoint

```http
PUT /api/users/{id}/status
```

### Authentication

**JWT required**

### Authorization

**Admin**

### Path Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | Long | Yes      | User ID     |

### Request Body

```json
{
  "enabled": true
}
```

### Request Fields

| Field     | Type    | Required | Description                    |
| --------- | ------- | -------- | ------------------------------ |
| `enabled` | Boolean | Yes      | Account enabled/disabled state |

### Response

Returns the updated user information.

---

## 6.10 Delete User

Deletes a user by ID.

### Endpoint

```http
DELETE /api/users/{id}
```

### Authentication

**JWT required**

### Authorization

**Admin**

### Path Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | Long | Yes      | User ID     |

### Response

The specified user is deleted.

---

# 7. Workflow API

Base path:

```text
/api/workflows
```

All workflow endpoints require JWT authentication.

Workflow operations are associated with the authenticated user's email.

---

## 7.1 Create Workflow

Creates a new workflow.

### Endpoint

```http
POST /api/workflows
```

### Authentication

**JWT required**

### Request Body

```json
{
  "name": "Order Processing",
  "description": "Process customer orders",
  "status": "DRAFT"
}
```

### Request Fields

| Field         | Type           | Required | Validation                 |
| ------------- | -------------- | -------- | -------------------------- |
| `name`        | String         | Yes      | Maximum 150 characters     |
| `description` | String         | No       | Maximum 1000 characters    |
| `status`      | WorkflowStatus | Yes      | Must be a valid enum value |

### Workflow Status Values

```text
DRAFT
ACTIVE
COMPLETED
CANCELLED
```

### Successful Response

```json
{
  "id": 1,
  "name": "Order Processing",
  "description": "Process customer orders",
  "status": "DRAFT",
  "createdBy": "user@example.com",
  "createdAt": "2026-09-10T10:30:00",
  "updatedAt": "2026-09-10T10:30:00"
}
```

### Response Fields

| Field         | Type           | Description                 |
| ------------- | -------------- | --------------------------- |
| `id`          | Long           | Workflow ID                 |
| `name`        | String         | Workflow name               |
| `description` | String         | Workflow description        |
| `status`      | WorkflowStatus | Current workflow status     |
| `createdBy`   | String         | Email of the workflow owner |
| `createdAt`   | LocalDateTime  | Creation timestamp          |
| `updatedAt`   | LocalDateTime  | Last update timestamp       |

---

## 7.2 Get All Workflows

Returns workflows available to the authenticated user.

### Endpoint

```http
GET /api/workflows
```

### Authentication

**JWT required**

### Response

Returns a list of `WorkflowResponse` objects.

```json
[
  {
    "id": 1,
    "name": "Order Processing",
    "description": "Process customer orders",
    "status": "ACTIVE",
    "createdBy": "user@example.com",
    "createdAt": "2026-09-10T10:30:00",
    "updatedAt": "2026-09-10T11:00:00"
  }
]
```

---

## 7.3 Get Workflow By ID

Retrieves a specific workflow.

### Endpoint

```http
GET /api/workflows/{id}
```

### Authentication

**JWT required**

### Path Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | Long | Yes      | Workflow ID |

### Example

```http
GET /api/workflows/1
```

### Response

Returns a `WorkflowResponse`.

---

## 7.4 Update Workflow

Updates an existing workflow.

### Endpoint

```http
PUT /api/workflows/{id}
```

### Authentication

**JWT required**

### Path Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | Long | Yes      | Workflow ID |

### Request Body

```json
{
  "name": "Updated Order Processing",
  "description": "Updated workflow description",
  "status": "ACTIVE"
}
```

### Request Fields

| Field         | Type           | Required | Validation              |
| ------------- | -------------- | -------- | ----------------------- |
| `name`        | String         | Yes      | Maximum 150 characters  |
| `description` | String         | No       | Maximum 1000 characters |
| `status`      | WorkflowStatus | Yes      | Valid enum value        |

### Response

Returns the updated `WorkflowResponse`.

---

## 7.5 Delete Workflow

Deletes an existing workflow.

### Endpoint

```http
DELETE /api/workflows/{id}
```

### Authentication

**JWT required**

### Path Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | Long | Yes      | Workflow ID |

### Successful Response

```http
204 No Content
```

No response body is returned when the deletion succeeds.

---

# 8. Notification API

Base path:

```text
/api/notifications
```

Notifications can optionally be associated with a workflow.

> **Security note:** The `NotificationController` does not declare a controller-level `@SecurityRequirement`. Actual access to these endpoints is therefore determined by the application's Spring Security configuration.

---

## 8.1 Get User Notifications

Returns notifications associated with a user.

### Endpoint

```http
GET /api/notifications?userId={userId}
```

### Query Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId`  | Long | Yes      | User ID     |

### Example

```http
GET /api/notifications?userId=1
```

### Response

```json
[
  {
    "id": 1,
    "title": "Workflow Created",
    "message": "A new workflow was created.",
    "type": "WORKFLOW_CREATED",
    "priority": "INFO",
    "read": false,
    "createdAt": "2026-09-10T10:30:00",
    "workflowId": 5,
    "workflowName": "Order Processing"
  }
]
```

---

## 8.2 Get Unread Notifications

Returns unread notifications for a user.

### Endpoint

```http
GET /api/notifications/unread?userId={userId}
```

### Query Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId`  | Long | Yes      | User ID     |

### Response

Returns a list of `NotificationResponse` objects.

---

## 8.3 Get Unread Notification Count

Returns the number of unread notifications for a user.

### Endpoint

```http
GET /api/notifications/unread-count?userId={userId}
```

### Query Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId`  | Long | Yes      | User ID     |

### Response

Returns the unread notification count.

---

## 8.4 Mark Notification As Read

Marks a specific notification as read.

### Endpoint

```http
PUT /api/notifications/{notificationId}/read
```

### Path Parameter

| Parameter        | Type | Required | Description     |
| ---------------- | ---- | -------- | --------------- |
| `notificationId` | Long | Yes      | Notification ID |

### Example

```http
PUT /api/notifications/15/read
```

### Response

The specified notification is marked as read.

---

## 8.5 Mark All Notifications As Read

Marks all notifications belonging to a user as read.

### Endpoint

```http
PUT /api/notifications/read-all?userId={userId}
```

### Query Parameter

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId`  | Long | Yes      | User ID     |

### Example

```http
PUT /api/notifications/read-all?userId=1
```

### Response

The user's notifications are marked as read.

---

## 8.6 Delete Notification

Deletes a specific notification.

### Endpoint

```http
DELETE /api/notifications/{notificationId}
```

### Path Parameter

| Parameter        | Type | Required | Description     |
| ---------------- | ---- | -------- | --------------- |
| `notificationId` | Long | Yes      | Notification ID |

### Example

```http
DELETE /api/notifications/15
```

### Response

The specified notification is deleted.

---

# 9. Notification Data Model

Notification responses contain the following fields:

| Field          | Type                 | Description                            |
| -------------- | -------------------- | -------------------------------------- |
| `id`           | Long                 | Notification ID                        |
| `title`        | String               | Notification title                     |
| `message`      | String               | Notification message                   |
| `type`         | NotificationType     | Notification category                  |
| `priority`     | NotificationPriority | Notification priority                  |
| `read`         | Boolean              | Whether the notification has been read |
| `createdAt`    | LocalDateTime        | Notification creation time             |
| `workflowId`   | Long                 | Associated workflow ID, if available   |
| `workflowName` | String               | Associated workflow name, if available |

`workflowId` and `workflowName` may be `null` when a notification is not associated with a workflow.

---

# 10. Notification Types

The API supports the following notification types:

| Value                | Description                 |
| -------------------- | --------------------------- |
| `WORKFLOW_CREATED`   | Workflow creation event     |
| `WORKFLOW_UPDATED`   | Workflow update event       |
| `WORKFLOW_COMPLETED` | Workflow completion event   |
| `WORKFLOW_FAILED`    | Workflow failure event      |
| `WORKFLOW_DELETED`   | Workflow deletion event     |
| `WORKFLOW_STARTED`   | Workflow start event        |
| `WORKFLOW_CANCELLED` | Workflow cancellation event |
| `WORKFLOW_RETRIED`   | Workflow retry event        |
| `SYSTEM_ALERT`       | General system alert        |
| `SECURITY_ALERT`     | Security-related alert      |

---

# 11. Notification Priorities

The API supports four notification priority values:

```text
INFO
SUCCESS
WARNING
ERROR
```

| Value     | Purpose                       |
| --------- | ----------------------------- |
| `INFO`    | Informational notification    |
| `SUCCESS` | Successful operation          |
| `WARNING` | Warning or attention required |
| `ERROR`   | Error or failure notification |

---

# 12. Workflow Status Values

Workflows support four statuses:

```text
DRAFT
ACTIVE
COMPLETED
CANCELLED
```

| Value       | Description                 |
| ----------- | --------------------------- |
| `DRAFT`     | Workflow is being prepared  |
| `ACTIVE`    | Workflow is active          |
| `COMPLETED` | Workflow has completed      |
| `CANCELLED` | Workflow has been cancelled |

---

# 13. Common HTTP Methods

NovaWavex follows standard REST conventions:

| HTTP Method | Typical Purpose                |
| ----------- | ------------------------------ |
| `GET`       | Retrieve data                  |
| `POST`      | Create or execute an operation |
| `PUT`       | Update an existing resource    |
| `DELETE`    | Delete a resource              |

---

# 14. Common HTTP Status Codes

The API may return standard HTTP status codes depending on the operation and validation/security result.

| Status Code                 | Meaning                                        |
| --------------------------- | ---------------------------------------------- |
| `200 OK`                    | Request completed successfully                 |
| `201 Created`               | Resource successfully created                  |
| `204 No Content`            | Request succeeded without a response body      |
| `400 Bad Request`           | Invalid request or validation failure          |
| `401 Unauthorized`          | Authentication is missing or invalid           |
| `403 Forbidden`             | Authenticated user does not have permission    |
| `404 Not Found`             | Requested resource does not exist              |
| `409 Conflict`              | Request conflicts with existing resource/state |
| `500 Internal Server Error` | Unexpected server-side error                   |

> Exact error response structures are handled by the backend's exception-handling layer and may vary by error condition.

---

# 15. Validation

NovaWavex uses Jakarta Bean Validation for request validation.

Examples include:

### Required Fields

```java
@NotBlank
```

Used for fields such as:

* Email
* Password
* Full name
* Reset token
* Profile image

### Email Validation

```java
@Email
```

Used for email fields.

### Length Validation

```java
@Size
```

Used to enforce minimum and maximum string lengths.

### Required Enum Values

```java
@NotNull
```

Used for the workflow status.

Invalid requests may result in a `400 Bad Request` response.

---

# 16. User Response Model

The standard user response is:

```json
{
  "id": 1,
  "fullName": "Hemant Kumar",
  "email": "user@example.com",
  "role": "USER",
  "profileImage": null,
  "enabled": true
}
```

### Fields

| Field          | Type    |
| -------------- | ------- |
| `id`           | Long    |
| `fullName`     | String  |
| `email`        | String  |
| `role`         | String  |
| `profileImage` | String  |
| `enabled`      | Boolean |

---

# 17. Workflow Response Model

The standard workflow response is:

```json
{
  "id": 1,
  "name": "Order Processing",
  "description": "Process customer orders",
  "status": "ACTIVE",
  "createdBy": "user@example.com",
  "createdAt": "2026-09-10T10:30:00",
  "updatedAt": "2026-09-10T11:00:00"
}
```

### Fields

| Field         | Type           |
| ------------- | -------------- |
| `id`          | Long           |
| `name`        | String         |
| `description` | String         |
| `status`      | WorkflowStatus |
| `createdBy`   | String         |
| `createdAt`   | LocalDateTime  |
| `updatedAt`   | LocalDateTime  |

---

# 18. API Usage Example

A typical authenticated workflow looks like this:

### Step 1 — Register

```http
POST /api/auth/register
```

Create the user account.

### Step 2 — Login

```http
POST /api/auth/login
```

Receive the JWT token.

### Step 3 — Store the JWT

The frontend stores the authentication token and sends it with protected requests.

```http
Authorization: Bearer <JWT_TOKEN>
```

### Step 4 — Retrieve Profile

```http
GET /api/users/me
```

### Step 5 — Create Workflow

```http
POST /api/workflows
```

### Step 6 — Retrieve Workflows

```http
GET /api/workflows
```

### Step 7 — Update Workflow

```http
PUT /api/workflows/{id}
```

### Step 8 — Delete Workflow

```http
DELETE /api/workflows/{id}
```

---

# 19. Security Considerations

NovaWavex uses several security mechanisms:

* JWT-based authentication
* Protected API endpoints
* Role-based authorization for administrative user operations
* Password validation
* Password reset tokens
* Authenticated workflow ownership
* CORS configuration
* Environment-based configuration
* Password hashing on the backend
* No authentication credentials should be committed to source control

### JWT Header

Protected API requests should include:

```http
Authorization: Bearer <JWT_TOKEN>
```

Never expose or commit the application's JWT secret.

---

# 20. API Endpoint Reference

| Method | Endpoint                                          | Authentication            | Access        |
| ------ | ------------------------------------------------- | ------------------------- | ------------- |
| POST   | `/api/auth/login`                                 | No                        | Public        |
| POST   | `/api/auth/register`                              | No                        | Public        |
| POST   | `/api/auth/change-password`                       | JWT                       | User          |
| POST   | `/api/auth/forgot-password`                       | No                        | Public        |
| POST   | `/api/auth/reset-password`                        | No                        | Public        |
| POST   | `/api/users`                                      | JWT                       | Admin         |
| GET    | `/api/users`                                      | JWT                       | Admin         |
| GET    | `/api/users/me`                                   | JWT                       | Authenticated |
| PUT    | `/api/users/me/name`                              | JWT                       | Authenticated |
| PUT    | `/api/users/me/profile-image`                     | JWT                       | Authenticated |
| DELETE | `/api/users/me`                                   | JWT                       | Authenticated |
| GET    | `/api/users/{id}`                                 | JWT                       | Admin         |
| PUT    | `/api/users/{id}/role`                            | JWT                       | Admin         |
| PUT    | `/api/users/{id}/status`                          | JWT                       | Admin         |
| DELETE | `/api/users/{id}`                                 | JWT                       | Admin         |
| POST   | `/api/workflows`                                  | JWT                       | Authenticated |
| GET    | `/api/workflows`                                  | JWT                       | Authenticated |
| GET    | `/api/workflows/{id}`                             | JWT                       | Authenticated |
| PUT    | `/api/workflows/{id}`                             | JWT                       | Authenticated |
| DELETE | `/api/workflows/{id}`                             | JWT                       | Authenticated |
| GET    | `/api/notifications?userId={userId}`              | Security-config dependent | User          |
| GET    | `/api/notifications/unread?userId={userId}`       | Security-config dependent | User          |
| GET    | `/api/notifications/unread-count?userId={userId}` | Security-config dependent | User          |
| PUT    | `/api/notifications/{notificationId}/read`        | Security-config dependent | User          |
| PUT    | `/api/notifications/read-all?userId={userId}`     | Security-config dependent | User          |
| DELETE | `/api/notifications/{notificationId}`             | Security-config dependent | User          |

---

# 21. API Documentation Status

**NovaWavex API Documentation — Complete**

Documented modules:

* [x] Authentication
* [x] User Management
* [x] User Profiles
* [x] Password Management
* [x] Workflow Management
* [x] Notifications
* [x] Request DTOs
* [x] Response DTOs
* [x] Validation rules
* [x] Workflow status values
* [x] Notification types
* [x] Notification priorities
* [x] JWT authentication
* [x] API endpoint reference

---

## 22. Project

**NovaWavex — Java Full Stack Workflow Platform**

Built with:

```text
Frontend
React + Vite + Axios + React Router

Backend
Java + Spring Boot + Spring Security + JPA/Hibernate

Database
PostgreSQL

Authentication
JWT

Deployment
Render
```

---

**Documentation Version:** 1.0
**Project:** NovaWavex
**API Base Path:** `/api`
