'use client';

import { LayoutGrid, List } from 'lucide-react';
import React from 'react';

import { Select, type SelectOption } from '@/components/ui/select/Select';
import type { User } from '@/utils/types';

import styles from '../ProjectDetails.module.css';

interface ProjectToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (val: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (val: string) => void;
  view: 'board' | 'list';
  onViewChange: (view: 'board' | 'list') => void;
  members: User[];
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS_FILTER: SelectOption[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const ProjectToolbar: React.FC<ProjectToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  view,
  onViewChange,
  members,
}) => {
  const assigneeOptions: SelectOption[] = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Filter tasks by title or description…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className={styles.selectWrap}>
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={onStatusFilterChange}
            placeholder="Status"
          />
        </div>

        <div className={styles.selectWrap}>
          <Select
            options={PRIORITY_OPTIONS_FILTER}
            value={priorityFilter}
            onChange={onPriorityFilterChange}
            placeholder="Priority"
          />
        </div>

        <div className={styles.selectWrap}>
          <Select
            options={assigneeOptions}
            value={assigneeFilter}
            onChange={onAssigneeFilterChange}
            placeholder="Assignee"
          />
        </div>
      </div>

      <div className={styles.viewToggle} role="group" aria-label="Task view mode">
        <button
          type="button"
          className={`${styles.viewBtn} ${view === 'board' ? styles.viewBtnActive : ''}`}
          onClick={() => onViewChange('board')}
          aria-pressed={view === 'board'}
          title="Board view"
        >
          <LayoutGrid size={15} />
          <span>Board</span>
        </button>

        <button
          type="button"
          className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
          onClick={() => onViewChange('list')}
          aria-pressed={view === 'list'}
          title="List view"
        >
          <List size={15} />
          <span>List</span>
        </button>
      </div>
    </div>
  );
};
