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
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import {
    Activity,
    AlertCircle,
    ArrowDownToLine,
    BarChart3,
    BookOpen,
    CalendarDays,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Eye,
    FileCheck2,
    FileText,
    Filter,
    GraduationCap,
    Plus,
    RefreshCw,
    Search,
    Send,
    Target,
    XCircle,
    Trash2,
    UserCheck
} from "lucide-react";

import {
    getTasks,
    createTask,
    submitTaskProof,
    reviewSubmission,
    deleteTask,
    getTaskById,
    getPedagogicalMonitoringData
} from "@/app/api/activitiesPedagogicalMonitoring/activityService";
import { getUsers } from "@/app/api/users/userService";

const COLORS = {
    primary: "#1D4ED8",
    primaryLight: "#EFF6FF",
    green: "#16A34A",
    greenLight: "#DCFCE7",
    orange: "#D97706",
    orangeLight: "#FEF3C7",
    red: "#DC2626",
    redLight: "#FEE2E2",
    purple: "#7C3AED",
    purpleLight: "#F3E8FF",
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

const getTeacherSeverity = (status: string) => {
    switch (status) {
        case "Excelente":
            return "success";
        case "Bom":
            return "info";
        default:
            return "danger";
    }
};

const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function ActivitiesPedagogicalMonitoring() {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<"activities" | "monitoring">("activities");

    const [activities, setActivities] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

    const [activityDialog, setActivityDialog] = useState(false);
    const [verificationDialog, setVerificationDialog] = useState(false);
    const [submissionDialog, setSubmissionDialog] = useState(false);
    const [teacherDialog, setTeacherDialog] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [teacherFilter, setTeacherFilter] = useState<string | null>(null);

    const [feedback, setFeedback] = useState("");
    const [submissionObservation, setSubmissionObservation] = useState("");
    const [proofFile, setProofFile] = useState<File | null>(null);

    const [activityForm, setActivityForm] = useState({
        title: "",
        description: "",
        assigned_to: null as number | null,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const [monitoringData, setMonitoringData] = useState<any[]>([]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksRes, usersRes, monitoringRes] = await Promise.all([
                getTasks().catch(() => []),
                getUsers().catch(() => []),
                getPedagogicalMonitoringData().catch(() => [])
            ]);

            setActivities(tasksRes || []);

            const onlyTeachers = (usersRes || []).filter((user: any) => user.role_name === 'DOCENTE' || user.role_id === 4);
            setTeachers(onlyTeachers);
            setMonitoringData(monitoringRes || []);

            if (tasksRes && tasksRes.length > 0) {
                setSelectedActivity(tasksRes[0]);
            }
            if (monitoringRes && monitoringRes.length > 0) {
                setSelectedTeacher(monitoringRes[0]);
            } else if (onlyTeachers.length > 0) {
                setSelectedTeacher(onlyTeachers[0]);
            }
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao carregar dados.", life: 4000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Cálculo dinâmico global puro com base estrita no monitoringData da API
    const globalMonitoringStats = useMemo(() => {
        const totalAulasRealizadas = monitoringData.reduce((acc, curr) => acc + (curr.aulasRealizadas || 0), 0);
        const totalAulasPrevistas = monitoringData.reduce((acc, curr) => acc + (curr.aulasPrevistas || 0), 0);
        const percentagemAulas = totalAulasPrevistas > 0 ? Math.round((totalAulasRealizadas / totalAulasPrevistas) * 100) : 0;

        const totalAvaliacoesDentro = monitoringData.reduce((acc, curr) => acc + (curr.avaliacoesDentroPrazo || 0), 0);
        const totalAvaliacoes = monitoringData.reduce((acc, curr) => acc + (curr.avaliacoesTotal || 0), 0);
        const percentagemAvaliacoes = totalAvaliacoes > 0 ? Math.round((totalAvaliacoesDentro / totalAvaliacoes) * 100) : 0;

        const pautasEntreguesCount = monitoringData.filter(t => t.pautaFinal === "Entregue").length;
        const pautasTotalCount = monitoringData.length;
        const percentagemPautas = pautasTotalCount > 0 ? Math.round((pautasEntreguesCount / pautasTotalCount) * 100) : 0;

        const totalAtividadesEntregues = monitoringData.reduce((acc, curr) => acc + (curr.atividadesEntregues || curr.actividadesEntregues || 0), 0);
        const totalAtividades = monitoringData.reduce((acc, curr) => acc + (curr.atividadesTotal || curr.actividadesTotal || 0), 0);
        const percentagemAtividades = totalAtividades > 0 ? Math.round((totalAtividadesEntregues / totalAtividades) * 100) : 0;

        return {
            totalAulasRealizadas,
            totalAulasPrevistas,
            percentagemAulas,
            totalAvaliacoesDentro,
            totalAvaliacoes,
            percentagemAvaliacoes,
            pautasEntreguesCount,
            pautasTotalCount,
            percentagemPautas,
            totalAtividadesEntregues,
            totalAtividades,
            percentagemAtividades
        };
    }, [monitoringData]);

    const filteredActivities = useMemo(() => {
        return activities.filter((activity) => {
            const matchesSearch =
                !search ||
                (activity.title && activity.title.toLowerCase().includes(search.toLowerCase())) ||
                (activity.assigned_to_name && activity.assigned_to_name.toLowerCase().includes(search.toLowerCase()));

            const matchesStatus = !statusFilter || activity.status === statusFilter;
            const matchesTeacher = !teacherFilter || activity.assigned_to_name === teacherFilter;

            return matchesSearch && matchesStatus && matchesTeacher;
        });
    }, [activities, search, statusFilter, teacherFilter]);

    const activityStats = useMemo(() => {
        const total = activities.length;
        const pendentes = activities.filter((a) => a.status === "PENDENTE" || a.status === "Pendente").length;
        const entregues = activities.filter((a) => a.status === "ENTREGUE" || a.status === "Entregue").length;
        const verificadas = activities.filter((a) => a.status === "VERIFICADA" || a.status === "Verificada").length;
        const atrasadas = activities.filter((a) => a.status === "ATRASADA" || a.status === "Atrasada").length;

        return { total, pendentes, entregues, verificadas, atrasadas };
    }, [activities]);

    const handleSaveActivity = async () => {
        if (!activityForm.title || !activityForm.assigned_to || !activityForm.deadline) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Preencha os campos obrigatórios.", life: 3000 });
            return;
        }

        try {
            const payload = {
                title: activityForm.title,
                description: activityForm.description,
                assigned_to: Number(activityForm.assigned_to),
                deadline: activityForm.deadline.toISOString().split('T')[0]
            };
            await createTask(payload);
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Actividade atribuída com sucesso.", life: 3000 });
            setActivityDialog(false);
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
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Submissão efetuada com sucesso.", life: 3000 });
            setSubmissionDialog(false);
            setProofFile(null);
            loadData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao submeter comprovativo.", life: 4000 });
        }
    };

    const openVerificationModal = async (task: any) => {
        try {
            const fullTaskData = await getTaskById(task.id);
            setSelectedActivity(fullTaskData);
            setFeedback("");
            setVerificationDialog(true);
        } catch (err) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: "Não foi possível carregar as submissões da tarefa.", life: 3000 });
        }
    };

    const handleReviewSubmission = async (isApproved: boolean) => {
        if (!selectedActivity) return;

        try {
            const latestSubmission = selectedActivity.submissions?.[0];

            if (!latestSubmission) {
                toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Esta tarefa ainda não possui nenhuma submissão registada para ser avaliada.", life: 4000 });
                return;
            }

            await reviewSubmission(latestSubmission.id, { is_approved: isApproved, feedback });

            toast.current?.show({
                severity: "success",
                summary: "Sucesso",
                detail: isApproved ? "Actividade verificada com sucesso!" : "Feedback registado.",
                life: 3000
            });

            setVerificationDialog(false);
            loadData();
        } catch (err: any) {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: err.response?.data?.message || "Erro ao rever actividade.",
                life: 4000
            });
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
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".3rem" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.primaryLight, color: COLORS.primary }}>
                            <GraduationCap size={23} />
                        </div>
                        <h1 style={{ margin: 0, fontSize: "1.55rem", color: COLORS.dark, fontWeight: 750 }}>
                            Actividades e Acompanhamento Pedagógico
                        </h1>
                    </div>
                    <p style={{ margin: 0, color: COLORS.muted, fontSize: ".92rem" }}>
                        Gestão de actividades atribuídas, submissões, verificação e acompanhamento do cumprimento pedagógico dos docentes.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button label="Atualizar" icon={<RefreshCw size={16} />} outlined severity="secondary" onClick={loadData} />
                    <Button
                        label="Nova actividade"
                        icon={<Plus size={17} />}
                        onClick={() => setActivityDialog(true)}
                        style={{ background: COLORS.primary, borderColor: COLORS.primary }}
                    />
                </div>
            </div>

            {/* KPIS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
                <KpiCard title="Actividades" value={activityStats.total} subtitle="Total registadas" icon={<Activity size={20} />} color={COLORS.primary} background={COLORS.primaryLight} />
                <KpiCard title="Pendentes" value={activityStats.pendentes} subtitle="Aguardam submissão" icon={<Clock3 size={20} />} color={COLORS.orange} background={COLORS.orangeLight} />
                <KpiCard title="Entregues" value={activityStats.entregues} subtitle="Aguardam verificação" icon={<Send size={20} />} color={COLORS.cyan} background={COLORS.cyanLight} />
                <KpiCard title="Verificadas" value={activityStats.verificadas} subtitle="Validadas" icon={<CheckCircle2 size={20} />} color={COLORS.green} background={COLORS.greenLight} />
                <KpiCard title="Atrasadas" value={activityStats.atrasadas} subtitle="Requerem atenção" icon={<AlertCircle size={20} />} color={COLORS.red} background={COLORS.redLight} />
            </div>

            {/* ABAS DE NAVEGAÇÃO */}
            <div style={{ display: "flex", gap: ".5rem", padding: ".35rem", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "12px", width: "fit-content", marginBottom: "1rem" }}>
                <SectionButton
                    active={activeSection === "activities"}
                    icon={<Activity size={17} />}
                    label="Actividades atribuídas"
                    onClick={() => setActiveSection("activities")}
                />
                <SectionButton
                    active={activeSection === "monitoring"}
                    icon={<BarChart3 size={17} />}
                    label="Acompanhamento pedagógico"
                    onClick={() => setActiveSection("monitoring")}
                />
            </div>

            {/* SECÇÃO 1: ACTIVIDADES */}
            {activeSection === "activities" && (
                <>
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 220px 220px auto", gap: ".75rem", alignItems: "center" }}>
                            <span className="p-input-icon-left" style={{ position: "relative" }}>
                                <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                                <InputText
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Pesquisar actividade ou docente..."
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

                            <Dropdown
                                value={teacherFilter}
                                onChange={(e) => setTeacherFilter(e.value)}
                                options={teachers.map((t) => t.name)}
                                placeholder="Docente"
                                showClear
                            />

                            <Button label="Limpar" icon={<Filter size={16} />} text onClick={() => { setSearch(""); setStatusFilter(null); setTeacherFilter(null); }} />
                        </div>
                    </Card>

                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 310px", gap: "1rem", alignItems: "start" }}>
                        <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Actividades atribuídas</h2>
                                    <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Acompanhe prazos, submissões e verificações.</p>
                                </div>
                                <Tag value={`${filteredActivities.length} actividades`} severity="info" rounded />
                            </div>

                            <DataTable
                                value={filteredActivities}
                                paginator
                                rows={6}
                                responsiveLayout="scroll"
                                emptyMessage="Nenhuma actividade encontrada."
                                rowHover
                                size="small"
                                onRowClick={(e) => setSelectedActivity(e.data)}
                            >
                                <Column field="title" header="Actividade" style={{ minWidth: "230px" }} />
                                <Column field="assigned_to_name" header="Responsável" style={{ minWidth: "160px" }} />
                                <Column header="Atribuição" body={(row) => formatDate(row.created_at)} />
                                <Column header="Prazo" body={(row) => formatDate(row.deadline)} />
                                <Column header="Estado" body={(row) => <Tag value={row.status} severity={getActivitySeverity(row.status)} rounded />} />
                                <Column header="" body={(rowData) => (
                                    <div style={{ display: "flex", gap: ".35rem" }}>
                                        <Button icon={<Eye size={16} />} rounded text severity="secondary" onClick={() => setSelectedActivity(rowData)} />
                                        {(rowData.status === "PENDENTE" || rowData.status === "Pendente") && <Button icon={<Send size={16} />} rounded text severity="info" onClick={() => { setSelectedActivity(rowData); setSubmissionDialog(true); }} />}
                                        {(rowData.status === "ENTREGUE" || rowData.status === "ATRASADA") && <Button icon={<ClipboardCheck size={16} />} rounded text severity="success" onClick={() => { openVerificationModal(rowData) }} />}
                                        <Button icon={<Trash2 size={16} />} rounded text severity="danger" onClick={() => handleDelete(rowData.id)} />
                                    </div>
                                )} style={{ width: "140px" }} />
                            </DataTable>
                        </Card>

                        {/* RESUMO LATERAL */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1rem" }}>
                                    <Target size={19} color={COLORS.primary} />
                                    <h3 style={{ margin: 0, fontSize: ".98rem" }}>Estado das actividades</h3>
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
                                        <DetailRow icon={<UserCheck size={15} />} label="Docente" value={selectedActivity.assigned_to_name} />
                                        <DetailRow icon={<CalendarDays size={15} />} label="Prazo" value={formatDate(selectedActivity.deadline)} />

                                        <div style={{ display: "flex", gap: ".5rem", marginTop: "1rem" }}>
                                            {(selectedActivity.status === "PENDENTE") && (
                                                <Button label="Submeter" icon={<Send size={15} />} size="small" onClick={() => setSubmissionDialog(true)} />
                                            )}
                                            {(selectedActivity.status === "ENTREGUE" || selectedActivity.status === "ATRASADA") && (
                                                <Button label="Verificar" icon={<Check size={15} />} size="small" severity="success" onClick={() => setVerificationDialog(true)} />
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ padding: "1rem 0", textAlign: "center", color: COLORS.muted }}>
                                        <Activity size={30} style={{ opacity: 0.35, marginBottom: ".5rem" }} />
                                        <div style={{ fontSize: ".82rem" }}>Seleccione uma actividade para consultar os detalhes.</div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </>
            )}

            {/* SECÇÃO 2: ACOMPANHAMENTO PEDAGÓGICO */}
            {activeSection === "monitoring" && (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                        <MonitoringCard 
                            icon={<BookOpen size={20} />} 
                            title="Aulas realizadas" 
                            value={String(globalMonitoringStats.totalAulasRealizadas)} 
                            detail={`${globalMonitoringStats.totalAulasPrevistas} previstas`} 
                            percentage={globalMonitoringStats.percentagemAulas} 
                            color={COLORS.primary} 
                        />
                        <MonitoringCard 
                            icon={<ClipboardCheck size={20} />} 
                            title="Avaliações" 
                            value={String(globalMonitoringStats.totalAvaliacoesDentro)} 
                            detail={`${globalMonitoringStats.totalAvaliacoes} total`} 
                            percentage={globalMonitoringStats.percentagemAvaliacoes} 
                            color={COLORS.green} 
                        />
                        <MonitoringCard 
                            icon={<FileCheck2 size={20} />} 
                            title="Pautas finais" 
                            value={`${globalMonitoringStats.pautasEntreguesCount} / ${globalMonitoringStats.pautasTotalCount}`} 
                            detail="entregues" 
                            percentage={globalMonitoringStats.percentagemPautas} 
                            color={COLORS.orange} 
                        />
                        <MonitoringCard 
                            icon={<Activity size={20} />} 
                            title="Actividades" 
                            value={`${globalMonitoringStats.totalAtividadesEntregues} / ${globalMonitoringStats.totalAtividades}`} 
                            detail="entregues" 
                            percentage={globalMonitoringStats.percentagemAtividades} 
                            color={COLORS.purple} 
                        />
                    </div>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: ".75rem" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Cumprimento pedagógico por docente</h2>
                                <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Visão consolidada para Chefes de Curso e Chefes de Departamento.</p>
                            </div>
                            <div style={{ display: "flex", gap: ".5rem" }}>
                                <Dropdown
                                    value={teacherFilter}
                                    onChange={(e) => setTeacherFilter(e.value)}
                                    options={monitoringData.map((t) => t.name)}
                                    placeholder="Filtrar docente"
                                    showClear
                                />
                                <Button icon={<ArrowDownToLine size={16} />} label="Exportar" outlined />
                            </div>
                        </div>

                        <DataTable
                            value={teacherFilter ? monitoringData.filter((t: any) => t.name === teacherFilter) : monitoringData}
                            responsiveLayout="scroll"
                            rowHover
                            size="small"
                            onRowClick={(e) => { setSelectedTeacher(e.data); setTeacherDialog(true); }}
                        >
                            <Column header="Docente" body={(row) => (
                                <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                                    <Avatar label={row.name ? row.name.substring(0, 2).toUpperCase() : "DC"} shape="circle" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary, fontWeight: 700 }} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: COLORS.dark }}>{row.name}</div>
                                        <div style={{ fontSize: ".78rem", color: COLORS.muted }}>{row.email}</div>
                                    </div>
                                </div>
                            )} style={{ minWidth: "240px" }} />

                            <Column header="Aulas" body={(row) => <div><strong>{row.aulasRealizadas ?? 0}</strong><span style={{ color: COLORS.muted }}> / {row.aulasPrevistas ?? 0}</span></div>} />

                            <Column header="Avaliações" body={(row) => <div><strong>{row.avaliacoesDentroPrazo ?? 0}</strong><span style={{ color: COLORS.muted }}> / {row.avaliacoesTotal ?? 0}</span></div>} />

                            <Column header="Pauta final" body={(row) => <Tag value={row.pautaFinal ?? "Pendente"} severity={row.pautaFinal === "Entregue" ? "success" : "warning"} rounded />} />

                            <Column header="Actividades" body={(row) => <div><strong>{row.atividadesEntregues ?? row.actividadesEntregues ?? 0}</strong><span style={{ color: COLORS.muted }}> / {row.atividadesTotal ?? row.actividadesTotal ?? 0}</span></div>} />

                            <Column header="Cumprimento" body={(row) => (
                                <div style={{ minWidth: "130px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".35rem" }}>
                                        <span style={{ fontWeight: 700 }}>{row.cumprimento ?? 0}%</span>
                                        <Tag value={row.estado ?? "Pendente"} severity={getTeacherSeverity(row.estado)} rounded />
                                    </div>
                                    <ProgressBar value={row.cumprimento ?? 0} showValue={false} style={{ height: "7px" }} />
                                </div>
                            )} style={{ minWidth: "170px" }} />

                            <Column header="" body={(row) => <Button icon={<Eye size={16} />} rounded text severity="secondary" onClick={() => { setSelectedTeacher(row); setTeacherDialog(true); }} />} style={{ width: "70px" }} />
                        </DataTable>
                    </Card>
                </>
            )}

            {/* DIALOG: CRIAR ACTIVIDADE */}
            <Dialog header="Atribuir nova actividade" visible={activityDialog} onHide={() => setActivityDialog(false)} style={{ width: "min(720px, 94vw)" }} modal>
                <div style={{ display: "grid", gap: "1rem" }}>
                    <div>
                        <label className="block mb-2 font-medium">Título da actividade</label>
                        <InputText value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} placeholder="Ex.: Actualizar plano analítico" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Descrição</label>
                        <InputTextarea value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} rows={4} className="w-full" placeholder="Descreva a actividade..." />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Docente responsável</label>
                        <Dropdown value={activityForm.assigned_to} onChange={(e) => setActivityForm({ ...activityForm, assigned_to: e.value })} options={teachers} optionLabel="name" optionValue="id" placeholder="Seleccionar docente" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Prazo limite</label>
                        <Calendar value={activityForm.deadline} onChange={(e) => setActivityForm({ ...activityForm, deadline: e.value as Date })} dateFormat="yy-mm-dd" showIcon className="w-full" />
                    </div>
                    <Divider />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem" }}>
                        <Button label="Cancelar" text severity="secondary" onClick={() => setActivityDialog(false)} />
                        <Button label="Atribuir actividade" icon={<Plus size={16} />} onClick={handleSaveActivity} />
                    </div>
                </div>
            </Dialog>

            {/* DIALOG: SUBMISSÃO */}
            <Dialog header="Submeter actividade" visible={submissionDialog} onHide={() => setSubmissionDialog(false)} style={{ width: "min(600px, 94vw)" }} modal>
                {selectedActivity && (
                    <div>
                        <div style={{ padding: "1rem", background: COLORS.primaryLight, borderRadius: "10px", marginBottom: "1rem" }}>
                            <strong>{selectedActivity.title}</strong>
                            <div style={{ color: COLORS.muted, fontSize: ".8rem", marginTop: ".25rem" }}>Prazo: {formatDate(selectedActivity.deadline)}</div>
                        </div>
                        <label className="block mb-2 font-medium">Observações</label>
                        <InputTextarea value={submissionObservation} onChange={(e) => setSubmissionObservation(e.target.value)} rows={4} className="w-full" placeholder="Adicione observações sobre a entrega..." />

                        <div className="mt-3">
                            <label className="block mb-2 font-medium">Comprovativo (Ficheiro)</label>
                            <input type="file" onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)} className="w-full p-2 border-1 border-round border-300" />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem", marginTop: "1.25rem" }}>
                            <Button label="Cancelar" text severity="secondary" onClick={() => setSubmissionDialog(false)} />
                            <Button label="Marcar como entregue" icon={<Send size={16} />} onClick={handleSubmitProof} />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* DIALOG: VERIFICAÇÃO */}
            <Dialog header="Verificar actividade" visible={verificationDialog} onHide={() => setVerificationDialog(false)} style={{ width: "min(620px, 94vw)" }} modal>
                {selectedActivity && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: "1rem", background: COLORS.greenLight, borderRadius: "10px", marginBottom: "1rem" }}>
                            <CheckCircle2 size={24} color={COLORS.green} />
                            <div>
                                <strong>{selectedActivity.title}</strong>
                                <div style={{ fontSize: ".8rem", color: COLORS.muted, marginTop: ".2rem" }}>Submetida por {selectedActivity.assigned_to_name}</div>
                            </div>
                        </div>
                        <label className="block mb-2 font-medium">Feedback / observação</label>
                        <InputTextarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} className="w-full" placeholder="Registe o feedback da verificação..." />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem", marginTop: "1.25rem" }}>
                            <Button label="Rejeitar" icon={<XCircle size={16} />} outlined severity="danger" onClick={() => handleReviewSubmission(false)} />
                            <Button label="Verificar actividade" icon={<Check size={16} />} severity="success" onClick={() => handleReviewSubmission(true)} />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* DIALOG: PERFIL DOCENTE */}
            <Dialog header="Perfil e cumprimento pedagógico" visible={teacherDialog} onHide={() => setTeacherDialog(false)} style={{ width: "min(850px, 95vw)" }} modal>
                {selectedTeacher && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem", background: COLORS.background, borderRadius: "12px", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: ".9rem" }}>
                                <Avatar label={selectedTeacher.name ? selectedTeacher.name.substring(0, 2).toUpperCase() : "DC"} shape="circle" style={{ width: "58px", height: "58px", fontSize: "1rem", background: COLORS.primaryLight, color: COLORS.primary, fontWeight: 750 }} />
                                <div>
                                    <h3 style={{ margin: 0, color: COLORS.dark }}>{selectedTeacher.name}</h3>
                                    <div style={{ color: COLORS.muted, fontSize: ".8rem", marginTop: ".2rem" }}>{selectedTeacher.email}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: COLORS.primary }}>{selectedTeacher.cumprimento ?? 0}%</div>
                                <Tag value={selectedTeacher.estado ?? "Pendente"} severity={getTeacherSeverity(selectedTeacher.estado)} rounded />
                            </div>
                        </div>

                        <Divider />
                        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Indicadores de cumprimento</h3>
                        <ProfileProgress 
                            label="Aulas leccionadas" 
                            value={selectedTeacher.aulasPrevistas > 0 ? Math.round((selectedTeacher.aulasRealizadas / selectedTeacher.aulasPrevistas) * 100) : 0} 
                            detail={`${selectedTeacher.aulasRealizadas ?? 0} realizadas de ${selectedTeacher.aulasPrevistas ?? 0}`} 
                            color={COLORS.primary} 
                        />
                        <ProfileProgress 
                            label="Avaliações dentro do prazo" 
                            value={selectedTeacher.avaliacoesTotal > 0 ? Math.round((selectedTeacher.avaliacoesDentroPrazo / selectedTeacher.avaliacoesTotal) * 100) : 0} 
                            detail={`${selectedTeacher.avaliacoesDentroPrazo ?? 0} dentro do prazo`} 
                            color={COLORS.green} 
                        />
                        <ProfileProgress 
                            label="Actividades entregues" 
                            value={(selectedTeacher.atividadesTotal || selectedTeacher.actividadesTotal) > 0 ? Math.round(((selectedTeacher.atividadesEntregues || selectedTeacher.actividadesEntregues || 0) / (selectedTeacher.atividadesTotal || selectedTeacher.actividadesTotal)) * 100) : 0} 
                            detail={`${selectedTeacher.atividadesEntregues || selectedTeacher.actividadesEntregues || 0} entregues de ${selectedTeacher.atividadesTotal || selectedTeacher.actividadesTotal || 0}`} 
                            color={COLORS.purple} 
                        />
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

function SectionButton({ active, icon, label, onClick }: any) {
    return (
        <button type="button" onClick={onClick} style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: ".5rem", padding: ".65rem 1rem", borderRadius: "9px", background: active ? COLORS.primary : "transparent", color: active ? COLORS.white : COLORS.muted, fontWeight: active ? 650 : 500, transition: "all .2s ease" }}>
            {icon}
            {label}
        </button>
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

function MonitoringCard({ icon, title, value, detail, percentage, color }: any) {
    return (
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".8rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", background: `${color}15`, color }}>
                    {icon}
                </div>
                <span style={{ fontSize: ".8rem", color: COLORS.muted }}>{title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: ".5rem" }}>
                <strong style={{ fontSize: "1.5rem", color: COLORS.dark }}>{value}</strong>
                <span style={{ fontSize: ".72rem", color: COLORS.muted }}>{detail}</span>
            </div>
            <div style={{ marginTop: ".7rem", height: "6px", background: COLORS.background, borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: "10px" }} />
            </div>
        </div>
    );
}

function ProfileProgress({ label, value, detail, color }: any) {
    return (
        <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".35rem" }}>
                <span style={{ fontSize: ".8rem", fontWeight: 600 }}>{label}</span>
                <strong style={{ fontSize: ".8rem", color }}>{value}%</strong>
            </div>
            <div style={{ height: "8px", background: COLORS.background, borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: "10px" }} />
            </div>
            <div style={{ marginTop: ".3rem", fontSize: ".7rem", color: COLORS.muted }}>{detail}</div>
        </div>
    );
}