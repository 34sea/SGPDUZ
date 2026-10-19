import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

// --- UNIDADES CURRICULARES (Subjects) ---
export const getSubjects = async () => {
    const res = await api.get('/academic/subjects', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createSubject = async (data: any) => {
    const res = await api.post('/academic/subjects', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateSubject = async (id: number, data: any) => {
    const res = await api.put(`/academic/subjects/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteSubject = async (id: number) => {
    const res = await api.delete(`/academic/subjects/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- TURMAS (Classes) ---
export const getClasses = async () => {
    const res = await api.get('/academic/classes', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createClass = async (data: any) => {
    const res = await api.post('/academic/classes', data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteClass = async (id: number) => {
    const res = await api.delete(`/academic/classes/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- PLANOS ANALÍTICOS (Analytical Plans) ---
export const getAnalyticalPlans = async (params?: { subject_id?: number; academic_year_id?: number }) => {
    const res = await api.get('/analytical-plans', { headers: getAuthHeaders(), params });
    return res.data.data || res.data;
};

export const getAnalyticalPlanById = async (id: number) => {
    const res = await api.get(`/analytical-plans/${id}`, { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createAnalyticalPlan = async (data: { subject_id: number; academic_year_id: number }) => {
    const res = await api.post('/analytical-plans', data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAnalyticalPlan = async (id: number) => {
    const res = await api.delete(`/analytical-plans/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- UNIDADES TEMÁTICAS (Topic Units) ---
export const createTopicUnit = async (data: {
    analytical_plan_id: number;
    title: string;
    description?: string;
    planned_hours: number;
    lesson_type: 'TEORICA' | 'PRATICA' | 'LABORATORIAL' | 'VISITA_ESTUDO';
    sequence_order: number;
}) => {
    const res = await api.post('/topic-units', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateTopicUnit = async (id: number, data: any) => {
    const res = await api.put(`/topic-units/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteTopicUnit = async (id: number) => {
    const res = await api.delete(`/topic-units/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- DOSIFICAÇÃO SEMANAL (Weekly Dosifications) ---
export const createWeeklyDosification = async (data: {
    analytical_plan_id: number;
    topic_unit_id: number;
    week_number: number;
    is_evaluation_week?: boolean;
    is_confirmed_by_teacher?: boolean;
    custom_notes?: string;
}) => {
    const res = await api.post('/weekly-dosifications', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateWeeklyDosification = async (id: number, data: any) => {
    const res = await api.put(`/weekly-dosifications/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const confirmDosification = async (id: number) => {
    const res = await api.patch(`/weekly-dosifications/${id}/confirm`, {}, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteWeeklyDosification = async (id: number) => {
    const res = await api.delete(`/weekly-dosifications/${id}`, { headers: getAuthHeaders() });
    return res.data;
};