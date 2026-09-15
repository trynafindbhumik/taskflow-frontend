'use client';

import { FileText, ListTodo, BarChart2, AlertTriangle, UserCheck, Terminal } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { useToast } from '@/components/ui/toast/ToastContext';
import { useAiSession } from '@/hooks/useAiSession';
import { apiFetch } from '@/utils/api';

import styles from './AiWorkspace.module.css';
import { ChatHistoryDrawer } from './subcomponents/ChatHistoryDrawer';
import { ChatStream } from './subcomponents/ChatStream';
import { LogsArtifactView } from './subcomponents/LogsArtifactView';
import { OverdueArtifactView } from './subcomponents/OverdueArtifactView';
import { PlanArtifactView } from './subcomponents/PlanArtifactView';
import { ProposalApprovalBar } from './subcomponents/ProposalApprovalBar';
import { StatsArtifactView } from './subcomponents/StatsArtifactView';
import { WorkloadArtifactView } from './subcomponents/WorkloadArtifactView';

interface AiWorkspaceProps {
  initialSessionId?: string;
}

export const AiWorkspace: React.FC<AiWorkspaceProps> = ({ initialSessionId }) => {
  const { showToast } = useToast();
  const chatFeedEndRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useAiSession({ initialSessionId });

  const [userProjects, setUserProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string } | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    apiFetch<{ projects: Array<{ id: string; name: string }> }>('/projects')
      .then((res) => {
        if (res && Array.isArray(res.projects)) {
          setUserProjects(res.projects);
        }
      })
      .catch(() => {
        setUserProjects([
          { id: 'p1', name: 'Real Estate CRM System' },
          { id: 'p2', name: 'TaskFlow Web Redesign' },
          { id: 'p3', name: 'Mobile App React Native' },
        ]);
      });
  }, []);

  useEffect(() => {
    chatFeedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className={styles.container}>
      <ChatHistoryDrawer
        isOpen={mounted && showHistory}
        onClose={() => setShowHistory(false)}
        storedSessions={storedSessions}
        activeConversationId={sessionId}
        onSelectSession={handleSelectSession}
      />

      <ChatStream
        messages={messages}
        inputMessage={input}
        loading={isLoading}
        onInputChange={setInput}
        onSendMessage={(prompt) => {
          let text = prompt || input;
          if (selectedProject) {
            text = `[Project: ${selectedProject.name}] ${text}`;
          }
          handleSendMessage(text);
        }}
        onOpenHistory={() => setShowHistory(true)}
        onNewSession={() =>
          handleSelectSession({
            id: `session_${Math.random().toString(36).slice(2, 9)}`,
            title: 'New AI Chat',
            timestamp: 'Just now',
            messages: [
              {
                id: 'welcome',
                role: 'assistant',
                content:
                  'Started a new session. Describe your project requirements or choose a quick prompt.',
              },
            ],
            activeTab: 'plan',
          })
        }
        userProjects={userProjects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        showProjectDropdown={showProjectDropdown}
        onToggleProjectDropdown={() => setShowProjectDropdown((o) => !o)}
        onCloseProjectDropdown={() => setShowProjectDropdown(false)}
        chatFeedEndRef={chatFeedEndRef}
      />

      <div className={styles.artifactColumn}>
        <div className={styles.artifactHeader}>
          <div className={styles.artifactTitleGroup}>
            <div className={styles.artifactFileBadge}>
              <FileText size={16} style={{ color: 'var(--primary)' }} />
              {activeTab === 'plan'
                ? 'implementation_plan.md'
                : activeTab === 'stats'
                  ? 'project_completion_stats.md'
                  : activeTab === 'overdue'
                    ? 'overdue_tasks_report.md'
                    : activeTab === 'workload'
                      ? 'team_workload_summary.md'
                      : 'execution_monitor.log'}
            </div>
            {activeTab === 'plan' && activeProposal && activeProposal.status === 'pending' && (
              <span className={styles.reviewRequiredBadge}>User Review Required</span>
            )}
          </div>

          <div>
            {activeTab === 'plan' && activeProposal ? (
              <span
                className={`${styles.statusPill} ${
                  activeProposal.status === 'executed'
                    ? styles.statusCompleted
                    : activeProposal.status === 'pending'
                      ? styles.statusExecuting
                      : styles.statusDraft
                }`}
              >
                {activeProposal.status === 'executed'
                  ? 'Executed'
                  : activeProposal.status === 'pending'
                    ? 'Review Required'
                    : 'Cancelled'}
              </span>
            ) : (
              <span className={`${styles.statusPill} ${styles.statusCompleted}`}>
                {activeTab === 'logs' ? 'Execution Console' : 'Live Metric Artifact'}
              </span>
            )}
          </div>
        </div>

        <div className={styles.tabsBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'plan' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <ListTodo size={15} />
            Implementation Plan
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'stats' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart2 size={15} />
            Completion Stats
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'overdue' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            <AlertTriangle size={15} />
            Overdue Tasks
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'workload' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('workload')}
          >
            <UserCheck size={15} />
            Team Workload
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'logs' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Terminal size={15} />
            Execution Monitor ({executionLogs.length})
          </button>
        </div>

        <div className={styles.artifactBody}>
          {activeTab === 'logs' ? (
            <LogsArtifactView executionLogs={executionLogs} />
          ) : activeTab === 'plan' ? (
            <PlanArtifactView activeProposal={activeProposal} />
          ) : activeTab === 'stats' ? (
            <StatsArtifactView activeStats={activeStats} />
          ) : activeTab === 'overdue' ? (
            <OverdueArtifactView
              activeOverdue={activeOverdue}
              onNotifyAssignee={(assignee) => showToast(`Reminder sent to ${assignee}`, 'success')}
              onExtendDeadline={(title) => showToast(`Rescheduled task "${title}"`, 'info')}
            />
          ) : (
            <WorkloadArtifactView activeWorkload={activeWorkload} />
          )}
        </div>

        {activeTab === 'plan' && (
          <ProposalApprovalBar activeProposal={activeProposal} onProceed={handleProceedPlan} />
        )}
      </div>
    </div>
  );
};
