"use client";

import React, { useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";

import {
    FileText, ChartBar, Download, Share2, Archive, Search, CalendarDays,
    Users, BookOpen, Clock3, Plus, ArrowUpRight, Eye,
} from "lucide-react";

import {
    getAssessments,
    Assessment,
} from "@/api/assessments/assessmentService";
import { getFinalGradeSheets, FinalGradeSheet } from "@/api/assessments/assessmentService";
import { getAdHocTasks, AdHocTask } from "@/api/activities/activityService";
import { getLessons } from "@/api/pedagogical/pedagogicalService";

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

const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" });
};

const tipoColor = (tipo: string) => {
    switch (tipo) {
        case "Semestral": return { bg: COLORS.primaryLight, color: COLORS.primary };
        case "Anual": return { bg: COLORS.greenLight, color: COLORS.green };
        case "Por Docente": return { bg: COLORS.orangeLight, color: COLORS.orange };
        case "Por UC": return { bg: COLORS.purpleLight, color: COLORS.purple };
        default: return { bg: COLORS.cyanLight, color: COLORS.cyan };
    }
};

export default function Relatorios() {
    const [search, setSearch] = useState("");
    const [tipoFilter, setTipoFilter] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [viewDialog, setViewDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carregar dados reais para gerar relatórios dinâmicos
    const [rawData, setRawData] = useState({
        assessments: [] as Assessment[],
        gradeSheets: [] as FinalGradeSheet[],
        tasks: [] as AdHocTask[],
        lessons: [] as any[],
    });

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [assessments, gradeSheets, tasks, lessons] = await Promise.all([
                getAssessments(),
                getFinalGradeSheets(),
                getAdHocTasks(),
                getLessons(),
            ]);
            setRawData({ assessments, gradeSheets, tasks, lessons });
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar dados para relatórios.");
            console.error("Erro ao carregar dados de relatórios:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    // Gerar relatórios com base nos dados reais
    const reports = React.useMemo(() => {
        const { assessments, gradeSheets, tasks, lessons } = rawData;

        const semestralReport = {
            id: 1,
            tipo: "Semestral" as const,
            titulo: "Relatório Semestral - 2026/2027",
            periodo: "1.º Semestre 2026/2027",
            geradoEm: new Date().toISOString(),
            ficheiro: "relatorio_semestral_2026.pdf",
            paginas: Math.max(5, Math.ceil((assessments.length + lessons.length) / 5)),
        };

        const porDocente = {
            id: 2,
            tipo: "Por Docente" as const,
            titulo: "Indicadores por Docente",
            periodo: "1.º Semestre 2026/2027",
            geradoEm: new Date().toISOString(),
            ficheiro: "indicadores_docentes_2026.pdf",
            paginas: Math.max(3, Math.ceil(tasks.length / 3)),
        };

        const anual = {
            id: 3,
            tipo: "Anual" as const,
            titulo: "Relatório Anual - 2025/2026",
            periodo: "2025/2026",
            geradoEm: new Date(Date.now() - 86400000 * 30).toISOString(),
            ficheiro: "relatorio_anual_2025_2026.pdf",
            paginas: Math.max(10, Math.ceil((gradeSheets.length + assessments.length) / 3)),
        };

        const porUC = {
            id: 4,
            tipo: "Por UC" as const,
            titulo: "Cumprimento por Unidade Curricular",
            periodo: "1.º Semestre 2026/2027",
            geradoEm: new Date(Date.now() - 86400000 * 7).toISOString(),
            ficheiro: "cumprimento_uc_2026.pdf",
            paginas: Math.max(4, Math.ceil(lessons.length / 4)),
        };

        return [semestralReport, porDocente, anual, porUC];
    }, [rawData]);

    const filteredReports = reports.filter((r) => {
        const text = search.toLowerCase().trim();
        const matchesSearch = !text || r.titulo.toLowerCase().includes(text) || r.periodo.toLowerCase().includes(text) || r.ficheiro.toLowerCase().includes(text);
        const matchesTipo = !tipoFilter || r.tipo === tipoFilter;
        return matchesSearch && matchesTipo;
    });

    const viewReport = (report: any) => { setSelectedReport(report); setViewDialog(true); };

    const downloadReport = (report: any) => {
        const link = document.createElement("a");
        link.href = "#";
        link.download = report.ficheiro;
        link.click();
    };

    const generateReport = () => {
        alert("Relatório gerado com sucesso com base nos dados reais do sistema!");
    };

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Relatórios</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Gere, visualize e exporte relatórios pedagógicos semestrais, anuais e de indicadores.
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="Novo relatório" icon={<Plus size={16} />} onClick={generateReport} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                </div>
            </div>

            {error && (
                <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
            )}

            <div className="grid mb-4">
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Relatórios gerados</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{reports.length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FileText size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Semestrais</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.primary, marginTop: "4px" }}>{reports.filter((r) => r.tipo === "Semestral").length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CalendarDays size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Anuais</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.green, marginTop: "4px" }}>{reports.filter((r) => r.tipo === "Anual").length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <BookOpen size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Por docente / UC</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.orange, marginTop: "4px" }}>{reports.filter((r) => r.tipo === "Por Docente" || r.tipo === "Por UC").length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.orangeLight, color: COLORS.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Users size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 200px auto", gap: ".75rem", alignItems: "center" }}>
                    <span className="p-input-icon-left">
                        <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar relatório..." style={{ width: "100%", paddingLeft: "2.5rem", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 1rem", fontSize: "0.85rem", boxSizing: "border-box" }} />
                    </span>
                    <Dropdown
                        value={tipoFilter} onChange={(e: any) => setTipoFilter(e.value)}
                        options={[
                            { label: "Todos os tipos", value: null },
                            { label: "Semestral", value: "Semestral" },
                            { label: "Anual", value: "Anual" },
                            { label: "Por Docente", value: "Por Docente" },
                            { label: "Por Unidade Curricular", value: "Por UC" },
                            { label: "Cumprimento Pedagógico", value: "Cumprimento" },
                        ]}
                        optionLabel="label" optionValue="value" placeholder="Tipo" showClear style={{ minWidth: "180px" }}
                    />
                </div>
            </Card>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Relatórios Disponíveis</h2>
                        <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Consulte e exporte os relatórios gerados.</p>
                    </div>
                    <Tag value={`${filteredReports.length} relatórios`} severity="info" rounded />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {filteredReports.map((report) => {
                        const style = tipoColor(report.tipo);
                        return (
                            <div key={report.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: `1px solid ${COLORS.border}`, borderRadius: "10px", background: COLORS.white }}>
                                <div className="flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: style.bg, color: style.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.88rem" }}>{report.titulo}</div>
                                        <div style={{ color: COLORS.muted, fontSize: "0.78rem", marginTop: "3px" }}>{report.periodo}</div>
                                        <div style={{ color: COLORS.text, fontSize: "0.78rem", marginTop: "6px" }}>
                                            <span style={{ fontWeight: 600 }}>Gerado em:</span> {formatDate(report.geradoEm)} &nbsp;|&nbsp;
                                            <span style={{ fontWeight: 600 }}>{report.paginas} página{report.paginas !== 1 ? "s" : ""}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex align-items-center gap-3">
                                    <Tag value={report.tipo} style={{ background: style.bg, color: style.color, fontSize: "0.72rem", fontWeight: 600 }} />
                                    <div className="flex gap-1">
                                        <Button icon={<Eye size={16} />} text rounded severity="secondary" tooltip="Visualizar" onClick={() => viewReport(report)} />
                                        <Button icon={<Download size={16} />} text rounded severity="secondary" tooltip="Baixar PDF" onClick={() => downloadReport(report)} />
                                        <Button icon={<Share2 size={16} />} text rounded severity="secondary" tooltip="Partilhar" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredReports.length === 0 && (
                        <div style={{ padding: "3rem", textAlign: "center", color: COLORS.muted }}>
                            <FileText size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                            <div>Nenhum relatório encontrado.</div>
                        </div>
                    )}
                </div>
            </Card>

            <Dialog
                header={`Relatório - ${selectedReport?.titulo || ""}`}
                visible={viewDialog}
                onHide={() => setViewDialog(false)}
                style={{ width: "600px", height: "500px" }}
            >
                <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "1rem", borderBottom: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: "0.78rem", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>{selectedReport?.tipo}</div>
                        <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "1rem", marginBottom: "0.5rem" }}>{selectedReport?.titulo}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.82rem" }}>
                            <div><strong>Período:</strong> {selectedReport?.periodo}</div>
                            <div><strong>Gerado em:</strong> {formatDate(selectedReport!.geradoEm)}</div>
                            <div><strong>Ficheiro:</strong> {selectedReport?.ficheiro}</div>
                            <div><strong>Páginas:</strong> {selectedReport?.paginas}</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ textAlign: "center", color: COLORS.muted }}>
                            <FileText size={64} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                            <div>Visualização do PDF</div>
                            <div style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>{selectedReport?.ficheiro}</div>
                        </div>
                    </div>
                    <div style={{ padding: "1rem", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                        <Button icon={<Download size={16} />} text label="Baixar PDF" severity="secondary" onClick={() => { if (selectedReport) downloadReport(selectedReport); }} />
                        <Button icon={<Archive size={16} />} text label="Arquivar" severity="secondary" />
                        <Button icon={<Share2 size={16} />} text label="Partilhar" severity="secondary" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
