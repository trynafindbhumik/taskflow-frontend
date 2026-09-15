export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  creator_id?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id?: string;
  creator_id?: string;
  due_date?: string;
  subtasks?: Subtask[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProjectMember {
  user_id: string;
  project_id: string;
  user: User;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'task_assigned' | 'task_updated' | 'project_invite' | 'deadline';
  created_at: string;
  link?: string;
  user_id: string;
}

export interface SearchResult {
  projects: Project[];
  tasks: (Task & { project_name: string })[];
}

export interface DeadlineTask extends Task {
  project_name: string;
  assignee?: User;
}

export interface DeadlineResponse {
  tasks: DeadlineTask[];
  total: number;
  has_more: boolean;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: Array<{ tool: string; params: Record<string, unknown> }>;
  tool_results?: Array<{ tool: string; result: Record<string, unknown> }>;
  created_at?: string;
}

export interface AiSubtaskItem {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface AiProposalItem {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
  subtasks?: Array<string | AiSubtaskItem>;
}

export interface AiDraftProposal {
  id: string;
  title: string;
  description?: string;
  proposal_data: {
    project_name: string;
    description?: string;
    tasks: AiProposalItem[];
    suggested_invites?: string[];
  };
  status: 'pending' | 'executed' | 'cancelled';
  created_at?: string;
}

export interface ProjectStatsArtifactData {
  total_projects: number;
  overall_completion_rate: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  projects: Array<{
    name: string;
    progress: number;
    tasks_completed: number;
    tasks_total: number;
    status: string;
  }>;
}

export interface OverdueTasksArtifactData {
  total_overdue: number;
  critical_count: number;
  items: Array<{
    id: string;
    title: string;
    project_name: string;
    assignee: string;
    due_date: string;
    days_overdue: number;
    priority: string;
  }>;
}

export interface TeamWorkloadArtifactData {
  total_members: number;
  workload_summary: Array<{
    member_name: string;
    email: string;
    assigned_count: number;
    status: 'Overloaded' | 'Optimal' | 'Available';
    top_task?: string;
  }>;
}

export interface AiExecutedAction {
  tool: string;
  params: Record<string, unknown>;
  result: Record<string, unknown>;
}

export type AiExecutionLogItem = AiExecutedAction;

export interface AiChatResponse {
  conversation_id: string;
  reply: string;
  artifact_type?: 'plan' | 'stats' | 'overdue' | 'workload';
  executed_actions?: AiExecutedAction[];
  proposal?: AiDraftProposal;
  stats_data?: ProjectStatsArtifactData;
  overdue_data?: OverdueTasksArtifactData;
  workload_data?: TeamWorkloadArtifactData;
}

export interface AiConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}
