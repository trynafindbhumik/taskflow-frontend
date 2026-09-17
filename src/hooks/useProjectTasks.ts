'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import type { TaskForm } from '@/components/project/projectDetails/subcomponents/CreateTaskModal';
import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';
import { auth } from '@/utils/auth';
import type { Project, Task, TaskStatus, User, ProjectMember, Subtask } from '@/utils/types';

const DEFAULT_FORM: TaskForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee_id: '',
  due_date: '',
  subtasks: [],
};

export function useProjectTasks(projectId: string) {
  const router = useRouter();
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TaskForm>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const [editSheet, setEditSheet] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<TaskForm>(DEFAULT_FORM);
  const [isEditSaving, setIsEditSaving] = useState(false);

  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [membersOpen, setMembersOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [inviteEmails, setInviteEmails] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [detailsSubtaskTitle, setDetailsSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);

  useEffect(() => {
    setCurrentUser(auth.getUser());
  }, []);

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      try {
        const [projectData, tasksData, membersData] = (await Promise.all([
          apiFetch(`/projects/${projectId}`),
          apiFetch(`/projects/${projectId}/tasks`),
          apiFetch(`/projects/${projectId}/members`),
        ])) as [Project, Task[], ProjectMember[]];

        setProject(projectData);
        setTasks(tasksData);
        setMembers(membersData.map((m) => m.user));
      } catch {
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [projectId]);

  const handleStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const prev = [...tasks];
      setTasks((ts) =>
        ts.map((t) =>
          t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
        )
      );
      setViewTask((prevView) => {
        if (prevView && prevView.id === taskId) {
          return { ...prevView, status: newStatus, updated_at: new Date().toISOString() };
        }
        return prevView;
      });

      try {
        await apiFetch(`/tasks/${taskId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err: unknown) {
        setTasks(prev);
        setViewTask((prevView) => {
          if (prevView && prevView.id === taskId) {
            const oldTask = prev.find((pt) => pt.id === taskId);
            return oldTask ? oldTask : prevView;
          }
          return prevView;
        });
        showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
      }
    },
    [tasks, showToast]
  );

  const handleSubtaskToggle = useCallback(
    async (taskId: string, subtaskId: string, completed: boolean) => {
      const prev = [...tasks];
      let updatedSubtasks: Subtask[] = [];

      setTasks((ts) =>
        ts.map((t) => {
          if (t.id !== taskId) return t;
          updatedSubtasks = (t.subtasks ?? []).map((st) =>
            st.id === subtaskId ? { ...st, completed } : st
          );
          return { ...t, subtasks: updatedSubtasks, updated_at: new Date().toISOString() };
        })
      );

      setViewTask((prevView) => {
        if (prevView && prevView.id === taskId) {
          const nextSubtasks = (prevView.subtasks ?? []).map((st) =>
            st.id === subtaskId ? { ...st, completed } : st
          );
          return { ...prevView, subtasks: nextSubtasks, updated_at: new Date().toISOString() };
        }
        return prevView;
      });

      try {
        await apiFetch(`/tasks/subtasks/${subtaskId}`, {
          method: 'PATCH',
          body: JSON.stringify({ completed }),
        });
      } catch {
        setTasks(prev);
        setViewTask((prevView) => {
          if (prevView && prevView.id === taskId) {
            const oldTask = prev.find((pt) => pt.id === taskId);
            return oldTask ? oldTask : prevView;
          }
          return prevView;
        });
        showToast('Failed to update subtask', 'error');
      }
    },
    [tasks, showToast]
  );

  const handleReorder = useCallback(
    (draggedId: string, targetId: string, position: 'above' | 'below') => {
      setTasks((prev) => {
        const arr = [...prev];
        const draggedIdx = arr.findIndex((t) => t.id === draggedId);
        const targetIdx = arr.findIndex((t) => t.id === targetId);
        if (draggedIdx === -1 || targetIdx === -1) return prev;
        const [dragged] = arr.splice(draggedIdx, 1);
        const insertAt = arr.findIndex((t) => t.id === targetId);
        arr.splice(position === 'above' ? insertAt : insertAt + 1, 0, dragged);
        return arr;
      });
    },
    []
  );

  const openCreate = useCallback((status: TaskStatus) => {
    setCreateForm({ ...DEFAULT_FORM, status, subtasks: [] });
    setNewSubtaskTitle('');
    setCreateOpen(true);
  }, []);

  const handleCreateTask = useCallback(async () => {
    if (!createForm.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const task = (await apiFetch(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim() || undefined,
          status: createForm.status,
          priority: createForm.priority,
          assignee_id: createForm.assignee_id || null,
          due_date: createForm.due_date || undefined,
          subtasks: createForm.subtasks,
        }),
      })) as Task;
      setTasks((ts) => [...ts, task]);
      setCreateOpen(false);
      setCreateForm(DEFAULT_FORM);
      setNewSubtaskTitle('');
      showToast('Task created successfully', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create task', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [createForm, projectId, showToast]);

  const openEdit = useCallback((task: Task) => {
    setEditSheet(task);
    setEditForm({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      assignee_id: task.assignee_id ?? '',
      due_date: task.due_date ?? '',
      subtasks: task.subtasks ? [...task.subtasks] : [],
    });
    setNewSubtaskTitle('');
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editSheet || !editForm.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    setIsEditSaving(true);
    try {
      const updated = (await apiFetch(`/tasks/${editSheet.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || undefined,
          status: editForm.status,
          priority: editForm.priority,
          assignee_id: editForm.assignee_id || null,
          due_date: editForm.due_date || undefined,
          subtasks: editForm.subtasks,
        }),
      })) as Task;
      setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
      setEditSheet(null);
      showToast('Task updated', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update task', 'error');
    } finally {
      setIsEditSaving(false);
    }
  }, [editSheet, editForm, showToast]);

  const handleDeleteTask = useCallback(async () => {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/tasks/${deleteTaskId}`, { method: 'DELETE' });
      setTasks((ts) => ts.filter((t) => t.id !== deleteTaskId));
      setDeleteTaskId(null);
      showToast('Task deleted', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTaskId, showToast]);

  const handleAddMember = useCallback(
    async (userId: string) => {
      if ((members || []).some((m) => m && m.id === userId)) return;
      setAddingId(userId);
      try {
        await apiFetch(`/projects/${projectId}/members`, {
          method: 'POST',
          body: JSON.stringify({ user_id: userId }),
        });

        const freshMembersData = (await apiFetch(
          `/projects/${projectId}/members`
        )) as ProjectMember[];
        setMembers(
          freshMembersData.map((m) => m.user || (m as unknown as User)).filter((u) => u && u.id)
        );
        showToast('Member added', 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to add member', 'error');
      } finally {
        setAddingId(null);
      }
    },
    [members, projectId, showToast]
  );

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      setRemovingId(userId);
      try {
        await apiFetch(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
        setMembers((prev) => (prev || []).filter((m) => m && m.id && m.id !== userId));

        const updatedTasks = (await apiFetch(`/projects/${projectId}/tasks`)) as Task[];
        setTasks(updatedTasks);

        showToast('Member removed', 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to remove member', 'error');
      } finally {
        setRemovingId(null);
      }
    },
    [projectId, showToast]
  );

  const handleLeaveProject = useCallback(
    async (userId: string) => {
      setRemovingId(userId);
      try {
        await apiFetch(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
        showToast('You have left the project', 'success');
        setMembersOpen(false);
        router.push('/projects');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to leave project', 'error');
        setRemovingId(null);
      }
    },
    [projectId, router, showToast]
  );

  const handleSendInvites = useCallback(async () => {
    if (!inviteEmails.trim()) {
      showToast('Please enter at least one email address', 'error');
      return;
    }

    const emails = inviteEmails
      .split(/[\s,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (emails.length === 0) return;

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emails.filter((e) => !EMAIL_REGEX.test(e));
    if (invalid.length > 0) {
      showToast(`Invalid email${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`, 'error');
      return;
    }

    setIsInviting(true);
    try {
      const res = await apiFetch<{ message?: string }>(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ emails }),
      });

      const freshMembersData = (await apiFetch(
        `/projects/${projectId}/members`
      )) as ProjectMember[];
      setMembers(
        freshMembersData.map((m) => m.user || (m as unknown as User)).filter((u) => u && u.id)
      );
      setInviteEmails('');
      showToast(
        res.message || `Invitation emails sent successfully to ${emails.length} recipient(s).`,
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to send invitations', 'error');
    } finally {
      setIsInviting(false);
    }
  }, [inviteEmails, projectId, showToast]);

  return {
    project,
    tasks,
    setTasks,
    members,
    currentUser,
    isLoading,
    isNotFound,
    createOpen,
    setCreateOpen,
    createForm,
    setCreateForm,
    isSaving,
    editSheet,
    setEditSheet,
    editForm,
    setEditForm,
    isEditSaving,
    deleteTaskId,
    setDeleteTaskId,
    isDeleting,
    membersOpen,
    setMembersOpen,
    removingId,
    addingId,
    inviteEmails,
    setInviteEmails,
    isInviting,
    newSubtaskTitle,
    setNewSubtaskTitle,
    detailsSubtaskTitle,
    setDetailsSubtaskTitle,
    isAddingSubtask,
    setIsAddingSubtask,
    viewTask,
    setViewTask,
    handleStatusChange,
    handleSubtaskToggle,
    handleReorder,
    openCreate,
    handleCreateTask,
    openEdit,
    handleEditSave,
    handleDeleteTask,
    handleAddMember,
    handleRemoveMember,
    handleLeaveProject,
    handleSendInvites,
    handleAddSubtaskInModal: async () => {
      if (viewTask && detailsSubtaskTitle.trim()) {
        const titleToCreate = detailsSubtaskTitle.trim();
        setDetailsSubtaskTitle('');
        setIsAddingSubtask(true);
        try {
          const createdSt = (await apiFetch(`/tasks/${viewTask.id}/subtasks`, {
            method: 'POST',
            body: JSON.stringify({ title: titleToCreate }),
          })) as Subtask;

          setTasks((ts) =>
            ts.map((t) =>
              t.id === viewTask.id ? { ...t, subtasks: [...(t.subtasks || []), createdSt] } : t
            )
          );
          setViewTask((prevView) =>
            prevView && prevView.id === viewTask.id
              ? { ...prevView, subtasks: [...(prevView.subtasks || []), createdSt] }
              : prevView
          );
        } catch {
          showToast('Failed to add subtask', 'error');
        } finally {
          setIsAddingSubtask(false);
        }
      }
    },
  };
}
