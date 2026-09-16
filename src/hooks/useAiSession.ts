'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import type {
  StoredSession,
  LocalChatMessage,
} from '@/components/ai/subcomponents/ChatHistoryDrawer';
import { useToast } from '@/components/ui/toast/ToastContext';
import { sendAiMessage, executeAiProposal, apiFetch } from '@/utils/api';
import type {
  AiDraftProposal,
  ProjectStatsArtifactData,
  OverdueTasksArtifactData,
  TeamWorkloadArtifactData,
  AiExecutionLogItem,
} from '@/utils/types';

export interface UseAiSessionOptions {
  initialSessionId?: string;
}

export function useAiSession({ initialSessionId }: UseAiSessionOptions = {}) {
  const { showToast } = useToast();
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string>(
    initialSessionId || `session_${Math.random().toString(36).slice(2, 9)}`
  );

  const [messages, setMessages] = useState<LocalChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! 👋 Welcome to TaskFlow AI!

I'm here to help you with:

- ✅ Project creation & planning
- ✅ Task & subtask management
- ✅ Team workload analysis
- ✅ Bottleneck tracking
- ✅ Requirement document processing

How can I assist you today? Whether you want to create a new project, manage tasks, or analyze team performance — just let me know! 🚀`,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'stats' | 'overdue' | 'workload' | 'logs'>(
    'plan'
  );

  const [activeProposal, setActiveProposal] = useState<AiDraftProposal | null>(null);
  const [activeStats, setActiveStats] = useState<ProjectStatsArtifactData | null>(null);
  const [activeOverdue, setActiveOverdue] = useState<OverdueTasksArtifactData | null>(null);
  const [activeWorkload, setActiveWorkload] = useState<TeamWorkloadArtifactData | null>(null);
  const [executionLogs, setExecutionLogs] = useState<AiExecutionLogItem[]>([]);

  const [showHistory, setShowHistory] = useState(false);
  const [storedSessions, setStoredSessions] = useState<StoredSession[]>([]);

  const fetchRemoteSessions = useCallback(async () => {
    try {
      const remoteConvs = (await apiFetch('/ai/sessions')) as Array<{
        id: string;
        title: string;
        created_at: string;
        updated_at: string;
        last_message: string;
      }>;

      if (remoteConvs && Array.isArray(remoteConvs)) {
        const formatted: StoredSession[] = remoteConvs.map((c) => ({
          id: c.id,
          title: c.title || 'AI Chat',
          timestamp: new Date(c.updated_at || c.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          messages: [],
          activeTab: 'plan',
        }));
        setStoredSessions(formatted);
      }
    } catch {}
  }, []);

  const fetchWorkspaceAnalytics = useCallback(async () => {
    try {
      const analytics = (await apiFetch('/ai/analytics')) as {
        stats: ProjectStatsArtifactData;
        overdue: OverdueTasksArtifactData;
        workload: TeamWorkloadArtifactData;
      };
      if (analytics) {
        if (analytics.stats) setActiveStats(analytics.stats);
        if (analytics.overdue) setActiveOverdue(analytics.overdue);
        if (analytics.workload) setActiveWorkload(analytics.workload);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchRemoteSessions();
    fetchWorkspaceAnalytics();
  }, [fetchRemoteSessions, fetchWorkspaceAnalytics]);

  useEffect(() => {
    if (!initialSessionId) return;

    const loadRemoteSession = async () => {
      try {
        const res = await apiFetch(`/ai/sessions/${initialSessionId}/history`);
        let historyMsgs: any[] = [];
        let remoteProposal: any = null;

        if (Array.isArray(res)) {
          historyMsgs = res;
        } else if (res && typeof res === 'object') {
          historyMsgs = (res as any).messages || [];
          remoteProposal = (res as any).proposal || null;
        }

        if (historyMsgs && historyMsgs.length > 0) {
          const formattedMsgs: LocalChatMessage[] = historyMsgs.map((h: any) => ({
            id: h.id,
            role: h.role,
            content: h.content
              .replace(/<\/?user_message>/g, '')
              .replace(/<user_attachment[\s\S]*?<\/user_attachment>/g, '')
              .trim(),
            executedActions: h.executed_actions,
            artifactType: h.artifact_type,
          }));
          setMessages(formattedMsgs);

          if (remoteProposal) {
            setActiveProposal(remoteProposal);
            setActiveTab('plan');
          } else {
            const lastArtifactMsg = [...historyMsgs].reverse().find((m: any) => m.payload);
            if (lastArtifactMsg && lastArtifactMsg.payload) {
              if (lastArtifactMsg.artifact_type === 'plan') {
                setActiveProposal(lastArtifactMsg.payload);
                setActiveTab('plan');
              } else if (lastArtifactMsg.artifact_type === 'stats') {
                setActiveStats(lastArtifactMsg.payload);
                setActiveTab('stats');
              } else if (lastArtifactMsg.artifact_type === 'overdue') {
                setActiveOverdue(lastArtifactMsg.payload);
                setActiveTab('overdue');
              } else if (lastArtifactMsg.artifact_type === 'workload') {
                setActiveWorkload(lastArtifactMsg.payload);
                setActiveTab('workload');
              }
            }
          }
        }
      } catch {}
    };

    loadRemoteSession();
  }, [initialSessionId]);

  const handleSendMessage = useCallback(
    async (
      textToSend?: string,
      attachment?: { filename: string; content: string; mimeType?: string },
      selectedProjectId?: string
    ) => {
      const query = textToSend || input;
      if ((!query.trim() && !attachment) || isLoading) return;

      const userMsgContent = attachment
        ? `[Attached: ${attachment.filename}] ${query.trim()}`
        : query.trim();

      const userMsg: LocalChatMessage = {
        id: `usr_${Date.now()}`,
        role: 'user',
        content: userMsgContent,
      };

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      if (!textToSend) setInput('');
      setIsLoading(true);

      try {
        const res = await sendAiMessage(query.trim(), sessionId, attachment, selectedProjectId);

        const assistantMsg: LocalChatMessage = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: res.reply || 'Request processed successfully.',
          executedActions: res.executed_actions,
          proposal: res.proposal,
          artifactType: res.artifact_type,
          statsData: res.stats_data,
          overdueData: res.overdue_data,
          workloadData: res.workload_data,
        };

        const finalMsgs = [...nextMessages, assistantMsg];
        setMessages(finalMsgs);

        if (res.executed_actions && res.executed_actions.length > 0) {
          const newActions = res.executed_actions;
          setExecutionLogs((prev) => [...prev, ...newActions]);
        }

        if (res.proposal) {
          setActiveProposal(res.proposal);
          setActiveTab('plan');
        } else if (res.stats_data) {
          setActiveStats(res.stats_data);
          setActiveTab('stats');
        } else if (res.overdue_data) {
          setActiveOverdue(res.overdue_data);
          setActiveTab('overdue');
        } else if (res.workload_data) {
          setActiveWorkload(res.workload_data);
          setActiveTab('workload');
        }

        fetchRemoteSessions();
      } catch (err: unknown) {
        const errorMsg: LocalChatMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Failed to communicate with AI Assistant.'}`,
        };
        const finalMsgs = [...nextMessages, errorMsg];
        setMessages(finalMsgs);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, sessionId, fetchRemoteSessions]
  );

  const handleProceedPlan = useCallback(async () => {
    if (!activeProposal || activeProposal.status === 'executed') return;
    try {
      await executeAiProposal(activeProposal.id);
      setActiveProposal((prev) => (prev ? { ...prev, status: 'executed' } : null));
      showToast('Implementation Plan executed and project created successfully!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to execute plan', 'error');
    }
  }, [activeProposal, showToast]);

  const handleSelectSession = useCallback(
    async (session: StoredSession) => {
      setSessionId(session.id);
      setShowHistory(false);
      router.replace(`/ai/${session.id}`);

      try {
        const res = await apiFetch(`/ai/sessions/${session.id}/history`);
        let historyMsgs: any[] = [];
        let remoteProposal: any = null;

        if (Array.isArray(res)) {
          historyMsgs = res;
        } else if (res && typeof res === 'object') {
          historyMsgs = (res as any).messages || [];
          remoteProposal = (res as any).proposal || null;
        }

        if (historyMsgs && historyMsgs.length > 0) {
          const formattedMsgs: LocalChatMessage[] = historyMsgs.map((h: any) => ({
            id: h.id,
            role: h.role,
            content: h.content
              .replace(/<\/?user_message>/g, '')
              .replace(/<user_attachment[\s\S]*?<\/user_attachment>/g, '')
              .trim(),
            executedActions: h.executed_actions,
            artifactType: h.artifact_type,
          }));
          setMessages(formattedMsgs);

          if (remoteProposal) {
            setActiveProposal(remoteProposal);
            setActiveTab('plan');
          } else {
            const lastArtifactMsg = [...historyMsgs].reverse().find((m: any) => m.payload);
            if (lastArtifactMsg && lastArtifactMsg.payload) {
              if (lastArtifactMsg.artifact_type === 'plan') {
                setActiveProposal(lastArtifactMsg.payload);
                setActiveTab('plan');
              } else if (lastArtifactMsg.artifact_type === 'stats') {
                setActiveStats(lastArtifactMsg.payload);
                setActiveTab('stats');
              } else if (lastArtifactMsg.artifact_type === 'overdue') {
                setActiveOverdue(lastArtifactMsg.payload);
                setActiveTab('overdue');
              } else if (lastArtifactMsg.artifact_type === 'workload') {
                setActiveWorkload(lastArtifactMsg.payload);
                setActiveTab('workload');
              }
            }
          }
        }
      } catch {}
    },
    [router]
  );

  const handleDeleteSession = useCallback(
    async (targetSessionId: string) => {
      try {
        await apiFetch(`/ai/sessions/${targetSessionId}`, { method: 'DELETE' });
        setStoredSessions((prev) => prev.filter((s) => s.id !== targetSessionId));
        showToast('Chat thread deleted successfully', 'success');
        if (targetSessionId === sessionId) {
          router.replace('/ai');
        }
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to delete chat session', 'error');
      }
    },
    [sessionId, router, showToast]
  );

  const handleShareSession = useCallback(async () => {
    try {
      const res = (await apiFetch(`/ai/sessions/${sessionId}/share`, {
        method: 'POST',
      })) as { share_id: string };

      if (res && res.share_id) {
        const shareUrl = `${window.location.origin}/ai?shareId=${res.share_id}`;
        await navigator.clipboard.writeText(shareUrl);
        showToast('Shared chat link copied to clipboard!', 'success');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to generate share link', 'error');
    }
  }, [sessionId, showToast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const shareParam = urlParams.get('shareId');
    if (!shareParam) return;

    const loadSharedSession = async () => {
      try {
        const res = (await apiFetch(`/ai/share/${shareParam}`)) as {
          id: string;
          share_id: string;
          title: string;
          author: string;
          messages: any[];
          proposal?: any;
        };

        if (res) {
          setSessionId(res.share_id || shareParam);
          const formattedMsgs: LocalChatMessage[] = (res.messages || []).map((h: any) => ({
            id: h.id,
            role: h.role,
            content: h.content,
            executedActions: h.executed_actions,
            artifactType: h.artifact_type,
          }));
          setMessages(formattedMsgs);
          if (res.proposal) {
            setActiveProposal(res.proposal);
            setActiveTab('plan');
          }
          showToast(`Opened shared chat thread by ${res.author}`, 'info');
        }
      } catch {}
    };

    loadSharedSession();
  }, [showToast]);

  return {
    sessionId,
    messages,
    input,
    setInput,
    isLoading,
    activeTab,
    setActiveTab,
    activeProposal,
    activeStats,
    activeOverdue,
    activeWorkload,
    executionLogs,
    showHistory,
    setShowHistory,
    storedSessions,
    handleSendMessage,
    handleProceedPlan,
    handleSelectSession,
    handleDeleteSession,
    handleShareSession,
  };
}
