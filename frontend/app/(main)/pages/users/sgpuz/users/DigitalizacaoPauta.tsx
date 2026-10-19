"use client";

import React, { useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";

import {
    ScanLine, FileText, Upload, Camera, Search, Plus, Filter, Archive,
    Eye, Download, Share2, CheckCircle2, Clock3, AlertTriangle, Timer,
} from "lucide-react";

import {
    getFinalGradeSheets, createFinalGradeSheet,
    FinalGradeSheet,
} from "@/api/assessments/assessmentService";

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

interface PautaUI {
    id: number;
    curso: string;
    anoLectivo: string;
    semestre: string;
    epoca: string;
    unidadeCurricular: string;
    docente: string;
    ficheiro: string;
    dataDigitalizacao: Date;
    estado: "Digitalizada" | "Arquivada" | "Pendente";
    paginas: number;
}

const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" });
};

const statusSeverity = (estado: PautaUI["estado"]) => {
    switch (estado) {
        case "Arquivada": return "success";
        case "Digitalizada": return "info";
        default: return "warning";
    }
};

export default function DigitalizacaoPauta() {
    const [pautas, setPautas] = useState<PautaUI[]>([]);
    const [search, setSearch] = useState("");
    const [cursoFilter, setCursoFilter] = useState<string | null>(null);
    const [semestreFilter, setSemestreFilter] = useState<string | null>(null);
    const [epocaFilter, setEpocaFilter] = useState<string | null>(null);

    const [uploadDialog, setUploadDialog] = useState(false);
    const [selectedPauta, setSelectedPauta] = useState<PautaUI | null>(null);
    const [viewDialog, setViewDialog] = useState(false);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const [newPauta, setNewPauta] = useState({
        curso: "", anoLectivo: "2026/2027", semestre: "1.º Semestre",
        epoca: "Normal", unidadeCurricular: "", docente: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPautas = async () => {
        setLoading(true); setError(null);
        try {
            const data = await getFinalGradeSheets();
            const mapped: PautaUI[] = data.map((item) => ({
                id: item.id,
                curso: "Engenharia Informática",
                anoLectivo: "2026/2027",
                semestre: "1.º Semestre",
                epoca: item.epoch,
                unidadeCurricular: item.uploaded_by_name || "Unidade Curricular",
                docente: item.uploaded_by_name || "Docente",
                ficheiro: item.file_url.split("/").pop() || "pauta.pdf",
                dataDigitalizacao: new Date(item.uploaded_at),
                estado: "Arquivada",
                paginas: 2,
            }));
            setPautas(mapped);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar pautas.");
            console.error("Erro ao carregar pautas:", err);
        } finally { setLoading(false); }
    };

    React.useEffect(() => { loadPautas(); }, []);

    const filteredPautas = pautas.filter((item) => {
        const text = search.toLowerCase().trim();
        const matchesSearch = !text ||
            item.unidadeCurricular.toLowerCase().includes(text) ||
            item.docente.toLowerCase().includes(text) ||
            item.ficheiro.toLowerCase().includes(text);
        const matchesCurso = !cursoFilter || item.curso === cursoFilter;
        const matchesSemestre = !semestreFilter || item.semestre === semestreFilter;
        const matchesEpoca = !epocaFilter || item.epoca === epocaFilter;
        return matchesSearch && matchesCurso && matchesSemestre && matchesEpoca;
    });

    const totalPautas = pautas.length;
    const digitalizadas = pautas.filter((i) => i.estado === "Digitalizada").length;
    const arquivadas = pautas.filter((i) => i.estado === "Arquivada").length;

    const openUpload = () => {
        setNewPauta({ curso: "", anoLectivo: "2026/2027", semestre: "1.º Semestre", epoca: "Normal", unidadeCurricular: "", docente: "" });
        setUploadProgress(0); setUploading(false); setUploadDialog(true);
    };

    const simulateUpload = () => {
        setUploading(true);
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploading(false);
                    setUploadDialog(false);
                    return 0;
                }
                return prev + 10;
            });
        }, 200);
    };

    const savePauta = async () => {
        if (!newPauta.curso || !newPauta.unidadeCurricular || !newPauta.docente) {
            setError("Preencha todos os campos obrigatórios."); return;
        }
        simulateUpload();
    };

    const viewPauta = (pauta: PautaUI) => {
        setSelectedPauta(pauta); setViewDialog(true);
    };

    const archivePauta = (id: number) => {
        setPautas((prev) => prev.map((item) => item.id === id ? { ...item, estado: "Arquivada" } : item));
    };

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <div className="flex align-items-center gap-2 mb-2">
                        <div className="flex align-items-center justify-content-center" style={{ width: 44, height: 44, background: COLORS.primaryLight, borderRadius: 12 }}>
                            <ScanLine size={24} color={COLORS.primary} />
                        </div>
                        <div>
                            <h1 className="m-0" style={{ fontSize: "1.65rem", color: COLORS.dark, fontWeight: 700 }}>Digitalização de Pauta</h1>
                            <p className="m-0 mt-1" style={{ color: COLORS.muted, fontSize: "0.9rem" }}>
                                Capture, digitalize e arquive as pautas finais das unidades curriculares.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button label="Digitalizar pauta" icon={<ScanLine size={17} />} onClick={openUpload} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                </div>
            </div>

            {error && (
                <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
            )}

            <div className="grid mb-4">
                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Total de pautas</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.dark }}>{totalPautas}</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>no semestre</span>
                            </div>
                            <div className="flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: COLORS.primaryLight, borderRadius: "50%" }}>
                                <FileText size={21} color={COLORS.primary} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Digitalizadas</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.primary }}>{digitalizadas}</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>aguardam arquivo</span>
                            </div>
                            <div className="flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: COLORS.primaryLight, borderRadius: "50%" }}>
                                <CheckCircle2 size={21} color={COLORS.primary} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Arquivadas</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.green }}>{arquivadas}</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>de {totalPautas} pautas</span>
                            </div>
                            <div className="flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: COLORS.greenLight, borderRadius: "50%" }}>
                                <Archive size={21} color={COLORS.green} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 200px 200px 180px auto", gap: ".75rem", alignItems: "center" }}>
                    <span className="p-input-icon-left">
                        <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar pauta, UC ou docente..." style={{ width: "100%", paddingLeft: "2.5rem" }} />
                    </span>
                    <Dropdown value={cursoFilter} onChange={(e) => setCursoFilter(e.value)} options={[{ label: "Todos os cursos", value: null }, { label: "Engenharia Informática", value: "Engenharia Informática" }]} optionLabel="label" optionValue="value" placeholder="Curso" showClear />
                    <Dropdown value={semestreFilter} onChange={(e) => setSemestreFilter(e.value)} options={[{ label: "Todos os semestres", value: null }, { label: "1.º Semestre", value: "1.º Semestre" }, { label: "2.º Semestre", value: "2.º Semestre" }]} optionLabel="label" optionValue="value" placeholder="Semestre" showClear />
                    <Dropdown value={epocaFilter} onChange={(e) => setEpocaFilter(e.value)} options={[{ label: "Todas as épocas", value: null }, { label: "Normal", value: "Normal" }, { label: "Recurso", value: "Recurso" }, { label: "Especial", value: "Especial" }]} optionLabel="label" optionValue="value" placeholder="Época" showClear />
                    <Button label="Limpar" icon={<Filter size={16} />} text onClick={() => { setSearch(""); setCursoFilter(null); setSemestreFilter(null); setEpocaFilter(null); }} />
                </div>
            </Card>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Pautas Digitalizadas</h2>
                        <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Consulte e gerencie as pautas finais.</p>
                    </div>
                    <Tag value={`${filteredPautas.length} pautas`} severity="info" rounded />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {filteredPautas.map((pauta) => (
                        <div key={pauta.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem", border: `1px solid ${COLORS.border}`, borderRadius: "10px", background: COLORS.white }}>
                            <div className="flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: COLORS.muted, fontSize: "0.72rem" }}>{formatDate(pauta.dataDigitalizacao)}</div>
                                <div>
                                    <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{pauta.unidadeCurricular}</div>
                                    <div style={{ color: COLORS.primary, fontSize: "0.75rem", fontWeight: 600, marginTop: "2px" }}>{pauta.ficheiro}</div>
                                    <div style={{ color: COLORS.muted, fontSize: "0.75rem", marginTop: "2px" }}>{pauta.docente} · {pauta.curso}</div>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-3">
                                <Tag value={pauta.estado} severity={statusSeverity(pauta.estado)} rounded style={{ fontSize: "0.72rem" }} />
                                <span style={{ fontSize: "0.78rem", color: COLORS.text, fontWeight: 600 }}>{pauta.paginas} página{pauta.paginas !== 1 ? "s" : ""}</span>
                                <div className="flex gap-1">
                                    <Button icon={<Eye size={16} />} text rounded severity="secondary" tooltip="Visualizar" onClick={() => viewPauta(pauta)} />
                                    <Button icon={<Download size={16} />} text rounded severity="secondary" tooltip="Baixar PDF" />
                                    <Button icon={<Archive size={16} />} text rounded severity="secondary" tooltip="Arquivar" disabled={pauta.estado === "Arquivada"} onClick={() => archivePauta(pauta.id)} />
                                    <Button icon={<Share2 size={16} />} text rounded severity="secondary" tooltip="Partilhar" />
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredPautas.length === 0 && (
                        <div style={{ padding: "3rem", textAlign: "center", color: COLORS.muted }}>
                            <FileText size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                            <div>Nenhuma pauta encontrada.</div>
                        </div>
                    )}
                </div>
            </Card>

            <Dialog header="Nova Digitalização de Pauta" visible={uploadDialog} onHide={() => setUploadDialog(false)} style={{ width: "480px" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Curso</label>
                        <InputText value={newPauta.curso} onChange={(e) => setNewPauta({ ...newPauta, curso: e.target.value })} placeholder="Ex: Engenharia Informática" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Ano Lectivo</label>
                            <Dropdown value={newPauta.anoLectivo} onChange={(e) => setNewPauta({ ...newPauta, anoLectivo: e.value as string })} options={["2025/2026", "2026/2027"].map((y) => ({ label: y, value: y }))} optionLabel="label" optionValue="value" style={{ width: "100%" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Semestre</label>
                            <Dropdown value={newPauta.semestre} onChange={(e) => setNewPauta({ ...newPauta, semestre: e.value as string })} options={["1.º Semestre", "2.º Semestre"].map((s) => ({ label: s, value: s }))} optionLabel="label" optionValue="value" style={{ width: "100%" }} />
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Época</label>
                            <Dropdown value={newPauta.epoca} onChange={(e) => setNewPauta({ ...newPauta, epoca: e.value as string })} options={["Normal", "Recurso", "Especial"].map((e) => ({ label: e, value: e }))} optionLabel="label" optionValue="value" style={{ width: "100%" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Unidade Curricular</label>
                            <InputText value={newPauta.unidadeCurricular} onChange={(e) => setNewPauta({ ...newPauta, unidadeCurricular: e.target.value })} placeholder="Ex: Programação Web" />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Docente Responsável</label>
                        <InputText value={newPauta.docente} onChange={(e) => setNewPauta({ ...newPauta, docente: e.target.value })} placeholder="Ex: Jane Smith" />
                    </div>
                    <Divider />
                    {uploading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ fontSize: "0.8rem", color: COLORS.muted }}>Processando digitalização...</div>
                            <ProgressBar value={uploadProgress} showValue={false} style={{ height: "8px" }} />
                            <div style={{ fontSize: "0.8rem", color: COLORS.muted }}>{uploadProgress}%</div>
                        </div>
                    ) : (
                        <div className="flex justify-content-end gap-2">
                            <Button label="Cancelar" text onClick={() => setUploadDialog(false)} />
                            <Button label="Digitalizar" onClick={savePauta} disabled={uploading} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                        </div>
                    )}
                </div>
            </Dialog>

            <Dialog header={`Pauta - ${selectedPauta?.unidadeCurricular || ""}`} visible={viewDialog} onHide={() => setViewDialog(false)} style={{ width: "600px", height: "500px" }}>
                <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "1rem", borderBottom: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: "0.78rem", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Pauta Final</div>
                        <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "1rem", marginBottom: "0.5rem" }}>{selectedPauta?.unidadeCurricular}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.82rem" }}>
                            <div><strong>Período:</strong> {selectedPauta?.semestre}</div>
                            <div><strong>Gerado em:</strong> {formatDate(selectedPauta!.dataDigitalizacao)}</div>
                            <div><strong>Ficheiro:</strong> {selectedPauta?.ficheiro}</div>
                            <div><strong>Páginas:</strong> {selectedPauta?.paginas}</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ textAlign: "center", color: COLORS.muted }}>
                            <FileText size={64} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                            <div>Visualização do PDF</div>
                            <div style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>{selectedPauta?.ficheiro}</div>
                        </div>
                    </div>
                    <div style={{ padding: "1rem", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                        <Button icon={<Download size={16} />} text label="Baixar PDF" severity="secondary" onClick={() => { if (selectedPauta) { /* download */ } }} />
                        <Button icon={<Archive size={16} />} text label="Arquivar" onClick={() => { if (selectedPauta) archivePauta(selectedPauta.id); setViewDialog(false); }} severity="secondary" />
                        <Button icon={<Share2 size={16} />} text label="Partilhar" severity="secondary" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
