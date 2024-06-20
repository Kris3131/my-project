## 目錄

1. [系統說明](#系統說明)
2. [資料庫架構](#資料庫架構)
3. [API 設計](#api-設計)
4. [業務邏輯](#業務邏輯)
5. [微服務架構](#微服務架構)

## 系統說明

This system is an application providing user registration, login, and scooter rental services. Users can register via phone number, verify their identity, and upload their driving license and ID card for authentication. After logging in, users can view nearby available scooters, rent them, and make payments. The system also includes rental history, a rating system, an admin backend, and a notification system.

## 資料庫架構

### `users` 表

| 欄位名                 | 類型      |                        說明                         |
| ---------------------- | --------- | :-------------------------------------------------: |
| id                     | int       |                                                     |
| first_name             | varchar   |                                                     |
| last_name              | varchar   |                                                     |
| email                  | varchar   |                                                     |
| phone                  | varchar   |                                                     |
| user_id_number         | varchar   |                                                     |
| password               | varchar   |                                                     |
| license                | bytea     |                      nullable                       |
| id_card                | bytea     |                      nullable                       |
| profile_picture        | bytea     |                      nullable                       |
| payment_type           | int       | 0 : credit_card 1: LinePay 2: ApplePay 3: GooglePay |
| credit_card_number     | varchar   |                      nullable                       |
| credit_card_expiration | varchar   |                      nullable                       |
| location               | geography |                                                     |
| is_active              | boolean   |                   default : false                   |
| is_deleted             | boolean   |                   default : false                   |
| last_login_at          | timestamp |                                                     |
| created_at             | timestamp |             default : CURRENT_TIMESTAMP             |
| updated_at             | timestamp |             default : CURRENT_TIMESTAMP             |
| failed_login_attempts  | int       |                     default : 0                     |

### `scooters` 表

| 欄位名                | 說明                           | 類型      |
| --------------------- | ------------------------------ | --------- |
| id                    |                                | int       |
| model                 |                                | varchar   |
| location              |                                | geography |
| status                | 0:INIT;1:RENTED;2:MAINTAINANCE | int       |
| rate_per_hour         |                                | decimal   |
| battery_level         |                                | decimal   |
| last_maintenance_date |                                | timestamp |
| is_deleted            | default: false                 | boolean   |
| created_at            |                                | timestamp |
| updated_at            |                                | timestamp |

### `rents` 表

| 欄位名            | 類型      | 說明                               |
| ----------------- | --------- | ---------------------------------- |
| id                | int       |                                    |
| user_id           | int       |                                    |
| scooter_id        | int       |                                    |
| start_time        | timestamp |                                    |
| end_time          | timestamp |                                    |
| total_cost        | decimal   |                                    |
| start_location    | geography |                                    |
| end_location      | geography |                                    |
| status            | int       | 0:INIT;1:TRIP;2:COMPLETED;4:CANCEL |
| payment_type      | int       |                                    |
| payment_status    | int       | 0:INIT;2:SUCCESS;3:FAILED          |
| created_at        | timestamp |                                    |
| updated_at        | timestamp |                                    |
| distance_traveled | decimal   |                                    |

## API 設計

### AUTH

**RESTful API**

#### 登入

- **Endpoint**: `POST /api/auth/login`
- **Request**:
  ```json
  {
    "phone": "09000000",
    "password": "userpassword"
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "success": true,
    "data": {
      "token": "jwt-token"
    }
  }
  ```

  401 Unauthorized

  ```json
  {
    "success": false,
    "message": "[Auth] Invalid phone number or password",
    "errorCode": "AUTH_INVALID_CREDENTIALS"
  }
  ```

- **行為說明**：
  - 密碼正確 -> 用戶進入首頁
  - 密碼錯誤 -> 重新輸入（最多三次），失敗則鎖定帳號 `user.is_active = 0`

#### 註冊

註冊過程拆分為兩個階段：用戶初次註冊和上傳駕照/身份證。這樣用戶可以選擇立即上傳文件或稍後上傳。

前端：使用 multipart/form-data 上傳文件。
後端：使用 Multer 和 Multer-S3 來處理文件上傳，並存儲到 AWS S3。Onfido 和 Veriff，可以用於驗證用戶的身份文件。

- **Endpoint**: `POST /api/auth/register`
- **Request**:
  ```json
  {
    "phone": "1234567890",
    "password": "userpassword",
    "license": "base64-license-data", // option
    "id_card": "base64-id-card-data" // option
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "success": true,
    "data": {
      "token": "jwt-token"
    }
  }
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[AUTH] Phone number or password is missing",
    "errorCode": "AUTH_MISSING_CREDENTIALS"
  }
  ```

- **行為說明**：
  - 初次註冊 -> 驗證手機號碼
  - 上傳駕照和身份證 -> `user.is_active = 1`

### 第二階段：上傳駕照和身份證

用戶可以稍後上傳駕照和身份證。

- **Endpoint**: `POST /api/auth/upload-documents`

- Authorization: Bearer jwt-token

- **Request**:
  ```json
  {
    "userId": "123",
    "license": "base64-license-data",
    "id_card": "base64-id-card-data"
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "success": true,
    "message": "Documents uploaded successfully"
  }
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[AUTH] User ID, license or ID card is missing",
    "errorCode": "AUTH_MISSING_DOCUMENTS"
  }
  ```

- **行為說明**：
  - 上傳成功 -> 更新 `user.is_active = 1`

### 忘記密碼

使用 Twilio 發送 SMS 驗證碼或使用 SendGrid 發送電子郵件驗證碼。

- **Endpoint**: `POST /api/auth/forgot-password`
- Authorization: Bearer jwt-token
- **Request**:
  ```json
  {
    "phone": "09000000"
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "success": true,
    "message": "Verification code sent"
  }
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[AUTH] Phone number is missing",
    "errorCode": "AUTH_MISSING_PHONE"
  }
  ```

- **行為說明**：
  - 發送驗證碼到手機

### 重設密碼

- **Endpoint**: `POST /api/auth/reset-password`
- **Request**:
  ```json
  {
    "phone": "09000000",
    "verificationCode": "123456",
    "newPassword": "newpassword"
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "success": true,
    "message": "Password reset successful"
  }
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[AUTH] Verification code is invalid or expired",
    "errorCode": "AUTH_INVALID_CODE"
  }
  ```

- **行為說明**：
  - 驗證驗證碼，成功後更新密碼

### 刪除帳號

- Authorization: Bearer jwt-token

- **Endpoint**: `POST /api/auth/delete-account`
- **Request**:
  ```json
  {
    "userId": "123"
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "success": true,
    "message": "Account deleted successfully"
  }
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[AUTH] User ID is missing",
    "errorCode": "AUTH_MISSING_USER_ID"
  }
  ```

- **行為說明**：
  - 刪除帳號 -> `user.is_active = 0` 和 `user.is_deleted = 1`

### 生物辨識認證

使用 AWS Rekognition、Microsoft Azure Face API、Google Cloud Vision、Apple 的 LocalAuthentication (Face ID / Touch ID) 和 Android 的生物辨識

功能。在生物辨識成功後，向後端請求 JWT token。

- **Endpoint**: `POST /api/auth/biometric-login`
- **Headers**:
  `Content-Type: application/json`

- **Request Body**:

  ```json
  {
    "userId": "123"
  }
  ```

- **Response**:

  200 OK

  ```json
  {
    "success": true,
    "token": "jwt-token"
  }
  ```

  401 Unauthorized

  ```json
  {
    "success": false,
    "message": "[AUTH] Biometric authentication failed",
    "errorCode": "AUTH_BIOMETRIC_FAILED"
  }
  ```

- **行為說明**：
  - 生物辨識成功 -> 返回 JWT token

---

### Scooter API

### 獲取附近車輛

- Authorization: Bearer jwt-token

- **Endpoint**: `GET /api/scooters/nearby`
- **Request**:
  ```json
  {
    "location": "POINT(121.5645 25.034)"
  }
  ```
- **Response**:

  200 OK

  ```json
  [
    {
      "id": 1,
      "model": "Scooter Model",
      "location": "POINT(121.5645 25.034)",
      "status": "available",
      "rate_per_hour": 15,
      "battery_level": 90
    }
  ]
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[SCOOTER] Invalid location format",
    "errorCode": "SCOOTER_INVALID_LOCATION"
  }
  ```

- **行為說明**：

  - 檢查用戶狀態 `user.is_deleted = 0` 和 `user.is_active = 1`
  - 檢查未完成的租借記錄
    - 有 -> 提示正在租借中
    - 無 -> 獲取用戶當前位置，更新 `user.location`
  - 查詢附近可用車輛 `scooter.location` 和 `status = available`
  - 顯示車輛位置

- **GraphQL**: `/GraphQL/Scooters/Nearby`

## Rent API

### 創建租借記錄

- Authorization: Bearer jwt-token

- **Endpoint**: `POST /api/rents`
- **Request**:
  ```json
  {
    "user_id": 1,
    "scooter_id": 1,
    "start_time": "2023-05-25T08:00:00Z",
    "start_location": "POINT(121.5645 25.034)"
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "id": 1,
    "user_id": 1,
    "scooter_id": 1,
    "start_time": "2023-05-25T08:00:00Z",
    "status": "ACTIVE",
    "payment_status": "PENDING_PAYMENT"
  }
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[RENT] Missing required fields",
    "errorCode": "RENT_MISSING_FIELDS"
  }
  ```

- **行為說明**：

  - 用戶預定車輛
    - 成功 -> 更新車輛狀態為 `Rented`，計算用戶位置與車輛位置距離
    - 取消 -> 更新車輛狀態為 `Available`
  - 用戶選擇車輛，開始租借
    - 插入租借記錄，設置初始信息：
      - `user_id`
      - `scooter_id`
      - `start_time`
      - `start_location`
      - `status = ACTIVE`
      - `payment_status = PENDING_PAYMENT`

- **GraphQL**: `/GraphQL/Rents/Create`

### 結束租借

- Authorization: Bearer jwt-token

- **Endpoint**: `PUT /api/rents/:rent_id/end`
- **Request**:
  ```json
  {
    "end_time": "2023-05-25T10:00:00Z",
    "end_location": "POINT(121.567 25.037)"
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "id": 1,
    "user_id": 1,
    "scooter_id": 1,
    "start_time": "2023-05-25T08:00:00Z",
    "end_time": "2023-05-25T10:00:00Z",
    "total_cost": 30.0,
    "status": "COMPLETED",
    "payment_status": "PENDING_PAYMENT"
  }
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[RENT] Missing required fields",
    "errorCode": "RENT_MISSING_FIELDS"
  }
  ```

- **行為說明**：

  - 用戶完成租借，更新租借記錄
    - `end_time`
    - `end_location`
    - `status = COMPLETED`
    - 計算總費用（基於 `start_time` 和 `end_time` 以及 `rate_per_hour`）
    - 更新車輛狀態為 `Available`

- **GraphQL**: `/GraphQL/Rents/End`

## 支付 API

### 支付

- Authorization: Bearer jwt-token

- **Endpoint**: `POST /api/payments`
- **Request**:
  ```json
  {
    "rent_id": 1,
    "payment_method": "credit_card",
    "amount": 30
  }
  ```
- **Response**:

  200 OK

  ```json
  {
    "id": 1,
    "rent_id": 1,
    "status": "PAID",
    "amount": 30.0,
    "payment_method": "credit_card"
  }
  ```

  400 Bad Request

  ```json
  {
    "success": false,
    "message": "[PAYMENT] Missing required fields",
    "errorCode": "PAYMENT_MISSING_FIELDS"
  }
  ```

- **行為說明**：
  - 支持多種支付方式
    - 信用卡、LinePay、ApplePay、GooglePay 等
  - 支付狀態管理
    - `payment_status = PENDING_PAYMENT`
    - `payment_status = PAID`
  - 訂單和發票發送
    - 通過 Finance 系統發送訂單和發票
  - 支付安全
    - 支付失敗處理和重試機制

---

## 業務邏輯

1. **用戶認證**

   - 用戶登入
     - 密碼正確或生物辨識成功 -> 進入首頁
     - 密碼錯誤 -> 重新輸入（最多三次），失敗則鎖定帳號 `user.is_active = 0`
   - 用戶註冊
     - 手機號碼驗證
     - 上傳駕照和身份證 -> `user.is_active = 1`
   - 安全性
     - 密碼強度檢查
     - 忘記密碼 -> 手機驗證或電子郵件重設
     - 刪除帳號 -> `user.is_active = 0` 和 `user.is_deleted = 1`

2. **租車流程**

   - 進入租車畫面
     - 檢查用戶狀態 `user.is_deleted = 0` 和 `user.is_active = 1`
     - 檢查未完成的租借記錄
     - 有 -> 提示正在租借中
     - 無 -> 獲取用戶當前位置，更新 `user.location`
     - 查詢附近可用車輛 `scooter.location` 和 `status = available`
     - 顯示車輛位置
   - 用戶預定車輛
     - 成功 -> 更新車輛狀態為 `Rented`，計算用戶位置與車輛位置距離
     - 取消 -> 更新車輛狀態為 `Available`
   - 用戶選擇車輛，開始租借
     - 插入租借記錄，設置初始信息
       - `user_id`
       - `scooter_id`
       - `start_time`
       - `start_location`
       - `status = ACTIVE`
       - `payment_status = PENDING_PAYMENT`
   - 租借期間
     - 車輛位置
     - 提供導航和地圖服務
     - 車輛狀態監控（如電池電量）
   - 租借結束
     - 用戶完成租借，更新租借記錄
       - `end_time`
       - `end_location`
       - `status = COMPLETED`
       - 計算總費用（基於 `start_time` 和 `end_time` 以及 `rate_per_hour`）
       - 更新車輛狀態為 `Available`

3. **付款**
   - 支付流程
     - 支持多種支付

- 方式（信用卡、LinePay、ApplePay、GooglePay等）
  - 支付狀態管理 Update Rent
    - `payment_status = PENDING_PAYMENT`
    - `payment_status = PAID`
  - 訂單和發票發送
    - 通過 Finance 系統發送訂單和發票
  - 支付安全
    - 使用支付網關進行支付處理
    - 敏感信息加密
    - 支付失敗處理和重試機制

---

## 微服務架構

### 拆分微服務

1. **用戶服務**（User Service）

   - 處理用戶認證、註冊、資料更新、刪除等操作。
   - 包含 `users` 表的操作。
   - 獨立的 RESTful API 服務。

2. **車輛服務**（Scooter Service）

   - 處理車輛的添加、更新、刪除、位置更新等操作。
   - 包含 `scooters` 表的操作。
   - 獨立的 GraphQL 服務。

3. **租借服務**（Rent Service）

   - 處理租借流程，包括創建租借記錄、更新租借狀態、結束租借等操作。
   - 包含 `rents` 表的操作。
   - 獨立的 GraphQL 服務。

4. **支付服務**（Payment Service）
   - 處理支付流程、支付狀態更新、訂單和發票發送等操作。
   - 獨立的 RESTful API 或 GraphQL 服務。
