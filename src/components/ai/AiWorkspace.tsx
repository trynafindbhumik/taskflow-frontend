'use client';

import { FileText, ListTodo, BarChart2, AlertTriangle, UserCheck } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { useToast } from '@/components/ui/toast/ToastContext';
import { useAiSession } from '@/hooks/useAiSession';
import { apiFetch } from '@/utils/api';

import styles from './AiWorkspace.module.css';
import { ChatHistoryDrawer } from './subcomponents/ChatHistoryDrawer';
import { ChatStream } from './subcomponents/ChatStream';
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
    showHistory,
    setShowHistory,
    storedSessions,
    handleSendMessage,
    handleProceedPlan,
    handleSelectSession,
    handleDeleteSession,
    handleShareSession,
  } = useAiSession({ initialSessionId });

  const [userProjects, setUserProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string } | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [reviewComments, setReviewComments] = useState<
    Array<{ id: string; taskTitle: string; text: string; selectedText?: string }>
  >([]);

  const handleAddReviewComment = (
    taskTitle: string,
    commentText: string,
    selectedText?: string
  ) => {
    const newComment = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      taskTitle,
      text: commentText,
      selectedText,
    };
    setReviewComments((prev) => [...prev, newComment]);
    showToast(`Added review note for "${taskTitle}"`, 'info');
  };

  const handleRemoveReviewComment = (commentId: string) => {
    setReviewComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleUpdateReviewComment = (commentId: string, updatedText: string) => {
    setReviewComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, text: updatedText } : c))
    );
    showToast('Updated review note', 'info');
  };

  const handleSubmitPlanReview = () => {
    if (reviewComments.length === 0) return;
    const formattedNotes = reviewComments
      .map((c) =>
        c.selectedText
          ? `- [Text Selection: "${c.selectedText}"] (${c.taskTitle}): ${c.text}`
          : `- [Task: "${c.taskTitle}"]: ${c.text}`
      )
      .join('\n');
    const promptMessage = `Review Feedback for Implementation Plan:\n${formattedNotes}\n\nPlease update the implementation plan with these targeted modifications.`;
    handleSendMessage(promptMessage);
    setReviewComments([]);
    showToast('Plan review submitted to TaskFlow Assistant for refinement!', 'success');
  };

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
        setUserProjects([]);
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
        onDeleteSession={handleDeleteSession}
      />

      <ChatStream
        messages={messages}
        inputMessage={input}
        loading={isLoading}
        onInputChange={setInput}
        onSendMessage={(prompt, attachment) => {
          let text = prompt || input;
          if (selectedProject) {
            text = `[Project: ${selectedProject.name}] ${text}`;
          }
          handleSendMessage(text, attachment, selectedProject?.id);
        }}
        onOpenHistory={() => setShowHistory(true)}
        onShareSession={handleShareSession}
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
                    : 'team_workload_summary.md'}
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
                Live Metric Artifact
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
        </div>

        <div className={styles.artifactBody}>
          {activeTab === 'plan' ? (
            <PlanArtifactView
              activeProposal={activeProposal}
              reviewComments={reviewComments}
              onAddReviewComment={handleAddReviewComment}
              onUpdateReviewComment={handleUpdateReviewComment}
              onRemoveReviewComment={handleRemoveReviewComment}
            />
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
          <ProposalApprovalBar
            activeProposal={activeProposal}
            reviewComments={reviewComments}
            onProceed={handleProceedPlan}
            onSubmitPlanReview={handleSubmitPlanReview}
          />
        )}
      </div>
    </div>
  );
};
