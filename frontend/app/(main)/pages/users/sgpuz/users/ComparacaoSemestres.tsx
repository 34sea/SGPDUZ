"use client";

import React, { useMemo, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";

import {
    BarChart3, ChartLine, Clock3, CheckCircle2, AlertTriangle, FileText,
    Users, BookOpen, Search, ArrowRight, Download, Share2,
} from "lucide-react";

import {
    getLessons,
} from "@/api/pedagogical/pedagogicalService";
import { getAssessments } from "@/api/assessments/assessmentService";
import { getFinalGradeSheets } from "@/api/assessments/assessmentService";
import { getAdHocTasks } from "@/api/activities/activityService";

const COLORS = {
    primary: "#1D4ED8", primaryLight: "#EFF6FF",
    green: "#16A34A", greenLight: "#DCFCE7",
    orange: "#D97706", orangeLight: "#FEF3C7",
    purple: "#7C3AED", purpleLight: "#F3E8FF",
    cyan: "#0891B2", cyanLight: "#CFFAFE",
    red: "#DC2626", redLight: "#FEE2E2",
    dark: "#0F172A", text: "#334155", muted: "#64748B", light: "#94A3B8",
    border: "#E2E8F0", background: "#F8FAFC", white: "#FFFFFF",
};

interface Metric {
    nome: string;
    semestre1: number;
    semestre2: number;
    unidade: "%" | "unidades";
}

const periods = [
    { label: "1.º Semestre 2025/2026", value: "s1" },
    { label: "2.º Semestre 2025/2026", value: "s2" },
    { label: "1.º Semestre 2026/2027", value: "s3" },
    { label: "2.º Semestre 2026/2027", value: "s4" },
];

export default function ComparacaoSemestres() {
    const [period1, setPeriod1] = useState(periods[0]);
    const [period2, setPeriod2] = useState(periods[2]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [metrics, setMetrics] = useState<Metric[]>([]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [lessons, assessments, gradeSheets, tasks] = await Promise.all([
                getLessons(),
                getAssessments(),
                getFinalGradeSheets(),
                getAdHocTasks(),
            ]);

            const totalLessons = lessons.length;
            const confirmedLessons = lessons.filter((l: any) => l.status === "CONFIRMADA" || l.status === "RESOLVIDA").length;
            const totalAssessments = assessments.length;
            const onTimeAssessments = assessments.filter((a: any) => a.status === "DENTRO_DO_PRAZO" || a.status === "Publicado").length;
            const totalGradeSheets = gradeSheets.length;
            const totalTasks = tasks.length;
            const deliveredTasks = tasks.filter((t: any) => t.status === "Entregue" || t.status === "VERIFICADA").length;

            // Semestre 1 (mock comparison based on real data scaled)
            // In a real scenario, we'd filter by academic_year/semester
            const s1Lessons = Math.round(confirmedLessons * 0.85);
            const s2Lessons = confirmedLessons;
            const s1Assessments = Math.round(onTimeAssessments * 0.9);
            const s2Assessments = onTimeAssessments;
            const s1GradeSheets = Math.round(totalGradeSheets * 0.8);
            const s2GradeSheets = totalGradeSheets;
            const s1Tasks = Math.round(deliveredTasks * 0.88);
            const s2Tasks = deliveredTasks;

            setMetrics([
                { nome: "Aulas realizadas", semestre1: s1Lessons, semestre2: s2Lessons, unidade: "%" },
                { nome: "Aulas confirmadas", semestre1: s1Lessons, semestre2: s2Lessons, unidade: "%" },
                { nome: "Avaliações dentro do prazo", semestre1: s1Assessments, semestre2: s2Assessments, unidade: "%" },
                { nome: "Pautas arquivadas", semestre1: s1GradeSheets, semestre2: s2GradeSheets, unidade: "%" },
                { nome: "Actividades entregues", semestre1: s1Tasks, semestre2: s2Tasks, unidade: "%" },
            ]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar dados de comparação.");
            console.error("Erro ao carregar comparação:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const formatPercent = (v: number) => `${v}%`;
    const diff = (a: number, b: number) => b - a;

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Comparação entre Semestres</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Seleccione dois períodos lectivos e compare os principais indicadores pedagógicos.
                    </div>
                </div>
                <Button label="Exportar PDF" icon={<Download size={16} />} text severity="secondary" />
            </div>

            {error && (
                <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
            )}

            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "2rem", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, maxWidth: "300px" }}>
                        <div style={{ fontSize: "0.78rem", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Período A</div>
                        <Dropdown
                            value={period1} onChange={(e: any) => setPeriod1(e.value)}
                            options={periods} optionLabel="label" optionValue="value" placeholder="Selecione..." style={{ width: "100%" }}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: COLORS.muted, fontSize: "0.85rem" }}>
                        <ArrowRight size={18} /> ×
                    </div>
                    <div style={{ flex: 1, maxWidth: "300px" }}>
                        <div style={{ fontSize: "0.78rem", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Período B</div>
                        <Dropdown
                            value={period2} onChange={(e: any) => setPeriod2(e.value)}
                            options={periods} optionLabel="label" optionValue="value" placeholder="Selecione..." style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid mb-4">
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Período A</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.muted, marginTop: "4px" }}>{formatPercent(metrics[0]?.semestre1 || 0)}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ChartLine size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Período B</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.primary, marginTop: "4px" }}>{formatPercent(metrics[0]?.semestre2 || 0)}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ChartLine size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Variação</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.green, marginTop: "4px" }}>{diff(metrics[0]?.semestre1 || 0, metrics[0]?.semestre2 || 0) >= 0 ? "+" : ""}{diff(metrics[0]?.semestre1 || 0, metrics[0]?.semestre2 || 0)}%</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Comparativo de Indicadores</h2>
                        <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Variação percentual entre os períodos seleccionados.</p>
                    </div>
                    <Tag value={`${metrics.length} indicadores`} severity="info" rounded />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {metrics.map((m) => {
                        const d = diff(m.semestre1, m.semestre2);
                        const isPositive = d >= 0;
                        return (
                            <div key={m.nome} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: `1px solid ${COLORS.border}`, borderRadius: "10px", background: COLORS.white }}>
                                <div className="flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <BarChart3 size={20} />
                                    </div>
                                    <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.88rem" }}>{m.nome}</div>
                                </div>
                                <div className="flex gap-3" style={{ minWidth: "260px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: "90px" }}>
                                        <div style={{ fontSize: "0.82rem", color: COLORS.muted }}>{period1.label}</div>
                                        <div style={{ fontWeight: 700, color: COLORS.text, fontSize: "0.9rem" }}>{formatPercent(m.semestre1)}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: "90px" }}>
                                        <div style={{ fontSize: "0.82rem", color: COLORS.muted }}>{period2.label}</div>
                                        <div style={{ fontWeight: 700, color: isPositive ? COLORS.green : COLORS.red, fontSize: "0.9rem" }}>{formatPercent(m.semestre2)}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: "90px" }}>
                                        <div style={{ fontSize: "0.82rem", color: COLORS.muted }}>{isPositive ? "Variação +" : "Variação -"}</div>
                                        <div style={{ fontWeight: 700, color: isPositive ? COLORS.green : COLORS.red, fontSize: "0.9rem" }}>{isPositive ? "+" : ""}{d}%</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <div className="flex gap-2 mt-4">
                <Button label="Visualizar gráfico" icon={<BarChart3 size={16} />} text severity="secondary" />
                <Button label="Exportar comparação" icon={<FileText size={16} />} />
                <Button label="Partilhar" icon={<Share2 size={16} />} text severity="secondary" />
            </div>
        </div>
    );
}
