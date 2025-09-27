import { apiClient } from './client';
import type { Project, WorkItem, WorkItemComment } from '../types/api';

export const fetchProjects = async () => {
  const { data } = await apiClient.get<Project[]>('/work/projects');
  return data;
};

export const fetchWorkItems = async () => {
  const { data } = await apiClient.get<WorkItem[]>('/work/work-items');
  return data;
};

export const createWorkItem = async (payload: {
  projectId: string;
  title: string;
  description?: string;
  type: WorkItem['type'];
  priority: WorkItem['priority'];
  assigneeId: string;
  reporterId: string;
  status?: WorkItem['status'];
  dueDate?: string;
}) => {
  const { data } = await apiClient.post<WorkItem>('/work/work-items', payload);
  return data;
};

export const updateWorkItemStatus = async (workItemId: string, status: WorkItem['status']) => {
  const { data } = await apiClient.patch<WorkItem>(`/work/work-items/${workItemId}/status`, {
    status,
  });
  return data;
};

export const addWorkItemComment = async (workItemId: string, body: string) => {
  const { data } = await apiClient.post<WorkItemComment>(`/work/work-items/${workItemId}/comments`, {
    body,
  });
  return data;
};
