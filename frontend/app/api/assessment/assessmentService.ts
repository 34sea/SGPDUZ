import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

// --- AVALIAÇÕES (Assessments) ---
export const getAssessments = async (params?: { class_subject_teacher_id?: number; status?: string }) => {
    const res = await api.get('/assessments', { headers: getAuthHeaders(), params });
    return res.data.data || res.data;
};

export const getAssessmentById = async (id: number) => {
    const res = await api.get(`/assessments/${id}`, { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createAssessment = async (data: {
    class_subject_teacher_id: number;
    title: string;
    assessment_date: string;
    deadline_date: string;
    results_published_date?: string;
}) => {
    const res = await api.post('/assessments', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateAssessment = async (id: number, data: any) => {
    const res = await api.put(`/assessments/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAssessment = async (id: number) => {
    const res = await api.delete(`/assessments/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- PAUTAS FINAIS (Final Grade Sheets) ---
export const getFinalGradeSheets = async (params?: { class_subject_teacher_id?: number; epoch?: string }) => {
    const res = await api.get('/assessments/grade-sheets/all', { headers: getAuthHeaders(), params });
    return res.data.data || res.data;
};

export const createFinalGradeSheet = async (formData: FormData) => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    const res = await api.post('/assessments/grade-sheets/all', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const deleteFinalGradeSheet = async (id: number) => {
    const res = await api.delete(`/assessments/grade-sheets/${id}`, { headers: getAuthHeaders() });
    return res.data;
};
// --- ATRIBUIÇÕES DOCENTES (Class Subject Teachers) ---
export const getClassSubjectTeachers = async () => {
    const res = await api.get('/academic/class-subject-teachers', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};