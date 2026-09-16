'use client';

import { CheckSquare, Square, X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button/Button';
import { DatePicker } from '@/components/ui/datePicker/DatePicker';
import { Select } from '@/components/ui/select/Select';
import { SideSheet } from '@/components/ui/sideSheet/SideSheet';
import type { Task, TaskPriority, TaskStatus, User } from '@/utils/types';

import styles from '../ProjectDetails.module.css';

import type { TaskForm } from './CreateTaskModal';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUS_FORM_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

interface TaskEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  form: TaskForm;
  setForm: React.Dispatch<React.SetStateAction<TaskForm>>;
  isSaving: boolean;
  onSave: () => void;
  onDeleteRequest: (taskId: string) => void;
  members: User[];
  currentUser: User | null;
  ownerId?: string;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (title: string) => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (stId: string, completed: boolean) => void;
  onDeleteSubtask: (stId: string) => void;
}

export const TaskEditSheet: React.FC<TaskEditSheetProps> = ({
  isOpen,
  onClose,
  task,
  form,
  setForm,
  isSaving,
  onSave,
  onDeleteRequest,
  members,
  currentUser,
  ownerId,
  newSubtaskTitle,
  setNewSubtaskTitle,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  if (!task) return null;

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.filter((m) => m && m.id).map((m) => ({ value: m.id, label: m.name })),
  ];

  const isProjectOwner = currentUser?.id === ownerId;
  const isTaskCreator = currentUser?.id === task.creator_id;
  const canEditTaskDetails = isProjectOwner || isTaskCreator || !task.creator_id;

  const canDeleteTask = canEditTaskDetails;

  return (
    <SideSheet isOpen={isOpen} onClose={onClose} title="Edit Task" description={task.title}>
      <div className={styles.taskForm}>
        {!canEditTaskDetails && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '14px',
              fontSize: '0.8125rem',
              color: 'var(--primary)',
              lineHeight: 1.4,
            }}
          >
            🔒 <strong>Read-Only Mode:</strong> Only the task creator or project owner can edit task
            title, description, priority, assignee, or due date. You can update the{' '}
            <strong>Status</strong> below.
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Title *</label>
          <input
            className={styles.textInput}
            placeholder="What needs to be done?"
            value={form.title}
            disabled={!canEditTaskDetails}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Optional description…"
            rows={3}
            value={form.description}
            disabled={!canEditTaskDetails}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className={styles.row2}>
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            disabled={!canEditTaskDetails}
            onChange={(v) => setForm((f) => ({ ...f, priority: v as TaskPriority }))}
          />
          <Select
            label="Status"
            options={STATUS_FORM_OPTIONS}
            value={form.status}
            onChange={(v) => setForm((f) => ({ ...f, status: v as TaskStatus }))}
          />
        </div>

        <div className={styles.row2}>
          <Select
            label="Assignee"
            options={memberOptions}
            value={form.assignee_id}
            disabled={!canEditTaskDetails}
            onChange={(v) => setForm((f) => ({ ...f, assignee_id: v }))}
            placeholder="Unassigned"
          />
          <DatePicker
            label="Due Date"
            value={form.due_date}
            disabled={!canEditTaskDetails}
            onChange={(v) => setForm((f) => ({ ...f, due_date: v }))}
          />
        </div>

        <div className={styles.subtasksSection}>
          <div className={styles.subtasksHeader}>
            <label className={styles.fieldLabel}>
              Subtasks ({form.subtasks.filter((s) => s.completed).length} of {form.subtasks.length})
            </label>
            {form.subtasks.length > 0 && (
              <div className={styles.subtaskProgressBar}>
                <div
                  className={styles.subtaskProgressFill}
                  style={{
                    width: `${Math.round(
                      (form.subtasks.filter((s) => s.completed).length / form.subtasks.length) * 100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className={styles.subtaskList}>
            {form.subtasks.map((st) => {
              const canDeleteSubtask =
                !st.creator_id ||
                st.creator_id === currentUser?.id ||
                task.creator_id === currentUser?.id ||
                ownerId === currentUser?.id;

              return (
                <div key={st.id} className={styles.subtaskRow}>
                  <button
                    type="button"
                    className={styles.subtaskCheckbox}
                    onClick={() => onToggleSubtask(st.id, !st.completed)}
                    aria-label={st.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'}
                  >
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
                  {canDeleteSubtask && (
                    <button
                      type="button"
                      className={styles.subtaskRemoveBtn}
                      onClick={() => onDeleteSubtask(st.id)}
                      aria-label="Delete subtask"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.subtaskInputRow}>
            <input
              className={styles.subtaskInput}
              placeholder="Add a subtask…"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newSubtaskTitle.trim()) {
                    onAddSubtask(newSubtaskTitle.trim());
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (newSubtaskTitle.trim()) {
                  onAddSubtask(newSubtaskTitle.trim());
                }
              }}
            >
              Add Subtask
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.sheetActions}>
        {canDeleteTask && (
          <Button variant="danger" size="sm" onClick={() => onDeleteRequest(task.id)}>
            Delete task
          </Button>
        )}
        <div className={styles.sheetActionsRight}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={isSaving} onClick={onSave}>
            Save changes
          </Button>
        </div>
      </div>
    </SideSheet>
  );
};
