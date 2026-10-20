"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import {
    Activity,
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    Filter,
    GraduationCap,
    Plus,
    RefreshCw,
    Search,
    Send,
    Target,
    UserCheck,
    Trash2,
    Upload
} from "lucide-react";

import {
    getTasks,
    createTask,
    submitTaskProof,
    deleteTask,
    getTaskById,
} from "@/app/api/activitiesPedagogicalMonitoring/activityService";

const COLORS = {
    primary: "#1D4ED8",
    primaryLight: "#EFF6FF",
    green: "#16A34A",
    greenLight: "#DCFCE7",
    orange: "#D97706",
    orangeLight: "#FEF3C7",
    red: "#DC2626",
    redLight: "#FEE2E2",
    cyan: "#0891B2",
    cyanLight: "#CFFAFE",
    dark: "#0F172A",
    text: "#334155",
    muted: "#64748B",
    light: "#94A3B8",
    border: "#E2E8F0",
    background: "#F8FAFC",
    white: "#FFFFFF"
};

const getActivitySeverity = (status: string) => {
    switch (status) {
        case "VERIFICADA":
        case "Verificada":
            return "success";
        case "ENTREGUE":
        case "Entregue":
            return "info";
        case "ATRASADA":
        case "Atrasada":
            return "danger";
        default:
            return "warning";
    }
};

const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function DocenteActivities() {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);

    const [activities, setActivities] = useState<any[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);

    const [activityDialog, setActivityDialog] = useState(false);
    const [submissionDialog, setSubmissionDialog] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const [submissionObservation, setSubmissionObservation] = useState("");
    const [proofFile, setProofFile] = useState<File | null>(null);

    const [activityForm, setActivityForm] = useState({
        title: "",
        description: "",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const tasksRes = await getTasks().catch(() => []);
            setActivities(tasksRes || []);

            if (tasksRes && tasksRes.length > 0) {
                setSelectedActivity(tasksRes[0]);
            }
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao carregar dados das actividades.", life: 4000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredActivities = useMemo(() => {
        return activities.filter((activity) => {
            const matchesSearch =
                !search ||
                (activity.title && activity.title.toLowerCase().includes(search.toLowerCase()));

            const matchesStatus = !statusFilter || activity.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [activities, search, statusFilter]);

    const activityStats = useMemo(() => {
        const total = activities.length;
        const pendentes = activities.filter((a) => a.status === "PENDENTE" || a.status === "Pendente").length;
        const entregues = activities.filter((a) => a.status === "ENTREGUE" || a.status === "Entregue").length;
        const verificadas = activities.filter((a) => a.status === "VERIFICADA" || a.status === "Verificada").length;
        const atrasadas = activities.filter((a) => a.status === "ATRASADA" || a.status === "Atrasada").length;

        return { total, pendentes, entregues, verificadas, atrasadas };
    }, [activities]);

    const handleSaveActivity = async () => {
        if (!activityForm.title || !activityForm.deadline) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Preencha o título e o prazo limite.", life: 3000 });
            return;
        }

        try {
            // Obtém o ID do docente autenticado do localStorage para associar automaticamente à sua própria conta
            const userStorage = localStorage.getItem("user-dashboard-SGPD");
            const parsedUser = userStorage ? JSON.parse(userStorage) : null;
            const currentUserId = parsedUser?.data?.id || parsedUser?.id;

            if (!currentUserId) {
                toast.current?.show({ severity: "error", summary: "Erro", detail: "Sessão de utilizador não encontrada.", life: 3000 });
                return;
            }

            const payload = {
                title: activityForm.title,
                description: activityForm.description,
                assigned_to: Number(currentUserId), // Associado automaticamente ao próprio ID do docente
                deadline: activityForm.deadline.toISOString().split('T')[0]
            };
            await createTask(payload);
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Actividade registada com sucesso na sua conta.", life: 3000 });
            setActivityDialog(false);
            setActivityForm({ title: "", description: "", deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            loadData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao criar actividade.", life: 4000 });
        }
    };

    const handleSubmitProof = async () => {
        if (!selectedActivity) return;

        try {
            const formData = new FormData();
            formData.append("task_id", selectedActivity.id.toString());
            formData.append("notes", submissionObservation);
            if (proofFile) {
                formData.append("file", proofFile);
            }

            await submitTaskProof(formData);
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Comprovativo submetido com sucesso.", life: 3000 });
            setSubmissionDialog(false);
            setProofFile(null);
            setSubmissionObservation("");
            loadData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao submeter comprovativo.", life: 4000 });
        }
    };

    const handleDelete = (id: number) => {
        confirmDialog({
            message: "Tem certeza que deseja eliminar esta actividade?",
            header: "Confirmação",
            icon: <Trash2 size={18} />,
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteTask(id);
                    toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Actividade eliminada.", life: 3000 });
                    loadData();
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao eliminar.", life: 4000 });
                }
            }
        });
    };

    if (loading && activities.length === 0) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* CABEÇALHO */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.primaryLight, color: COLORS.primary }}>
                        <GraduationCap size={23} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.55rem", color: COLORS.dark, fontWeight: 750 }}>
                            Minhas Actividades
                        </h1>
                        <p style={{ margin: ".2rem 0 0", color: COLORS.muted, fontSize: ".9rem" }}>
                            Painel individual para execução de tarefas pedagógicas e anexo de comprovativos.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button label="Atualizar" icon={<RefreshCw size={16} />} outlined severity="secondary" onClick={loadData} />
                    {/* <Button
                        label="Nova actividade"
                        icon={<Plus size={17} />}
                        onClick={() => setActivityDialog(true)}
                        style={{ background: COLORS.primary, borderColor: COLORS.primary }}
                    /> */}
                </div>
            </div>

            {/* KPIS INDIVIDUAIS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
                <KpiCard title="Total" value={activityStats.total} subtitle="Atribuídas a si" icon={<Activity size={20} />} color={COLORS.primary} background={COLORS.primaryLight} />
                <KpiCard title="Pendentes" value={activityStats.pendentes} subtitle="Aguardam submissão" icon={<Clock3 size={20} />} color={COLORS.orange} background={COLORS.orangeLight} />
                <KpiCard title="Entregues" value={activityStats.entregues} subtitle="Submetidas" icon={<Send size={20} />} color={COLORS.cyan} background={COLORS.cyanLight} />
                <KpiCard title="Verificadas" value={activityStats.verificadas} subtitle="Validadas" icon={<CheckCircle2 size={20} />} color={COLORS.green} background={COLORS.greenLight} />
                <KpiCard title="Atrasadas" value={activityStats.atrasadas} subtitle="Prazo expirado" icon={<AlertCircle size={20} />} color={COLORS.red} background={COLORS.redLight} />
            </div>

            {/* FILTROS E PESQUISA */}
            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 220px auto", gap: ".75rem", alignItems: "center" }}>
                    <span className="p-input-icon-left" style={{ position: "relative" }}>
                        <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                        <InputText
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pesquisar nas minhas actividades..."
                            style={{ width: "100%", paddingLeft: "2.5rem" }}
                        />
                    </span>

                    <Dropdown
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.value)}
                        options={[
                            { label: "Todos os estados", value: null },
                            { label: "Pendente", value: "PENDENTE" },
                            { label: "Entregue", value: "ENTREGUE" },
                            { label: "Verificada", value: "VERIFICADA" },
                            { label: "Atrasada", value: "ATRASADA" }
                        ]}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Estado"
                        showClear
                    />

                    <Button label="Limpar" icon={<Filter size={16} />} text onClick={() => { setSearch(""); setStatusFilter(null); }} />
                </div>
            </Card>

            {/* CONTEÚDO PRINCIPAL (TABELA + DETALHE) */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: "1rem", alignItems: "start" }}>
                <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Lista de Tarefas</h2>
                            <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Submeta os comprovativos e execute as tarefas atribuídas.</p>
                        </div>
                        <Tag value={`${filteredActivities.length} tarefas`} severity="info" rounded />
                    </div>

                    <DataTable
                        value={filteredActivities}
                        paginator
                        rows={6}
                        responsiveLayout="scroll"
                        emptyMessage="Não tem nenhuma actividade atribuída."
                        rowHover
                        size="small"
                        onRowClick={(e) => setSelectedActivity(e.data)}
                    >
                        <Column field="title" header="Actividade" style={{ minWidth: "220px" }} />
                        <Column header="Atribuída por" body={(row) => row.assigned_by_name || "Chefia"} style={{ minWidth: "150px" }} />
                        <Column header="Prazo" body={(row) => formatDate(row.deadline)} />
                        <Column header="Estado" body={(row) => <Tag value={row.status} severity={getActivitySeverity(row.status)} rounded />} />
                        <Column header="Ações" body={(rowData) => (
                            <div style={{ display: "flex", gap: ".35rem" }}>
                                <Button icon={<Eye size={16} />} rounded text severity="secondary" tooltip="Consultar" onClick={() => setSelectedActivity(rowData)} />
                                {(rowData.status === "PENDENTE" || rowData.status === "Pendente" || rowData.status === "ATRASADA") && (
                                    <Button icon={<Upload size={16} />} rounded text severity="info" tooltip="Submeter comprovativo" onClick={() => { setSelectedActivity(rowData); setSubmissionDialog(true); }} />
                                )}
                                <Button icon={<Trash2 size={16} />} rounded text severity="danger" tooltip="Eliminar" onClick={() => handleDelete(rowData.id)} />
                            </div>
                        )} style={{ width: "130px" }} />
                    </DataTable>
                </Card>

                {/* PAINEL LATERAL DE DETALHES */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1rem" }}>
                            <Target size={19} color={COLORS.primary} />
                            <h3 style={{ margin: 0, fontSize: ".98rem" }}>Progresso Individual</h3>
                        </div>
                        <ActivitySummaryRow label="Pendentes" value={activityStats.pendentes} total={activityStats.total} color={COLORS.orange} />
                        <ActivitySummaryRow label="Entregues" value={activityStats.entregues} total={activityStats.total} color={COLORS.cyan} />
                        <ActivitySummaryRow label="Verificadas" value={activityStats.verificadas} total={activityStats.total} color={COLORS.green} />
                        <ActivitySummaryRow label="Atrasadas" value={activityStats.atrasadas} total={activityStats.total} color={COLORS.red} />
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.primaryLight, color: COLORS.primary }}>
                                <FileText size={18} />
                            </div>
                            {selectedActivity && <Tag value={selectedActivity.status} severity={getActivitySeverity(selectedActivity.status)} rounded />}
                        </div>

                        {selectedActivity ? (
                            <>
                                <h3 style={{ fontSize: ".98rem", color: COLORS.dark, margin: "1rem 0 .35rem" }}>{selectedActivity.title}</h3>
                                <p style={{ fontSize: ".82rem", color: COLORS.muted, lineHeight: 1.5, margin: "0 0 1rem" }}>{selectedActivity.description || "Sem descrição detalhada."}</p>
                                <DetailRow icon={<UserCheck size={15} />} label="Atribuída por" value={selectedActivity.assigned_by_name || "Chefia"} />
                                <DetailRow icon={<CalendarDays size={15} />} label="Prazo limite" value={formatDate(selectedActivity.deadline)} />

                                <div style={{ display: "flex", gap: ".5rem", marginTop: "1rem" }}>
                                    <Button label="Submeter / Anexar Comprovativo" icon={<Upload size={15} />} size="small" className="w-full" onClick={() => setSubmissionDialog(true)} />
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: "1rem 0", textAlign: "center", color: COLORS.muted }}>
                                <Activity size={30} style={{ opacity: 0.35, marginBottom: ".5rem" }} />
                                <div style={{ fontSize: ".82rem" }}>Seleccione uma actividade para ver os detalhes.</div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* DIALOG: CRIAR ACTIVIDADE (Criada pelo próprio docente para si) */}
            <Dialog header="Registar nova actividade" visible={activityDialog} onHide={() => setActivityDialog(false)} style={{ width: "min(650px, 94vw)" }} modal>
                <div style={{ display: "grid", gap: "1rem" }}>
                    <div>
                        <label className="block mb-2 font-medium">Título da actividade</label>
                        <InputText value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} placeholder="Ex.: Preparar sumários da semana" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Descrição</label>
                        <InputTextarea value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} rows={4} className="w-full" placeholder="Descreva os detalhes..." />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Prazo limite</label>
                        <Calendar value={activityForm.deadline} onChange={(e) => setActivityForm({ ...activityForm, deadline: e.value as Date })} dateFormat="yy-mm-dd" showIcon className="w-full" />
                    </div>
                    <Divider />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem" }}>
                        <Button label="Cancelar" text severity="secondary" onClick={() => setActivityDialog(false)} />
                        <Button label="Guardar actividade" icon={<Plus size={16} />} onClick={handleSaveActivity} />
                    </div>
                </div>
            </Dialog>

            {/* DIALOG: SUBMETER COMPROVATIVO */}
            <Dialog header="Submeter comprovativo de actividade" visible={submissionDialog} onHide={() => setSubmissionDialog(false)} style={{ width: "min(600px, 94vw)" }} modal>
                {selectedActivity && (
                    <div>
                        <div style={{ padding: "1rem", background: COLORS.primaryLight, borderRadius: "10px", marginBottom: "1rem" }}>
                            <strong>{selectedActivity.title}</strong>
                            <div style={{ color: COLORS.muted, fontSize: ".8rem", marginTop: ".25rem" }}>Prazo limite: {formatDate(selectedActivity.deadline)}</div>
                        </div>
                        <label className="block mb-2 font-medium">Observações da entrega</label>
                        <InputTextarea value={submissionObservation} onChange={(e) => setSubmissionObservation(e.target.value)} rows={4} className="w-full" placeholder="Adicione notas ou comentários sobre a execução..." />

                        <div className="mt-3">
                            <label className="block mb-2 font-medium">Anexar Comprovativo (Ficheiro PDF/Imagem/Excel)</label>
                            <input type="file" onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)} className="w-full p-2 border-1 border-round border-300" />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem", marginTop: "1.25rem" }}>
                            <Button label="Cancelar" text severity="secondary" onClick={() => setSubmissionDialog(false)} />
                            <Button label="Submeter comprovativo" icon={<Send size={16} />} onClick={handleSubmitProof} />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}

function KpiCard({ title, value, subtitle, icon, color, background }: any) {
    return (
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "1rem", minHeight: "110px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ color: COLORS.muted, fontSize: ".78rem", marginBottom: ".35rem" }}>{title}</div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 750, color: COLORS.dark }}>{value}</div>
                </div>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background, color }}>
                    {icon}
                </div>
            </div>
            <div style={{ marginTop: ".55rem", color: COLORS.muted, fontSize: ".73rem" }}>{subtitle}</div>
        </div>
    );
}

function ActivitySummaryRow({ label, value, total, color }: any) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".35rem" }}>
                <span style={{ fontSize: ".8rem", color: COLORS.text }}>{label}</span>
                <strong style={{ fontSize: ".8rem" }}>{value}</strong>
            </div>
            <div style={{ height: "7px", background: COLORS.background, borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: "10px" }} />
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".7rem" }}>
            <span style={{ color: COLORS.primary, display: "flex" }}>{icon}</span>
            <span style={{ color: COLORS.muted, fontSize: ".78rem" }}>{label}:</span>
            <strong style={{ color: COLORS.dark, fontSize: ".8rem" }}>{value}</strong>
        </div>
    );
}