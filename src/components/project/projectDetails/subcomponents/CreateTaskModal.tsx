'use client';

import { CheckSquare, Square, X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button/Button';
import { DatePicker } from '@/components/ui/datePicker/DatePicker';
import { Modal } from '@/components/ui/modal/Modal';
import { Select } from '@/components/ui/select/Select';
import type { TaskPriority, TaskStatus, User, Subtask } from '@/utils/types';

import styles from '../ProjectDetails.module.css';

export interface TaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string;
  due_date: string;
  subtasks: Subtask[];
}

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

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: () => void;
  form: TaskForm;
  setForm: React.Dispatch<React.SetStateAction<TaskForm>>;
  isSaving: boolean;
  members: User[];
  newSubtaskTitle: string;
  setNewSubtaskTitle: (title: string) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  form,
  setForm,
  isSaving,
  members,
  newSubtaskTitle,
  setNewSubtaskTitle,
}) => {
  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.filter((m) => m && m.id).map((m) => ({ value: m.id, label: m.name })),
  ];

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const titleToAdd = newSubtaskTitle.trim();
    setNewSubtaskTitle('');
    setForm((f) => ({
      ...f,
      subtasks: [
        ...f.subtasks,
        {
          id: `st_${Math.random().toString(36).slice(2, 9)}`,
          title: titleToAdd,
          completed: false,
        },
      ],
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description={`Adding to: ${form.status.replace('_', ' ')}`}
      size="md"
    >
      <div className={styles.taskForm}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Title *</label>
          <input
            className={styles.textInput}
            placeholder="What needs to be done?"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Optional description…"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className={styles.row2}>
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
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
            onChange={(v) => setForm((f) => ({ ...f, assignee_id: v }))}
            placeholder="Unassigned"
          />
          <DatePicker
            label="Due Date"
            value={form.due_date}
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
            {form.subtasks.map((st) => (
              <div key={st.id} className={styles.subtaskRow}>
                <button
                  type="button"
                  className={styles.subtaskCheckbox}
                  onClick={() => {
                    const nextCompleted = !st.completed;
                    setForm((f) => ({
                      ...f,
                      subtasks: f.subtasks.map((item) =>
                        item.id === st.id ? { ...item, completed: nextCompleted } : item
                      ),
                    }));
                  }}
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
                <button
                  type="button"
                  className={styles.subtaskRemoveBtn}
                  onClick={() => {
                    setForm((f) => ({
                      ...f,
                      subtasks: f.subtasks.filter((item) => item.id !== st.id),
                    }));
                  }}
                  aria-label="Delete subtask"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
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
                  handleAddSubtask();
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddSubtask}>
              Add Subtask
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.modalActions}>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={isSaving} onClick={onCreateTask}>
          Create Task
        </Button>
      </div>
    </Modal>
  );
};
