import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProjectBoard } from '../../components/work/ProjectBoard';
import { KanbanBoard } from '../../components/work/KanbanBoard';
import { WorkItemDetails } from '../../components/work/WorkItemDetails';
import { fetchProjects, fetchWorkItems, updateWorkItemStatus, addWorkItemComment, createWorkItem } from '../../api/work';
import type { Project, ProjectMember, WorkItem } from '../../types/api';
import { ProjectTimeline } from '../../components/work/ProjectTimeline';
import { useAuth } from '../../hooks/useAuth';
import type { AuthContextValue } from '../../context/AuthContext';

export const WorkPortalPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth() as AuthContextValue;
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const { data: workItems = [], isLoading: isWorkItemsLoading } = useQuery({ queryKey: ['work-items'], queryFn: fetchWorkItems });
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projects[0]?.id);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | undefined>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'TASK' as WorkItem['type'],
    priority: 'MEDIUM' as WorkItem['priority'],
    assigneeId: '',
    dueDate: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const filteredWorkItems = useMemo(() => {
    if (!selectedProjectId) return workItems;
    return workItems.filter((item) => item.projectId === selectedProjectId);
  }, [selectedProjectId, workItems]);

  useEffect(() => {
    if (!filteredWorkItems.length) {
      setSelectedWorkItemId(undefined);
      return;
    }

    if (!selectedWorkItemId || !filteredWorkItems.some((item) => item.id === selectedWorkItemId)) {
      setSelectedWorkItemId(filteredWorkItems[0].id);
    }
  }, [filteredWorkItems, selectedWorkItemId]);

  const selectedWorkItem = filteredWorkItems.find((item) => item.id === selectedWorkItemId) ?? null;
  const selectedProject = useMemo<Project | undefined>(() => {
    if (!selectedProjectId) return undefined;
    return projects.find((project) => project.id === selectedProjectId);
  }, [projects, selectedProjectId]);
  const projectMembers = selectedProject?.members ?? [];

  useEffect(() => {
    if (!selectedProject) {
      setNewItem((prev) => ({ ...prev, assigneeId: '' }));
      return;
    }

    const members = selectedProject.members ?? [];
    if (members.length === 0) {
      setNewItem((prev) => ({ ...prev, assigneeId: '' }));
      return;
    }

    setNewItem((prev) => {
      const hasValidAssignee = prev.assigneeId ? members.some((member) => member.user.id === prev.assigneeId) : false;
      if (hasValidAssignee) {
        return prev;
      }

      const defaultAssignee =
        members.find((member) => member.user.id === user?.id)?.user.id ?? members[0].user.id;

      return {
        ...prev,
        assigneeId: defaultAssignee,
      };
    });
  }, [selectedProject, user?.id, showCreateForm]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkItem['status'] }) => updateWorkItemStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['work-items'] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
      ]);
    },
  });

  const createWorkItemMutation = useMutation({
    mutationFn: (payload: {
      projectId: string;
      title: string;
      description?: string;
      type: WorkItem['type'];
      priority: WorkItem['priority'];
      assigneeId: string;
      reporterId: string;
      status?: WorkItem['status'];
      dueDate?: string;
    }) => createWorkItem(payload),
    onSuccess: async (created) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['work-items'] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
      ]);

      if (created?.id) {
        setSelectedWorkItemId(created.id);
      }
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => addWorkItemComment(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });

  const hasSelections = Boolean(selectedProjectId);
  const isCreatingItem = createWorkItemMutation.isPending;
  const isCreateDisabled = !selectedProject || !user || projectMembers.length === 0;

  const formatMemberName = (member: ProjectMember) => {
    const firstName = member.user.profile?.firstName ?? '';
    const lastName = member.user.profile?.lastName ?? '';
    const name = `${firstName} ${lastName}`.trim();
    if (name) return name;
    return member.user.email ?? 'Team member';
  };

  const resetForm = () => {
    setNewItem({
      title: '',
      type: 'TASK' as WorkItem['type'],
      priority: 'MEDIUM' as WorkItem['priority'],
      assigneeId: '',
      dueDate: '',
      description: '',
    });
    setFormError(null);
  };

  const handleToggleCreateForm = () => {
    setFormError(null);
    setShowCreateForm((previous) => {
      const next = !previous;
      if (!next) {
        resetForm();
      }
      return next;
    });
  };

  const handleCancelCreate = () => {
    resetForm();
    setShowCreateForm(false);
  };

  const handleCreateWorkItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProject) {
      setFormError('Select a project before creating a work item.');
      return;
    }

    if (!user) {
      setFormError('You need to be signed in to create work items.');
      return;
    }

    const trimmedTitle = newItem.title.trim();
    if (!trimmedTitle) {
      setFormError('A title helps the team understand the work. Add one before submitting.');
      return;
    }

    if (!newItem.assigneeId) {
      setFormError('Assign this work item to someone on the project.');
      return;
    }

    setFormError(null);

    try {
      await createWorkItemMutation.mutateAsync({
        projectId: selectedProject.id,
        title: trimmedTitle,
        description: newItem.description.trim() ? newItem.description.trim() : undefined,
        type: newItem.type,
        priority: newItem.priority,
        assigneeId: newItem.assigneeId,
        reporterId: user.id,
        dueDate: newItem.dueDate || undefined,
      });
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setFormError(error.message);
      } else {
        setFormError('Something went wrong while saving. Try again.');
      }
    }
  };

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Work Portal</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">R&D Project Operations</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Visualize work, ship faster, and keep history for every change. Start with the Work Portal to drive R&D initiatives.
            </p>
          </div>
          <Badge variant="info">Kanban + Timeline</Badge>
        </div>
      </header>

      <ProjectBoard
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />

      <Card title="Sprint Snapshot" subtitle="Current sprint delivery health">
        <div className="grid gap-4 text-sm text-slate-200 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Active work items</p>
            <p className="mt-2 text-3xl font-semibold text-white">{workItems.filter((item) => item.status !== 'DONE').length}</p>
            <p className="text-xs text-slate-400">Across {projects.length} projects</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Velocity trend</p>
            <p className="mt-2 text-3xl font-semibold text-white">↑ 12%</p>
            <p className="text-xs text-slate-400">Compared to previous sprint</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Done this sprint</p>
            <p className="mt-2 text-3xl font-semibold text-white">{workItems.filter((item) => item.status === 'DONE').length}</p>
            <p className="text-xs text-slate-400">Ready for QA handoff</p>
          </div>
        </div>
      </Card>

      <KanbanBoard
        items={filteredWorkItems}
        onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        onSelectItem={setSelectedWorkItemId}
        selectedItemId={selectedWorkItemId}
      />

      <Card
        title="Create Work Item"
        subtitle={selectedProject ? `Log new tasks and bugs for ${selectedProject.title}` : 'Pick a project to start capturing new work items.'}
        action={selectedProject ? (
          <Button variant="ghost" onClick={handleToggleCreateForm}>
            {showCreateForm ? 'Close' : 'New Item'}
          </Button>
        ) : undefined}
      >
        {selectedProject ? (
          showCreateForm ? (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateWorkItem}>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="E.g. Implement notification preferences"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Type</label>
                <select
                  value={newItem.type}
                  onChange={(event) => setNewItem((prev) => ({ ...prev, type: event.target.value as WorkItem['type'] }))}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="FEATURE">Feature</option>
                  <option value="BUG">Bug</option>
                  <option value="TASK">Task</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Priority</label>
                <select
                  value={newItem.priority}
                  onChange={(event) => setNewItem((prev) => ({ ...prev, priority: event.target.value as WorkItem['priority'] }))}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Assignee</label>
                <select
                  value={newItem.assigneeId}
                  onChange={(event) => setNewItem((prev) => ({ ...prev, assigneeId: event.target.value }))}
                  disabled={projectMembers.length === 0}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white disabled:opacity-60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="" disabled>
                    {projectMembers.length === 0 ? 'Add collaborators to assign work' : 'Choose a teammate'}
                  </option>
                  {projectMembers.map((member) => (
                    <option key={member.id} value={member.user.id}>
                      {formatMemberName(member)}
                    </option>
                  ))}
                </select>
                {projectMembers.length === 0 ? (
                  <p className="text-xs text-amber-300">No members yet. Invite collaborators to assign ownership.</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Due date</label>
                <input
                  type="date"
                  value={newItem.dueDate}
                  onChange={(event) => setNewItem((prev) => ({ ...prev, dueDate: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(event) => setNewItem((prev) => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  placeholder="Provide context, acceptance criteria, or links for the assignee."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              {formError ? (
                <p className="md:col-span-2 text-sm text-red-300">{formError}</p>
              ) : null}

              <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleCancelCreate}>
                  Cancel
                </Button>
                <Button type="submit" variant="secondary" loading={isCreatingItem} disabled={isCreateDisabled}>
                  Create item
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-sm text-slate-200">
              <p>
                Capture product features, bugs, or operational tasks right from the work portal. Choose a project, then hit
                “New Item” to describe the work.
              </p>
              <p className="text-xs text-slate-400">
                Need inspiration? Keep titles short, add context in the description, and assign the best owner for the job.
              </p>
            </div>
          )
        ) : (
          <p className="text-sm text-slate-200">
            Select a project from the board above to enable quick capture of new work items and sprint backlog entries.
          </p>
        )}
      </Card>

      <ProjectTimeline project={selectedProject} />

      <WorkItemDetails
        workItem={selectedWorkItem}
        onAddComment={async (body) => {
          if (!selectedWorkItemId) return;
          await commentMutation.mutateAsync({ id: selectedWorkItemId, body });
        }}
      />

      {!hasSelections && projects.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
          Select a project to focus your work items and comments.
        </div>
      )}

      {isProjectsLoading || isWorkItemsLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
          Syncing projects and work items from the API...
        </div>
      ) : null}

      {projects.length === 0 && (
        <Card title="Getting Started" subtitle="No projects yet">
          <p className="text-sm text-slate-200">
            Projects seeded via Prisma will show here. Use the backend `/work/projects` endpoint to create your first R&D initiative.
          </p>
          <Button className="mt-4" variant="secondary">
            Create Project
          </Button>
        </Card>
      )}
    </div>
  );
};
