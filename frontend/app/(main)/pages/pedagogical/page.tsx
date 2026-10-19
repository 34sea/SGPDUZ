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
    GraduationCap,
    Users,
    CalendarDays,
    ClipboardList,
    Clock3,
    CheckCircle2,
    AlertCircle,
    Plus,
    Pencil,
    Eye,
    Layers3,
    School,
    Trash2,
    FileText,
    RefreshCw,
} from "lucide-react";

import {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getClasses,
    createClass,
    deleteClass,
    getAnalyticalPlans,
    getAnalyticalPlanById,
    createAnalyticalPlan,
    createTopicUnit,
    updateTopicUnit,
    deleteTopicUnit,
    confirmDosification,
} from "@/app/api/pedagogical/PedagogicalManagement";

// import { getSubjects } from "@/app/api/pedagogical/PedagogicalManagement";

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

const semestreOptions = [
    { label: "1.º Semestre", value: "1" },
    { label: "2.º Semestre", value: "2" },
];

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

export default function PedagogicalManagement() {
    const toast = useRef<Toast>(null);

    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState<"estrutura" | "plano" | "dosificacao">("estrutura");
    const [activeStructureTab, setActiveStructureTab] = useState<"unidades" | "turmas">("unidades");

    const [unidades, setUnidades] = useState<any[]>([]);
    const [turmas, setTurmas] = useState<any[]>([]);
    const [analyticalPlans, setAnalyticalPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [planDetails, setPlanDetails] = useState<any>({
        topic_units: [],
        weekly_dosifications: [],
    });

    const [selectedYear, setSelectedYear] = useState("2026");
    const [selectedSemester, setSelectedSemester] = useState("1");
    const [search, setSearch] = useState("");

    // --- DIALOGS E ESTADOS DE FORMULÁRIO (COM SUPORTE A EDIÇÃO) ---
    const [unitDialog, setUnitDialog] = useState(false);
    const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
    const [unitForm, setUnitForm] = useState({
        code: "",
        name: "",
        course_id: 1,
        workload: 64,
    });

    const [classDialog, setClassDialog] = useState(false);
    const [classForm, setClassForm] = useState({
        name: "",
        course_id: 1,
        academic_year_id: 1,
    });

    const [planDialog, setPlanDialog] = useState(false);
    const [planForm, setPlanForm] = useState({
        subject_id: null as number | null,
        academic_year_id: 1,
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

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [subjectsRes, classesRes, plansRes] = await Promise.all([
                getSubjects(),
                getClasses().catch(() => []),
                getAnalyticalPlans(),
            ]);

            setUnidades(subjectsRes);
            setTurmas(classesRes);
            setAnalyticalPlans(plansRes);

            if (plansRes.length > 0 && !selectedPlanId) {
                setSelectedPlanId(plansRes[0].id);
            }
        } catch (err: any) {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: err.response?.data?.message || "Erro ao carregar dados pedagógicos.",
                life: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!selectedPlanId) return;
        getAnalyticalPlanById(selectedPlanId)
            .then((data) => setPlanDetails(data))
            .catch(() => {
                toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao carregar detalhes do plano analítico.", life: 3000 });
            });
    }, [selectedPlanId]);

    const filteredUnidades = useMemo(() => {
        const value = search.toLowerCase().trim();
        if (!value) return unidades;
        return unidades.filter(
            (item) =>
                (item.name && item.name.toLowerCase().includes(value)) ||
                (item.code && item.code.toLowerCase().includes(value))
        );
    }, [search, unidades]);

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

    // --- GUARDAR / EDITAR UNIDADE CURRICULAR (COM RESET DE CAMPOS) ---
    const handleSaveUnit = async () => {
        if (!unitForm.code || !unitForm.name) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Código e Nome são obrigatórios.", life: 3000 });
            return;
        }

        try {
            if (editingUnitId) {
                await updateSubject(editingUnitId, unitForm);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Unidade curricular atualizada.", life: 3000 });
            } else {
                await createSubject(unitForm);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Unidade curricular criada com sucesso.", life: 3000 });
            }
            setUnitDialog(false);
            setEditingUnitId(null);
            setUnitForm({ code: "", name: "", course_id: 1, workload: 64 }); // Reset completo
            loadInitialData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao guardar unidade curricular.", life: 4000 });
        }
    };

    const handleDeleteUnit = (id: number) => {
        confirmDialog({
            message: "Tem certeza que deseja eliminar esta unidade curricular?",
            header: "Confirmar Eliminação",
            icon: <Trash2 size={18} />,
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteSubject(id);
                    toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Unidade eliminada.", life: 3000 });
                    loadInitialData();
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao eliminar.", life: 4000 });
                }
            },
        });
    };

    // --- GUARDAR TURMA ---
    const handleSaveClass = async () => {
        if (!classForm.name) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "O nome/código da turma é obrigatório.", life: 3000 });
            return;
        }
        try {
            await createClass(classForm);
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Turma criada com sucesso.", life: 3000 });
            setClassDialog(false);
            setClassForm({ name: "", course_id: 1, academic_year_id: 1 }); // Reset
            loadInitialData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao criar turma.", life: 4000 });
        }
    };

    const handleDeleteClass = (id: number) => {
        confirmDialog({
            message: "Deseja eliminar esta turma?",
            header: "Confirmação",
            acceptClassName: "p-button-danger",
            accept: async () => {
                await deleteClass(id);
                loadInitialData();
            },
        });
    };

    // --- CRIAR PLANO ANALÍTICO ---
    const handleSaveAnalyticalPlan = async () => {
        if (!planForm.subject_id) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Selecione uma unidade curricular.", life: 3000 });
            return;
        }
        try {
            await createAnalyticalPlan({ subject_id: planForm.subject_id, academic_year_id: planForm.academic_year_id });
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Plano analítico criado.", life: 3000 });
            setPlanDialog(false);
            setPlanForm({ subject_id: null, academic_year_id: 1 }); // Reset
            loadInitialData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao criar plano.", life: 4000 });
        }
    };

    // --- GUARDAR UNIDADE TEMÁTICA (COM RESET DE CAMPOS) ---
    const handleSaveTopic = async () => {
        if (!selectedPlanId) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Selecione um plano analítico primeiro.", life: 3000 });
            return;
        }

        try {
            if (editingTopicId) {
                await updateTopicUnit(editingTopicId, topicForm);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Unidade temática atualizada.", life: 3000 });
            } else {
                await createTopicUnit({
                    analytical_plan_id: selectedPlanId,
                    title: topicForm.title,
                    description: topicForm.description,
                    planned_hours: Number(topicForm.planned_hours),
                    lesson_type: topicForm.lesson_type as any,
                    sequence_order: Number(topicForm.sequence_order),
                });
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Unidade temática adicionada.", life: 3000 });
            }
            setTopicDialog(false);
            setEditingTopicId(null);
            setTopicForm({ title: "", description: "", planned_hours: 4, lesson_type: "TEORICA", sequence_order: 1 }); // Reset completo
            
            const updatedPlan = await getAnalyticalPlanById(selectedPlanId);
            setPlanDetails(updatedPlan);
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao guardar unidade temática.", life: 4000 });
        }
    };

    const handleDeleteTopic = async (id: number) => {
        confirmDialog({
            message: "Eliminar esta unidade temática?",
            header: "Confirmação",
            acceptClassName: "p-button-danger",
            accept: async () => {
                await deleteTopicUnit(id);
                if (selectedPlanId) {
                    const updated = await getAnalyticalPlanById(selectedPlanId);
                    setPlanDetails(updated);
                }
            },
        });
    };

    const handleConfirmDosification = async (id: number) => {
        try {
            await confirmDosification(id);
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Dosificação confirmada.", life: 3000 });
            if (selectedPlanId) {
                const updatedPlan = await getAnalyticalPlanById(selectedPlanId);
                setPlanDetails(updatedPlan);
            }
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao confirmar.", life: 4000 });
        }
    };

    if (loading && unidades.length === 0) {
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

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <GraduationCap size={23} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.45rem", color: COLORS.dark, fontWeight: 750 }}>Gestão Pedagógica</h1>
                        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: "0.9rem" }}>Digitalização dos Instrumentos de Gestão Pedagógica</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Button label="Atualizar" icon={<RefreshCw size={16} />} outlined severity="secondary" onClick={loadInitialData} />
                    <Button
                        label={activeModule === "estrutura" ? (activeStructureTab === "unidades" ? "Nova Unidade" : "Nova Turma") : activeModule === "plano" ? "Novo Tópico / Plano" : "Gerar Dosificação"}
                        icon={<Plus size={17} />}
                        onClick={() => {
                            if (activeModule === "estrutura") {
                                if (activeStructureTab === "unidades") {
                                    setEditingUnitId(null);
                                    setUnitForm({ code: "", name: "", course_id: 1, workload: 64 });
                                    setUnitDialog(true);
                                } else {
                                    setClassDialog(true);
                                }
                            } else if (activeModule === "plano") {
                                setEditingTopicId(null);
                                setTopicForm({ title: "", description: "", planned_hours: 4, lesson_type: "TEORICA", sequence_order: 1 });
                                setTopicDialog(true);
                            }
                        }}
                    />
                </div>
            </div>

            {/* CONTEXTO ACADÉMICO */}
            <Card style={{ marginBottom: 18, border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CalendarDays size={19} />
                        </div>
                        <div>
                            <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginBottom: 3 }}>Contexto Académico Ativo</div>
                            <strong style={{ color: COLORS.dark, fontSize: "0.95rem" }}>Ano Lectivo {selectedYear}</strong>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <Dropdown value={selectedYear} options={[{ label: "2026", value: "2026" }]} onChange={(e) => setSelectedYear(e.value)} style={{ minWidth: 120 }} />
                        <Dropdown value={selectedSemester} options={semestreOptions} onChange={(e) => setSelectedSemester(e.value)} style={{ minWidth: 145 }} />
                        <Tag value="Sistema Operacional" severity="success" />
                    </div>
                </div>
            </Card>

            {/* KPIS / INDICADORES */}
            <div className="grid" style={{ marginBottom: 18 }}>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, height: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>Unidades Curriculares</span>
                                <div style={{ fontSize: "1.65rem", fontWeight: 750, color: COLORS.dark, marginTop: 7 }}>{unidades.length}</div>
                            </div>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={21} /></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, height: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>Turmas</span>
                                <div style={{ fontSize: "1.65rem", fontWeight: 750, color: COLORS.dark, marginTop: 7 }}>{turmas.length}</div>
                            </div>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: COLORS.purpleLight, color: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={21} /></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, height: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>Unidades Temáticas</span>
                                <div style={{ fontSize: "1.65rem", fontWeight: 750, color: COLORS.dark, marginTop: 7 }}>{planDetails.topic_units?.length || 0}</div>
                            </div>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: COLORS.orangeLight, color: COLORS.orange, display: "flex", alignItems: "center", justifyContent: "center" }}><ClipboardList size={21} /></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, height: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>Dosificação Confirmada</span>
                                <div style={{ fontSize: "1.65rem", fontWeight: 750, color: COLORS.dark, marginTop: 7 }}>{progress}%</div>
                            </div>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={21} /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MÓDULOS DE NAVEGAÇÃO */}
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 8, display: "flex", gap: 8, marginBottom: 18, overflowX: "auto" }}>
                <button
                    onClick={() => setActiveModule("estrutura")}
                    style={{ border: "none", background: activeModule === "estrutura" ? COLORS.primary : "transparent", color: activeModule === "estrutura" ? COLORS.white : COLORS.text, borderRadius: 10, padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontWeight: 650, whiteSpace: "nowrap" }}
                >
                    <School size={17} /> Unidades Curriculares e Turmas
                </button>
                <button
                    onClick={() => setActiveModule("plano")}
                    style={{ border: "none", background: activeModule === "plano" ? COLORS.primary : "transparent", color: activeModule === "plano" ? COLORS.white : COLORS.text, borderRadius: 10, padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontWeight: 650, whiteSpace: "nowrap" }}
                >
                    <Layers3 size={17} /> Plano Analítico
                </button>
                <button
                    onClick={() => setActiveModule("dosificacao")}
                    style={{ border: "none", background: activeModule === "dosificacao" ? COLORS.primary : "transparent", color: activeModule === "dosificacao" ? COLORS.white : COLORS.text, borderRadius: 10, padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontWeight: 650, whiteSpace: "nowrap" }}
                >
                    <CalendarDays size={17} /> Dosificação Semanal
                </button>
            </div>

            {/* SECÇÃO 1: UNIDADES CURRICULARES E TURMAS */}
            {activeModule === "estrutura" && (
                <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, marginBottom: 18 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.15rem", color: COLORS.dark }}>Estrutura Académica e Ensino</h2>
                            <p style={{ margin: "5px 0 0", color: COLORS.muted, fontSize: "0.85rem" }}>Gerencie unidades curriculares, turmas e atribuições.</p>
                        </div>
                        <div style={{ display: "flex", gap: 6, background: COLORS.background, padding: 4, borderRadius: 9 }}>
                            <Button label="Unidades Curriculares" text={activeStructureTab !== "unidades"} onClick={() => setActiveStructureTab("unidades")} size="small" />
                            <Button label="Turmas" text={activeStructureTab !== "turmas"} onClick={() => setActiveStructureTab("turmas")} size="small" />
                        </div>
                    </div>

                    {activeStructureTab === "unidades" && (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 15, marginBottom: 14, flexWrap: "wrap" }}>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar unidade curricular..." style={{ minWidth: 320 }} />
                                </span>
                                <Button
                                    label="Nova Unidade Curricular"
                                    icon={<Plus size={16} />}
                                    onClick={() => {
                                        setEditingUnitId(null);
                                        setUnitForm({ code: "", name: "", course_id: 1, workload: 64 });
                                        setUnitDialog(true);
                                    }}
                                    size="small"
                                />
                            </div>

                            <DataTable value={filteredUnidades} paginator rows={6} responsiveLayout="scroll" emptyMessage="Nenhuma unidade encontrada.">
                                <Column header="Código" field="code" body={(row) => <span style={{ fontWeight: 700, color: COLORS.primary }}>{row.code}</span>} />
                                <Column header="Nome da Unidade" field="name" body={(row) => <span style={{ fontWeight: 600, color: COLORS.dark }}>{row.name}</span>} />
                                <Column header="Carga Horária" field="workload" body={(row) => `${row.workload || 64} h`} />
                                <Column header="Estado" body={() => <Tag value="Activa" severity="success" />} />
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
                                                    setEditingUnitId(row.id);
                                                    setUnitForm({ code: row.code, name: row.name, course_id: row.course_id || 1, workload: row.workload || 64 });
                                                    setUnitDialog(true);
                                                }}
                                                tooltip="Editar"
                                            />
                                            <Button
                                                icon={<Trash2 size={15} />}
                                                text
                                                rounded
                                                severity="danger"
                                                onClick={() => handleDeleteUnit(row.id)}
                                                tooltip="Eliminar"
                                            />
                                        </div>
                                    )}
                                />
                            </DataTable>
                        </>
                    )}

                    {activeStructureTab === "turmas" && (
                        <>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                                <Button label="Adicionar Turma" icon={<Plus size={16} />} onClick={() => setClassDialog(true)} size="small" />
                            </div>
                            <DataTable value={turmas} paginator rows={6} responsiveLayout="scroll" emptyMessage="Nenhuma turma registada.">
                                <Column header="Nome / Código da Turma" field="name" body={(row) => <strong style={{ color: COLORS.primary }}>{row.name}</strong>} />
                                <Column header="Curso ID" field="course_id" />
                                <Column
                                    header="Ações"
                                    body={(row) => (
                                        <Button icon={<Trash2 size={15} />} text rounded severity="danger" onClick={() => handleDeleteClass(row.id)} tooltip="Eliminar Turma" />
                                    )}
                                />
                            </DataTable>
                        </>
                    )}
                </Card>
            )}

            {/* SECÇÃO 2: PLANO ANALÍTICO E UNIDADES TEMÁTICAS */}
            {activeModule === "plano" && (
                <div className="grid">
                    <div className="col-12 xl:col-4">
                        <Card style={{ height: "100%", border: `1px solid ${COLORS.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                                <div style={{ width: 42, height: 42, borderRadius: 10, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Plano Analítico</h2>
                                    <span style={{ color: COLORS.muted, fontSize: "0.78rem" }}>Selecione o plano de ensino</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                    <label className="block text-sm font-semibold">Plano por Unidade</label>
                                    <Button label="Criar Novo Plano" icon={<Plus size={13} />} text size="small" onClick={() => setPlanDialog(true)} />
                                </div>
                                <Dropdown
                                    value={selectedPlanId}
                                    options={analyticalPlans.map((p) => ({ label: `${p.subject_code || ''} - ${p.subject_name || 'Unidade'} (Ano: ${p.academic_year || '2026'})`, value: p.id }))}
                                    onChange={(e) => setSelectedPlanId(e.value)}
                                    placeholder="Selecione um plano analítico"
                                    className="w-full"
                                />
                            </div>

                            <Divider />

                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                <span style={{ color: COLORS.muted }}>Carga horária total</span>
                                <strong>{totalCargaHoraria} h</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: COLORS.muted }}>Unidades temáticas</span>
                                <strong>{planDetails.topic_units?.length || 0}</strong>
                            </div>
                        </Card>
                    </div>

                    <div className="col-12 xl:col-8">
                        <Card style={{ border: `1px solid ${COLORS.border}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.1rem", color: COLORS.dark }}>Unidades Temáticas</h2>
                                    <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: "0.8rem" }}>Estrutura lógica e sequência de conteúdos</p>
                                </div>
                                <Button
                                    label="Adicionar unidade temática"
                                    icon={<Plus size={15} />}
                                    size="small"
                                    onClick={() => {
                                        setEditingTopicId(null);
                                        setTopicForm({ title: "", description: "", planned_hours: 4, lesson_type: "TEORICA", sequence_order: (planDetails.topic_units?.length || 0) + 1 });
                                        setTopicDialog(true);
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {(planDetails.topic_units || []).map((item: any, idx: number) => (
                                    <div key={item.id || idx} style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1fr) auto auto", gap: 14, alignItems: "center", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 13 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 750 }}>
                                            {item.sequence_order || idx + 1}
                                        </div>
                                        <div>
                                            <strong style={{ color: COLORS.dark, fontSize: "0.9rem" }}>{item.title}</strong>
                                            <div style={{ color: COLORS.muted, fontSize: "0.77rem", marginTop: 4 }}>{item.description || "Sem descrição"}</div>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <Tag value={tipoLabelMap[item.lesson_type] || item.lesson_type} severity="info" />
                                            <div style={{ color: COLORS.muted, fontSize: "0.72rem", marginTop: 5 }}>{item.planned_hours} h</div>
                                        </div>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <Button
                                                icon={<Pencil size={15} />}
                                                text
                                                rounded
                                                severity="secondary"
                                                onClick={() => {
                                                    setEditingTopicId(item.id);
                                                    setTopicForm({ title: item.title, description: item.description || "", planned_hours: item.planned_hours, lesson_type: item.lesson_type, sequence_order: item.sequence_order });
                                                    setTopicDialog(true);
                                                }}
                                                tooltip="Editar"
                                            />
                                            <Button
                                                icon={<Trash2 size={15} />}
                                                text
                                                rounded
                                                severity="danger"
                                                onClick={() => handleDeleteTopic(item.id)}
                                                tooltip="Eliminar"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!planDetails.topic_units || planDetails.topic_units.length === 0) && (
                                    <p style={{ color: COLORS.muted, textAlign: "center", padding: "20px" }}>Nenhuma unidade temática registada neste plano analítico.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* SECÇÃO 3: DOSIFICAÇÃO SEMANAL */}
            {activeModule === "dosificacao" && (
                <>
                    <Card style={{ marginBottom: 18, border: `1px solid ${COLORS.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15 }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.15rem", color: COLORS.dark }}>Dosificação Semanal Automática</h2>
                                <p style={{ margin: "5px 0 0", color: COLORS.muted, fontSize: "0.82rem" }}>Distribuição de conteúdos considerando o calendário e feriados.</p>
                            </div>
                            <Tag value={`${confirmedCount}/${totalDosifications} Confirmadas`} severity="success" />
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}` }}>
                        <DataTable value={planDetails.weekly_dosifications || []} paginator rows={8} responsiveLayout="scroll" emptyMessage="Nenhuma dosificação gerada para este plano.">
                            <Column header="Semana" field="week_number" body={(row) => <div style={{ fontWeight: 700 }}>Semana {row.week_number}</div>} />
                            <Column header="Tópico / Conteúdo" field="topic_title" body={(row) => <strong>{row.topic_title}</strong>} />
                            <Column header="Tipo de Aula" field="lesson_type" body={(row) => <Tag value={tipoLabelMap[row.lesson_type] || row.lesson_type} />} />
                            <Column header="Estado" body={(row) => <Tag value={row.is_confirmed_by_teacher ? "Confirmada" : "Pendente"} severity={row.is_confirmed_by_teacher ? "success" : "info"} />} />
                            <Column
                                header="Ações do Docente"
                                body={(row) => !row.is_confirmed_by_teacher && (
                                    <Button icon={<CheckCircle2 size={15} />} text rounded severity="success" tooltip="Confirmar Dosificação" onClick={() => handleConfirmDosification(row.id)} />
                                )}
                            />
                        </DataTable>
                    </Card>
                </>
            )}

            {/* --- MODAIS COM RESET DE CAMPOS CORRIGIDOS --- */}

            {/* Modal: Unidade Curricular */}
            <Dialog header={editingUnitId ? "Editar Unidade Curricular" : "Nova Unidade Curricular"} visible={unitDialog} onHide={() => setUnitDialog(false)} style={{ width: "550px", maxWidth: "95vw" }} modal>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Código</label>
                        <InputText value={unitForm.code} onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value.toUpperCase() })} placeholder="Ex.: INF301" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Nome</label>
                        <InputText value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} placeholder="Ex.: Engenharia de Software" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Carga Horária (Horas)</label>
                        <InputText value={String(unitForm.workload)} onChange={(e) => setUnitForm({ ...unitForm, workload: Number(e.target.value) })} keyfilter="int" className="w-full" />
                    </div>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setUnitDialog(false)} />
                        <Button label="Guardar" icon={<CheckCircle2 size={16} />} onClick={handleSaveUnit} />
                    </div>
                </div>
            </Dialog>

            {/* Modal: Turma */}
            <Dialog header="Nova Turma" visible={classDialog} onHide={() => setClassDialog(false)} style={{ width: "450px" }} modal>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Nome / Código da Turma</label>
                        <InputText value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="Ex.: EI31A" className="w-full" />
                    </div>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setClassDialog(false)} />
                        <Button label="Criar Turma" icon={<CheckCircle2 size={16} />} onClick={handleSaveClass} />
                    </div>
                </div>
            </Dialog>

            {/* Modal: Criar Plano Analítico */}
            <Dialog header="Criar Plano Analítico" visible={planDialog} onHide={() => setPlanDialog(false)} style={{ width: "450px" }} modal>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Selecione a Unidade Curricular</label>
                        <Dropdown
                            value={planForm.subject_id}
                            options={unidades.map((u) => ({ label: `${u.code} - ${u.name}`, value: u.id }))}
                            onChange={(e) => setPlanForm({ ...planForm, subject_id: e.value })}
                            placeholder="Selecione a unidade"
                            className="w-full"
                        />
                    </div>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setPlanDialog(false)} />
                        <Button label="Criar Plano" icon={<CheckCircle2 size={16} />} onClick={handleSaveAnalyticalPlan} />
                    </div>
                </div>
            </Dialog>

            {/* Modal: Unidade Temática */}
            <Dialog header={editingTopicId ? "Editar Unidade Temática" : "Nova Unidade Temática"} visible={topicDialog} onHide={() => setTopicDialog(false)} style={{ width: "600px", maxWidth: "95vw" }} modal>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Título da Unidade Temática</label>
                        <InputText value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} placeholder="Ex.: Introdução aos Requisitos" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Descrição dos Conteúdos</label>
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
                        <Button label="Guardar" icon={<CheckCircle2 size={16} />} onClick={handleSaveTopic} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}