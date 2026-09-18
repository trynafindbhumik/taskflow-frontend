# TaskFlow Frontend

> A modern, responsive task and project management application built with Next.js App Router, TypeScript, CSS Modules, and Socket.IO.

TaskFlow allows teams to organize projects, track tasks across interactive Kanban boards and list views, collaborate with team members, manage subtasks, leverage an AI workspace assistant, and stay updated with real-time notifications.

---

## 1. Overview

**What it is:** The frontend web application for TaskFlow. It connects directly to the TaskFlow Backend API to provide authentic task management, project organization, role-based access, and real-time collaboration.

**Key Features:**

- **Authentication & Security** — Complete auth workflow (Login, Register, Forgot Password, Reset Password, Email Verification) with Zod validation, JWT authentication in secure cookies, and Google OAuth support.
- **Interactive Dashboard** — Real-time stat summary cards (completed/in-progress/high-priority tasks and total projects), project overview grid, and paginated upcoming deadline tracker.
- **Project Management** — Create, edit, and delete projects with customizable views (grid vs. list), pagination, sorting, and project-level context actions.
- **Kanban Board & List Views** — Multi-column board (To Do, In Progress, Done) with smooth drag-and-drop status moves and reordering. Includes inline filtering by priority, status, and assignee.
- **Tasks & Subtasks** — Create tasks via modal dialogs, view/edit details in slide-over side panels, manage interactive subtask checklists, and toggle status directly.
- **AI Workspace Assistant** — Integrated AI assistant drawer for task breakdown, project planning assistance, workload summaries, and smart suggestions.
- **Real-time Synchronization** — Integrated Socket.IO client for live updates across team members.
- **Global Search (`⌘K`)** — Instant modal search with debounced querying across projects and tasks.
- **Team Collaboration & Invitations** — Manage project members and invite new team members via tokenized email invitations.
- **Notification Center** — Real-time notification drawer with unread count badge, mark-as-read, and clear-all actions.
- **User Settings & Customization** — Theme toggle (Dark / Light mode), notification preferences, and default board view settings.

---

## 2. Tech Stack

| Layer / Concern      | Technology                                         |
| :------------------- | :------------------------------------------------- |
| **Framework**        | Next.js 16 (App Router)                            |
| **Language**         | TypeScript (Strict mode)                           |
| **Styling**          | CSS Modules + Custom Design Tokens (CSS Variables) |
| **Form Handling**    | React Hook Form + Zod Schema Validation            |
| **Real-time & API**  | Fetch API + Socket.IO Client                       |
| **Auth & State**     | `js-cookie` (JWT Token) + `localStorage`           |
| **Icons**            | Lucide React                                       |
| **Code Quality**     | ESLint 9 + Prettier                                |
| **Containerization** | Docker (Multi-stage build) + Docker Compose        |

---

## 3. Project Structure

```
taskflow-frontend/
├── public/                 # Static assets (favicons, public images)
├── src/
│   ├── app/                # Next.js App Router (pages and protected layout routes)
│   │   ├── (protected)/    # Authenticated routes (dashboard, projects, settings, AI)
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── forgot-password/# Password recovery flow
│   │   ├── reset-password/ # Password reset handler
│   │   └── verify-email/   # Email verification handler
│   ├── components/         # Reusable UI components (Kanban board, AI, modals, forms)
│   ├── hooks/              # Custom React hooks
│   ├── proxy.ts            # Route protection and redirection proxy
│   └── utils/              # API clients, auth helpers, socket connection, & types
├── Dockerfile              # Production multi-stage Docker build
├── docker-compose.yml      # Container orchestration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 4. Environment Variables

Create a `.env.local` file in the root of `taskflow-frontend` with the following configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
APP_PORT=3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

## 5. Running Locally

### Option A — Local Development (pnpm)

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local

# 3. Start the Next.js development server
pnpm dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### Option B — Docker Containerization

```bash
# Build and run the frontend container
docker compose up --build
```

---

## 6. Development Scripts

- `pnpm dev` — Starts the Next.js development server
- `pnpm build` — Builds the optimized production application
- `pnpm start` — Starts the production Next.js server
- `pnpm lint` — Runs ESLint checks
- `pnpm format` — Formats all files using Prettier

---

## 7. License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.

---

_Built by Bhumik Jain · TaskFlow_
