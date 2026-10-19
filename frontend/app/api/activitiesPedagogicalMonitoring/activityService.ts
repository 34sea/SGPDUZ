import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

// --- TAREFAS / ACTIVIDADES AD-HOC (adhoc_tasks) ---

export const getTasks = async (params?: { assigned_by?: number; assigned_to?: number; status?: string }) => {
    const res = await api.get('/adhocTask', { headers: getAuthHeaders(), params });
    return res.data.data || res.data;
};

export const getTaskById = async (id: number) => {
    const res = await api.get(`/adhocTask/${id}`, { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createTask = async (data: {
    title: string;
    description?: string;
    assigned_to: number;
    deadline: string;
}) => {
    const res = await api.post('/adhocTask', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateTask = async (id: number, data: any) => {
    const res = await api.put(`/adhocTask/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteTask = async (id: number) => {
    const res = await api.delete(`/adhocTask/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- SUBMISSÕES E COMPROVATIVOS (task_submissions) ---

export const submitTaskProof = async (formData: FormData) => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    const res = await api.post('/adhocTask/submissions', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const reviewSubmission = async (submissionId: number, data: { is_approved: boolean; feedback?: string }) => {
    const res = await api.put(`/adhocTask/submissions/${submissionId}/review`, data, { headers: getAuthHeaders() });
    return res.data;
};

// export const getTaskById = async (id: number) => {
//     const res = await api.get(`/adhoc-tasks/${id}`, { headers: getAuthHeaders() });
//     return res.data.data || res.data;
// };
export const getPedagogicalMonitoringData = async () => {
    const res = await api.get('/academic/pedagogical-monitoring', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};