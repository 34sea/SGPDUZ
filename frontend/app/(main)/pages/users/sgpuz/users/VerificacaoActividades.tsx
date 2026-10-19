"use client";

import React, { useState, useMemo } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

import {
    ClipboardList, ClipboardCheck, Eye, FileText, Send, UserCheck,
    AlertCircle, CheckCircle2, Search, Clock3,
} from "lucide-react";

import {
    getAdHocTasks, verifyTaskSubmission, AdHocTask,
} from "@/api/activities/activityService";

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

const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("pt-MZ", { day: "2-digit", month: "2-digit", year: "numeric" });

const getStatusSeverity = (estado: AdHocTask["status"]) => {
    switch (estado) {
        case "VERIFICADA": return "success";
        case "ENTREGUE": return "info";
        case "ATRASADA": return "danger";
        default: return "warning";
    }
};

const getStatusLabel = (estado: AdHocTask["status"]) => {
    switch (estado) {
        case "PENDENTE": return "Pendente";
        case "ENTREGUE": return "Entregue";
        case "VERIFICADA": return "Verificada";
        case "ATRASADA": return "Atrasada";
        default: return estado;
    }
};

export default function VerificacaoActividades() {
    const [tasks, setTasks] = useState<AdHocTask[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<AdHocTask["status"] | null>(null);

    const [verificationDialog, setVerificationDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState<AdHocTask | null>(null);
    const [feedback, setFeedback] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = async () => {
        setLoading(true); setError(null);
        try {
            const data = await getAdHocTasks();
            setTasks(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar actividades.");
            console.error("Erro ao carregar actividades:", err);
        } finally { setLoading(false); }
    };

    React.useEffect(() => { loadTasks(); }, []);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const text = search.toLowerCase().trim();
            const matchesSearch = !text ||
                task.title.toLowerCase().includes(text) ||
                (task.description || "").toLowerCase().includes(text) ||
                (task.assigned_by_name || "").toLowerCase().includes(text);
            const matchesStatus = !statusFilter || task.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, search, statusFilter]);

    const entregues = tasks.filter((t) => t.status === "ENTREGUE").length;
    const pendentes = tasks.filter((t) => t.status === "PENDENTE").length;
    const atrasadas = tasks.filter((t) => t.status === "ATRASADA").length;

    const openVerification = (task: AdHocTask) => {
        setSelectedTask(task);
        setFeedback("");
        setVerificationDialog(true);
    };

    const verifyTask = async (approved: boolean) => {
        if (!selectedTask) return;
        setSaving(true);
        try {
            const { getTaskSubmissions } = await import("@/api/activities/activityService");
            const submissions = await getTaskSubmissions(selectedTask.id);
            const submission = submissions[0];
            if (!submission) {
                setError("Nenhuma submissão encontrada para esta actividade.");
                return;
            }
            await verifyTaskSubmission(submission.id, approved, feedback || "");
            setVerificationDialog(false);
            await loadTasks();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao verificar actividade.");
            console.error("Erro ao verificar:", err);
        } finally { setSaving(false); }
    };

    const statusBody = (row: AdHocTask) => (
        <Tag value={getStatusLabel(row.status)} severity={getStatusSeverity(row.status)} rounded />
    );

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Verificação de Actividades</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Analise actividades submetidas, registre feedback e defina o estado.
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
            )}

            <div className="grid mb-3">
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Aguardam verificação</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.cyan, marginTop: "4px" }}>{entregues}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.cyanLight, color: COLORS.cyan, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ClipboardCheck size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Pendentes</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.orange, marginTop: "4px" }}>{pendentes}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.orangeLight, color: COLORS.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Clock3 size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Atrasadas</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.red, marginTop: "4px" }}>{atrasadas}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.redLight, color: COLORS.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <AlertCircle size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid mb-3">
                <div className="col-12 lg:col-12">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 200px auto", gap: ".75rem", alignItems: "center" }}>
                            <span className="p-input-icon-left">
                                <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar actividade ou docente..." style={{ width: "100%", paddingLeft: "2.5rem", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 1rem", fontSize: "0.85rem", boxSizing: "border-box" }} />
                            </span>
                            <Dropdown
                                value={statusFilter} onChange={(e: any) => setStatusFilter(e.value)}
                                options={[
                                    { label: "Todos os estados", value: null },
                                    { label: "Pendente", value: "PENDENTE" },
                                    { label: "Entregue", value: "ENTREGUE" },
                                    { label: "Verificada", value: "VERIFICADA" },
                                    { label: "Atrasada", value: "ATRASADA" },
                                ]}
                                optionLabel="label" optionValue="value" placeholder="Estado" showClear style={{ minWidth: "180px" }}
                            />
                            <Button label="Limpar" text onClick={() => { setSearch(""); setStatusFilter(null); }} />
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Actividades para Verificação</h2>
                                <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Consulte comprovativos e registre feedback.</p>
                            </div>
                            <Tag value={`${filteredTasks.length} actividades`} severity="info" rounded />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {filteredTasks.map((task) => (
                                <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: `1px solid ${COLORS.border}`, borderRadius: "10px", background: COLORS.white }}>
                                    <div className="flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <ClipboardList size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.88rem" }}>{task.title}</div>
                                            <div style={{ color: COLORS.muted, fontSize: "0.78rem", marginTop: "3px" }}>{task.description || ""}</div>
                                            <div style={{ color: COLORS.text, fontSize: "0.78rem", marginTop: "6px" }}>
                                                <span style={{ fontWeight: 600 }}>Docente:</span> {task.assigned_to_name || task.description} &nbsp;|&nbsp;
                                                <span style={{ fontWeight: 600 }}>Prazo:</span> {formatDate(task.deadline)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex align-items-center gap-3">
                                        {statusBody(task)}
                                        {task.status === "ENTREGUE" && (
                                            <Button icon={<Eye size={16} />} label="Verificar" onClick={() => openVerification(task)} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filteredTasks.length === 0 && (
                                <div style={{ padding: "3rem", textAlign: "center", color: COLORS.muted }}>
                                    <ClipboardList size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                                    <div>Nenhuma actividade para verificar.</div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <Dialog header="Verificar Actividade" visible={verificationDialog} onHide={() => setVerificationDialog(false)} style={{ width: "500px" }}>
                <div className="flex flex-column gap-3">
                    {selectedTask && (
                        <>
                            <div style={{ padding: "0.75rem", background: COLORS.primaryLight, borderRadius: "8px", border: `1px solid ${COLORS.primary}25` }}>
                                <div style={{ fontWeight: 600, color: COLORS.primary, fontSize: "0.88rem", marginBottom: "4px" }}>{selectedTask.title}</div>
                                <div style={{ fontSize: "0.8rem", color: COLORS.muted }}>{selectedTask.description}</div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.text, marginTop: "6px" }}>
                                    <span style={{ fontWeight: 600 }}>Docente:</span> {taskName(selectedTask)} &nbsp;|&nbsp;
                                    <span style={{ fontWeight: 600 }}>Submetido em:</span> {formatDate(selectedTask.created_at)}
                                </div>
                                {selectedTask.description && (
                                    <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginTop: "6px", fontStyle: "italic" }}>
                                        Observação do docente: {selectedTask.description}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Feedback / Observação</label>
                                <InputTextarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Registe o seu feedback sobre a actividade..." autoResize />
                            </div>
                            <div className="flex gap-2">
                                <Button label="Rejeitar" text severity="secondary" onClick={() => verifyTask(false)} disabled={saving} />
                                <Button label="Aprovar e Verificar" onClick={() => verifyTask(true)} disabled={saving} style={{ background: COLORS.green, borderColor: COLORS.green }} />
                            </div>
                        </>
                    )}
                </div>
            </Dialog>
        </div>
    );
}

const taskName = (task: AdHocTask) => task.assigned_to_name || "-";
