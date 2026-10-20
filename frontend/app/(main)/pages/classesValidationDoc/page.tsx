"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

import {
    CalendarDays,
    BookOpen,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    CircleDot,
    ClipboardCheck,
    FileText,
    Eye,
    Pencil,
    Plus,
    ChevronLeft,
    ChevronRight,
    MessageSquareWarning,
    History,
    Send,
    ShieldCheck,
    Trash2,
    RefreshCw,
} from "lucide-react";

import {
    getLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    getConfirmationsByLesson,
    getTeacherAssignments,
} from "@/app/api/lesson/lessonService";

const COLORS = {
    primary: "#1D4ED8",
    primaryLight: "#EFF6FF",
    green: "#16A34A",
    greenLight: "#DCFCE7",
    orange: "#D97706",
    orangeLight: "#FEF3C7",
    purple: "#7C3AED",
    purpleLight: "#F3E8FF",
    cyan: "#0891B2",
    cyanLight: "#CFFAFE",
    red: "#DC2626",
    redLight: "#FEE2E2",
    dark: "#0F172A",
    text: "#334155",
    muted: "#64748B",
    light: "#94A3B8",
    border: "#E2E8F0",
    background: "#F8FAFC",
    white: "#FFFFFF",
};

const statusMapLabel: Record<string, string> = {
    REGISTADA: "Registada",
    CONFIRMADA: "Confirmada",
    CONFIRMADA_COM_RESSALVA: "Confirmada com Ressalva",
    EM_DISPUTA: "Em Disputa",
    RESOLVIDA: "Resolvida",
    PENDENTE_PROLONGADA: "Pendente Prolongada",
};

const statusSeverity = (estado: string): "success" | "warning" | "danger" | "info" => {
    switch (estado) {
        case "CONFIRMADA":
        case "RESOLVIDA":
            return "success";
        case "CONFIRMADA_COM_RESSALVA":
        case "PENDENTE_PROLONGADA":
            return "warning";
        case "EM_DISPUTA":
            return "danger";
        case "REGISTADA":
        default:
            return "info";
    }
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" });
};

export default function TeacherClassesAndAssessments() {
    const toast = useRef<Toast>(null);

    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState<"mapa" | "aulas">("mapa");

    const [aulas, setAulas] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
    const [selectedEstado, setSelectedEstado] = useState<string>("Todos");
    const [search, setSearch] = useState("");

    const [selectedAula, setSelectedAula] = useState<any | null>(null);
    const [registerDialog, setRegisterDialog] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
    const [historyDialog, setHistoryDialog] = useState(false);
    const [lessonConfirmations, setLessonConfirmations] = useState<any[]>([]);

    const initialFormState = {
        class_subject_teacher_id: null as number | null,
        topic_unit_id: null as number | null,
        lesson_date: new Date().toISOString().split('T')[0],
        content_taught: "",
        is_cancelled: false,
        cancellation_reason: "",
    };
    const [registerForm, setRegisterForm] = useState(initialFormState);

    const loadData = async () => {
        try {
            setLoading(true);
            const [lessonsRes, assignmentsRes] = await Promise.all([
                getLessons(),
                getTeacherAssignments().catch(() => [])
            ]);
            setAulas(lessonsRes || []);
            setAssignments(assignmentsRes || []);

            if (assignmentsRes && assignmentsRes.length > 0 && !selectedAssignmentId) {
                setSelectedAssignmentId(assignmentsRes[0].class_subject_teacher_id);
            }
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao carregar dados.", life: 4000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalAulas = aulas.length;
    const confirmadas = aulas.filter(a => a.status === "CONFIRMADA" || a.status === "RESOLVIDA").length;
    const pendentes = aulas.filter(a => a.status === "REGISTADA" || a.status === "PENDENTE_PROLONGADA").length;
    const canceladas = aulas.filter(a => a.is_cancelled).length;

    const aulasDoDia = useMemo(() => {
        return aulas.filter((aula) => {
            if (!aula.lesson_date) return false;
            const aulaDate = new Date(aula.lesson_date);
            const sameDay =
                aulaDate.getFullYear() === selectedDate.getFullYear() &&
                aulaDate.getMonth() === selectedDate.getMonth() &&
                aulaDate.getDate() === selectedDate.getDate();

            const assignmentMatch = !selectedAssignmentId || aula.class_subject_teacher_id === Number(selectedAssignmentId);
            const estadoMatch = selectedEstado === "Todos" || aula.status === selectedEstado;

            return sameDay && assignmentMatch && estadoMatch;
        });
    }, [aulas, selectedDate, selectedAssignmentId, selectedEstado]);

    const aulasFiltradas = useMemo(() => {
        const value = search.toLowerCase().trim();
        if (!value) return aulas;
        return aulas.filter(
            (aula) =>
                (aula.subject_name && aula.subject_name.toLowerCase().includes(value)) ||
                (aula.content_taught && aula.content_taught.toLowerCase().includes(value))
        );
    }, [aulas, search]);

    const changeDay = (amount: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + amount);
        setSelectedDate(date);
    };

    const handleSaveLesson = async () => {
        const finalTeacherId = Number(registerForm.class_subject_teacher_id || selectedAssignmentId);

        if (!finalTeacherId || isNaN(finalTeacherId)) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Selecione uma atribuição válida (Disciplina/Turma).", life: 3000 });
            return;
        }

        if (!registerForm.lesson_date || (!registerForm.content_taught && !registerForm.is_cancelled)) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Preencha a data e o conteúdo leccionado ou justifique o cancelamento.", life: 3000 });
            return;
        }

        try {
            const lessonData = {
                class_subject_teacher_id: finalTeacherId,
                topic_unit_id: registerForm.topic_unit_id ?? undefined,
                lesson_date: registerForm.lesson_date,
                content_taught: registerForm.content_taught,
                is_cancelled: registerForm.is_cancelled,
                cancellation_reason: registerForm.cancellation_reason,
            };

            if (editingLessonId !== null) {
                await updateLesson(editingLessonId, lessonData);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Registo de aula atualizado.", life: 3000 });
            } else {
                await createLesson(lessonData);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Aula registada com sucesso.", life: 3000 });
            }

            setRegisterDialog(false);
            setEditingLessonId(null);
            setRegisterForm(initialFormState);
            await loadData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao guardar registo da aula.", life: 4000 });
        }
    };

    const handleDelete = (id: number) => {
        confirmDialog({
            message: "Tem certeza que deseja eliminar este registo de aula?",
            header: "Confirmação de Eliminação",
            icon: <Trash2 size={18} />,
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteLesson(id);
                    toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Registo eliminado.", life: 3000 });
                    loadData();
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao eliminar.", life: 4000 });
                }
            }
        });
    };

    const openHistory = async (aula: any) => {
        setSelectedAula(aula);
        try {
            const history = await getConfirmationsByLesson(aula.id);
            setLessonConfirmations(history || []);
            setHistoryDialog(true);
        } catch {
            setLessonConfirmations([]);
            setHistoryDialog(true);
        }
    };

    if (loading && aulas.length === 0) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", padding: "1rem 1.25rem 2rem", boxSizing: "border-box", minHeight: "100vh", background: COLORS.background }}>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BookOpen size={23} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 750, color: COLORS.dark }}>Aulas</h1>
                        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: "0.88rem" }}>Registo individual de sumários, justificações e controle de leccionação</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Button label="Atualizar" icon={<RefreshCw size={16} />} outlined severity="secondary" onClick={loadData} />
                    <Button
                        label="Registar Aula"
                        icon={<Plus size={17} />}
                        onClick={() => {
                            setEditingLessonId(null);
                            setRegisterForm({ ...initialFormState, class_subject_teacher_id: selectedAssignmentId });
                            setRegisterDialog(true);
                        }}
                    />
                </div>
            </div>

            {/* KPIS */}
            <div className="grid" style={{ marginBottom: 18 }}>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 17 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.76rem" }}>Minhas Aulas</span>
                                <div style={{ color: COLORS.dark, fontWeight: 750, fontSize: "1.6rem", marginTop: 5 }}>{totalAulas}</div>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><CalendarDays size={20} /></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 17 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.76rem" }}>Confirmadas</span>
                                <div style={{ color: COLORS.green, fontWeight: 750, fontSize: "1.6rem", marginTop: 5 }}>{confirmadas}</div>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={20} /></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 17 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.76rem" }}>Pendentes</span>
                                <div style={{ color: COLORS.orange, fontWeight: 750, fontSize: "1.6rem", marginTop: 5 }}>{pendentes}</div>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.orangeLight, color: COLORS.orange, display: "flex", alignItems: "center", justifyContent: "center" }}><Clock3 size={20} /></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 17 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.76rem" }}>Canceladas / Não Realizadas</span>
                                <div style={{ color: COLORS.red, fontWeight: 750, fontSize: "1.6rem", marginTop: 5 }}>{canceladas}</div>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.redLight, color: COLORS.red, display: "flex", alignItems: "center", justifyContent: "center" }}><AlertTriangle size={20} /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MÓDULOS DE NAVEGAÇÃO */}
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: 7, display: "flex", gap: 7, marginBottom: 18, overflowX: "auto" }}>
                <button
                    onClick={() => setActiveModule("mapa")}
                    style={{ border: "none", borderRadius: 9, padding: "11px 17px", background: activeModule === "mapa" ? COLORS.primary : "transparent", color: activeModule === "mapa" ? COLORS.white : COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 650, whiteSpace: "nowrap" }}
                >
                    <CalendarDays size={17} /> Meu Mapa Semanal
                </button>
                <button
                    onClick={() => setActiveModule("aulas")}
                    style={{ border: "none", borderRadius: 9, padding: "11px 17px", background: activeModule === "aulas" ? COLORS.primary : "transparent", color: activeModule === "aulas" ? COLORS.white : COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 650, whiteSpace: "nowrap" }}
                >
                    <FileText size={17} /> Registos e Justificações
                </button>
            </div>

            {/* MÓDULO 1: MAPA DIÁRIO DO DOCENTE */}
            {activeModule === "mapa" && (
                <>
                    <Card style={{ border: `1px solid ${COLORS.border}`, marginBottom: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Button icon={<ChevronLeft size={17} />} text rounded severity="secondary" onClick={() => changeDay(-1)} />
                                <div style={{ textAlign: "center", minWidth: 180 }}>
                                    <div style={{ fontSize: "0.75rem", color: COLORS.muted }}>Dia Selecionado</div>
                                    <strong style={{ display: "block", color: COLORS.dark, fontSize: "1rem", marginTop: 3 }}>
                                        {selectedDate.toLocaleDateString("pt-MZ", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                                    </strong>
                                </div>
                                <Button icon={<ChevronRight size={17} />} text rounded severity="secondary" onClick={() => changeDay(1)} />
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Calendar value={selectedDate} onChange={(e) => { if (e.value instanceof Date) setSelectedDate(e.value); }} dateFormat="dd/mm/yy" showIcon />
                                <Dropdown
                                    value={selectedAssignmentId}
                                    options={assignments.map(a => ({ label: `${a.subject_code} - ${a.subject_name} (${a.class_name})`, value: a.class_subject_teacher_id }))}
                                    onChange={(e) => setSelectedAssignmentId(e.value)}
                                    placeholder="Filtrar por Disciplina/Turma"
                                    style={{ minWidth: 260 }}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.1rem", color: COLORS.dark }}>Aulas Previstas e Registadas</h2>
                                <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: "0.8rem" }}>Acompanhe o estado de confirmação e validação pelos representantes.</p>
                            </div>
                            <Tag value={`${aulasDoDia.length} aulas`} severity="info" />
                        </div>

                        {aulasDoDia.length === 0 ? (
                            <div style={{ padding: 35, textAlign: "center", color: COLORS.muted }}>Não existem aulas registadas para esta data.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {aulasDoDia.map((aula) => (
                                    <div key={aula.id} style={{ display: "grid", gridTemplateColumns: "140px 220px minmax(0,1fr) 180px auto", gap: 15, alignItems: "center", border: `1px solid ${COLORS.border}`, borderRadius: 11, padding: 14 }}>
                                        <div>
                                            <div style={{ color: COLORS.primary, fontWeight: 750 }}>{formatDate(aula.lesson_date)}</div>
                                            <div style={{ color: COLORS.muted, fontSize: "0.72rem", marginTop: 3 }}>Turma: {aula.class_name || "Geral"}</div>
                                        </div>
                                        <div>
                                            <strong style={{ color: COLORS.dark, fontSize: "0.83rem" }}>{aula.subject_name}</strong>
                                            <div style={{ color: COLORS.muted, fontSize: "0.72rem", marginTop: 3 }}>Atribuída a si</div>
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ color: COLORS.muted, fontSize: "0.72rem" }}>Conteúdo / Sumário / Justificação</div>
                                            <div style={{ color: COLORS.dark, fontSize: "0.8rem", fontWeight: 600, marginTop: 3 }}>
                                                {aula.is_cancelled ? <span style={{ color: COLORS.red }}>Cancelada: {aula.cancellation_reason}</span> : (aula.content_taught || "Pendente de sumário")}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ color: COLORS.muted, fontSize: "0.72rem", marginBottom: 5 }}>Estado</div>
                                            <Tag value={statusMapLabel[aula.status] || aula.status} severity={statusSeverity(aula.status)} />
                                        </div>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <Button icon={<Eye size={15} />} text rounded severity="secondary" tooltip="Consultar" onClick={() => setSelectedAula(aula)} />
                                            <Button icon={<History size={15} />} text rounded severity="secondary" tooltip="Histórico de Validação" onClick={() => openHistory(aula)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </>
            )}

            {/* MÓDULO 2: REGISTOS, ATUALIZAÇÃO, LEITURA E ELIMINAÇÃO (CRUD COMPLETO) */}
            {activeModule === "aulas" && (
                <Card style={{ border: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                        <div>
                            <h2 style={{ margin: 0, color: COLORS.dark, fontSize: "1.15rem" }}>Gestão</h2>
                            <p style={{ margin: "5px 0 0", color: COLORS.muted, fontSize: "0.82rem" }}>Registe, leia, atualize ou elimine os sumários das aulas leccionadas.</p>
                        </div>
                        <Button
                            label="Novo Registo"
                            icon={<Plus size={16} />}
                            onClick={() => {
                                setEditingLessonId(null);
                                setRegisterForm({ ...initialFormState, class_subject_teacher_id: selectedAssignmentId });
                                setRegisterDialog(true);
                            }}
                        />
                    </div>

                    <Divider />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, marginBottom: 14, flexWrap: "wrap" }}>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar nos meus registos..." style={{ minWidth: 320 }} />
                        </span>
                        <Tag value={`${aulasFiltradas.length} registos`} severity="info" />
                    </div>

                    <DataTable value={aulasFiltradas} paginator rows={8} responsiveLayout="scroll" emptyMessage="Nenhum registo encontrado.">
                        <Column header="Data" body={(row) => formatDate(row.lesson_date)} style={{ minWidth: "120px" }} />
                        <Column header="Unidade Curricular" field="subject_name" body={(row) => <strong style={{ color: COLORS.primary }}>{row.subject_name}</strong>} style={{ minWidth: "200px" }} />
                        <Column header="Turma" field="class_name" />
                        <Column header="Sumário / Justificação" field="content_taught" body={(row) => row.is_cancelled ? <span style={{ color: COLORS.red, fontWeight: 600 }}>Cancelada: {row.cancellation_reason}</span> : row.content_taught} style={{ minWidth: "300px" }} />
                        <Column header="Estado" body={(row) => <Tag value={statusMapLabel[row.status] || row.status} severity={statusSeverity(row.status)} />} style={{ minWidth: "160px" }} />
                        <Column
                            header="Ações"
                            body={(row) => (
                                <div style={{ display: "flex", gap: 4 }}>
                                    <Button icon={<Eye size={15} />} text rounded severity="secondary" tooltip="Consultar" onClick={() => setSelectedAula(row)} />
                                    <Button
                                        icon={<Pencil size={15} />}
                                        text
                                        rounded
                                        severity="secondary"
                                        tooltip="Editar"
                                        onClick={() => {
                                            setEditingLessonId(row.id);
                                            setRegisterForm({
                                                class_subject_teacher_id: row.class_subject_teacher_id,
                                                topic_unit_id: row.topic_unit_id,
                                                lesson_date: row.lesson_date ? row.lesson_date.split('T')[0] : '',
                                                content_taught: row.content_taught || '',
                                                is_cancelled: row.is_cancelled || false,
                                                cancellation_reason: row.cancellation_reason || '',
                                            });
                                            setRegisterDialog(true);
                                        }}
                                    />
                                    <Button icon={<Trash2 size={15} />} text rounded severity="danger" tooltip="Eliminar" onClick={() => handleDelete(row.id)} />
                                </div>
                            )}
                        />
                    </DataTable>
                </Card>
            )}

            {/* --- MODAL: REGISTAR / EDITAR AULA / JUSTIFICAR --- */}
            <Dialog header={editingLessonId ? "Editar Registo de Aula" : "Registar Aula ou Justificar Cancelamento"} visible={registerDialog} onHide={() => setRegisterDialog(false)} modal style={{ width: "650px", maxWidth: "95vw" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Disciplina e Turma</label>
                        <Dropdown
                            value={registerForm.class_subject_teacher_id}
                            options={assignments.map(a => ({ label: `${a.subject_code} - ${a.subject_name} (${a.class_name})`, value: a.class_subject_teacher_id }))}
                            onChange={(e) => setRegisterForm({ ...registerForm, class_subject_teacher_id: e.value })}
                            placeholder="Selecione a sua atribuição"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Data da Aula</label>
                        <InputText type="date" value={registerForm.lesson_date} onChange={(e) => setRegisterForm({ ...registerForm, lesson_date: e.target.value })} className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Conteúdo Efetivamente Leccionado (Sumário)</label>
                        <InputTextarea rows={4} value={registerForm.content_taught} onChange={(e) => setRegisterForm({ ...registerForm, content_taught: e.target.value })} placeholder="Descreva os tópicos abordados..." className="w-full" />
                    </div>
                    <div className="flex align-items-center gap-2">
                        <input type="checkbox" id="cancelled" checked={registerForm.is_cancelled} onChange={(e) => setRegisterForm({ ...registerForm, is_cancelled: e.target.checked })} />
                        <label htmlFor="cancelled" className="font-semibold text-sm" style={{ color: COLORS.red }}>Marcar aula como não realizada / cancelada</label>
                    </div>
                    {registerForm.is_cancelled && (
                        <div>
                            <label className="block mb-1 font-semibold text-sm">Justificação da Aula Não Realizada / Cancelada</label>
                            <InputTextarea rows={2} value={registerForm.cancellation_reason} onChange={(e) => setRegisterForm({ ...registerForm, cancellation_reason: e.target.value })} placeholder="Justifique o motivo (ex: greve, feriado, doença)..." className="w-full" />
                        </div>
                    )}
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setRegisterDialog(false)} />
                        <Button label="Guardar Registo" icon={<Send size={16} />} onClick={handleSaveLesson} />
                    </div>
                </div>
            </Dialog>

            {/* --- MODAL: DETALHES DA AULA --- */}
            <Dialog header="Detalhes do Registo" visible={!!selectedAula && !historyDialog} onHide={() => setSelectedAula(null)} modal style={{ width: "600px", maxWidth: "95vw" }}>
                {selectedAula && (
                    <div className="flex flex-column gap-3">
                        <div className="flex justify-content-between align-items-center">
                            <h3 style={{ margin: 0, color: COLORS.dark }}>{selectedAula.subject_name}</h3>
                            <Tag value={statusMapLabel[selectedAula.status] || selectedAula.status} severity={statusSeverity(selectedAula.status)} />
                        </div>
                        <Divider />
                        <div><strong>Turma:</strong> {selectedAula.class_name}</div>
                        <div><strong>Data:</strong> {formatDate(selectedAula.lesson_date)}</div>
                        <div style={{ background: COLORS.background, padding: 12, borderRadius: 8 }}>
                            <strong>Sumário / Justificação:</strong>
                            <p style={{ margin: "5px 0 0", color: COLORS.text }}>{selectedAula.is_cancelled ? <span style={{ color: COLORS.red }}>Cancelada: {selectedAula.cancellation_reason}</span> : (selectedAula.content_taught || "Nenhum sumário inserido.")}</p>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* --- MODAL: HISTÓRICO DE VALIDAÇÕES --- */}
            <Dialog header="Histórico de Confirmações pelos Representantes" visible={historyDialog} onHide={() => setHistoryDialog(false)} modal style={{ width: "650px", maxWidth: "95vw" }}>
                <div className="flex flex-column gap-3">
                    {lessonConfirmations.map((item, idx) => (
                        <div key={item.id || idx} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10 }}>
                            <div className="flex justify-content-between">
                                <strong>{item.representative_name}</strong>
                                <span style={{ fontSize: "0.75rem", color: COLORS.muted }}>{formatDate(item.created_at)}</span>
                            </div>
                            <div style={{ marginTop: 4 }}>
                                <Tag value={item.status_given} severity={item.status_given === 'CONFIRMADA' ? 'success' : 'warning'} />
                            </div>
                            {item.remarks && <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: COLORS.text }}>{item.remarks}</p>}
                        </div>
                    ))}
                    {lessonConfirmations.length === 0 && (
                        <p style={{ textAlign: "center", color: COLORS.muted }}>Nenhum registo de validação anterior para esta aula.</p>
                    )}
                </div>
            </Dialog>
        </div>
    );
}