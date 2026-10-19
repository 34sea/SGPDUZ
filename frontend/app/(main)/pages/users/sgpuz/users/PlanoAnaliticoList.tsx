"use client";

import React, { useMemo, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog } from "primereact/confirmdialog";

import {
    BookOpen,
    GraduationCap,
    Plus,
    Search,
    Pencil,
    Trash2,
    Power,
    CalendarDays,
    FileText,
    XCircle,
    CheckCircle2,
} from "lucide-react";

import {
    getAnalyticalPlans,
    createAnalyticalPlan,
    deleteAnalyticalPlan,
    AnalyticalPlan,
} from "@/api/pedagogical/pedagogicalService";
import { getSubjects } from "@/api/academic/academicService";
import { getAcademicYears } from "@/api/academic/academicService";

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

interface PlanWithRelations extends AnalyticalPlan {
    subject_name?: string;
    academic_year_label?: string;
}

export default function PlanoAnaliticoList() {
    const [plans, setPlans] = useState<PlanWithRelations[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

    const [search, setSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
    const [yearFilter, setYearFilter] = useState<string | null>(null);

    const [planDialog, setPlanDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanWithRelations | null>(null);
    const [confirmDeletePlan, setConfirmDeletePlan] = useState<PlanWithRelations | null>(null);

    const [planForm, setPlanForm] = useState<{
        subject_id: number;
        academic_year_id: number;
    }>({ subject_id: 0, academic_year_id: 0 });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPlans = async () => {
        setLoading(true); setError(null);
        try {
            const data = await getAnalyticalPlans();
            setPlans(data as PlanWithRelations[]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar planos analíticos.");
            console.error("Erro ao carregar planos analíticos:", err);
        } finally { setLoading(false); }
    };

    const loadSubjects = async () => {
        try { const data = await getSubjects(); setSubjects(data); } catch (err: any) { console.error("Erro ao carregar unidades curriculares:", err); }
    };

    const loadAcademicYears = async () => {
        try { const data = await getAcademicYears(); setAcademicYears(data); } catch (err: any) { console.error("Erro ao carregar anos lectivos:", err); }
    };

    React.useEffect(() => {
        loadPlans(); loadSubjects(); loadAcademicYears();
    }, []);

    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const text = search.toLowerCase().trim();
            const matchesSearch = !text ||
                (plan.subject_name || "").toLowerCase().includes(text) ||
                (plan.academic_year_label || "").toLowerCase().includes(text);
            const matchesSubject = !subjectFilter || plan.subject_id.toString() === subjectFilter;
            const matchesYear = !yearFilter || plan.academic_year_id.toString() === yearFilter;
            return matchesSearch && matchesSubject && matchesYear;
        });
    }, [plans, search, subjectFilter, yearFilter]);

    const openNewPlan = () => {
        setSelectedPlan(null);
        setPlanForm({ subject_id: 0, academic_year_id: 0 });
        setPlanDialog(true);
    };

    const editPlan = (plan: PlanWithRelations) => {
        setSelectedPlan(plan);
        setPlanForm({ subject_id: plan.subject_id, academic_year_id: plan.academic_year_id });
        setPlanDialog(true);
    };

    const savePlan = async () => {
        if (!planForm.subject_id || !planForm.academic_year_id) {
            setError("Preencha todos os campos obrigatórios."); return;
        }
        setSaving(true); setError(null);
        try {
            if (selectedPlan) {
                // Update not implemented in backend for analytical plans yet, so we just create
                await createAnalyticalPlan(planForm);
            } else {
                await createAnalyticalPlan(planForm);
            }
            setPlanDialog(false);
            await loadPlans();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao guardar plano analítico.");
            console.error("Erro ao guardar plano analítico:", err);
        } finally { setSaving(false); }
    };

    const requestDeletePlan = (plan: PlanWithRelations) => { setConfirmDeletePlan(plan); };

    const deletePlan = async () => {
        if (!confirmDeletePlan) return;
        setLoading(true);
        try {
            await deleteAnalyticalPlan(confirmDeletePlan.id);
            setConfirmDeletePlan(null);
            await loadPlans();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao remover plano.");
            console.error("Erro ao remover:", err);
        } finally { setLoading(false); }
    };

    const planBody = (row: PlanWithRelations) => (
        <div>
            <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{row.subject_name || "Unidade Curricular"}</div>
            <div style={{ fontSize: "0.75rem", color: COLORS.primary, fontWeight: 600, marginTop: "3px" }}>Ano {row.academic_year_label || ""}</div>
        </div>
    );

    const actionsBody = (row: PlanWithRelations) => (
        <div className="flex gap-1">
            <Button icon={<FileText size={15} />} text rounded severity="secondary" tooltip="Ver unidades temáticas" />
            <Button icon={<Pencil size={15} />} text rounded severity="secondary" tooltip="Editar" onClick={() => editPlan(row)} />
            <Button icon={<Trash2 size={15} />} text rounded severity="danger" tooltip="Remover" onClick={() => requestDeletePlan(row)} />
        </div>
    );

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <ConfirmDialog
                header="Remover Plano Analítico" icon={<Trash2 size={26} />}
                acceptLabel="Sim, remover" rejectLabel="Cancelar"
                acceptClassName="p-button-danger" accept={() => deletePlan()}
                visible={!!confirmDeletePlan}
            >
                Tem certeza que deseja remover o plano analítico de <strong>{confirmDeletePlan?.subject_name || "esta UC"}</strong>?
            </ConfirmDialog>

            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Planos Analíticos</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Crie e gerencie os planos analíticos das unidades curriculares.
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        label="Novo plano" icon={<Plus size={16} />}
                        onClick={openNewPlan} disabled={loading || saving}
                        style={{ background: COLORS.primary, borderColor: COLORS.primary }}
                    />
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
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Total de planos</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{plans.length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <BookOpen size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Unidades curriculares</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{subjects.length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <GraduationCap size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid mb-3">
                <div className="col-12 lg:col-12">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 200px 180px auto", gap: ".75rem", alignItems: "center" }}>
                            <span className="p-input-icon-left">
                                <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                                <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar plano analítico..." style={{ width: "100%", paddingLeft: "2.5rem" }} />
                            </span>
                            <Dropdown
                                value={subjectFilter} onChange={(e) => setSubjectFilter(e.value)}
                                options={[{ label: "Todas as UCs", value: null }, ...subjects.map((s) => ({ label: s.name, value: s.id.toString() }))]}
                                optionLabel="label" optionValue="value" placeholder="Unidade curricular" showClear
                            />
                            <Dropdown
                                value={yearFilter} onChange={(e) => setYearFilter(e.value)}
                                options={[{ label: "Todos os anos", value: null }, ...academicYears.map((y) => ({ label: `Ano ${y.year} - Sem. ${y.semester}`, value: y.id.toString() }))]}
                                optionLabel="label" optionValue="value" placeholder="Ano lectivo" showClear
                            />
                            <Button label="Limpar" icon={<Power size={16} />} text onClick={() => { setSearch(""); setSubjectFilter(null); setYearFilter(null); }} />
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Lista de Planos Analíticos</h2>
                                <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Consulte e administre os planos analíticos registados.</p>
                            </div>
                            <Tag value={`${filteredPlans.length} planos`} severity="info" rounded />
                        </div>

                        <DataTable
                            value={filteredPlans} paginator rows={6} responsiveLayout="scroll"
                            emptyMessage="Nenhum plano analítico encontrado." stripedRows size="small" loading={loading}
                        >
                            <Column field="subject_name" header="Unidade Curricular" body={planBody} style={{ minWidth: "260px" }} />
                            <Column header="Ano Lectivo" body={(row) => (
                                <span style={{ fontSize: "0.82rem", color: COLORS.text }}>{row.academic_year_label || "-"}</span>
                            )} style={{ minWidth: "180px" }} />
                            <Column header="Acções" body={actionsBody} align="right" style={{ width: "160px" }} />
                        </DataTable>
                    </Card>
                </div>
            </div>

            <Dialog
                header={selectedPlan ? "Editar Plano Analítico" : "Novo Plano Analítico"}
                visible={planDialog} onHide={() => setPlanDialog(false)}
                style={{ width: "480px" }}
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Unidade Curricular</label>
                        <Dropdown
                            value={subjects.find((s) => s.id === planForm.subject_id) || null}
                            onChange={(e) => setPlanForm({ ...planForm, subject_id: e.value ? Number(e.value) : 0 })}
                            options={subjects.map((s) => ({ label: s.name, value: s.id }))}
                            optionLabel="label" optionValue="value" placeholder="Selecione uma UC" style={{ width: "100%" }} disabled={saving}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Ano Lectivo</label>
                        <Dropdown
                            value={academicYears.find((y) => y.id === planForm.academic_year_id) || null}
                            onChange={(e) => setPlanForm({ ...planForm, academic_year_id: e.value ? Number(e.value) : 0 })}
                            options={academicYears.map((y) => ({ label: `Ano ${y.year} - Sem. ${y.semester}`, value: y.id }))}
                            optionLabel="label" optionValue="value" placeholder="Selecione o ano lectivo" style={{ width: "100%" }} disabled={saving}
                        />
                    </div>
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" text onClick={() => setPlanDialog(false)} disabled={saving} />
                        <Button label="Guardar" onClick={savePlan} disabled={saving} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
