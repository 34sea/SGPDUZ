import api from '@/app/api/api'; 
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

// --- DEPARTAMENTOS ---
export const getDepartments = async () => {
    const res = await api.get('/departments', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createDepartment = async (data: { name: string; head_user_id?: number | null }) => {
    const res = await api.post('/departments', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateDepartment = async (id: number, data: { name?: string; head_user_id?: number | null }) => {
    const res = await api.put(`/departments/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteDepartment = async (id: number) => {
    const res = await api.delete(`/departments/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- CURSOS ---
export const getCourses = async () => {
    const res = await api.get('/courses', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createCourse = async (data: { name: string; code: string; department_id: number; head_user_id?: number | null }) => {
    const res = await api.post('/courses', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateCourse = async (id: number, data: { name?: string; code?: string; department_id?: number; head_user_id?: number | null }) => {
    const res = await api.put(`/courses/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteCourse = async (id: number) => {
    const res = await api.delete(`/courses/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- UTILIZADORES (Para Chefes de Departamento/Curso) ---
export const getUsersList = async () => {
    const res = await api.get('/users', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};