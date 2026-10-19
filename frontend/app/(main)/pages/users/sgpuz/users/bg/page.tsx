"use client";

import React, { useMemo, useState } from "react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { ProgressBar } from "primereact/progressbar";

import {
    BarChart3,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileBarChart,
    FileCheck2,
    FileText,
    GraduationCap,
    Layers3,
    LineChart,
    PieChart,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
);

/* =========================================================
   TIPOS
========================================================= */

type ReportType =
    | "semestral"
    | "anual"
    | "docente"
    | "unidade"
    | "cumprimento";

type TabType = "relatorios" | "indicadores" | "comparacao";

interface Teacher {
    id: number;
    name: string;
    initials: string;
    course: string;
    planned: number;
    realized: number;
    confirmed: number;
    evaluations: number;
    evaluationsOnTime: number;
    activities: number;
    activitiesCompleted: number;
    compliance: number;
}

interface CourseUnit {
    id: number;
    name: string;
    code: string;
    teacher: string;
    planned: number;
    realized: number;
    evaluations: number;
    grades: number;
    activities: number;
    compliance: number;
}

interface ReportOption {
    id: ReportType;
    title: string;
    description: string;
    icon: React.ReactNode;
}

/* =========================================================
   CORES
========================================================= */

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

    pink: "#DB2777",
    pinkLight: "#FCE7F3",

    dark: "#0F172A",
    text: "#334155",
    muted: "#64748B",
    light: "#94A3B8",
    border: "#E2E8F0",
    background: "#F8FAFC",
    white: "#FFFFFF",
};

/* =========================================================
   DADOS SIMULADOS
========================================================= */

const academicPeriods = [
    {
        label: "2025 – 1.º Semestre",
        value: "2025-1",
    },
    {
        label: "2025 – 2.º Semestre",
        value: "2025-2",
    },
    {
        label: "2026 – 1.º Semestre",
        value: "2026-1",
    },
    {
        label: "2026 – 2.º Semestre",
        value: "2026-2",
    },
];

const teachers: Teacher[] = [
    {
        id: 1,
        name: "John Doe",
        initials: "JD",
        course: "Engenharia Informática",
        planned: 96,
        realized: 92,
        confirmed: 89,
        evaluations: 8,
        evaluationsOnTime: 7,
        activities: 12,
        activitiesCompleted: 11,
        compliance: 96,
    },
    {
        id: 2,
        name: "Jane Smith",
        initials: "JS",
        course: "Engenharia Informática",
        planned: 94,
        realized: 87,
        confirmed: 84,
        evaluations: 7,
        evaluationsOnTime: 6,
        activities: 11,
        activitiesCompleted: 10,
        compliance: 91,
    },
    {
        id: 3,
        name: "Daniel Miller",
        initials: "DM",
        course: "Engenharia Informática",
        planned: 91,
        realized: 82,
        confirmed: 80,
        evaluations: 8,
        evaluationsOnTime: 7,
        activities: 10,
        activitiesCompleted: 9,
        compliance: 88,
    },
    {
        id: 4,
        name: "Sarah Davis",
        initials: "SD",
        course: "Engenharia Informática",
        planned: 89,
        realized: 76,
        confirmed: 73,
        evaluations: 7,
        evaluationsOnTime: 6,
        activities: 10,
        activitiesCompleted: 8,
        compliance: 82,
    },
    {
        id: 5,
        name: "Olivia Taylor",
        initials: "OT",
        course: "Engenharia Informática",
        planned: 86,
        realized: 70,
        confirmed: 67,
        evaluations: 6,
        evaluationsOnTime: 5,
        activities: 9,
        activitiesCompleted: 7,
        compliance: 78,
    },
];

const courseUnits: CourseUnit[] = [
    {
        id: 1,
        name: "Programação I",
        code: "INF101",
        teacher: "John Doe",
        planned: 40,
        realized: 39,
        evaluations: 4,
        grades: 4,
        activities: 7,
        compliance: 96,
    },
    {
        id: 2,
        name: "Bases de Dados",
        code: "INF202",
        teacher: "Jane Smith",
        planned: 42,
        realized: 39,
        evaluations: 4,
        grades: 3,
        activities: 8,
        compliance: 93,
    },
    {
        id: 3,
        name: "Engenharia de Software",
        code: "INF303",
        teacher: "Daniel Miller",
        planned: 44,
        realized: 39,
        evaluations: 5,
        grades: 4,
        activities: 7,
        compliance: 89,
    },
    {
        id: 4,
        name: "Redes de Computadores",
        code: "INF304",
        teacher: "Sarah Davis",
        planned: 40,
        realized: 34,
        evaluations: 4,
        grades: 3,
        activities: 6,
        compliance: 85,
    },
    {
        id: 5,
        name: "Sistemas Operativos",
        code: "INF305",
        teacher: "Olivia Taylor",
        planned: 38,
        realized: 30,
        evaluations: 3,
        grades: 2,
        activities: 5,
        compliance: 79,
    },
];

const reportOptions: ReportOption[] = [
    {
        id: "semestral",
        title: "Relatório semestral",
        description:
            "Resumo completo do desempenho pedagógico de um semestre.",
        icon: <CalendarDays size={22} />,
    },
    {
        id: "anual",
        title: "Relatório anual",
        description:
            "Consolidação dos indicadores pedagógicos do ano lectivo.",
        icon: <FileBarChart size={22} />,
    },
    {
        id: "docente",
        title: "Relatório por docente",
        description:
            "Acompanhamento individual do cumprimento pedagógico.",
        icon: <Users size={22} />,
    },
    {
        id: "unidade",
        title: "Relatório por unidade curricular",
        description:
            "Indicadores e actividades associados a uma unidade curricular.",
        icon: <Layers3 size={22} />,
    },
    {
        id: "cumprimento",
        title: "Relatório de cumprimento",
        description:
            "Análise global do cumprimento pedagógico.",
        icon: <ClipboardCheck size={22} />,
    },
];

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function ReportsAndIndicators() {
    const [activeTab, setActiveTab] =
        useState<TabType>("indicadores");

    const [selectedPeriod, setSelectedPeriod] =
        useState<string>("2026-1");

    const [selectedTeacher, setSelectedTeacher] =
        useState<string | null>(null);

    const [selectedReport, setSelectedReport] =
        useState<ReportType>("semestral");

    const [selectedPeriod1, setSelectedPeriod1] =
        useState<string>("2025-2");

    const [selectedPeriod2, setSelectedPeriod2] =
        useState<string>("2026-1");

    const [reportDialogVisible, setReportDialogVisible] =
        useState(false);

    const [selectedReportTitle, setSelectedReportTitle] =
        useState("Relatório semestral");

    const teacherOptions = [
        {
            label: "Todos os docentes",
            value: null,
        },
        ...teachers.map((teacher) => ({
            label: teacher.name,
            value: teacher.name,
        })),
    ];

    /* =====================================================
       GRÁFICO 1 - CUMPRIMENTO POR DOCENTE
    ===================================================== */

    const teacherChartData = useMemo(() => {
        const filteredTeachers = selectedTeacher
            ? teachers.filter(
                  (teacher) => teacher.name === selectedTeacher
              )
            : teachers;

        return {
            labels: filteredTeachers.map(
                (teacher) => teacher.name
            ),
            datasets: [
                {
                    label: "Cumprimento",
                    data: filteredTeachers.map(
                        (teacher) => teacher.compliance
                    ),
                    backgroundColor: [
                        "#1D4ED8",
                        "#7C3AED",
                        "#0891B2",
                        "#16A34A",
                        "#D97706",
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                    barThickness: 28,
                },
            ],
        };
    }, [selectedTeacher]);

    /* =====================================================
       GRÁFICO 2 - EVOLUÇÃO SEMESTRAL
    ===================================================== */

    const evolutionChartData = {
        labels: [
            "2025 – 1.º",
            "2025 – 2.º",
            "2026 – 1.º",
            "2026 – 2.º",
        ],
        datasets: [
            {
                label: "Aulas realizadas",
                data: [84, 89, 93, 95],
                borderColor: COLORS.primary,
                backgroundColor: "rgba(29, 78, 216, 0.10)",
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: "Avaliações no prazo",
                data: [72, 79, 86, 89],
                borderColor: COLORS.green,
                backgroundColor: "rgba(22, 163, 74, 0.08)",
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: "Actividades concluídas",
                data: [69, 76, 84, 87],
                borderColor: COLORS.purple,
                backgroundColor: "rgba(124, 58, 237, 0.08)",
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    /* =====================================================
       GRÁFICO 3 - DISTRIBUIÇÃO DAS AULAS
    ===================================================== */

    const lessonsChartData = {
        labels: [
            "Realizadas",
            "Confirmadas",
            "Pendentes",
            "Não realizadas",
        ],
        datasets: [
            {
                data: [93, 91, 5, 2],
                backgroundColor: [
                    "#1D4ED8",
                    "#16A34A",
                    "#D97706",
                    "#DC2626",
                ],
                borderWidth: 0,
                hoverOffset: 8,
            },
        ],
    };

    /* =====================================================
       GRÁFICO 4 - AVALIAÇÕES
    ===================================================== */

    const evaluationChartData = {
        labels: [
            "Dentro do prazo",
            "Fora do prazo",
            "Pendentes",
        ],
        datasets: [
            {
                data: [86, 14, 7],
                backgroundColor: [
                    "#16A34A",
                    "#DC2626",
                    "#D97706",
                ],
                borderWidth: 0,
                hoverOffset: 8,
            },
        ],
    };

    /* =====================================================
       GRÁFICO 5 - COMPARAÇÃO
    ===================================================== */

    const comparisonChartData = {
        labels: [
            "Aulas",
            "Confirmações",
            "Avaliações",
            "Pautas",
            "Actividades",
            "Docentes",
        ],
        datasets: [
            {
                label:
                    academicPeriods.find(
                        (period) =>
                            period.value === selectedPeriod1
                    )?.label || selectedPeriod1,
                data: [89, 85, 79, 68, 76, 81],
                backgroundColor: "rgba(29, 78, 216, 0.85)",
                borderRadius: 7,
            },
            {
                label:
                    academicPeriods.find(
                        (period) =>
                            period.value === selectedPeriod2
                    )?.label || selectedPeriod2,
                data: [93, 91, 86, 75, 84, 88],
                backgroundColor: "rgba(124, 58, 237, 0.85)",
                borderRadius: 7,
            },
        ],
    };

    /* =====================================================
       GRÁFICO 6 - UNIDADES CURRICULARES
    ===================================================== */

    const courseChartData = {
        labels: courseUnits.map(
            (course) => course.name
        ),
        datasets: [
            {
                label: "Cumprimento",
                data: courseUnits.map(
                    (course) => course.compliance
                ),
                backgroundColor: "rgba(8, 145, 178, 0.85)",
                borderRadius: 7,
            },
        ],
    };

    /* =====================================================
       OPÇÕES DOS GRÁFICOS
    ===================================================== */

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    usePointStyle: true,
                    padding: 18,
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    const barOptions = {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value: string | number) =>
                        `${value}%`,
                },
                grid: {
                    color: "#E2E8F0",
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const lineOptions = {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value: string | number) =>
                        `${value}%`,
                },
                grid: {
                    color: "#E2E8F0",
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const horizontalBarOptions = {
        ...commonOptions,
        indexAxis: "y" as const,
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value: string | number) =>
                        `${value}%`,
                },
                grid: {
                    color: "#E2E8F0",
                },
            },
            y: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const doughnutOptions = {
        ...commonOptions,
        cutout: "68%",
    };

    /* =====================================================
       FUNÇÕES
    ===================================================== */

    const openReport = (
        reportId: ReportType,
        title: string
    ) => {
        setSelectedReport(reportId);
        setSelectedReportTitle(title);
        setReportDialogVisible(true);
    };

    const getComplianceSeverity = (
        value: number
    ): "success" | "warning" | "danger" => {
        if (value >= 90) return "success";
        if (value >= 80) return "warning";
        return "danger";
    };

    const teacherBody = (row: Teacher) => (
        <div className="flex align-items-center gap-2">
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: COLORS.primaryLight,
                    color: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 12,
                }}
            >
                {row.initials}
            </div>

            <div>
                <div
                    style={{
                        fontWeight: 600,
                        color: COLORS.dark,
                    }}
                >
                    {row.name}
                </div>

                <div
                    style={{
                        fontSize: 12,
                        color: COLORS.muted,
                    }}
                >
                    {row.course}
                </div>
            </div>
        </div>
    );

    const complianceBody = (row: Teacher) => (
        <div
            style={{
                minWidth: 130,
            }}
        >
            <div className="flex justify-content-between mb-2">
                <span
                    style={{
                        fontSize: 12,
                        color: COLORS.muted,
                    }}
                >
                    Cumprimento
                </span>

                <strong>{row.compliance}%</strong>
            </div>

            <ProgressBar
                value={row.compliance}
                showValue={false}
                style={{
                    height: 7,
                    borderRadius: 10,
                }}
            />
        </div>
    );

    const statusBody = (row: Teacher) => (
        <Tag
            value={
                row.compliance >= 90
                    ? "Excelente"
                    : row.compliance >= 80
                    ? "Regular"
                    : "Atenção"
            }
            severity={getComplianceSeverity(
                row.compliance
            )}
        />
    );

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "none",
                margin: 0,
                padding: "1.25rem",
                boxSizing: "border-box",
                background: COLORS.background,
                minHeight: "100vh",
            }}
        >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4"
            >
                <div>
                    <div
                        className="flex align-items-center gap-2 mb-2"
                    >
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background:
                                    COLORS.primaryLight,
                                color: COLORS.primary,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BarChart3 size={22} />
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                color: COLORS.dark,
                                fontSize: 25,
                                fontWeight: 700,
                            }}
                        >
                            Relatórios e Indicadores
                        </h1>
                    </div>

                    <p
                        style={{
                            margin: 0,
                            color: COLORS.muted,
                            fontSize: 14,
                        }}
                    >
                        Análise do desempenho pedagógico,
                        indicadores e comparação entre
                        períodos lectivos.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        label="Actualizar"
                        icon={<RefreshCw size={16} />}
                        severity="secondary"
                        outlined
                        onClick={() => {}}
                    />

                    <Button
                        label="Gerar relatório"
                        icon={<FileText size={16} />}
                        onClick={() =>
                            openReport(
                                selectedReport,
                                selectedReportTitle
                            )
                        }
                    />
                </div>
            </div>

            {/* =================================================
                FILTROS
            ================================================= */}

            <Card
                className="mb-4"
                style={{
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "none",
                }}
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label
                            className="block mb-2"
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: COLORS.text,
                            }}
                        >
                            Período lectivo
                        </label>

                        <Dropdown
                            value={selectedPeriod}
                            options={academicPeriods}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) =>
                                setSelectedPeriod(e.value)
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-4">
                        <label
                            className="block mb-2"
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: COLORS.text,
                            }}
                        >
                            Docente
                        </label>

                        <Dropdown
                            value={selectedTeacher}
                            options={teacherOptions}
                            onChange={(e) =>
                                setSelectedTeacher(e.value)
                            }
                            placeholder="Todos os docentes"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-4">
                        <label
                            className="block mb-2"
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: COLORS.text,
                            }}
                        >
                            Tipo de relatório
                        </label>

                        <Dropdown
                            value={selectedReport}
                            options={reportOptions.map(
                                (report) => ({
                                    label: report.title,
                                    value: report.id,
                                })
                            )}
                            onChange={(e) =>
                                setSelectedReport(e.value)
                            }
                            className="w-full"
                        />
                    </div>
                </div>
            </Card>

            {/* =================================================
                KPIs
            ================================================= */}

            <div className="grid mb-4">
                <KpiCard
                    title="Aulas realizadas"
                    value="93%"
                    subtitle="do planeado"
                    icon={<GraduationCap size={20} />}
                    iconBg={COLORS.primaryLight}
                    iconColor={COLORS.primary}
                    trend="+4,5%"
                    positive
                />

                <KpiCard
                    title="Aulas confirmadas"
                    value="91%"
                    subtitle="das aulas realizadas"
                    icon={<CheckCircle2 size={20} />}
                    iconBg={COLORS.greenLight}
                    iconColor={COLORS.green}
                    trend="+6,2%"
                    positive
                />

                <KpiCard
                    title="Avaliações no prazo"
                    value="86%"
                    subtitle="dentro do prazo"
                    icon={<Clock3 size={20} />}
                    iconBg={COLORS.orangeLight}
                    iconColor={COLORS.orange}
                    trend="+7,1%"
                    positive
                />

                <KpiCard
                    title="Pautas entregues"
                    value="75%"
                    subtitle="do total previsto"
                    icon={<FileCheck2 size={20} />}
                    iconBg={COLORS.purpleLight}
                    iconColor={COLORS.purple}
                    trend="+5,8%"
                    positive
                />

                <KpiCard
                    title="Actividades concluídas"
                    value="84%"
                    subtitle="dentro do prazo"
                    icon={<ClipboardCheck size={20} />}
                    iconBg={COLORS.cyanLight}
                    iconColor={COLORS.cyan}
                    trend="+8,4%"
                    positive
                />

                <KpiCard
                    title="Cumprimento docente"
                    value="88%"
                    subtitle="indicador global"
                    icon={<Users size={20} />}
                    iconBg={COLORS.pinkLight}
                    iconColor={COLORS.pink}
                    trend="+5,3%"
                    positive
                />
            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <div
                className="flex gap-2 mb-4 flex-wrap"
                style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    paddingBottom: 12,
                }}
            >
                <TabButton
                    active={activeTab === "indicadores"}
                    icon={<BarChart3 size={17} />}
                    label="Indicadores"
                    onClick={() =>
                        setActiveTab("indicadores")
                    }
                />

                <TabButton
                    active={activeTab === "relatorios"}
                    icon={<FileBarChart size={17} />}
                    label="Relatórios"
                    onClick={() =>
                        setActiveTab("relatorios")
                    }
                />

                <TabButton
                    active={activeTab === "comparacao"}
                    icon={<LineChart size={17} />}
                    label="Comparar semestres"
                    onClick={() =>
                        setActiveTab("comparacao")
                    }
                />
            </div>

            {/* =================================================
                RELATÓRIOS
            ================================================= */}

            {activeTab === "relatorios" && (
                <div>
                    <SectionTitle
                        icon={<FileBarChart size={20} />}
                        title="Relatórios pedagógicos"
                        description="Seleccione o tipo de relatório que pretende consultar ou gerar."
                    />

                    <div className="grid mb-4">
                        {reportOptions.map((report) => (
                            <div
                                key={report.id}
                                className="col-12 md:col-6 lg:col-4"
                            >
                                <div
                                    onClick={() =>
                                        openReport(
                                            report.id,
                                            report.title
                                        )
                                    }
                                    style={{
                                        height: "100%",
                                        padding: "1.25rem",
                                        background:
                                            COLORS.white,
                                        border: `1px solid ${COLORS.border}`,
                                        borderRadius: 12,
                                        cursor: "pointer",
                                        transition:
                                            "all .2s ease",
                                    }}
                                >
                                    <div
                                        className="flex justify-content-between align-items-start mb-3"
                                    >
                                        <div
                                            style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 11,
                                                display: "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                background:
                                                    COLORS.primaryLight,
                                                color:
                                                    COLORS.primary,
                                            }}
                                        >
                                            {report.icon}
                                        </div>

                                        <i
                                            className="pi pi-arrow-up-right"
                                            style={{
                                                color:
                                                    COLORS.light,
                                            }}
                                        />
                                    </div>

                                    <h3
                                        style={{
                                            margin:
                                                "0 0 8px",
                                            color:
                                                COLORS.dark,
                                            fontSize: 16,
                                        }}
                                    >
                                        {report.title}
                                    </h3>

                                    <p
                                        style={{
                                            margin: 0,
                                            color:
                                                COLORS.muted,
                                            fontSize: 13,
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {report.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid">
                        <div className="col-12 lg:col-8">
                            <Card
                                title="Pré-visualização do relatório"
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                }}
                            >
                                <div className="grid">
                                    <MetricPreview
                                        label="Aulas planeadas"
                                        value="412"
                                        icon={
                                            <CalendarDays
                                                size={18}
                                            />
                                        }
                                    />

                                    <MetricPreview
                                        label="Aulas realizadas"
                                        value="383"
                                        icon={
                                            <CheckCircle2
                                                size={18}
                                            />
                                        }
                                    />

                                    <MetricPreview
                                        label="Avaliações"
                                        value="36"
                                        icon={
                                            <ClipboardCheck
                                                size={18}
                                            />
                                        }
                                    />

                                    <MetricPreview
                                        label="Pautas"
                                        value="18"
                                        icon={
                                            <FileCheck2
                                                size={18}
                                            />
                                        }
                                    />
                                </div>

                                <Divider />

                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <strong
                                            style={{
                                                color:
                                                    COLORS.dark,
                                            }}
                                        >
                                            {selectedReportTitle}
                                        </strong>

                                        <div
                                            style={{
                                                fontSize: 12,
                                                color:
                                                    COLORS.muted,
                                                marginTop: 4,
                                            }}
                                        >
                                            Período:{" "}
                                            {
                                                academicPeriods.find(
                                                    (p) =>
                                                        p.value ===
                                                        selectedPeriod
                                                )?.label
                                            }
                                        </div>
                                    </div>

                                    <Button
                                        label="Gerar"
                                        icon={
                                            <FileText
                                                size={16}
                                            />
                                        }
                                        onClick={() =>
                                            openReport(
                                                selectedReport,
                                                selectedReportTitle
                                            )
                                        }
                                    />
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 lg:col-4">
                            <Card
                                title="Conteúdo incluído"
                                style={{
                                    height: "100%",
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                }}
                            >
                                <ReportContent
                                    text="Resumo de aulas"
                                />

                                <ReportContent
                                    text="Indicadores de avaliações"
                                />

                                <ReportContent
                                    text="Pautas finais"
                                />

                                <ReportContent
                                    text="Actividades pedagógicas"
                                />

                                <ReportContent
                                    text="Cumprimento docente"
                                />

                                <ReportContent
                                    text="Observações e ocorrências"
                                />
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                INDICADORES
            ================================================= */}

            {activeTab === "indicadores" && (
                <div>
                    <SectionTitle
                        icon={<BarChart3 size={20} />}
                        title="Indicadores pedagógicos"
                        description="Visão geral do desempenho pedagógico no período seleccionado."
                    />

                    {/* PRIMEIRA LINHA DE GRÁFICOS */}

                    <div className="grid mb-4">
                        <div className="col-12 lg:col-8">
                            <Card
                                title="Cumprimento por docente"
                                subTitle="Percentagem de cumprimento das actividades pedagógicas"
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                }}
                            >
                                <div
                                    style={{
                                        height: 340,
                                    }}
                                >
                                    <Bar
                                        data={teacherChartData}
                                        options={
                                            barOptions
                                        }
                                    />
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 lg:col-4">
                            <Card
                                title="Distribuição das aulas"
                                subTitle="Estado das aulas no período"
                                style={{
                                    height: "100%",
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                }}
                            >
                                <div
                                    style={{
                                        height: 280,
                                        display: "flex",
                                        justifyContent:
                                            "center",
                                    }}
                                >
                                    <Doughnut
                                        data={
                                            lessonsChartData
                                        }
                                        options={
                                            doughnutOptions
                                        }
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* SEGUNDA LINHA */}

                    <div className="grid mb-4">
                        <div className="col-12 lg:col-8">
                            <Card
                                title="Evolução dos indicadores"
                                subTitle="Comparação da evolução dos principais indicadores pedagógicos"
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                }}
                            >
                                <div
                                    style={{
                                        height: 330,
                                    }}
                                >
                                    <Line
                                        data={
                                            evolutionChartData
                                        }
                                        options={
                                            lineOptions
                                        }
                                    />
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 lg:col-4">
                            <Card
                                title="Avaliações"
                                subTitle="Cumprimento dos prazos"
                                style={{
                                    height: "100%",
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                }}
                            >
                                <div
                                    style={{
                                        height: 280,
                                    }}
                                >
                                    <Pie
                                        data={
                                            evaluationChartData
                                        }
                                        options={
                                            doughnutOptions
                                        }
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* TERCEIRA LINHA */}

                    <div className="grid mb-4">
                        <div className="col-12 lg:col-7">
                            <Card
                                title="Cumprimento por unidade curricular"
                                subTitle="Percentagem de execução pedagógica"
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                }}
                            >
                                <div
                                    style={{
                                        height: 340,
                                    }}
                                >
                                    <Bar
                                        data={
                                            courseChartData
                                        }
                                        options={
                                            horizontalBarOptions
                                        }
                                    />
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 lg:col-5">
                            <Card
                                title="Resumo dos indicadores"
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                }}
                            >
                                <IndicatorRow
                                    label="Aulas realizadas"
                                    value={93}
                                    color={
                                        COLORS.primary
                                    }
                                />

                                <IndicatorRow
                                    label="Aulas confirmadas"
                                    value={91}
                                    color={
                                        COLORS.green
                                    }
                                />

                                <IndicatorRow
                                    label="Avaliações no prazo"
                                    value={86}
                                    color={
                                        COLORS.orange
                                    }
                                />

                                <IndicatorRow
                                    label="Pautas entregues"
                                    value={75}
                                    color={
                                        COLORS.purple
                                    }
                                />

                                <IndicatorRow
                                    label="Actividades concluídas"
                                    value={84}
                                    color={
                                        COLORS.cyan
                                    }
                                />

                                <IndicatorRow
                                    label="Cumprimento docente"
                                    value={88}
                                    color={
                                        COLORS.pink
                                    }
                                />
                            </Card>
                        </div>
                    </div>

                    {/* TABELA */}

                    <Card
                        title="Cumprimento pedagógico por docente"
                        subTitle="Detalhamento dos principais indicadores"
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                        }}
                    >
                        <DataTable
                            value={teachers}
                            paginator
                            rows={5}
                            stripedRows
                            responsiveLayout="scroll"
                            emptyMessage="Nenhum docente encontrado."
                        >
                            <Column
                                field="name"
                                header="Docente"
                                body={teacherBody}
                                style={{
                                    minWidth: 230,
                                }}
                            />

                            <Column
                                field="planned"
                                header="Aulas planeadas"
                                style={{
                                    minWidth: 140,
                                }}
                            />

                            <Column
                                field="realized"
                                header="Realizadas"
                                style={{
                                    minWidth: 120,
                                }}
                            />

                            <Column
                                field="confirmed"
                                header="Confirmadas"
                                style={{
                                    minWidth: 120,
                                }}
                            />

                            <Column
                                field="evaluationsOnTime"
                                header="Avaliações no prazo"
                                style={{
                                    minWidth: 160,
                                }}
                            />

                            <Column
                                field="activitiesCompleted"
                                header="Actividades"
                                style={{
                                    minWidth: 130,
                                }}
                            />

                            <Column
                                field="compliance"
                                header="Cumprimento"
                                body={complianceBody}
                                style={{
                                    minWidth: 180,
                                }}
                            />

                            <Column
                                header="Estado"
                                body={statusBody}
                                style={{
                                    minWidth: 130,
                                }}
                            />
                        </DataTable>
                    </Card>
                </div>
            )}

            {/* =================================================
                COMPARAÇÃO
            ================================================= */}

            {activeTab === "comparacao" && (
                <div>
                    <SectionTitle
                        icon={<LineChart size={20} />}
                        title="Comparação entre semestres"
                        description="Seleccione dois períodos lectivos para analisar a evolução dos indicadores."
                    />

                    <Card
                        className="mb-4"
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                        }}
                    >
                        <div className="grid align-items-end">
                            <div className="col-12 md:col-5">
                                <label
                                    className="block mb-2"
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                    }}
                                >
                                    Primeiro período
                                </label>

                                <Dropdown
                                    value={
                                        selectedPeriod1
                                    }
                                    options={
                                        academicPeriods
                                    }
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) =>
                                        setSelectedPeriod1(
                                            e.value
                                        )
                                    }
                                    className="w-full"
                                />
                            </div>

                            <div
                                className="col-12 md:col-2 flex justify-content-center align-items-center"
                            >
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius:
                                            "50%",
                                        background:
                                            COLORS.primaryLight,
                                        color:
                                            COLORS.primary,
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 700,
                                        }}
                                    >
                                        VS
                                    </span>
                                </div>
                            </div>

                            <div className="col-12 md:col-5">
                                <label
                                    className="block mb-2"
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                    }}
                                >
                                    Segundo período
                                </label>

                                <Dropdown
                                    value={
                                        selectedPeriod2
                                    }
                                    options={
                                        academicPeriods
                                    }
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) =>
                                        setSelectedPeriod2(
                                            e.value
                                        )
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* GRÁFICO COMPARATIVO */}

                    <Card
                        title="Comparação dos indicadores"
                        subTitle="Valores percentuais simulados"
                        className="mb-4"
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                        }}
                    >
                        <div
                            style={{
                                height: 390,
                            }}
                        >
                            <Bar
                                data={
                                    comparisonChartData
                                }
                                options={{
                                    ...barOptions,
                                    scales: {
                                        ...barOptions.scales,
                                        y: {
                                            ...barOptions
                                                .scales
                                                .y,
                                            max: 100,
                                        },
                                    },
                                }}
                            />
                        </div>
                    </Card>

                    {/* RESUMO DA COMPARAÇÃO */}

                    <div className="grid mb-4">
                        <ComparisonCard
                            title="Aulas realizadas"
                            first={89}
                            second={93}
                            positive
                        />

                        <ComparisonCard
                            title="Aulas confirmadas"
                            first={85}
                            second={91}
                            positive
                        />

                        <ComparisonCard
                            title="Avaliações no prazo"
                            first={79}
                            second={86}
                            positive
                        />

                        <ComparisonCard
                            title="Pautas entregues"
                            first={68}
                            second={75}
                            positive
                        />

                        <ComparisonCard
                            title="Actividades concluídas"
                            first={76}
                            second={84}
                            positive
                        />

                        <ComparisonCard
                            title="Cumprimento docente"
                            first={81}
                            second={88}
                            positive
                        />
                    </div>

                    {/* ANÁLISE */}

                    <Card
                        title="Análise comparativa"
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                        }}
                    >
                        <div className="grid">
                            <AnalysisBox
                                title="Evolução das aulas"
                                value="+4 p.p."
                                description="A percentagem de aulas realizadas aumentou entre os períodos seleccionados."
                                icon={
                                    <TrendingUp
                                        size={21}
                                    />
                                }
                                color={
                                    COLORS.green
                                }
                                background={
                                    COLORS.greenLight
                                }
                            />

                            <AnalysisBox
                                title="Avaliações"
                                value="+7 p.p."
                                description="Observa-se uma melhoria no cumprimento dos prazos de avaliação."
                                icon={
                                    <TrendingUp
                                        size={21}
                                    />
                                }
                                color={
                                    COLORS.primary
                                }
                                background={
                                    COLORS.primaryLight
                                }
                            />

                            <AnalysisBox
                                title="Pautas"
                                value="+7 p.p."
                                description="A entrega de pautas apresenta crescimento no segundo período."
                                icon={
                                    <FileCheck2
                                        size={21}
                                    />
                                }
                                color={
                                    COLORS.purple
                                }
                                background={
                                    COLORS.purpleLight
                                }
                            />

                            <AnalysisBox
                                title="Actividades"
                                value="+8 p.p."
                                description="O indicador de conclusão das actividades também apresenta evolução."
                                icon={
                                    <ClipboardCheck
                                        size={21}
                                    />
                                }
                                color={
                                    COLORS.orange
                                }
                                background={
                                    COLORS.orangeLight
                                }
                            />
                        </div>
                    </Card>
                </div>
            )}

            {/* =================================================
                DIALOG RELATÓRIO
            ================================================= */}

            <Dialog
                visible={reportDialogVisible}
                onHide={() =>
                    setReportDialogVisible(false)
                }
                header={selectedReportTitle}
                modal
                style={{
                    width: "620px",
                    maxWidth: "95vw",
                }}
            >
                <div>
                    <div
                        style={{
                            padding: "1rem",
                            borderRadius: 10,
                            background:
                                COLORS.primaryLight,
                            marginBottom: "1.25rem",
                        }}
                    >
                        <div
                            className="flex align-items-center gap-2"
                        >
                            <FileText
                                size={20}
                                color={
                                    COLORS.primary
                                }
                            />

                            <div>
                                <strong
                                    style={{
                                        color:
                                            COLORS.dark,
                                    }}
                                >
                                    Configuração do relatório
                                </strong>

                                <div
                                    style={{
                                        fontSize: 12,
                                        color:
                                            COLORS.muted,
                                        marginTop: 3,
                                    }}
                                >
                                    Os dados apresentados
                                    são simulados.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <ReportDialogMetric
                                label="Período"
                                value={
                                    academicPeriods.find(
                                        (period) =>
                                            period.value ===
                                            selectedPeriod
                                    )?.label ||
                                    selectedPeriod
                                }
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <ReportDialogMetric
                                label="Tipo"
                                value={
                                    selectedReportTitle
                                }
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <ReportDialogMetric
                                label="Aulas"
                                value="383 realizadas"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <ReportDialogMetric
                                label="Cumprimento"
                                value="88%"
                            />
                        </div>
                    </div>

                    <Divider />

                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            severity="secondary"
                            outlined
                            onClick={() =>
                                setReportDialogVisible(
                                    false
                                )
                            }
                        />

                        <Button
                            label="Gerar relatório"
                            icon={
                                <FileText
                                    size={16}
                                />
                            }
                            onClick={() =>
                                setReportDialogVisible(
                                    false
                                )
                            }
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

/* =========================================================
   COMPONENTES AUXILIARES
========================================================= */

interface KpiCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    trend: string;
    positive: boolean;
}

function KpiCard({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    iconColor,
    trend,
    positive,
}: KpiCardProps) {
    return (
        <div className="col-12 sm:col-6 lg:col-4 xl:col-2">
            <div
                style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 12,
                    padding: "1rem",
                    height: "100%",
                }}
            >
                <div
                    className="flex justify-content-between align-items-start"
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: iconBg,
                            color: iconColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {icon}
                    </div>

                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: positive
                                ? COLORS.green
                                : COLORS.red,
                            background: positive
                                ? COLORS.greenLight
                                : COLORS.redLight,
                            padding:
                                "4px 7px",
                            borderRadius: 20,
                        }}
                    >
                        {trend}
                    </span>
                </div>

                <div
                    style={{
                        marginTop: "1rem",
                    }}
                >
                    <div
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: COLORS.dark,
                        }}
                    >
                        {value}
                    </div>

                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: COLORS.text,
                            marginTop: 4,
                        }}
                    >
                        {title}
                    </div>

                    <div
                        style={{
                            fontSize: 11,
                            color: COLORS.muted,
                            marginTop: 3,
                        }}
                    >
                        {subtitle}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-4">
            <div
                className="flex align-items-center gap-2"
            >
                <span
                    style={{
                        color: COLORS.primary,
                    }}
                >
                    {icon}
                </span>

                <h2
                    style={{
                        margin: 0,
                        fontSize: 19,
                        color: COLORS.dark,
                    }}
                >
                    {title}
                </h2>
            </div>

            <p
                style={{
                    margin: "6px 0 0",
                    color: COLORS.muted,
                    fontSize: 13,
                }}
            >
                {description}
            </p>
        </div>
    );
}

function TabButton({
    active,
    icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                border: "none",
                cursor: "pointer",
                padding:
                    "0.7rem 1rem",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active
                    ? COLORS.primary
                    : COLORS.muted,
                background: active
                    ? COLORS.primaryLight
                    : "transparent",
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function MetricPreview({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="col-12 sm:col-6">
            <div
                style={{
                    padding: "1rem",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                }}
            >
                <div
                    className="flex align-items-center gap-2"
                >
                    <span
                        style={{
                            color: COLORS.primary,
                        }}
                    >
                        {icon}
                    </span>

                    <span
                        style={{
                            color: COLORS.muted,
                            fontSize: 12,
                        }}
                    >
                        {label}
                    </span>
                </div>

                <div
                    style={{
                        fontSize: 23,
                        fontWeight: 700,
                        color: COLORS.dark,
                        marginTop: 8,
                    }}
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

function ReportContent({
    text,
}: {
    text: string;
}) {
    return (
        <div
            className="flex align-items-center gap-2 mb-3"
        >
            <CheckCircle2
                size={16}
                color={COLORS.green}
            />

            <span
                style={{
                    color: COLORS.text,
                    fontSize: 13,
                }}
            >
                {text}
            </span>
        </div>
    );
}

function IndicatorRow({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="mb-4">
            <div
                className="flex justify-content-between mb-2"
            >
                <span
                    style={{
                        fontSize: 13,
                        color: COLORS.text,
                    }}
                >
                    {label}
                </span>

                <strong
                    style={{
                        fontSize: 13,
                        color: COLORS.dark,
                    }}
                >
                    {value}%
                </strong>
            </div>

            <div
                style={{
                    width: "100%",
                    height: 8,
                    borderRadius: 10,
                    background:
                        COLORS.background,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${value}%`,
                        height: "100%",
                        background: color,
                        borderRadius: 10,
                    }}
                />
            </div>
        </div>
    );
}

function ComparisonCard({
    title,
    first,
    second,
    positive,
}: {
    title: string;
    first: number;
    second: number;
    positive: boolean;
}) {
    const difference = second - first;

    return (
        <div className="col-12 sm:col-6 lg:col-4">
            <div
                style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 12,
                    padding: "1.1rem",
                }}
            >
                <div
                    style={{
                        color: COLORS.muted,
                        fontSize: 12,
                        marginBottom: 8,
                    }}
                >
                    {title}
                </div>

                <div className="flex align-items-end justify-content-between">
                    <div>
                        <div
                            style={{
                                fontSize: 25,
                                fontWeight: 700,
                                color: COLORS.dark,
                            }}
                        >
                            {second}%
                        </div>

                        <div
                            style={{
                                fontSize: 11,
                                color: COLORS.muted,
                            }}
                        >
                            período actual
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: 4,
                            color: positive
                                ? COLORS.green
                                : COLORS.red,
                            fontWeight: 700,
                            fontSize: 13,
                        }}
                    >
                        {positive ? (
                            <TrendingUp
                                size={15}
                            />
                        ) : (
                            <TrendingDown
                                size={15}
                            />
                        )}

                        {difference > 0
                            ? "+"
                            : ""}
                        {difference} p.p.
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 12,
                        fontSize: 12,
                        color: COLORS.muted,
                    }}
                >
                    Período anterior:{" "}
                    <strong>
                        {first}%
                    </strong>
                </div>
            </div>
        </div>
    );
}

function AnalysisBox({
    title,
    value,
    description,
    icon,
    color,
    background,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    background: string;
}) {
    return (
        <div className="col-12 md:col-6">
            <div
                style={{
                    padding: "1rem",
                    borderRadius: 11,
                    background,
                    height: "100%",
                }}
            >
                <div
                    className="flex justify-content-between align-items-center mb-2"
                >
                    <div
                        style={{
                            color,
                        }}
                    >
                        {icon}
                    </div>

                    <strong
                        style={{
                            color,
                            fontSize: 18,
                        }}
                    >
                        {value}
                    </strong>
                </div>

                <div
                    style={{
                        fontWeight: 700,
                        color: COLORS.dark,
                        fontSize: 14,
                    }}
                >
                    {title}
                </div>

                <p
                    style={{
                        margin:
                            "6px 0 0",
                        fontSize: 12,
                        color: COLORS.muted,
                        lineHeight: 1.5,
                    }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}

function ReportDialogMetric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div
            style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 9,
                padding: "0.85rem",
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    color: COLORS.muted,
                    marginBottom: 5,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.dark,
                }}
            >
                {value}
            </div>
        </div>
    );
}