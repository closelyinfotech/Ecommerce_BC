# 📖 Priya Couture E-Commerce API - Complete Specification Document

A comprehensive reference for all REST API endpoints in **`Priya_EcommerceBC_Node`**.

- **Base URL:** `http://localhost:8025`
- **Authentication:** Bearer JWT (`Authorization: Bearer <token>`)
- **Underlying Database:** Supabase PostgreSQL (`tbl_userlogindetails`, `comconstant`, `sp_userlogindetails_get`, `sp_userlogindetails_trans`)

---

## 📑 Table of Contents

1. [Global Response Standards](#1-global-response-standards)
2. [Public Authentication Endpoints](#2-public-authentication-endpoints)
   - [2.1 Server Health Probe](#21-server-health-probe)
   - [2.2 User Registration](#22-user-registration)
   - [2.3 User Login](#23-user-login)
   - [2.4 Direct Client Token Generation](#24-direct-client-token-generation)
3. [User Management Endpoints (Requires JWT)](#3-user-management-endpoints-requires-jwt)
   - [3.1 Get Authenticated User Profile](#31-get-authenticated-user-profile)
   - [3.2 Get All Users (`GetAll`)](#32-get-all-users-getall)
   - [3.3 Get User by ID (`GetbyId`)](#33-get-user-by-id-getbyid)
   - [3.4 Search Users by Username (`SearchUser`)](#34-search-users-by-username-searchuser)
   - [3.5 Insert New User (`INSERT`)](#35-insert-new-user-insert)
   - [3.6 Update User Details (`UPDATE`)](#36-update-user-details-update)
   - [3.7 Delete User (`DELETE`)](#37-delete-user-delete)
4. [Common Constants Endpoints (`comconstant`)](#4-common-constants-endpoints-comconstant)
   - [4.1 Get Constants by Category_Name](#41-get-constants-by-category_name-where-condition)
   - [4.2 Get All Constants](#42-get-all-constants)
   - [4.3 Get Constant by ID](#43-get-constant-by-id)
   - [4.4 Insert New Constant](#44-insert-new-constant)
   - [4.5 Update Constant Details](#45-update-constant-details)
   - [4.6 Delete / Deactivate Constant](#46-delete--deactivate-constant)

---

## 1. Global Response Standards

Following the **Life Claim (`Life-Broker-Node18-04-26 1`)** enterprise envelope format:

### Standard Success Response (HTTP 200 / 201)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": { ... }
  }
}
```

### Standard Error Response (HTTP 400 / 401 / 403 / 404 / 500)
```json
{
  "code": 0,
  "status": "Error",
  "data": {
    "error": [
      {
        "errorMessage": "Detailed error explanation",
        "status": 401
      }
    ]
  }
}
```

---

## 2. Public Authentication Endpoints

### 2.1 Server Health Probe
- **Method:** `GET`
- **URL:** `http://localhost:8025/api/health`

#### Response (200 OK)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "service": "Priya Couture E-Commerce API",
    "status": "Healthy",
    "timestamp": "2026-10-30T16:15:00.000Z",
    "supabaseConfigured": true
  }
}
```

---

### 2.2 User Registration
- **Method:** `POST`
- **URL:** `http://localhost:8025/api/auth/register`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "Username": "DivyaSharma",
  "Password": "SecurePassword@123",
  "MobileNo": "9876543210",
  "UserBy": "Self"
}
```

#### Response (201 Created)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": {
      "user": {
        "User_SK": 2,
        "Username": "DivyaSharma",
        "MobileNo": "9876543210",
        "IsActive": true
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": "24h"
    }
  }
}
```

---

### 2.3 User Login
- **Method:** `POST`
- **URL:** `http://localhost:8025/api/auth/login`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "Username": "PriyaAdmin",
  "Password": "Priya@123"
}
```

#### Response (200 OK)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": {
      "user": {
        "User_SK": 1,
        "Username": "PriyaAdmin",
        "MobileNo": "9876543210",
        "IsActive": true
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": "24h"
    }
  }
}
```

---

### 2.4 Direct Client Token Generation
- **Method:** `POST`
- **URL:** `http://localhost:8025/api/auth/token`
- **Headers:** `Content-Type: application/json`

```json
{
  "username": "admin@priyacouture.com",
  "password": "adminpassword"
}
```

---

## 3. User Management Endpoints (Requires JWT)

> **Header required:** `Authorization: Bearer <your_access_token>`

- **3.1 Profile:** `GET http://localhost:8025/api/priya/ecommerce/users/profile`
- **3.2 Get All:** `GET http://localhost:8025/api/priya/ecommerce/users/list`
- **3.3 Get by ID:** `GET http://localhost:8025/api/priya/ecommerce/users/:id`
- **3.4 Search:** `GET http://localhost:8025/api/priya/ecommerce/users/search?username=Priya`
- **3.5 Insert:** `POST http://localhost:8025/api/priya/ecommerce/users/insert`
  ```json
  {
    "Username": "AnanyaRao",
    "Password": "CustomPassword@456",
    "MobileNo": "9876500001",
    "IsActive": true,
    "UserBy": "Admin"
  }
  ```
- **3.6 Update:** `PUT http://localhost:8025/api/priya/ecommerce/users/update/:id`
  ```json
  {
    "Username": "AnanyaRaoUpdated",
    "MobileNo": "9876500099",
    "IsActive": true,
    "UserBy": "AdminEditor"
  }
  ```
- **3.7 Delete:** `DELETE http://localhost:8025/api/priya/ecommerce/users/delete/:id`

---

## 4. Common Constants Endpoints (`comconstant`)

Endpoints for retrieving and managing lookup values (e.g., categories, sizes, colors, payment modes, tracking stages) stored in Supabase `public.comconstant`.

---

### 4.1 Get Constants by Category_Name (WHERE Condition)
Queries constants filtered specifically by `Category_Name` where `IsActive = true`.

- **Method:** `GET`
- **URL Option A (Path param):** `http://localhost:8025/api/priya/ecommerce/constants/category/:categoryName`  
  *(Example: `http://localhost:8025/api/priya/ecommerce/constants/category/ProductCategory`)*
- **URL Option B (Query param):** `http://localhost:8025/api/priya/ecommerce/constants/category?Category_Name=Size`
- **Headers:** None required (Public / Front-end ready)

#### Response (200 OK)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": [
      {
        "constant_sk": 1,
        "constant_name": "Sarees",
        "category_name": "ProductCategory",
        "constant_value": 1,
        "isactive": true,
        "createdby": "System",
        "createddate": "2026-10-30T17:00:00.000Z",
        "modifiedby": null,
        "modifieddate": null
      },
      {
        "constant_sk": 2,
        "constant_name": "Kurtis",
        "category_name": "ProductCategory",
        "constant_value": 2,
        "isactive": true,
        "createdby": "System",
        "createddate": "2026-10-30T17:00:00.000Z",
        "modifiedby": null,
        "modifieddate": null
      }
    ]
  }
}
```

---

### 4.2 Get All Constants
Retrieves all constants with optional query filters.

- **Method:** `GET`
- **URL:** `http://localhost:8025/api/priya/ecommerce/constants/list`  
  *(Alternative alias: `http://localhost:8025/api/priya/ecommerce/constants/`)*
- **Query Parameters (Optional):**
  - `category`: Filter by Category_Name
  - `search`: Search text across Constant_Name or Category_Name
  - `isActive`: `true` or `false`

#### Response (200 OK)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": [
      {
        "constant_sk": 1,
        "constant_name": "Sarees",
        "category_name": "ProductCategory",
        "constant_value": 1,
        "isactive": true,
        "createdby": "System",
        "createddate": "2026-10-30T17:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.3 Get Constant by ID
- **Method:** `GET`
- **URL:** `http://localhost:8025/api/priya/ecommerce/constants/:id`  
  *(Example: `http://localhost:8025/api/priya/ecommerce/constants/1`)*

#### Response (200 OK)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": {
      "constant_sk": 1,
      "constant_name": "Sarees",
      "category_name": "ProductCategory",
      "constant_value": 1,
      "isactive": true,
      "createdby": "System",
      "createddate": "2026-10-30T17:00:00.000Z",
      "modifiedby": null,
      "modifieddate": null
    }
  }
}
```

---

### 4.4 Insert New Constant
Inserts a new lookup constant into `public.comconstant`.

- **Method:** `POST`
- **URL:** `http://localhost:8025/api/priya/ecommerce/constants/insert`  
  *(Alternative alias: `http://localhost:8025/api/priya/ecommerce/constants/`)*
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "Constant_Name": "Dupattas",
  "Category_Name": "ProductCategory",
  "Constant_value": 5,
  "IsActive": true,
  "Createdby": "Admin"
}
```

#### Response (201 Created)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": {
      "Status": 1,
      "Message": "Constant inserted successfully",
      "Constant_SK": 6,
      "data": {
        "constant_sk": 6,
        "constant_name": "Dupattas",
        "category_name": "ProductCategory",
        "constant_value": 5,
        "isactive": true,
        "createdby": "Admin",
        "createddate": "2026-10-30T17:35:00.000Z"
      }
    }
  }
}
```

#### Error Response (409 Conflict - Duplicate)
```json
{
  "code": 0,
  "status": "Error",
  "data": {
    "error": [
      {
        "errorMessage": "Constant 'Dupattas' already exists in Category 'ProductCategory'.",
        "status": 0
      }
    ]
  }
}
```

---

### 4.5 Update Constant Details
Updates fields for an existing constant record by `Constant_SK`. Automatically updates `modifieddate` and `modifiedby`.

- **Method:** `PUT`
- **URL:** `http://localhost:8025/api/priya/ecommerce/constants/update/:id`  
  *(Example: `http://localhost:8025/api/priya/ecommerce/constants/update/6`)*
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "Constant_Name": "Silk Dupattas",
  "Constant_value": 6,
  "IsActive": true,
  "Modifiedby": "AdminEditor"
}
```

#### Response (200 OK)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": {
      "Status": 1,
      "Message": "Constant updated successfully",
      "data": {
        "constant_sk": 6,
        "constant_name": "Silk Dupattas",
        "category_name": "ProductCategory",
        "constant_value": 6,
        "isactive": true,
        "modifiedby": "AdminEditor",
        "modifieddate": "2026-10-30T17:40:00.000Z"
      }
    }
  }
}
```

---

### 4.6 Delete / Deactivate Constant
Deactivates (`isactive = false`) or permanently deletes a constant by `Constant_SK`.

- **Method:** `DELETE`
- **URL (Soft delete):** `http://localhost:8025/api/priya/ecommerce/constants/delete/:id`  
  *(Example: `http://localhost:8025/api/priya/ecommerce/constants/delete/6`)*
- **URL (Permanent delete):** `http://localhost:8025/api/priya/ecommerce/constants/delete/:id?permanent=true`

#### Response (200 OK)
```json
{
  "code": 1,
  "status": "Success",
  "data": {
    "model": {
      "Status": 1,
      "Message": "Constant deactivated successfully"
    }
  }
}
```

---

## 💻 cURL Quick Testing Cheat Sheet

### 1. Get Constants by Category_Name (WHERE condition)
```bash
curl -X GET http://localhost:8025/api/priya/ecommerce/constants/category/ProductCategory
```

### 2. Insert Constant
```bash
curl -X POST http://localhost:8025/api/priya/ecommerce/constants/insert \
  -H "Content-Type: application/json" \
  -d '{"Constant_Name":"Lehengas","Category_Name":"ProductCategory","Constant_value":3,"Createdby":"Admin"}'
```

### 3. Update Constant
```bash
curl -X PUT http://localhost:8025/api/priya/ecommerce/constants/update/1 \
  -H "Content-Type: application/json" \
  -d '{"Constant_Name":"Bridal Sarees","Modifiedby":"Admin"}'
```

### 4. Delete Constant
```bash
curl -X DELETE http://localhost:8025/api/priya/ecommerce/constants/delete/1
```
