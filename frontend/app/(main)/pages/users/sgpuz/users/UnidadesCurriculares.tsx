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
    BookOpen, GraduationCap, Plus, Search, Pencil, Trash2, Power, ChevronRight,
    XCircle, CheckCircle2,
} from "lucide-react";

import {
    getSubjects, createSubject, updateSubject, deleteSubject,
    Subject, CreateSubjectData,
} from "@/api/academic/academicService";
import { getCourses, Course } from "@/api/academic/academicService";

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

export default function UnidadesCurriculares() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState<string | null>(null);

    const [subjectDialog, setSubjectDialog] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [confirmDeleteSubject, setConfirmDeleteSubject] = useState<Subject | null>(null);

    const [subjectForm, setSubjectForm] = useState<CreateSubjectData>({
        code: "", name: "", course_id: 0,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSubjects = async () => {
        setLoading(true); setError(null);
        try {
            const data = await getSubjects();
            setSubjects(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar unidades curriculares.");
            console.error("Erro ao carregar unidades curriculares:", err);
        } finally { setLoading(false); }
    };

    const loadCourses = async () => {
        try { const data = await getCourses(); setCourses(data); } catch (err: any) { console.error("Erro ao carregar cursos:", err); }
    };

    React.useEffect(() => { loadSubjects(); loadCourses(); }, []);

    const filteredSubjects = useMemo(() => {
        return subjects.filter((subject) => {
            const text = search.toLowerCase().trim();
            const matchesSearch = !text ||
                subject.name.toLowerCase().includes(text) ||
                subject.code.toLowerCase().includes(text) ||
                (subject.course && subject.course.toLowerCase().includes(text));
            const matchesCourse = !courseFilter || subject.course_id.toString() === courseFilter;
            return matchesSearch && matchesCourse;
        });
    }, [subjects, search, courseFilter]);

    const openNewSubject = () => {
        setSelectedSubject(null);
        setSubjectForm({ code: "", name: "", course_id: 0 });
        setSubjectDialog(true);
    };

    const editSubject = (subject: Subject) => {
        setSelectedSubject(subject);
        setSubjectForm({ code: subject.code, name: subject.name, course_id: subject.course_id });
        setSubjectDialog(true);
    };

    const saveSubject = async () => {
        if (!subjectForm.code || !subjectForm.name || !subjectForm.course_id) {
            setError("Preencha todos os campos obrigatórios."); return;
        }
        setSaving(true); setError(null);
        try {
            if (selectedSubject) {
                await updateSubject(selectedSubject.id, subjectForm);
            } else {
                await createSubject(subjectForm);
            }
            setSubjectDialog(false);
            await loadSubjects();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao guardar unidade curricular.");
            console.error("Erro ao guardar unidade curricular:", err);
        } finally { setSaving(false); }
    };

    const requestDeleteSubject = (subject: Subject) => { setConfirmDeleteSubject(subject); };

    const deleteSubjectItem = async () => {
        if (!confirmDeleteSubject) return;
        setLoading(true);
        try {
            await deleteSubject(confirmDeleteSubject.id);
            setConfirmDeleteSubject(null);
            await loadSubjects();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao remover unidade curricular.");
            console.error("Erro ao remover:", err);
        } finally { setLoading(false); }
    };

    const subjectNameBody = (row: Subject) => (
        <div>
            <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{row.name}</div>
            <div style={{ fontSize: "0.75rem", color: COLORS.primary, fontWeight: 600, marginTop: "3px" }}>{row.code}</div>
        </div>
    );

    const courseBody = (row: Subject) => (
        <span style={{ fontSize: "0.82rem", color: COLORS.text }}>{row.course || "-"}</span>
    );

    const statusBody = () => (
        <Tag value="Activo" severity="success" style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }} />
    );

    const actionsBody = (row: Subject) => (
        <div className="flex gap-1">
            <Button icon={<Pencil size={15} />} text rounded severity="secondary" tooltip="Editar" onClick={() => editSubject(row)} />
            <Button icon={<Trash2 size={15} />} text rounded severity="danger" tooltip="Remover" onClick={() => requestDeleteSubject(row)} />
        </div>
    );

    return (
        <div style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}>
            <ConfirmDialog
                header="Remover Unidade Curricular" icon={<Trash2 size={26} />}
                acceptLabel="Sim, remover" rejectLabel="Cancelar"
                acceptClassName="p-button-danger" accept={() => deleteSubjectItem()}
                visible={!!confirmDeleteSubject}
            >
                Tem certeza que deseja remover a unidade curricular <strong>{confirmDeleteSubject?.name}</strong>?
            </ConfirmDialog>

            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Unidades Curriculares</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Cadastre e gerencie as unidades curriculares associadas aos cursos.
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="Nova unidade curricular" icon={<Plus size={16} />} onClick={openNewSubject} disabled={loading || saving} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
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
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Total de UCs</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{subjects.length}</div>
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
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Cursos</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{courses.length}</div>
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
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 1fr) 220px auto", gap: ".75rem", alignItems: "center" }}>
                            <span className="p-input-icon-left">
                                <Search size={17} style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: COLORS.light, zIndex: 2 }} />
                                <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar unidade curricular..." style={{ width: "100%", paddingLeft: "2.5rem" }} />
                            </span>
                            <Dropdown value={courseFilter} onChange={(e) => setCourseFilter(e.value)} options={[{ label: "Todos os cursos", value: null }, ...courses.map((c) => ({ label: c.name, value: c.id.toString() }))]} optionLabel="label" optionValue="value" placeholder="Filtrar por curso" showClear />
                            <Button label="Limpar" icon={<Power size={16} />} text onClick={() => { setSearch(""); setCourseFilter(null); }} />
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Lista de Unidades Curriculares</h2>
                                <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Consulte e administre as UCs registadas.</p>
                            </div>
                            <Tag value={`${filteredSubjects.length} UCs`} severity="info" rounded />
                        </div>

                        <DataTable value={filteredSubjects} paginator rows={6} responsiveLayout="scroll" emptyMessage="Nenhuma unidade curricular encontrada." stripedRows size="small" loading={loading}>
                            <Column field="name" header="Unidade Curricular" body={subjectNameBody} style={{ minWidth: "260px" }} />
                            <Column field="course" header="Curso" body={courseBody} style={{ minWidth: "180px" }} />
                            <Column header="Estado" body={statusBody} style={{ width: "120px" }} />
                            <Column header="Acções" body={actionsBody} align="right" style={{ width: "150px" }} />
                        </DataTable>
                    </Card>
                </div>
            </div>

            <Dialog header={selectedSubject ? "Editar Unidade Curricular" : "Nova Unidade Curricular"} visible={subjectDialog} onHide={() => setSubjectDialog(false)} style={{ width: "450px" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Código</label>
                        <InputText value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} placeholder="Ex: INF301" disabled={saving} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Nome</label>
                        <InputText value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="Nome da unidade curricular" disabled={saving} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Curso</label>
                        <Dropdown value={courses.find((c) => c.id === subjectForm.course_id) || null} onChange={(e) => setSubjectForm({ ...subjectForm, course_id: e.value ? Number(e.value) : 0 })} options={courses.map((c) => ({ label: c.name, value: c.id }))} optionLabel="label" optionValue="value" placeholder="Selecione um curso" style={{ width: "100%" }} disabled={saving} />
                    </div>
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" text onClick={() => setSubjectDialog(false)} disabled={saving} />
                        <Button label="Guardar" onClick={saveSubject} disabled={saving} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
