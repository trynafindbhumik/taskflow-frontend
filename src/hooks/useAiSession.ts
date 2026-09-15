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

const LOCAL_STORAGE_KEY = 'tf_ai_sessions';

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
      content:
        'Hello! I am TaskFlow AI Assistant. Ask me to generate project implementation plans, calculate overdue task bottlenecks, or display team workload analysis.',
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        setStoredSessions(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const saveCurrentSessionToStorage = useCallback(
    (currentMsgs: LocalChatMessage[]) => {
      try {
        const firstUserMsg = currentMsgs.find((m) => m.role === 'user');
        const sessionTitle = firstUserMsg
          ? firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? '…' : '')
          : 'New AI Chat';

        const updatedSession: StoredSession = {
          id: sessionId,
          title: sessionTitle,
          timestamp: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          messages: currentMsgs,
          activeTab,
          proposal: activeProposal,
          statsData: activeStats,
          overdueData: activeOverdue,
          workloadData: activeWorkload,
        };

        setStoredSessions((prev) => {
          const filtered = prev.filter((s) => s.id !== sessionId);
          const next = [updatedSession, ...filtered];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      } catch {}
    },
    [sessionId, activeTab, activeProposal, activeStats, activeOverdue, activeWorkload]
  );

  useEffect(() => {
    if (!initialSessionId) return;

    const loadRemoteSession = async () => {
      try {
        const history = (await apiFetch(`/ai/sessions/${initialSessionId}/history`)) as Array<{
          id: string;
          role: 'user' | 'assistant';
          content: string;
        }>;

        if (history && history.length > 0) {
          setMessages(
            history.map((h) => ({
              id: h.id,
              role: h.role,
              content: h.content,
            }))
          );
        }
      } catch {}
    };

    loadRemoteSession();
  }, [initialSessionId]);

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = textToSend || input;
      if (!query.trim() || isLoading) return;

      const userMsg: LocalChatMessage = {
        id: `usr_${Date.now()}`,
        role: 'user',
        content: query.trim(),
      };

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      if (!textToSend) setInput('');
      setIsLoading(true);

      saveCurrentSessionToStorage(nextMessages);

      try {
        const res = await sendAiMessage(query.trim(), sessionId);

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

        saveCurrentSessionToStorage(finalMsgs);
      } catch (err: unknown) {
        const errorMsg: LocalChatMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Failed to communicate with AI Assistant.'}`,
        };
        const finalMsgs = [...nextMessages, errorMsg];
        setMessages(finalMsgs);
        saveCurrentSessionToStorage(finalMsgs);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, sessionId, saveCurrentSessionToStorage]
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
    (session: StoredSession) => {
      setSessionId(session.id);
      setMessages(session.messages || []);
      setActiveTab(session.activeTab || 'plan');
      if (session.proposal) setActiveProposal(session.proposal);
      if (session.statsData) setActiveStats(session.statsData);
      if (session.overdueData) setActiveOverdue(session.overdueData);
      if (session.workloadData) setActiveWorkload(session.workloadData);
      setShowHistory(false);
      router.replace(`/ai/${session.id}`);
    },
    [router]
  );

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
  };
}
