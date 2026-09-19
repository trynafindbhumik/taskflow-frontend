'use client';

import {
  Bot,
  History,
  Plus,
  Share2,
  Sparkles,
  FolderPlus,
  BarChart2,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Paperclip,
  FileText,
  X,
} from 'lucide-react';
import React, { useState, useRef } from 'react';

import styles from '../AiWorkspace.module.css';

export interface LocalChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface FileAttachmentPayload {
  filename: string;
  content: string;
  mimeType?: string;
}

interface ChatStreamProps {
  className?: string;
  messages: LocalChatMessage[];
  inputMessage: string;
  loading: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: (overrideMsg?: string, attachment?: FileAttachmentPayload) => void;
  onOpenHistory: () => void;
  onNewSession: () => void;
  onShareSession?: () => void;
  userProjects: Array<{ id: string; name: string }>;
  selectedProject: { id: string; name: string } | null;
  onSelectProject: (proj: { id: string; name: string } | null) => void;
  showProjectDropdown: boolean;
  onToggleProjectDropdown: () => void;
  onCloseProjectDropdown: () => void;
  chatFeedEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  className,
  messages,
  inputMessage,
  loading,
  onInputChange,
  onSendMessage,
  onOpenHistory,
  onNewSession,
  onShareSession,
  userProjects,
  selectedProject,
  onSelectProject,
  showProjectDropdown,
  onToggleProjectDropdown,
  onCloseProjectDropdown,
  chatFeedEndRef,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileAttachmentPayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedFile({
        filename: file.name,
        content: result,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFormSubmit = () => {
    if ((!inputMessage.trim() && !selectedFile) || loading) return;
    onSendMessage(undefined, selectedFile || undefined);
    onInputChange('');
    setSelectedFile(null);
  };

  const renderUserContent = (content: string) => {
    let text = content;
    let attachmentFilename = null;
    let projectName = null;

    // Check for attachment prefix
    const attachMatch = text.match(/^\[Attached(?: Spec)?: ([^\]]+)\]\s*([\s\S]*)$/);
    if (attachMatch) {
      attachmentFilename = attachMatch[1];
      text = attachMatch[2];
    }

    // Check for project prefix
    const projectMatch = text.match(/^\[Project:\s*([^\]]+)\]\s*([\s\S]*)$/);
    if (projectMatch) {
      projectName = projectMatch[1];
      text = projectMatch[2];
    }

    if (!attachmentFilename && !projectName) {
      return content;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxWidth: '100%' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
          {projectName && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: 'var(--primary)',
                borderRadius: '12px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.725rem',
                fontWeight: 700,
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              <FolderPlus size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                }}
                title={projectName}
              >
                Project: {projectName}
              </span>
            </div>
          )}
          {attachmentFilename && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(0, 0, 0, 0.22)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              <FileText size={14} style={{ color: '#ffffff', flexShrink: 0 }} />
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                }}
                title={attachmentFilename}
              >
                {attachmentFilename}
              </span>
            </div>
          )}
        </div>
        {text ? (
          <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{text}</div>
        ) : null}
      </div>
    );
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmedLine = line.trim();

      // Check bullet point (- , * , • , + )
      const isBullet = /^[-*•+]\s+/.test(trimmedLine);

      // Check numbered list (1. , 2. , etc.)
      const isNumbered = /^\d+\.\s+/.test(trimmedLine);

      // Extract raw item text
      let cleanLine = line;
      let numberPrefix = '';

      if (isBullet) {
        cleanLine = trimmedLine.replace(/^[-*•+]\s+/, '');
      } else if (isNumbered) {
        const numMatch = trimmedLine.match(/^(\d+\.)\s+(.*)$/);
        if (numMatch) {
          numberPrefix = numMatch[1];
          cleanLine = numMatch[2];
        }
      }

      // Helper to parse bold (**bold**) and inline code (`code`)
      const renderInline = (inputStr: string) => {
        const parts = inputStr.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
              <strong key={`b_${partIdx}`} style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
              <code
                key={`c_${partIdx}`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  fontSize: '0.825rem',
                  fontFamily: 'monospace',
                }}
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });
      };

      if (isBullet) {
        const hasEmojiLead =
          /^(?:[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u.test(cleanLine);
        return (
          <div
            key={`l_${lineIdx}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              margin: '0.35rem 0',
              paddingLeft: '0.4rem',
            }}
          >
            {!hasEmojiLead && (
              <span
                style={{
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: '1.4',
                  userSelect: 'none',
                }}
              >
                •
              </span>
            )}
            <div style={{ flex: 1, lineHeight: '1.5' }}>{renderInline(cleanLine)}</div>
          </div>
        );
      }

      if (isNumbered) {
        return (
          <div
            key={`l_${lineIdx}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              margin: '0.35rem 0',
              paddingLeft: '0.4rem',
            }}
          >
            <span
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                lineHeight: '1.5',
                userSelect: 'none',
                minWidth: '1.2rem',
              }}
            >
              {numberPrefix}
            </span>
            <div style={{ flex: 1, lineHeight: '1.5' }}>{renderInline(cleanLine)}</div>
          </div>
        );
      }

      // Check header tags (# Header, ## Header, etc.)
      const headerMatch = line.match(/^(#{1,4})\s+(.*)$/);
      if (headerMatch) {
        return (
          <div
            key={`l_${lineIdx}`}
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--foreground)',
              margin: '0.75rem 0 0.35rem 0',
            }}
          >
            {renderInline(headerMatch[2])}
          </div>
        );
      }

      // Handle blank lines with clean vertical spacing
      if (!trimmedLine) {
        return <div key={`l_${lineIdx}`} style={{ height: '0.4rem' }} />;
      }

      // Standard text paragraph
      return (
        <div key={`l_${lineIdx}`} style={{ margin: '0.2rem 0', lineHeight: '1.5' }}>
          {renderInline(line)}
        </div>
      );
    });
  };

  return (
    <div className={`${styles.chatColumn} ${className || ''}`}>
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
          {onShareSession && (
            <button
              className={styles.historyToggleBtn}
              onClick={onShareSession}
              title="Share this chat session"
            >
              <Share2 size={14} />
              Share
            </button>
          )}

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
              <div className={styles.userBubble}>{renderUserContent(msg.content)}</div>
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
            handleFormSubmit();
          }}
        >
          {selectedFile && (
            <div
              style={{
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                margin: '0.5rem 0.5rem 0',
              }}
            >
              <FileText size={14} style={{ color: 'var(--primary)' }} />
              <span
                style={{
                  fontSize: '0.8rem',
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {selectedFile.filename}
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <textarea
            className={styles.promptTextarea}
            placeholder="Ask anything or attach a requirement PDF/Doc..."
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit();
              }
            }}
          />

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.txt,.md,.json,.csv"
            onChange={handleFileChange}
          />

          <div className={styles.promptBottomBar}>
            <div className={styles.projectSelectorWrapper}>
              <button
                type="button"
                className={styles.projectSelectorPill}
                onClick={() => fileInputRef.current?.click()}
                title="Attach requirement PDF or document"
              >
                <Paperclip size={14} />
                <span>Attach Spec</span>
              </button>

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
              disabled={(!inputMessage.trim() && !selectedFile) || loading}
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
