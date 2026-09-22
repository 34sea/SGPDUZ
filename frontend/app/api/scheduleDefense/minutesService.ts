import api from '@/app/api/api';
import { getUserFromStorage } from '../auth/authService';

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token;

    if (!token) {
        throw new Error('Token de autenticação não encontrado.');
    }

    return {
        Authorization: `Bearer ${token}`
    };
};

export interface DefenseMinute {
    id: number;
    final_score: number | null;
    decision: string;
    deliberation_notes?: string | null;
    institutional_header?: string | null;
    pdf_url?: string | null;
    docx_url?: string | null;
}

export interface PresidentDefense {
    defense_schedule_id: number;
    jury_member_id: number;

    student: {
        id: number;
        name: string;
        email?: string | null;
    };

    tcc: {
        notebook_id?: number | null;
        title: string;
    };

    schedule: {
        date?: string | null;
        start_time?: string | null;
        end_time?: string | null;
        status?: string | null;
    };

    room?: {
        id?: number | null;
        name?: string | null;
        location?: string | null;
    } | null;

    document?: {
        uploaded: boolean;
        url?: string | null;
    };

    evaluations: {
        count: number;
        average: number | null;
    };

    minutes: DefenseMinute | null;
}

const evaluationPath = '/evaluations';

export const getPresidentDefenses = async (): Promise<
    PresidentDefense[]
> => {
    const response = await api.get(
        `/defenses/president/defenses`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


export interface DefenseEvaluation {
    id: number;
    jury_member_id: number;
    user_id: number;
    role_in_jury: string;
    member_name: string;
    member_email?: string | null;

    individual_score: number | null;
    considerations?: string | null;
    publication_recommended?: boolean;
}

export interface DefenseMinute {
    id: number;
    defense_schedule_id: number;
    institutional_header?: string | null;
    final_score: number | null;
    decision: string;
    deliberation_notes?: string | null;
    president_id: number;
    pdf_url?: string | null;
    docx_url?: string | null;

    tcc_title?: string;
    defense_date?: string;
    student_name?: string;
    president_name?: string;
}

export const getEvaluationSheetsBySchedule = async (
    scheduleId: number
): Promise<DefenseEvaluation[]> => {
    const response = await api.get(
        `${evaluationPath}/sheets/schedule/${scheduleId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};

export const getDefenseMinutesBySchedule = async (
    scheduleId: number
): Promise<DefenseMinute> => {
    const response = await api.get(
        `${evaluationPath}/minutes/schedule/${scheduleId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};

export const createDefenseMinutes = async (data: {
    defense_schedule_id: number;
    institutional_header?: string | null;
    final_score: number;
    decision: string;
    deliberation_notes?: string | null;
    pdf_url?: string | null;
    docx_url?: string | null;
}) => {
    const response = await api.post(
        `${evaluationPath}/minutes`,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};