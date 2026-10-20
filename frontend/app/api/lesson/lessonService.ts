import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

// --- AULAS (Lessons & Weekly Map) ---
export const getLessons = async (params?: { class_subject_teacher_id?: number; status?: string; start_date?: string; end_date?: string }) => {
    const res = await api.get('/lessons', { headers: getAuthHeaders(), params });
    return res.data.data || res.data;
};

export const getLessonById = async (id: number) => {
    const res = await api.get(`/lessons/${id}`, { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createLesson = async (data: {
    class_subject_teacher_id: number;
    topic_unit_id?: number;
    lesson_date: string;
    content_taught?: string;
    is_cancelled?: boolean;
    cancellation_reason?: string;
}) => {
    const res = await api.post('/lessons', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateLesson = async (id: number, data: any) => {
    const res = await api.put(`/lessons/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteLesson = async (id: number) => {
    const res = await api.delete(`/lessons/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- CONFIRMAÇÃO / VALIDAÇÃO DE AULAS (Lesson Confirmations) ---
export const confirmLesson = async (data: {
    lesson_id: number;
    status_given: 'CONFIRMADA' | 'RESSALVA' | 'EM_DISPUTA';
    remarks?: string;
}) => {
    const res = await api.post('/lessons/confirmations', data, { headers: getAuthHeaders() });
    return res.data;
};

export const getConfirmationsByLesson = async (lesson_id: number) => {
    const res = await api.get(`/lessons/confirmations/${lesson_id}`, { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const getTeacherAssignments = async () => {
    const res = await api.get('/lessons/my-assignments', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};