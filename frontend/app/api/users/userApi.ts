// src/api/userApi.ts

const API_BASE_URL =  "http://localhost:5000/api";

// Função auxiliar para cabeçalhos de autenticação
const getHeaders = () => {
    
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export interface UserDTO {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role_id: number | null;
  contacto?: string;
  departamento?: string;
  curso?: string;
}

export interface RoleDTO {
  id: number;
  name: string;
  permissions?: { id: number; name: string }[];
}

export interface PermissionDTO {
  id: number;
  name: string;
}

export const userApi = {
  // Utilizadores
  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
    return res.json();
  },

  async getUserById(id: number) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async createUser(data: UserDTO) {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateUser(id: number, data: Partial<UserDTO>) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteUser(id: number) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Roles / Perfis
  async getRoles() {
    const res = await fetch(`${API_BASE_URL}/roles`, { headers: getHeaders() });
    return res.json();
  },

  async syncRolePermissions(roleId: number, permissionIds: number[]) {
    const res = await fetch(`${API_BASE_URL}/roles/${roleId}/permissions/sync`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ permission_ids: permissionIds }),
    });
    return res.json();
  },

  // Permissões
  async getPermissions() {
    const res = await fetch(`${API_BASE_URL}/permissions`, { headers: getHeaders() });
    return res.json();
  },
};