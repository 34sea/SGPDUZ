"use client";

import React, { useMemo, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";

import {
    BarChart3, Users, BookOpen, CalendarDays, ClipboardCheck,
    Activity, FileText, UserCheck, Search, ChevronRight,
    AlertCircle, CheckCircle2, GraduationCap, Eye,
} from "lucide-react";

import {
    getAdHocTasks,
    AdHocTask,
} from "@/api/activities/activityService";
import { getUsers } from "@/app/api/users/userService";
import { getLessons } from "@/api/pedagogical/pedagogicalService";
import { getAssessments } from "@/api/assessments/assessmentService";

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

interface TeacherCompliance {
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
    estado: "Excelente" | "Bom" | "Atencao";
}

const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getTeacherSeverity = (status: TeacherCompliance["estado"]) => {
    switch (status) {
        case "Excelente": return "success";
        case "Bom": return "info";
        default: return "warning";
    }
};

export default function CumprimentoDocente() {
    const [search, setSearch] = useState("");
    const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherCompliance | null>(null);
    const [teacherDialog, setTeacherDialog] = useState(false);

    const [teachers, setTeachers] = useState<TeacherCompliance[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [users, lessons, assessments, activities] = await Promise.all([
                getUsers(),
                getLessons(),
                getAssessments(),
                getAdHocTasks(),
            ]);

            const teacherMap = new Map<number, TeacherCompliance>();

            (users as any[]).forEach((u: any) => {
                if (u.roles && u.roles.includes("DOCENTE")) {
                    teacherMap.set(u.id, {
                        id: u.id,
                        nome: u.name,
                        email: u.email,
                        departamento: u.departamento || "Engenharia Informática",
                        curso: u.curso || "Engenharia Informática",
                        avatar: u.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase(),
                        aulasPrevistas: 0,
                        aulasRealizadas: 0,
                        aulasPendentes: 0,
                        avaliacoesTotal: 0,
                        avaliacoesDentroPrazo: 0,
                        avaliacoesForaPrazo: 0,
                        pautaFinal: "Pendente",
                        actividadesTotal: 0,
                        actividadesEntregues: 0,
                        actividadesAtrasadas: 0,
                        cumprimento: 0,
                        estado: "Atencao",
                    });
                }
            });

            (lessons as any[]).forEach((lesson: any) => {
                const teacherId = lesson.teacher_id;
                if (teacherMap.has(teacherId)) {
                    const t = teacherMap.get(teacherId)!;
                    t.aulasPrevistas += 1;
                    if (lesson.status === "CONFIRMADA" || lesson.status === "RESOLVIDA") {
                        t.aulasRealizadas += 1;
                    } else if (lesson.status === "REGISTADA" || lesson.status === "PENDENTE_PROLONGADA") {
                        t.aulasPendentes += 1;
                    }
                }
            });

            (assessments as any[]).forEach((a: any) => {
                const teacherId = a.teacher_id;
                if (teacherMap.has(teacherId)) {
                    const t = teacherMap.get(teacherId)!;
                    t.avaliacoesTotal += 1;
                    if (a.status === "DENTRO_DO_PRAZO" || a.status === "Publicado") {
                        t.avaliacoesDentroPrazo += 1;
                    } else if (a.status === "Fora do prazo" || a.status === "FORA_DO_PRAZO") {
                        t.avaliacoesForaPrazo += 1;
                    }
                }
            });

            (activities as AdHocTask[]).forEach((act) => {
                const teacherId = act.assigned_to;
                if (teacherMap.has(teacherId)) {
                    const t = teacherMap.get(teacherId)!;
                    t.actividadesTotal += 1;
                    if (act.status === "ENTREGUE" || act.status === "VERIFICADA") {
                        t.actividadesEntregues += 1;
                    } else if (act.status === "ATRASADA") {
                        t.actividadesAtrasadas += 1;
                    }
                }
            });

            teacherMap.forEach((t) => {
                const totalItems =
                    t.aulasPrevistas +
                    t.avaliacoesTotal +
                    t.actividadesTotal +
                    (t.pautaFinal === "Entregue" ? 1 : 0);
                const completedItems =
                    t.aulasRealizadas +
                    t.avaliacoesDentroPrazo +
                    t.actividadesEntregues +
                    (t.pautaFinal === "Entregue" ? 1 : 0);
                t.cumprimento = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                if (t.cumprimento >= 90) t.estado = "Excelente";
                else if (t.cumprimento >= 75) t.estado = "Bom";
                else t.estado = "Atencao";
            });

            setTeachers(Array.from(teacherMap.values()));
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar dados de cumprimento.");
            console.error("Erro ao carregar cumprimento docente:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { loadData(); }, []);

    const filteredTeachers = useMemo(() => {
        return teachers.filter((t) => {
            const text = search.toLowerCase().trim();
            const matchesSearch =
                !text ||
                t.nome.toLowerCase().includes(text) ||
                t.email.toLowerCase().includes(text) ||
                t.departamento.toLowerCase().includes(text) ||
                t.curso.toLowerCase().includes(text);
            const matchesEstado = !estadoFilter || t.estado === estadoFilter;
            return matchesSearch && matchesEstado;
        });
    }, [teachers, search, estadoFilter]);

    const totalDocentes = teachers.length;
    const mediaCumprimento =
        teachers.length > 0
            ? Math.round(
                teachers.reduce((sum, t) => sum + t.cumprimento, 0) / teachers.length
            )
            : 0;

    const estadoLabel = (estado: TeacherCompliance["estado"]) => {
        switch (estado) {
            case "Excelente": return "Excelente";
            case "Bom": return "Bom";
            default: return "Atenção";
        }
    };

    return (
        <div style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}>
            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Cumprimento do Docente</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Acompanhe o desempenho pedagógico de cada docente e o seu índice global de cumprimento.
                    </div>
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
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Total de docentes</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.dark }}>{totalDocentes}</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>registados no sistema</span>
                            </div>
                            <div className="flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: COLORS.primaryLight, borderRadius: "50%" }}>
                                <Users size={21} color={COLORS.primary} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span style={{ color: COLORS.muted, fontSize: "0.82rem" }}>Média de cumprimento</span>
                                <div className="mt-2" style={{ fontSize: "1.8rem", fontWeight: 700, color: COLORS.primary }}>{mediaCumprimento}%</div>
                                <span style={{ color: COLORS.muted, fontSize: "0.75rem" }}>índice geral da equipa</span>
                            </div>
                            <div className="flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: COLORS.primaryLight, borderRadius: "50%" }}>
                                <BarChart3 size={21} color={COLORS.primary} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Excelentes</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.green, marginTop: "4px" }}>{teachers.filter((t) => t.estado === "Excelente").length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Atenção</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.orange, marginTop: "4px" }}>{teachers.filter((t) => t.estado === "Atencao").length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.orangeLight, color: COLORS.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <AlertCircle size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 200px auto", gap: ".75rem", alignItems: "center" }}>
                    <span className="p-input-icon-left">
                        <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar docente..." style={{ width: "100%", paddingLeft: "2.5rem", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 1rem", fontSize: "0.85rem", boxSizing: "border-box" }} />
                    </span>
                    <Dropdown value={estadoFilter} onChange={(e: any) => setEstadoFilter(e.value)} options={[
                        { label: "Todos os estados", value: null },
                        { label: "Excelente", value: "Excelente" },
                        { label: "Bom", value: "Bom" },
                        { label: "Atenção", value: "Atencao" },
                    ]} optionLabel="label" optionValue="value" placeholder="Estado" showClear style={{ minWidth: "180px" }} />
                </div>
            </Card>

            <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Equipe Pedagógica</h2>
                        <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Consulte o cumprimento individual de cada docente.</p>
                    </div>
                    <Tag value={`${filteredTeachers.length} docentes`} severity="info" rounded />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {filteredTeachers.map((teacher) => (
                        <div key={teacher.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: `1px solid ${COLORS.border}`, borderRadius: "10px", background: COLORS.white, cursor: "pointer" }} onClick={() => { setSelectedTeacher(teacher); setTeacherDialog(true); }}>
                            <div className="flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                                <Avatar label={teacher.avatar} shape="circle" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary, fontWeight: 700 }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.88rem" }}>{teacher.nome}</div>
                                    <div style={{ color: COLORS.muted, fontSize: "0.78rem" }}>{teacher.email}</div>
                                    <div style={{ color: COLORS.text, fontSize: "0.75rem", marginTop: "4px" }}>{teacher.departamento} · {teacher.curso}</div>
                                </div>
                            </div>
                            <div className="flex flex-column align-items-end gap-1">
                                <Tag value={estadoLabel(teacher.estado)} severity={getTeacherSeverity(teacher.estado)} rounded style={{ fontSize: "0.72rem" }} />
                                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: COLORS.dark }}>{teacher.cumprimento}%</div>
                            </div>
                        </div>
                    ))}
                    {filteredTeachers.length === 0 && (
                        <div style={{ padding: "3rem", textAlign: "center", color: COLORS.muted }}>
                            <Users size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                            <div>Nenhum docente encontrado.</div>
                        </div>
                    )}
                </div>
            </Card>

            <Dialog header={`Perfil Pedagógico - ${selectedTeacher?.nome || ""}`} visible={teacherDialog} onHide={() => setTeacherDialog(false)} style={{ width: "560px" }}>
                <div className="flex flex-column gap-3">
                    <div style={{ padding: "1rem", background: COLORS.primaryLight, borderRadius: "10px", border: `1px solid ${COLORS.primary}25` }}>
                        <div className="flex align-items-center gap-2" style={{ marginBottom: "0.75rem" }}>
                            <Avatar label={selectedTeacher?.avatar} shape="circle" style={{ backgroundColor: COLORS.primary, color: COLORS.white, fontWeight: 700, width: "44px", height: "44px" }} />
                            <div>
                                <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem" }}>{selectedTeacher?.nome}</div>
                                <div style={{ fontSize: "0.82rem", color: COLORS.muted }}>{selectedTeacher?.email}</div>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.82rem" }}>
                            <div><strong>Departamento:</strong> {selectedTeacher?.departamento}</div>
                            <div><strong>Curso:</strong> {selectedTeacher?.curso}</div>
                            <div><strong>Estado:</strong> {estadoLabel(selectedTeacher!.estado)}</div>
                            <div><strong>Cumprimento:</strong> {selectedTeacher!.cumprimento}%</div>
                        </div>
                    </div>

                    <Divider />

                    <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "0.95rem", marginBottom: "0.75rem" }}>Indicadores de Cumprimento</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem", border: `1px solid #E2E8F0`, borderRadius: "8px", background: "#FFFFFF" }}>
                            <div style={{ fontSize: "0.82rem", color: COLORS.text }}>Aulas leccionadas</div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.dark, minWidth: "120px", textAlign: "right" }}>{selectedTeacher!.aulasRealizadas} / {selectedTeacher!.aulasPrevistas}</div>
                            {selectedTeacher!.aulasPendentes > 0 && <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginLeft: "0.5rem" }}>{selectedTeacher!.aulasPendentes} pendentes</div>}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem", border: `1px solid #E2E8F0`, borderRadius: "8px", background: "#FFFFFF" }}>
                            <div style={{ fontSize: "0.82rem", color: COLORS.text }}>Avaliações dentro do prazo</div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.dark, minWidth: "120px", textAlign: "right" }}>{selectedTeacher!.avaliacoesDentroPrazo} / {selectedTeacher!.avaliacoesTotal}</div>
                            {selectedTeacher!.avaliacoesForaPrazo > 0 && <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginLeft: "0.5rem" }}>{selectedTeacher!.avaliacoesForaPrazo} fora do prazo</div>}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem", border: `1px solid #E2E8F0`, borderRadius: "8px", background: "#FFFFFF" }}>
                            <div style={{ fontSize: "0.82rem", color: COLORS.text }}>Pauta final</div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.dark, minWidth: "120px", textAlign: "right" }}>{selectedTeacher!.pautaFinal}</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem", border: `1px solid #E2E8F0`, borderRadius: "8px", background: "#FFFFFF" }}>
                            <div style={{ fontSize: "0.82rem", color: COLORS.text }}>Actividades entregues</div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.dark, minWidth: "120px", textAlign: "right" }}>{selectedTeacher!.actividadesEntregues} / {selectedTeacher!.actividadesTotal}</div>
                            {selectedTeacher!.actividadesAtrasadas > 0 && <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginLeft: "0.5rem" }}>{selectedTeacher!.actividadesAtrasadas} atrasadas</div>}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem", border: `1px solid #E2E8F0`, borderRadius: "8px", background: "#FFFFFF" }}>
                            <div style={{ fontSize: "0.82rem", color: COLORS.text }}>Índice global de cumprimento</div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.dark, minWidth: "120px", textAlign: "right" }}>{selectedTeacher!.cumprimento}%</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <ProgressBar value={selectedTeacher!.cumprimento} showValue={false} style={{ height: "8px" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: COLORS.muted }}>
                            <span>Baixo</span>
                            <span>{selectedTeacher!.cumprimento}%</span>
                            <span>Alto</span>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
