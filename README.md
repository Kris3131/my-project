# WEMO

## Table Schema

### User 表結構

| Column          | Type      | Constraints               | Description       |
| --------------- | --------- | ------------------------- | ----------------- |
| id              | SERIAL    | PRIMARY KEY               | User ID           |
| first_name      | VARCHAR   | NOT NULL                  | User 名           |
| last_name       | VARCHAR   | NOT NULL                  | User 姓           |
| email           | VARCHAR   | UNIQUE, NOT NULL          | 電子郵件地址      |
| phone           | VARCHAR   | UNIQUE, NOT NULL          | 電話號碼          |
| user_id_number  | VARCHAR   | UNIQUE, NOT NULL          | 身份證號碼        |
| license         | BYTEA     |                           | 駕照號碼          |
| profile_picture | BYTEA     |                           | User 頭像         |
| password        | VARCHAR   | NOT NULL                  | 密碼              |
| is_active       | BOOLEAN   | DEFAULT TRUE              | User 是否開通帳號 |
| is_deleted      | BOOLEAN   | DEFAULT FALSE             | User 是否被刪除   |
| last_login_at   | TIMESTAMP |                           | 最後登錄時間      |
| created_at      | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 創建時間          |
| updated_at      | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 最後更新時間      |

### Scooter 表結構

| Column                | Type                   | Constraints               | Description                                            |
| --------------------- | ---------------------- | ------------------------- | ------------------------------------------------------ |
| id                    | SERIAL                 | PRIMARY KEY               | Scooter ID                                             |
| model                 | VARCHAR                | NOT NULL                  | Scooter 型號                                           |
| location              | GEOGRAPHY(Point, 4326) |                           | Scooter 位置                                           |
| status                | INT                    | NOT NULL                  | Scooter 狀態 (0: Available, 1: Rented, 2: Maintenance) |
| battery_level         | DECIMAL                |                           | 電池電量                                               |
| last_maintenance_date | TIMESTAMP              |                           | 最後維護日期                                           |
| is_deleted            | BOOLEAN                | DEFAULT FALSE             | Scooter 是否被刪除                                     |
| created_at            | TIMESTAMP              | DEFAULT CURRENT_TIMESTAMP | 創建時間                                               |
| updated_at            | TIMESTAMP              | DEFAULT CURRENT_TIMESTAMP | 最後更新時間                                           |

### Rent 表結構

| Column            | Type      | Constraints               | Description                                                                                                 |
| ----------------- | --------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| id                | SERIAL    | PRIMARY KEY               | 租借 ID                                                                                                     |
| user_id           | INTEGER   | REFERENCES users(id)      | User ID                                                                                                     |
| scooter_id        | INTEGER   | REFERENCES scooters(id)   | Scooter ID                                                                                                  |
| start_time        | TIMESTAMP | NOT NULL                  | 租借開始時間                                                                                                |
| end_time          | TIMESTAMP |                           | 租借結束時間                                                                                                |
| total_cost        | DECIMAL   |                           | 總費用                                                                                                      |
| distance_traveled | DECIMAL   |                           | 行駛距離                                                                                                    |
| status            | INT       | NOT NULL                  | 租借狀態 (0: ACTIVE, 1: COMPLETED, 2: CANCELLED, 3: PENDING_PAYMENT, 4: PAYMENT_SUCCESS, 5: PAYMENT_FAILED) |
| created_at        | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 創建時間                                                                                                    |
| updated_at        | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 最後更新時間                                                                                                |
