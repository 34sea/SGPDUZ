// =====================================================
// SERVIÇO DE API - ESTRUTURA ACADÉMICA (Departamentos, Cursos, Ano Lectivo, Unidades Curriculares, Turmas)
// =====================================================

import api from "@/app/api/api";
import pathUrls from "@/app/api/pathApi";
import { getUserFromStorage } from "@/app/api/auth/authService";

// =====================================================
// TIPOS
// =====================================================

export interface Department {
  id: number;
  name: string;
  code: string;
  head_user_id?: number | null;
  head_name?: string | null;
  status: "Activo" | "Inactivo";
  created_at?: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  head_user_id?: number;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  head_user_id?: number | null;
  status?: "Activo" | "Inactivo";
}

export interface Course {
  id: number;
  name: string;
  code: string;
  department_id: number;
  department?: string;
  head_user_id?: number | null;
  head_name?: string | null;
  status: "Activo" | "Inactivo";
  created_at?: string;
}

export interface CreateCourseData {
  name: string;
  code: string;
  department_id: number;
  head_user_id?: number;
}

export interface UpdateCourseData {
  name?: string;
  code?: string;
  department_id?: number;
  head_user_id?: number | null;
  status?: "Activo" | "Inactivo";
}

export interface AcademicYear {
  id: number;
  year: number;
  semester: "1" | "2";
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateAcademicYearData {
  year: number;
  semester: "1" | "2";
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  course_id: number;
  course?: string;
  created_at?: string;
}

export interface CreateSubjectData {
  code: string;
  name: string;
  course_id: number;
}

export interface ClassItem {
  id: number;
  name: string;
  course_id: number;
  course?: string;
  academic_year_id: number;
  academic_year?: string;
  class_chief_id?: number | null;
  class_chief_name?: string | null;
  sub_chief_id?: number | null;
  sub_chief_name?: string | null;
  created_at?: string;
}

export interface CreateClassData {
  name: string;
  course_id: number;
  academic_year_id: number;
  class_chief_id?: number;
  sub_chief_id?: number;
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
// DEPARTMENTS
// =====================================================

export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get(pathUrls.departments, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createDepartment = async (
  data: CreateDepartmentData
): Promise<Department> => {
  const response = await api.post(pathUrls.departments, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateDepartment = async (
  id: number,
  data: UpdateDepartmentData
): Promise<Department> => {
  const response = await api.put(`${pathUrls.departments}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls.departments}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// =====================================================
// COURSES
// =====================================================

export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get(pathUrls.courses, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createCourse = async (
  data: CreateCourseData
): Promise<Course> => {
  const response = await api.post(pathUrls.courses, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateCourse = async (
  id: number,
  data: UpdateCourseData
): Promise<Course> => {
  const response = await api.put(`${pathUrls.courses}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls.courses}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// =====================================================
// ACADEMIC YEARS
// =====================================================

export const getAcademicYears = async (): Promise<AcademicYear[]> => {
  const response = await api.get(pathUrls["academic-years"], {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createAcademicYear = async (
  data: CreateAcademicYearData
): Promise<AcademicYear> => {
  const response = await api.post(pathUrls["academic-years"], data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateAcademicYear = async (
  id: number,
  data: Partial<CreateAcademicYearData>
): Promise<AcademicYear> => {
  const response = await api.put(
    `${pathUrls["academic-years"]}/${id}`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data || response.data;
};

export const deleteAcademicYear = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls["academic-years"]}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// =====================================================
// SUBJECTS (UNIDADES CURRICULARES)
// =====================================================

export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get(pathUrls.subjects, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createSubject = async (
  data: CreateSubjectData
): Promise<Subject> => {
  const response = await api.post(pathUrls.subjects, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateSubject = async (
  id: number,
  data: Partial<CreateSubjectData>
): Promise<Subject> => {
  const response = await api.put(`${pathUrls.subjects}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteSubject = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls.subjects}/${id}`, {
    headers: getAuthHeaders(),
  });
};

// =====================================================
// CLASSES (TURMAS)
// =====================================================

export const getClasses = async (): Promise<ClassItem[]> => {
  const response = await api.get(pathUrls.classes, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const createClass = async (
  data: CreateClassData
): Promise<ClassItem> => {
  const response = await api.post(pathUrls.classes, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const updateClass = async (
  id: number,
  data: Partial<CreateClassData>
): Promise<ClassItem> => {
  const response = await api.put(`${pathUrls.classes}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data || response.data;
};

export const deleteClass = async (id: number): Promise<void> => {
  await api.delete(`${pathUrls.classes}/${id}`, {
    headers: getAuthHeaders(),
  });
};
