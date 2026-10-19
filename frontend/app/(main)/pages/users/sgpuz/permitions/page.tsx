"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";

import {
    ShieldCheck,
    KeyRound,
    Plus,
    Search,
    Edit3,
    Trash2,
    CheckCircle2,
    BookOpen,
    GraduationCap,
    ClipboardCheck,
    Activity,
    CalendarCheck,
    BarChart3,
    Settings2,
} from "lucide-react";

import { 
    getPermissions, 
    createPermission, 
    updatePermission,
    deletePermission, 
    Permission 
} from "@/app/api/users/userService";

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

export default function PermissionManagement() {
    const toast = useRef<Toast>(null);

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [permissionDialog, setPermissionDialog] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Partial<Permission> | null>(null);
    const [permissionName, setPermissionName] = useState("");

    const loadPermissionsData = async () => {
        try {
            setLoading(true);
            const data = await getPermissions();
            setPermissions(data);
        } catch (err: any) {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: err.response?.data?.message || "Erro ao carregar permissões da API.",
                life: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPermissionsData();
    }, []);

    const filteredPermissions = useMemo(() => {
        return permissions.filter((perm) => {
            const name = perm.name || "";
            return !search || name.toLowerCase().includes(search.toLowerCase());
        });
    }, [permissions, search]);

    const openCreateDialog = () => {
        setSelectedPermission(null);
        setPermissionName("");
        setPermissionDialog(true);
    };

    const openEditDialog = (perm: Permission) => {
        setSelectedPermission(perm);
        setPermissionName(perm.name);
        setPermissionDialog(true);
    };

    const handleSavePermission = async () => {
        if (!permissionName.trim()) {
            toast.current?.show({
                severity: "warn",
                summary: "Aviso",
                detail: "O nome da permissão é obrigatório.",
                life: 3000,
            });
            return;
        }

        try {
            if (selectedPermission?.id) {
                await updatePermission(selectedPermission.id, { name: permissionName });
                toast.current?.show({
                    severity: "success",
                    summary: "Sucesso",
                    detail: "Permissão atualizada com sucesso.",
                    life: 3000,
                });
            } else {
                await createPermission({ name: permissionName });
                toast.current?.show({
                    severity: "success",
                    summary: "Sucesso",
                    detail: "Permissão criada com sucesso.",
                    life: 3000,
                });
            }
            setPermissionDialog(false);
            loadPermissionsData();
        } catch (err: any) {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: err.response?.data?.message || "Erro ao guardar permissão.",
                life: 4000,
            });
        }
    };

    const handleDeletePermission = (perm: Permission) => {
        confirmDialog({
            message: `Tem certeza que deseja eliminar a permissão ${perm.name}?`,
            header: "Eliminar permissão",
            icon: <Trash2 size={24} />,
            acceptLabel: "Eliminar",
            rejectLabel: "Cancelar",
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deletePermission(perm.id);
                    toast.current?.show({
                        severity: "success",
                        summary: "Sucesso",
                        detail: "Permissão eliminada com sucesso.",
                        life: 3000,
                    });
                    loadPermissionsData();
                } catch (err: any) {
                    toast.current?.show({
                        severity: "error",
                        summary: "Erro",
                        detail: err.response?.data?.message || "Erro ao eliminar permissão.",
                        life: 4000,
                    });
                }
            },
        });
    };

    const permissionNameTemplate = (perm: Permission) => (
        <div className="flex align-items-center gap-3">
            <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: COLORS.purpleLight, color: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {getPermissionIcon(perm.name)}
            </div>
            <div>
                <div style={{ fontWeight: 700, color: COLORS.dark }}>{perm.name}</div>
                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Permissão registada no sistema</div>
            </div>
        </div>
    );

    const actionsTemplate = (perm: Permission) => (
        <div className="flex justify-content-end gap-1">
            <Button icon={<Edit3 size={16} />} rounded text severity="secondary" onClick={() => openEditDialog(perm)} tooltip="Editar" />
            <Button icon={<Trash2 size={16} />} rounded text severity="danger" onClick={() => handleDeletePermission(perm)} tooltip="Eliminar" />
        </div>
    );

    if (loading && permissions.length === 0) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", padding: "1.25rem", background: COLORS.background, minHeight: "100vh" }}>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* HEADER */}
            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">
                <div>
                    <div className="flex align-items-center gap-2" style={{ color: COLORS.primary, fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px" }}>
                        <ShieldCheck size={17} /> CONFIGURAÇÕES DE SEGURANÇA
                    </div>
                    <h1 style={{ margin: 0, color: COLORS.dark, fontSize: "1.7rem", fontWeight: 800 }}>Gestão de Permissões</h1>
                    <p style={{ margin: "6px 0 0", color: COLORS.muted, fontSize: "0.9rem" }}>Administre as permissões globais associadas aos perfis do sistema.</p>
                </div>
                <Button label="Nova permissão" icon={<Plus size={17} />} onClick={openCreateDialog} style={{ background: COLORS.primary, border: "none" }} />
            </div>

            {/* KPIS / RESUMO */}
            <div className="grid mb-4">
                <div className="col-12 sm:col-6 xl:col-4">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.82rem", fontWeight: 600 }}>Total de permissões</div>
                                <div style={{ color: COLORS.dark, fontSize: "1.8rem", fontWeight: 800, marginTop: "8px" }}>{permissions.length}</div>
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
                        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: COLORS.dark }}>Lista de permissões</div>
                        <div style={{ color: COLORS.muted, fontSize: "0.78rem", marginTop: "3px" }}>Funcionalidades protegidas e controladas por ACL.</div>
                    </div>
                    <span className="p-input-icon-left w-full md:w-auto">
                        <Search size={16} style={{ position: "absolute", top: "50%", left: "0.75rem", transform: "translateY(-50%)" }} />
                        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar permissão..." style={{ paddingLeft: "2.4rem", minWidth: "240px" }} />
                    </span>
                </div>

                <DataTable value={filteredPermissions} paginator rows={6} responsiveLayout="scroll" stripedRows size="small" emptyMessage="Nenhuma permissão encontrada.">
                    <Column header="Permissão" body={permissionNameTemplate} style={{ minWidth: "300px" }} />
                    <Column field="id" header="ID" style={{ width: "100px" }} />
                    <Column header="Acções" body={actionsTemplate} align="right" style={{ width: "120px" }} />
                </DataTable>
            </Card>

            {/* MODAL DE CRIAÇÃO / EDIÇÃO DE PERMISSÃO */}
            <Dialog visible={permissionDialog} onHide={() => setPermissionDialog(false)} header={selectedPermission?.id ? "Editar Permissão" : "Criar Nova Permissão"} modal style={{ width: "450px" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Nome da Permissão</label>
                        <InputText value={permissionName} onChange={(e) => setPermissionName(e.target.value)} placeholder="Ex.: MANAGE_USERS" className="w-full" />
                    </div>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setPermissionDialog(false)} />
                        <Button label={selectedPermission?.id ? "Atualizar" : "Criar"} icon={<CheckCircle2 size={16} />} onClick={handleSavePermission} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}