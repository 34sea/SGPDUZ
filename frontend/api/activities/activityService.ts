// =====================================================
// SERVIÇO DE API - ACTIVIDADES AD-HOC
// =====================================================

import api from "@/app/api/api";
import pathUrls from "@/app/api/pathApi";
import { getUserFromStorage } from "@/app/api/auth/authService";

// =====================================================
// TIPOS
// =====================================================

export interface AdHocTask {
  id: number;
  title: string;
  description?: string | null;
  assigned_by: number;
  assigned_by_name?: string;
  assigned_to: number;
  assigned_to_name?: string;
  deadline: string;
  status: "PENDENTE" | "ENTREGUE" | "VERIFICADA" | "ATRASADA";
  created_at: string;
}

export interface CreateAdHocTaskData {
  title: string;
  description?: string;
  assigned_to: number;
  deadline: string;
}

export interface TaskSubmission {
  id: number;
  task_id: number;
  proof_file_url?: string | null;
  notes?: string | null;
  submitted_at: string;
  is_approved?: boolean | null;
  feedback?: string | null;
}

export interface CreateTaskSubmissionData {
  task_id: number;
  proof_file_url?: string;
  notes?: string;
}

// =====================================================
// TOKEN
// =====================================================

const getAuthHeaders = () => {
  const userData = getUserFromStorage();
  const token = userData?.token;

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// =====================================================
// AD-HOC TASKS
// =====================================================

export const getAdHocTasks = async (): Promise<AdHocTask[]> => {
  const response = await api.get(pathUrls["adhoc-tasks"], {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createAdHocTask = async (
  data: CreateAdHocTaskData
): Promise<AdHocTask> => {
  const response = await api.post(pathUrls["adhoc-tasks"], data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateAdHocTask = async (
  id: number,
  data: Partial<CreateAdHocTaskData>
): Promise<AdHocTask> => {
  const response = await api.put(`${pathUrls["adhoc-tasks"]}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteAdHocTask = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls["adhoc-tasks"]}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// =====================================================
// TASK SUBMISSIONS
// =====================================================

export const getTaskSubmissions = async (
  taskId: number
): Promise<TaskSubmission[]> => {
  const response = await api.get(
    `${pathUrls["task-submissions"]}?task_id=${taskId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data || response.data;
};

export const createTaskSubmission = async (
  data: CreateTaskSubmissionData
): Promise<TaskSubmission> => {
  const response = await api.post(pathUrls["task-submissions"], data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const verifyTaskSubmission = async (
  submissionId: number,
  is_approved: boolean,
  feedback?: string
): Promise<TaskSubmission> => {
  const response = await api.put(
    `${pathUrls["task-submissions"]}/${submissionId}/verify`,
    { is_approved, feedback },
    { headers: getAuthHeaders() }
  );
  return response.data.data || response.data;
};
