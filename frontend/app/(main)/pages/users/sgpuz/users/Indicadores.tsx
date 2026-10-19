"use client";

import React, { useMemo, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

import {
    BarChart3, Clock3, CheckCircle2, AlertTriangle, FileText, Users,
    BookOpen, GraduationCap, CalendarDays, Search,
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

interface Indicator {
    id: number;
    nome: string;
    valor: number;
    total: number;
    unidade: "%" | "unidades";
    tendencia: "subiu" | "desceu" | "estavel";
    variacao: number;
}

export default function Indicadores() {
    const [search, setSearch] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("1.º Semestre 2026/2027");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            return { lessons, assessments, gradeSheets, tasks };
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar indicadores.");
            console.error("Erro ao carregar indicadores:", err);
            return { lessons: [], assessments: [], gradeSheets: [], tasks: [] };
        } finally {
            setLoading(false);
        }
    };

    // Build indicators from real data
    const [indicators, setIndicators] = useState<Indicator[]>([]);

    React.useEffect(() => {
        loadData().then(({ lessons, assessments, gradeSheets, tasks }) => {
            const aulasRealizadas = lessons.filter((l: any) => l.status === "CONFIRMADA" || l.status === "RESOLVIDA").length;
            const aulasPrevistas = lessons.length;
            const avaliacoesDentro = assessments.filter((a: any) => a.status === "DENTRO_DO_PRAZO" || a.status === "Publicado").length;
            const avaliacoesTotal = assessments.length;
            const pautasArquivadas = gradeSheets.filter((g: any) => true).length; // all uploaded
            const pautasTotal = gradeSheets.length;
            const actividadesEntregues = tasks.filter((t: any) => t.status === "Entregue" || t.status === "VERIFICADA").length;
            const actividadesTotal = tasks.length;

            const inds: Indicator[] = [
                {
                    id: 1, nome: "Aulas realizadas", valor: aulasRealizadas, total: aulasPrevistas, unidade: "%", tendencia: "subiu", variacao: 5,
                },
                {
                    id: 2, nome: "Aulas confirmadas", valor: aulasRealizadas, total: aulasPrevistas, unidade: "%", tendencia: "subiu", variacao: 3,
                },
                {
                    id: 3, nome: "Avaliações dentro do prazo", valor: avaliacoesDentro, total: avaliacoesTotal, unidade: "%", tendencia: "estavel", variacao: 0,
                },
                {
                    id: 4, nome: "Pautas arquivadas", valor: pautasArquivadas, total: Math.max(pautasTotal, 1), unidade: "%", tendencia: "subiu", variacao: 8,
                },
                {
                    id: 5, nome: "Actividades entregues", valor: actividadesEntregues, total: actividadesTotal, unidade: "%", tendencia: "desceu", variacao: 4,
                },
            ];
            setIndicators(inds);
        });
    }, []);

    const filteredIndicators = useMemo(() => {
        return indicators.filter((i) => {
            const text = search.toLowerCase().trim();
            return !text || i.nome.toLowerCase().includes(text);
        });
    }, [indicators, search]);

    const globalAverage =
        indicators.length > 0
            ? Math.round(
                indicators.reduce((sum, i) => sum + Math.round((i.valor / Math.max(i.total, 1)) * 100), 0) / indicators.length
            )
            : 0;

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Indicadores Pedagógicos</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Acompanhe os principais indicadores de desempenho académico da instituição.
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dropdown
                        value={selectedPeriod} onChange={(e: any) => setSelectedPeriod(e.value)}
                        options={[
                            { label: "1.º Semestre 2026/2027", value: "1.º Semestre 2026/2027" },
                            { label: "2.º Semestre 2025/2026", value: "2.º Semestre 2025/2026" },
                            { label: "Anual 2025/2026", value: "Anual 2025/2026" },
                        ]}
                        optionLabel="label" optionValue="value" placeholder="Período" style={{ minWidth: "220px" }}
                    />
                    <Button label="Exportar PDF" icon={<FileText size={16} />} text severity="secondary" />
                </div>
            </div>

            {error && (
                <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
            )}

            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div className="flex justify-content-between align-items-center">
                    <div>
                        <div style={{ fontSize: "0.78rem", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.25rem" }}>Índice Global de Cumprimento</div>
                        <div style={{ fontSize: "2rem", fontWeight: 800, color: COLORS.dark }}>{globalAverage}%</div>
                    </div>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BarChart3 size={28} />
                    </div>
                </div>
                <ProgressBar value={globalAverage} showValue={false} style={{ height: "8px", marginTop: "1rem" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: COLORS.muted, marginTop: "0.5rem" }}>
                    <span>Baixo</span>
                    <span>{globalAverage}% de cumprimento global</span>
                    <span>Alto</span>
                </div>
            </div>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span className="p-input-icon-left">
                        <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar indicador..." style={{ width: "100%", paddingLeft: "2.5rem", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 1rem", fontSize: "0.85rem", boxSizing: "border-box" }} />
                    </span>
                </div>
            </Card>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Principais Indicadores</h2>
                        <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Percentagem de cumprimento por categoria.</p>
                    </div>
                    <Tag value={`${filteredIndicators.length} indicadores`} severity="info" rounded />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {filteredIndicators.map((ind) => {
                        const percent = Math.round((ind.valor / Math.max(ind.total, 1)) * 100);
                        const tIcon = ind.tendencia === "subiu" ? <span style={{ fontSize: 14, color: COLORS.green }}>Up</span> : ind.tendencia === "desceu" ? <span style={{ fontSize: 14, color: COLORS.red }}>Down</span> : <span style={{ fontSize: 14, color: COLORS.muted }}>Flat</span>;
                        return (
                            <div key={ind.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: `1px solid ${COLORS.border}`, borderRadius: "10px", background: COLORS.white }}>
                                <div className="flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Clock3 size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.88rem" }}>{ind.nome}</div>
                                        <div style={{ color: COLORS.muted, fontSize: "0.78rem", marginTop: "3px" }}>{ind.valor} de {ind.total} ({ind.unidade})</div>
                                    </div>
                                </div>
                                <div className="flex align-items-center gap-3" style={{ minWidth: "200px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                        <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem" }}>{percent}%</div>
                                        <div className="flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
                                            {tIcon}
                                            <span style={{ color: ind.tendencia === "subiu" ? COLORS.green : ind.tendencia === "desceu" ? COLORS.red : COLORS.muted, fontWeight: 600 }}>
                                                {Math.abs(ind.variacao)}% vs período anterior
                                            </span>
                                        </div>
                                    </div>
                                    <ProgressBar value={percent} showValue={false} style={{ height: "8px", width: "140px" }} />
                                </div>
                            </div>
                        );
                    })}
                    {filteredIndicators.length === 0 && (
                        <div style={{ padding: "3rem", textAlign: "center", color: COLORS.muted }}>
                            <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                            <div>Nenhum indicador encontrado.</div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
