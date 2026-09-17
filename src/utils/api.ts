import { auth } from './auth';
import type { AiChatResponse, AiConversation, AiMessage } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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
  conversation_id?: string,
  attachment?: { filename: string; content: string; mimeType?: string },
  selected_project_id?: string
): Promise<AiChatResponse> {
  return await apiFetch<AiChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id, attachment, selected_project_id }),
  });
}

export async function getAiConversations(): Promise<AiConversation[]> {
  return await apiFetch<AiConversation[]>('/ai/conversations');
}

export async function getAiConversationMessages(id: string): Promise<AiMessage[]> {
  return await apiFetch<AiMessage[]>(`/ai/conversations/${id}/messages`);
}

export async function deleteAiConversation(id: string): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>(`/ai/conversations/${id}`, {
    method: 'DELETE',
  });
}

export async function executeAiProposal(
  proposalId: string
): Promise<{ message: string; project_id?: string }> {
  return await apiFetch<{ message: string; project_id?: string }>(
    `/ai/proposals/${proposalId}/execute`,
    {
      method: 'POST',
    }
  );
}

export async function cancelAiProposal(proposalId: string): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>(`/ai/proposals/${proposalId}/cancel`, {
    method: 'POST',
  });
}
