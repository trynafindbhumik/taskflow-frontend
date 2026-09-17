# TaskFlow Frontend

> A modern, opinionated task management interface built with Next.js App Router, Tailwind CSS / Custom Tokens, and MSW for offline & API mocking.

TaskFlow lets teams create projects, manage tasks across status columns, assign work to members, toggle subtasks, interact with an AI workspace assistant, and track upcoming deadlines — all inside a clean, dark-mode-capable UI.

**[▶ Watch the demo video](https://www.dropbox.com/scl/fi/6lgzagk81lul7y5b8wlvn/TaskFlow-demo.mkv?rlkey=3qkrocmqo7x9gy1ybpi89g3ut&st=lvpht631&dl=0)**

---

## 1. Overview

**What it is:** A single-page-application frontend for TaskFlow. You can log in, create projects, drag tasks between status columns, filter by priority and assignee, manage subtasks, invite team members via email tokens, interact with the AI assistant, and track upcoming deadlines.

**What it does (feature by feature):**

- **Authentication** — Login and Register forms with Zod + React Hook Form validation, JWT stored in cookies, user info persisted in `localStorage`. Google OAuth support.
- **Dashboard** — Greeting, live stat cards (completed/in-progress/high-priority/projects), project cards grid, and a paginated upcoming-deadlines list.
- **Projects** — Full CRUD with grid and list view toggles, pagination, and per-card context menus.
- **Project Detail (Kanban board)** — Three-column board (To Do / In Progress / Done) with drag-and-drop reordering and cross-column moves. Also ships a list view with inline filters.
- **Task & Subtask Management** — Create via modal, edit via slide-in side sheet, quick status-cycle on the status button. Interactive subtask checklists. Optimistic UI updates.
- **AI Agent Workspace Assistant** — Interactive AI modal/drawer for workspace querying, project planning, workload analysis, and executing draft proposals.
- **Filters** — Search, status, priority, and assignee dropdowns, live-filtering visible tasks.
- **Members & Invitations** — Add/remove project members, email invite modal with token verification.
- **Notifications** — Bell icon with unread badge, panel with mark-as-read and mark-all-read.
- **Global Search** — `⌘K` modal, debounced 300 ms, searches projects and tasks.
- **Settings & Dark Mode** — Light/dark theme toggle (persists via `localStorage`), notification preferences, default board view settings.

---

## 2. Tech Stack

| Concern | Choice |
| :--- | :--- |
| **Framework** | Next.js 16.2.3 (App Router) |
| **Language** | TypeScript (strict) |
| **Styling** | CSS Modules + custom design tokens via CSS variables |
| **Forms** | React Hook Form + Zod |
| **Mocking** | MSW 2.x (browser service worker) |
| **Auth State** | `js-cookie` (token) + `localStorage` (user object) |
| **Icons** | Lucide React |
| **Linting/Formatting** | ESLint + Prettier |
| **Containerisation** | Docker (multi-stage build) + Docker Compose |

---

## 3. Running Locally

### Option A — Docker (Recommended)

```bash
# 1. Create environment file
cp .env.example .env

# 2. Build and start container
docker compose up --build
```
App will be live at `http://localhost:3000`.

### Option B — Local dev server (pnpm)

```bash
# 1. Install dependencies
pnpm install

# 2. Environment
cp .env.example .env.local

# 3. Start dev server
pnpm dev
```

---

## 4. Test Credentials

Log in with:

```
Email:    test@example.com
Password: password123
```

---

## 5. License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.

---

_Built by Bhumik Jain · TaskFlow_
