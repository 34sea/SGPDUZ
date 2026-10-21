"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

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
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react";

import {
    getIndicators,
    getTeacherCompliance,
    getSubjectCompliance,
    compareSemesters,
    generateReport
} from "@/app/api/reports/reportService";

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

type ReportType = "semestral" | "anual" | "docente" | "unidade" | "cumprimento";
type TabType = "relatorios" | "indicadores" | "comparacao";

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

const academicPeriods = [
    { label: "2025 – 1.º Semestre", value: "2025-1" },
    { label: "2025 – 2.º Semestre", value: "2025-2" },
    { label: "2026 – 1.º Semestre", value: "2026-1" },
    { label: "2026 – 2.º Semestre", value: "2026-2" },
];

const reportOptions = [
    { id: "semestral", title: "Relatório semestral", description: "Resumo completo do desempenho pedagógico de um semestre.", icon: <CalendarDays size={22} /> },
    { id: "anual", title: "Relatório anual", description: "Consolidação dos indicadores pedagógicos do ano lectivo.", icon: <FileBarChart size={22} /> },
    { id: "docente", title: "Relatório por docente", description: "Acompanhamento individual do cumprimento pedagógico.", icon: <Users size={22} /> },
    { id: "unidade", title: "Relatório por unidade curricular", description: "Indicadores e actividades associados a uma unidade curricular.", icon: <Layers3 size={22} /> },
    { id: "cumprimento", title: "Relatório de cumprimento", description: "Análise global do cumprimento pedagógico.", icon: <ClipboardCheck size={22} /> },
];

export default function ReportsAndIndicators() {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<TabType>("indicadores");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("2026-1");
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
    const [selectedReport, setSelectedReport] = useState<ReportType>("semestral");

    const [selectedPeriod1, setSelectedPeriod1] = useState<string>("2025-2");
    const [selectedPeriod2, setSelectedPeriod2] = useState<string>("2026-1");

    const [reportDialogVisible, setReportDialogVisible] = useState(false);
    const [selectedReportTitle, setSelectedReportTitle] = useState("Relatório semestral");

    // Estados reais vindos da API
    const [indicatorsData, setIndicatorsData] = useState<any>(null);
    const [teachersData, setTeachersData] = useState<any[]>([]);
    const [courseUnitsData, setCourseUnitsData] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState<any>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [indicatorsRes, teachersRes, subjectsRes, comparisonRes] = await Promise.all([
                getIndicators({ period: selectedPeriod, teacher_id: selectedTeacher ?? undefined }).catch(() => null),
                getTeacherCompliance(selectedPeriod).catch(() => []),
                getSubjectCompliance(selectedPeriod).catch(() => []),
                compareSemesters(selectedPeriod1, selectedPeriod2).catch(() => null),
            ]);

            setIndicatorsData(indicatorsRes);
            setTeachersData(teachersRes || []);
            setCourseUnitsData(subjectsRes || []);
            setComparisonData(comparisonRes);
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao carregar dados de relatórios.", life: 4000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedPeriod, selectedTeacher, selectedPeriod1, selectedPeriod2]);

    const teacherOptions = [
        { label: "Todos os docentes", value: null },
        ...teachersData.map((t) => ({ label: t.name, value: t.id })),
    ];

    // Gráficos Reais
    const teacherChartData = useMemo(() => {
        const filtered = selectedTeacher ? teachersData.filter((t) => t.id === selectedTeacher) : teachersData;
        return {
            labels: filtered.map((t) => t.name),
            datasets: [{
                label: "Cumprimento (%)",
                data: filtered.map((t) => t.compliance),
                backgroundColor: ["#1D4ED8", "#7C3AED", "#0891B2", "#16A34A", "#D97706"],
                borderRadius: 8,
                barThickness: 28,
            }],
        };
    }, [teachersData, selectedTeacher]);

    const lessonsChartData = useMemo(() => {
        const realized = indicatorsData?.lessons?.total_aulas_realizadas || 0;
        const confirmed = indicatorsData?.lessons?.total_aulas_confirmadas || 0;
        const disputed = indicatorsData?.lessons?.total_aulas_disputa || 0;
        const cancelled = indicatorsData?.lessons?.total_aulas_canceladas || 0;
        return {
            labels: ["Realizadas", "Confirmadas", "Em Disputa", "Canceladas"],
            datasets: [{
                data: [realized, confirmed, disputed, cancelled],
                backgroundColor: ["#1D4ED8", "#16A34A", "#D97706", "#DC2626"],
                borderWidth: 0,
            }],
        };
    }, [indicatorsData]);

    const evaluationChartData = useMemo(() => {
        const onTime = indicatorsData?.assessments?.avaliacoes_dentro_prazo || 0;
        const late = indicatorsData?.assessments?.avaliacoes_fora_prazo || 0;
        const pending = indicatorsData?.assessments?.avaliacoes_pendentes || 0;
        return {
            labels: ["Dentro do prazo", "Fora do prazo", "Pendentes"],
            datasets: [{
                data: [onTime, late, pending],
                backgroundColor: ["#16A34A", "#DC2626", "#D97706"],
                borderWidth: 0,
            }],
        };
    }, [indicatorsData]);

    const courseChartData = useMemo(() => {
        return {
            labels: courseUnitsData.map((c) => c.name),
            datasets: [{
                label: "Cumprimento (%)",
                data: courseUnitsData.map((c) => c.compliance),
                backgroundColor: "rgba(8, 145, 178, 0.85)",
                borderRadius: 7,
            }],
        };
    }, [courseUnitsData]);

    const comparisonChartData = useMemo(() => {
        if (!comparisonData) return { labels: [], datasets: [] };
        return {
            labels: ["Aulas", "Confirmações", "Avaliações", "Pautas", "Actividades", "Docente"],
            datasets: [
                {
                    label: comparisonData.period1?.name || selectedPeriod1,
                    data: Object.values(comparisonData.period1?.stats || {}),
                    backgroundColor: "rgba(29, 78, 216, 0.85)",
                    borderRadius: 7,
                },
                {
                    label: comparisonData.period2?.name || selectedPeriod2,
                    data: Object.values(comparisonData.period2?.stats || {}),
                    backgroundColor: "rgba(124, 58, 237, 0.85)",
                    borderRadius: 7,
                },
            ],
        };
    }, [comparisonData, selectedPeriod1, selectedPeriod2]);

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" as const, labels: { usePointStyle: true, padding: 18 } } },
    };

    const barOptions = { ...commonOptions, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v: any) => `${v}%` } }, x: { grid: { display: false } } } };
    const horizontalBarOptions = { ...commonOptions, indexAxis: "y" as const, scales: { x: { beginAtZero: true, max: 100, ticks: { callback: (v: any) => `${v}%` } }, y: { grid: { display: false } } } };
    const doughnutOptions = { ...commonOptions, cutout: "68%" };

    const handleGenerateReportAction = async () => {
        try {
            await generateReport({
                report_type: selectedReport,
                period: selectedPeriod,
                teacher_id: selectedTeacher || undefined,
            });
            toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Relatório gerado com sucesso.", life: 3000 });
            setReportDialogVisible(false);
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao gerar relatório.", life: 4000 });
        }
    };

    if (loading && !indicatorsData) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", padding: "1.25rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}>
            <Toast ref={toast} />

            {/* HEADER */}
            <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <div className="flex align-items-center gap-2 mb-2">
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BarChart3 size={22} />
                        </div>
                        <h1 style={{ margin: 0, color: COLORS.dark, fontSize: 25, fontWeight: 700 }}>Relatórios e Indicadores</h1>
                    </div>
                    <p style={{ margin: 0, color: COLORS.muted, fontSize: 14 }}>Análise dinâmica do desempenho pedagógico e comparação entre períodos lectivos.</p>
                </div>

                <div className="flex gap-2">
                    <Button label="Actualizar" icon={<RefreshCw size={16} />} severity="secondary" outlined onClick={loadData} />
                    <Button label="Gerar relatório" icon={<FileText size={16} />} onClick={() => { setSelectedReportTitle(reportOptions.find(r => r.id === selectedReport)?.title || "Relatório"); setReportDialogVisible(true); }} />
                </div>
            </div>

            {/* FILTROS */}
            <Card className="mb-4" style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label className="block mb-2 font-semibold" style={{ fontSize: 13, color: COLORS.text }}>Período lectivo</label>
                        <Dropdown value={selectedPeriod} options={academicPeriods} optionLabel="label" optionValue="value" onChange={(e) => setSelectedPeriod(e.value)} className="w-full" />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block mb-2 font-semibold" style={{ fontSize: 13, color: COLORS.text }}>Docente</label>
                        <Dropdown value={selectedTeacher} options={teacherOptions} onChange={(e) => setSelectedTeacher(e.value)} placeholder="Todos os docentes" className="w-full" />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block mb-2 font-semibold" style={{ fontSize: 13, color: COLORS.text }}>Tipo de relatório</label>
                        <Dropdown value={selectedReport} options={reportOptions.map(r => ({ label: r.title, value: r.id }))} onChange={(e) => setSelectedReport(e.value)} className="w-full" />
                    </div>
                </div>
            </Card>

            {/* KPIS */}
            <div className="grid mb-4">
                <KpiCard title="Aulas realizadas" value={`${indicatorsData?.lessons?.pct_confirmadas || 0}%`} subtitle="confirmadas" icon={<GraduationCap size={20} />} iconBg={COLORS.primaryLight} iconColor={COLORS.primary} trend="Real" positive />
                <KpiCard title="Aulas confirmadas" value={`${indicatorsData?.lessons?.total_aulas_confirmadas || 0}`} subtitle="registos válidos" icon={<CheckCircle2 size={20} />} iconBg={COLORS.greenLight} iconColor={COLORS.green} trend="Ativo" positive />
                <KpiCard title="Avaliações no prazo" value={`${indicatorsData?.assessments?.pct_dentro_prazo || 0}%`} subtitle="dentro do prazo" icon={<Clock3 size={20} />} iconBg={COLORS.orangeLight} iconColor={COLORS.orange} trend="Prazo" positive />
                <KpiCard title="Pautas entregues" value={`${indicatorsData?.grade_sheets?.pct_entregues || 0}%`} subtitle="submetidas" icon={<FileCheck2 size={20} />} iconBg={COLORS.purpleLight} iconColor={COLORS.purple} trend="Oficial" positive />
                <KpiCard title="Actividades concluídas" value={`${indicatorsData?.tasks?.pct_concluidas || 0}%`} subtitle="concluídas" icon={<ClipboardCheck size={20} />} iconBg={COLORS.cyanLight} iconColor={COLORS.cyan} trend="Tarefas" positive />
                <KpiCard title="Cumprimento global" value={`${Math.round(((indicatorsData?.lessons?.pct_confirmadas || 0) + (indicatorsData?.assessments?.pct_dentro_prazo || 0)) / 2)}%`} subtitle="média geral" icon={<Users size={20} />} iconBg={COLORS.pinkLight} iconColor={COLORS.pink} trend="Global" positive />
            </div>

            {/* TABS */}
            <div className="flex gap-2 mb-4 flex-wrap" style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 12 }}>
                <TabButton active={activeTab === "indicadores"} icon={<BarChart3 size={17} />} label="Indicadores" onClick={() => setActiveTab("indicadores")} />
                <TabButton active={activeTab === "relatorios"} icon={<FileBarChart size={17} />} label="Relatórios" onClick={() => setActiveTab("relatorios")} />
                <TabButton active={activeTab === "comparacao"} icon={<LineChart size={17} />} label="Comparar semestres" onClick={() => setActiveTab("comparacao")} />
            </div>

            {/* RELATÓRIOS */}
            {activeTab === "relatorios" && (
                <div>
                    <SectionTitle icon={<FileBarChart size={20} />} title="Relatórios pedagógicos" description="Seleccione o tipo de relatório que pretende consultar ou gerar." />
                    <div className="grid mb-4">
                        {reportOptions.map((report) => (
                            <div key={report.id} className="col-12 md:col-6 lg:col-4">
                                <div onClick={() => { setSelectedReport(report.id as ReportType); setSelectedReportTitle(report.title); setReportDialogVisible(true); }} style={{ height: "100%", padding: "1.25rem", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, cursor: "pointer", transition: "all .2s ease" }}>
                                    <div className="flex justify-content-between align-items-start mb-3">
                                        <div style={{ width: 44, height: 44, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.primaryLight, color: COLORS.primary }}>{report.icon}</div>
                                    </div>
                                    <h3 style={{ margin: "0 0 8px", color: COLORS.dark, fontSize: 16 }}>{report.title}</h3>
                                    <p style={{ margin: 0, color: COLORS.muted, fontSize: 13, lineHeight: 1.6 }}>{report.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* INDICADORES */}
            {activeTab === "indicadores" && (
                <div>
                    <SectionTitle icon={<BarChart3 size={20} />} title="Indicadores pedagógicos" description="Visão geral do desempenho pedagógico no período seleccionado." />

                    <div className="grid mb-4">
                        <div className="col-12 lg:col-8">
                            <Card title="Cumprimento por docente" subTitle="Percentagem de cumprimento baseada em dados reais" style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                                <div style={{ height: 340 }}>
                                    <Bar data={teacherChartData} options={barOptions} />
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 lg:col-4">
                            <Card title="Distribuição das aulas" subTitle="Estado das aulas" style={{ height: "100%", border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                                <div style={{ height: 280, display: "flex", justifyContent: "center" }}>
                                    <Doughnut data={lessonsChartData} options={doughnutOptions} />
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="grid mb-4">
                        <div className="col-12 lg:col-7">
                            <Card title="Cumprimento por unidade curricular" subTitle="Execução pedagógica por disciplina" style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                                <div style={{ height: 340 }}>
                                    <Bar data={courseChartData} options={horizontalBarOptions} />
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 lg:col-5">
                            <Card title="Avaliações" subTitle="Prazos cumpridos" style={{ height: "100%", border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                                <div style={{ height: 280, display: "flex", justifyContent: "center" }}>
                                    <Pie data={evaluationChartData} options={doughnutOptions} />
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* TABELA DE DOCENTES */}
                    <Card title="Cumprimento pedagógico por docente" subTitle="Detalhamento individual" style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <DataTable value={teachersData} paginator rows={5} stripedRows responsiveLayout="scroll" emptyMessage="Nenhum docente encontrado.">
                            <Column field="name" header="Docente" body={(row) => <div className="font-semibold">{row.name}</div>} style={{ minWidth: 200 }} />
                            <Column field="planned" header="Aulas Planeadas" />
                            <Column field="realized" header="Realizadas" />
                            <Column field="confirmed" header="Confirmadas" />
                            <Column field="evaluationsOnTime" header="Avaliações no Prazo" />
                            <Column field="activitiesCompleted" header="Actividades" />
                            <Column field="compliance" header="Cumprimento" body={(row) => <div className="flex align-items-center gap-2"><ProgressBar value={row.compliance} showValue={false} style={{ width: 80, height: 6 }} /><strong>{row.compliance}%</strong></div>} />
                        </DataTable>
                    </Card>
                </div>
            )}

            {/* COMPARAÇÃO */}
            {activeTab === "comparacao" && (
                <div>
                    <SectionTitle icon={<LineChart size={20} />} title="Comparação entre semestres" description="Seleccione dois períodos lectivos para analisar a evolução." />

                    <Card className="mb-4" style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="grid align-items-end">
                            <div className="col-12 md:col-5">
                                <label className="block mb-2 font-semibold">Primeiro período</label>
                                <Dropdown value={selectedPeriod1} options={academicPeriods} optionLabel="label" optionValue="value" onChange={(e) => setSelectedPeriod1(e.value)} className="w-full" />
                            </div>
                            <div className="col-12 md:col-2 flex justify-content-center align-items-center">
                                <div style={{ width: 42, height: 42, borderRadius: "50%", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>VS</div>
                            </div>
                            <div className="col-12 md:col-5">
                                <label className="block mb-2 font-semibold">Segundo período</label>
                                <Dropdown value={selectedPeriod2} options={academicPeriods} optionLabel="label" optionValue="value" onChange={(e) => setSelectedPeriod2(e.value)} className="w-full" />
                            </div>
                        </div>
                    </Card>

                    <Card title="Comparação dos indicadores" subTitle="Evolução percentual entre os semestres" className="mb-4" style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ height: 390 }}>
                            <Bar data={comparisonChartData} options={barOptions} />
                        </div>
                    </Card>
                </div>
            )}

            {/* DIALOG DE RELATÓRIO */}
            <Dialog visible={reportDialogVisible} onHide={() => setReportDialogVisible(false)} header={selectedReportTitle} modal style={{ width: "520px" }}>
                <div>
                    <p style={{ color: COLORS.muted }}>Deseja gerar e exportar o <strong>{selectedReportTitle}</strong> referente ao período <strong>{selectedPeriod}</strong>?</p>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" severity="secondary" outlined onClick={() => setReportDialogVisible(false)} />
                        <Button label="Confirmar e Gerar" icon={<FileText size={16} />} onClick={handleGenerateReportAction} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

function KpiCard({ title, value, subtitle, icon, iconBg, iconColor, trend, positive }: any) {
    return (
        <div className="col-12 sm:col-6 lg:col-4 xl:col-2">
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "1rem", height: "100%" }}>
                <div className="flex justify-content-between align-items-start">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: positive ? COLORS.green : COLORS.red, background: positive ? COLORS.greenLight : COLORS.redLight, padding: "4px 7px", borderRadius: 20 }}>{trend}</span>
                </div>
                <div style={{ marginTop: "1rem" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.dark }}>{value}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 4 }}>{title}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>{subtitle}</div>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ icon, title, description }: any) {
    return (
        <div className="mb-4">
            <div className="flex align-items-center gap-2">
                <span style={{ color: COLORS.primary }}>{icon}</span>
                <h2 style={{ margin: 0, fontSize: 19, color: COLORS.dark }}>{title}</h2>
            </div>
            <p style={{ margin: "6px 0 0", color: COLORS.muted, fontSize: 13 }}>{description}</p>
        </div>
    );
}

function TabButton({ active, icon, label, onClick }: any) {
    return (
        <button type="button" onClick={onClick} style={{ border: "none", cursor: "pointer", padding: "0.7rem 1rem", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? COLORS.primary : COLORS.muted, background: active ? COLORS.primaryLight : "transparent" }}>
            {icon}
            {label}
        </button>
    );
}