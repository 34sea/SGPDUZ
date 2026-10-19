"use client";

import React, { useState, useMemo } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { FileUpload } from "primereact/fileupload";
import { ConfirmDialog } from "primereact/confirmdialog";

import {
    ClipboardList, Send, Paperclip, Clock3, AlertCircle, FileText,
    Eye, UserCheck, Plus, CheckCircle2, Search, Users,
} from "lucide-react";

import {
    getAdHocTasks, createTaskSubmission, getTaskSubmissions,
    AdHocTask, CreateTaskSubmissionData,
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

export default function SubmissaoActividade() {
    const [tasks, setTasks] = useState<AdHocTask[]>([]);
    const [search, setSearch] = useState("");

    const [submissionDialog, setSubmissionDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState<AdHocTask | null>(null);
    const [submissionObservation, setSubmissionObservation] = useState("");
    const [uploading, setUploading] = useState(false);

    const [loading, setLoading] = useState(false);
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
            return !text ||
                task.title.toLowerCase().includes(text) ||
                (task.description || "").toLowerCase().includes(text) ||
                (task.assigned_by_name || "").toLowerCase().includes(text);
        });
    }, [tasks, search]);

    const pendentes = tasks.filter((t) => t.status === "PENDENTE").length;
    const entregues = tasks.filter((t) => t.status === "ENTREGUE").length;
    const atrasadas = tasks.filter((t) => t.status === "ATRASADA").length;

    const openSubmission = (task: AdHocTask) => {
        setSelectedTask(task);
        setSubmissionObservation("");
        setSubmissionDialog(true);
    };

    const submitTask = async () => {
        if (!selectedTask) return;
        setUploading(true);
        try {
            const data: CreateTaskSubmissionData = {
                task_id: selectedTask.id,
                notes: submissionObservation,
            };
            await createTaskSubmission(data);
            setSubmissionDialog(false);
            await loadTasks();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao submeter actividade.");
            console.error("Erro ao submeter:", err);
        } finally { setUploading(false); }
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
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Submissão de Actividade</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Submeta actividades atribuídas com comprovativos e observações.
                    </div>
                </div>
                <Button label="Minhas Actividades" icon={<FileText size={16} />} text severity="secondary" />
            </div>

            {error && (
                <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
            )}

            <div className="grid mb-3">
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Total atribuídas</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{tasks.length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ClipboardList size={20} />
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
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Entregues</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.cyan, marginTop: "4px" }}>{entregues}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.cyanLight, color: COLORS.cyan, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Send size={20} />
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

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span className="p-input-icon-left">
                        <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar actividade ou docente..." style={{ width: "100%", paddingLeft: "2.5rem", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 1rem", fontSize: "0.85rem", boxSizing: "border-box" }} />
                    </span>
                </div>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredTasks.map((task) => {
                    const isOverdue = task.status === "PENDENTE" && new Date(task.deadline) < new Date();
                    return (
                        <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: `1px solid ${COLORS.border}`, borderRadius: "10px", background: COLORS.white }}>
                            <div className="flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <ClipboardList size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.88rem" }}>{task.title}</div>
                                    <div style={{ color: COLORS.muted, fontSize: "0.78rem", marginTop: "3px" }}>{task.description || ""}</div>
                                    <div style={{ color: COLORS.text, fontSize: "0.78rem", marginTop: "6px" }}>
                                        <span style={{ fontWeight: 600 }}>Responsável:</span> {task.assigned_by_name} &nbsp;|&nbsp;
                                        <span style={{ fontWeight: 600 }}>Prazo:</span> {formatDate(task.deadline)}
                                        {isOverdue && <span style={{ color: COLORS.red, fontWeight: 700, marginLeft: "0.5rem" }}>⚠ Atrasado</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-3">
                                {statusBody(task)}
                                {task.status === "PENDENTE" && (
                                    <Button icon={<Send size={16} />} label="Submeter" onClick={() => openSubmission(task)} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                                )}
                            </div>
                        </div>
                    );
                })}
                {filteredTasks.length === 0 && (
                    <div style={{ padding: "3rem", textAlign: "center", color: COLORS.muted }}>
                        <ClipboardList size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                        <div>Nenhuma actividade atribuída.</div>
                    </div>
                )}
            </div>

            <Dialog header="Submeter Actividade" visible={submissionDialog} onHide={() => setSubmissionDialog(false)} style={{ width: "500px" }}>
                <div className="flex flex-column gap-3">
                    {selectedTask && (
                        <>
                            <div style={{ padding: "0.75rem", background: COLORS.primaryLight, borderRadius: "8px", border: `1px solid ${COLORS.primary}25` }}>
                                <div style={{ fontWeight: 600, color: COLORS.primary, fontSize: "0.88rem", marginBottom: "4px" }}>{selectedTask.title}</div>
                                <div style={{ fontSize: "0.8rem", color: COLORS.muted }}>{selectedTask.description}</div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.text, marginTop: "6px" }}>
                                    <span style={{ fontWeight: 600 }}>Prazo:</span> {formatDate(selectedTask.deadline)}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Observações</label>
                                <InputTextarea value={submissionObservation} onChange={(e) => setSubmissionObservation(e.target.value)} placeholder="Adicione observações sobre a entrega..." autoResize />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Anexo / Comprovativo</label>
                                <FileUpload
                                    mode="basic" accept="application/pdf,image/*" multiple={false}
                                    onUpload={() => { setUploading(true); setTimeout(() => { setUploading(false); }, 1000); }}
                                    customUpload auto style={{ width: "100%" }}
                                />
                            </div>
                        </>
                    )}
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" text onClick={() => setSubmissionDialog(false)} />
                        <Button label="Submeter" onClick={submitTask} disabled={uploading || !selectedTask} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
