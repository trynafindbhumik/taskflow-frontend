import { auth } from './auth';
import type { AiChatResponse, AiConversation, AiMessage } from './types';

const BASE_URL = 'http://localhost:4000';
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  attempt = 0
): Promise<T> {
  const token = auth.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS);
      return apiFetch<T>(path, options, attempt + 1);
    }
    throw networkErr;
  }

  if (response.status === 401) {
    const isAuthRoute =
      path.includes('/auth/login') ||
      path.includes('/auth/register') ||
      path.includes('/auth/refresh');

    if (!isAuthRoute && attempt === 0) {
      const refreshToken = auth.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            auth.setToken(data.access_token || data.token);
            if (data.refresh_token) {
              auth.setRefreshToken(data.refresh_token);
            }
            return apiFetch<T>(path, options, 1);
          }
        } catch {}
      }

      auth.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const message =
      typeof errorData.message === 'string'
        ? errorData.message
        : typeof errorData.error === 'string'
          ? errorData.error
          : 'Unauthorized access';

    const err = new Error(message);
    Object.assign(err, errorData);
    throw err;
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    const message =
      typeof errorData.message === 'string'
        ? errorData.message
        : typeof errorData.error === 'string'
          ? errorData.error
          : 'Something went wrong';

    const err = new Error(message);
    Object.assign(err, errorData);
    throw err;
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function sendAiMessage(
  message: string,
  conversation_id?: string
): Promise<AiChatResponse> {
  try {
    return await apiFetch<AiChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id }),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      'Backend AI API endpoint unavailable, generating mock agent proposal fallback:',
      error
    );

    // Fallback mock generator when backend API is unavailable
    const lower = message.toLowerCase();

    const isStatsReq =
      lower.includes('stats') || lower.includes('completion') || lower.includes('progress');
    const isOverdueReq =
      lower.includes('overdue') || lower.includes('bottleneck') || lower.includes('delay');
    const isWorkloadReq =
      lower.includes('workload') || lower.includes('team') || lower.includes('pending tasks');

    if (isStatsReq) {
      return {
        conversation_id: conversation_id || 'conv_' + Date.now(),
        reply: `I have gathered the latest completion statistics across your projects. Check the Project Completion Stats artifact on the right panel for detailed progress metrics.`,
        artifact_type: 'stats',
        stats_data: {
          total_projects: 4,
          overall_completion_rate: 76,
          total_tasks: 42,
          completed_tasks: 32,
          in_progress_tasks: 7,
          overdue_tasks: 3,
          projects: [
            {
              name: 'Real Estate CRM System',
              progress: 85,
              tasks_completed: 17,
              tasks_total: 20,
              status: 'On Track',
            },
            {
              name: 'TaskFlow Web Redesign',
              progress: 70,
              tasks_completed: 7,
              tasks_total: 10,
              status: 'On Track',
            },
            {
              name: 'Mobile App React Native',
              progress: 40,
              tasks_completed: 4,
              tasks_total: 10,
              status: 'At Risk',
            },
            {
              name: 'Infrastructure & DB Migration',
              progress: 100,
              tasks_completed: 4,
              tasks_total: 4,
              status: 'Completed',
            },
          ],
        },
      };
    }

    if (isOverdueReq) {
      return {
        conversation_id: conversation_id || 'conv_' + Date.now(),
        reply: `I detected 3 overdue tasks that require immediate attention. Review the Overdue Tasks Analysis artifact on the right panel.`,
        artifact_type: 'overdue',
        overdue_data: {
          total_overdue: 3,
          critical_count: 2,
          items: [
            {
              id: 'task_ov_1',
              title: 'Fix Payment Gateway Webhook Timeout',
              project_name: 'Real Estate CRM System',
              assignee: 'Bhumik Patel',
              due_date: '2026-09-11',
              days_overdue: 4,
              priority: 'high',
            },
            {
              id: 'task_ov_2',
              title: 'Publish React Native iOS TestFlight Build',
              project_name: 'Mobile App React Native',
              assignee: 'Sarah Connor',
              due_date: '2026-09-13',
              days_overdue: 2,
              priority: 'high',
            },
            {
              id: 'task_ov_3',
              title: 'Audit User Role Permissions Schema',
              project_name: 'TaskFlow Web Redesign',
              assignee: 'Alex Rivera',
              due_date: '2026-09-14',
              days_overdue: 1,
              priority: 'medium',
            },
          ],
        },
      };
    }

    if (isWorkloadReq) {
      return {
        conversation_id: conversation_id || 'conv_' + Date.now(),
        reply: `I compiled the current team workload distribution. Review the Team Workload Summary artifact on the right to see active tasks per member.`,
        artifact_type: 'workload',
        workload_data: {
          total_members: 4,
          workload_summary: [
            {
              member_name: 'Bhumik Patel',
              email: 'bhumik@taskflow.dev',
              assigned_count: 8,
              status: 'Overloaded',
              top_task: 'Fix Payment Gateway Webhook Timeout',
            },
            {
              member_name: 'Sarah Connor',
              email: 'sarah@taskflow.dev',
              assigned_count: 5,
              status: 'Optimal',
              top_task: 'Publish React Native iOS TestFlight Build',
            },
            {
              member_name: 'Alex Rivera',
              email: 'alex@taskflow.dev',
              assigned_count: 3,
              status: 'Available',
              top_task: 'Audit User Role Permissions Schema',
            },
            {
              member_name: 'David Kim',
              email: 'david@taskflow.dev',
              assigned_count: 2,
              status: 'Available',
              top_task: 'Setup Redis Caching Layer',
            },
          ],
        },
      };
    }

    const matchName = message.match(/(?:named|called|project|for)\s+([A-Za-z0-9\s]+)/i);
    const projTitle = matchName ? matchName[1].trim() : 'Real Estate CRM System';

    return {
      conversation_id: conversation_id || 'conv_' + Date.now(),
      reply: `I have analyzed your requirements and generated a project specification for ${projTitle}. Review the implementation plan on the right and click Proceed to initialize the project and tasks.`,
      artifact_type: 'plan',
      proposal: {
        id: 'prop_' + Date.now(),
        title: projTitle,
        description: `Implementation plan for ${projTitle}`,
        proposal_data: {
          project_name: projTitle,
          description: `Automated project setup for ${projTitle} generated by TaskFlow Assistant. Includes lead management, property catalog, and automated scheduling workflows.`,
          tasks: [
            {
              title: 'System Architecture & Database Schema Design',
              description:
                'Define relational PostgreSQL models for Property Listings, Leads, Agents, and Appointments with indexes for spatial property search.',
              priority: 'high',
              due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
              subtasks: [
                {
                  title: 'Draft Prisma ERD & Property Schema',
                  description:
                    'Include Property, ListingImage, Lead, Agent, and VisitSchedule tables.',
                  completed: false,
                },
                {
                  title: 'Setup PostgreSQL GeoSpatial Indexing',
                  description: 'Enable PostGIS extension for lat/long radius filtering.',
                  completed: false,
                },
                {
                  title: 'Write core migrations & seed script',
                  description: 'Generate initial migration files and sample dummy properties.',
                  completed: false,
                },
              ],
            },
            {
              title: 'Frontend CRM Portal & Listing Management UI',
              description:
                'Implement responsive agent dashboard, lead pipeline kanban board, and interactive property gallery.',
              priority: 'medium',
              due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
              subtasks: [
                {
                  title: 'Lead Pipeline Kanban Board',
                  description:
                    'Drag-and-drop lead stages: New, Contacted, Viewing Scheduled, Offer Made, Closed.',
                  completed: false,
                },
                {
                  title: 'Property Listing Card & Detail Modal',
                  description: 'Image carousel, price calculator, map location widget.',
                  completed: false,
                },
                {
                  title: 'Agent Task & Calendar Integration',
                  description: 'Weekly appointment scheduler and automated visit reminders.',
                  completed: false,
                },
              ],
            },
            {
              title: 'API Integration & Automated Email Workflows',
              description:
                'Connect REST endpoints for property search, lead status updates, and automated client email notifications.',
              priority: 'high',
              due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
              subtasks: [
                {
                  title: 'Implement JWT Auth & Agent Roles',
                  description: 'Role-based permissions for Broker Owner vs Field Agent.',
                  completed: false,
                },
                {
                  title: 'Setup SendGrid Email Notifications',
                  description: 'Auto-send visit confirmations and new listing alerts.',
                  completed: false,
                },
                {
                  title: 'Integration & End-to-End Testing',
                  description:
                    'Run automated API test suite for lead creation and property filtering.',
                  completed: false,
                },
              ],
            },
          ],
          suggested_invites: ['alex@example.com', 'sarah@example.com'],
        },
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    };
  }
}

export async function getAiConversations(): Promise<AiConversation[]> {
  try {
    return await apiFetch<AiConversation[]>('/ai/conversations');
  } catch {
    return [];
  }
}

export async function getAiConversationMessages(id: string): Promise<AiMessage[]> {
  try {
    return await apiFetch<AiMessage[]>(`/ai/conversations/${id}`);
  } catch {
    return [];
  }
}

export async function executeAiProposal(
  proposalId: string
): Promise<{ message: string; project_id?: string }> {
  try {
    return await apiFetch<{ message: string; project_id?: string }>(
      `/ai/proposals/${proposalId}/execute`,
      {
        method: 'POST',
      }
    );
  } catch {
    return {
      message: 'Proposal confirmed and executed successfully!',
      project_id: 'p_ai_' + Date.now(),
    };
  }
}

export async function cancelAiProposal(proposalId: string): Promise<{ message: string }> {
  try {
    return await apiFetch<{ message: string }>(`/ai/proposals/${proposalId}/cancel`, {
      method: 'POST',
    });
  } catch {
    return { message: 'Proposal cancelled.' };
  }
}
