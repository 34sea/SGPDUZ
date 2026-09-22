import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';
import pathUrls from '../pathApi';


// =====================================================
// TYPES
// =====================================================

export interface JuryEvaluation {
    id: number;
    individual_score?: number | null;
    considerations?: string | null;
    publication_recommended?: boolean;
    submitted_at?: string | null;
    created_at?: string | null;
}

export interface DefenseStudent {
    id: number;
    name: string;
    email?: string;
}

export interface DefenseTcc {
    title: string;
    document_url?: string | null;
}

export interface DefenseSchedule {
    date: string;
    start_time: string;
    end_time: string;
}

export interface DefenseRoom {
    name: string;
    location?: string | null;
}

export interface MyAssignedDefense {

    jury_member_id: number;

    defense_schedule_id: number;

    role_in_jury: string;

    student: {
        id: number;
        name: string;
        email: string;
    };

    tcc: {
        notebook_id: number;
        title: string;
    };

    schedule: {
        date: string;
        start_time: string;
        end_time: string;
        status: string;
    };

    room: {
        id: number;
        name: string;
        location?: string | null;
        capacity?: number;
    };

    document: {
        uploaded: boolean;
        url?: string | null;
    };

    evaluation?: {
        id: number;
        individual_score?: number | null;
        considerations?: string | null;
        publication_recommended?: boolean;
        created_at?: string | null;
    } | null;
}

// =====================================================
// AUTH HEADERS
// =====================================================

const getAuthHeaders = () => {

    const userData = getUserFromStorage();

    const token =
        userData?.data?.token;

    if (!token) {
        throw new Error(
            'Token de autenticação não encontrado.'
        );
    }

    return {
        Authorization: `Bearer ${token}`
    };
};

// =====================================================
// PATH
// =====================================================

const evaluationPath = '/evaluations';

// =====================================================
// MINHAS DEFESAS / TCCs ATRIBUÍDOS
// =====================================================

export const getMyAssignedDefenses = async (): Promise<MyAssignedDefense[]> => {

    const response = await api.get(
        '/defenses/my-jury-defenses',
        {
            headers: getAuthHeaders()
        }
    );

    return response.data?.data || [];
};

// =====================================================
// OBTER FICHA DE AVALIAÇÃO
// =====================================================

export interface EvaluationCriterion {
    id?: number;
    criterion_name: string;
    score: number;
}

export interface EvaluationSheet {
    id: number;
    jury_member_id: number;
    defense_schedule_id: number;

    individual_score?: number | null;

    considerations?: string | null;

    publication_recommended?: boolean;

    role_in_jury: string;

    user_id: number;

    member_name: string;

    criteria?: EvaluationCriterion[];
}

// =====================================================
// GET EVALUATION BY JURY MEMBER
// =====================================================

export const getEvaluationSheetByJuryMember =
    async (
        juryMemberId: number
    ): Promise<EvaluationSheet> => {

        const response = await api.get(
            `${evaluationPath}/sheets/member/${juryMemberId}`,
            {
                headers: getAuthHeaders()
            }
        );

        return response.data.data;
    };

// =====================================================
// SUBMIT EVALUATION
// =====================================================

export interface SubmitEvaluationData {

    jury_member_id: number;

    individual_score?: number | null;

    considerations?: string | null;

    publication_recommended?: boolean;

    criteria?: EvaluationCriterion[];
}

export const submitEvaluationSheet =
    async (
        data: SubmitEvaluationData
    ) => {

        const response = await api.post(
            `${evaluationPath}/sheets`,
            data,
            {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type':
                        'application/json'
                }
            }
        );

        return response.data;
    };