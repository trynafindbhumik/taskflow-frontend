'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';
import { preferences } from '@/utils/preferences';
import type { Task, TaskStatus, TaskPriority } from '@/utils/types';

const ITEMS_PER_PAGE = 10;

export function useTaskFilters(
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) {
  const { showToast } = useToast();

  const [view, setView] = useState<'board' | 'list'>(() => preferences.getDefaultView());
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [expandedListTaskIds, setExpandedListTaskIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    const handler = () => setView(preferences.getDefaultView());
    window.addEventListener('tf:preferences-saved', handler);
    return () => window.removeEventListener('tf:preferences-saved', handler);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' ? !t.assignee_id : t.assignee_id === assigneeFilter);
      const matchSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchPriority && matchAssignee && matchSearch;
    });
  }, [tasks, statusFilter, priorityFilter, assigneeFilter, searchQuery]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    filteredTasks.forEach((t) => grouped[t.status].push(t));
    return grouped;
  }, [filteredTasks]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, assigneeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  const toggleSelectTask = useCallback((id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  }, [selectedTaskIds.length, filteredTasks]);

  const handleBulkStatus = useCallback(
    async (status: string) => {
      if (!status || selectedTaskIds.length === 0) return;
      const ids = [...selectedTaskIds];
      const prev = [...tasks];
      setTasks((ts) =>
        ts.map((t) =>
          ids.includes(t.id)
            ? { ...t, status: status as TaskStatus, updated_at: new Date().toISOString() }
            : t
        )
      );
      try {
        await apiFetch('/tasks/bulk-update', {
          method: 'POST',
          body: JSON.stringify({ ids, status }),
        });
        showToast(`Updated status for ${ids.length} task(s)`, 'success');
        setSelectedTaskIds([]);
      } catch {
        setTasks(prev);
        showToast('Failed to update task statuses', 'error');
      }
    },
    [selectedTaskIds, tasks, setTasks, showToast]
  );

  const handleBulkPriority = useCallback(
    async (priority: string) => {
      if (!priority || selectedTaskIds.length === 0) return;
      const ids = [...selectedTaskIds];
      const prev = [...tasks];
      setTasks((ts) =>
        ts.map((t) =>
          ids.includes(t.id)
            ? { ...t, priority: priority as TaskPriority, updated_at: new Date().toISOString() }
            : t
        )
      );
      try {
        await apiFetch('/tasks/bulk-update', {
          method: 'POST',
          body: JSON.stringify({ ids, priority }),
        });
        showToast(`Updated priority for ${ids.length} task(s)`, 'success');
        setSelectedTaskIds([]);
      } catch {
        setTasks(prev);
        showToast('Failed to update task priorities', 'error');
      }
    },
    [selectedTaskIds, tasks, setTasks, showToast]
  );

  const handleBulkAssignee = useCallback(
    async (assigneeId: string) => {
      if (selectedTaskIds.length === 0) return;
      const ids = [...selectedTaskIds];
      const prev = [...tasks];
      const targetAssigneeId = assigneeId || null;

      setTasks((ts) =>
        ts.map((t) =>
          ids.includes(t.id)
            ? {
                ...t,
                assignee_id: targetAssigneeId || undefined,
                updated_at: new Date().toISOString(),
              }
            : t
        )
      );
      try {
        await apiFetch('/tasks/bulk-update', {
          method: 'POST',
          body: JSON.stringify({ ids, assignee_id: targetAssigneeId }),
        });
        showToast(`Updated assignee for ${ids.length} task(s)`, 'success');
        setSelectedTaskIds([]);
      } catch {
        setTasks(prev);
        showToast('Failed to update task assignees', 'error');
      }
    },
    [selectedTaskIds, tasks, setTasks, showToast]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedTaskIds.length === 0) return;
    setIsBulkDeleting(true);
    const ids = [...selectedTaskIds];
    const prev = [...tasks];
    setTasks((ts) => ts.filter((t) => !ids.includes(t.id)));
    try {
      await apiFetch('/tasks/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      showToast(`Deleted ${ids.length} task(s)`, 'success');
      setSelectedTaskIds([]);
      setBulkDeleteOpen(false);
    } catch {
      setTasks(prev);
      showToast('Failed to delete tasks', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  }, [selectedTaskIds, tasks, setTasks, showToast]);

  return {
    view,
    setView,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    searchQuery,
    setSearchQuery,
    descExpanded,
    setDescExpanded,
    filteredTasks,
    tasksByStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedTasks,
    itemsPerPage: ITEMS_PER_PAGE,
    selectedTaskIds,
    setSelectedTaskIds,
    expandedListTaskIds,
    setExpandedListTaskIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    isBulkDeleting,
    toggleSelectTask,
    toggleSelectAll,
    handleBulkStatus,
    handleBulkPriority,
    handleBulkAssignee,
    handleBulkDelete,
  };
}
