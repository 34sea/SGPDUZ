import api from '../api';
import pathUrls from '../pathApi';
import { getUserFromStorage } from '../auth/authService';

export interface User {
    id: number;
    name?: string;
    nome?: string;
    email: string;
    contacto?: string;
    role_id?: number | null;
    role_name?: string;
    departamento?: string;
    curso?: string;
    estado?: "Activo" | "Inactivo";
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    color?: string;
}

export interface Permission {
    id: number;
    name: string;
    description?: string;
}

const getAuthHeaders = () => {
    const userData = getUserFromStorage();
    const token = userData?.data?.token || userData?.token;
    if (!token) throw new Error('Token de autenticação não encontrado.');
    return { Authorization: `Bearer ${token}` };
};

/* =========================================================
   USERS CRUD
========================================================= */

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get(pathUrls.users || '/users', { headers: getAuthHeaders() });
    return response.data.data || response.data;
};

export const createUser = async (data: any) => {
    const response = await api.post(pathUrls.users || '/users', data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
};

export const updateUser = async (id: number, data: any) => {
    const response = await api.put(`${pathUrls.users || '/users'}/${id}`, data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
};

export const deleteUser = async (id: number) => {
    const response = await api.delete(`${pathUrls.users || '/users'}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/* =========================================================
   ROLES CRUD
========================================================= */

export const getRoles = async (): Promise<Role[]> => {
    const response = await api.get(pathUrls.roles || '/roles', { headers: getAuthHeaders() });
    return response.data.data || response.data;
};

export const createRole = async (data: { name: string; description?: string }) => {
    const response = await api.post(pathUrls.roles || '/roles', data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
};

export const updateRole = async (id: number, data: { name?: string; description?: string }) => {
    const response = await api.put(`${pathUrls.roles || '/roles'}/${id}`, data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
};

export const deleteRole = async (id: number) => {
    const response = await api.delete(`${pathUrls.roles || '/roles'}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Atribuir uma única permissão ao role
export const assignPermissionToRole = async (roleId: number, permission_id: number) => {
    const response = await api.post(`${pathUrls.roles || '/roles'}/${roleId}/permissions`, { permission_id }, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
};

// Sincronizar (guardar em lote) a lista completa de permissões de um role
export const syncRolePermissions = async (roleId: number, permission_ids: number[]) => {
    const response = await api.put(`${pathUrls.roles || '/roles'}/${roleId}/permissions`, { permission_ids }, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
};

// Remover uma permissão do role
export const removePermissionFromRole = async (roleId: number, permissionId: number) => {
    const response = await api.delete(`${pathUrls.roles || '/roles'}/${roleId}/permissions/${permissionId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};
/* =========================================================
   PERMISSIONS CRUD
========================================================= */

export const getPermissions = async (): Promise<Permission[]> => {
    const response = await api.get(pathUrls.permissions || '/permissions', {
        headers: getAuthHeaders()
    });
    return response.data.data || response.data;
};

export const createPermission = async (data: { name: string }) => {
    const response = await api.post(pathUrls.permissions || '/permissions', data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
};

export const deletePermission = async (id: number) => {
    const response = await api.delete(`${pathUrls.permissions || '/permissions'}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const updatePermission = async (id: number, data: { name: string }) => {
    const response = await api.put(`${pathUrls.permissions || '/permissions'}/${id}`, data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
};