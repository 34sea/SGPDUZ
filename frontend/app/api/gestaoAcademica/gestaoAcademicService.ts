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
    const res = await api.get('/academic/departments', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

// --- CURSOS ---
export const getCourses = async () => {
    const res = await api.get('/academic/courses', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createCourse = async (data: { name: string; code: string; department_id: number; head_user_id?: number }) => {
    const res = await api.post('/academic/courses', data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteCourse = async (id: number) => {
    const res = await api.delete(`/academic/courses/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- ANOS LECTIVOS ---
export const getAcademicYears = async () => {
    const res = await api.get('/academic/academic-years', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

// --- DISCIPLINAS (SUBJECTS) ---
export const getSubjects = async () => {
    const res = await api.get('/academic/subjects', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createSubject = async (data: { code: string; name: string; course_id: number }) => {
    const res = await api.post('/academic/subjects', data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteSubject = async (id: number) => {
    const res = await api.delete(`/academic/subjects/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- TURMAS (CLASSES) ---
export const getClasses = async () => {
    const res = await api.get('/academic/classes', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const createClass = async (data: { name: string; course_id: number; academic_year_id: number }) => {
    const res = await api.post('/academic/classes', data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteClass = async (id: number) => {
    const res = await api.delete(`/academic/classes/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- ATRIBUIÇÃO DOCENTE (Class Subject Teachers) ---
export const getClassSubjectTeachers = async () => {
    const res = await api.get('/academic/class-subject-teachers', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};

export const assignTeacherToClassSubject = async (data: { class_id: number; subject_id: number; teacher_id: number }) => {
    const res = await api.post('/academic/class-subject-teachers', data, { headers: getAuthHeaders() });
    return res.data;
};

export const removeTeacherFromClassSubject = async (id: number) => {
    const res = await api.delete(`/academic/class-subject-teachers/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

// --- UTILIZADORES / DOCENTES ---
export const getUsers = async () => {
    const res = await api.get('/users', { headers: getAuthHeaders() });
    return res.data.data || res.data;
};