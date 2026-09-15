'use client';

import {
  Bot,
  History,
  Plus,
  Sparkles,
  FolderPlus,
  BarChart2,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import React from 'react';

import styles from '../AiWorkspace.module.css';

export interface LocalChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatStreamProps {
  messages: LocalChatMessage[];
  inputMessage: string;
  loading: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: (overrideMsg?: string) => void;
  onOpenHistory: () => void;
  onNewSession: () => void;
  userProjects: Array<{ id: string; name: string }>;
  selectedProject: { id: string; name: string } | null;
  onSelectProject: (proj: { id: string; name: string } | null) => void;
  showProjectDropdown: boolean;
  onToggleProjectDropdown: () => void;
  onCloseProjectDropdown: () => void;
  chatFeedEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  inputMessage,
  loading,
  onInputChange,
  onSendMessage,
  onOpenHistory,
  onNewSession,
  userProjects,
  selectedProject,
  onSelectProject,
  showProjectDropdown,
  onToggleProjectDropdown,
  onCloseProjectDropdown,
  chatFeedEndRef,
}) => {
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const renderedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={`b_${partIdx}`}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={`l_${lineIdx}`}>
          {renderedLine}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={styles.chatColumn}>
      <div className={styles.chatHeader}>
        <div className={styles.agentTitleInfo}>
          <div className={styles.agentIconBadge}>
            <Bot size={20} />
          </div>
          <div>
            <h3 className={styles.agentName}>TaskFlow Assistant</h3>
            <span className={styles.agentModel}>TaskFlow Intelligence</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.historyToggleBtn}
            onClick={onOpenHistory}
            title="View Chat History"
          >
            <History size={14} />
            History
          </button>

          <button className={styles.newChatBtn} onClick={onNewSession} title="Start new session">
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      <div className={styles.chatFeed}>
        <div className={styles.quickPillsSection}>
          <div className={styles.quickPillsTitle}>
            <Sparkles size={13} />
            Suggested Actions
          </div>
          <div className={styles.pillsGrid}>
            <button
              className={styles.pillBtn}
              onClick={() =>
                onSendMessage(
                  'Plan Real Estate CRM Project with lead pipeline, listing catalog, and visit scheduler.'
                )
              }
            >
              <FolderPlus size={14} />
              Plan Real Estate CRM Project
            </button>

            <button
              className={styles.pillBtn}
              onClick={() =>
                onSendMessage('Summarize project completion stats and overall progress.')
              }
            >
              <BarChart2 size={14} />
              Project Completion Stats
            </button>

            <button
              className={styles.pillBtn}
              onClick={() =>
                onSendMessage('Analyze overdue tasks and identify critical bottlenecks.')
              }
            >
              <AlertTriangle size={14} />
              Overdue Tasks Analysis
            </button>

            <button
              className={styles.pillBtn}
              onClick={() =>
                onSendMessage('Generate team workload summary and pending task distribution.')
              }
            >
              <UserCheck size={14} />
              Team Workload Summary
            </button>
          </div>
        </div>

        {messages.map((msg) => (
          <React.Fragment key={msg.id}>
            {msg.role === 'user' ? (
              <div className={styles.userBubble}>{msg.content}</div>
            ) : (
              <div className={styles.aiBubbleWrapper}>
                <div className={styles.aiBubble}>
                  <div>{renderFormattedText(msg.content)}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}

        {loading && (
          <div className={styles.aiBubble} style={{ opacity: 0.7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <span>TaskFlow Assistant is generating artifact response...</span>
            </div>
          </div>
        )}
        <div ref={chatFeedEndRef} />
      </div>

      <div className={styles.chatInputSection}>
        <form
          className={styles.promptCardContainer}
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
        >
          <textarea
            className={styles.promptTextarea}
            placeholder="Ask anything, @ to mention, / for actions"
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
          />

          <div className={styles.promptBottomBar}>
            <div className={styles.projectSelectorWrapper}>
              <button
                type="button"
                className={styles.projectSelectorPill}
                onClick={onToggleProjectDropdown}
                title="Select project scope"
              >
                <Plus size={14} />
                <span>{selectedProject ? selectedProject.name : 'Select Project'}</span>
                {showProjectDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showProjectDropdown && (
                <>
                  <div className={styles.dropdownBackdrop} onClick={onCloseProjectDropdown} />
                  <div className={styles.projectDropdownMenu}>
                    <div className={styles.projectDropdownHeader}>Select Project Scope</div>
                    <div
                      className={`${styles.projectDropdownItem} ${
                        !selectedProject ? styles.projectDropdownItemActive : ''
                      }`}
                      onClick={() => {
                        onSelectProject(null);
                        onCloseProjectDropdown();
                      }}
                    >
                      <span>None (Keep Empty)</span>
                      {!selectedProject && <CheckCircle2 size={13} />}
                    </div>
                    <div className={styles.dropdownDivider} />
                    {userProjects.map((p) => (
                      <div
                        key={p.id}
                        className={`${styles.projectDropdownItem} ${
                          selectedProject?.id === p.id ? styles.projectDropdownItemActive : ''
                        }`}
                        onClick={() => {
                          onSelectProject(p);
                          onCloseProjectDropdown();
                        }}
                      >
                        <span>{p.name}</span>
                        {selectedProject?.id === p.id && <CheckCircle2 size={13} />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              className={styles.roundSendBtn}
              disabled={!inputMessage.trim() || loading}
              aria-label="Send message"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
