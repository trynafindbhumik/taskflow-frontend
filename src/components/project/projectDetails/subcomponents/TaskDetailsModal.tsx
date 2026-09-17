'use client';

import { Calendar, CheckSquare, Pencil, Square, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal/Modal';
import type { Task, TaskStatus, User } from '@/utils/types';

import styles from '../ProjectDetails.module.css';

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projectName?: string;
  members: User[];
  currentUser: User | null;
  ownerId?: string;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, completed: boolean) => void;
  detailsSubtaskTitle: string;
  setDetailsSubtaskTitle: (title: string) => void;
  onAddSubtaskInModal: () => void;
  isAddingSubtask: boolean;
  onOpenEdit: (task: Task) => void;
  onDeleteRequest: (taskId: string) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  projectName = 'Project',
  members,
  currentUser,
  ownerId,
  onStatusChange,
  onSubtaskToggle,
  detailsSubtaskTitle,
  setDetailsSubtaskTitle,
  onAddSubtaskInModal,
  isAddingSubtask,
  onOpenEdit,
  onDeleteRequest,
}) => {
  if (!task) return null;

  const assignee = members.find((m) => m.id === task.assignee_id);
  const isOverdue =
    !!task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date + 'T23:59:59').getTime() < new Date().getTime();

  const totalSubtasks = task.subtasks?.length ?? 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const progressPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const isProjectOwner =
    (Boolean(currentUser?.id) && currentUser?.id === ownerId) ||
    (Boolean(currentUser?.email) &&
      members.find((m) => m.id === ownerId)?.email?.toLowerCase() ===
        currentUser?.email?.toLowerCase());

  const isTaskCreator =
    (Boolean(currentUser?.id) && currentUser?.id === task.creator_id) ||
    (Boolean(currentUser?.email) &&
      members.find((m) => m.id === task.creator_id)?.email?.toLowerCase() ===
        currentUser?.email?.toLowerCase());

  const canDelete = isProjectOwner || isTaskCreator || !task.creator_id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      description={`Task details in ${projectName}`}
      size="lg"
    >
      <div className={styles.taskDetailsBody}>
        <div className={styles.detailsMetaRow}>
          <div className={styles.detailsMetaGroup}>
            <span className={styles.detailsLabel}>Status:</span>
            <button
              type="button"
              className={`${styles.listStatus} ${styles[`listStatus_${task.status}`]}`}
              onClick={() => {
                const nextStatus = STATUS_CYCLE[task.status];
                onStatusChange(task.id, nextStatus);
              }}
              title="Click to advance status"
            >
              {task.status.replace('_', ' ')}
            </button>
          </div>

          <div className={styles.detailsMetaGroup}>
            <span className={styles.detailsLabel}>Priority:</span>
            <span className={`${styles.listPriority} ${styles[`listPriority_${task.priority}`]}`}>
              {task.priority}
            </span>
          </div>

          {task.due_date && (
            <div className={styles.detailsMetaGroup}>
              <span className={styles.detailsLabel}>Due Date:</span>
              <span className={`${styles.listDate} ${isOverdue ? styles.listDateOverdue : ''}`}>
                <Calendar size={13} /> {task.due_date} {isOverdue && '(Overdue)'}
              </span>
            </div>
          )}
        </div>

        <div className={styles.detailsInfoGrid}>
          <div className={styles.detailsInfoCard}>
            <span className={styles.detailsInfoLabel}>Assignee</span>
            <div className={styles.detailsUserWrap}>
              {assignee ? (
                <>
                  <div className={styles.detailsAvatar}>
                    {assignee.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.detailsUserName}>{assignee.name}</div>
                    <div className={styles.detailsUserEmail}>{assignee.email}</div>
                  </div>
                </>
              ) : (
                <span className={styles.listUnassigned}>Unassigned</span>
              )}
            </div>
          </div>

          <div className={styles.detailsInfoCard}>
            <span className={styles.detailsInfoLabel}>Created</span>
            <div className={styles.detailsUserName}>
              {task.created_at
                ? new Date(task.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </div>
          </div>
        </div>

        <div className={styles.detailsSection}>
          <h4 className={styles.detailsSectionTitle}>Description</h4>
          <p className={styles.detailsDescription}>
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.subtasksHeader}>
            <h4 className={styles.detailsSectionTitle}>
              Subtasks ({completedSubtasks} of {totalSubtasks})
            </h4>
            <span className={styles.subtaskPercent}>{progressPercent}%</span>
          </div>
          {totalSubtasks > 0 && (
            <div className={styles.subtaskProgressBar}>
              <div
                className={styles.subtaskProgressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          <div className={styles.subtaskListScrollable}>
            {task.subtasks &&
              task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className={styles.subtaskRow}
                  onClick={() => onSubtaskToggle(task.id, st.id, !st.completed)}
                  role="button"
                  tabIndex={0}
                >
                  <button type="button" className={styles.subtaskCheckbox}>
                    {st.completed ? (
                      <CheckSquare size={16} className={styles.subtaskCheckDone} />
                    ) : (
                      <Square size={16} className={styles.subtaskCheckTodo} />
                    )}
                  </button>
                  <span
                    className={`${styles.subtaskTitle} ${st.completed ? styles.subtaskTitleDone : ''}`}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
          </div>

          <div className={styles.subtaskInputRow} style={{ marginTop: '0.75rem' }}>
            <input
              type="text"
              className={styles.subtaskInput}
              placeholder="Add a new subtask..."
              value={detailsSubtaskTitle}
              onChange={(e) => setDetailsSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddSubtaskInModal();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isAddingSubtask}
              onClick={onAddSubtaskInModal}
            >
              Add Subtask
            </Button>
          </div>
        </div>
      </div>

      <div
        className={styles.modalActions}
        style={{ marginTop: '1.5rem', justifyContent: 'space-between' }}
      >
        <div>
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                const idToDelete = task.id;
                onClose();
                onDeleteRequest(idToDelete);
              }}
              leftIcon={<Trash2 size={14} />}
            >
              Delete
            </Button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenEdit(task);
            }}
            leftIcon={<Pencil size={14} />}
          >
            Edit Task
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
