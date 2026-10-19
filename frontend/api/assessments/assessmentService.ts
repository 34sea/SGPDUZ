// =====================================================
// SERVIÇO DE API - AVALIAÇÕES E PAUTAS FINAIS
// =====================================================

import api from "@/app/api/api";
import pathUrls from "@/app/api/pathApi";
import { getUserFromStorage } from "@/app/api/auth/authService";

// =====================================================
// TIPOS
// =====================================================

export interface Assessment {
  id: number;
  class_subject_teacher_id: number;
  title: string;
  assessment_date: string;
  results_published_date?: string | null;
  deadline_date: string;
  status:
    | "DENTRO_DO_PRAZO"
    | "FORA_DO_PRAZO"
    | "PENDENTE";
  created_at?: string;
}

export interface CreateAssessmentData {
  class_subject_teacher_id: number;
  title: string;
  assessment_date: string;
  results_published_date?: string;
  deadline_date: string;
}

export interface FinalGradeSheet {
  id: number;
  class_subject_teacher_id: number;
  epoch: "NORMAL" | "RECURSO" | "ESPECIAL";
  file_url: string;
  uploaded_by: number;
  uploaded_by_name?: string;
  uploaded_at: string;
}

export interface CreateFinalGradeSheetData {
  class_subject_teacher_id: number;
  epoch: "NORMAL" | "RECURSO" | "ESPECIAL";
  file_url: string;
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
// ASSESSMENTS
// =====================================================

export const getAssessments = async (): Promise<Assessment[]> => {
  const response = await api.get(pathUrls.assessments, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createAssessment = async (
  data: CreateAssessmentData
): Promise<Assessment> => {
  const response = await api.post(pathUrls.assessments, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateAssessment = async (
  id: number,
  data: Partial<CreateAssessmentData>
): Promise<Assessment> => {
  const response = await api.put(`${pathUrls.assessments}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteAssessment = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls.assessments}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// =====================================================
// FINAL GRADE SHEETS (PAUTAS)
// =====================================================

export const getFinalGradeSheets = async (): Promise<FinalGradeSheet[]> => {
  const response = await api.get(pathUrls["final-grade-sheets"], {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createFinalGradeSheet = async (
  data: CreateFinalGradeSheetData
): Promise<FinalGradeSheet> => {
  const response = await api.post(pathUrls["final-grade-sheets"], data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteFinalGradeSheet = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls["final-grade-sheets"]}/${id}`, {
    headers: getAuthHeaders(),
  });
};
