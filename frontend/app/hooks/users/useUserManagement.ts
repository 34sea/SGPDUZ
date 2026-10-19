// // import { User, UserFilters } from '@/app/api/users/userService';
// import { useCallback, useEffect, useState } from 'react';

// import {
//     User,
//     Role,
//     CreateUserData,
//     UpdateUserData,
//     UserFilters,
//     getUsers,
//     getRoles,
//     createUser,
//     updateUser,
//     deleteUser
// } from '@/app/api/users/userService';

// export const useUserManagement = () => {

//     const [users, setUsers] = useState<User[]>([]);
//     const [roles, setRoles] = useState<Role[]>([]);

//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);

//     const [error, setError] = useState<string | null>(null);

//     // =====================================================
//     // LOAD USERS
//     // =====================================================

//     const loadUsers = useCallback(
//         async (filters?: UserFilters) => {

//             setLoading(true);
//             setError(null);

//             try {

//                 const result = await getUsers(filters);

//                 setUsers(result);

//             } catch (err: any) {

//                 console.error(
//                     'Erro ao carregar utilizadores:',
//                     err
//                 );

//                 setError(
//                     err.response?.data?.message ||
//                     'Erro ao carregar utilizadores.'
//                 );

//             } finally {

//                 setLoading(false);
//             }
//         },
//         []
//     );

//     // =====================================================
//     // LOAD ROLES
//     // =====================================================

//     const loadRoles = useCallback(
//         async () => {

//             try {

//                 const result = await getRoles();

//                 setRoles(result);

//             } catch (err: any) {

//                 console.error(
//                     'Erro ao carregar perfis:',
//                     err
//                 );

//             }
//         },
//         []
//     );

//     // =====================================================
//     // CREATE
//     // =====================================================

//     const addUser = async (
//         data: CreateUserData
//     ) => {

//         setSaving(true);
//         setError(null);

//         try {

//             const result = await createUser(data);

//             await loadUsers();

//             return result;

//         } catch (err: any) {

//             console.error(
//                 'Erro ao criar utilizador:',
//                 err
//             );

//             const message =
//                 err.response?.data?.message ||
//                 'Erro ao criar utilizador.';

//             setError(message);

//             throw err;

//         } finally {

//             setSaving(false);
//         }
//     };

//     // =====================================================
//     // UPDATE
//     // =====================================================

//     const editUser = async (
//         id: number,
//         data: UpdateUserData
//     ) => {

//         setSaving(true);
//         setError(null);

//         try {

//             const result = await updateUser(
//                 id,
//                 data
//             );

//             await loadUsers();

//             return result;

//         } catch (err: any) {

//             console.error(
//                 'Erro ao actualizar utilizador:',
//                 err
//             );

//             const message =
//                 err.response?.data?.message ||
//                 'Erro ao actualizar utilizador.';

//             setError(message);

//             throw err;

//         } finally {

//             setSaving(false);
//         }
//     };

//     // =====================================================
//     // DELETE
//     // =====================================================

//     const removeUser = async (
//         id: number
//     ) => {

//         setSaving(true);
//         setError(null);

//         try {

//             const result = await deleteUser(id);

//             await loadUsers();

//             return result;

//         } catch (err: any) {

//             console.error(
//                 'Erro ao eliminar utilizador:',
//                 err
//             );

//             const message =
//                 err.response?.data?.message ||
//                 'Erro ao eliminar utilizador.';

//             setError(message);

//             throw err;

//         } finally {

//             setSaving(false);
//         }
//     };

//     // =====================================================
//     // INITIAL LOAD
//     // =====================================================

//     useEffect(() => {

//         loadUsers();
//         loadRoles();

//     }, [loadUsers, loadRoles]);

//     return {
//         users,
//         roles,

//         loading,
//         saving,
//         error,

//         loadUsers,
//         loadRoles,

//         addUser,
//         editUser,
//         removeUser
//     };
// };import { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//     User,
//     Role,
//     CreateUserData,
//     UpdateUserData,
//     UserFilters,
//     getUsers,
//     getRoles,
//     createUser,
//     updateUser,
//     deleteUser
// } from '@/app/api/users/userService';

// export interface UserFormatted {
//     id: number;
//     nome: string;
//     email: string;
//     contacto: string;
//     perfil: string;
//     role_id: number | null;
//     departamento: string;
//     curso: string;
//     estado: "Activo" | "Inactivo";
//     iniciais: string;
// }

// export const useUserManagement = () => {
//     const [rawUsers, setRawUsers] = useState<User[]>([]);
//     const [roles, setRoles] = useState<Role[]>([]);
//     const [permissions, setPermissions] = useState<any[]>([]); // Mock ou vindo da API de permissões

//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     // Estados de Filtros e Pesquisa para a UI
//     const [search, setSearch] = useState("");
//     const [profileFilter, setProfileFilter] = useState<string | null>(null);
//     const [statusFilter, setStatusFilter] = useState<string | null>(null);

//     const loadUsers = useCallback(async (filters?: UserFilters) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const result = await getUsers(filters);
//             setRawUsers(result);
//         } catch (err: any) {
//             console.error('Erro ao carregar utilizadores:', err);
//             setError(err.response?.data?.message || 'Erro ao carregar utilizadores.');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     const loadRoles = useCallback(async () => {
//         try {
//             const result = await getRoles();
//             setRoles(result);
//         } catch (err: any) {
//             console.error('Erro ao carregar perfis:', err);
//         }
//     }, []);

//     useEffect(() => {
//         loadUsers();
//         loadRoles();
//     }, [loadUsers, loadRoles]);

//     // Formatação dos utilizadores para o layout visual da tela
//     const allUsers: UserFormatted[] = useMemo(() => {
//         return rawUsers.map((u: any) => {
//             const name = u.name || u.nome || "";
//             const nomeParts = name.trim().split(" ");
//             const iniciais =
//                 nomeParts.length > 1
//                     ? `${nomeParts[0][0]}${nomeParts[nomeParts.length - 1][0]}`.toUpperCase()
//                     : (name || "U").substring(0, 2).toUpperCase();

//             const roleObj = roles.find(r => r.id === u.role_id);

//             return {
//                 id: u.id,
//                 nome: name,
//                 email: u.email,
//                 contacto: u.contacto || "+258 84 000 0000",
//                 perfil: u.role_name || roleObj?.name || "Sem Perfil",
//                 role_id: u.role_id || null,
//                 departamento: u.departamento || "Engenharia Informática",
//                 curso: u.curso || "Engenharia Informática",
//                 estado: u.estado || "Activo",
//                 iniciais,
//             };
//         });
//     }, [rawUsers, roles]);

//     // Aplicação dos Filtros na Tabela
//     const users = useMemo(() => {
//         return allUsers.filter((user) => {
//             const matchesSearch =
//                 !search ||
//                 user.nome.toLowerCase().includes(search.toLowerCase()) ||
//                 user.email.toLowerCase().includes(search.toLowerCase()) ||
//                 user.contacto.toLowerCase().includes(search.toLowerCase());

//             const matchesProfile = !profileFilter || user.perfil === profileFilter;
//             const matchesStatus = !statusFilter || user.estado === statusFilter;

//             return matchesSearch && matchesProfile && matchesStatus;
//         });
//     }, [allUsers, search, profileFilter, statusFilter]);

//     const addUser = async (data: CreateUserData) => {
//         setSaving(true);
//         setError(null);
//         try {
//             const result = await createUser(data);
//             await loadUsers();
//             return result;
//         } catch (err: any) {
//             const message = err.response?.data?.message || 'Erro ao criar utilizador.';
//             setError(message);
//             throw err;
//         } finally {
//             setSaving(false);
//         }
//     };

//     const editUser = async (id: number, data: UpdateUserData) => {
//         setSaving(true);
//         setError(null);
//         try {
//             const result = await updateUser(id, data);
//             await loadUsers();
//             return result;
//         } catch (err: any) {
//             const message = err.response?.data?.message || 'Erro ao actualizar utilizador.';
//             setError(message);
//             throw err;
//         } finally {
//             setSaving(false);
//         }
//     };

//     const removeUser = async (id: number) => {
//         setSaving(true);
//         setError(null);
//         try {
//             const result = await deleteUser(id);
//             await loadUsers();
//             return result;
//         } catch (err: any) {
//             const message = err.response?.data?.message || 'Erro ao eliminar utilizador.';
//             setError(message);
//             throw err;
//         } finally {
//             setSaving(false);
//         }
//     };

//     const toggleUserStatus = (id: number) => {
//         setRawUsers((current) =>
//             current.map((item: any) =>
//                 item.id === id
//                     ? { ...item, estado: item.estado === "Inactivo" ? "Activo" : "Inactivo" }
//                     : item
//             )
//         );
//     };

//     return {
//         users,
//         allUsers,
//         roles,
//         permissions,
//         loading,
//         saving,
//         error,
//         search,
//         setSearch,
//         profileFilter,
//         setProfileFilter,
//         statusFilter,
//         setStatusFilter,
//         loadUsers,
//         loadRoles,
//         saveUser: async (data: any, password?: string) => {
//             if (data.id) {
//                 return await editUser(data.id, { name: data.nome, email: data.email, role_id: data.role_id, ...(password ? { password } : {}) });
//             } else {
//                 return await addUser({ name: data.nome, email: data.email, role_id: data.role_id, password: password || "123456" });
//             }
//         },
//         deleteUser: removeUser,
//         toggleUserStatus,
//     };
// };