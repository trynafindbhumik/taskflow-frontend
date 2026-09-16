'use client';

import { Plus } from 'lucide-react';
import React, { useState, useRef } from 'react';

import { TaskCard } from '@/components/elements/taskCard/TaskCard';
import type { Task, TaskStatus, User } from '@/utils/types';

import styles from './TaskColumn.module.css';

const COLUMN_CONFIG: Record<TaskStatus, { label: string; colorClass: string }> = {
  todo: { label: 'To Do', colorClass: 'colTodo' },
  in_progress: { label: 'In Progress', colorClass: 'colProgress' },
  done: { label: 'Done', colorClass: 'colDone' },
};

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  members?: User[];
  projectOwnerId?: string;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string, completed: boolean) => void;
  onReorder: (draggedId: string, targetId: string, position: 'above' | 'below') => void;
  onAddTask: (status: TaskStatus) => void;
  onViewTaskDetails?: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  tasks,
  members = [],
  projectOwnerId,
  onStatusChange,
  onSubtaskToggle,
  onReorder,
  onAddTask,
  onViewTaskDetails,
  onEditTask,
  onDeleteTask,
}) => {
  const [columnDragOver, setColumnDragOver] = useState(false);
  const [dropTarget, setDropTarget] = useState<{ id: string; pos: 'above' | 'below' } | null>(null);
  const dragOverTarget = useRef<string | null>(null);

  const config = COLUMN_CONFIG[status];

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverTarget.current) {
      setColumnDragOver(true);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setColumnDragOver(false);
      setDropTarget(null);
    }
  };

  const handleColumnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setColumnDragOver(false);
    setDropTarget(null);
    dragOverTarget.current = null;
    const draggedId = e.dataTransfer.getData('taskId');
    const draggedStatus = e.dataTransfer.getData('taskStatus') as TaskStatus;

    if (!draggedId) return;

    if (draggedStatus !== status) {
      onStatusChange(draggedId, status);
    }
  };

  const handleCardDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('taskId', id);
    e.dataTransfer.setData('taskStatus', status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverTarget.current = targetId;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'above' : 'below';

    setDropTarget({ id: targetId, pos });
  };

  const handleCardDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('taskId');
    const pos = dropTarget?.pos || 'below';

    setColumnDragOver(false);
    setDropTarget(null);
    dragOverTarget.current = null;

    if (!draggedId || draggedId === targetId) return;
    onReorder(draggedId, targetId, pos);
  };

  return (
    <div
      className={`${styles.column} ${columnDragOver ? styles.dragOver : ''}`}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleColumnDragLeave}
      onDrop={handleColumnDrop}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={`${styles.dot} ${styles[config.colorClass]}`} />
          <h3 className={styles.label}>{config.label}</h3>
          <span className={styles.count}>{tasks.length}</span>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${config.label}`}
          title="Add task"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            {...task}
            members={members}
            projectOwnerId={projectOwnerId}
            onStatusChange={onStatusChange}
            onSubtaskToggle={onSubtaskToggle}
            onViewDetails={onViewTaskDetails}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onDragStart={handleCardDragStart}
            onDragOver={(e, id) => handleCardDragOver(e as React.DragEvent, id)}
            onDrop={(e, id) => handleCardDrop(e as React.DragEvent, id)}
            isDraggedOver={dropTarget?.id === task.id ? dropTarget.pos : null}
          />
        ))}

        {tasks.length === 0 && (
          <div
            className={`${styles.empty} ${columnDragOver ? styles.emptyActive : ''}`}
            onDragEnter={() => setColumnDragOver(true)}
          >
            <p>Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};
