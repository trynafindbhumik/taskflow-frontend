'use client';

import {
  Calendar,
  Check,
  CheckSquare,
  FileText,
  MessageSquare,
  MessageSquarePlus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import type { AiDraftProposal, AiProposalItem, AiSubtaskItem } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

export interface ReviewComment {
  id: string;
  taskTitle: string;
  text: string;
  selectedText?: string;
}

interface PlanArtifactViewProps {
  activeProposal: AiDraftProposal | null;
  reviewComments: ReviewComment[];
  onAddReviewComment: (taskTitle: string, commentText: string, selectedText?: string) => void;
  onUpdateReviewComment?: (commentId: string, updatedText: string) => void;
  onRemoveReviewComment: (commentId: string) => void;
}

/**
 * Renders text with inline highlighted selection spans & interactive popovers with edit support
 */
const AnnotatedText: React.FC<{
  text: string;
  comments: ReviewComment[];
  onUpdateReviewComment?: (commentId: string, updatedText: string) => void;
  onRemoveReviewComment: (commentId: string) => void;
}> = ({ text, comments, onUpdateReviewComment, onRemoveReviewComment }) => {
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const popoverContainerRef = React.useRef<HTMLSpanElement | null>(null);

  // Outside click listener: Automatically close popover when clicking outside
  useEffect(() => {
    if (!activePopoverId) {
      return () => {};
    }

    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverContainerRef.current && !popoverContainerRef.current.contains(e.target as Node)) {
        setActivePopoverId(null);
        setEditingCommentId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activePopoverId]);

  if (!text) return null;

  const matching = comments.filter(
    (c) => c.selectedText && text.toLowerCase().includes(c.selectedText.toLowerCase())
  );

  if (matching.length === 0) {
    return <>{text}</>;
  }

  const occurrences: Array<{ start: number; end: number; comment: ReviewComment }> = [];
  matching.forEach((c) => {
    if (!c.selectedText) return;
    const idx = text.toLowerCase().indexOf(c.selectedText.toLowerCase());
    if (idx !== -1) {
      occurrences.push({
        start: idx,
        end: idx + c.selectedText.length,
        comment: c,
      });
    }
  });

  occurrences.sort((a, b) => a.start - b.start);

  const cleanOccurrences: typeof occurrences = [];
  let lastEnd = 0;
  occurrences.forEach((occ) => {
    if (occ.start >= lastEnd) {
      cleanOccurrences.push(occ);
      lastEnd = occ.end;
    }
  });

  if (cleanOccurrences.length === 0) {
    return <>{text}</>;
  }

  const elements: React.ReactNode[] = [];
  let currentPos = 0;

  cleanOccurrences.forEach((occ, i) => {
    if (occ.start > currentPos) {
      elements.push(text.substring(currentPos, occ.start));
    }

    const matchedText = text.substring(occ.start, occ.end);
    const comment = occ.comment;
    const isOpen = activePopoverId === comment.id;
    const isEditing = editingCommentId === comment.id;

    elements.push(
      <span
        key={`ann_${comment.id}_${i}`}
        ref={isOpen ? popoverContainerRef : undefined}
        className={styles.annotatedHighlightSpan}
        onClick={(e) => {
          e.stopPropagation();
          setActivePopoverId(isOpen ? null : comment.id);
        }}
      >
        {matchedText}
        <span className={styles.inlineCommentIcon}>
          <MessageSquare size={12} />
        </span>

        {isOpen && (
          <span className={styles.commentPopoverCard} onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}
              >
                <input
                  type="text"
                  className={styles.commentInputInline}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className={styles.cancelCommentBtn}
                    onClick={() => setEditingCommentId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.saveCommentBtn}
                    onClick={() => {
                      if (editText.trim() && onUpdateReviewComment) {
                        onUpdateReviewComment(comment.id, editText.trim());
                      }
                      setEditingCommentId(null);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.popoverText}>{comment.text}</div>
                <div className={styles.popoverActionsRow}>
                  {onUpdateReviewComment && (
                    <button
                      type="button"
                      className={styles.popoverEditBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCommentId(comment.id);
                        setEditText(comment.text);
                      }}
                      title="Edit note"
                    >
                      <Pencil size={11} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.popoverDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveReviewComment(comment.id);
                      setActivePopoverId(null);
                    }}
                    title="Delete note"
                  >
                    <Trash2 size={11} />
                    <span>Delete</span>
                  </button>
                  <button
                    type="button"
                    className={styles.popoverResolveBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveReviewComment(comment.id);
                      setActivePopoverId(null);
                    }}
                    title="Resolve note"
                  >
                    <Check size={12} />
                    <span>Resolve</span>
                  </button>
                </div>
              </>
            )}
          </span>
        )}
      </span>
    );

    currentPos = occ.end;
  });

  if (currentPos < text.length) {
    elements.push(text.substring(currentPos));
  }

  return <>{elements}</>;
};

export const PlanArtifactView: React.FC<PlanArtifactViewProps> = ({
  activeProposal,
  reviewComments,
  onAddReviewComment,
  onUpdateReviewComment,
  onRemoveReviewComment,
}) => {
  const [activeCommentTask, setActiveCommentTask] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Editing state for direct task comments
  const [editingDirectId, setEditingDirectId] = useState<string | null>(null);
  const [editingDirectText, setEditingDirectText] = useState('');

  // Text selection annotation state
  const [selectedSnippet, setSelectedSnippet] = useState<{
    text: string;
    top: number;
    left: number;
  } | null>(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectionComment, setSelectionComment] = useState('');

  const isPending =
    activeProposal &&
    (!activeProposal.status ||
      activeProposal.status === 'pending' ||
      (activeProposal.status as string) === 'draft');

  // Deselection Listener: Automatically hide floating annotate button when text is deselected
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (!showSelectionModal) {
          setSelectedSnippet(null);
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [showSelectionModal]);

  if (!activeProposal) {
    return (
      <div className={styles.emptyArtifactState}>
        <div className={styles.emptyIcon}>
          <FileText size={28} />
        </div>
        <h3 className={styles.emptyTitle}>No Implementation Plan Active</h3>
        <p className={styles.emptyDesc}>
          Ask TaskFlow Assistant in the chat (e.g. <em>&quot;Plan Real Estate CRM Project&quot;</em>
          ) to generate an Implementation Plan.
        </p>
      </div>
    );
  }

  const handleSaveComment = (taskTitle: string) => {
    if (!commentText.trim()) return;
    onAddReviewComment(taskTitle, commentText.trim());
    setCommentText('');
    setActiveCommentTask(null);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPending) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    // Ensure selection is NOT inside an existing comment, popover, or review UI element
    const isInsideReviewUI = (node: Node | null): boolean => {
      let current: Node | null = node;
      while (current && current !== e.currentTarget) {
        if (current instanceof HTMLElement) {
          const cls = current.className || '';
          if (
            (typeof cls === 'string' &&
              (cls.includes(styles.commentPopoverCard) ||
                cls.includes(styles.reviewCommentBadge) ||
                cls.includes(styles.commentInputBox) ||
                cls.includes(styles.selectionModalCard) ||
                cls.includes(styles.annotatedHighlightSpan))) ||
            current.tagName === 'TEXTAREA' ||
            current.tagName === 'INPUT' ||
            current.tagName === 'BUTTON'
          ) {
            return true;
          }
        }
        current = current.parentNode;
      }
      return false;
    };

    if (isInsideReviewUI(selection.anchorNode) || isInsideReviewUI(selection.focusNode)) {
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const docEl = e.currentTarget.getBoundingClientRect();
      setSelectedSnippet({
        text,
        top: Math.max(10, rect.top - docEl.top - 42),
        left: Math.max(
          10,
          Math.min(docEl.width - 160, rect.left - docEl.left + rect.width / 2 - 70)
        ),
      });
    }
  };

  const handleSaveSelectionComment = () => {
    if (!selectionComment.trim() || !selectedSnippet) return;
    const snippetTitle = `Selection: "${selectedSnippet.text.slice(0, 25)}${
      selectedSnippet.text.length > 25 ? '...' : ''
    }"`;
    onAddReviewComment(snippetTitle, selectionComment.trim(), selectedSnippet.text);
    setSelectionComment('');
    setShowSelectionModal(false);
    setSelectedSnippet(null);
    window.getSelection()?.removeAllRanges();
  };

  const renderSubtaskItem = (st: string | AiSubtaskItem, idx: number) => {
    const stTitle = typeof st === 'string' ? st : st.title;
    const stDesc = typeof st === 'string' ? undefined : st.description;

    return (
      <div key={`st_${stTitle}_${idx}`} className={styles.subtaskItem}>
        <div className={styles.subtaskTitleRow}>
          <CheckSquare size={14} className={styles.subtaskCheck} />
          <span className={styles.subtaskTitle}>
            <AnnotatedText
              text={stTitle}
              comments={reviewComments}
              onUpdateReviewComment={onUpdateReviewComment}
              onRemoveReviewComment={onRemoveReviewComment}
            />
          </span>
        </div>
        {stDesc && (
          <div className={styles.subtaskDesc}>
            <AnnotatedText
              text={stDesc}
              comments={reviewComments}
              onUpdateReviewComment={onUpdateReviewComment}
              onRemoveReviewComment={onRemoveReviewComment}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.planDocument} onMouseUp={handleMouseUp} style={{ position: 'relative' }}>
      {/* Floating Text Selection Annotation Tooltip */}
      {selectedSnippet && !showSelectionModal && (
        <button
          type="button"
          className={styles.floatingAnnotateBtn}
          style={{ top: `${selectedSnippet.top}px`, left: `${selectedSnippet.left}px` }}
          onClick={(e) => {
            e.stopPropagation();
            setShowSelectionModal(true);
          }}
        >
          <MessageSquarePlus size={13} />
          <span>Annotate Selection</span>
        </button>
      )}

      {/* Floating Selection Modal */}
      {selectedSnippet && showSelectionModal && (
        <div
          className={styles.selectionModalOverlay}
          onClick={() => {
            setShowSelectionModal(false);
            setSelectedSnippet(null);
          }}
        >
          <div className={styles.selectionModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.selectionModalHeader}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
              >
                <MessageSquarePlus size={15} />
                <span>Annotate Text Selection</span>
              </div>
              <button
                type="button"
                className={styles.closeSelectionModalBtn}
                onClick={() => {
                  setShowSelectionModal(false);
                  setSelectedSnippet(null);
                }}
              >
                <X size={14} />
              </button>
            </div>
            <div className={styles.selectionQuoteBox}>&quot;{selectedSnippet.text}&quot;</div>
            <textarea
              className={styles.commentTextarea}
              placeholder="Type your review note for this selected text (e.g., 'Change deadline to next week', 'Add unit testing subtask')..."
              value={selectionComment}
              onChange={(e) => setSelectionComment(e.target.value)}
              autoFocus
            />
            <div className={styles.commentActionBtns} style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className={styles.cancelCommentBtn}
                onClick={() => {
                  setShowSelectionModal(false);
                  setSelectedSnippet(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.saveCommentBtn}
                onClick={handleSaveSelectionComment}
                disabled={!selectionComment.trim()}
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className={styles.docTitle}># {activeProposal.proposal_data.project_name}</h2>

      <div>
        <h3 className={styles.sectionHeader}>Goal &amp; Scope Overview</h3>
        <p
          style={{
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: 'var(--muted-foreground)',
          }}
        >
          <AnnotatedText
            text={activeProposal.proposal_data.description || activeProposal.description || ''}
            comments={reviewComments}
            onUpdateReviewComment={onUpdateReviewComment}
            onRemoveReviewComment={onRemoveReviewComment}
          />
        </p>
      </div>

      <div>
        <h3 className={styles.sectionHeader}>Proposed Project Tasks &amp; Subtasks</h3>

        <div className={styles.tasksGrid}>
          {activeProposal.proposal_data.tasks.map((task: AiProposalItem, idx: number) => {
            // Task notes added via "Add Review Note" (without text selection)
            const taskDirectComments = reviewComments.filter(
              (c) => c.taskTitle === task.title && !c.selectedText
            );

            return (
              <div key={`task_${task.title}_${idx}`} className={styles.taskCardItem}>
                <div className={styles.taskHeader}>
                  <span className={styles.taskTitleText}>
                    <AnnotatedText
                      text={task.title}
                      comments={reviewComments}
                      onUpdateReviewComment={onUpdateReviewComment}
                      onRemoveReviewComment={onRemoveReviewComment}
                    />
                  </span>
                  <span
                    className={`${styles.taskPriorityBadge} ${
                      task.priority === 'high'
                        ? styles.priorityHigh
                        : task.priority === 'low'
                          ? styles.priorityLow
                          : styles.priorityMedium
                    }`}
                  >
                    {task.priority || 'medium'}
                  </span>
                </div>

                {task.description && (
                  <div className={styles.taskDescription}>
                    <AnnotatedText
                      text={task.description}
                      comments={reviewComments}
                      onUpdateReviewComment={onUpdateReviewComment}
                      onRemoveReviewComment={onRemoveReviewComment}
                    />
                  </div>
                )}

                {task.due_date && (
                  <div className={styles.taskDeadlineBadge}>
                    <Calendar size={13} />
                    <span>Target Deadline:</span>
                    <strong>{task.due_date}</strong>
                  </div>
                )}

                {task.subtasks && task.subtasks.length > 0 && (
                  <div className={styles.subtasksContainer}>
                    <div className={styles.subtaskLabel}>
                      Subtasks &amp; Technical Specifications ({task.subtasks.length}):
                    </div>
                    {task.subtasks.map((st, stIdx) => renderSubtaskItem(st, stIdx))}
                  </div>
                )}

                {/* Task Review Annotations & Inline Comment Form */}
                {isPending && (
                  <div className={styles.reviewTaskActionRow}>
                    <button
                      type="button"
                      className={styles.addCommentBtn}
                      onClick={() => {
                        if (activeCommentTask === task.title) {
                          setActiveCommentTask(null);
                        } else {
                          setActiveCommentTask(task.title);
                          setCommentText('');
                        }
                      }}
                    >
                      <MessageSquarePlus size={13} />
                      <span>
                        {activeCommentTask === task.title ? 'Cancel Note' : 'Add Review Note'}
                      </span>
                    </button>
                  </div>
                )}

                {activeCommentTask === task.title && (
                  <div className={styles.commentInputBox}>
                    <textarea
                      className={styles.commentTextarea}
                      placeholder={`Add change request note for "${task.title}" (e.g. "Change priority to High", "Extend due date to Friday")...`}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className={styles.commentActionBtns}>
                      <button
                        type="button"
                        className={styles.cancelCommentBtn}
                        onClick={() => setActiveCommentTask(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={styles.saveCommentBtn}
                        onClick={() => handleSaveComment(task.title)}
                        disabled={!commentText.trim()}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Task Direct Comments added via Add Review Note button */}
                {taskDirectComments.length > 0 && (
                  <div className={styles.taskCommentsList}>
                    {taskDirectComments.map((c) => (
                      <div key={c.id} className={styles.reviewCommentBadge}>
                        {editingDirectId === c.id ? (
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.4rem',
                              width: '100%',
                              alignItems: 'center',
                            }}
                          >
                            <input
                              type="text"
                              className={styles.commentInputInline}
                              value={editingDirectText}
                              onChange={(e) => setEditingDirectText(e.target.value)}
                              autoFocus
                            />
                            <button
                              type="button"
                              className={styles.cancelCommentBtn}
                              onClick={() => setEditingDirectId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className={styles.saveCommentBtn}
                              onClick={() => {
                                if (editingDirectText.trim() && onUpdateReviewComment) {
                                  onUpdateReviewComment(c.id, editingDirectText.trim());
                                }
                                setEditingDirectId(null);
                              }}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                flex: 1,
                              }}
                            >
                              <MessageSquare
                                size={13}
                                style={{ color: 'var(--primary)', flexShrink: 0 }}
                              />
                              <span>{c.text}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {onUpdateReviewComment && (
                                <button
                                  type="button"
                                  className={styles.popoverEditBtn}
                                  onClick={() => {
                                    setEditingDirectId(c.id);
                                    setEditingDirectText(c.text);
                                  }}
                                  title="Edit note"
                                >
                                  <Pencil size={11} />
                                  <span>Edit</span>
                                </button>
                              )}
                              <button
                                type="button"
                                className={styles.popoverDeleteBtn}
                                onClick={() => onRemoveReviewComment(c.id)}
                                title="Delete note"
                              >
                                <Trash2 size={11} />
                                <span>Delete</span>
                              </button>
                              <button
                                type="button"
                                className={styles.resolveCommentBtn}
                                onClick={() => onRemoveReviewComment(c.id)}
                                title="Resolve note"
                              >
                                <Check size={13} />
                                <span>Resolve</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
