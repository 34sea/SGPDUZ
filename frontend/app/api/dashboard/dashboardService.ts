import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();

    const token = userData?.data?.token;

    if (!token) {
        throw new Error(
            'Token de autenticação não encontrado.'
        );
    }

    return {
        Authorization: `Bearer ${token}`
    };
};

export interface DashboardStatistics {
    tccs_em_andamento: number;
    pre_projectos: number;
    defesas_agendadas: number;
    tccs_defendidos: number;
    actas_lavradas: number;
    avaliacoes_submetidas: number;
}

export interface DashboardEstado {
    status: string;
    total: number;
}

export interface DashboardDefesa {
    id: number;

    estudante: {
        id: number;
        nome: string;
    };

    tcc: {
        titulo: string;
    };

    data: string;
    hora_inicio: string;
    hora_fim?: string | null;

    sala: string | null;
    local?: string | null;

    estado: string;
}

export interface DashboardEvolucao {
    mes: number;
    pre_projectos_submetidos: number;
    pre_projectos_aprovados: number;
    defesas_realizadas: number;
}

export interface DashboardData {
    statistics: DashboardStatistics;
    estado_tccs: DashboardEstado[];
    proximas_defesas: DashboardDefesa[];
    evolucao: DashboardEvolucao[];
}

export const getDashboard =
    async (): Promise<DashboardData> => {

        const dashboardPath ='/dashboard';

        const response = await api.get(
            dashboardPath,
            {
                headers: getAuthHeaders()
            }
        );

        return response.data.data;
    };