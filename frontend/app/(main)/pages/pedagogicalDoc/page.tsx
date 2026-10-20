"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

import {
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Plus,
    Pencil,
    Layers3,
    Trash2,
    RefreshCw,
    Sparkles,
} from "lucide-react";

import {
    getAnalyticalPlans,
    getAnalyticalPlanById,
    createTopicUnit,
    updateTopicUnit,
    deleteTopicUnit,
    confirmDosification,
    generateWeeklyDosifications,
} from "@/app/api/pedagogical/PedagogicalManagement";

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
    text: "#334155",
    muted: "#64748B",
    border: "#E2E8F0",
    background: "#F8FAFC",
    white: "#FFFFFF",
};

const tipoAulaOptions = [
    { label: "Teórica", value: "TEORICA" },
    { label: "Prática", value: "PRATICA" },
    { label: "Laboratorial", value: "LABORATORIAL" },
    { label: "Visita de estudo", value: "VISITA_ESTUDO" },
];

const tipoLabelMap: Record<string, string> = {
    TEORICA: "Teórica",
    PRATICA: "Prática",
    LABORATORIAL: "Laboratorial",
    VISITA_ESTUDO: "Visita de estudo",
};

export default function TeacherAnalyticalPlan() {
    const toast = useRef<Toast>(null);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"plano" | "dosificacao">("plano");

    const [analyticalPlans, setAnalyticalPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [planDetails, setPlanDetails] = useState<any>({
        topic_units: [],
        weekly_dosifications: [],
    });

    const [topicDialog, setTopicDialog] = useState(false);
    const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
    const [topicForm, setTopicForm] = useState({
        title: "",
        description: "",
        planned_hours: 4,
        lesson_type: "TEORICA",
        sequence_order: 1,
    });

    // Carregar planos do docente autenticado
    const loadTeacherData = async () => {
        try {
            setLoading(true);
            const plansRes = await getAnalyticalPlans();
            setAnalyticalPlans(plansRes || []);

            if (plansRes && plansRes.length > 0 && !selectedPlanId) {
                setSelectedPlanId(plansRes[0].id);
            }
        } catch (err: any) {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: err.response?.data?.message || "Erro ao carregar os seus planos analíticos.",
                life: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeacherData();
    }, []);

    useEffect(() => {
        if (!selectedPlanId) return;
        getAnalyticalPlanById(selectedPlanId)
            .then((data) => setPlanDetails(data || { topic_units: [], weekly_dosifications: [] }))
            .catch(() => {
                toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao carregar detalhes do plano.", life: 3000 });
            });
    }, [selectedPlanId]);

    const totalCargaHoraria = useMemo(
        () => (planDetails.topic_units || []).reduce((acc: number, t: any) => acc + (t.planned_hours || 0), 0),
        [planDetails]
    );

    const confirmedCount = useMemo(
        () => (planDetails.weekly_dosifications || []).filter((w: any) => w.is_confirmed_by_teacher).length,
        [planDetails]
    );

    const totalDosifications = planDetails.weekly_dosifications?.length || 0;
    const progress = totalDosifications > 0 ? Math.round((confirmedCount / totalDosifications) * 100) : 0;

    // --- GUARDAR UNIDADE TEMÁTICA ---
    const handleSaveTopic = async () => {
        if (!selectedPlanId) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Selecione um plano analítico primeiro.", life: 3000 });
            return;
        }

        try {
            if (editingTopicId) {
                await updateTopicUnit(editingTopicId, topicForm);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Unidade temática atualizada com sucesso.", life: 3000 });
            } else {
                await createTopicUnit({
                    analytical_plan_id: selectedPlanId,
                    title: topicForm.title,
                    description: topicForm.description,
                    planned_hours: Number(topicForm.planned_hours),
                    lesson_type: topicForm.lesson_type as any,
                    sequence_order: Number(topicForm.sequence_order),
                });
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Unidade temática adicionada com sucesso.", life: 3000 });
            }
            setTopicDialog(false);
            setEditingTopicId(null);
            setTopicForm({ title: "", description: "", planned_hours: 4, lesson_type: "TEORICA", sequence_order: 1 });
            
            const updatedPlan = await getAnalyticalPlanById(selectedPlanId);
            setPlanDetails(updatedPlan);
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao guardar unidade temática.", life: 4000 });
        }
    };

    const handleDeleteTopic = async (id: number) => {
        confirmDialog({
            message: "Tem certeza que deseja eliminar esta unidade temática?",
            header: "Confirmar Eliminação",
            icon: <Trash2 size={18} />,
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteTopicUnit(id);
                    toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Unidade temática eliminada.", life: 3000 });
                    if (selectedPlanId) {
                        const updated = await getAnalyticalPlanById(selectedPlanId);
                        setPlanDetails(updated);
                    }
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao eliminar.", life: 4000 });
                }
            },
        });
    };

    // --- GERAR DOSIFICAÇÃO AUTOMÁTICA (RF14) ---
    const handleGenerateDosification = async () => {
        if (!selectedPlanId) return;
        try {
            await generateWeeklyDosifications(selectedPlanId);
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Dosificação semanal gerada automaticamente.", life: 3000 });
            const updatedPlan = await getAnalyticalPlanById(selectedPlanId);
            setPlanDetails(updatedPlan);
        } catch (err: any) {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: err.response?.data?.message || "Erro ao gerar dosificação. Certifique-se de que existem unidades temáticas cadastradas.",
                life: 4000,
            });
        }
    };

    // --- CONFIRMAR DOSIFICAÇÃO (RF15) ---
    const handleConfirmDosification = async (id: number) => {
        try {
            await confirmDosification(id);
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Dosificação semanal confirmada.", life: 3000 });
            if (selectedPlanId) {
                const updatedPlan = await getAnalyticalPlanById(selectedPlanId);
                setPlanDetails(updatedPlan);
            }
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao confirmar dosificação.", life: 4000 });
        }
    };

    if (loading && analyticalPlans.length === 0) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", padding: "1rem 1.25rem 2rem", background: COLORS.background, minHeight: "100vh" }}>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* HEADER DO DOCENTE */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 22, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.45rem", color: COLORS.dark, fontWeight: 750 }}>Meu Plano Analítico e Dosificação</h1>
                        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: "0.9rem" }}>Gestão individual de conteúdos programáticos e confirmação de dosificações</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Button label="Atualizar" icon={<RefreshCw size={16} />} outlined severity="secondary" onClick={loadTeacherData} />
                    {activeTab === "plano" && (
                        <Button
                            label="Nova Unidade Temática"
                            icon={<Plus size={17} />}
                            onClick={() => {
                                setEditingTopicId(null);
                                setTopicForm({ title: "", description: "", planned_hours: 4, lesson_type: "TEORICA", sequence_order: (planDetails.topic_units?.length || 0) + 1 });
                                setTopicDialog(true);
                            }}
                        />
                    )}
                </div>
            </div>

            {/* SELETOR DA UNIDADE CURRICULAR ATRIBUÍDA */}
            <Card style={{ marginBottom: 18, border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15, flexWrap: "wrap", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
                        <span style={{ fontWeight: 650, color: COLORS.dark, whiteSpace: "nowrap" }}>Disciplina Atribuída:</span>
                        <Dropdown
                            value={selectedPlanId}
                            options={analyticalPlans.map((p) => ({ label: `${p.subject_code} - ${p.subject_name} (Ano: ${p.academic_year || '2026'})`, value: p.id }))}
                            onChange={(e) => setSelectedPlanId(e.value)}
                            placeholder="Selecione a sua unidade curricular"
                            style={{ width: "100%", maxWidth: 450 }}
                            emptyMessage="Nenhuma disciplina atribuída ao seu perfil."
                        />
                    </div>
                    <Tag value={`Total de Tópicos: ${planDetails.topic_units?.length || 0}`} severity="info" />
                </div>
            </Card>

            {/* KPIS DO DOCENTE */}
            <div className="grid" style={{ marginBottom: 18 }}>
                <div className="col-12 md:col-6 xl:col-4">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, height: "100%" }}>
                        <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>Carga Horária Planeada</span>
                        <div style={{ fontSize: "1.65rem", fontWeight: 750, color: COLORS.dark, marginTop: 7 }}>{totalCargaHoraria} h</div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-4">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, height: "100%" }}>
                        <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>Unidades Temáticas</span>
                        <div style={{ fontSize: "1.65rem", fontWeight: 750, color: COLORS.dark, marginTop: 7 }}>{planDetails.topic_units?.length || 0}</div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-4">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, height: "100%" }}>
                        <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>Progresso da Dosificação</span>
                        <div style={{ fontSize: "1.65rem", fontWeight: 750, color: COLORS.green, marginTop: 7 }}>{progress}% Confirmado</div>
                    </div>
                </div>
            </div>

            {/* ABAS DE NAVEGAÇÃO DO DOCENTE */}
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 8, display: "flex", gap: 8, marginBottom: 18 }}>
                <button
                    onClick={() => setActiveTab("plano")}
                    style={{ border: "none", background: activeTab === "plano" ? COLORS.primary : "transparent", color: activeTab === "plano" ? COLORS.white : COLORS.text, borderRadius: 10, padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontWeight: 650 }}
                >
                    <Layers3 size={17} /> Plano Analítico e Tópicos
                </button>
                <button
                    onClick={() => setActiveTab("dosificacao")}
                    style={{ border: "none", background: activeTab === "dosificacao" ? COLORS.primary : "transparent", color: activeTab === "dosificacao" ? COLORS.white : COLORS.text, borderRadius: 10, padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontWeight: 650 }}
                >
                    <CalendarDays size={17} /> Dosificação Semanal (Confirmar)
                </button>
            </div>

            {/* CONTEÚDO DA ABA: PLANO ANALÍTICO */}
            {activeTab === "plano" && (
                <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.1rem", color: COLORS.dark }}>Unidades Temáticas da Disciplina</h2>
                            <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: "0.8rem" }}>Estrutura lógica, sequência de conteúdos e carga horária por tópico.</p>
                        </div>
                        <Button
                            label="Adicionar Tópico"
                            icon={<Plus size={15} />}
                            size="small"
                            onClick={() => {
                                setEditingTopicId(null);
                                setTopicForm({ title: "", description: "", planned_hours: 4, lesson_type: "TEORICA", sequence_order: (planDetails.topic_units?.length || 0) + 1 });
                                setTopicDialog(true);
                            }}
                        />
                    </div>

                    <DataTable value={planDetails.topic_units || []} paginator rows={6} responsiveLayout="scroll" emptyMessage="Nenhuma unidade temática registada para esta disciplina.">
                        <Column header="Ordem" field="sequence_order" style={{ width: "90px" }} body={(row) => <Tag value={`#${row.sequence_order}`} severity="info" />} />
                        <Column header="Título da Unidade Temática" field="title" body={(row) => <strong style={{ color: COLORS.dark }}>{row.title}</strong>} />
                        <Column header="Tipo de Aula" field="lesson_type" body={(row) => <Tag value={tipoLabelMap[row.lesson_type] || row.lesson_type} severity="info" />} />
                        <Column header="Carga Horária" field="planned_hours" body={(row) => `${row.planned_hours} h`} />
                        <Column
                            header="Ações"
                            body={(row) => (
                                <div style={{ display: "flex", gap: 6 }}>
                                    <Button
                                        icon={<Pencil size={15} />}
                                        text
                                        rounded
                                        severity="secondary"
                                        onClick={() => {
                                            setEditingTopicId(row.id);
                                            setTopicForm({ title: row.title, description: row.description || "", planned_hours: row.planned_hours, lesson_type: row.lesson_type, sequence_order: row.sequence_order });
                                            setTopicDialog(true);
                                        }}
                                        tooltip="Editar"
                                    />
                                    <Button
                                        icon={<Trash2 size={15} />}
                                        text
                                        rounded
                                        severity="danger"
                                        onClick={() => handleDeleteTopic(row.id)}
                                        tooltip="Eliminar"
                                    />
                                </div>
                            )}
                        />
                    </DataTable>
                </Card>
            )}

            {/* CONTEÚDO DA ABA: DOSIFICAÇÃO SEMANAL */}
            {activeTab === "dosificacao" && (
                <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.1rem", color: COLORS.dark }}>Dosificação Semanal</h2>
                            <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: "0.8rem" }}>Distribuição automática de conteúdos e confirmação pelo docente.</p>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Tag value={`${confirmedCount} de ${totalDosifications} Confirmadas`} severity={confirmedCount === totalDosifications ? "success" : "warning"} />
                            <Button
                                label="Gerar Dosificação Automática"
                                icon={<Sparkles size={15} />}
                                size="small"
                                outlined
                                onClick={handleGenerateDosification}
                                tooltip="Gera a distribuição com base nas unidades temáticas"
                            />
                        </div>
                    </div>

                    <DataTable value={planDetails.weekly_dosifications || []} paginator rows={8} responsiveLayout="scroll" emptyMessage="Nenhuma dosificação gerada. Clique em 'Gerar Dosificação Automática' para povoar as semanas.">
                        <Column header="Semana" field="week_number" body={(row) => <strong style={{ color: COLORS.primary }}>Semana {row.week_number}</strong>} />
                        <Column header="Conteúdo / Tópico Atribuído" field="topic_title" body={(row) => <span>{row.topic_title}</span>} />
                        <Column header="Tipo" field="lesson_type" body={(row) => <Tag value={tipoLabelMap[row.lesson_type] || row.lesson_type} severity="info" />} />
                        <Column header="Estado de Confirmação" body={(row) => <Tag value={row.is_confirmed_by_teacher ? "Confirmada" : "Pendente"} severity={row.is_confirmed_by_teacher ? "success" : "danger"} />} />
                        <Column
                            header="Ação do Docente"
                            body={(row) => !row.is_confirmed_by_teacher && (
                                <Button
                                    label="Confirmar"
                                    icon={<CheckCircle2 size={15} />}
                                    size="small"
                                    severity="success"
                                    onClick={() => handleConfirmDosification(row.id)}
                                />
                            )}
                        />
                    </DataTable>
                </Card>
            )}

            {/* MODAL PARA CRIAR/EDITAR UNIDADE TEMÁTICA */}
            <Dialog header={editingTopicId ? "Editar Unidade Temática" : "Nova Unidade Temática"} visible={topicDialog} onHide={() => setTopicDialog(false)} style={{ width: "580px", maxWidth: "95vw" }} modal>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Título da Unidade Temática</label>
                        <InputText value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} placeholder="Ex.: Arquiteturas e Componentes" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Descrição / Conteúdos</label>
                        <InputTextarea value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} rows={3} className="w-full" />
                    </div>
                    <div className="grid">
                        <div className="col-6">
                            <label className="block mb-1 font-semibold text-sm">Carga Horária (h)</label>
                            <InputText value={String(topicForm.planned_hours)} onChange={(e) => setTopicForm({ ...topicForm, planned_hours: Number(e.target.value) })} keyfilter="int" className="w-full" />
                        </div>
                        <div className="col-6">
                            <label className="block mb-1 font-semibold text-sm">Tipo de Aula</label>
                            <Dropdown value={topicForm.lesson_type} options={tipoAulaOptions} onChange={(e) => setTopicForm({ ...topicForm, lesson_type: e.value })} className="w-full" />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Ordem de Sequência</label>
                        <InputText value={String(topicForm.sequence_order)} onChange={(e) => setTopicForm({ ...topicForm, sequence_order: Number(e.target.value) })} keyfilter="int" className="w-full" />
                    </div>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setTopicDialog(false)} />
                        <Button label="Guardar Tópico" icon={<CheckCircle2 size={16} />} onClick={handleSaveTopic} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}