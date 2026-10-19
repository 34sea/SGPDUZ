"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

import {
    Building2,
    GraduationCap,
    Users,
    Plus,
    Search,
    Pencil,
    Trash2,
    Link2,
    BarChart3,
} from "lucide-react";

import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getUsersList,
} from "@/app/api/academic/academicService";

/* =========================================================
   CORES
========================================================= */

const COLORS = {
    primary: "#1D4ED8",
    primaryLight: "#EFF6FF",
    green: "#16A34A",
    greenLight: "#DCFCE7",
    orange: "#D97706",
    orangeLight: "#FEF3C7",
    purple: "#7C3AED",
    purpleLight: "#F3E8FF",
    red: "#DC2626",
    dark: "#0F172A",
    text: "#334155",
    muted: "#64748B",
    border: "#E2E8F0",
    background: "#F8FAFC",
    white: "#FFFFFF",
};

export default function DepartmentCourseManagement() {
    const toast = useRef<Toast>(null);

    const [departments, setDepartments] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeSection, setActiveSection] = useState<"departments" | "courses">("departments");
    const [departmentSearch, setDepartmentSearch] = useState("");
    const [courseSearch, setCourseSearch] = useState("");
    const [departmentStatus, setDepartmentStatus] = useState<string | null>(null);
    const [courseStatus, setCourseStatus] = useState<string | null>(null);
    const [courseDepartment, setCourseDepartment] = useState<number | null>(null);

    const [departmentDialog, setDepartmentDialog] = useState(false);
    const [courseDialog, setCourseDialog] = useState(false);

    const [departmentForm, setDepartmentForm] = useState({
        id: 0,
        name: "",
        code: "",
        head_user_id: null as number | null,
        status: "Activo" as "Activo" | "Inactivo",
    });

    const [courseForm, setCourseForm] = useState({
        id: 0,
        name: "",
        code: "",
        department_id: 0,
        head_user_id: null as number | null,
        status: "Activo" as "Activo" | "Inactivo",
    });

    // Carregar dados da API
    const loadData = async () => {
        try {
            setLoading(true);
            const [deptRes, courseRes, userRes] = await Promise.all([
                getDepartments(),
                getCourses(),
                getUsersList(),
            ]);
            setDepartments(deptRes);
            setCourses(courseRes);
            setUsers(userRes);
        } catch (err: any) {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: err.response?.data?.message || "Erro ao carregar dados do servidor.",
                life: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Estatísticas Calculadas
    const activeDepartments = departments.filter((d) => d.status !== "Inactivo").length;
    const inactiveDepartments = departments.filter((d) => d.status === "Inactivo").length;
    const activeCourses = courses.filter((c) => c.status !== "Inactivo").length;
    const inactiveCourses = courses.filter((c) => c.status === "Inactivo").length;

    // Filtros
    const filteredDepartments = useMemo(() => {
        return departments.filter((dept) => {
            const search = departmentSearch.toLowerCase();
            const matchesSearch =
                dept.name.toLowerCase().includes(search) ||
                (dept.code && dept.code.toLowerCase().includes(search)) ||
                (dept.head_user_name && dept.head_user_name.toLowerCase().includes(search));
            const matchesStatus = !departmentStatus || dept.status === departmentStatus;
            return matchesSearch && matchesStatus;
        });
    }, [departments, departmentSearch, departmentStatus]);

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const search = courseSearch.toLowerCase();
            const matchesSearch =
                course.name.toLowerCase().includes(search) ||
                course.code.toLowerCase().includes(search) ||
                (course.head_user_name && course.head_user_name.toLowerCase().includes(search));
            const matchesStatus = !courseStatus || course.status === courseStatus;
            const matchesDepartment = !courseDepartment || course.department_id === courseDepartment;
            return matchesSearch && matchesStatus && matchesDepartment;
        });
    }, [courses, courseSearch, courseStatus, courseDepartment]);

    // Opções de utilizadores filtradas por papéis (ADMIN permitido em ambos + CHEFE_DEPARTAMENTO ou CHEFE_CURSO)
    const departmentHeadOptions = useMemo(() => {
        return users
            .filter((u) => {
                const role = (u.role_name || u.perfil || "").toUpperCase();
                return role === "ADMIN" || role === "CHEFE_DEPARTAMENTO";
            })
            .map((u) => ({
                label: u.name || u.nome,
                value: u.id,
            }));
    }, [users]);

    const courseHeadOptions = useMemo(() => {
        return users
            .filter((u) => {
                const role = (u.role_name || u.perfil || "").toUpperCase();
                return role === "ADMIN" || role === "CHEFE_CURSO";
            })
            .map((u) => ({
                label: u.name || u.nome,
                value: u.id,
            }));
    }, [users]);

    const departmentOptions = [
        { label: "Todos os departamentos", value: null },
        ...departments.map((d) => ({ label: d.name, value: d.id })),
    ];

    // --- CRUD DEPARTAMENTOS ---
    const openNewDepartment = () => {
        setDepartmentForm({ id: 0, name: "", code: "", head_user_id: null, status: "Activo" });
        setDepartmentDialog(true);
    };

    const editDepartment = (dept: any) => {
        setDepartmentForm({
            id: dept.id,
            name: dept.name,
            code: dept.code || "",
            head_user_id: dept.head_user_id || null,
            status: dept.status || "Activo",
        });
        setDepartmentDialog(true);
    };

    const saveDepartment = async () => {
        if (!departmentForm.name) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "O nome do departamento é obrigatório.", life: 3000 });
            return;
        }

        try {
            if (departmentForm.id === 0) {
                await createDepartment({ name: departmentForm.name, head_user_id: departmentForm.head_user_id });
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Departamento criado com sucesso.", life: 3000 });
            } else {
                await updateDepartment(departmentForm.id, { name: departmentForm.name, head_user_id: departmentForm.head_user_id });
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Departamento atualizado com sucesso.", life: 3000 });
            }
            setDepartmentDialog(false);
            loadData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao guardar departamento.", life: 4000 });
        }
    };

    const handleDeleteDepartment = (dept: any) => {
        confirmDialog({
            message: `Tem certeza que deseja eliminar o departamento ${dept.name}?`,
            header: "Confirmar Eliminação",
            icon: <Trash2 size={20} />,
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteDepartment(dept.id);
                    toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Departamento eliminado.", life: 3000 });
                    loadData();
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao eliminar departamento.", life: 4000 });
                }
            },
        });
    };

    // --- CRUD CURSOS ---
    const openNewCourse = () => {
        setCourseForm({ id: 0, name: "", code: "", department_id: 0, head_user_id: null, status: "Activo" });
        setCourseDialog(true);
    };

    const editCourse = (course: any) => {
        setCourseForm({
            id: course.id,
            name: course.name,
            code: course.code,
            department_id: course.department_id,
            head_user_id: course.head_user_id || null,
            status: course.status || "Activo",
        });
        setCourseDialog(true);
    };

    const saveCourse = async () => {
        if (!courseForm.name || !courseForm.code || !courseForm.department_id) {
            toast.current?.show({ severity: "warn", summary: "Aviso", detail: "Nome, código e departamento são obrigatórios.", life: 3000 });
            return;
        }

        try {
            if (courseForm.id === 0) {
                await createCourse({
                    name: courseForm.name,
                    code: courseForm.code,
                    department_id: courseForm.department_id,
                    head_user_id: courseForm.head_user_id,
                });
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Curso criado com sucesso.", life: 3000 });
            } else {
                await updateCourse(courseForm.id, {
                    name: courseForm.name,
                    code: courseForm.code,
                    department_id: courseForm.department_id,
                    head_user_id: courseForm.head_user_id,
                });
                toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Curso atualizado com sucesso.", life: 3000 });
            }
            setCourseDialog(false);
            loadData();
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao guardar curso.", life: 4000 });
        }
    };

    const handleDeleteCourse = (course: any) => {
        confirmDialog({
            message: `Tem certeza que deseja eliminar o curso ${course.name}?`,
            header: "Confirmar Eliminação",
            icon: <Trash2 size={20} />,
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteCourse(course.id);
                    toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Curso eliminado.", life: 3000 });
                    loadData();
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao eliminar curso.", life: 4000 });
                }
            },
        });
    };

    // Templates visuais da tabela
    const statusBody = (row: any) => (
        <Tag value={row.status || "Activo"} severity={row.status === "Inactivo" ? "danger" : "success"} style={{ fontSize: "0.72rem" }} />
    );

    const departmentNameBody = (row: any) => (
        <div>
            <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{row.name}</div>
            <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginTop: "3px" }}>{row.code || "Sem código"}</div>
        </div>
    );

    const departmentHeadBody = (row: any) => (
        <span style={{ color: COLORS.text, fontSize: "0.82rem" }}>
            {row.head_user_name || "Não atribuído"}
        </span>
    );

    const courseNameBody = (row: any) => (
        <div>
            <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.86rem" }}>{row.name}</div>
            <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginTop: "3px" }}>{row.code}</div>
        </div>
    );

    const courseDepartmentBody = (row: any) => (
        <div className="flex align-items-center gap-2">
            <Building2 size={15} color={COLORS.primary} />
            <span style={{ fontSize: "0.78rem", color: COLORS.text }}>{row.department_name}</span>
        </div>
    );

    const departmentActions = (row: any) => (
        <div className="flex gap-1 justify-content-end">
            <Button icon={<Pencil size={15} />} text rounded severity="secondary" onClick={() => editDepartment(row)} tooltip="Editar" />
            <Button icon={<Trash2 size={15} />} text rounded severity="danger" onClick={() => handleDeleteDepartment(row)} tooltip="Eliminar" />
        </div>
    );

    const courseActions = (row: any) => (
        <div className="flex gap-1 justify-content-end">
            <Button icon={<Pencil size={15} />} text rounded severity="secondary" onClick={() => editCourse(row)} tooltip="Editar" />
            <Button icon={<Trash2 size={15} />} text rounded severity="danger" onClick={() => handleDeleteCourse(row)} tooltip="Eliminar" />
        </div>
    );

    if (loading && departments.length === 0) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div style={{ width: "100%", padding: "1rem 1.25rem", background: COLORS.background, minHeight: "100vh" }}>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* CABEÇALHO */}
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Gestão de Departamentos e Cursos</h1>
                    <p style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>Organize a estrutura académica e cursos da instituição diretamente da base de dados.</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Novo departamento" icon={<Plus size={16} />} severity="secondary" outlined onClick={openNewDepartment} />
                    <Button label="Novo curso" icon={<Plus size={16} />} onClick={openNewCourse} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
                </div>
            </div>

            {/* INDICADORES */}
            <div className="grid mb-3">
                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Departamentos</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{departments.length}</div>
                                <div style={{ color: COLORS.green, fontSize: "0.72rem", marginTop: "3px" }}>{activeDepartments} activos</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={20} /></div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 xl:col-3">
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>Cursos</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.dark, marginTop: "4px" }}>{courses.length}</div>
                                <div style={{ color: COLORS.green, fontSize: "0.72rem", marginTop: "3px" }}>{activeCourses} activos</div>
                            </div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: COLORS.greenLight, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}><GraduationCap size={20} /></div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* NAVEGAÇÃO DE ABAS */}
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px 10px 0 0", padding: "0.35rem", display: "flex", gap: "0.35rem" }}>
                <button
                    type="button"
                    onClick={() => setActiveSection("departments")}
                    style={{
                        border: "none", cursor: "pointer", padding: "0.7rem 1rem", borderRadius: "7px",
                        background: activeSection === "departments" ? COLORS.primaryLight : "transparent",
                        color: activeSection === "departments" ? COLORS.primary : COLORS.muted,
                        fontWeight: activeSection === "departments" ? 600 : 500,
                    }}
                >
                    <span className="flex align-items-center gap-2"><Building2 size={16} /> Departamentos</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSection("courses")}
                    style={{
                        border: "none", cursor: "pointer", padding: "0.7rem 1rem", borderRadius: "7px",
                        background: activeSection === "courses" ? COLORS.primaryLight : "transparent",
                        color: activeSection === "courses" ? COLORS.primary : COLORS.muted,
                        fontWeight: activeSection === "courses" ? 600 : 500,
                    }}
                >
                    <span className="flex align-items-center gap-2"><GraduationCap size={16} /> Cursos</span>
                </button>
            </div>

            {/* TABELA DEPARTAMENTOS */}
            {activeSection === "departments" && (
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "1rem" }}>
                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="p-input-icon-left" style={{ flex: "1 1 300px" }}>
                            <Search size={16} />
                            <InputText value={departmentSearch} onChange={(e) => setDepartmentSearch(e.target.value)} placeholder="Pesquisar departamento..." style={{ width: "100%" }} />
                        </span>
                    </div>

                    <DataTable value={filteredDepartments} paginator rows={8} stripedRows responsiveLayout="scroll" emptyMessage="Nenhum departamento encontrado.">
                        <Column header="Departamento" body={departmentNameBody} style={{ minWidth: "280px" }} />
                        <Column header="Chefe de Departamento" body={departmentHeadBody} style={{ minWidth: "220px" }} />
                        <Column header="Estado" body={statusBody} />
                        <Column header="Acções" body={departmentActions} style={{ width: "120px" }} align="right" />
                    </DataTable>
                </div>
            )}

            {/* TABELA CURSOS */}
            {activeSection === "courses" && (
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "1rem" }}>
                    <div className="flex gap-2 mb-3 flex-wrap">
                        <span className="p-input-icon-left" style={{ flex: "1 1 280px" }}>
                            <Search size={16} />
                            <InputText value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} placeholder="Pesquisar curso ou código..." style={{ width: "100%" }} />
                        </span>
                        <Dropdown value={courseDepartment} options={departmentOptions} onChange={(e) => setCourseDepartment(e.value)} placeholder="Departamento" style={{ minWidth: "240px" }} showClear />
                    </div>

                    <DataTable value={filteredCourses} paginator rows={8} stripedRows responsiveLayout="scroll" emptyMessage="Nenhum curso encontrado.">
                        <Column header="Curso" body={courseNameBody} style={{ minWidth: "230px" }} />
                        <Column header="Departamento" body={courseDepartmentBody} style={{ minWidth: "300px" }} />
                        <Column header="Chefe de Curso" body={(row) => row.head_user_name || "Não atribuído"} style={{ minWidth: "170px" }} />
                        <Column header="Estado" body={statusBody} />
                        <Column header="Acções" body={courseActions} style={{ width: "120px" }} align="right" />
                    </DataTable>
                </div>
            )}

            {/* MODAL DEPARTAMENTO */}
            <Dialog visible={departmentDialog} onHide={() => setDepartmentDialog(false)} header={departmentForm.id === 0 ? "Novo Departamento" : "Editar Departamento"} style={{ width: "450px" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Nome do Departamento</label>
                        <InputText value={departmentForm.name} onChange={(e) => setDepartmentForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex.: Engenharia Informática" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Chefe de Departamento</label>
                        <Dropdown value={departmentForm.head_user_id} options={departmentHeadOptions} onChange={(e) => setDepartmentForm((p) => ({ ...p, head_user_id: e.value }))} placeholder="Selecionar chefe de departamento" className="w-full" showClear />
                    </div>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" severity="secondary" outlined onClick={() => setDepartmentDialog(false)} />
                        <Button label="Guardar" icon={<Plus size={15} />} onClick={saveDepartment} />
                    </div>
                </div>
            </Dialog>

            {/* MODAL CURSO */}
            <Dialog visible={courseDialog} onHide={() => setCourseDialog(false)} header={courseForm.id === 0 ? "Novo Curso" : "Editar Curso"} style={{ width: "480px" }}>
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Nome do Curso</label>
                        <InputText value={courseForm.name} onChange={(e) => setCourseForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex.: Engenharia Informática" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Código</label>
                        <InputText value={courseForm.code} onChange={(e) => setCourseForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="Ex.: LEI" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Departamento</label>
                        <Dropdown value={courseForm.department_id} options={departments.map((d) => ({ label: d.name, value: d.id }))} onChange={(e) => setCourseForm((p) => ({ ...p, department_id: e.value }))} placeholder="Selecionar departamento" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-sm">Chefe de Curso</label>
                        <Dropdown value={courseForm.head_user_id} options={courseHeadOptions} onChange={(e) => setCourseForm((p) => ({ ...p, head_user_id: e.value }))} placeholder="Selecionar chefe de curso" className="w-full" showClear />
                    </div>
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" severity="secondary" outlined onClick={() => setCourseDialog(false)} />
                        <Button label="Guardar" icon={<Plus size={15} />} onClick={saveCourse} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}