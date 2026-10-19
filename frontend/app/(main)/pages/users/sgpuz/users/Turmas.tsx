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
    Users,
    GraduationCap,
    Plus,
    Search,
    Pencil,
    Trash2,
    Power,
    UserCheck,
    Building2,
    CalendarDays,
    XCircle,
    CheckCircle2,
} from "lucide-react";

import {
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    ClassItem,
    CreateClassData,
} from "@/api/academic/academicService";
import { getCourses, Course } from "@/api/academic/academicService";
import { getAcademicYears, AcademicYear } from "@/api/academic/academicService";

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

export default function Turmas() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState<string | null>(null);
    const [yearFilter, setYearFilter] = useState<string | null>(null);

    const [classDialog, setClassDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
    const [confirmDeleteClass, setConfirmDeleteClass] = useState<ClassItem | null>(null);

    const [classForm, setClassForm] = useState<CreateClassData>({
        name: "", course_id: 0, academic_year_id: 0,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadClasses = async () => {
        setLoading(true); setError(null);
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao carregar turmas.");
            console.error("Erro ao carregar turmas:", err);
        } finally { setLoading(false); }
    };

    const loadCourses = async () => {
        try { const data = await getCourses(); setCourses(data); } catch (err: any) { console.error("Erro ao carregar cursos:", err); }
    };

    const loadAcademicYears = async () => {
        try { const data = await getAcademicYears(); setAcademicYears(data); } catch (err: any) { console.error("Erro ao carregar anos lectivos:", err); }
    };

    React.useEffect(() => {
        loadClasses(); loadCourses(); loadAcademicYears();
    }, []);

    const filteredClasses = useMemo(() => {
        return classes.filter((cls) => {
            const text = search.toLowerCase().trim();
            const matchesSearch = !text || cls.name.toLowerCase().includes(text) || (cls.course && cls.course.toLowerCase().includes(text));
            const matchesCourse = !courseFilter || cls.course_id.toString() === courseFilter;
            const matchesYear = !yearFilter || cls.academic_year_id.toString() === yearFilter;
            return matchesSearch && matchesCourse && matchesYear;
        });
    }, [classes, search, courseFilter, yearFilter]);

    const openNewClass = () => {
        setSelectedClass(null);
        setClassForm({ name: "", course_id: 0, academic_year_id: 0 });
        setClassDialog(true);
    };

    const editClass = (cls: ClassItem) => {
        setSelectedClass(cls);
        setClassForm({ name: cls.name, course_id: cls.course_id, academic_year_id: cls.academic_year_id });
        setClassDialog(true);
    };

    const saveClass = async () => {
        if (!classForm.name || !classForm.course_id || !classForm.academic_year_id) {
            setError("Preencha todos os campos obrigatórios."); return;
        }
        setSaving(true); setError(null);
        try {
            if (selectedClass) {
                await updateClass(selectedClass.id, classForm);
            } else {
                await createClass(classForm);
            }
            setClassDialog(false);
            await loadClasses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao guardar turma.");
            console.error("Erro ao guardar turma:", err);
        } finally { setSaving(false); }
    };

    const requestDeleteClass = (cls: ClassItem) => { setConfirmDeleteClass(cls); };

    const deleteClassItem = async () => {
        if (!confirmDeleteClass) return;
        setLoading(true);
        try {
            await deleteClass(confirmDeleteClass.id);
            setConfirmDeleteClass(null);
            await loadClasses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao remover turma.");
            console.error("Erro ao remover:", err);
        } finally { setLoading(false); }
    };

    const classNameBody = (row: ClassItem) => (
        <div>
            <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{row.name}</div>
        </div>
    );

    const courseBody = (row: ClassItem) => (
        <span style={{ fontSize: "0.82rem", color: COLORS.text }}>{row.course || "-"}</span>
    );

    const yearBody = (row: ClassItem) => (
        <span style={{ fontSize: "0.82rem", color: COLORS.text }}>{row.academic_year || "-"}</span>
    );

    const chiefsBody = (row: ClassItem) => (
        <div className="flex flex-column gap-1">
            <span style={{ fontSize: "0.78rem", color: COLORS.primary, fontWeight: 600 }}>Chefe: {row.class_chief_name || "-"}</span>
            <span style={{ fontSize: "0.78rem", color: COLORS.orange, fontWeight: 600 }}>Subchefe: {row.sub_chief_name || "-"}</span>
        </div>
    );

    const actionsBody = (row: ClassItem) => (
        <div className="flex gap-1">
            <Button icon={<Pencil size={15} />} text rounded severity="secondary" tooltip="Editar" onClick={() => editClass(row)} />
            <Button icon={<Trash2 size={15} />} text rounded severity="danger" tooltip="Remover" onClick={() => requestDeleteClass(row)} />
        </div>
    );

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <ConfirmDialog
                header="Remover Turma" icon={<Trash2 size={26} />}
                acceptLabel="Sim, remover" rejectLabel="Cancelar"
                acceptClassName="p-button-danger" accept={() => deleteClassItem()}
                visible={!!confirmDeleteClass}
            >
                Tem certeza que deseja remover a turma <strong>{confirmDeleteClass?.name}</strong>?
            </ConfirmDialog>

            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Turmas</div>
                    <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Crie e gerencie as turmas de cada curso e ano lectivo.
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        label="Nova turma" icon={<Plus size={16} />}
                        onClick={openNewClass} disabled={loading || saving}
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
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Total de turmas</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{classes.length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Users size={20} />
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
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Anos lectivos</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{academicYears.length}</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.purpleLight, color: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CalendarDays size={20} />
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
                                <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar turma..." style={{ width: "100%", paddingLeft: "2.5rem" }} />
                            </span>
                            <Dropdown
                                value={courseFilter} onChange={(e) => setCourseFilter(e.value)}
                                options={[{ label: "Todos os cursos", value: null }, ...courses.map((c) => ({ label: c.name, value: c.id.toString() }))]}
                                optionLabel="label" optionValue="value" placeholder="Curso" showClear
                            />
                            <Dropdown
                                value={yearFilter} onChange={(e) => setYearFilter(e.value)}
                                options={[{ label: "Todos os anos", value: null }, ...academicYears.map((y) => ({ label: `Ano ${y.year} - Sem. ${y.semester}`, value: y.id.toString() }))]}
                                optionLabel="label" optionValue="value" placeholder="Ano lectivo" showClear
                            />
                            <Button label="Limpar" icon={<Power size={16} />} text onClick={() => { setSearch(""); setCourseFilter(null); setYearFilter(null); }} />
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.05rem", color: COLORS.dark }}>Lista de Turmas</h2>
                                <p style={{ margin: ".25rem 0 0", color: COLORS.muted, fontSize: ".82rem" }}>Consulte e administre as turmas registadas.</p>
                            </div>
                            <Tag value={`${filteredClasses.length} turmas`} severity="info" rounded />
                        </div>

                        <DataTable
                            value={filteredClasses} paginator rows={6} responsiveLayout="scroll"
                            emptyMessage="Nenhuma turma encontrada." stripedRows size="small" loading={loading}
                        >
                            <Column field="name" header="Turma" body={classNameBody} style={{ minWidth: "200px" }} />
                            <Column field="course" header="Curso" body={courseBody} style={{ minWidth: "180px" }} />
                            <Column field="academic_year" header="Ano Lectivo" body={yearBody} style={{ minWidth: "160px" }} />
                            <Column header="Representantes" body={chiefsBody} style={{ minWidth: "220px" }} />
                            <Column header="Acções" body={actionsBody} align="right" style={{ width: "140px" }} />
                        </DataTable>
                    </Card>
                </div>
            </div>

            <Dialog
                header={selectedClass ? "Editar Turma" : "Nova Turma"}
                visible={classDialog} onHide={() => setClassDialog(false)}
                style={{ width: "480px" }}
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Nome da Turma</label>
                        <InputText value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="Ex: EI31A" disabled={saving} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Curso</label>
                        <Dropdown
                            value={courses.find((c) => c.id === classForm.course_id) || null}
                            onChange={(e) => setClassForm({ ...classForm, course_id: e.value ? Number(e.value) : 0 })}
                            options={courses.map((c) => ({ label: c.name, value: c.id }))}
                            optionLabel="label" optionValue="value" placeholder="Selecione um curso" style={{ width: "100%" }} disabled={saving}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Ano Lectivo</label>
                        <Dropdown
                            value={academicYears.find((y) => y.id === classForm.academic_year_id) || null}
                            onChange={(e) => setClassForm({ ...classForm, academic_year_id: e.value ? Number(e.value) : 0 })}
                            options={academicYears.map((y) => ({ label: `Ano ${y.year} - Sem. ${y.semester}`, value: y.id }))}
                            optionLabel="label" optionValue="value" placeholder="Selecione o ano lectivo" style={{ width: "100%" }} disabled={saving}
                        />
                    </div>
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" text onClick={() => setClassDialog(false)} disabled={saving} />
                        <Button label="Guardar" onClick={saveClass} disabled={saving} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
