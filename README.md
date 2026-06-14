# JrGuide

JrGuide is a role-based employee onboarding platform built to streamline and measure the onboarding experience. It is designed for two primary user groups:
1. **Employees:** Complete assigned onboarding tasks, upload required documents, read FAQs, and ask company-related questions to an AI assistant.
2. **HR and Administrators:** Manage employees, create reusable onboarding templates, assign tasks, monitor progress via analytics, review uploaded documents, and send automated reminders.

---

## 🌟 Key Features

### Role-Based Access Control (RBAC)
- **Employee Portal:** Dedicated interface for new hires to see their checklist, upload documents, and get help.
- **HR/Admin Dashboard:** Centralized management hub to track all employee progress, manage templates, and review documentation.
- Dual-token strategy supporting both Firebase-auth users and demo JWT users.

### Template-Driven Onboarding
- **Reusable Templates:** HR can create onboarding templates with specific tasks, day offsets, priorities, and categories.
- **Automated Task Generation:** Assigning a template to an employee automatically generates concrete, date-driven tasks based on the template's timeline.

### Document Management & Verification
- **Secure Uploads:** Employees can securely upload required documents (PDF, PNG, JPEG, up to 10MB) directly to Firebase Storage.
- **HR Review Workflow:** HR can track document submissions and mark them as verified or rejected, with employees seeing real-time status updates.

### AI Assistant & FAQ (Retrieval-Augmented Generation)
- **Interactive FAQ:** A curated list of company policies and frequently asked questions managed by HR.
- **AI Chatbot (RAG):** Powered by Google Gemini, the AI answers employee questions using semantic search over the company's knowledge base. Built-in guardrails ensure the AI stays strictly on-topic (HR/onboarding/policies) and cites its sources, reducing hallucinations.

### Real-Time Notifications & Reminders
- **In-App Notifications:** Real-time updates delivered via Socket.IO for important events.
- **Email Reminders:** Integrated with Brevo to send automated reminder emails to employees with pending tasks or documents.

### Analytics & Reporting Dashboard
- **Progress Tracking:** HR can view aggregated metrics, completion rates, and identify bottlenecks in the onboarding pipeline.
- **Activity Feed:** Live feed of completed tasks and document events.

---

## 🏗 Architecture & Tech Stack

JrGuide is a modern, full-stack TypeScript system divided into a React Single Page Application (SPA) and an Express backend API.

### Frontend
- **Framework:** React 19 + React Router 7
- **State Management:** React Query 5 (server state) + Context API
- **Styling:** Tailwind CSS 4 with a custom design system
- **SDKs:** Firebase Web SDK

### Backend
- **Framework:** Node.js + Express 5
- **Language:** TypeScript
- **Database & Auth:** Firebase Admin (Auth, Firestore, Storage)
- **Real-Time:** Socket.IO 4
- **Validation:** Zod schemas
- **AI/LLM:** Google GenAI (Gemini for embeddings and generation)
- **Email:** Brevo API

### Data Modeling & Storage
- **Firestore Collections:** `users`, `onboardingTemplates`, `templateAssignments`, `employeeTasks`, `documents`, `faqs`, `contacts`, `notifications`, `vectors`.
- **Vector Search:** Utilizes Firestore's native vector similarity search to power the AI chatbot.

---

## 🚀 How It Works (End-to-End Workflow)

1. **Setup & Role Assignment:** Users sign in. If a role is not assigned, the app securely sets their role via the backend (`employee`, `hr`, or `admin`), which updates the Firebase custom claims and Firestore.
2. **Template Creation:** HR creates onboarding templates outlining the standard tasks for a new hire.
3. **Assignment:** HR assigns a template to an employee. The backend orchestrates batch writes to generate a personalized checklist of concrete tasks with calculated due dates.
4. **Execution:** The employee logs in, views their dashboard, checks off tasks, and uploads requested documents.
5. **Review:** HR receives notifications of uploads, reviews the documents, and approves or rejects them.
6. **Support:** If the employee has questions, they can consult the FAQ or ask the AI Chatbot, which searches the vectorized knowledge base to provide accurate, context-aware answers.
7. **Monitoring:** HR monitors overall company onboarding health via the analytics dashboard, optionally triggering email reminders to nudge pending tasks.

---

## 💻 Development Workflow

### Local Setup
1. Clone the repository.
2. Install dependencies in both `/frontend` and `/backend` directories (`npm install`).
3. Configure your `.env` variables (Firebase credentials, Brevo API key, Gemini API key, JWT Secret, etc.).
4. Start the frontend: `npm run dev` (inside `/frontend`)
5. Start the backend: `npm run dev` (inside `/backend`)


