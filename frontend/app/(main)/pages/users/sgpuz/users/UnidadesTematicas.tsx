"use client";

import React, { useMemo, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Divider } from "primereact/divider";

import {
    BookOpen, List, Plus, Search, Pencil, Trash2, Power, Clock3, GraduationCap,
    XCircle, CheckCircle2,
} from "lucide-react";

import {
    getAnalyticalPlans, AnalyticalPlan,
} from "@/api/pedagogical/pedagogicalService";
import {
    getTopicUnits, createTopicUnit, updateTopicUnit, deleteTopicUnit,
    TopicUnit, CreateTopicUnitData,
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

const lessonTypeColors: Record<string, { background: string; color: string }> = {
    TEORICA: { background: COLORS.primaryLight, color: COLORS.primary },
    PRATICA: { background: COLORS.greenLight, color: COLORS.green },
    LABORATORIAL: { background: COLORS.orangeLight, color: COLORS.orange },
    VISITA_ESTUDO: { background: COLORS.purpleLight, color: COLORS.purple },
};

export default function UnidadesTematicas() {
    const [plans, setPlans] = useState<AnalyticalPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<AnalyticalPlan | null>(null);
    const [topicUnits, setTopicUnits] = useState<TopicUnit[]>([]);

    const [search, setSearch] = useState("");

    const [unitDialog, setUnitDialog] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<TopicUnit | null>(null);
    const [confirmDeleteUnit, setConfirmDeleteUnit] = useState<TopicUnit | null>(null);

    const [unitForm, setUnitForm] = useState<CreateTopicUnitData>({
        analytical_plan_id: 0, title: "", description: "",
        planned_hours: 0, lesson_type: "TEORICA", sequence_order: 0,
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

    const loadTopicUnits = async (planId: number) => {
        try {
            const data = await getTopicUnits(planId);
            setTopicUnits(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar unidades temáticas.");
            console.error("Erro ao carregar unidades temáticas:", err);
        }
    };

    React.useEffect(() => { loadPlans(); }, []);

    const filteredUnits = useMemo(() => {
        return topicUnits.filter((unit) => {
            const text = search.toLowerCase().trim();
            return !text ||
                unit.title.toLowerCase().includes(text) ||
                (unit.description || "").toLowerCase().includes(text);
        });
    }, [topicUnits, search]);

    const selectPlan = (plan: AnalyticalPlan) => {
        setSelectedPlan(plan);
        loadTopicUnits(plan.id);
    };

    const openNewUnit = () => {
        if (!selectedPlan) return;
        setSelectedUnit(null);
        setUnitForm({
            analytical_plan_id: selectedPlan.id, title: "", description: "",
            planned_hours: 0, lesson_type: "TEORICA", sequence_order: 0,
        });
        setUnitDialog(true);
    };

    const editUnit = (unit: TopicUnit) => {
        setSelectedUnit(unit);
        setUnitForm({
            analytical_plan_id: unit.analytical_plan_id, title: unit.title,
            description: unit.description || "", planned_hours: unit.planned_hours,
            lesson_type: unit.lesson_type, sequence_order: unit.sequence_order,
        });
        setUnitDialog(true);
    };

    const saveUnit = async () => {
        if (!unitForm.title || unitForm.planned_hours <= 0) {
            setError("Preencha o título e a carga horária."); return;
        }
        setSaving(true); setError(null);
        try {
            if (selectedUnit) {
                await updateTopicUnit(selectedUnit.id, unitForm);
            } else {
                await createTopicUnit(unitForm);
            }
            setUnitDialog(false);
            if (selectedPlan) loadTopicUnits(selectedPlan.id);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao guardar unidade temática.");
            console.error("Erro ao guardar unidade temática:", err);
        } finally { setSaving(false); }
    };

    const requestDeleteUnit = (unit: TopicUnit) => { setConfirmDeleteUnit(unit); };

    const deleteUnit = async () => {
        if (!confirmDeleteUnit) return;
        setLoading(true);
        try {
            await deleteTopicUnit(confirmDeleteUnit.id);
            setConfirmDeleteUnit(null);
            if (selectedPlan) loadTopicUnits(selectedPlan.id);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao remover unidade.");
            console.error("Erro ao remover:", err);
        } finally { setLoading(false); }
    };

    const unitTitleBody = (row: TopicUnit) => (
        <div>
            <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{row.title}</div>
            <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginTop: "3px" }}>Sequência: {row.sequence_order}</div>
        </div>
    );

    const typeBody = (row: TopicUnit) => {
        const style = lessonTypeColors[row.lesson_type];
        return (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "0.3rem 0.6rem", borderRadius: "6px", background: style.background, color: style.color, fontSize: "0.7rem", fontWeight: 600 }}>
                {row.lesson_type}
            </span>
        );
    };

    const hoursBody = (row: TopicUnit) => (
        <span style={{ fontSize: "0.82rem", color: COLORS.text, fontWeight: 600 }}>{row.planned_hours}h</span>
    );

    const descriptionBody = (row: TopicUnit) => (
        <span style={{ fontSize: "0.78rem", color: COLORS.muted, maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {row.description || "-"}
        </span>
    );

    const actionsBody = (row: TopicUnit) => (
        <div className="flex gap-1">
            <Button icon={<Pencil size={15} />} text rounded severity="secondary" tooltip="Editar" onClick={() => editUnit(row)} />
            <Button icon={<Trash2 size={15} />} text rounded severity="danger" tooltip="Remover" onClick={() => requestDeleteUnit(row)} />
        </div>
    );

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <ConfirmDialog
                header="Remover Unidade Temática" icon={<Trash2 size={26} />}
                acceptLabel="Sim, remover" rejectLabel="Cancelar"
                acceptClassName="p-button-danger" accept={() => deleteUnit()}
                visible={!!confirmDeleteUnit}
            >
                Tem certeza que deseja remover "<strong>{confirmDeleteUnit?.title}</strong>"?
            </ConfirmDialog>

            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Unidades Temáticas</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Estruture os conteúdos leccionados por unidade curricular.
                    </div>
                </div>
                {selectedPlan && (
                    <Button
                        label="Nova unidade temática" icon={<Plus size={16} />}
                        onClick={openNewUnit} disabled={loading || saving}
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
                                Escolha o plano para gerir as suas unidades temáticas.
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
                                <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Unidades Temáticas</h2>
                                <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Conteúdos do plano: UC #{selectedPlan.subject_id}</p>
                            </div>
                            <Tag value={`${filteredUnits.length} unidades`} severity="info" rounded />
                        </div>

                        <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                                <span className="p-input-icon-left">
                                    <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar unidade temática..." style={{ width: "100%", paddingLeft: "2.5rem", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 1rem", fontSize: "0.85rem", boxSizing: "border-box" }} />
                                </span>
                            </div>

                            <DataTable
                                value={filteredUnits} paginator rows={6} responsiveLayout="scroll"
                                emptyMessage="Nenhuma unidade temática encontrada." stripedRows size="small" loading={loading}
                            >
                                <Column field="title" header="Unidade Temática" body={unitTitleBody} style={{ minWidth: "260px" }} />
                                <Column header="Tipo" body={typeBody} style={{ width: "120px" }} />
                                <Column header="Carga" body={hoursBody} style={{ width: "100px" }} />
                                <Column field="description" header="Descrição" body={descriptionBody} style={{ minWidth: "260px" }} />
                                <Column header="Acções" body={actionsBody} align="right" style={{ width: "140px" }} />
                            </DataTable>
                        </Card>
                    </div>
                )}
            </div>

            <Dialog
                header={selectedUnit ? "Editar Unidade Temática" : "Nova Unidade Temática"}
                visible={unitDialog} onHide={() => setUnitDialog(false)}
                style={{ width: "480px" }}
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Título</label>
                        <InputText value={unitForm.title} onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })} placeholder="Título da unidade temática" disabled={saving} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Descrição</label>
                        <InputTextarea value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} placeholder="Descrição do conteúdo" autoResize disabled={saving} />
                    </div>
                    <div className="flex gap-3">
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Carga horária (h)</label>
                            <InputText type="number" value={String(unitForm.planned_hours)} onChange={(e) => setUnitForm({ ...unitForm, planned_hours: Number(e.target.value) || 0 })} placeholder="0" disabled={saving} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Tipo de aula</label>
                            <Dropdown
                                value={unitForm.lesson_type}
                                onChange={(e) => setUnitForm({ ...unitForm, lesson_type: e.value })}
                                options={[
                                    { label: "Teórica", value: "TEORICA" },
                                    { label: "Prática", value: "PRATICA" },
                                    { label: "Laboratorial", value: "LABORATORIAL" },
                                    { label: "Visita de Estudo", value: "VISITA_ESTUDO" },
                                ]}
                                optionLabel="label" optionValue="value" style={{ width: "100%" }} disabled={saving}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Ordem de sequência</label>
                        <InputText type="number" value={String(unitForm.sequence_order)} onChange={(e) => setUnitForm({ ...unitForm, sequence_order: Number(e.target.value) || 0 })} placeholder="1" disabled={saving} />
                    </div>
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" text onClick={() => setUnitDialog(false)} disabled={saving} />
                        <Button label="Guardar" onClick={saveUnit} disabled={saving} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
