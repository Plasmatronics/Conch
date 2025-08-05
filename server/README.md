# 🌳 Family Tree App – Server

A **MongoDB + Express** backend built with **TypeScript**, designed to power a family tree application with secure authentication, file management, and relationship-rich data models.

---

## 🚀 Features

- 🔐 **Authentication & Authorization**  
  JWT-based auth, login/logout, and password reset via email.

- ☁️ **File Management**  
  AWS S3 integration with **secure pre-signed upload/download URLs**, including support for large files.

- 🧬 **Rich Data Models**  
  Support for users, family members, stories, media, documents, and likes.

- 🛡️ **Security-First Architecture**  
  Helmet, rate limiting, input sanitization, XSS & HPP protection, and CSP headers.

- ♻️ **Soft Deletion**  
  All key resources support soft delete, restore, and permanent cleanup.

- 📬 **Email Notifications**  
  Gmail OAuth2-powered emails using Nodemailer.

- 🔎 **Advanced Querying**  
  Filter, sort, paginate, and select fields via a robust query builder utility.

---

## 🧰 Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Runtime        | Node.js (v18+)                                 |
| Language       | TypeScript                                     |
| Framework      | Express.js                                     |
| Database       | MongoDB with Mongoose ODM                      |
| Authentication | JWT with bcrypt password hashing               |
| File Storage   | AWS S3 with presigned URL support              |
| Email Service  | Nodemailer (Gmail OAuth2)                      |
| Security       | Helmet, HPP, sanitize-html, CSP, rate limiting |

---

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── utils/                # Helper utilities and classes
│   └── dev-data/             # development data
├── types/                    # Typescript declaration files
├── index.ts                  # Express app configuration
└── server.ts                 # Entry point / server startup
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js v18+
- MongoDB instance
- AWS S3 bucket + credentials
- Gmail OAuth2 credentials

### 2. Environment Variables

Create a `config.env` file in the project root:

```env
# MongoDB
DATABASE = mongodb+srv://<DATABASE_USERNAME>:<DATABASE_PASSWORD>@cluster.mongodb.net/familytree
DATABASE_USERNAME = your_db_username
DATABASE_PASSWORD = your_db_password

# Server
HOST = localhost
PORT = 3000
CLIENT_URL = example.com

# Auth
JWT_SECRET = your_jwt_secret
JWT_EXPIRES_IN = 3600000

# AWS S3
S3_BUCKET_NAME = your_bucket_name
S3_REGION = us-east-1
S3_ACCESS_KEY = your_access_key
S3_SECRET_ACCESS_KEY = your_secret_key

# Gmail OAuth2
TRANSPORT_EMAIL = test@gmail.com
OAUTH2_CLIENT_ID = your_client_id
OAUTH2_CLIENT_SECRET = your_client_secret
OAUTH2_REFRESH_TOKEN = your_refresh_token
```

### 3. Installation

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. (Optional) Seed Development Data

```bash
npm run load-dev-data -- --import
```

---

## 🌐 API Endpoints

---

### 🔐 Authentication

| Method | Endpoint                              | Description            | Auth Required |
| ------ | ------------------------------------- | ---------------------- | ------------- |
| POST   | `/api/v1/users/signup`                | Register new user      | No            |
| POST   | `/api/v1/users/login`                 | Log in                 | No            |
| GET    | `/api/v1/users/logout`                | Log out                | Yes           |
| POST   | `/api/v1/users/forgot-password`       | Request password reset | No            |
| POST   | `/api/v1/users/reset-password/:token` | Reset password         | No            |

**Details:**

- **Signup:** Creates a user account and sends a welcome email.
- **Login**: Returns a JWT token in an HTTP-only — HTTPS-only (in production) — cookie.

---

### 👤 Users

| Method | Endpoint            | Description      | Auth Required |
| ------ | ------------------- | ---------------- | ------------- |
| GET    | `/api/v1/users`     | Get all users    | Yes           |
| GET    | `/api/v1/users/:id` | Get user by ID   | Yes           |
| PATCH  | `/api/v1/users/:id` | Update user      | Yes           |
| DELETE | `/api/v1/users/:id` | Soft delete user | Yes           |

---

### 👨‍👩‍👧‍👦 Family Tree Members

| Method | Endpoint                        | Description               | Auth Required |
| ------ | ------------------------------- | ------------------------- | ------------- |
| GET    | `/api/v1/familyTreeMembers`     | Get all family members    | No            |
| POST   | `/api/v1/familyTreeMembers`     | Create family member      | Yes           |
| GET    | `/api/v1/familyTreeMembers/:id` | Get family member by ID   | No            |
| PATCH  | `/api/v1/familyTreeMembers/:id` | Update family member      | Yes           |
| DELETE | `/api/v1/familyTreeMembers/:id` | Soft delete family member | Yes           |

---

### 📖 Stories

| Method | Endpoint              | Description       | Auth Required |
| ------ | --------------------- | ----------------- | ------------- |
| GET    | `/api/v1/stories`     | Get all stories   | Yes           |
| POST   | `/api/v1/stories`     | Create story      | Yes           |
| GET    | `/api/v1/stories/:id` | Get story by ID   | Yes           |
| PATCH  | `/api/v1/stories/:id` | Update story      | Yes           |
| DELETE | `/api/v1/stories/:id` | Soft delete story | Yes           |

---

### 📸 Media

| Method | Endpoint            | Description        | Auth Required |
| ------ | ------------------- | ------------------ | ------------- |
| GET    | `/api/v1/media`     | Get all media      | Yes           |
| POST   | `/api/v1/media`     | Create media entry | Yes           |
| GET    | `/api/v1/media/:id` | Get media by ID    | No            |
| PATCH  | `/api/v1/media/:id` | Update media       | Yes           |
| DELETE | `/api/v1/media/:id` | Soft delete media  | Yes           |

---

### 📄 Documents

| Method | Endpoint                | Description           | Auth Required |
| ------ | ----------------------- | --------------------- | ------------- |
| GET    | `/api/v1/documents`     | Get all documents     | Yes           |
| POST   | `/api/v1/documents`     | Create document entry | Yes           |
| GET    | `/api/v1/documents/:id` | Get document by ID    | No            |
| PATCH  | `/api/v1/documents/:id` | Update document       | Yes           |
| DELETE | `/api/v1/documents/:id` | Soft delete document  | Yes           |

---

### ❤️ Likes

| Method | Endpoint            | Description    | Auth Required |
| ------ | ------------------- | -------------- | ------------- |
| GET    | `/api/v1/likes`     | Get all likes  | Yes           |
| POST   | `/api/v1/likes`     | Create like    | Yes           |
| GET    | `/api/v1/likes/:id` | Get like by ID | Yes           |
| PATCH  | `/api/v1/likes/:id` | Update like    | Yes           |
| DELETE | `/api/v1/likes/:id` | Delete like    | Yes           |

**Note:** Likes use **hard deletion only** — no soft delete or restore.

---

### ☁️ File Management

| Method | Endpoint                     | Description                | Auth Required |
| ------ | ---------------------------- | -------------------------- | ------------- |
| POST   | `/api/v1/files/upload-url`   | Get secure S3 upload URL   | Yes           |
| POST   | `/api/v1/files/download-url` | Get secure S3 download URL | Yes           |

#### Supported File Types

- **Images:** PNG, JPEG, GIF, WebP, SVG, BMP, TIFF
- **Documents:** PDF, Word, Excel, PowerPoint, CSV, RTF
- **Audio:** MP3, WAV, OGG, M4A
- **Video:** MP4, AVI, MKV, WebM, QuickTime
- **Archives:** ZIP, RAR, TAR, GZIP
- **Code:** JSON, JavaScript, HTML, CSS, XML

---

### 🗑️ Trash Management System

Most models (except Likes) support a **3-stage deletion process**:

1. **Soft Delete** – Marks a `deletedAt` timestamp
2. **24-Hour Grace Period** – Items can be restored
3. **Permanent Cleanup** – Hard deletion after 24 hours

#### 🗑️ Trash Management

| Method | Endpoint                       | Description                     | Auth Required |
| ------ | ------------------------------ | ------------------------------- | ------------- |
| PATCH  | `/api/v1/{resource}/trash`     | Restore all deleted resource    | Yes           |
| DELETE | `/api/v1/{resource}/trash`     | Permanently delete old resource | Yes           |
| PATCH  | `/api/v1/{resource}/trash/:id` | Restore specific resource       | Yes           |

---

### 🔍 Advanced Query Parameters

GET routes that return an array of results support powerful query features via the `QueryBuilder` utility:

- **Filtering:** `?field=value`, `?field[gte]=value`
- **Sorting:** `?sort=createdAt,-title`
- **Field Selection:** `?fields=title,content,storyDate`
- **Pagination:** `?page=1&limit=5`

#### 🧪 Complex Example

```http
GET /api/v1/stories?author=123&sort=-createdAt,title&fields=title,content,storyDate&page=1&limit=5
```

This example:

- Filters by `author=123`
- Sorts by `createdAt` (newest first), then `title`
- Selects specific fields: `title`, `content`, `storyDate`
- Returns 5 results from page 1
- Only includes stories created after Jan 1, 2023 (via filter)

## 🧬 Data Models Overview

### User

- Authentication details
- Password reset tokens
- Relationship to `FamilyTreeMember`

### FamilyTreeMember

- Birth/death data
- Locations and favorites
- Relationships to other members

### Story

- Narrative content
- Linked to author and family members

### Media / Document

- S3 file references
- Polymorphic references
- Related users and family members

### Like

- Supports liking media or documents
- Linked to user and resource

---

## 🔐 Security Highlights

| Feature            | Details                          |
| ------------------ | -------------------------------- |
| Input Sanitization | Prevents XSS via `sanitize-html` |
| Rate Limiting      | 250 req/hour/IP                  |
| JWT Auth           | Secure token-based sessions      |
| CSP Headers        | Helmet-managed security policies |
| Password Hashing   | bcrypt + salt                    |
| CORS               | Restricted to `CLIENT_URL`       |
| HPP Protection     | Prevents parameter pollution     |

---

## 🗂️ File Management System

- **AWS S3** for secure file storage
- **Pre-signed URLs** for uploads & downloads
- **Multipart upload support** for large files
- **Auto-cleanup** of S3 files when DB entries are deleted

---

## 🧪 Development Scripts

```bash
npm run dev               # Run dev server
npm run import-dev-data  # Seed DB
npm run delete-dev-data  # Clear seeded DB
```

---

## ❗ Error Handling

- Global error middleware
- `AppError` class for custom error types
- `catchError` async wrapper

---

## 🪪 License

**Private** – Family Tree App is a closed-source project.
