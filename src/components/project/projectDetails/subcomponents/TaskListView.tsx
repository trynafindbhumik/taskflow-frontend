'use client';

import {
  AlertCircle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Square,
  Trash2,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import type { Task, User } from '@/utils/types';

import styles from '../ProjectDetails.module.css';

const STATUS_FORM_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

interface TaskListViewProps {
  filteredTasks: Task[];
  paginatedTasks: Task[];
  members: User[];
  selectedTaskIds: string[];
  expandedListTaskIds: string[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onToggleSelectTask: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleExpand: (id: string) => void;
  onViewTaskDetails: (task: Task) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string, completed: boolean) => void;
  onBulkStatus: (status: string) => void;
  onBulkPriority: (priority: string) => void;
  onBulkAssignee: (assigneeId: string) => void;
  onOpenBulkDelete: () => void;
  onClearSelection: () => void;
  onPageChange: (page: number) => void;
  onOpenCreate: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  filteredTasks,
  paginatedTasks,
  members,
  selectedTaskIds,
  expandedListTaskIds,
  currentPage,
  totalPages,
  itemsPerPage,
  onToggleSelectTask,
  onToggleSelectAll,
  onToggleExpand,
  onViewTaskDetails,
  onSubtaskToggle,
  onBulkStatus,
  onBulkPriority,
  onBulkAssignee,
  onOpenBulkDelete,
  onClearSelection,
  onPageChange,
  onOpenCreate,
}) => {
  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.filter((m) => m && m.id).map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <div className={styles.listViewWrap}>
      {selectedTaskIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selectedTaskIds.length} task(s) selected</span>
          <div className={styles.bulkActions}>
            <div className={styles.bulkSelectWrap}>
              <Select
                options={STATUS_FORM_OPTIONS}
                value=""
                onChange={onBulkStatus}
                placeholder="Status…"
              />
            </div>
            <div className={styles.bulkSelectWrap}>
              <Select
                options={PRIORITY_OPTIONS}
                value=""
                onChange={onBulkPriority}
                placeholder="Priority…"
              />
            </div>
            <div className={styles.bulkSelectWrap}>
              <Select
                options={memberOptions}
                value=""
                onChange={onBulkAssignee}
                placeholder="Assignee…"
              />
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={onOpenBulkDelete}
              leftIcon={<Trash2 size={13} />}
            >
              Delete ({selectedTaskIds.length})
            </Button>
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              Deselect
            </Button>
          </div>
        </div>
      )}

      <div className={styles.listView}>
        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tasks match your filters.</p>
            <Button variant="outline" size="sm" onClick={onOpenCreate}>
              Add a task
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.listHeaderRow}>
              <div className={styles.listCheckboxWrap}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={
                    filteredTasks.length > 0 &&
                    filteredTasks.every((t) => selectedTaskIds.includes(t.id))
                  }
                  onChange={onToggleSelectAll}
                  aria-label="Select all tasks"
                />
              </div>
              <span>Status</span>
              <span>Task Title</span>
              <span>Subtasks</span>
              <span>Priority</span>
              <span>Assignee</span>
              <span>Due Date</span>
            </div>

            {paginatedTasks.map((task) => {
              const assignee = members.find((m) => m.id === task.assignee_id);
              const isSelected = selectedTaskIds.includes(task.id);
              const isExpanded = expandedListTaskIds.includes(task.id);
              const isOverdue =
                !!task.due_date &&
                task.status !== 'done' &&
                new Date(task.due_date + 'T23:59:59').getTime() < new Date().getTime();

              const totalSubtasks = task.subtasks?.length ?? 0;
              const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;

              return (
                <React.Fragment key={task.id}>
                  <div
                    className={`${styles.listRow} ${isSelected ? styles.listRowSelected : ''}`}
                    onClick={() => onViewTaskDetails(task)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onViewTaskDetails(task)}
                  >
                    <div className={styles.listCheckboxWrap} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isSelected}
                        onChange={() => onToggleSelectTask(task.id)}
                        aria-label={`Select ${task.title}`}
                      />
                    </div>
                    <span className={`${styles.listStatus} ${styles[`listStatus_${task.status}`]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <div className={styles.listMain}>
                      <span className={styles.listTitle}>{task.title}</span>
                      {task.description && (
                        <span className={styles.listDesc}>{task.description}</span>
                      )}
                    </div>

                    <div>
                      {totalSubtasks > 0 ? (
                        <button
                          type="button"
                          className={styles.listSubtasksBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand(task.id);
                          }}
                          title={`${completedSubtasks} of ${totalSubtasks} completed. Click to toggle checklist.`}
                        >
                          <CheckSquare size={12} />
                          {completedSubtasks}/{totalSubtasks}
                          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      ) : (
                        <span className={styles.listUnassigned}>—</span>
                      )}
                    </div>

                    <span
                      className={`${styles.listPriority} ${styles[`listPriority_${task.priority}`]}`}
                    >
                      {task.priority}
                    </span>
                    {assignee ? (
                      <span className={styles.listAssignee} title={assignee.name}>
                        {assignee.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    ) : (
                      <span className={styles.listUnassigned}>—</span>
                    )}
                    <span className={styles.listDate}>
                      {task.due_date ? (
                        isOverdue ? (
                          <span className={styles.listDateOverdue} title="Overdue task">
                            <AlertCircle size={12} /> {task.due_date} Overdue
                          </span>
                        ) : (
                          task.due_date
                        )
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>

                  {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                    <div
                      className={styles.listExpandedSubtasks}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {task.subtasks.map((st) => (
                        <div
                          key={st.id}
                          className={styles.subtaskRow}
                          onClick={() => onSubtaskToggle(task.id, st.id, !st.completed)}
                          role="button"
                          tabIndex={0}
                        >
                          <button type="button" className={styles.subtaskCheckbox}>
                            {st.completed ? (
                              <CheckSquare size={15} className={styles.subtaskCheckDone} />
                            ) : (
                              <Square size={15} className={styles.subtaskCheckTodo} />
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
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>

      {filteredTasks.length > itemsPerPage && (
        <div className={styles.paginationBar}>
          <span className={styles.paginationInfo}>
            Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredTasks.length)} of {filteredTasks.length}{' '}
            tasks
          </span>
          <div className={styles.paginationButtons}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ''}`}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
