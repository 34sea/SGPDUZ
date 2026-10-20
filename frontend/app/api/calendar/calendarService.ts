import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

// --- ANOS LECTIVOS ---
export const getAcademicYears = async () => {
    const res = await api.get('/academic/academic-years', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createAcademicYear = async (data: {
    year: number;
    semester: '1' | '2';
    start_date: string;
    end_date: string;
    is_active?: boolean;
}) => {
    const res = await api.post('/academic/academic-years', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateAcademicYear = async (id: number, data: any) => {
    const res = await api.put(`/academic/academic-years/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAcademicYear = async (id: number) => {
    const res = await api.delete(`/academic/academic-years/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- FERIADOS E EXCEÇÕES DE CALENDÁRIO ---
export const getHolidays = async () => {
    const res = await api.get('/academic/holidays', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createHoliday = async (data: {
    date: string;
    description: string;
}) => {
    const res = await api.post('/academic/holidays', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateHoliday = async (id: number, data: any) => {
    const res = await api.put(`/academic/holidays/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteHoliday = async (id: number) => {
    const res = await api.delete(`/academic/holidays/${id}`, { headers: getAuthHeaders() });
    return res.data;
};