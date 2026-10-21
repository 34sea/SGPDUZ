"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { TabView, TabPanel } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressBar } from "primereact/progressbar";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputTextarea } from "primereact/inputtextarea";

import {
    Users,
    UserPlus,
    ShieldCheck,
    KeyRound,
    UserCheck,
    UserX,
    Search,
    Edit3,
    Trash2,
    Lock,
    Unlock,
    CheckCircle2,
    XCircle,
    GraduationCap,
    BookOpen,
    ClipboardCheck,
    CalendarCheck,
    Activity,
    Settings2,
    BarChart3,
    Shield,
} from "lucide-react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { 
    getUsers, 
    getRoles, 
    getPermissions, 
    createUser, 
    updateUser, 
    deleteUser, 
    createRole, 
    updateRole, 
    deleteRole, 
    syncRolePermissions,
    User, 
    Role, 
    Permission 
} from "@/app/api/users/userService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COLORS = {
    primary: "#1D4ED8",
    primaryLight: "#EFF6FF",
    green: "#16A34A",
    greenLight: "#DCFCE7",
    orange: "#D97706",
    orangeLight: "#FEF3C7",
    purple: "#7C3AED",
    purpleLight: "#F3E8FF",
    red: "#DC2626",
    dark: "#0F172A",
    muted: "#64748B",
    light: "#94A3B8",
    border: "#E2E8F0",
    background: "#F8FAFC",
    white: "#FFFFFF",
};

const getPermissionIcon = (name: string) => {
    const upper = name.toUpperCase();
    if (upper.includes("PLANO")) return <BookOpen size={18} />;
    if (upper.includes("AULA")) return <GraduationCap size={18} />;
    if (upper.includes("AVALIAC")) return <ClipboardCheck size={18} />;
    if (upper.includes("ACTIV")) return <Activity size={18} />;
    if (upper.includes("CONFIRM")) return <CalendarCheck size={18} />;
    if (upper.includes("ACOMPANH")) return <BarChart3 size={18} />;
    return <Settings2 size={18} />;
};

interface UserFormatted extends User {
    nome: string;
    contacto: string;
    perfil: string;
    departamento: string;
    curso: string;
    estado: "Activo" | "Inactivo";
    iniciais: string;
}

export default function UserManagement() {
    const [rawUsers, setRawUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState("");
    const [profileFilter, setProfileFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // Modais Utilizadores
    const [userDialog, setUserDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Partial<UserFormatted> | null>(null);
    const [userPassword, setUserPassword] = useState("");

    // Modais Perfis (Roles)
    const [roleDialog, setRoleDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Partial<Role> | null>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

    // Gestão de Permissões por Perfil (Matriz/Estado)
    const [rolePermissionsState, setRolePermissionsState] = useState<Record<number, number[]>>({});
    const [permissionDialog, setPermissionDialog] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes, permissionsRes] = await Promise.all([
                getUsers(),
                getRoles(),
                getPermissions()
            ]);
            setRawUsers(usersRes);
            setRoles(rolesRes);
            setPermissions(permissionsRes);

            if (rolesRes.length > 0 && !selectedProfileId) {
                setSelectedProfileId(rolesRes[0].id);
            }

            setError(null);
        } catch (err: any) {
            setError(err.message || "Erro ao conectar com a API.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formattedUsers: UserFormatted[] = useMemo(() => {
        return rawUsers.map((u: any) => {
            const name = u.name || u.nome || "Utilizador";
            const nomeParts = name.trim().split(" ");
            const iniciais = nomeParts.length > 1
                ? `${nomeParts[0][0]}${nomeParts[nomeParts.length - 1][0]}`.toUpperCase()
                : name.substring(0, 2).toUpperCase();

            const roleObj = roles.find((r) => r.id === u.role_id);
            const perfilNome = u.role_name || roleObj?.name || "Administrador";

            return {
                ...u,
                nome: name,
                contacto: u.contacto || "+258 84 000 0000",
                perfil: perfilNome,
                departamento: u.departamento || "Engenharia Informática",
                curso: u.curso || "Engenharia Informática",
                estado: u.estado || "Activo",
                iniciais,
            };
        });
    }, [rawUsers, roles]);

    const profilesSummary = useMemo(() => {
        const colorsList = [COLORS.primary, COLORS.purple, COLORS.orange, COLORS.green, "#0891B2", "#DB2777"];
        return roles.map((r, index) => {
            const count = formattedUsers.filter((u) => u.perfil === r.name || u.role_id === r.id).length;
            return {
                ...r,
                utilizadores: count,
                cor: r.color || colorsList[index % colorsList.length],
            };
        });
    }, [roles, formattedUsers]);

    const filteredUsers = useMemo(() => {
        return formattedUsers.filter((user) => {
            const matchesSearch = !search || user.nome.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
            const matchesProfile = !profileFilter || user.perfil === profileFilter;
            const matchesStatus = !statusFilter || user.estado === statusFilter;
            return matchesSearch && matchesProfile && matchesStatus;
        });
    }, [formattedUsers, search, profileFilter, statusFilter]);

    const totalUsers = formattedUsers.length;
    const activeUsers = formattedUsers.filter((u) => u.estado === "Activo").length;
    const inactiveUsers = formattedUsers.filter((u) => u.estado === "Inactivo").length;

    const profileChartData = {
        labels: profilesSummary.map((p) => p.name),
        datasets: [
            {
                label: "Utilizadores",
                data: profilesSummary.map((p) => p.utilizadores),
                backgroundColor: profilesSummary.map((p) => p.cor),
                borderRadius: 6,
                barThickness: 34,
            },
        ],
    };

    const profileChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: "#64748B", font: { size: 11 } } },
            y: { beginAtZero: true, ticks: { stepSize: 1, color: "#64748B" }, grid: { color: "#E2E8F0" } },
        },
    };

    // Ações de Utilizadores
    const openCreateUser = () => {
        setSelectedUser({ nome: "", email: "", contacto: "", departamento: "", curso: "", role_id: roles[0]?.id || null, estado: "Activo" });
        setUserPassword("");
        setUserDialog(true);
    };

    const openEditUser = (user: UserFormatted) => {
        setSelectedUser(user);
        setUserPassword("");
        setUserDialog(true);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        try {
            if (selectedUser.id) {
                await updateUser(selectedUser.id, {
                    name: selectedUser.nome,
                    email: selectedUser.email,
                    contacto: selectedUser.contacto,
                    departamento: selectedUser.departamento,
                    curso: selectedUser.curso,
                    role_id: selectedUser.role_id,
                    estado: selectedUser.estado,
                    ...(userPassword ? { password: userPassword } : {}),
                });
            } else {
                await createUser({
                    name: selectedUser.nome,
                    email: selectedUser.email,
                    contacto: selectedUser.contacto,
                    departamento: selectedUser.departamento,
                    curso: selectedUser.curso,
                    role_id: selectedUser.role_id,
                    estado: selectedUser.estado || "Activo",
                    password: userPassword || "123456",
                });
            }
            setUserDialog(false);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao guardar utilizador.");
        }
    };

    const handleDeleteUser = (user: UserFormatted) => {
        confirmDialog({
            message: `Tem certeza que deseja remover ${user.nome}?`,
            header: "Remover utilizador",
            icon: <Trash2 size={24} />,
            acceptLabel: "Remover",
            rejectLabel: "Cancelar",
            acceptClassName: "p-button-danger",
            accept: async () => {
                await deleteUser(user.id);
                loadData();
            },
        });
    };

    const toggleUserStatus = async (user: UserFormatted) => {
        try {
            const novoEstado = user.estado === "Activo" ? "Inactivo" : "Activo";
            await updateUser(user.id, { estado: novoEstado });
            loadData();
        } catch (err) {
            alert("Erro ao alterar o estado do utilizador.");
        }
    };

    // Ações de Perfis (Roles)
    const openCreateRole = () => {
        setSelectedRole({ name: "", description: "" });
        setRoleDialog(true);
    };

    const openEditRole = (role: Role) => {
        setSelectedRole(role);
        setRoleDialog(true);
    };

    const handleSaveRole = async () => {
        if (!selectedRole || !selectedRole.name) return;
        try {
            if (selectedRole.id) {
                await updateRole(selectedRole.id, { name: selectedRole.name, description: selectedRole.description });
            } else {
                await createRole({ name: selectedRole.name, description: selectedRole.description });
            }
            setRoleDialog(false);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao guardar perfil.");
        }
    };

    const handleDeleteRole = (role: Role) => {
        confirmDialog({
            message: `Tem certeza que deseja remover o perfil ${role.name}?`,
            header: "Remover perfil",
            icon: <Trash2 size={24} />,
            acceptLabel: "Remover",
            rejectLabel: "Cancelar",
            acceptClassName: "p-button-danger",
            accept: async () => {
                await deleteRole(role.id);
                loadData();
            },
        });
    };

    // Sincronizar Permissões com a API
    const handleSyncPermissions = async (roleId: number, permissionIds: number[]) => {
        try {
            await syncRolePermissions(roleId, permissionIds);
            confirmDialog({
                message: "Permissões do perfil atualizadas com sucesso na base de dados.",
                header: "Sucesso",
                icon: <CheckCircle2 size={24} />,
                acceptLabel: "OK",
                rejectClassName: "hidden",
            });
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao sincronizar permissões.");
        }
    };

    const userTemplate = (user: UserFormatted) => (
        <div className="flex align-items-center gap-3">
            <Avatar label={user.iniciais} shape="circle" style={{ background: COLORS.primaryLight, color: COLORS.primary, fontWeight: 700 }} />
            <div>
                <div style={{ fontWeight: 700, color: COLORS.dark, marginBottom: "3px" }}>{user.nome}</div>
                <div style={{ fontSize: "0.82rem", color: COLORS.muted }}>{user.email}</div>
            </div>
        </div>
    );

    const profileTemplate = (user: UserFormatted) => {
        const prof = profilesSummary.find((p) => p.name === user.perfil);
        return <Tag value={user.perfil} style={{ background: `${prof?.cor || COLORS.primary}12`, color: prof?.cor || COLORS.primary, fontWeight: 600 }} />;
    };

    const statusTemplate = (user: UserFormatted) => (
        <Tag value={user.estado} icon={user.estado === "Activo" ? <CheckCircle2 size={13} /> : <XCircle size={13} />} severity={user.estado === "Activo" ? "success" : "danger"} />
    );

    const actionsTemplate = (user: UserFormatted) => (
        <div className="flex justify-content-end gap-1">
            <Button icon={<Edit3 size={16} />} rounded text severity="secondary" onClick={() => openEditUser(user)} tooltip="Editar" />
            <Button icon={user.estado === "Activo" ? <Lock size={16} /> : <Unlock size={16} />} rounded text severity={user.estado === "Activo" ? "warning" : "success"} onClick={() => toggleUserStatus(user)} />
            <Button icon={<Trash2 size={16} />} rounded text severity="danger" onClick={() => handleDeleteUser(user)} tooltip="Remover" />
        </div>
    );

    if (loading && rawUsers.length === 0) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    const activeProfile = profilesSummary.find((p) => p.id === selectedProfileId) || profilesSummary[0];

    return (
        <div style={{ width: "100%", padding: "1.25rem", background: COLORS.background, minHeight: "100vh" }}>
            <ConfirmDialog />

            {error && <div style={{ color: COLORS.red, marginBottom: "1rem", fontWeight: 600 }}>Erro: {error}</div>}

            {/* HEADER */}
            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">
                <div>
                    <div className="flex align-items-center gap-2" style={{ color: COLORS.primary, fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px" }}>
                        <ShieldCheck size={17} /> ADMINISTRAÇÃO DO SISTEMA
                    </div>
                    <h1 style={{ margin: 0, color: COLORS.dark, fontSize: "1.7rem", fontWeight: 800 }}>Utilizadores, Perfis e Permissões</h1>
                    <p style={{ margin: "6px 0 0", color: COLORS.muted, fontSize: "0.9rem" }}>Controle as contas, perfis de acesso e permissões da plataforma.</p>
                </div>
            </div>

            {/* KPIS */}
            <div className="grid">
                <div className="col-12 sm:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.82rem", fontWeight: 600 }}>Total de utilizadores</div>
                                <div style={{ color: COLORS.dark, fontSize: "1.8rem", fontWeight: 800, marginTop: "8px" }}>{totalUsers}</div>
                            </div>
                            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={21} /></div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 sm:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.82rem", fontWeight: 600 }}>Contas activas</div>
                                <div style={{ color: COLORS.dark, fontSize: "1.8rem", fontWeight: 800, marginTop: "8px" }}>{activeUsers}</div>
                            </div>
                            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}><UserCheck size={21} /></div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 sm:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.82rem", fontWeight: 600 }}>Contas inactivas</div>
                                <div style={{ color: COLORS.dark, fontSize: "1.8rem", fontWeight: 800, marginTop: "8px" }}>{inactiveUsers}</div>
                            </div>
                            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: COLORS.orangeLight, color: COLORS.orange, display: "flex", alignItems: "center", justifyContent: "center" }}><UserX size={21} /></div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 sm:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.82rem", fontWeight: 600 }}>Perfis de acesso</div>
                                <div style={{ color: COLORS.dark, fontSize: "1.8rem", fontWeight: 800, marginTop: "8px" }}>{roles.length}</div>
                            </div>
                            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: COLORS.purpleLight, color: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center" }}><KeyRound size={21} /></div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* TABS */}
            <Card style={{ marginTop: "1rem", border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                    
                    {/* TAB UTILIZADORES */}
                    <TabPanel header="Utilizadores" leftIcon={<Users size={16} className="mr-2" />}>
                        <div className="flex justify-content-end mb-3">
                            <Button label="Novo utilizador" icon={<UserPlus size={17} />} onClick={openCreateUser} style={{ background: COLORS.primary, border: "none" }} />
                        </div>
                        <div className="grid mb-3">
                            <div className="col-12 lg:col-8">
                                <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem", height: "340px", background: COLORS.white }}>
                                    <div style={{ fontSize: "1rem", fontWeight: 700, color: COLORS.dark, marginBottom: "1rem" }}>Distribuição por perfil</div>
                                    <div style={{ height: "250px" }}>
                                        <Bar data={profileChartData} options={profileChartOptions} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 lg:col-4">
                                <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem", height: "340px", background: COLORS.white }}>
                                    <div style={{ fontSize: "1rem", fontWeight: 700, color: COLORS.dark }}>Estado das contas</div>
                                    <Divider />
                                    <div className="flex justify-content-between mb-2"><span className="text-sm">Activos</span><strong>{activeUsers}</strong></div>
                                    <ProgressBar value={totalUsers ? (activeUsers / totalUsers) * 100 : 0} showValue={false} style={{ height: "7px" }} />
                                    <div className="flex justify-content-between mt-3 mb-2"><span className="text-sm">Inactivos</span><strong>{inactiveUsers}</strong></div>
                                    <ProgressBar value={totalUsers ? (inactiveUsers / totalUsers) * 100 : 0} showValue={false} style={{ height: "7px" }} color={COLORS.red} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-column md:flex-row gap-2 mb-3">
                            <span className="p-input-icon-left">
                                <Search size={16} style={{ position: "absolute", top: "50%", left: "0.75rem", transform: "translateY(-50%)" }} />
                                <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar utilizador..." style={{ paddingLeft: "2.4rem", minWidth: "240px" }} />
                            </span>
                            <Dropdown value={profileFilter} options={profilesSummary.map((p) => p.name)} onChange={(e) => setProfileFilter(e.value)} placeholder="Perfil" showClear style={{ minWidth: "170px" }} />
                            <Dropdown value={statusFilter} options={["Activo", "Inactivo"]} onChange={(e) => setStatusFilter(e.value)} placeholder="Estado" showClear style={{ minWidth: "140px" }} />
                        </div>

                        <DataTable value={filteredUsers} paginator rows={6} responsiveLayout="scroll" stripedRows size="small" emptyMessage="Nenhum utilizador encontrado.">
                            <Column header="Utilizador" body={userTemplate} style={{ minWidth: "260px" }} />
                            {/* <Column field="contacto" header="Contacto" /> */}
                            <Column header="Perfil" body={profileTemplate} />
                            {/* <Column field="departamento" header="Departamento" /> */}
                            {/* <Column field="curso" header="Curso" /> */}
                            <Column header="Estado" body={statusTemplate} />
                            <Column header="Acções" body={actionsTemplate} align="right" />
                        </DataTable>
                    </TabPanel>

                    {/* TAB PERFIS (ROLES) */}
                    <TabPanel header="Perfis (Roles)" leftIcon={<ShieldCheck size={16} className="mr-2" />}>
                        <div className="flex justify-content-end mb-3">
                            <Button label="Novo perfil" icon={<UserPlus size={17} />} onClick={openCreateRole} style={{ background: COLORS.primary, border: "none" }} />
                        </div>
                        <div className="flex flex-column lg:flex-row gap-4" style={{ minHeight: "400px" }}>
                            <div style={{ width: "100%", maxWidth: "340px" }}>
                                <div className="flex flex-column gap-2">
                                    {profilesSummary.map((profile) => (
                                        <div
                                            key={profile.id}
                                            onClick={() => setSelectedProfileId(profile.id)}
                                            style={{
                                                padding: "0.9rem",
                                                borderRadius: "10px",
                                                border: `1px solid ${selectedProfileId === profile.id ? profile.cor : COLORS.border}`,
                                                background: selectedProfileId === profile.id ? `${profile.cor}08` : COLORS.white,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <div className="flex justify-content-between align-items-center">
                                                <div>
                                                    <div style={{ fontWeight: 700, color: COLORS.dark }}>{profile.name}</div>
                                                    <div style={{ fontSize: "0.72rem", color: COLORS.muted }}>{profile.utilizadores} utilizadores</div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button icon={<Edit3 size={14} />} rounded text severity="secondary" onClick={(e) => { e.stopPropagation(); openEditRole(profile); }} />
                                                    <Button icon={<Trash2 size={14} />} rounded text severity="danger" onClick={(e) => { e.stopPropagation(); handleDeleteRole(profile); }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {activeProfile && (
                                <div style={{ flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: "12px", background: COLORS.white, padding: "1.5rem" }}>
                                    <h2>{activeProfile.name}</h2>
                                    <p style={{ color: COLORS.muted }}>{activeProfile.description || "Sem descrição definida para este perfil."}</p>
                                    <Divider />
                                    <div className="flex justify-content-between align-items-center mb-3">
                                        <strong>Atribuição de Permissões na Base de Dados</strong>
                                        <Button 
                                            label="Sincronizar Permissões" 
                                            icon={<CheckCircle2 size={16} />} 
                                            size="small"
                                            onClick={() => {
                                                const currentPerms = rolePermissionsState[activeProfile.id] || [];
                                                handleSyncPermissions(activeProfile.id, currentPerms);
                                            }} 
                                        />
                                    </div>
                                    <div className="grid">
                                        {permissions.map((perm) => {
                                            const rolePerms = rolePermissionsState[activeProfile.id] || [];
                                            const isChecked = rolePerms.includes(perm.id);
                                            return (
                                                <div key={perm.id} className="col-12 md:col-6">
                                                    <div className="flex align-items-center justify-content-between p-3 border-1 surface-border border-round">
                                                        <div className="flex align-items-center gap-3">
                                                            {getPermissionIcon(perm.name)}
                                                            <div className="font-bold text-sm">{perm.name}</div>
                                                        </div>
                                                        <InputSwitch 
                                                            checked={isChecked} 
                                                            onChange={(e) => {
                                                                const updated = e.value 
                                                                    ? [...rolePerms, perm.id]
                                                                    : rolePerms.filter((id) => id !== perm.id);
                                                                setRolePermissionsState({
                                                                    ...rolePermissionsState,
                                                                    [activeProfile.id]: updated
                                                                });
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabPanel>

                    {/* TAB PERMISSÕES GLOBAIS */}
                    <TabPanel header="Permissões Globais" leftIcon={<KeyRound size={16} className="mr-2" />}>
                        <div className="grid">
                            {permissions.map((perm) => (
                                <div key={perm.id} className="col-12 md:col-6">
                                    <div className="flex align-items-center justify-content-between p-3 border-1 surface-border border-round">
                                        <div className="flex align-items-center gap-3">
                                            {getPermissionIcon(perm.name)}
                                            <div>
                                                <div className="font-bold">{perm.name}</div>
                                                <div className="text-sm text-color-secondary">Registo oficial na base de dados</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabPanel>
                </TabView>
            </Card>

            {/* MODAL UTILIZADOR */}
            <Dialog visible={userDialog} onHide={() => setUserDialog(false)} header={selectedUser?.id ? "Editar utilizador" : "Novo utilizador"} modal style={{ width: "550px" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold">Nome Completo</label>
                        <InputText value={selectedUser?.nome || ""} onChange={(e) => setSelectedUser((p) => ({ ...p, nome: e.target.value }))} className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">E-mail</label>
                        <InputText value={selectedUser?.email || ""} onChange={(e) => setSelectedUser((p) => ({ ...p, email: e.target.value }))} className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Contacto</label>
                        <InputText value={selectedUser?.contacto || ""} onChange={(e) => setSelectedUser((p) => ({ ...p, contacto: e.target.value }))} className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Palavra-passe {selectedUser?.id && "(deixe em branco para manter)"}</label>
                        <InputText type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Perfil / Role</label>
                        <Dropdown value={selectedUser?.role_id} options={roles.map((r) => ({ label: r.name, value: r.id }))} onChange={(e) => setSelectedUser((p) => ({ ...p, role_id: e.value }))} placeholder="Selecione o perfil" className="w-full" />
                    </div>
                    <Button label="Guardar" icon={<CheckCircle2 size={16} />} onClick={handleSaveUser} />
                </div>
            </Dialog>

            {/* MODAL PERFIL (ROLE) */}
            <Dialog visible={roleDialog} onHide={() => setRoleDialog(false)} header={selectedRole?.id ? "Editar Perfil" : "Criar Novo Perfil"} modal style={{ width: "500px" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Nome do Perfil</label>
                        <InputText value={selectedRole?.name || ""} onChange={(e) => setSelectedRole((p) => ({ ...p, name: e.target.value }))} placeholder="Ex.: COORDENADOR" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Descrição</label>
                        <InputTextarea rows={3} value={selectedRole?.description || ""} onChange={(e) => setSelectedRole((p) => ({ ...p, description: e.target.value }))} placeholder="Breve descrição das responsabilidades..." className="w-full" />
                    </div>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setRoleDialog(false)} />
                        <Button label="Guardar" icon={<CheckCircle2 size={16} />} onClick={handleSaveRole} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}