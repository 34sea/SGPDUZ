import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

// --- RELATÓRIOS E INDICADORES ---

export const getIndicators = async (params: { period?: string; teacher_id?: number; course_id?: number; department_id?: number } = {}) => {
    const res = await api.get('/reports/indicators', { 
        headers: getAuthHeaders(),
        params 
    });
    return res.data.data || res.data;
};

export const getTeacherCompliance = async (period?: string) => {
    const res = await api.get('/reports/teacher-compliance', { 
        headers: getAuthHeaders(),
        params: { period } 
    });
    return res.data.data || res.data;
};

export const getSubjectCompliance = async (period?: string) => {
    const res = await api.get('/reports/subject-compliance', { 
        headers: getAuthHeaders(),
        params: { period } 
    });
    return res.data.data || res.data;
};

export const compareSemesters = async (period1: string, period2: string) => {
    const res = await api.get('/reports/compare-semesters', { 
        headers: getAuthHeaders(),
        params: { period1, period2 } 
    });
    return res.data.data || res.data;
};

export const generateReport = async (data: { report_type: string; period: string; teacher_id?: number; subject_id?: number }) => {
    const res = await api.post('/reports/generate-report', data, { headers: getAuthHeaders() });
    return res.data.data || res.data;
};