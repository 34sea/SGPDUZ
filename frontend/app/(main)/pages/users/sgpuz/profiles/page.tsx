"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputTextarea } from "primereact/inputtextarea";

import {
    ShieldCheck,
    KeyRound,
    UserPlus,
    Search,
    Edit3,
    Trash2,
    CheckCircle2,
    Shield,
} from "lucide-react";

import { getRoles, createRole, updateRole, deleteRole, Role } from "@/app/api/users/userService";

const COLORS = {
    primary: "#1D4ED8",
    primaryLight: "#EFF6FF",
    purple: "#7C3AED",
    purpleLight: "#F3E8FF",
    red: "#DC2626",
    dark: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",
    background: "#F8FAFC",
    white: "#FFFFFF",
};

export default function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [roleDialog, setRoleDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Partial<Role> | null>(null);

    const loadRolesData = async () => {
        try {
            setLoading(true);
            const data = await getRoles();
            setRoles(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar perfis.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRolesData();
    }, []);

    const filteredRoles = useMemo(() => {
        return roles.filter((role: any) => {
            const name = role.name || role.nome || "";
            return !search || name.toLowerCase().includes(search.toLowerCase());
        });
    }, [roles, search]);

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
                await updateRole(selectedRole.id, {
                    name: selectedRole.name,
                    description: selectedRole.description,
                });
            } else {
                await createRole({
                    name: selectedRole.name,
                    description: selectedRole.description,
                });
            }
            setRoleDialog(false);
            loadRolesData();
        } catch (err: any) {
            alert(err.response?.data?.message || "Erro ao guardar perfil.");
        }
    };

    const handleDeleteRole = (role: Role & { name: string }) => {
        confirmDialog({
            message: `Tem certeza que deseja remover o perfil ${role.name}?`,
            header: "Remover perfil",
            icon: <Trash2 size={24} />,
            acceptLabel: "Remover",
            rejectLabel: "Cancelar",
            acceptClassName: "p-button-danger",
            accept: async () => {
                await deleteRole(role.id);
                loadRolesData();
            },
        });
    };

    const roleNameTemplate = (role: any) => (
        <div className="flex align-items-center gap-3">
            <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: COLORS.purpleLight, color: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={19} />
            </div>
            <div>
                <div style={{ fontWeight: 700, color: COLORS.dark }}>{role.name || role.nome}</div>
                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Perfil de acesso institucional</div>
            </div>
        </div>
    );

    const actionsTemplate = (role: any) => (
        <div className="flex justify-content-end gap-1">
            <Button icon={<Edit3 size={16} />} rounded text severity="secondary" onClick={() => openEditRole(role)} tooltip="Editar" />
            <Button icon={<Trash2 size={16} />} rounded text severity="danger" onClick={() => handleDeleteRole(role)} tooltip="Remover" />
        </div>
    );

    if (loading && roles.length === 0) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", padding: "1.25rem", background: COLORS.background, minHeight: "100vh" }}>
            <ConfirmDialog />

            {error && <div style={{ color: COLORS.red, marginBottom: "1rem", fontWeight: 600 }}>Erro: {error}</div>}

            {/* HEADER */}
            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">
                <div>
                    <div className="flex align-items-center gap-2" style={{ color: COLORS.primary, fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px" }}>
                        <ShieldCheck size={17} /> CONFIGURAÇÕES DE SEGURANÇA
                    </div>
                    <h1 style={{ margin: 0, color: COLORS.dark, fontSize: "1.7rem", fontWeight: 800 }}>Gestão de Perfis (Roles)</h1>
                    <p style={{ margin: "6px 0 0", color: COLORS.muted, fontSize: "0.9rem" }}>Crie e administre os perfis de acesso atribuídos aos utilizadores do sistema.</p>
                </div>
                <Button label="Novo perfil" icon={<UserPlus size={17} />} onClick={openCreateRole} style={{ background: COLORS.primary, border: "none" }} />
            </div>

            {/* KPIS / RESUMO */}
            <div className="grid mb-4">
                <div className="col-12 sm:col-6 xl:col-4">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.82rem", fontWeight: 600 }}>Total de perfis</div>
                                <div style={{ color: COLORS.dark, fontSize: "1.8rem", fontWeight: 800, marginTop: "8px" }}>{roles.length}</div>
                            </div>
                            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: COLORS.purpleLight, color: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center" }}><KeyRound size={21} /></div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL (TABELA) */}
            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                <div className="flex flex-column md:flex-row gap-2 mb-3 justify-content-between align-items-center">
                    <div>
                        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: COLORS.dark }}>Lista de perfis configurados</div>
                        <div style={{ color: COLORS.muted, fontSize: "0.78rem", marginTop: "3px" }}>Consulte as funções disponíveis na plataforma.</div>
                    </div>
                    <span className="p-input-icon-left w-full md:w-auto">
                        <Search size={16} style={{ position: "absolute", top: "50%", left: "0.75rem", transform: "translateY(-50%)" }} />
                        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar perfil..." style={{ paddingLeft: "2.4rem", minWidth: "240px" }} />
                    </span>
                </div>

                <DataTable value={filteredRoles} paginator rows={6} responsiveLayout="scroll" stripedRows size="small" emptyMessage="Nenhum perfil encontrado.">
                    <Column header="Perfil" body={roleNameTemplate} style={{ minWidth: "260px" }} />
                    <Column field="description" header="Descrição" body={(rowData: any) => rowData.description || "Sem descrição definida"} style={{ minWidth: "300px" }} />
                    <Column header="Acções" body={actionsTemplate} align="right" style={{ width: "125px" }} />
                </DataTable>
            </Card>

            {/* MODAL DE CRIAÇÃO / EDIÇÃO DE PERFIL */}
            <Dialog visible={roleDialog} onHide={() => setRoleDialog(false)} header={selectedRole?.id ? "Editar perfil" : "Criar novo perfil"} modal style={{ width: "500px" }}>
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