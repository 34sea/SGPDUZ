"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import {
    ClipboardCheck,
    FileText,
    Upload,
    Camera,
    Search,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    Archive,
    Eye,
    Download,
    Share2,
    Plus,
    Filter,
    ScanLine,
    FileCheck2,
    Timer,
    ArrowUpRight,
    Trash2,
    RefreshCw,
    Pencil,
} from "lucide-react";

import {
    getAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    getFinalGradeSheets,
    createFinalGradeSheet,
    deleteFinalGradeSheet,
    getClassSubjectTeachers,
} from "@/app/api/assessment/assessmentService";

import api from "@/app/api/api"; // Para buscar as atribuições docentes e dinâmicas

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
};

const statusSeverity = (estado: string): "success" | "warning" | "danger" | "info" => {
    switch (estado) {
        case "DENTRO_DO_PRAZO":
        case "PUBLICADO":
        case "ARQUIVADA":
        case "DIGITALIZADA":
            return "success";
        case "PENDENTE":
            return "warning";
        case "FORA_DO_PRAZO":
            return "danger";
        default:
            return "info";
    }
};

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateShort = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function AvaliacoesPautas() {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<"avaliacoes" | "pautas">("avaliacoes");

    const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
    const [pautas, setPautas] = useState<any[]>([]);
    const [classSubjectTeachers, setClassSubjectTeachers] = useState<any[]>([]);

    const [searchAvaliacao, setSearchAvaliacao] = useState("");
    const [statusAvaliacao, setStatusAvaliacao] = useState<string | null>(null);

    const [searchPauta, setSearchPauta] = useState("");
    const [epocaPauta, setEpocaPauta] = useState<string | null>(null);

    const [avaliacaoDialog, setAvaliacaoDialog] = useState(false);
    const [pautaDialog, setPautaDialog] = useState(false);

    const [isEditingAvaliacao, setIsEditingAvaliacao] = useState(false);
    const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<number | null>(null);

    const [isEditingPauta, setIsEditingPauta] = useState(false);
    const [selectedPautaId, setSelectedPautaId] = useState<number | null>(null);

    // Formulário Avaliação
    const [avaliacaoForm, setAvaliacaoForm] = useState({
        class_subject_teacher_id: null as number | null,
        title: "",
        assessment_date: new Date(),
        deadline_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        results_published_date: null as Date | null,
    });

    // Formulário Pauta com Pré-visualização
    const [pautaForm, setPautaForm] = useState({
        class_subject_teacher_id: null as number | null,
        epoch: "NORMAL",
        file: null as File | null,
        previewUrl: null as string | null,
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [assessmentsRes, pautasRes, cstRes] = await Promise.all([
                getAssessments(),
                getFinalGradeSheets().catch(() => []),
                getClassSubjectTeachers().catch(() => [])
            ]);
            setAvaliacoes(assessmentsRes || []);
            setPautas(pautasRes || []);

            setClassSubjectTeachers((cstRes || []).map((item: any) => ({
                label: `${item.class_name || 'Turma'} — ${item.subject_name} (${item.teacher_name})`,
                value: item.id
            })));

        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao carregar dados.", life: 4000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredAvaliacoes = useMemo(() => {
        return avaliacoes.filter((item) => {
            const text = searchAvaliacao.toLowerCase();
            const matchesSearch = !text || (item.title && item.title.toLowerCase().includes(text)) || (item.subject_name && item.subject_name.toLowerCase().includes(text));
            const matchesStatus = !statusAvaliacao || item.status === statusAvaliacao;
            return matchesSearch && matchesStatus;
        });
    }, [avaliacoes, searchAvaliacao, statusAvaliacao]);

    const filteredPautas = useMemo(() => {
        return pautas.filter((item) => {
            const text = searchPauta.toLowerCase();
            const matchesSearch = !text || (item.subject_name && item.subject_name.toLowerCase().includes(text));
            const matchesEpoca = !epocaPauta || item.epoch === epocaPauta;
            return matchesSearch && matchesEpoca;
        });
    }, [pautas, searchPauta, epocaPauta]);

    const totalAvaliacoes = avaliacoes.length;
    const dentroPrazo = avaliacoes.filter(item => item.status === "DENTRO_DO_PRAZO").length;
    const foraPrazo = avaliacoes.filter(item => item.status === "FORA_DO_PRAZO").length;
    const pendentes = avaliacoes.filter(item => item.status === "PENDENTE").length;
    const taxaCumprimento = totalAvaliacoes > 0 ? Math.round((dentroPrazo / totalAvaliacoes) * 100) : 0;
    const totalPautas = pautas.length;

    const handleSaveAvaliacao = async () => {
        if (!avaliacaoForm.class_subject_teacher_id || !avaliacaoForm.title || !avaliacaoForm.assessment_date || !avaliacaoForm.deadline_date) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Selecione a disciplina/turma e preencha os campos obrigatórios.", life: 3000 });
            return;
        }

        try {
            const formatDateStr = (d: Date | null) => d ? d.toISOString().split('T')[0] : '';
            const payload = {
                class_subject_teacher_id: Number(avaliacaoForm.class_subject_teacher_id),
                title: avaliacaoForm.title,
                assessment_date: formatDateStr(avaliacaoForm.assessment_date),
                deadline_date: formatDateStr(avaliacaoForm.deadline_date),
                results_published_date: formatDateStr(avaliacaoForm.results_published_date),
            };

            if (isEditingAvaliacao && selectedAvaliacaoId) {
                await updateAssessment(selectedAvaliacaoId, payload);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Avaliação atualizada com sucesso.", life: 3000 });
            } else {
                await createAssessment(payload);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Avaliação registada com sucesso.", life: 3000 });
            }

            setAvaliacaoDialog(false);
            loadData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao guardar avaliação.", life: 4000 });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPautaForm({ ...pautaForm, file, previewUrl });
        }
    };

    const handleUploadPauta = async () => {
        if (!pautaForm.class_subject_teacher_id || (!pautaForm.file && !isEditingPauta)) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Selecione a disciplina/turma e o ficheiro da pauta.", life: 3000 });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("class_subject_teacher_id", pautaForm.class_subject_teacher_id.toString());
            formData.append("epoch", pautaForm.epoch);
            if (pautaForm.file) {
                formData.append("file", pautaForm.file);
            }

            if (isEditingPauta && selectedPautaId) {
                await deleteFinalGradeSheet(selectedPautaId);
                await createFinalGradeSheet(formData);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Pauta atualizada com sucesso.", life: 3000 });
            } else {
                await createFinalGradeSheet(formData);
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Pauta final submetida com sucesso.", life: 3000 });
            }

            setPautaDialog(false);
            setPautaForm({ class_subject_teacher_id: null, epoch: "NORMAL", file: null, previewUrl: null });
            loadData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao enviar pauta.", life: 4000 });
        }
    };

    const handleDeleteAssessment = (id: number) => {
        confirmDialog({
            message: "Tem certeza que deseja eliminar esta avaliação?",
            header: "Confirmação",
            icon: <Trash2 size={18} />,
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteAssessment(id);
                    toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Avaliação eliminada.", life: 3000 });
                    loadData();
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao eliminar.", life: 4000 });
                }
            }
        });
    };

    const handleDeletePauta = (id: number) => {
        confirmDialog({
            message: "Tem certeza que deseja eliminar esta pauta final?",
            header: "Confirmação",
            icon: <Trash2 size={18} />,
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteFinalGradeSheet(id);
                    toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Pauta eliminada.", life: 3000 });
                    loadData();
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao eliminar.", life: 4000 });
                }
            }
        });
    };

    if (loading && avaliacoes.length === 0) {
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

            {/* HEADER */}
            <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div className="flex align-items-center gap-2">
                    <div className="flex align-items-center justify-content-center border-round-xl" style={{ width: 44, height: 44, background: COLORS.primaryLight }}>
                        <ClipboardCheck size={24} color={COLORS.primary} />
                    </div>
                    <div>
                        <h1 className="m-0" style={{ fontSize: "1.65rem", color: COLORS.dark, fontWeight: 700 }}>Avaliações e Pautas Finais</h1>
                        <p className="m-0 mt-1" style={{ color: COLORS.muted, fontSize: "0.9rem" }}>Gestão de avaliações, controlo de prazos regulamentares e carregamento de pautas.</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button label="Atualizar" icon={<RefreshCw size={16} />} outlined severity="secondary" onClick={loadData} />
                    <Button label="Submeter Pauta" icon={<ScanLine size={17} />} outlined onClick={() => {
                        setIsEditingPauta(false);
                        setSelectedPautaId(null);
                        setPautaForm({ class_subject_teacher_id: null, epoch: "NORMAL", file: null, previewUrl: null });
                        setPautaDialog(true);
                    }} />
                    <Button label="Nova Avaliação" icon={<Plus size={17} />} onClick={() => {
                        setIsEditingAvaliacao(false);
                        setSelectedAvaliacaoId(null);
                        setAvaliacaoForm({
                            class_subject_teacher_id: null,
                            title: "",
                            assessment_date: new Date(),
                            deadline_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            results_published_date: new Date()
                        });
                        setAvaliacaoDialog(true);
                    }} />
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid mb-4">
                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Total de avaliações</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.dark }}>{totalAvaliacoes}</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>Registadas no semestre</span>
                            </div>
                            <div className="flex align-items-center justify-content-center border-round-lg" style={{ width: 42, height: 42, background: COLORS.primaryLight }}>
                                <ClipboardCheck size={21} color={COLORS.primary} />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Dentro do prazo</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.green }}>{taxaCumprimento}%</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>Cumprimento regulamentar</span>
                            </div>
                            <div className="flex align-items-center justify-content-center border-round-lg" style={{ width: 42, height: 42, background: COLORS.greenLight }}>
                                <CheckCircle2 size={21} color={COLORS.green} />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Fora do prazo</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.red }}>{foraPrazo}</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>Requer atenção</span>
                            </div>
                            <div className="flex align-items-center justify-content-center border-round-lg" style={{ width: 42, height: 42, background: COLORS.redLight }}>
                                <AlertTriangle size={21} color={COLORS.red} />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Pautas Submetidas</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.purple }}>{totalPautas}</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>Documentos oficiais</span>
                            </div>
                            <div className="flex align-items-center justify-content-center border-round-lg" style={{ width: 42, height: 42, background: COLORS.purpleLight }}>
                                <Archive size={21} color={COLORS.purple} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* SECTION SWITCHER */}
            <div className="flex align-items-center gap-2 mb-4 p-2 border-round-xl" style={{ background: "#FFFFFF", border: `1px solid ${COLORS.border}` }}>
                <Button label="Avaliações e prazos" icon={<ClipboardCheck size={17} />} text={activeSection !== "avaliacoes"} onClick={() => setActiveSection("avaliacoes")} />
                <Button label="Pautas finais" icon={<FileText size={17} />} text={activeSection !== "pautas"} onClick={() => setActiveSection("pautas")} />
            </div>

            {/* AVALIAÇÕES */}
            {activeSection === "avaliacoes" && (
                <div className="grid">
                    <div className="col-12 xl:col-8">
                        <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                            <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                <div>
                                    <h2 className="m-0" style={{ color: COLORS.dark, fontSize: "1.15rem" }}>Gestão de Avaliações</h2>
                                    <p className="m-0 mt-1" style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Registo e acompanhamento das avaliações do período lectivo.</p>
                                </div>
                                <Button label="Registar avaliação" icon={<Plus size={16} />} size="small" onClick={() => {
                                    setIsEditingAvaliacao(false);
                                    setSelectedAvaliacaoId(null);
                                    setAvaliacaoForm({
                                        class_subject_teacher_id: null,
                                        title: "",
                                        assessment_date: new Date(),
                                        deadline_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                        results_published_date: new Date()
                                    });
                                    setAvaliacaoDialog(true);
                                }} />
                            </div>

                            <div className="grid mb-3">
                                <div className="col-12 md:col-7">
                                    <span className="p-input-icon-left w-full">
                                        <Search size={16} style={{ marginLeft: 10, color: COLORS.light }} />
                                        <InputText value={searchAvaliacao} onChange={(e) => setSearchAvaliacao(e.target.value)} placeholder="Pesquisar avaliação, UC ou docente..." className="w-full" style={{ paddingLeft: "2.3rem" }} />
                                    </span>
                                </div>
                                <div className="col-12 md:col-5">
                                    <Dropdown
                                        value={statusAvaliacao}
                                        onChange={(e) => setStatusAvaliacao(e.value)}
                                        options={[
                                            { label: "Todos os estados", value: null },
                                            { label: "Pendente", value: "PENDENTE" },
                                            { label: "Dentro do prazo", value: "DENTRO_DO_PRAZO" },
                                            { label: "Fora do prazo", value: "FORA_DO_PRAZO" },
                                        ]}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Filtrar por estado"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <DataTable value={filteredAvaliacoes} paginator rows={5} responsiveLayout="scroll" emptyMessage="Nenhuma avaliação encontrada." size="small" stripedRows>
                                <Column field="subject_name" header="Unidade Curricular" style={{ minWidth: "180px" }} />
                                <Column field="title" header="Avaliação" style={{ minWidth: "200px" }} />
                                <Column field="teacher_name" header="Docente" style={{ minWidth: "130px" }} />
                                <Column header="Realização" body={(row) => formatDate(row.assessment_date)} />
                                <Column header="Publicação" body={(row) => formatDate(row.results_published_date)} />
                                <Column header="Estado" body={(row) => <Tag value={row.status} severity={statusSeverity(row.status)} rounded />} />
                                <Column header="Ações" body={(row) => (
                                    <div className="flex gap-2">
                                        <Button icon={<Pencil size={16} />} text rounded severity="secondary" tooltip="Editar Avaliação" onClick={() => {
                                            setIsEditingAvaliacao(true);
                                            setSelectedAvaliacaoId(row.id);
                                            setAvaliacaoForm({
                                                class_subject_teacher_id: row.class_subject_teacher_id || null,
                                                title: row.title || "",
                                                assessment_date: row.assessment_date ? new Date(row.assessment_date) : new Date(),
                                                deadline_date: row.deadline_date ? new Date(row.deadline_date) : new Date(),
                                                results_published_date: row.results_published_date ? new Date(row.results_published_date) : null,
                                            });
                                            setAvaliacaoDialog(true);
                                        }} />
                                        <Button icon={<Trash2 size={16} />} text rounded severity="danger" tooltip="Eliminar" onClick={() => handleDeleteAssessment(row.id)} />
                                    </div>
                                )} />
                            </DataTable>
                        </Card>
                    </div>

                    {/* CONTROLO DE PRAZOS */}
                    <div className="col-12 xl:col-4">
                        <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14, height: "100%" }}>
                            <div className="flex align-items-center justify-content-between mb-4">
                                <div>
                                    <h2 className="m-0" style={{ fontSize: "1.15rem", color: COLORS.dark }}>Controlo de Prazos</h2>
                                    <p className="m-0 mt-1" style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Situação das avaliações registadas.</p>
                                </div>
                                <Timer size={22} color={COLORS.primary} />
                            </div>

                            <div className="flex flex-column gap-3">
                                <div className="p-3 border-round-xl" style={{ background: COLORS.greenLight }}>
                                    <div className="flex justify-content-between align-items-center">
                                        <span style={{ color: COLORS.green, fontWeight: 600 }}>Dentro do prazo</span>
                                        <strong style={{ color: COLORS.green }}>{dentroPrazo}</strong>
                                    </div>
                                </div>

                                <div className="p-3 border-round-xl" style={{ background: COLORS.orangeLight }}>
                                    <div className="flex justify-content-between align-items-center">
                                        <span style={{ color: COLORS.orange, fontWeight: 600 }}>Pendentes</span>
                                        <strong style={{ color: COLORS.orange }}>{pendentes}</strong>
                                    </div>
                                </div>

                                <div className="p-3 border-round-xl" style={{ background: COLORS.redLight }}>
                                    <div className="flex justify-content-between align-items-center">
                                        <span style={{ color: COLORS.red, fontWeight: 600 }}>Fora do prazo</span>
                                        <strong style={{ color: COLORS.red }}>{foraPrazo}</strong>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* PAUTAS FINAIS */}
            {activeSection === "pautas" && (
                <div className="grid">
                    <div className="col-12 xl:col-8">
                        <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                            <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                <div>
                                    <h2 className="m-0" style={{ fontSize: "1.15rem", color: COLORS.dark }}>Pautas Finais</h2>
                                    <p className="m-0 mt-1" style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Consulta, digitalização e arquivo das pautas finais.</p>
                                </div>
                                <Button label="Digitalizar" icon={<Camera size={16} />} onClick={() => {
                                    setIsEditingPauta(false);
                                    setSelectedPautaId(null);
                                    setPautaForm({ class_subject_teacher_id: null, epoch: "NORMAL", file: null, previewUrl: null });
                                    setPautaDialog(true);
                                }} />
                            </div>

                            <div className="grid mb-3">
                                <div className="col-12 md:col-6">
                                    <InputText value={searchPauta} onChange={(e) => setSearchPauta(e.target.value)} placeholder="Pesquisar pauta ou unidade curricular..." className="w-full" />
                                </div>
                                <div className="col-12 md:col-6">
                                    <Dropdown
                                        value={epocaPauta}
                                        onChange={(e) => setEpocaPauta(e.value)}
                                        options={[
                                            { label: "Todas as épocas", value: null },
                                            { label: "Normal", value: "NORMAL" },
                                            { label: "Recurso", value: "RECURSO" },
                                            { label: "Especial", value: "ESPECIAL" },
                                        ]}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Época"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <DataTable value={filteredPautas} paginator rows={5} responsiveLayout="scroll" emptyMessage="Nenhuma pauta encontrada." size="small" stripedRows>
                                <Column field="subject_name" header="Unidade Curricular" style={{ minWidth: "180px" }} />
                                <Column field="epoch" header="Época" />
                                <Column field="uploader_name" header="Docente / Uploader" />
                                <Column header="Data" body={(row) => formatDateShort(row.uploaded_at)} />
                                <Column header="Documento" body={(row) => {
                                    const fileUrl = row.file_url?.startsWith('http') ? row.file_url : `http://localhost:5000${row.file_url}`;
                                    return (
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex align-items-center gap-1 text-primary font-medium">
                                            <FileText size={16} /> Ver Ficheiro
                                        </a>
                                    );
                                }} />
                                <Column header="Ações" body={(row) => (
                                    <div className="flex gap-2">
                                        <Button icon={<Pencil size={16} />} text rounded severity="secondary" tooltip="Atualizar Pauta" onClick={() => {
                                            setIsEditingPauta(true);
                                            setSelectedPautaId(row.id);
                                            setPautaForm({
                                                class_subject_teacher_id: row.class_subject_teacher_id || null,
                                                epoch: row.epoch || "NORMAL",
                                                file: null,
                                                previewUrl: row.file_url?.startsWith('http') ? row.file_url : `http://localhost:5000${row.file_url}`
                                            });
                                            setPautaDialog(true);
                                        }} />
                                        <Button icon={<Trash2 size={16} />} text rounded severity="danger" tooltip="Eliminar" onClick={() => handleDeletePauta(row.id)} />
                                    </div>
                                )} />
                            </DataTable>
                        </Card>
                    </div>

                    <div className="col-12 xl:col-4">
                        <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14, height: "100%" }}>
                            <div className="flex align-items-center justify-content-between mb-4">
                                <div>
                                    <h2 className="m-0" style={{ fontSize: "1.15rem", color: COLORS.dark }}>Digitalização de Pautas</h2>
                                    <p className="m-0 mt-1" style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Captura e tratamento de documentos.</p>
                                </div>
                                <ScanLine size={23} color={COLORS.primary} />
                            </div>

                            <div className="flex flex-column align-items-center justify-content-center p-5 border-round-xl" style={{ border: `1.5px dashed ${COLORS.border}`, background: COLORS.background }}>
                                <div className="flex align-items-center justify-content-center border-circle mb-3" style={{ width: 68, height: 68, background: COLORS.primaryLight }}>
                                    <Camera size={30} color={COLORS.primary} />
                                </div>
                                <div className="font-semibold text-center" style={{ color: COLORS.dark }}>Capturar pauta física</div>
                                <Button label="Iniciar digitalização" icon={<Camera size={16} />} className="mt-4" onClick={() => {
                                    setIsEditingPauta(false);
                                    setSelectedPautaId(null);
                                    setPautaForm({ class_subject_teacher_id: null, epoch: "NORMAL", file: null, previewUrl: null });
                                    setPautaDialog(true);
                                }} />
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* DIALOG - AVALIAÇÃO (Registar / Editar) */}
            <Dialog header={isEditingAvaliacao ? "Atualizar Avaliação" : "Registar Nova Avaliação"} visible={avaliacaoDialog} onHide={() => setAvaliacaoDialog(false)} style={{ width: "600px" }} modal>
                <div className="grid">
                    <div className="col-12">
                        <label className="block mb-2 font-medium">Turma e Unidade Curricular</label>
                        <Dropdown
                            value={avaliacaoForm.class_subject_teacher_id}
                            onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, class_subject_teacher_id: e.value })}
                            options={classSubjectTeachers}
                            placeholder="Selecione a Turma e Disciplina"
                            className="w-full"
                        />
                    </div>
                    <div className="col-12">
                        <label className="block mb-2 font-medium">Título da Avaliação</label>
                        <InputText value={avaliacaoForm.title} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, title: e.target.value })} placeholder="Ex.: 1.º Teste" className="w-full" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Data de Realização</label>
                        <Calendar value={avaliacaoForm.assessment_date} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, assessment_date: e.value as Date })} showIcon dateFormat="yy-mm-dd" className="w-full" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Prazo Limite</label>
                        <Calendar value={avaliacaoForm.deadline_date} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, deadline_date: e.value as Date })} showIcon dateFormat="yy-mm-dd" className="w-full" />
                    </div>
                    <div className="col-12">
                        <label className="block mb-2 font-medium">Data de Publicação (Opcional)</label>
                        <Calendar value={avaliacaoForm.results_published_date} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, results_published_date: e.value as Date })} showIcon dateFormat="yy-mm-dd" className="w-full" />
                    </div>
                    <div className="col-12 flex justify-content-end gap-2 mt-3">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setAvaliacaoDialog(false)} />
                        <Button label={isEditingAvaliacao ? "Atualizar Avaliação" : "Registar Avaliação"} icon={<CheckCircle2 size={16} />} onClick={handleSaveAvaliacao} />
                    </div>
                </div>
            </Dialog>

            {/* DIALOG - PAUTA (Submeter / Atualizar com Pré-visualização) */}
            <Dialog header={isEditingPauta ? "Atualizar Pauta Final" : "Digitalização / Submissão de Pauta"} visible={pautaDialog} onHide={() => setPautaDialog(false)} style={{ width: "650px" }} modal>
                <div className="grid">
                    <div className="col-12">
                        <label className="block mb-2 font-medium">Turma e Unidade Curricular</label>
                        <Dropdown
                            value={pautaForm.class_subject_teacher_id}
                            onChange={(e) => setPautaForm({ ...pautaForm, class_subject_teacher_id: e.value })}
                            options={classSubjectTeachers}
                            placeholder="Selecione a Turma e Disciplina"
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Época</label>
                        <Dropdown value={pautaForm.epoch} onChange={(e) => setPautaForm({ ...pautaForm, epoch: e.value })} options={["NORMAL", "RECURSO", "ESPECIAL"]} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Ficheiro (PDF / Excel / Imagem)</label>
                        <input type="file" onChange={handleFileChange} className="w-full p-2 border-1 border-round border-300" />
                    </div>

                    {/* Pré-visualização */}
                    {pautaForm.previewUrl && (
                        <div className="col-12 mt-3 text-center">
                            <label className="block mb-2 font-medium text-left">Pré-visualização do Documento:</label>
                            {pautaForm.previewUrl.match(/\.(jpeg|jpg|png|gif)$/i) || pautaForm.file?.type.startsWith('image/') ? (
                                <img src={pautaForm.previewUrl} alt="Pré-visualização" style={{ maxWidth: "100%", maxHeight: "220px", borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                            ) : (
                                <div className="p-3 border-round border-1 border-300 bg-gray-100 flex align-items-center justify-content-center gap-2">
                                    <FileText size={24} color={COLORS.primary} />
                                    <span>{pautaForm.file ? pautaForm.file.name : "Documento atual carregado"}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="col-12 flex justify-content-end gap-2 mt-4">
                        <Button label="Cancelar" outlined severity="secondary" onClick={() => setPautaDialog(false)} />
                        <Button label={isEditingPauta ? "Atualizar Documento" : "Guardar Documento"} icon={<FileCheck2 size={16} />} onClick={handleUploadPauta} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}