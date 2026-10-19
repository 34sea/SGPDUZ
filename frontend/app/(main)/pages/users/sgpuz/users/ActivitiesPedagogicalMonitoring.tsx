"use client";

import React, { useMemo, useState } from "react";

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
    MessageSquare,
    Paperclip,
    Plus,
    Search,
    Send,
    Target,
    TrendingUp,
    Upload,
    UserCheck,
    Users,
    XCircle
} from "lucide-react";


// =========================================================
// CORES
// =========================================================

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


// =========================================================
// TIPOS
// =========================================================

type ActivityStatus =
    | "Pendente"
    | "Entregue"
    | "Verificada"
    | "Atrasada";

type TeacherStatus = "Excelente" | "Bom" | "Atenção";

interface PedagogicalActivity {
    id: number;
    titulo: string;
    descricao: string;
    responsavel: string;
    docente: string;
    dataAtribuicao: Date;
    prazo: Date;
    estado: ActivityStatus;
    observacoes?: string;
    anexo?: string;
}

interface TeacherMonitoring {
    id: number;
    nome: string;
    email: string;
    departamento: string;
    curso: string;
    avatar: string;

    aulasPrevistas: number;
    aulasRealizadas: number;
    aulasPendentes: number;

    avaliacoesTotal: number;
    avaliacoesDentroPrazo: number;
    avaliacoesForaPrazo: number;

    pautaFinal: "Entregue" | "Pendente";

    actividadesTotal: number;
    actividadesEntregues: number;
    actividadesAtrasadas: number;

    cumprimento: number;
    estado: TeacherStatus;
}


// =========================================================
// DADOS SIMULADOS
// =========================================================

const initialActivities: PedagogicalActivity[] = [
    {
        id: 1,
        titulo: "Actualizar Plano Analítico",
        descricao:
            "Rever e actualizar o plano analítico da unidade curricular para o novo semestre.",
        responsavel: "Chefe de Curso",
        docente: "Jane Smith",
        dataAtribuicao: new Date(2026, 8, 2),
        prazo: new Date(2026, 8, 12),
        estado: "Verificada",
        observacoes: "Documento actualizado e validado.",
        anexo: "plano_analitico_2026.pdf"
    },
    {
        id: 2,
        titulo: "Submeter Dosificação Semestral",
        descricao:
            "Submeter a dosificação das unidades temáticas para validação.",
        responsavel: "Chefe de Curso",
        docente: "Daniel Miller",
        dataAtribuicao: new Date(2026, 8, 5),
        prazo: new Date(2026, 8, 18),
        estado: "Entregue",
        observacoes: "Dosificação submetida para análise.",
        anexo: "dosificacao_semestre.pdf"
    },
    {
        id: 3,
        titulo: "Relatório de Actividades Pedagógicas",
        descricao:
            "Elaborar relatório das actividades pedagógicas realizadas durante o mês.",
        responsavel: "Chefe de Departamento",
        docente: "Olivia Taylor",
        dataAtribuicao: new Date(2026, 8, 1),
        prazo: new Date(2026, 8, 15),
        estado: "Atrasada"
    },
    {
        id: 4,
        titulo: "Registo de Avaliações",
        descricao:
            "Registar todas as avaliações realizadas na plataforma.",
        responsavel: "Chefe de Curso",
        docente: "John Doe",
        dataAtribuicao: new Date(2026, 8, 10),
        prazo: new Date(2026, 8, 25),
        estado: "Pendente"
    },
    {
        id: 5,
        titulo: "Entrega da Pauta Final",
        descricao:
            "Submeter a pauta final da unidade curricular após conclusão da avaliação.",
        responsavel: "Chefe de Departamento",
        docente: "Sarah Davis",
        dataAtribuicao: new Date(2026, 7, 25),
        prazo: new Date(2026, 8, 10),
        estado: "Atrasada"
    },
    {
        id: 6,
        titulo: "Plano de Recuperação",
        descricao:
            "Preparar plano de recuperação para estudantes com aproveitamento insuficiente.",
        responsavel: "Chefe de Curso",
        docente: "Alex Johnson",
        dataAtribuicao: new Date(2026, 8, 8),
        prazo: new Date(2026, 8, 28),
        estado: "Pendente"
    }
];


const teachers: TeacherMonitoring[] = [
    {
        id: 1,
        nome: "Jane Smith",
        email: "jane.smith@example.com",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        avatar: "JS",

        aulasPrevistas: 48,
        aulasRealizadas: 46,
        aulasPendentes: 2,

        avaliacoesTotal: 6,
        avaliacoesDentroPrazo: 6,
        avaliacoesForaPrazo: 0,

        pautaFinal: "Entregue",

        actividadesTotal: 5,
        actividadesEntregues: 5,
        actividadesAtrasadas: 0,

        cumprimento: 96,
        estado: "Excelente"
    },
    {
        id: 2,
        nome: "Daniel Miller",
        email: "daniel.miller@example.com",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        avatar: "DM",

        aulasPrevistas: 52,
        aulasRealizadas: 48,
        aulasPendentes: 4,

        avaliacoesTotal: 7,
        avaliacoesDentroPrazo: 6,
        avaliacoesForaPrazo: 1,

        pautaFinal: "Entregue",

        actividadesTotal: 6,
        actividadesEntregues: 5,
        actividadesAtrasadas: 1,

        cumprimento: 88,
        estado: "Bom"
    },
    {
        id: 3,
        nome: "Olivia Taylor",
        email: "olivia.taylor@example.com",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        avatar: "OT",

        aulasPrevistas: 45,
        aulasRealizadas: 39,
        aulasPendentes: 6,

        avaliacoesTotal: 5,
        avaliacoesDentroPrazo: 3,
        avaliacoesForaPrazo: 2,

        pautaFinal: "Pendente",

        actividadesTotal: 5,
        actividadesEntregues: 3,
        actividadesAtrasadas: 2,

        cumprimento: 73,
        estado: "Atenção"
    },
    {
        id: 4,
        nome: "John Doe",
        email: "john.doe@example.com",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        avatar: "JD",

        aulasPrevistas: 50,
        aulasRealizadas: 49,
        aulasPendentes: 1,

        avaliacoesTotal: 6,
        avaliacoesDentroPrazo: 6,
        avaliacoesForaPrazo: 0,

        pautaFinal: "Entregue",

        actividadesTotal: 4,
        actividadesEntregues: 4,
        actividadesAtrasadas: 0,

        cumprimento: 98,
        estado: "Excelente"
    },
    {
        id: 5,
        nome: "Sarah Davis",
        email: "sarah.davis@example.com",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        avatar: "SD",

        aulasPrevistas: 47,
        aulasRealizadas: 43,
        aulasPendentes: 4,

        avaliacoesTotal: 5,
        avaliacoesDentroPrazo: 4,
        avaliacoesForaPrazo: 1,

        pautaFinal: "Pendente",

        actividadesTotal: 5,
        actividadesEntregues: 4,
        actividadesAtrasadas: 1,

        cumprimento: 84,
        estado: "Bom"
    }
];


// =========================================================
// HELPERS
// =========================================================

const formatDate = (date?: Date | null) => {
    if (!date) return "-";

    return date.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};


const getActivitySeverity = (status: ActivityStatus) => {
    switch (status) {
        case "Verificada":
            return "success";

        case "Entregue":
            return "info";

        case "Atrasada":
            return "danger";

        default:
            return "warning";
    }
};


const getTeacherSeverity = (status: TeacherStatus) => {
    switch (status) {
        case "Excelente":
            return "success";

        case "Bom":
            return "info";

        default:
            return "warning";
    }
};


// =========================================================
// COMPONENTE
// =========================================================

export default function ActivitiesPedagogicalMonitoring() {
    const [activeSection, setActiveSection] = useState<
        "activities" | "monitoring"
    >("activities");

    const [activities, setActivities] =
        useState<PedagogicalActivity[]>(initialActivities);

    const [selectedActivity, setSelectedActivity] =
        useState<PedagogicalActivity | null>(null);

    const [selectedTeacher, setSelectedTeacher] =
        useState<TeacherMonitoring | null>(teachers[0]);

    const [activityDialog, setActivityDialog] = useState(false);

    const [verificationDialog, setVerificationDialog] =
        useState(false);

    const [submissionDialog, setSubmissionDialog] =
        useState(false);

    const [teacherDialog, setTeacherDialog] =
        useState(false);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState<ActivityStatus | null>(null);

    const [teacherFilter, setTeacherFilter] =
        useState<string | null>(null);

    const [feedback, setFeedback] = useState("");

    const [submissionObservation, setSubmissionObservation] =
        useState("");

    const [activityForm, setActivityForm] = useState({
        titulo: "",
        descricao: "",
        docente: "",
        dataAtribuicao: null as Date | null,
        prazo: null as Date | null,
        anexo: ""
    });


    // =====================================================
    // FILTROS
    // =====================================================

    const filteredActivities = useMemo(() => {
        return activities.filter((activity) => {
            const matchesSearch =
                activity.titulo
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                activity.docente
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                !statusFilter ||
                activity.estado === statusFilter;

            const matchesTeacher =
                !teacherFilter ||
                activity.docente === teacherFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesTeacher
            );
        });
    }, [
        activities,
        search,
        statusFilter,
        teacherFilter
    ]);


    // =====================================================
    // KPIs
    // =====================================================

    const activityStats = useMemo(() => {
        const total = activities.length;

        const pendentes = activities.filter(
            (a) => a.estado === "Pendente"
        ).length;

        const entregues = activities.filter(
            (a) => a.estado === "Entregue"
        ).length;

        const verificadas = activities.filter(
            (a) => a.estado === "Verificada"
        ).length;

        const atrasadas = activities.filter(
            (a) => a.estado === "Atrasada"
        ).length;

        return {
            total,
            pendentes,
            entregues,
            verificadas,
            atrasadas
        };
    }, [activities]);


    // =====================================================
    // CRIAR ACTIVIDADE
    // =====================================================

    const openCreateActivity = () => {
        setActivityForm({
            titulo: "",
            descricao: "",
            docente: "",
            dataAtribuicao: new Date(),
            prazo: null,
            anexo: ""
        });

        setActivityDialog(true);
    };


    const saveActivity = () => {
        if (
            !activityForm.titulo ||
            !activityForm.docente ||
            !activityForm.dataAtribuicao ||
            !activityForm.prazo
        ) {
            return;
        }

        const newActivity: PedagogicalActivity = {
            id: Date.now(),
            titulo: activityForm.titulo,
            descricao: activityForm.descricao,
            responsavel: "Chefe de Curso",
            docente: activityForm.docente,
            dataAtribuicao: activityForm.dataAtribuicao,
            prazo: activityForm.prazo,
            estado: "Pendente",
            anexo: activityForm.anexo || undefined
        };

        setActivities((prev) => [
            newActivity,
            ...prev
        ]);

        setActivityDialog(false);
    };


    // =====================================================
    // SUBMISSÃO
    // =====================================================

    const openSubmission = (
        activity: PedagogicalActivity
    ) => {
        setSelectedActivity(activity);
        setSubmissionObservation("");
        setSubmissionDialog(true);
    };


    const submitActivity = () => {
        if (!selectedActivity) return;

        setActivities((prev) =>
            prev.map((activity) =>
                activity.id === selectedActivity.id
                    ? {
                        ...activity,
                        estado: "Entregue",
                        observacoes:
                            submissionObservation ||
                            "Actividade submetida pelo docente."
                    }
                    : activity
            )
        );

        setSubmissionDialog(false);
    };


    // =====================================================
    // VERIFICAÇÃO
    // =====================================================

    const openVerification = (
        activity: PedagogicalActivity
    ) => {
        setSelectedActivity(activity);
        setFeedback("");
        setVerificationDialog(true);
    };


    const verifyActivity = () => {
        if (!selectedActivity) return;

        setActivities((prev) =>
            prev.map((activity) =>
                activity.id === selectedActivity.id
                    ? {
                        ...activity,
                        estado: "Verificada",
                        observacoes:
                            feedback ||
                            "Actividade verificada pelo responsável."
                    }
                    : activity
            )
        );

        setVerificationDialog(false);
    };


    // =====================================================
    // ACTIVITY TABLE
    // =====================================================

    const activityStatusBody = (
        rowData: PedagogicalActivity
    ) => (
        <Tag
            value={rowData.estado}
            severity={getActivitySeverity(
                rowData.estado
            )}
            rounded
        />
    );


    const delayBody = (
        rowData: PedagogicalActivity
    ) => {
        if (rowData.estado === "Atrasada") {
            return (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".4rem",
                        color: COLORS.red,
                        fontWeight: 600
                    }}
                >
                    <AlertCircle size={16} />
                    Em atraso
                </div>
            );
        }

        if (
            rowData.estado === "Pendente" &&
            rowData.prazo < new Date()
        ) {
            return (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".4rem",
                        color: COLORS.red,
                        fontWeight: 600
                    }}
                >
                    <Clock3 size={16} />
                    Prazo ultrapassado
                </div>
            );
        }

        return (
            <span
                style={{
                    color: COLORS.muted
                }}
            >
                Dentro do prazo
            </span>
        );
    };


    const activityActionsBody = (
        rowData: PedagogicalActivity
    ) => (
        <div
            style={{
                display: "flex",
                gap: ".35rem"
            }}
        >
            <Button
                icon={<Eye size={16} />}
                rounded
                text
                severity="secondary"
                tooltip="Consultar"
                onClick={() => {
                    setSelectedActivity(rowData);
                    setTeacherDialog(false);
                }}
            />

            {rowData.estado === "Pendente" && (
                <Button
                    icon={<Send size={16} />}
                    rounded
                    text
                    severity="info"
                    tooltip="Submeter"
                    onClick={() =>
                        openSubmission(rowData)
                    }
                />
            )}

            {rowData.estado === "Entregue" && (
                <Button
                    icon={<ClipboardCheck size={16} />}
                    rounded
                    text
                    severity="success"
                    tooltip="Verificar"
                    onClick={() =>
                        openVerification(rowData)
                    }
                />
            )}

            {rowData.estado === "Atrasada" && (
                <Button
                    icon={<ClipboardCheck size={16} />}
                    rounded
                    text
                    severity="warning"
                    tooltip="Verificar"
                    onClick={() =>
                        openVerification(rowData)
                    }
                />
            )}
        </div>
    );


    // =====================================================
    // TEACHER TABLE
    // =====================================================

    const teacherNameBody = (
        rowData: TeacherMonitoring
    ) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: ".75rem"
            }}
        >
            <Avatar
                label={rowData.avatar}
                shape="circle"
                style={{
                    backgroundColor:
                        COLORS.primaryLight,
                    color: COLORS.primary,
                    fontWeight: 700
                }}
            />

            <div>
                <div
                    style={{
                        fontWeight: 700,
                        color: COLORS.dark
                    }}
                >
                    {rowData.nome}
                </div>

                <div
                    style={{
                        fontSize: ".78rem",
                        color: COLORS.muted
                    }}
                >
                    {rowData.email}
                </div>
            </div>
        </div>
    );


    const complianceBody = (
        rowData: TeacherMonitoring
    ) => (
        <div
            style={{
                minWidth: "130px"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: ".35rem"
                }}
            >
                <span
                    style={{
                        fontWeight: 700
                    }}
                >
                    {rowData.cumprimento}%
                </span>

                <Tag
                    value={rowData.estado}
                    severity={getTeacherSeverity(
                        rowData.estado
                    )}
                    rounded
                />
            </div>

            <ProgressBar
                value={rowData.cumprimento}
                showValue={false}
                style={{
                    height: "7px"
                }}
            />
        </div>
    );


    const lessonsBody = (
        rowData: TeacherMonitoring
    ) => (
        <div>
            <strong>
                {rowData.aulasRealizadas}
            </strong>
            <span
                style={{
                    color: COLORS.muted
                }}
            >
                {" "}
                / {rowData.aulasPrevistas}
            </span>

            {rowData.aulasPendentes > 0 && (
                <div
                    style={{
                        fontSize: ".75rem",
                        color: COLORS.orange,
                        marginTop: ".2rem"
                    }}
                >
                    {rowData.aulasPendentes} pendentes
                </div>
            )}
        </div>
    );


    const evaluationsBody = (
        rowData: TeacherMonitoring
    ) => (
        <div>
            <div>
                <strong>
                    {rowData.avaliacoesDentroPrazo}
                </strong>
                <span
                    style={{
                        color: COLORS.muted
                    }}
                >
                    {" "}
                    / {rowData.avaliacoesTotal}
                </span>
            </div>

            {rowData.avaliacoesForaPrazo > 0 && (
                <div
                    style={{
                        color: COLORS.red,
                        fontSize: ".75rem"
                    }}
                >
                    {rowData.avaliacoesForaPrazo} fora do prazo
                </div>
            )}
        </div>
    );


    const activitiesTeacherBody = (
        rowData: TeacherMonitoring
    ) => (
        <div>
            <div>
                <strong>
                    {rowData.actividadesEntregues}
                </strong>
                <span
                    style={{
                        color: COLORS.muted
                    }}
                >
                    {" "}
                    / {rowData.actividadesTotal}
                </span>
            </div>

            {rowData.actividadesAtrasadas > 0 && (
                <div
                    style={{
                        color: COLORS.red,
                        fontSize: ".75rem"
                    }}
                >
                    {rowData.actividadesAtrasadas} atrasadas
                </div>
            )}
        </div>
    );


    const finalGradeBody = (
        rowData: TeacherMonitoring
    ) => (
        <Tag
            value={rowData.pautaFinal}
            severity={
                rowData.pautaFinal === "Entregue"
                    ? "success"
                    : "warning"
            }
            rounded
        />
    );


    const teacherActionsBody = (
        rowData: TeacherMonitoring
    ) => (
        <Button
            icon={<Eye size={16} />}
            rounded
            text
            severity="secondary"
            tooltip="Ver perfil pedagógico"
            onClick={() => {
                setSelectedTeacher(rowData);
                setTeacherDialog(true);
            }}
        />
    );


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "none",
                margin: 0,
                padding: "1rem 1.25rem 2rem",
                boxSizing: "border-box",
                background: COLORS.background,
                minHeight: "100vh"
            }}
        >

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    marginBottom: "1.25rem",
                    flexWrap: "wrap"
                }}
            >
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".65rem",
                            marginBottom: ".3rem"
                        }}
                    >
                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                    COLORS.primaryLight,
                                color: COLORS.primary
                            }}
                        >
                            <GraduationCap
                                size={23}
                            />
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                fontSize: "1.55rem",
                                color: COLORS.dark,
                                fontWeight: 750
                            }}
                        >
                            Actividades e Acompanhamento
                            Pedagógico
                        </h1>
                    </div>

                    <p
                        style={{
                            margin: 0,
                            color: COLORS.muted,
                            fontSize: ".92rem"
                        }}
                    >
                        Gestão de actividades atribuídas,
                        submissões, verificação e acompanhamento
                        do cumprimento pedagógico dos docentes.
                    </p>
                </div>

                <Button
                    label="Nova actividade"
                    icon={<Plus size={17} />}
                    onClick={openCreateActivity}
                    style={{
                        background: COLORS.primary,
                        borderColor: COLORS.primary
                    }}
                />
            </div>


            {/* ================================================= */}
            {/* KPIs */}
            {/* ================================================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(5, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1.25rem"
                }}
            >

                <KpiCard
                    title="Actividades"
                    value={activityStats.total}
                    subtitle="Total registadas"
                    icon={<Activity size={20} />}
                    color={COLORS.primary}
                    background={COLORS.primaryLight}
                />

                <KpiCard
                    title="Pendentes"
                    value={activityStats.pendentes}
                    subtitle="Aguardam submissão"
                    icon={<Clock3 size={20} />}
                    color={COLORS.orange}
                    background={COLORS.orangeLight}
                />

                <KpiCard
                    title="Entregues"
                    value={activityStats.entregues}
                    subtitle="Aguardam verificação"
                    icon={<Send size={20} />}
                    color={COLORS.cyan}
                    background={COLORS.cyanLight}
                />

                <KpiCard
                    title="Verificadas"
                    value={activityStats.verificadas}
                    subtitle="Validadas"
                    icon={<CheckCircle2 size={20} />}
                    color={COLORS.green}
                    background={COLORS.greenLight}
                />

                <KpiCard
                    title="Atrasadas"
                    value={activityStats.atrasadas}
                    subtitle="Requerem atenção"
                    icon={<AlertCircle size={20} />}
                    color={COLORS.red}
                    background={COLORS.redLight}
                />

            </div>


            {/* ================================================= */}
            {/* NAVEGAÇÃO */}
            {/* ================================================= */}

            <div
                style={{
                    display: "flex",
                    gap: ".5rem",
                    padding: ".35rem",
                    background: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "12px",
                    width: "fit-content",
                    marginBottom: "1rem"
                }}
            >
                <SectionButton
                    active={
                        activeSection === "activities"
                    }
                    icon={<Activity size={17} />}
                    label="Actividades atribuídas"
                    onClick={() =>
                        setActiveSection("activities")
                    }
                />

                <SectionButton
                    active={
                        activeSection === "monitoring"
                    }
                    icon={<BarChart3 size={17} />}
                    label="Acompanhamento pedagógico"
                    onClick={() =>
                        setActiveSection("monitoring")
                    }
                />
            </div>


            {/* ================================================= */}
            {/* ACTIVIDADES */}
            {/* ================================================= */}

            {activeSection === "activities" && (
                <>
                    {/* FILTROS */}

                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                            marginBottom: "1rem"
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(250px, 1fr) 220px 220px auto",
                                gap: ".75rem",
                                alignItems: "center"
                            }}
                        >
                            <span
                                className="p-input-icon-left"
                                style={{
                                    position: "relative"
                                }}
                            >
                                <Search
                                    size={17}
                                    style={{
                                        position: "absolute",
                                        left: ".8rem",
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        color: COLORS.light,
                                        zIndex: 2
                                    }}
                                />

                                <InputText
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Pesquisar actividade ou docente..."
                                    style={{
                                        width: "100%",
                                        paddingLeft: "2.5rem"
                                    }}
                                />
                            </span>

                            <Dropdown
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.value
                                    )
                                }
                                options={[
                                    {
                                        label: "Todos os estados",
                                        value: null
                                    },
                                    {
                                        label: "Pendente",
                                        value: "Pendente"
                                    },
                                    {
                                        label: "Entregue",
                                        value: "Entregue"
                                    },
                                    {
                                        label: "Verificada",
                                        value: "Verificada"
                                    },
                                    {
                                        label: "Atrasada",
                                        value: "Atrasada"
                                    }
                                ]}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Estado"
                                showClear
                            />

                            <Dropdown
                                value={teacherFilter}
                                onChange={(e) =>
                                    setTeacherFilter(
                                        e.value
                                    )
                                }
                                options={[
                                    ...teachers.map(
                                        (teacher) =>
                                            teacher.nome
                                    )
                                ]}
                                placeholder="Docente"
                                showClear
                            />

                            <Button
                                label="Limpar"
                                icon={<Filter size={16} />}
                                text
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter(null);
                                    setTeacherFilter(null);
                                }}
                            />
                        </div>
                    </Card>


                    {/* CONTEÚDO PRINCIPAL */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "minmax(0, 1fr) 310px",
                            gap: "1rem",
                            alignItems: "start"
                        }}
                    >

                        {/* TABELA */}

                        <Card
                            style={{
                                border: `1px solid ${COLORS.border}`,
                                boxShadow: "none"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center",
                                    marginBottom: "1rem"
                                }}
                            >
                                <div>
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: "1.05rem",
                                            color: COLORS.dark
                                        }}
                                    >
                                        Actividades atribuídas
                                    </h2>

                                    <p
                                        style={{
                                            margin:
                                                ".25rem 0 0",
                                            color:
                                                COLORS.muted,
                                            fontSize:
                                                ".82rem"
                                        }}
                                    >
                                        Acompanhe prazos,
                                        submissões e
                                        verificações.
                                    </p>
                                </div>

                                <Tag
                                    value={`${filteredActivities.length} actividades`}
                                    severity="info"
                                    rounded
                                />
                            </div>

                            <DataTable
                                value={filteredActivities}
                                paginator
                                rows={6}
                                responsiveLayout="scroll"
                                emptyMessage="Nenhuma actividade encontrada."
                                rowHover
                                size="small"
                                // onRowClick={(e) =>
                                //     setSelectedActivity(
                                //         e.data
                                //     )
                                // }
                            >
                                <Column
                                    field="titulo"
                                    header="Actividade"
                                    style={{
                                        minWidth: "230px"
                                    }}
                                />

                                <Column
                                    field="docente"
                                    header="Responsável"
                                    style={{
                                        minWidth: "160px"
                                    }}
                                />

                                <Column
                                    header="Atribuição"
                                    body={(row) =>
                                        formatDate(
                                            row.dataAtribuicao
                                        )
                                    }
                                />

                                <Column
                                    header="Prazo"
                                    body={(row) =>
                                        formatDate(
                                            row.prazo
                                        )
                                    }
                                />

                                <Column
                                    header="Estado"
                                    body={
                                        activityStatusBody
                                    }
                                />

                                <Column
                                    header="Atraso"
                                    body={delayBody}
                                />

                                <Column
                                    header=""
                                    body={
                                        activityActionsBody
                                    }
                                    style={{
                                        width: "120px"
                                    }}
                                />
                            </DataTable>
                        </Card>


                        {/* RESUMO LATERAL */}

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem"
                            }}
                        >

                            <Card
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none"
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: ".6rem",
                                        marginBottom:
                                            "1rem"
                                    }}
                                >
                                    <Target
                                        size={19}
                                        color={
                                            COLORS.primary
                                        }
                                    />

                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize:
                                                ".98rem"
                                        }}
                                    >
                                        Estado das actividades
                                    </h3>
                                </div>

                                <ActivitySummaryRow
                                    label="Pendentes"
                                    value={
                                        activityStats.pendentes
                                    }
                                    total={
                                        activityStats.total
                                    }
                                    color={
                                        COLORS.orange
                                    }
                                />

                                <ActivitySummaryRow
                                    label="Entregues"
                                    value={
                                        activityStats.entregues
                                    }
                                    total={
                                        activityStats.total
                                    }
                                    color={
                                        COLORS.cyan
                                    }
                                />

                                <ActivitySummaryRow
                                    label="Verificadas"
                                    value={
                                        activityStats.verificadas
                                    }
                                    total={
                                        activityStats.total
                                    }
                                    color={
                                        COLORS.green
                                    }
                                />

                                <ActivitySummaryRow
                                    label="Atrasadas"
                                    value={
                                        activityStats.atrasadas
                                    }
                                    total={
                                        activityStats.total
                                    }
                                    color={
                                        COLORS.red
                                    }
                                />
                            </Card>


                            {/* ACTIVIDADE SELECCIONADA */}

                            <Card
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none"
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "flex-start"
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius:
                                                "10px",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            background:
                                                COLORS.primaryLight,
                                            color:
                                                COLORS.primary
                                        }}
                                    >
                                        <FileText
                                            size={18}
                                        />
                                    </div>

                                    {selectedActivity && (
                                        <Tag
                                            value={
                                                selectedActivity.estado
                                            }
                                            severity={getActivitySeverity(
                                                selectedActivity.estado
                                            )}
                                            rounded
                                        />
                                    )}
                                </div>

                                {selectedActivity ? (
                                    <>
                                        <h3
                                            style={{
                                                fontSize:
                                                    ".98rem",
                                                color:
                                                    COLORS.dark,
                                                margin:
                                                    "1rem 0 .35rem"
                                            }}
                                        >
                                            {
                                                selectedActivity.titulo
                                            }
                                        </h3>

                                        <p
                                            style={{
                                                fontSize:
                                                    ".82rem",
                                                color:
                                                    COLORS.muted,
                                                lineHeight:
                                                    1.5,
                                                margin:
                                                    "0 0 1rem"
                                            }}
                                        >
                                            {
                                                selectedActivity.descricao
                                            }
                                        </p>

                                        <DetailRow
                                            icon={
                                                <UserCheck
                                                    size={
                                                        15
                                                    }
                                                />
                                            }
                                            label="Docente"
                                            value={
                                                selectedActivity.docente
                                            }
                                        />

                                        <DetailRow
                                            icon={
                                                <CalendarDays
                                                    size={
                                                        15
                                                    }
                                                />
                                            }
                                            label="Prazo"
                                            value={formatDate(
                                                selectedActivity.prazo
                                            )}
                                        />

                                        {selectedActivity.anexo && (
                                            <div
                                                style={{
                                                    marginTop:
                                                        "1rem",
                                                    padding:
                                                        ".65rem",
                                                    background:
                                                        COLORS.background,
                                                    borderRadius:
                                                        "8px",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: ".5rem",
                                                    fontSize:
                                                        ".78rem"
                                                }}
                                            >
                                                <Paperclip
                                                    size={
                                                        15
                                                    }
                                                    color={
                                                        COLORS.primary
                                                    }
                                                />

                                                {
                                                    selectedActivity.anexo
                                                }
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap: ".5rem",
                                                marginTop:
                                                    "1rem"
                                            }}
                                        >
                                            {selectedActivity.estado ===
                                                "Pendente" && (
                                                <Button
                                                    label="Submeter"
                                                    icon={
                                                        <Send
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    }
                                                    size="small"
                                                    onClick={() =>
                                                        openSubmission(
                                                            selectedActivity
                                                        )
                                                    }
                                                />
                                            )}

                                            {(selectedActivity.estado ===
                                                "Entregue" ||
                                                selectedActivity.estado ===
                                                    "Atrasada") && (
                                                <Button
                                                    label="Verificar"
                                                    icon={
                                                        <Check
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    }
                                                    size="small"
                                                    severity="success"
                                                    onClick={() =>
                                                        openVerification(
                                                            selectedActivity
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        style={{
                                            padding:
                                                "1rem 0",
                                            textAlign:
                                                "center",
                                            color:
                                                COLORS.muted
                                        }}
                                    >
                                        <Activity
                                            size={30}
                                            style={{
                                                opacity:
                                                    0.35,
                                                marginBottom:
                                                    ".5rem"
                                            }}
                                        />

                                        <div
                                            style={{
                                                fontSize:
                                                    ".82rem"
                                            }}
                                        >
                                            Seleccione uma
                                            actividade para
                                            consultar os
                                            detalhes.
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </>
            )}


            {/* ================================================= */}
            {/* ACOMPANHAMENTO */}
            {/* ================================================= */}

            {activeSection === "monitoring" && (
                <>
                    {/* INDICADORES CONSOLIDADOS */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(4, minmax(180px, 1fr))",
                            gap: "1rem",
                            marginBottom: "1rem"
                        }}
                    >
                        <MonitoringCard
                            icon={
                                <BookOpen
                                    size={20}
                                />
                            }
                            title="Aulas realizadas"
                            value="225"
                            detail="242 previstas"
                            percentage={93}
                            color={COLORS.primary}
                        />

                        <MonitoringCard
                            icon={
                                <ClipboardCheck
                                    size={20}
                                />
                            }
                            title="Avaliações"
                            value="25"
                            detail="29 dentro do prazo"
                            percentage={86}
                            color={COLORS.green}
                        />

                        <MonitoringCard
                            icon={
                                <FileCheck2
                                    size={20}
                                />
                            }
                            title="Pautas finais"
                            value="3 / 5"
                            detail="entregues"
                            percentage={60}
                            color={COLORS.orange}
                        />

                        <MonitoringCard
                            icon={
                                <Activity
                                    size={20}
                                />
                            }
                            title="Actividades"
                            value="21 / 25"
                            detail="entregues"
                            percentage={84}
                            color={COLORS.purple}
                        />
                    </div>


                    {/* TABELA DE DOCENTES */}

                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom: "1rem",
                                flexWrap: "wrap",
                                gap: ".75rem"
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize:
                                            "1.05rem",
                                        color:
                                            COLORS.dark
                                    }}
                                >
                                    Cumprimento pedagógico
                                    por docente
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            ".25rem 0 0",
                                        color:
                                            COLORS.muted,
                                        fontSize:
                                            ".82rem"
                                    }}
                                >
                                    Visão consolidada para
                                    Chefes de Curso e
                                    Chefes de Departamento.
                                </p>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: ".5rem"
                                }}
                            >
                                <Dropdown
                                    value={teacherFilter}
                                    onChange={(e) =>
                                        setTeacherFilter(
                                            e.value
                                        )
                                    }
                                    options={[
                                        ...teachers.map(
                                            (teacher) =>
                                                teacher.nome
                                        )
                                    ]}
                                    placeholder="Filtrar docente"
                                    showClear
                                />

                                <Button
                                    icon={
                                        <ArrowDownToLine
                                            size={16}
                                        />
                                    }
                                    label="Exportar"
                                    outlined
                                />
                            </div>
                        </div>

                        <DataTable
                            value={
                                teacherFilter
                                    ? teachers.filter(
                                        (teacher) =>
                                            teacher.nome ===
                                            teacherFilter
                                    )
                                    : teachers
                            }
                            responsiveLayout="scroll"
                            rowHover
                            size="small"
                            // onRowClick={(e) => {
                            //     setSelectedTeacher(
                            //         e.data
                            //     );
                            //     setTeacherDialog(true);
                            // }}
                        >
                            <Column
                                header="Docente"
                                body={teacherNameBody}
                                style={{
                                    minWidth: "240px"
                                }}
                            />

                            <Column
                                header="Aulas"
                                body={lessonsBody}
                            />

                            <Column
                                header="Avaliações"
                                body={
                                    evaluationsBody
                                }
                            />

                            <Column
                                header="Pauta final"
                                body={
                                    finalGradeBody
                                }
                            />

                            <Column
                                header="Actividades"
                                body={
                                    activitiesTeacherBody
                                }
                            />

                            <Column
                                header="Cumprimento"
                                body={
                                    complianceBody
                                }
                                style={{
                                    minWidth: "170px"
                                }}
                            />

                            <Column
                                header=""
                                body={
                                    teacherActionsBody
                                }
                                style={{
                                    width: "70px"
                                }}
                            />
                        </DataTable>
                    </Card>


                    {/* ALERTAS PEDAGÓGICOS */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(3, minmax(0, 1fr))",
                            gap: "1rem",
                            marginTop: "1rem"
                        }}
                    >

                        <AlertCard
                            icon={
                                <AlertCircle
                                    size={19}
                                />
                            }
                            title="Aulas pendentes"
                            value="17"
                            description="aulas previstas ainda não registadas."
                            color={COLORS.orange}
                            background={
                                COLORS.orangeLight
                            }
                        />

                        <AlertCard
                            icon={
                                <Clock3 size={19} />
                            }
                            title="Avaliações fora do prazo"
                            value="4"
                            description="avaliações necessitam de acompanhamento."
                            color={COLORS.red}
                            background={
                                COLORS.redLight
                            }
                        />

                        <AlertCard
                            icon={
                                <Activity size={19} />
                            }
                            title="Actividades atrasadas"
                            value="4"
                            description="actividades atribuídas encontram-se em atraso."
                            color={COLORS.purple}
                            background={
                                COLORS.purpleLight
                            }
                        />
                    </div>
                </>
            )}


            {/* ================================================= */}
            {/* DIALOG - NOVA ACTIVIDADE */}
            {/* ================================================= */}

            <Dialog
                header="Atribuir nova actividade"
                visible={activityDialog}
                onHide={() =>
                    setActivityDialog(false)
                }
                style={{
                    width: "min(720px, 94vw)"
                }}
                modal
            >
                <div
                    style={{
                        display: "grid",
                        gap: "1rem"
                    }}
                >
                    <div>
                        <label className="block mb-2 font-medium">
                            Título da actividade
                        </label>

                        <InputText
                            value={
                                activityForm.titulo
                            }
                            onChange={(e) =>
                                setActivityForm(
                                    (prev) => ({
                                        ...prev,
                                        titulo:
                                            e.target.value
                                    })
                                )
                            }
                            placeholder="Ex.: Actualizar plano analítico"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">
                            Descrição
                        </label>

                        <InputTextarea
                            value={
                                activityForm.descricao
                            }
                            onChange={(e) =>
                                setActivityForm(
                                    (prev) => ({
                                        ...prev,
                                        descricao:
                                            e.target.value
                                    })
                                )
                            }
                            rows={4}
                            className="w-full"
                            placeholder="Descreva a actividade..."
                        />
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "1rem"
                        }}
                    >
                        <div>
                            <label className="block mb-2 font-medium">
                                Docente responsável
                            </label>

                            <Dropdown
                                value={
                                    activityForm.docente
                                }
                                onChange={(e) =>
                                    setActivityForm(
                                        (prev) => ({
                                            ...prev,
                                            docente:
                                                e.value
                                        })
                                    )
                                }
                                options={teachers.map(
                                    (teacher) =>
                                        teacher.nome
                                )}
                                placeholder="Seleccionar docente"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">
                                Anexo
                            </label>

                            <InputText
                                value={
                                    activityForm.anexo
                                }
                                onChange={(e) =>
                                    setActivityForm(
                                        (prev) => ({
                                            ...prev,
                                            anexo:
                                                e.target
                                                    .value
                                        })
                                    )
                                }
                                placeholder="ficheiro.pdf"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "1rem"
                        }}
                    >
                        <div>
                            <label className="block mb-2 font-medium">
                                Data de atribuição
                            </label>

                            <Calendar
                                value={
                                    activityForm.dataAtribuicao
                                }
                                // onChange={(e) =>
                                //     setActivityForm(
                                //         (prev) => ({
                                //             ...prev,
                                //             dataAtribuicao:
                                //                 e.value as Date
                                //         })
                                //     }
                                // }
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">
                                Prazo
                            </label>

                            <Calendar
                                value={
                                    activityForm.prazo
                                }
                                onChange={(e) =>
                                    setActivityForm(
                                        (prev) => ({
                                            ...prev,
                                            prazo:
                                                e.value as Date
                                        })
                                    )
                                }
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="w-full"
                            />
                        </div>
                    </div>

                    <Divider />

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "flex-end",
                            gap: ".5rem"
                        }}
                    >
                        <Button
                            label="Cancelar"
                            text
                            severity="secondary"
                            onClick={() =>
                                setActivityDialog(
                                    false
                                )
                            }
                        />

                        <Button
                            label="Atribuir actividade"
                            icon={
                                <Plus size={16} />
                            }
                            onClick={saveActivity}
                        />
                    </div>
                </div>
            </Dialog>


            {/* ================================================= */}
            {/* DIALOG - SUBMISSÃO */}
            {/* ================================================= */}

            <Dialog
                header="Submeter actividade"
                visible={submissionDialog}
                onHide={() =>
                    setSubmissionDialog(false)
                }
                style={{
                    width: "min(600px, 94vw)"
                }}
                modal
            >
                {selectedActivity && (
                    <div>
                        <div
                            style={{
                                padding: "1rem",
                                background:
                                    COLORS.primaryLight,
                                borderRadius: "10px",
                                marginBottom: "1rem"
                            }}
                        >
                            <strong>
                                {
                                    selectedActivity.titulo
                                }
                            </strong>

                            <div
                                style={{
                                    color:
                                        COLORS.muted,
                                    fontSize:
                                        ".8rem",
                                    marginTop:
                                        ".25rem"
                                }}
                            >
                                Prazo:{" "}
                                {formatDate(
                                    selectedActivity.prazo
                                )}
                            </div>
                        </div>

                        <label className="block mb-2 font-medium">
                            Observações
                        </label>

                        <InputTextarea
                            value={
                                submissionObservation
                            }
                            onChange={(e) =>
                                setSubmissionObservation(
                                    e.target.value
                                )
                            }
                            rows={4}
                            className="w-full"
                            placeholder="Adicione observações sobre a entrega..."
                        />

                        <div
                            style={{
                                border:
                                    `1px dashed ${COLORS.border}`,
                                borderRadius:
                                    "10px",
                                padding: "1rem",
                                marginTop: "1rem",
                                textAlign:
                                    "center",
                                color:
                                    COLORS.muted
                            }}
                        >
                            <Upload
                                size={22}
                                style={{
                                    marginBottom:
                                        ".4rem"
                                }}
                            />

                            <div
                                style={{
                                    fontSize:
                                        ".82rem"
                                }}
                            >
                                Anexar comprovativo da
                                actividade
                            </div>
                        </div>

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                                gap: ".5rem",
                                marginTop:
                                    "1.25rem"
                            }}
                        >
                            <Button
                                label="Cancelar"
                                text
                                severity="secondary"
                                onClick={() =>
                                    setSubmissionDialog(
                                        false
                                    )
                                }
                            />

                            <Button
                                label="Marcar como entregue"
                                icon={
                                    <Send
                                        size={16}
                                    />
                                }
                                onClick={
                                    submitActivity
                                }
                            />
                        </div>
                    </div>
                )}
            </Dialog>


            {/* ================================================= */}
            {/* DIALOG - VERIFICAÇÃO */}
            {/* ================================================= */}

            <Dialog
                header="Verificar actividade"
                visible={verificationDialog}
                onHide={() =>
                    setVerificationDialog(false)
                }
                style={{
                    width: "min(620px, 94vw)"
                }}
                modal
            >
                {selectedActivity && (
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: ".75rem",
                                padding: "1rem",
                                background:
                                    COLORS.greenLight,
                                borderRadius:
                                    "10px",
                                marginBottom:
                                    "1rem"
                            }}
                        >
                            <CheckCircle2
                                size={24}
                                color={
                                    COLORS.green
                                }
                            />

                            <div>
                                <strong>
                                    {
                                        selectedActivity.titulo
                                    }
                                </strong>

                                <div
                                    style={{
                                        fontSize:
                                            ".8rem",
                                        color:
                                            COLORS.muted,
                                        marginTop:
                                            ".2rem"
                                    }}
                                >
                                    Submetida por{" "}
                                    {
                                        selectedActivity.docente
                                    }
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "1rem",
                                border:
                                    `1px solid ${COLORS.border}`,
                                borderRadius:
                                    "10px",
                                marginBottom:
                                    "1rem"
                            }}
                        >
                            <div
                                style={{
                                    fontSize:
                                        ".75rem",
                                    color:
                                        COLORS.muted,
                                    marginBottom:
                                        ".35rem"
                                }}
                            >
                                Comprovativo
                            </div>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: ".5rem"
                                }}
                            >
                                <Paperclip
                                    size={16}
                                    color={
                                        COLORS.primary
                                    }
                                />

                                {selectedActivity.anexo ||
                                    "comprovativo_actividade.pdf"}
                            </div>
                        </div>

                        <label className="block mb-2 font-medium">
                            Feedback / observação
                        </label>

                        <InputTextarea
                            value={feedback}
                            onChange={(e) =>
                                setFeedback(
                                    e.target.value
                                )
                            }
                            rows={4}
                            className="w-full"
                            placeholder="Registe o feedback da verificação..."
                        />

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                                gap: ".5rem",
                                marginTop:
                                    "1.25rem"
                            }}
                        >
                            <Button
                                label="Rejeitar"
                                icon={
                                    <XCircle
                                        size={16}
                                    />
                                }
                                outlined
                                severity="danger"
                            />

                            <Button
                                label="Verificar actividade"
                                icon={
                                    <Check
                                        size={16}
                                    />
                                }
                                severity="success"
                                onClick={
                                    verifyActivity
                                }
                            />
                        </div>
                    </div>
                )}
            </Dialog>


            {/* ================================================= */}
            {/* DIALOG - PERFIL DOCENTE */}
            {/* ================================================= */}

            <Dialog
                header="Perfil e cumprimento pedagógico"
                visible={teacherDialog}
                onHide={() =>
                    setTeacherDialog(false)
                }
                style={{
                    width: "min(850px, 95vw)"
                }}
                modal
            >
                {selectedTeacher && (
                    <TeacherProfile
                        teacher={selectedTeacher}
                    />
                )}
            </Dialog>

        </div>
    );
}


// =========================================================
// COMPONENTE KPI
// =========================================================

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    background: string;
}

function KpiCard({
    title,
    value,
    subtitle,
    icon,
    color,
    background
}: KpiCardProps) {
    return (
        <div
            style={{
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "12px",
                padding: "1rem",
                minHeight: "110px"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "flex-start"
                }}
            >
                <div>
                    <div
                        style={{
                            color: COLORS.muted,
                            fontSize: ".78rem",
                            marginBottom:
                                ".35rem"
                        }}
                    >
                        {title}
                    </div>

                    <div
                        style={{
                            fontSize: "1.55rem",
                            fontWeight: 750,
                            color: COLORS.dark
                        }}
                    >
                        {value}
                    </div>
                </div>

                <div
                    style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        background,
                        color
                    }}
                >
                    {icon}
                </div>
            </div>

            <div
                style={{
                    marginTop: ".55rem",
                    color: COLORS.muted,
                    fontSize: ".73rem"
                }}
            >
                {subtitle}
            </div>
        </div>
    );
}


// =========================================================
// SECTION BUTTON
// =========================================================

interface SectionButtonProps {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

function SectionButton({
    active,
    icon,
    label,
    onClick
}: SectionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                padding: ".65rem 1rem",
                borderRadius: "9px",
                background: active
                    ? COLORS.primary
                    : "transparent",
                color: active
                    ? COLORS.white
                    : COLORS.muted,
                fontWeight: active
                    ? 650
                    : 500,
                transition:
                    "all .2s ease"
            }}
        >
            {icon}
            {label}
        </button>
    );
}


// =========================================================
// ACTIVITY SUMMARY
// =========================================================

interface ActivitySummaryRowProps {
    label: string;
    value: number;
    total: number;
    color: string;
}

function ActivitySummaryRow({
    label,
    value,
    total,
    color
}: ActivitySummaryRowProps) {
    const percentage =
        total > 0
            ? Math.round(
                (value / total) * 100
            )
            : 0;

    return (
        <div
            style={{
                marginBottom: "1rem"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    marginBottom:
                        ".35rem"
                }}
            >
                <span
                    style={{
                        fontSize: ".8rem",
                        color:
                            COLORS.text
                    }}
                >
                    {label}
                </span>

                <strong
                    style={{
                        fontSize: ".8rem"
                    }}
                >
                    {value}
                </strong>
            </div>

            <div
                style={{
                    height: "7px",
                    background:
                        COLORS.background,
                    borderRadius: "10px",
                    overflow:
                        "hidden"
                }}
            >
                <div
                    style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: color,
                        borderRadius:
                            "10px"
                    }}
                />
            </div>
        </div>
    );
}


// =========================================================
// DETAIL ROW
// =========================================================

interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function DetailRow({
    icon,
    label,
    value
}: DetailRowProps) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: ".6rem",
                marginBottom: ".7rem"
            }}
        >
            <span
                style={{
                    color:
                        COLORS.primary,
                    display:
                        "flex"
                }}
            >
                {icon}
            </span>

            <span
                style={{
                    color:
                        COLORS.muted,
                    fontSize:
                        ".78rem"
                }}
            >
                {label}:
            </span>

            <strong
                style={{
                    color:
                        COLORS.dark,
                    fontSize:
                        ".8rem"
                }}
            >
                {value}
            </strong>
        </div>
    );
}


// =========================================================
// MONITORING CARD
// =========================================================

interface MonitoringCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    detail: string;
    percentage: number;
    color: string;
}

function MonitoringCard({
    icon,
    title,
    value,
    detail,
    percentage,
    color
}: MonitoringCardProps) {
    return (
        <div
            style={{
                background:
                    COLORS.white,
                border:
                    `1px solid ${COLORS.border}`,
                borderRadius:
                    "12px",
                padding:
                    "1rem"
            }}
        >
            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    gap:
                        ".65rem",
                    marginBottom:
                        ".8rem"
                }}
            >
                <div
                    style={{
                        width:
                            "36px",
                        height:
                            "36px",
                        borderRadius:
                            "9px",
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        background:
                            `${color}15`,
                        color
                    }}
                >
                    {icon}
                </div>

                <span
                    style={{
                        fontSize:
                            ".8rem",
                        color:
                            COLORS.muted
                    }}
                >
                    {title}
                </span>
            </div>

            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "baseline",
                    gap:
                        ".5rem"
                }}
            >
                <strong
                    style={{
                        fontSize:
                            "1.5rem",
                        color:
                            COLORS.dark
                    }}
                >
                    {value}
                </strong>

                <span
                    style={{
                        fontSize:
                            ".72rem",
                        color:
                            COLORS.muted
                    }}
                >
                    {detail}
                </span>
            </div>

            <div
                style={{
                    marginTop:
                        ".7rem",
                    height:
                        "6px",
                    background:
                        COLORS.background,
                    borderRadius:
                        "10px",
                    overflow:
                        "hidden"
                }}
            >
                <div
                    style={{
                        width:
                            `${percentage}%`,
                        height:
                            "100%",
                        background:
                            color,
                        borderRadius:
                            "10px"
                    }}
                />
            </div>
        </div>
    );
}


// =========================================================
// ALERT CARD
// =========================================================

interface AlertCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
    color: string;
    background: string;
}

function AlertCard({
    icon,
    title,
    value,
    description,
    color,
    background
}: AlertCardProps) {
    return (
        <div
            style={{
                display:
                    "flex",
                gap:
                    ".8rem",
                alignItems:
                    "flex-start",
                padding:
                    "1rem",
                background:
                    COLORS.white,
                border:
                    `1px solid ${COLORS.border}`,
                borderRadius:
                    "12px"
            }}
        >
            <div
                style={{
                    width:
                        "38px",
                    height:
                        "38px",
                    borderRadius:
                        "10px",
                    display:
                        "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "center",
                    background,
                    color
                }}
            >
                {icon}
            </div>

            <div>
                <div
                    style={{
                        fontSize:
                            ".76rem",
                        color:
                            COLORS.muted
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        fontSize:
                            "1.35rem",
                        fontWeight:
                            750,
                        color:
                            COLORS.dark,
                        margin:
                            ".15rem 0"
                    }}
                >
                    {value}
                </div>

                <div
                    style={{
                        fontSize:
                            ".72rem",
                        color:
                            COLORS.muted,
                        lineHeight:
                            1.4
                    }}
                >
                    {description}
                </div>
            </div>
        </div>
    );
}


// =========================================================
// PERFIL DO DOCENTE
// =========================================================

function TeacherProfile({
    teacher
}: {
    teacher: TeacherMonitoring;
}) {
    const lessonPercentage =
        teacher.aulasPrevistas > 0
            ? Math.round(
                (teacher.aulasRealizadas /
                    teacher.aulasPrevistas) *
                100
            )
            : 0;

    const evaluationPercentage =
        teacher.avaliacoesTotal > 0
            ? Math.round(
                (teacher.avaliacoesDentroPrazo /
                    teacher.avaliacoesTotal) *
                100
            )
            : 0;

    const activityPercentage =
        teacher.actividadesTotal > 0
            ? Math.round(
                (teacher.actividadesEntregues /
                    teacher.actividadesTotal) *
                100
            )
            : 0;

    return (
        <div>
            {/* PERFIL */}

            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "space-between",
                    gap:
                        "1rem",
                    padding:
                        "1rem",
                    background:
                        COLORS.background,
                    borderRadius:
                        "12px",
                    flexWrap:
                        "wrap"
                }}
            >
                <div
                    style={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        gap:
                            ".9rem"
                    }}
                >
                    <Avatar
                        label={
                            teacher.avatar
                        }
                        shape="circle"
                        style={{
                            width:
                                "58px",
                            height:
                                "58px",
                            fontSize:
                                "1rem",
                            background:
                                COLORS.primaryLight,
                            color:
                                COLORS.primary,
                            fontWeight:
                                750
                        }}
                    />

                    <div>
                        <h3
                            style={{
                                margin:
                                    0,
                                color:
                                    COLORS.dark
                            }}
                        >
                            {teacher.nome}
                        </h3>

                        <div
                            style={{
                                color:
                                    COLORS.muted,
                                fontSize:
                                    ".8rem",
                                marginTop:
                                    ".2rem"
                            }}
                        >
                            {teacher.email}
                        </div>

                        <div
                            style={{
                                color:
                                    COLORS.muted,
                                fontSize:
                                    ".78rem",
                                marginTop:
                                    ".15rem"
                            }}
                        >
                            {teacher.departamento}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        textAlign:
                            "center"
                    }}
                >
                    <div
                        style={{
                            fontSize:
                                "1.8rem",
                            fontWeight:
                                800,
                            color:
                                COLORS.primary
                        }}
                    >
                        {teacher.cumprimento}%
                    </div>

                    <Tag
                        value={
                            teacher.estado
                        }
                        severity={getTeacherSeverity(
                            teacher.estado
                        )}
                        rounded
                    />
                </div>
            </div>


            {/* INDICADORES */}

            <div
                style={{
                    display:
                        "grid",
                    gridTemplateColumns:
                        "repeat(4, 1fr)",
                    gap:
                        "1rem",
                    marginTop:
                        "1rem"
                }}
            >
                <ProfileMetric
                    icon={
                        <BookOpen
                            size={19}
                        />
                    }
                    title="Aulas"
                    value={`${teacher.aulasRealizadas}/${teacher.aulasPrevistas}`}
                    detail={`${lessonPercentage}% realizadas`}
                    color={
                        COLORS.primary
                    }
                />

                <ProfileMetric
                    icon={
                        <ClipboardCheck
                            size={19}
                        />
                    }
                    title="Avaliações"
                    value={`${teacher.avaliacoesDentroPrazo}/${teacher.avaliacoesTotal}`}
                    detail={`${evaluationPercentage}% dentro do prazo`}
                    color={
                        COLORS.green
                    }
                />

                <ProfileMetric
                    icon={
                        <FileCheck2
                            size={19}
                        />
                    }
                    title="Pauta final"
                    value={
                        teacher.pautaFinal
                    }
                    detail="Estado da entrega"
                    color={
                        teacher.pautaFinal ===
                        "Entregue"
                            ? COLORS.green
                            : COLORS.orange
                    }
                />

                <ProfileMetric
                    icon={
                        <Activity
                            size={19}
                        />
                    }
                    title="Actividades"
                    value={`${teacher.actividadesEntregues}/${teacher.actividadesTotal}`}
                    detail={`${activityPercentage}% entregues`}
                    color={
                        COLORS.purple
                    }
                />
            </div>


            <Divider />


            {/* DETALHAMENTO */}

            <h3
                style={{
                    margin:
                        "0 0 1rem",
                    fontSize:
                        "1rem"
                }}
            >
                Indicadores de cumprimento
            </h3>

            <ProfileProgress
                label="Aulas leccionadas"
                value={
                    lessonPercentage
                }
                detail={`${teacher.aulasRealizadas} realizadas de ${teacher.aulasPrevistas}`}
                color={
                    COLORS.primary
                }
            />

            <ProfileProgress
                label="Avaliações dentro do prazo"
                value={
                    evaluationPercentage
                }
                detail={`${teacher.avaliacoesDentroPrazo} dentro do prazo · ${teacher.avaliacoesForaPrazo} fora do prazo`}
                color={
                    COLORS.green
                }
            />

            <ProfileProgress
                label="Actividades entregues"
                value={
                    activityPercentage
                }
                detail={`${teacher.actividadesEntregues} entregues · ${teacher.actividadesAtrasadas} atrasadas`}
                color={
                    COLORS.purple
                }
            />


            {/* OBSERVAÇÕES */}

            <div
                style={{
                    marginTop:
                        "1rem",
                    padding:
                        "1rem",
                    background:
                        teacher.estado ===
                        "Atenção"
                            ? COLORS.orangeLight
                            : COLORS.primaryLight,
                    borderRadius:
                        "10px",
                    display:
                        "flex",
                    gap:
                        ".7rem"
                }}
            >
                {teacher.estado ===
                "Atenção" ? (
                    <AlertCircle
                        size={19}
                        color={
                            COLORS.orange
                        }
                    />
                ) : (
                    <TrendingUp
                        size={19}
                        color={
                            COLORS.primary
                        }
                    />
                )}

                <div>
                    <strong
                        style={{
                            fontSize:
                                ".82rem",
                            color:
                                COLORS.dark
                        }}
                    >
                        Acompanhamento pedagógico
                    </strong>

                    <p
                        style={{
                            margin:
                                ".25rem 0 0",
                            fontSize:
                                ".78rem",
                            lineHeight:
                                1.5,
                            color:
                                COLORS.muted
                        }}
                    >
                        {teacher.estado ===
                        "Atenção"
                            ? "O perfil apresenta indicadores que requerem acompanhamento, principalmente nas actividades, avaliações ou aulas pendentes."
                            : "O docente apresenta um nível de cumprimento pedagógico consistente no período analisado."}
                    </p>
                </div>
            </div>
        </div>
    );
}


// =========================================================
// PROFILE METRIC
// =========================================================

function ProfileMetric({
    icon,
    title,
    value,
    detail,
    color
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    detail: string;
    color: string;
}) {
    return (
        <div
            style={{
                padding:
                    ".9rem",
                border:
                    `1px solid ${COLORS.border}`,
                borderRadius:
                    "10px"
            }}
        >
            <div
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    gap:
                        ".45rem",
                    color
                }}
            >
                {icon}

                <span
                    style={{
                        fontSize:
                            ".75rem",
                        color:
                            COLORS.muted
                    }}
                >
                    {title}
                </span>
            </div>

            <div
                style={{
                    fontWeight:
                        750,
                    fontSize:
                        "1.1rem",
                    marginTop:
                        ".5rem",
                    color:
                        COLORS.dark
                }}
            >
                {value}
            </div>

            <div
                style={{
                    fontSize:
                        ".7rem",
                    color:
                        COLORS.muted,
                    marginTop:
                        ".15rem"
                }}
            >
                {detail}
            </div>
        </div>
    );
}


// =========================================================
// PROFILE PROGRESS
// =========================================================

function ProfileProgress({
    label,
    value,
    detail,
    color
}: {
    label: string;
    value: number;
    detail: string;
    color: string;
}) {
    return (
        <div
            style={{
                marginBottom:
                    "1rem"
            }}
        >
            <div
                style={{
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "center",
                    marginBottom:
                        ".35rem"
                }}
            >
                <span
                    style={{
                        fontSize:
                            ".8rem",
                        fontWeight:
                            600
                    }}
                >
                    {label}
                </span>

                <strong
                    style={{
                        fontSize:
                            ".8rem",
                        color
                    }}
                >
                    {value}%
                </strong>
            </div>

            <div
                style={{
                    height:
                        "8px",
                    background:
                        COLORS.background,
                    borderRadius:
                        "10px",
                    overflow:
                        "hidden"
                }}
            >
                <div
                    style={{
                        width:
                            `${value}%`,
                        height:
                            "100%",
                        background:
                            color,
                        borderRadius:
                            "10px"
                    }}
                />
            </div>

            <div
                style={{
                    marginTop:
                        ".3rem",
                    fontSize:
                        ".7rem",
                    color:
                        COLORS.muted
                }}
            >
                {detail}
            </div>
        </div>
    );
}