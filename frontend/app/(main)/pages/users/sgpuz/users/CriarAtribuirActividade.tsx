"use client";

import React, { useState, useMemo } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { ConfirmDialog } from "primereact/confirmdialog";

import {
    ClipboardList, Plus, Search, Pencil, Trash2, Power, FileText, Paperclip, Clock3,
    XCircle, CheckCircle2, Users,
} from "lucide-react";

import {
    getAdHocTasks, createAdHocTask, deleteAdHocTask,
    AdHocTask, CreateAdHocTaskData,
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

export default function CriarAtribuirActividade() {
    const [tasks, setTasks] = useState<AdHocTask[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<AdHocTask["status"] | null>(null);
    const [docenteFilter, setDocenteFilter] = useState<string | null>(null);

    const [createDialog, setCreateDialog] = useState(false);
    const [confirmDeleteTask, setConfirmDeleteTask] = useState<AdHocTask | null>(null);

    const [taskForm, setTaskForm] = useState({
        title: "", description: "", assigned_to: "",
        dataAtribuicao: new Date(), prazo: null as Date | null, anexo: "",
    });

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

    const docenteOptions = useMemo(() => {
        return Array.from(new Set(tasks.map((t) => t.assigned_to_name))).filter(Boolean).map((d) => ({ label: d as string, value: d as string }));
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const text = search.toLowerCase().trim();
            const matchesSearch = !text ||
                task.title.toLowerCase().includes(text) ||
                (task.assigned_to_name || "").toLowerCase().includes(text) ||
                (task.description || "").toLowerCase().includes(text);
            const matchesStatus = !statusFilter || task.status === statusFilter;
            const matchesDocente = !docenteFilter || (task.assigned_to_name || "") === docenteFilter;
            return matchesSearch && matchesStatus && matchesDocente;
        });
    }, [tasks, search, statusFilter, docenteFilter]);

    const openCreate = () => {
        setTaskForm({ title: "", description: "", assigned_to: "", dataAtribuicao: new Date(), prazo: new Date(), anexo: "" });
        setCreateDialog(true);
    };

    const saveTask = async () => {
        if (!taskForm.title || !taskForm.assigned_to || !taskForm.prazo) {
            setError("Preencha título, docente e prazo."); return;
        }
        setSaving(true); setError(null);
        try {
            const data: CreateAdHocTaskData = {
                title: taskForm.title,
                description: taskForm.description,
                assigned_to: Number(taskForm.assigned_to),
                deadline: taskForm.prazo.toISOString(),
            };
            await createAdHocTask(data);
            setCreateDialog(false);
            await loadTasks();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao criar actividade.");
            console.error("Erro ao criar actividade:", err);
        } finally { setSaving(false); }
    };

    const requestDeleteTask = (task: AdHocTask) => { setConfirmDeleteTask(task); };

    const deleteTask = async () => {
        if (!confirmDeleteTask) return;
        setLoading(true);
        try {
            await deleteAdHocTask(confirmDeleteTask.id);
            setConfirmDeleteTask(null);
            await loadTasks();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao remover actividade.");
            console.error("Erro ao remover:", err);
        } finally { setLoading(false); }
    };

    const statusBody = (row: AdHocTask) => (
        <Tag value={getStatusLabel(row.status)} severity={getStatusSeverity(row.status)} rounded />
    );

    const actionsBody = (row: AdHocTask) => (
        <div className="flex gap-1">
            <Button icon={<Pencil size={15} />} text rounded severity="secondary" tooltip="Editar" />
            <Button icon={<Trash2 size={15} />} text rounded severity="danger" tooltip="Remover" onClick={() => requestDeleteTask(row)} />
        </div>
    );

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <ConfirmDialog
                header="Remover Actividade" icon={<Trash2 size={26} />}
                acceptLabel="Sim, remover" rejectLabel="Cancelar"
                acceptClassName="p-button-danger" accept={() => deleteTask()}
                visible={!!confirmDeleteTask}
            >
                Tem certeza que deseja remover a actividade <strong>{confirmDeleteTask?.title}</strong>?
            </ConfirmDialog>

            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Atribuir Actividade</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Crie actividades e atribua-as a docentes com prazo definido.
                    </div>
                </div>
                <Button
                    label="Nova actividade" icon={<Plus size={16} />}
                    onClick={openCreate} disabled={loading || saving}
                    style={{ background: COLORS.primary, borderColor: COLORS.primary }}
                />
            </div>

            {error && (
                <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
            )}

            <div className="grid mb-3">
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Total de actividades</div>
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
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.orange, marginTop: "4px" }}>{tasks.filter((t) => t.status === "PENDENTE").length}</div>
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
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.cyan, marginTop: "4px" }}>{tasks.filter((t) => t.status === "ENTREGUE").length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.cyanLight, color: COLORS.cyan, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FileText size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid mb-3">
                <div className="col-12 lg:col-12">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 200px 200px auto", gap: ".75rem", alignItems: "center" }}>
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
                                optionLabel="label" optionValue="value" placeholder="Estado" showClear
                            />
                            <Dropdown
                                value={docenteFilter} onChange={(e: any) => setDocenteFilter(e.value)}
                                options={docenteOptions} optionLabel="label" optionValue="value" placeholder="Docente" showClear
                            />
                            <Button label="Limpar" text onClick={() => { setSearch(""); setStatusFilter(null); setDocenteFilter(null); }} />
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Actividades Atribuídas</h2>
                                <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Acompanhe prazos, submissões e verificações.</p>
                            </div>
                            <Tag value={`${filteredTasks.length} actividades`} severity="info" rounded />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {filteredTasks.map((task) => (
                                <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem", border: `1px solid ${COLORS.border}`, borderRadius: "10px", background: COLORS.white }}>
                                    <div className="flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{task.title}</div>
                                        <div style={{ color: COLORS.muted, fontSize: "0.75rem", marginTop: "2px" }}>{task.description || ""}</div>
                                        <div style={{ color: COLORS.text, fontSize: "0.75rem", marginTop: "4px" }}>
                                            <span style={{ fontWeight: 600 }}>Docente:</span> {task.assigned_to_name || "-"} &nbsp;|&nbsp;
                                            <span style={{ fontWeight: 600 }}>Prazo:</span> {formatDate(task.deadline)}
                                        </div>
                                    </div>
                                    <div className="flex align-items-center gap-3">
                                        {statusBody(task)}
                                        <div className="flex gap-1">
                                            <Button icon={<Pencil size={16} />} text rounded severity="secondary" tooltip="Editar" />
                                            <Button icon={<Trash2 size={16} />} text rounded severity="danger" tooltip="Remover" onClick={() => requestDeleteTask(task)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredTasks.length === 0 && (
                                <div style={{ padding: "3rem", textAlign: "center", color: COLORS.muted }}>
                                    <ClipboardList size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                                    <div>Nenhuma actividade encontrada.</div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <Dialog header="Nova Actividade" visible={createDialog} onHide={() => setCreateDialog(false)} style={{ width: "500px" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Título</label>
                        <InputText value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Título da actividade" disabled={saving} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Descrição</label>
                        <InputTextarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Descrição da actividade" autoResize disabled={saving} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Docente Responsável</label>
                            <InputText value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })} placeholder="ID do docente" disabled={saving} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Data de Atribuição</label>
                            <Calendar value={taskForm.dataAtribuicao} onChange={(e) => { if (e.value) setTaskForm({ ...taskForm, dataAtribuicao: e.value }); }} dateFormat="dd/mm/yy" disabled={saving} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Prazo de Entrega</label>
                        <Calendar value={taskForm.prazo} onChange={(e) => { if (e.value) setTaskForm({ ...taskForm, prazo: e.value }); }} dateFormat="dd/mm/yy" disabled={saving} />
                    </div>
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" text onClick={() => setCreateDialog(false)} disabled={saving} />
                        <Button label="Atribuir" onClick={saveTask} disabled={saving} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
