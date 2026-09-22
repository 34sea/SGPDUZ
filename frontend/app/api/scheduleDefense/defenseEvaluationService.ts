import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token;

    if (!token) {
        throw new Error('Token de autenticação não encontrado.');
    }

    return {
        Authorization: `Bearer ${token}`,
    };
};

// =====================================================
// TYPES
// =====================================================

export interface JuryStudent {
    id: number;
    name: string;
    email: string;
}

export interface JuryTcc {
    notebook_id: number;
    title: string;
}

export interface JurySchedule {
    date: string;
    start_time: string;
    end_time: string;
    status: string;
}

export interface JuryRoom {
    id: number;
    name: string;
    location?: string | null;
    capacity?: number;
}

export interface JuryDocument {
    uploaded: boolean;
    url?: string | null;
}

export interface JuryEvaluation {
    id: number;
    individual_score?: number | null;
    considerations?: string | null;
    publication_recommended?: boolean;
    created_at?: string | null;
}

export interface MyJuryDefense {
    jury_member_id: number;
    defense_schedule_id: number;

    role_in_jury: string;

    student: JuryStudent;

    tcc: JuryTcc;

    schedule: JurySchedule;

    room: JuryRoom;

    document: JuryDocument;

    evaluation?: JuryEvaluation | null;
}

// =====================================================
// MINHAS DEFESAS COMO MEMBRO DO JÚRI
// =====================================================

export const getMyJuryDefenses = async (): Promise<MyJuryDefense[]> => {
    const response = await api.get(
        '/defenses/my-jury-defenses',
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data?.data || [];
};

// =====================================================
// OBTER FICHA DE AVALIAÇÃO
// =====================================================

export const getEvaluationSheetByJuryMember = async (
    juryMemberId: number
) => {
    const response = await api.get(
        `/evaluations/sheets/member/${juryMemberId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data?.data;
};

// =====================================================
// SUBMETER AVALIAÇÃO
// =====================================================

export interface EvaluationCriterion {
    criterion_name: string;
    score: number;
}

export interface SubmitEvaluationData {
    jury_member_id: number;
    individual_score: number;
    considerations?: string;
    publication_recommended: boolean;
    criteria: EvaluationCriterion[];
}

export const submitEvaluationSheet = async (
    data: SubmitEvaluationData
) => {
    const response = await api.post(
        '/evaluations/sheets',
        data,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};