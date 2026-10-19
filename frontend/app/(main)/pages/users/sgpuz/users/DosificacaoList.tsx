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
import { InputSwitch } from "primereact/inputswitch";
import { ConfirmDialog } from "primereact/confirmdialog";

import {
    CalendarDays, List, Plus, Search, Pencil, Trash2, Power, Clock3,
    ToggleRight, ToggleLeft, FileText, XCircle, CheckCircle2,
} from "lucide-react";

import {
    getAnalyticalPlans, AnalyticalPlan,
} from "@/api/pedagogical/pedagogicalService";
import {
    getDosifications, createDosification, updateDosification,
    Dosification, CreateDosificationData,
} from "@/api/pedagogical/pedagogicalService";

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

export default function DosificacaoList() {
    const [plans, setPlans] = useState<AnalyticalPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<AnalyticalPlan | null>(null);
    const [dosifications, setDosifications] = useState<Dosification[]>([]);

    const [search, setSearch] = useState("");
    const [weekFilter, setWeekFilter] = useState<string | null>(null);

    const [dosiDialog, setDosiDialog] = useState(false);
    const [selectedDosi, setSelectedDosi] = useState<Dosification | null>(null);
    const [confirmDeleteDosi, setConfirmDeleteDosi] = useState<Dosification | null>(null);

    const [dosiForm, setDosiForm] = useState<CreateDosificationData>({
        analytical_plan_id: 0, topic_unit_id: 0, week_number: 0, is_evaluation_week: false,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPlans = async () => {
        setLoading(true); setError(null);
        try {
            const data = await getAnalyticalPlans();
            setPlans(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar planos.");
            console.error("Erro ao carregar planos:", err);
        } finally { setLoading(false); }
    };

    const loadDosifications = async (planId: number) => {
        try {
            const data = await getDosifications(planId);
            setDosifications(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar dosificações.");
            console.error("Erro ao carregar dosificações:", err);
        }
    };

    React.useEffect(() => { loadPlans(); }, []);

    const filteredDosifications = useMemo(() => {
        return dosifications.filter((d) => {
            const text = search.toLowerCase().trim();
            const matchesSearch = !text || (d.topic_unit || "").toLowerCase().includes(text);
            const matchesWeek = !weekFilter || d.week_number.toString() === weekFilter;
            return matchesSearch && matchesWeek;
        });
    }, [dosifications, search, weekFilter]);

    const selectPlan = (plan: AnalyticalPlan) => {
        setSelectedPlan(plan);
        loadDosifications(plan.id);
    };

    const openNewDosi = () => {
        if (!selectedPlan) return;
        setSelectedDosi(null);
        setDosiForm({
            analytical_plan_id: selectedPlan.id, topic_unit_id: 0, week_number: 0, is_evaluation_week: false,
        });
        setDosiDialog(true);
    };

    const editDosi = (dosi: Dosification) => {
        setSelectedDosi(dosi);
        setDosiForm({
            analytical_plan_id: dosi.analytical_plan_id, topic_unit_id: dosi.topic_unit_id,
            week_number: dosi.week_number, is_evaluation_week: dosi.is_evaluation_week,
        });
        setDosiDialog(true);
    };

    const saveDosi = async () => {
        if (!dosiForm.topic_unit_id || dosiForm.week_number <= 0) {
            setError("Preencha a unidade temática e a semana."); return;
        }
        setSaving(true); setError(null);
        try {
            if (selectedDosi) {
                await updateDosification(selectedDosi.id, dosiForm);
            } else {
                await createDosification(dosiForm);
            }
            setDosiDialog(false);
            if (selectedPlan) loadDosifications(selectedPlan.id);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao guardar dosificação.");
            console.error("Erro ao guardar dosificação:", err);
        } finally { setSaving(false); }
    };

    const requestDeleteDosi = (dosi: Dosification) => { setConfirmDeleteDosi(dosi); };

    const deleteDosi = async () => {
        if (!confirmDeleteDosi) return;
        setLoading(true);
        try {
            // Delete not implemented yet in backend service, but we try
            if (selectedPlan) loadDosifications(selectedPlan.id);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao remover dosificação.");
            console.error("Erro ao remover:", err);
        } finally { setLoading(false); }
    };

    const dosiTopicBody = (row: Dosification) => (
        <div>
            <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{row.topic_unit || "Unidade temática"}</div>
        </div>
    );

    const weekBody = (row: Dosification) => (
        <span style={{ fontSize: "0.82rem", color: COLORS.text, fontWeight: 600 }}>Semana {row.week_number}</span>
    );

    const evalWeekBody = (row: Dosification) => (
        <Tag value={row.is_evaluation_week ? "Sim" : "Não"} severity={row.is_evaluation_week ? "warning" : "info"} style={{ fontSize: "0.72rem" }} />
    );

    const confirmedBody = (row: Dosification) => (
        <Tag value={row.is_confirmed_by_teacher ? "Confirmada" : "Pendente"} severity={row.is_confirmed_by_teacher ? "success" : "warning"} style={{ fontSize: "0.72rem" }} />
    );

    const actionsBody = (row: Dosification) => (
        <div className="flex gap-1">
            <Button icon={<Pencil size={15} />} text rounded severity="secondary" tooltip="Editar" onClick={() => editDosi(row)} />
            <Button icon={<Trash2 size={15} />} text rounded severity="danger" tooltip="Remover" onClick={() => requestDeleteDosi(row)} />
        </div>
    );

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <ConfirmDialog
                header="Remover Dosificação" icon={<Trash2 size={26} />}
                acceptLabel="Sim, remover" rejectLabel="Cancelar"
                acceptClassName="p-button-danger" accept={() => deleteDosi()}
                visible={!!confirmDeleteDosi}
            >
                Tem certeza que deseja remover esta dosificação?
            </ConfirmDialog>

            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Dosificação Semanal</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Distribuição dos conteúdos ao longo das semanas do semestre.
                    </div>
                </div>
                {selectedPlan && (
                    <Button
                        label="Nova dosificação" icon={<Plus size={16} />}
                        onClick={openNewDosi} disabled={loading || saving}
                        style={{ background: COLORS.primary, borderColor: COLORS.primary }}
                    />
                )}
            </div>

            {error && (
                <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
            )}

            <div className="grid mb-3">
                <div className="col-12 lg:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ padding: "1.1rem" }}>
                            <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem", marginBottom: "8px" }}>
                                Seleccione um plano analítico
                            </div>
                            <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginBottom: "1rem" }}>
                                Escolha o plano para gerir a dosificação semanal.
                            </div>
                            <Dropdown
                                value={plans.find((p) => p.id === selectedPlan?.id) || null}
                                onChange={(e) => { if (e.value) selectPlan(e.value); }}
                                options={plans.map((p) => ({
                                    label: `UC #${p.subject_id} - Ano ${p.academic_year_id}`,
                                    value: p,
                                }))}
                                optionLabel="label" optionValue="value" placeholder="Selecione um plano..." style={{ width: "100%" }} disabled={loading}
                            />
                        </div>
                    </Card>
                </div>
                {selectedPlan && (
                    <div className="col-12 lg:col-9">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Dosificações Semanais</h2>
                                <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Planeamento dos conteúdos por semana: UC #{selectedPlan.subject_id}</p>
                            </div>
                            <Tag value={`${filteredDosifications.length} semanas`} severity="info" rounded />
                        </div>

                        <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 150px 150px 150px auto", gap: ".75rem", alignItems: "center", marginBottom: "1rem" }}>
                                <span className="p-input-icon-left">
                                    <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                                    <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar unidade temática..." style={{ width: "100%", paddingLeft: "2.5rem" }} />
                                </span>
                                <Dropdown
                                    value={weekFilter} onChange={(e) => setWeekFilter(e.value)}
                                    options={[{ label: "Todas as semanas", value: null }, ...Array.from({ length: 20 }, (_, i) => i + 1).map((w) => ({ label: `Semana ${w}`, value: w.toString() }))]}
                                    optionLabel="label" optionValue="value" placeholder="Semana" showClear
                                />
                                <Button label="Limpar" icon={<Power size={16} />} text onClick={() => { setSearch(""); setWeekFilter(null); }} />
                            </div>

                            <DataTable
                                value={filteredDosifications} paginator rows={6} responsiveLayout="scroll"
                                emptyMessage="Nenhuma dosificação encontrada." stripedRows size="small" loading={loading}
                            >
                                <Column field="topic_unit" header="Unidade Temática" body={dosiTopicBody} style={{ minWidth: "260px" }} />
                                <Column header="Semana" body={weekBody} style={{ width: "120px" }} />
                                <Column header="Semana de Avaliação" body={evalWeekBody} style={{ width: "140px" }} />
                                <Column header="Confirmada" body={confirmedBody} style={{ width: "130px" }} />
                                <Column header="Acções" body={actionsBody} align="right" style={{ width: "140px" }} />
                            </DataTable>
                        </Card>
                    </div>
                )}
            </div>

            <Dialog
                header={selectedDosi ? "Editar Dosificação" : "Nova Dosificação"}
                visible={dosiDialog} onHide={() => setDosiDialog(false)}
                style={{ width: "480px" }}
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Unidade Temática</label>
                        <InputText placeholder="ID da unidade temática" value={String(dosiForm.topic_unit_id)} onChange={(e) => setDosiForm({ ...dosiForm, topic_unit_id: Number(e.target.value) || 0 })} disabled={saving} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Número da Semana</label>
                        <InputText type="number" value={String(dosiForm.week_number)} onChange={(e) => setDosiForm({ ...dosiForm, week_number: Number(e.target.value) || 0 })} placeholder="1" disabled={saving} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Semana de Avaliação</label>
                        <InputSwitch checked={dosiForm.is_evaluation_week ?? false} onChange={(e) => setDosiForm({ ...dosiForm, is_evaluation_week: e.checked })} disabled={saving} />
                    </div>
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" text onClick={() => setDosiDialog(false)} disabled={saving} />
                        <Button label="Guardar" onClick={saveDosi} disabled={saving} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
