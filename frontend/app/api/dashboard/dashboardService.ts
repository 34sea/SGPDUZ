import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

// --- DASHBOARD E RELATÓRIOS PEDAGÓGICOS ---
export const getDashboardMetrics = async (params?: { period?: string; teacherId?: number; comparisonPeriod?: string }) => {
    const res = await api.get('/dashboard/metrics', { headers: getAuthHeaders(), params });
    return res.data.data || res.data;
};