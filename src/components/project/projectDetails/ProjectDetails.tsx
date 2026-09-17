'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import { TaskColumn } from '@/components/elements/taskColumn/TaskColumn';
import NotFoundComponent from '@/components/notFound/NotFound';
import { ConfirmDialog } from '@/components/ui/confirmDialog/ConfirmDialog';
import { useProjectTasks } from '@/hooks/useProjectTasks';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import type { TaskStatus } from '@/utils/types';

import styles from './ProjectDetails.module.css';
import { CreateTaskModal } from './subcomponents/CreateTaskModal';
import { ProjectHeader } from './subcomponents/ProjectHeader';
import { ProjectMembersSheet } from './subcomponents/ProjectMembersSheet';
import { ProjectToolbar } from './subcomponents/ProjectToolbar';
import { TaskDetailsModal } from './subcomponents/TaskDetailsModal';
import { TaskEditSheet } from './subcomponents/TaskEditSheet';
import { TaskListView } from './subcomponents/TaskListView';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
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
    handleAddSubtaskInModal,
  } = useProjectTasks(projectId);

  const {
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
    itemsPerPage,
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
  } = useTaskFilters(tasks, setTasks);

  const ownerId = project?.owner_id;

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <span>Loading project…</span>
      </div>
    );
  }

  if (isNotFound) {
    return <NotFoundComponent />;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <ProjectHeader
          project={project}
          members={members}
          descExpanded={descExpanded}
          onToggleDesc={() => setDescExpanded((v) => !v)}
          onOpenMembers={() => setMembersOpen(true)}
          onOpenCreateTask={() => openCreate('todo')}
        />

        <ProjectToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          assigneeFilter={assigneeFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          view={view}
          onViewChange={setView}
          members={members}
        />

        {view === 'board' ? (
          <div className={styles.board}>
            {STATUSES.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                members={members}
                projectOwnerId={ownerId}
                onStatusChange={handleStatusChange}
                onSubtaskToggle={handleSubtaskToggle}
                onReorder={handleReorder}
                onAddTask={openCreate}
                onViewTaskDetails={(task) => setViewTask(task)}
                onEditTask={openEdit}
                onDeleteTask={setDeleteTaskId}
              />
            ))}
          </div>
        ) : (
          <TaskListView
            filteredTasks={filteredTasks}
            paginatedTasks={paginatedTasks}
            members={members}
            selectedTaskIds={selectedTaskIds}
            expandedListTaskIds={expandedListTaskIds}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onToggleSelectTask={toggleSelectTask}
            onToggleSelectAll={toggleSelectAll}
            onToggleExpand={(id) =>
              setExpandedListTaskIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            onViewTaskDetails={(task) => setViewTask(task)}
            onSubtaskToggle={handleSubtaskToggle}
            onBulkStatus={handleBulkStatus}
            onBulkPriority={handleBulkPriority}
            onBulkAssignee={handleBulkAssignee}
            onOpenBulkDelete={() => setBulkDeleteOpen(true)}
            onClearSelection={() => setSelectedTaskIds([])}
            onPageChange={setCurrentPage}
            onOpenCreate={() => openCreate('todo')}
          />
        )}
      </main>

      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreateTask={handleCreateTask}
        form={createForm}
        setForm={setCreateForm}
        isSaving={isSaving}
        members={members}
        newSubtaskTitle={newSubtaskTitle}
        setNewSubtaskTitle={setNewSubtaskTitle}
      />

      <TaskEditSheet
        isOpen={!!editSheet}
        onClose={() => setEditSheet(null)}
        task={editSheet}
        form={editForm}
        setForm={setEditForm}
        isSaving={isEditSaving}
        onSave={handleEditSave}
        onDeleteRequest={(taskId) => {
          setDeleteTaskId(taskId);
          setEditSheet(null);
        }}
        members={members}
        currentUser={currentUser}
        ownerId={ownerId}
        newSubtaskTitle={newSubtaskTitle}
        setNewSubtaskTitle={setNewSubtaskTitle}
        onAddSubtask={(title) => {
          setEditForm((f) => ({
            ...f,
            subtasks: [
              ...f.subtasks,
              { id: `st_${Math.random().toString(36).slice(2, 9)}`, title, completed: false },
            ],
          }));
        }}
        onToggleSubtask={(stId, completed) => {
          setEditForm((f) => ({
            ...f,
            subtasks: f.subtasks.map((s) => (s.id === stId ? { ...s, completed } : s)),
          }));
        }}
        onDeleteSubtask={(stId) => {
          setEditForm((f) => ({
            ...f,
            subtasks: f.subtasks.filter((s) => s.id !== stId),
          }));
        }}
      />

      <TaskDetailsModal
        isOpen={!!viewTask}
        onClose={() => setViewTask(null)}
        task={viewTask}
        projectName={project?.name}
        members={members}
        currentUser={currentUser}
        ownerId={ownerId}
        onStatusChange={handleStatusChange}
        onSubtaskToggle={handleSubtaskToggle}
        detailsSubtaskTitle={detailsSubtaskTitle}
        setDetailsSubtaskTitle={setDetailsSubtaskTitle}
        onAddSubtaskInModal={handleAddSubtaskInModal}
        isAddingSubtask={isAddingSubtask}
        onOpenEdit={openEdit}
        onDeleteRequest={(id) => setDeleteTaskId(id)}
      />

      <ProjectMembersSheet
        isOpen={membersOpen}
        onClose={() => setMembersOpen(false)}
        members={members}
        currentUser={currentUser}
        ownerId={ownerId}
        removingId={removingId}
        addingId={addingId}
        inviteEmails={inviteEmails}
        setInviteEmails={setInviteEmails}
        isInviting={isInviting}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onLeaveProject={handleLeaveProject}
        onSendInvites={handleSendInvites}
      />

      <ConfirmDialog
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="This task will be permanently removed. This action cannot be undone."
        confirmLabel="Delete task"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Tasks"
        message={`This will permanently delete ${selectedTaskIds.length} task(s). This action cannot be undone.`}
        confirmLabel={`Delete ${selectedTaskIds.length} task(s)`}
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
