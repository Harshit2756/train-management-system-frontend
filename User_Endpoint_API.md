# API Documentation for Train Management System

This document provides a detailed specification for all the APIs in the Train Management System.

## Base URL

All API calls should be made to the API Gateway or the respective microservice.

## Authentication

The system uses a user ID-based authentication model. After a user logs in, a `userId` is returned. This `userId` must be included in subsequent requests to access user-specific data.

Admin-level endpoints are prefixed with `/api/admin`. Access to these endpoints should be restricted to admin users. It is assumed that an API Gateway or a similar component is responsible for enforcing this restriction based on the user's role, which is obtained after login.

---

## 1. User Service (Port: 8081)

This service handles user registration, authentication, and profile management.

### 1.1. `POST http://localhost:8081/api/register`

Registers a new customer.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "contactNumber": "1234567890",
  "address": "123 Main St, Anytown, USA",
  "password": "password123"
}
```

**Responses:**

*   **201 Created:**
    ```json
    {
      "data": null,
      "message": "User registered successfully",
      "statusCode": 201,
      "error": null
    }
    ```

---

### 1.2. `POST http://localhost:8081/api/admin/register`

Registers a new admin user.

**Request Body:**

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "contactNumber": "0987654321",
  "address": "456 Admin Ave, Anytown, USA",
  "password": "adminPassword123"
}
```

**Responses:**

*   **201 Created:**
    ```json
    {
      "data": null,
      "message": "Admin registered successfully",
      "statusCode": 201,
      "error": null
    }
    ```
---

### 1.3. `POST http://localhost:8081/api/login`

Authenticates a user and returns their details.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Responses:**

*   **200 OK:**
    ```json
    {
      "data": {
        "userId": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "contactNumber": "1234567890",
        "address": "123 Main St, Anytown, USA",
        "userType": "CUSTOMER",
        "status": "ACTIVE"
      },
      "message": "Login successful",
      "statusCode": 200,
      "error": null
    }
    ```

---

### 1.4. `PUT http://localhost:8081/api/activate/{userId}`

Activates a user's account.

**Path Parameters:**
*   `userId`: `long` - The ID of the user to activate.

**Responses:**

*   **200 OK:**
    ```json
    {
        "data": null,
        "message": "Account activated successfully",
        "statusCode": 200,
        "error": null
    }
    ```

---

### 1.5. `GET http://localhost:8081/api/profile`

Retrieves the profile of a user.

**Query Parameters:**
*   `userId`: `long` - The ID of the user.

**Responses:**

*   **200 OK:**
    ```json
    {
      "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "contactNumber": "1234567890",
        "address": "123 Main St, Anytown, USA"
      },
      "message": "User profile retrieved successfully",
      "statusCode": 200,
      "error": null
    }
    ```

---

### 1.6. `POST http://localhost:8081/api/passengers`

Adds passenger details for a user.

**Query Parameters:**
*   `userId`: `long` - The ID of the user.

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "age": 30,
  "gender": "FEMALE"
}
```

**Responses:**

*   **201 Created:**
    ```json
    {
        "data": {
            "passengerId": 1,
            "fullName": "Jane Doe",
            "age": 30,
            "gender": "FEMALE"
        },
        "message": "Passenger added successfully",
        "statusCode": 201,
        "error": null
    }
    ```

---

### 1.7. `GET http://localhost:8081/api/passengers`

Retrieves all passenger details for a user.

**Query Parameters:**
*   `userId`: `long` - The ID of the user.

**Responses:**

*   **200 OK:**
    ```json
    {
        "data": [
            {
                "passengerId": 1,
                "fullName": "Jane Doe",
                "age": 30,
                "gender": "FEMALE"
            }
        ],
        "message": "Passengers retrieved successfully",
        "statusCode": 200,
        "error": null
    }
    ```

---

### 1.8. `GET http://localhost:8081/api/passengers/{passengerId}`

Retrieves specific passenger details for a user.

**Query Parameters:**
*   `userId`: `long` - The ID of the user.
**Path Parameters:**
*   `passengerId`: `long` - The ID of the passenger.

**Responses:**

*   **200 OK:**
    ```json
    {
        "data": {
            "passengerId": 1,
            "fullName": "Jane Doe",
            "age": 30,
            "gender": "FEMALE"
        },
        "message": "Passenger retrieved successfully",
        "statusCode": 200,
        "error": null
    }
    ```
---

### 1.9. `PUT http://localhost:8081/api/passengers/{passengerId}`

Updates specific passenger details for a user.

**Query Parameters:**
*   `userId`: `long` - The ID of the user.
**Path Parameters:**
*   `passengerId`: `long` - The ID of the passenger.

**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "age": 31
}
```
**Responses:**

*   **200 OK:**
    ```json
    {
        "data": {
            "passengerId": 1,
            "fullName": "Jane Smith",
            "age": 31,
            "gender": "FEMALE"
        },
        "message": "Passenger updated successfully",
        "statusCode": 200,
        "error": null
    }
    ```
---

### 1.10. `DELETE http://localhost:8081/api/passengers/{passengerId}`

Deletes specific passenger details for a user.

**Query Parameters:**
*   `userId`: `long` - The ID of the user.
**Path Parameters:**
*   `passengerId`: `long` - The ID of the passenger.

**Responses:**

*   **200 OK:**
    ```json
    {
        "data": null,
        "message": "Passenger deleted successfully",
        "statusCode": 200,
        "error": null
    }
    ```

---