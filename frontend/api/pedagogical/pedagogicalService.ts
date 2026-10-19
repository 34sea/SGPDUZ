// =====================================================
// SERVIÇO DE API - GESTÃO PEDAGÓGICA (Plano Analítico, Unidades Temáticas, Dosificação, Aulas)
// =====================================================

import api from "@/app/api/api";
import pathUrls from "@/app/api/pathApi";
import { getUserFromStorage } from "@/app/api/auth/authService";

// =====================================================
// TIPOS
// =====================================================

export interface AnalyticalPlan {
  id: number;
  subject_id: number;
  subject?: string;
  academic_year_id: number;
  academic_year?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

export interface CreateAnalyticalPlanData {
  subject_id: number;
  academic_year_id: number;
}

export interface TopicUnit {
  id: number;
  analytical_plan_id: number;
  title: string;
  description?: string | null;
  planned_hours: number;
  lesson_type:
    | "TEORICA"
    | "PRATICA"
    | "LABORATORIAL"
    | "VISITA_ESTUDO";
  sequence_order: number;
  created_at?: string;
}

export interface CreateTopicUnitData {
  analytical_plan_id: number;
  title: string;
  description?: string;
  planned_hours: number;
  lesson_type:
    | "TEORICA"
    | "PRATICA"
    | "LABORATORIAL"
    | "VISITA_ESTUDO";
  sequence_order: number;
}

export interface Dosification {
  id: number;
  analytical_plan_id: number;
  topic_unit_id: number;
  topic_unit?: string;
  week_number: number;
  is_evaluation_week: boolean;
  is_confirmed_by_teacher: boolean;
  custom_notes?: string | null;
  created_at?: string;
}

export interface CreateDosificationData {
  analytical_plan_id: number;
  topic_unit_id: number;
  week_number: number;
  is_evaluation_week?: boolean;
  custom_notes?: string;
}

export interface Lesson {
  id: number;
  class_subject_teacher_id: number;
  topic_unit_id?: number | null;
  lesson_date: string;
  status:
    | "REGISTADA"
    | "CONFIRMADA"
    | "CONFIRMADA_COM_RESSALVA"
    | "EM_DISPUTA"
    | "RESOLVIDA"
    | "PENDENTE_PROLONGADA";
  is_cancelled: boolean;
  cancellation_reason?: string | null;
  content_taught?: string | null;
  created_at: string;
}

export interface CreateLessonData {
  class_subject_teacher_id: number;
  topic_unit_id?: number;
  lesson_date: string;
  content_taught?: string;
}

export interface LessonConfirmation {
  id: number;
  lesson_id: number;
  user_id: number;
  user_name?: string;
  status_given: "CONFIRMADA" | "RESSALVA" | "EM_DISPUTA";
  remarks?: string | null;
  created_at: string;
}

// =====================================================
// TOKEN
// =====================================================

const getAuthHeaders = () => {
  const userData = getUserFromStorage();
  const token = userData?.token;

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// =====================================================
// ANALYTICAL PLANS
// =====================================================

export const getAnalyticalPlans = async (): Promise<AnalyticalPlan[]> => {
  const response = await api.get(pathUrls["analytical-plans"], {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createAnalyticalPlan = async (
  data: CreateAnalyticalPlanData
): Promise<AnalyticalPlan> => {
  const response = await api.post(pathUrls["analytical-plans"], data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteAnalyticalPlan = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls["analytical-plans"]}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// =====================================================
// TOPIC UNITS
// =====================================================

export const getTopicUnits = async (
  planId: number
): Promise<TopicUnit[]> => {
  const response = await api.get(
    `${pathUrls["topic-units"]}?analytical_plan_id=${planId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data || response.data;
};

export const createTopicUnit = async (
  data: CreateTopicUnitData
): Promise<TopicUnit> => {
  const response = await api.post(pathUrls["topic-units"], data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateTopicUnit = async (
  id: number,
  data: Partial<CreateTopicUnitData>
): Promise<TopicUnit> => {
  const response = await api.put(`${pathUrls["topic-units"]}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteTopicUnit = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls["topic-units"]}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// =====================================================
// DOSIFICATIONS
// =====================================================

export const getDosifications = async (
  planId: number
): Promise<Dosification[]> => {
  const response = await api.get(
    `${pathUrls.dosifications}?analytical_plan_id=${planId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data || response.data;
};

export const createDosification = async (
  data: CreateDosificationData
): Promise<Dosification> => {
  const response = await api.post(pathUrls.dosifications, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateDosification = async (
  id: number,
  data: Partial<CreateDosificationData>
): Promise<Dosification> => {
  const response = await api.put(`${pathUrls.dosifications}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

// =====================================================
// LESSONS
// =====================================================

export const getLessons = async (): Promise<Lesson[]> => {
  const response = await api.get(pathUrls.lessons, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createLesson = async (
  data: CreateLessonData
): Promise<Lesson> => {
  const response = await api.post(pathUrls.lessons, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateLesson = async (
  id: number,
  data: Partial<CreateLessonData>
): Promise<Lesson> => {
  const response = await api.put(`${pathUrls.lessons}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

// =====================================================
// LESSON CONFIRMATIONS
// =====================================================

export const getLessonConfirmations = async (
  lessonId: number
): Promise<LessonConfirmation[]> => {
  const response = await api.get(
    `${pathUrls["lesson-confirmations"]}?lesson_id=${lessonId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data || response.data;
};

export const confirmLesson = async (
  lessonId: number,
  status: "CONFIRMADA" | "RESSALVA" | "EM_DISPUTA",
  remarks?: string
): Promise<LessonConfirmation> => {
  const response = await api.post(
    pathUrls["lesson-confirmations"],
    { lesson_id: lessonId, status_given: status, remarks },
    { headers: getAuthHeaders() }
  );
  return response.data.data || response.data;
};
