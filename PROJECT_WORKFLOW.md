# JrGuide Project Workflow and Deep Technical Explanation

## 1. Solution Idea and Why This Project Exists

JrGuide is a role-based onboarding platform built for two main user groups:

- Employees: complete onboarding tasks, upload required documents, read FAQs, and ask onboarding questions to an AI assistant.
- HR and Admin: manage employees, create onboarding templates, assign templates, monitor progress, review documents, and send reminders.

The core idea is simple:

1. Keep onboarding structured with templates and tasks.
2. Keep onboarding measurable with dashboard analytics.
3. Keep onboarding fast with self-service help (FAQ + AI assistant).
4. Keep onboarding secure with role-based access control and authenticated APIs.

Under the hood, this is a full-stack TypeScript system with:

- Frontend: React + React Router + React Query + Tailwind.
- Backend: Express + Firebase Admin + Firestore + Cloud Storage + Socket.IO.
- AI: Google Gemini embeddings + retrieval augmented generation (RAG).
- Email: Brevo transactional email integration.

---

## 2. High-Level Architecture

## 2.1 Frontend Layer

- Single Page Application (SPA) in React.
- Route-level role guards for employee vs HR/admin portals.
- API client that attaches Firebase ID token or demo JWT.
- React Query for server state caching, retries, and re-fetching.

Main files:

- frontend/src/main.tsx
- frontend/src/App.tsx
- frontend/src/state/auth.tsx
- frontend/src/config/api.ts
- frontend/src/components/layout/AppLayout.tsx

## 2.2 Backend Layer

- Express app created in `createApp()`.
- Security middleware loaded first (helmet, CORS, rate limiting).
- Root router splits features into route modules.
- Every `/api/*` route except auth login/invite onboarding route setup passes through authentication middleware.
- Service layer contains business logic and Firestore calls.

Main files:

- backend/src/index.ts
- backend/src/app.ts
- backend/src/routes/index.ts
- backend/src/middleware/\*.ts
- backend/src/services/\*.ts

## 2.3 Data and External Services

- Firebase Auth for identity.
- Firestore for application data.
- Firebase Storage for uploaded files.
- Gemini for embedding + answer generation.
- Brevo for email reminders/tests.
- Socket.IO for real-time notifications.

---

## 3. End-to-End Runtime Lifecycle

This section shows what happens from browser click to database write.

### 3.1 Typical Authenticated API Request

1. User opens frontend and signs in (Firebase Auth or demo login).
2. Frontend API client reads token:

- Firebase ID token if Firebase user exists.
- Demo JWT from sessionStorage for demo mode.

3. Frontend sends request with `Authorization: Bearer <token>`.
4. Backend `authMiddleware` validates token:

- Try Firebase `verifyIdToken` first.
- Fallback to JWT verify with `JWT_SECRET`.

5. Backend resolves role from token claim or Firestore user document.
6. Backend `roleAuth` middleware checks role permission.
7. Route handler calls service function.
8. Service reads/writes Firestore and returns data.
9. API response uses standard wrapper:

- success: true + data
- success: false + error

### 3.2 Real-Time Flow

1. Backend starts Socket.IO server on same HTTP server.
2. Client can join room `user:<userId>` or `role:<role>`.
3. Notification service emits to user room.
4. Connected clients in that room receive event instantly.

---

## 4. Backend Deep Dive

## 4.1 Server Bootstrap and Startup

File: backend/src/index.ts

- Imports app factory and environment config.
- Creates Node HTTP server from Express app.
- Creates Socket.IO server on the same HTTP server.
- Loads Firebase, Brevo, and AI config modules at startup.
- Starts listening on `env.PORT` (default 4000).

Why this pattern matters:

- Single process handles REST and WebSocket connections.
- Config modules fail early if critical setup is invalid.

## 4.2 Express App Composition

File: backend/src/app.ts

Middleware order is important:

1. `registerSecurityMiddleware(app)`

- Helmet security headers.
- CORS with configurable origins.
- Rate limiter 300 requests per 15 minutes.

2. Body parsing

- JSON limit 2 MB.
- URL encoded parsing.

3. Request logging

- Morgan in dev mode.

4. Route mounting

- Root router includes all feature routers.

5. Global error handler

- Converts exceptions to uniform JSON errors.

## 4.3 Route Topology

File: backend/src/routes/index.ts

Routing strategy:

- Public route: `GET /health`.
- Public auth namespace: `/api/auth` routes include login.
- Global auth gate: `rootRouter.use("/api", authMiddleware)` for the rest.

Feature route modules:

- /api/auth
- /api/employees
- /api/onboarding
- /api/documents
- /api/faqs
- /api/chat
- /api/email
- /api/admin
- /api/notifications
- /api/contacts

## 4.4 Authentication and Authorization Internals

### Authentication

File: backend/src/middleware/auth.ts

- Extract bearer token.
- Attempt Firebase token verification.
- If Firebase verify fails, attempt JWT verification.
- Resolve role claim from token, fallback to Firestore `users` collection.
- Attach `req.user = { uid, email, role, ... }`.

This dual-token strategy supports both:

- Real Firebase-auth users.
- Demo users that log in through `/api/auth/login` and receive JWT.

### Authorization

File: backend/src/middleware/roleAuth.ts

- Role whitelist check at route level.
- Deny with 403 when user role is not allowed.

Role model:

- employee
- hr
- admin

### Role Assignment Rules

File: backend/src/routes/auth.routes.ts and backend/src/services/auth.service.ts

- `POST /api/auth/set-role`:
- Non-privileged user can only set own role once.
- HR/admin can set roles for others.
- Role is written to Firestore and Firebase custom claims.
- Employee assignment can auto-trigger template assignment (from service behavior).

## 4.5 Validation and Error Handling

Validation:

- Route payloads validated using Zod schemas.
- Invalid payloads stop request early with 400.

Error handling:

- `AppError` subclasses for known error types.
- Global `errorHandler` returns standard error JSON.
- Unknown errors logged with Winston and returned as 500.

Response wrapper:

- `sendSuccess(res, data, status)`
- `sendError(res, message, status, details)`

This keeps frontend parsing stable across all endpoints.

## 4.6 Security Controls

File: backend/src/middleware/security.ts

- Helmet hardens common HTTP header attack vectors.
- CORS accepts one or multiple origins via `CLIENT_ORIGIN`.
- Rate limiting reduces brute force and spam risk.

File upload security:

- Multer memory storage.
- Max file size 10 MB.
- Allowed MIME types: PDF, PNG, JPEG.

Secrets and config validation:

- Env schema validated with Zod on startup.
- Missing critical values fail early.

## 4.7 Service Layer Responsibilities

### Auth Service

- Create JWT access token (demo and fallback auth path).
- Store and update user roles.
- Invite flow integration for HR/admin.

### Employee Service

- List employees (HR/admin).
- Read employee profile by ID and current user.
- Update employee profile documents.

### Onboarding Service

- Fetch tasks by employee ID.
- Mark task in progress.
- Mark task completed.

### Template Service

File: backend/src/services/template.service.ts

Core onboarding engine:

- Create template with task definitions.
- Update or archive template.
- Assign template to employee.
- On assignment, generate concrete tasks with computed due dates.
- Use Firestore batch writes for assignment + task creation.
- Prevent duplicate assignment with composite key `employeeId_templateId`.

### Document Service

- Upload employee documents.
- Store file in Firebase Storage.
- Save metadata to Firestore documents collection.
- Allow HR/admin verification and rejection status changes.

### FAQ Service

- List active FAQs.
- Search FAQs.
- HR/admin CRUD and activation toggles.

### Notification Service

- Create notification records.
- Query latest notifications (limited and ordered).
- Mark single or all notifications read.
- Emit real-time events via Socket.IO room.

### Email Service

- Send test email.
- Send reminder email using Brevo template IDs.

### Report Service

File: backend/src/services/report.service.ts

Analytics implementation details:

- Pull snapshots from users, tasks, documents, notifications.
- Compute totals and rates in backend memory.
- Build activity feed from completed tasks + document events.
- Return dashboard summary and report payload for HR pages.

Note:

- This is currently aggregation-on-read, not pre-aggregated materialized metrics.

## 4.8 AI and RAG Pipeline Internals

File: backend/src/services/ai.service.ts

JrGuide AI uses retrieval augmented generation.

Pipeline:

1. Off-topic detector checks question against blocked patterns.
2. Question is embedded by `gemini-embedding-001` with 768 dimensions.
3. Firestore vector search (`findNearest`) retrieves top relevant chunks.
4. Build prompt = system guardrails + retrieved context + user question.
5. Generate answer with `env.GEMINI_MODEL` (default gemini-1.5-flash).
6. Return answer and deduplicated source metadata.

Guardrails include:

- Only HR/onboarding/company policy topics allowed.
- Refusal for coding, politics, finance, medical, legal, entertainment topics.
- No hallucinated data instruction.
- Source citation requirement.
- Answer length and style constraints.

Failure behavior:

- If vector index is missing or search fails, fallback to empty context.
- If generation fails, return friendly fallback message.

---

## 5. Knowledge Base and Embedding Workflow

File: backend/scripts/embed-docs.ts

This script is the offline indexing pipeline.

What it does:

1. Reads markdown files from `backend/knowledge-base`.
2. Splits content into overlapping chunks by headings and token estimate.
3. Calls embedding model in batches.
4. Writes chunk + source + section + vector to `vectors` collection.
5. Uses Firestore vector field `FieldValue.vector` with 768-dim embeddings.

Why overlap is used:

- Keeps semantic continuity between neighboring chunks.

---

## 6. Seed Data Workflow

File: backend/scripts/seed.ts

Purpose:

- Create realistic demo environment quickly.

What it seeds:

- Users (employee + HR demo records).
- Onboarding templates.
- Employee tasks generated from default template.
- Template assignments.
- Required documents.
- FAQs.
- Contacts.
- Notifications.

This script also clears target collections before reseeding for consistent demos.

---

## 7. Firestore Data Model and Indexing

## 7.1 Core Collections

Common collections used across services:

- users
- onboardingTemplates
- templateAssignments
- employeeTasks
- documents
- faqs
- contacts
- notifications
- vectors

## 7.2 Why Indexes Matter Here

File: firestore.indexes.json

Composite indexes support query performance for:

- notifications by user + createdAt desc
- documents by employee + uploadedAt desc
- employeeTasks by employee + dueDate
- employeeTasks by status + completedAt
- onboardingTemplates by active + updatedAt
- templateAssignments by employee + assignedAt

Vector index override:

- vectors.embedding configured for vector nearest-neighbor search, dimension 768.

Without these indexes, many production queries would fail or become slow.

---

## 8. Frontend Deep Dive

## 8.1 App Bootstrap

File: frontend/src/main.tsx

Provider stack includes:

- QueryClientProvider (React Query)
- AuthProvider (global auth state)
- Router (React Router)
- Toast notifications
- Firebase client setup (auth + optional analytics)

## 8.2 Route Graph and Role Segmentation

File: frontend/src/App.tsx

Public:

- /login
- /select-role (requires authenticated user with unresolved role)

Employee area (RoleGuard allow employee):

- /employee
- /employee/checklist
- /employee/documents
- /employee/faq
- /employee/chat
- /employee/contacts
- /employee/notifications

HR/admin area (RoleGuard allow hr/admin):

- /hr
- /hr/employees
- /hr/templates
- /hr/faqs
- /hr/email
- /hr/analytics

## 8.3 Auth State Machine in Frontend

File: frontend/src/state/auth.tsx

Authentication sources:

- Firebase email/password
- Google popup login
- demo login route that stores JWT in sessionStorage

State transitions:

1. onAuthStateChanged starts user resolution.
2. Fetch `/api/employees/me` for full profile.
3. If backend is unavailable, fallback to token claims for role.
4. If role is null, user is pushed to role selection flow.
5. `selectRole` posts to backend and refreshes Firebase token to include new custom claim.

This design makes role claim propagation immediate after assignment.

## 8.4 API Transport Layer

File: frontend/src/config/api.ts

Behavior:

- Uses `VITE_API_URL` as base URL.
- Auto-adds bearer token.
- Supports JSON and FormData requests.
- Throws normalized Error on non-2xx responses.
- Returns `json.data` from backend envelope.

Result:

- Pages consume clean typed payloads and avoid repetitive fetch boilerplate.

## 8.5 Layout and Navigation System

File: frontend/src/components/layout/AppLayout.tsx

Main UX shell features:

- Responsive sidebar with mobile overlay.
- Different navigation map per role.
- Header shows portal context and current route.
- User footer with quick logout.

This keeps feature pages focused on business content, not shell code.

## 8.6 State Fetching Pattern in Pages

Pattern used in employee and HR pages:

- useQuery for reads.
- useMutation for updates.
- query invalidation after successful writes.
- toast feedback for async action states.

Examples:

- EmployeeHomePage reads tasks + documents and computes progress.
- HrDashboardPage reads summary + activity feed and displays KPI cards.

## 8.7 Design System and Styling

- Tailwind CSS with custom navy palette tokens.
- Reusable primitives: StatCard, ProgressCircle, StatusBadge, Skeleton, Modal, PageHeader.
- Animation utilities used for smooth dashboard rendering.

Outcome:

- Consistent UI semantics between employee and HR portals.

---

## 9. Feature-by-Feature Workflow Mapping

## 9.1 Login and Role Setup

1. User signs in (Firebase or demo).
2. App resolves user profile and role.
3. If role missing, role selection page calls `/api/auth/set-role`.
4. Backend validates permission and stores role.
5. Firebase custom claim refreshed.
6. User routed to role-appropriate portal.

## 9.2 Template Assignment to Task Execution

1. HR creates template with task definitions (`dayOffset`, priority, category).
2. HR assigns template to employee.
3. Backend generates concrete tasks with due dates.
4. Employee sees tasks in checklist/home page.
5. Employee marks start/complete.
6. HR dashboard completion metrics update after next fetch.

## 9.3 Document Upload and Review

1. Employee uploads file in frontend.
2. Backend validates MIME and size.
3. File is uploaded to Firebase Storage.
4. Firestore document metadata is stored.
5. HR updates status verified/rejected.
6. Employee sees current document state.

## 9.4 FAQ and AI Support

1. HR manages FAQ entries.
2. Employee can browse/search FAQ list.
3. Employee asks chatbot question.
4. Backend RAG pipeline retrieves relevant policy chunks.
5. Gemini generates bounded answer with source references.

## 9.5 Notifications and Reminders

1. Notification records are created in Firestore.
2. Frontend fetches latest notifications by user.
3. User marks read or read-all.
4. Backend can emit real-time events to `user:<id>` room.
5. HR can send reminder email via Brevo template endpoint.

## 9.6 HR Dashboard and Reporting

1. HR dashboard calls `/api/admin/dashboard` and `/api/admin/activity`.
2. Backend computes metrics from snapshot reads.
3. UI shows KPIs, trends, and recent actions.
4. HR uses this to identify bottlenecks and overdue onboarding items.

---

## 10. Deployment and Runtime Operations

## 10.1 Why Split Frontend and Backend Hosting

Documented in DEPLOYMENT.md:

- Frontend deploys well on Vercel (static SPA build).
- Backend should run on long-lived container host (Render/Railway/Fly/Cloud Run).
- Reason: persistent HTTP + Socket.IO process is not ideal for serverless function model.

## 10.2 Frontend Deployment Details

- Build command: `npm run build`.
- Output directory: `dist`.
- SPA route rewrite configured in frontend/vercel.json.
- Must set Firebase envs + `VITE_API_URL`.

## 10.3 Backend Deployment Details

Docker file uses multi-stage build:

1. deps stage: install all dependencies.
2. build stage: compile TypeScript to dist.
3. runtime stage: install production deps only and run `node dist/index.js`.

Health endpoint:

- `GET /health`.

Critical runtime envs:

- JWT secret
- client origin
- Firebase project + storage + credentials
- Brevo API key and sender/template config
- optional Gemini API + model

## 10.4 Firestore Index Deployment

Command:

- `npm run firestore:indexes`

This deploys indexes from firestore.indexes.json via firebase-tools.

---

## 11. Development Workflow for Contributors

## 11.1 Local Setup Flow

1. Install dependencies in frontend and backend.
2. Configure backend env values.
3. Start backend (`npm run dev`) and frontend (`npm run dev`) in separate terminals.
4. Optional: run seed and embedding scripts for realistic data + AI context.

## 11.2 Common Commands

Backend:

- dev: watch mode
- build: TypeScript compile
- typecheck: static checks
- test: Vitest run

Frontend:

- dev: Vite server
- build: TypeScript + Vite build
- lint: ESLint

## 11.3 Testing Status

- Current explicit test coverage is minimal (template service test file exists).
- Most behaviors are validated at runtime/integration level right now.

Suggested next step for engineering maturity:

- Add API integration tests for role, task, and document flows.
- Add frontend page-level tests for key user journeys.

---

## 12. Under-the-Hood Behavior Notes (Important)

## 12.1 Token Strategy Is Intentionally Hybrid

The backend supports both Firebase tokens and internal JWT tokens. This is why demo mode works without full Firebase login while still sharing the same role guard system.

## 12.2 Role Truth Can Come from Claims or Firestore

When role claim is missing, backend falls back to Firestore `users` role. This improves resilience during claim refresh timing windows.

## 12.3 Reporting Is Computed On Demand

Dashboard metrics come from live collection scans and filtering logic. This is simple and accurate for moderate size, but could become expensive at larger scale.

## 12.4 AI Answers Are Grounded by Vector Retrieval

The chatbot does not just ask an LLM blindly. It first retrieves knowledge chunks and then injects only that context into generation, reducing hallucination risk.

## 12.5 File Upload Uses Memory Buffer

Multer memory storage is easy for small-medium files and immediate storage upload, but large traffic may need streaming strategy in future.

---

## 13. Current Strengths and Practical Limitations

## Strengths

- Clean separation: route layer vs service layer.
- Strong auth and role gate patterns.
- Unified response envelope and error model.
- Useful onboarding domain model (templates -> assignments -> tasks).
- RAG-enabled assistant with explicit policy guardrails.
- Clear deployment split for SPA + persistent backend.

## Limitations

- Limited automated tests compared to feature surface.
- Analytics aggregation currently not precomputed.
- Audit log endpoint currently returns empty list.
- Real-time emission path exists, but usage depends on calling contexts.
- Some list endpoints do not yet use advanced pagination.

---

## 14. How Everything Works Together as One System

JrGuide is a workflow orchestration product, not only a CRUD app.

- HR defines onboarding policy as reusable templates.
- Backend materializes policy into employee-specific task instances.
- Employees execute tasks and submit documents.
- HR monitors completion and sends interventions.
- FAQ + AI assistant reduces repetitive support load.
- Notifications and email keep users engaged and informed.

So the architecture supports a full lifecycle:

- Define -> Assign -> Execute -> Verify -> Measure -> Improve.

That lifecycle is implemented through connected modules across React UI, Express APIs, Firestore documents, Firebase auth claims, AI retrieval, and operational deployment patterns.

---

## 15. Quick Technical Cheat Sheet

Frontend stack:

- React 19
- React Router 7
- React Query 5
- Tailwind 4
- Firebase Web SDK

Backend stack:

- Node + Express 5
- TypeScript
- Firebase Admin (Auth + Firestore + Storage)
- Socket.IO 4
- Zod validation
- Winston logging
- Brevo email API
- Google GenAI

Core collections:

- users, onboardingTemplates, templateAssignments, employeeTasks, documents, faqs, contacts, notifications, vectors

Core workflows:

- auth and role assignment
- template-driven task generation
- document upload and verification
- FAQ management
- RAG chatbot query
- HR dashboard analytics

---

This document was written as a complete technical explanation of the current codebase implementation and runtime behavior, using direct inspection of project files and configuration.
