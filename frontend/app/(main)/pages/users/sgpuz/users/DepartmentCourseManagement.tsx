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
import { Divider } from "primereact/divider";

import {
    Building2,
    GraduationCap,
    Users,
    BookOpen,
    Plus,
    Search,
    Pencil,
    Trash2,
    Power,
    Link2,
    BarChart3,
    ChevronRight,
} from "lucide-react";

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

    cyan: "#0891B2",
    cyanLight: "#CFFAFE",

    red: "#DC2626",
    redLight: "#FEE2E2",

    dark: "#0F172A",
    text: "#334155",
    muted: "#64748B",
    light: "#94A3B8",

    border: "#E2E8F0",
    background: "#F8FAFC",
    white: "#FFFFFF",
};

/* =========================================================
   TIPOS
========================================================= */

interface Department {
    id: number;
    name: string;
    code: string;
    head: string;
    status: "Activo" | "Inactivo";
    courses: number;
    users: number;
}

interface Course {
    id: number;
    name: string;
    code: string;
    departmentId: number;
    department: string;
    head: string;
    status: "Activo" | "Inactivo";
    students: number;
}

/* =========================================================
   DADOS FICTÍCIOS
========================================================= */

const initialDepartments: Department[] = [
    {
        id: 1,
        name: "Departamento de Engenharia Informática",
        code: "DEI",
        head: "John Doe",
        status: "Activo",
        courses: 4,
        users: 18,
    },
    {
        id: 2,
        name: "Departamento de Engenharia Civil",
        code: "DEC",
        head: "Jane Smith",
        status: "Activo",
        courses: 3,
        users: 15,
    },
    {
        id: 3,
        name: "Departamento de Ciências Naturais",
        code: "DCN",
        head: "Alex Johnson",
        status: "Activo",
        courses: 2,
        users: 11,
    },
    {
        id: 4,
        name: "Departamento de Gestão e Economia",
        code: "DGE",
        head: "Emily Brown",
        status: "Inactivo",
        courses: 2,
        users: 9,
    },
];

const initialCourses: Course[] = [
    {
        id: 1,
        name: "Engenharia Informática",
        code: "EI",
        departmentId: 1,
        department: "Departamento de Engenharia Informática",
        head: "Michael Wilson",
        status: "Activo",
        students: 245,
    },
    {
        id: 2,
        name: "Tecnologias de Informação",
        code: "TI",
        departmentId: 1,
        department: "Departamento de Engenharia Informática",
        head: "Sarah Davis",
        status: "Activo",
        students: 186,
    },
    {
        id: 3,
        name: "Sistemas de Informação",
        code: "SI",
        departmentId: 1,
        department: "Departamento de Engenharia Informática",
        head: "Daniel Miller",
        status: "Activo",
        students: 142,
    },
    {
        id: 4,
        name: "Engenharia de Software",
        code: "ES",
        departmentId: 1,
        department: "Departamento de Engenharia Informática",
        head: "Olivia Taylor",
        status: "Activo",
        students: 128,
    },
    {
        id: 5,
        name: "Engenharia Civil",
        code: "EC",
        departmentId: 2,
        department: "Departamento de Engenharia Civil",
        head: "James Anderson",
        status: "Activo",
        students: 210,
    },
    {
        id: 6,
        name: "Construção Civil",
        code: "CC",
        departmentId: 2,
        department: "Departamento de Engenharia Civil",
        head: "Sophia Thomas",
        status: "Activo",
        students: 164,
    },
    {
        id: 7,
        name: "Gestão de Obras",
        code: "GO",
        departmentId: 2,
        department: "Departamento de Engenharia Civil",
        head: "William Jackson",
        status: "Activo",
        students: 97,
    },
    {
        id: 8,
        name: "Biologia",
        code: "BIO",
        departmentId: 3,
        department: "Departamento de Ciências Naturais",
        head: "Emma White",
        status: "Activo",
        students: 154,
    },
    {
        id: 9,
        name: "Química",
        code: "QUI",
        departmentId: 3,
        department: "Departamento de Ciências Naturais",
        head: "Noah Harris",
        status: "Inactivo",
        students: 88,
    },
    {
        id: 10,
        name: "Gestão de Empresas",
        code: "GE",
        departmentId: 4,
        department: "Departamento de Gestão e Economia",
        head: "Liam Martin",
        status: "Activo",
        students: 201,
    },
    {
        id: 11,
        name: "Economia",
        code: "ECO",
        departmentId: 4,
        department: "Departamento de Gestão e Economia",
        head: "Ava Thompson",
        status: "Activo",
        students: 133,
    },
];

/* =========================================================
   COMPONENTE
========================================================= */

export default function DepartmentCourseManagement() {
    const [departments, setDepartments] =
        useState<Department[]>(initialDepartments);

    const [courses, setCourses] =
        useState<Course[]>(initialCourses);

    const [activeSection, setActiveSection] =
        useState<"departments" | "courses">("departments");

    const [departmentSearch, setDepartmentSearch] =
        useState("");

    const [courseSearch, setCourseSearch] =
        useState("");

    const [departmentStatus, setDepartmentStatus] =
        useState<string | null>(null);

    const [courseStatus, setCourseStatus] =
        useState<string | null>(null);

    const [courseDepartment, setCourseDepartment] =
        useState<number | null>(null);

    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);

    const [selectedCourse, setSelectedCourse] =
        useState<Course | null>(null);

    const [departmentDialog, setDepartmentDialog] =
        useState(false);

    const [courseDialog, setCourseDialog] =
        useState(false);

    const [departmentForm, setDepartmentForm] =
        useState<Department>({
            id: 0,
            name: "",
            code: "",
            head: "",
            status: "Activo",
            courses: 0,
            users: 0,
        });

    const [courseForm, setCourseForm] =
        useState<Course>({
            id: 0,
            name: "",
            code: "",
            departmentId: 0,
            department: "",
            head: "",
            status: "Activo",
            students: 0,
        });

    /* =====================================================
       ESTATÍSTICAS
    ===================================================== */

    const activeDepartments = departments.filter(
        (department) => department.status === "Activo"
    ).length;

    const inactiveDepartments = departments.filter(
        (department) => department.status === "Inactivo"
    ).length;

    const activeCourses = courses.filter(
        (course) => course.status === "Activo"
    ).length;

    const inactiveCourses = courses.filter(
        (course) => course.status === "Inactivo"
    ).length;

    const totalStudents = courses.reduce(
        (total, course) => total + course.students,
        0
    );

    /* =====================================================
       FILTROS
    ===================================================== */

    const filteredDepartments = useMemo(() => {
        return departments.filter((department) => {
            const search = departmentSearch.toLowerCase();

            const matchesSearch =
                department.name.toLowerCase().includes(search) ||
                department.code.toLowerCase().includes(search) ||
                department.head.toLowerCase().includes(search);

            const matchesStatus =
                !departmentStatus ||
                department.status === departmentStatus;

            return matchesSearch && matchesStatus;
        });
    }, [
        departments,
        departmentSearch,
        departmentStatus,
    ]);

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const search = courseSearch.toLowerCase();

            const matchesSearch =
                course.name.toLowerCase().includes(search) ||
                course.code.toLowerCase().includes(search) ||
                course.head.toLowerCase().includes(search);

            const matchesStatus =
                !courseStatus ||
                course.status === courseStatus;

            const matchesDepartment =
                !courseDepartment ||
                course.departmentId === courseDepartment;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDepartment
            );
        });
    }, [
        courses,
        courseSearch,
        courseStatus,
        courseDepartment,
    ]);

    /* =====================================================
       OPÇÕES
    ===================================================== */

    const statusOptions = [
        {
            label: "Todos os estados",
            value: null,
        },
        {
            label: "Activo",
            value: "Activo",
        },
        {
            label: "Inactivo",
            value: "Inactivo",
        },
    ];

    const departmentOptions = [
        {
            label: "Todos os departamentos",
            value: null,
        },
        ...departments.map((department) => ({
            label: department.name,
            value: department.id,
        })),
    ];

    const headOptions = [
        { label: "John Doe", value: "John Doe" },
        { label: "Jane Smith", value: "Jane Smith" },
        { label: "Alex Johnson", value: "Alex Johnson" },
        { label: "Emily Brown", value: "Emily Brown" },
        { label: "Michael Wilson", value: "Michael Wilson" },
        { label: "Sarah Davis", value: "Sarah Davis" },
        { label: "Daniel Miller", value: "Daniel Miller" },
        { label: "Olivia Taylor", value: "Olivia Taylor" },
        { label: "James Anderson", value: "James Anderson" },
        { label: "Sophia Thomas", value: "Sophia Thomas" },
    ];

    /* =====================================================
       NOVO DEPARTAMENTO
    ===================================================== */

    const openNewDepartment = () => {
        setSelectedDepartment(null);

        setDepartmentForm({
            id: 0,
            name: "",
            code: "",
            head: "",
            status: "Activo",
            courses: 0,
            users: 0,
        });

        setDepartmentDialog(true);
    };

    const editDepartment = (department: Department) => {
        setSelectedDepartment(department);

        setDepartmentForm({
            ...department,
        });

        setDepartmentDialog(true);
    };

    const saveDepartment = () => {
        if (!departmentForm.name || !departmentForm.code) {
            return;
        }

        if (departmentForm.id === 0) {
            const newDepartment: Department = {
                ...departmentForm,
                id: Date.now(),
            };

            setDepartments((current) => [
                ...current,
                newDepartment,
            ]);
        } else {
            setDepartments((current) =>
                current.map((department) =>
                    department.id === departmentForm.id
                        ? departmentForm
                        : department
                )
            );
        }

        setDepartmentDialog(false);
    };

    const toggleDepartment = (department: Department) => {
        setDepartments((current) =>
            current.map((item) =>
                item.id === department.id
                    ? {
                          ...item,
                          status:
                              item.status === "Activo"
                                  ? "Inactivo"
                                  : "Activo",
                      }
                    : item
            )
        );
    };

    const deleteDepartment = (department: Department) => {
        setDepartments((current) =>
            current.filter(
                (item) => item.id !== department.id
            )
        );

        setCourses((current) =>
            current.filter(
                (course) =>
                    course.departmentId !== department.id
            )
        );
    };

    /* =====================================================
       NOVO CURSO
    ===================================================== */

    const openNewCourse = () => {
        setSelectedCourse(null);

        setCourseForm({
            id: 0,
            name: "",
            code: "",
            departmentId: 0,
            department: "",
            head: "",
            status: "Activo",
            students: 0,
        });

        setCourseDialog(true);
    };

    const editCourse = (course: Course) => {
        setSelectedCourse(course);

        setCourseForm({
            ...course,
        });

        setCourseDialog(true);
    };

    const saveCourse = () => {
        if (
            !courseForm.name ||
            !courseForm.code ||
            !courseForm.departmentId
        ) {
            return;
        }

        const department = departments.find(
            (item) =>
                item.id === courseForm.departmentId
        );

        const courseToSave = {
            ...courseForm,
            department:
                department?.name || "",
        };

        if (courseForm.id === 0) {
            const newCourse: Course = {
                ...courseToSave,
                id: Date.now(),
            };

            setCourses((current) => [
                ...current,
                newCourse,
            ]);
        } else {
            setCourses((current) =>
                current.map((course) =>
                    course.id === courseForm.id
                        ? courseToSave
                        : course
                )
            );
        }

        setCourseDialog(false);
    };

    const toggleCourse = (course: Course) => {
        setCourses((current) =>
            current.map((item) =>
                item.id === course.id
                    ? {
                          ...item,
                          status:
                              item.status === "Activo"
                                  ? "Inactivo"
                                  : "Activo",
                      }
                    : item
            )
        );
    };

    const deleteCourse = (course: Course) => {
        setCourses((current) =>
            current.filter(
                (item) => item.id !== course.id
            )
        );
    };

    /* =====================================================
       TEMPLATES
    ===================================================== */

    const statusBody = (row: {
        status: "Activo" | "Inactivo";
    }) => (
        <Tag
            value={row.status}
            severity={
                row.status === "Activo"
                    ? "success"
                    : "danger"
            }
            style={{
                fontSize: "0.72rem",
                padding: "0.3rem 0.6rem",
            }}
        />
    );

    const departmentNameBody = (row: Department) => (
        <div>
            <div
                style={{
                    fontWeight: 600,
                    color: COLORS.dark,
                    fontSize: "0.86rem",
                }}
            >
                {row.name}
            </div>

            <div
                style={{
                    fontSize: "0.75rem",
                    color: COLORS.muted,
                    marginTop: "3px",
                }}
            >
                {row.code}
            </div>
        </div>
    );

    const departmentHeadBody = (row: Department) => (
        <div className="flex align-items-center gap-2">
            <div
                style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: COLORS.primaryLight,
                    color: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                }}
            >
                {row.head
                    .split(" ")
                    .map((item) => item[0])
                    .join("")}
            </div>

            <span
                style={{
                    color: COLORS.text,
                    fontSize: "0.82rem",
                }}
            >
                {row.head}
            </span>
        </div>
    );

    const courseNameBody = (row: Course) => (
        <div>
            <div
                style={{
                    fontWeight: 600,
                    color: COLORS.dark,
                    fontSize: "0.86rem",
                }}
            >
                {row.name}
            </div>

            <div
                style={{
                    fontSize: "0.75rem",
                    color: COLORS.muted,
                    marginTop: "3px",
                }}
            >
                {row.code}
            </div>
        </div>
    );

    const courseDepartmentBody = (row: Course) => (
        <div
            className="flex align-items-center gap-2"
            style={{
                maxWidth: "270px",
            }}
        >
            <Building2
                size={15}
                color={COLORS.primary}
            />

            <span
                style={{
                    fontSize: "0.78rem",
                    color: COLORS.text,
                }}
            >
                {row.department}
            </span>
        </div>
    );

    const courseHeadBody = (row: Course) => (
        <span
            style={{
                fontSize: "0.82rem",
                color: COLORS.text,
            }}
        >
            {row.head}
        </span>
    );

    const departmentActions = (row: Department) => (
        <div className="flex gap-1">
            <Button
                icon={<Pencil size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Editar"
                onClick={() => editDepartment(row)}
            />

            <Button
                icon={<Power size={15} />}
                text
                rounded
                severity={
                    row.status === "Activo"
                        ? "warning"
                        : "success"
                }
                tooltip={
                    row.status === "Activo"
                        ? "Desactivar"
                        : "Activar"
                }
                onClick={() =>
                    toggleDepartment(row)
                }
            />

            <Button
                icon={<Trash2 size={15} />}
                text
                rounded
                severity="danger"
                tooltip="Remover"
                onClick={() =>
                    deleteDepartment(row)
                }
            />
        </div>
    );

    const courseActions = (row: Course) => (
        <div className="flex gap-1">
            <Button
                icon={<Pencil size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Editar"
                onClick={() => editCourse(row)}
            />

            <Button
                icon={<Power size={15} />}
                text
                rounded
                severity={
                    row.status === "Activo"
                        ? "warning"
                        : "success"
                }
                tooltip={
                    row.status === "Activo"
                        ? "Desactivar"
                        : "Activar"
                }
                onClick={() => toggleCourse(row)}
            />

            <Button
                icon={<Trash2 size={15} />}
                text
                rounded
                severity="danger"
                tooltip="Remover"
                onClick={() => deleteCourse(row)}
            />
        </div>
    );

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "none",
                margin: 0,
                padding: "1rem 1.25rem",
                boxSizing: "border-box",
                background: COLORS.background,
                minHeight: "100vh",
            }}
        >
            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div
                className="flex justify-content-between align-items-center"
                style={{
                    marginBottom: "1.25rem",
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: "1.55rem",
                            fontWeight: 700,
                            color: COLORS.dark,
                        }}
                    >
                        Gestão de Departamentos e Cursos
                    </div>

                    <div
                        style={{
                            color: COLORS.muted,
                            fontSize: "0.85rem",
                            marginTop: "5px",
                        }}
                    >
                        Organize a estrutura académica,
                        departamentos e cursos da instituição.
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        label="Novo departamento"
                        icon={<Plus size={16} />}
                        severity="secondary"
                        outlined
                        onClick={openNewDepartment}
                    />

                    <Button
                        label="Novo curso"
                        icon={<Plus size={16} />}
                        onClick={openNewCourse}
                        style={{
                            background: COLORS.primary,
                            borderColor: COLORS.primary,
                        }}
                    />
                </div>
            </div>

            {/* =================================================
                INDICADORES
            ================================================= */}

            <div className="grid mb-3">
                {/* Departamentos */}

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1rem",
                        }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                    }}
                                >
                                    Departamentos
                                </div>

                                <div
                                    style={{
                                        fontSize: "1.6rem",
                                        fontWeight: 700,
                                        color: COLORS.dark,
                                        marginTop: "4px",
                                    }}
                                >
                                    {departments.length}
                                </div>

                                <div
                                    style={{
                                        color: COLORS.green,
                                        fontSize: "0.72rem",
                                        marginTop: "3px",
                                    }}
                                >
                                    {activeDepartments} activos
                                </div>
                            </div>

                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "9px",
                                    background:
                                        COLORS.primaryLight,
                                    color: COLORS.primary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Building2 size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cursos */}

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1rem",
                        }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                    }}
                                >
                                    Cursos
                                </div>

                                <div
                                    style={{
                                        fontSize: "1.6rem",
                                        fontWeight: 700,
                                        color: COLORS.dark,
                                        marginTop: "4px",
                                    }}
                                >
                                    {courses.length}
                                </div>

                                <div
                                    style={{
                                        color: COLORS.green,
                                        fontSize: "0.72rem",
                                        marginTop: "3px",
                                    }}
                                >
                                    {activeCourses} activos
                                </div>
                            </div>

                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "9px",
                                    background:
                                        COLORS.greenLight,
                                    color: COLORS.green,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <GraduationCap size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estudantes */}

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1rem",
                        }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                    }}
                                >
                                    Estudantes
                                </div>

                                <div
                                    style={{
                                        fontSize: "1.6rem",
                                        fontWeight: 700,
                                        color: COLORS.dark,
                                        marginTop: "4px",
                                    }}
                                >
                                    {totalStudents.toLocaleString(
                                        "pt-MZ"
                                    )}
                                </div>

                                <div
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.72rem",
                                        marginTop: "3px",
                                    }}
                                >
                                    Distribuídos pelos cursos
                                </div>
                            </div>

                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "9px",
                                    background:
                                        COLORS.purpleLight,
                                    color: COLORS.purple,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Users size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Associação */}

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1rem",
                        }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <div
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                    }}
                                >
                                    Associação
                                </div>

                                <div
                                    style={{
                                        fontSize: "1.6rem",
                                        fontWeight: 700,
                                        color: COLORS.dark,
                                        marginTop: "4px",
                                    }}
                                >
                                    {courses.filter(
                                        (course) =>
                                            course.departmentId
                                    ).length}
                                </div>

                                <div
                                    style={{
                                        color: COLORS.primary,
                                        fontSize: "0.72rem",
                                        marginTop: "3px",
                                    }}
                                >
                                    Cursos associados
                                </div>
                            </div>

                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "9px",
                                    background:
                                        COLORS.orangeLight,
                                    color: COLORS.orange,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Link2 size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                VISÃO GERAL
            ================================================= */}

            <div className="grid mb-3">
                <div className="col-12 lg:col-7">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1.1rem",
                            height: "100%",
                        }}
                    >
                        <div className="flex justify-content-between align-items-start mb-3">
                            <div>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: COLORS.dark,
                                        fontSize: "1rem",
                                    }}
                                >
                                    Estrutura académica
                                </div>

                                <div
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                        marginTop: "4px",
                                    }}
                                >
                                    Distribuição dos cursos pelos
                                    departamentos.
                                </div>
                            </div>

                            <BarChart3
                                size={20}
                                color={COLORS.primary}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.9rem",
                            }}
                        >
                            {departments.map(
                                (department) => {
                                    const percentage =
                                        courses.length
                                            ? (department.courses /
                                                  courses.length) *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            key={
                                                department.id
                                            }
                                        >
                                            <div className="flex justify-content-between mb-1">
                                                <span
                                                    style={{
                                                        fontSize:
                                                            "0.8rem",
                                                        color: COLORS.text,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {
                                                        department.name
                                                    }
                                                </span>

                                                <span
                                                    style={{
                                                        fontSize:
                                                            "0.75rem",
                                                        color: COLORS.muted,
                                                    }}
                                                >
                                                    {
                                                        department.courses
                                                    }{" "}
                                                    cursos
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    height: "8px",
                                                    borderRadius:
                                                        "20px",
                                                    background:
                                                        COLORS.border,
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${Math.max(
                                                            percentage,
                                                            4
                                                        )}%`,
                                                        height: "100%",
                                                        background:
                                                            COLORS.primary,
                                                        borderRadius:
                                                            "20px",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 lg:col-5">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1.1rem",
                            height: "100%",
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 700,
                                color: COLORS.dark,
                                fontSize: "1rem",
                            }}
                        >
                            Estado da estrutura
                        </div>

                        <div
                            style={{
                                color: COLORS.muted,
                                fontSize: "0.78rem",
                                marginTop: "4px",
                            }}
                        >
                            Resumo dos departamentos e cursos
                            registados.
                        </div>

                        <Divider />

                        <div
                            className="flex justify-content-between align-items-center"
                            style={{
                                padding: "0.65rem 0",
                            }}
                        >
                            <div className="flex align-items-center gap-2">
                                <span
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        background:
                                            COLORS.green,
                                    }}
                                />

                                <span
                                    style={{
                                        color: COLORS.text,
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    Departamentos activos
                                </span>
                            </div>

                            <strong
                                style={{
                                    color: COLORS.dark,
                                }}
                            >
                                {activeDepartments}
                            </strong>
                        </div>

                        <div
                            className="flex justify-content-between align-items-center"
                            style={{
                                padding: "0.65rem 0",
                            }}
                        >
                            <div className="flex align-items-center gap-2">
                                <span
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        background:
                                            COLORS.red,
                                    }}
                                />

                                <span
                                    style={{
                                        color: COLORS.text,
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    Departamentos inactivos
                                </span>
                            </div>

                            <strong
                                style={{
                                    color: COLORS.dark,
                                }}
                            >
                                {inactiveDepartments}
                            </strong>
                        </div>

                        <div
                            className="flex justify-content-between align-items-center"
                            style={{
                                padding: "0.65rem 0",
                            }}
                        >
                            <div className="flex align-items-center gap-2">
                                <span
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        background:
                                            COLORS.primary,
                                    }}
                                />

                                <span
                                    style={{
                                        color: COLORS.text,
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    Cursos activos
                                </span>
                            </div>

                            <strong
                                style={{
                                    color: COLORS.dark,
                                }}
                            >
                                {activeCourses}
                            </strong>
                        </div>

                        <div
                            className="flex justify-content-between align-items-center"
                            style={{
                                padding: "0.65rem 0",
                            }}
                        >
                            <div className="flex align-items-center gap-2">
                                <span
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        background:
                                            COLORS.orange,
                                    }}
                                />

                                <span
                                    style={{
                                        color: COLORS.text,
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    Cursos inactivos
                                </span>
                            </div>

                            <strong
                                style={{
                                    color: COLORS.dark,
                                }}
                            >
                                {inactiveCourses}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                NAVEGAÇÃO
            ================================================= */}

            <div
                style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "10px 10px 0 0",
                    padding: "0.35rem",
                    display: "flex",
                    gap: "0.35rem",
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        setActiveSection("departments")
                    }
                    style={{
                        border: "none",
                        cursor: "pointer",
                        padding: "0.7rem 1rem",
                        borderRadius: "7px",
                        background:
                            activeSection === "departments"
                                ? COLORS.primaryLight
                                : "transparent",
                        color:
                            activeSection === "departments"
                                ? COLORS.primary
                                : COLORS.muted,
                        fontWeight:
                            activeSection === "departments"
                                ? 600
                                : 500,
                    }}
                >
                    <span className="flex align-items-center gap-2">
                        <Building2 size={16} />
                        Departamentos
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setActiveSection("courses")
                    }
                    style={{
                        border: "none",
                        cursor: "pointer",
                        padding: "0.7rem 1rem",
                        borderRadius: "7px",
                        background:
                            activeSection === "courses"
                                ? COLORS.primaryLight
                                : "transparent",
                        color:
                            activeSection === "courses"
                                ? COLORS.primary
                                : COLORS.muted,
                        fontWeight:
                            activeSection === "courses"
                                ? 600
                                : 500,
                    }}
                >
                    <span className="flex align-items-center gap-2">
                        <GraduationCap size={16} />
                        Cursos
                    </span>
                </button>
            </div>

            {/* =================================================
                DEPARTAMENTOS
            ================================================= */}

            {activeSection === "departments" && (
                <div
                    style={{
                        background: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                        borderTop: "none",
                        borderRadius: "0 0 10px 10px",
                        padding: "1rem",
                    }}
                >
                    <div className="flex justify-content-between align-items-center mb-3">
                        <div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    color: COLORS.dark,
                                }}
                            >
                                Departamentos
                            </div>

                            <div
                                style={{
                                    fontSize: "0.76rem",
                                    color: COLORS.muted,
                                    marginTop: "3px",
                                }}
                            >
                                Cadastro e gestão dos
                                departamentos da instituição.
                            </div>
                        </div>

                        <Button
                            label="Adicionar departamento"
                            icon={<Plus size={16} />}
                            onClick={
                                openNewDepartment
                            }
                        />
                    </div>

                    <div
                        className="flex gap-2 mb-3"
                        style={{
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            className="p-input-icon-left"
                            style={{
                                flex: "1 1 300px",
                            }}
                        >
                            <Search size={16} />

                            <InputText
                                value={
                                    departmentSearch
                                }
                                onChange={(event) =>
                                    setDepartmentSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Pesquisar departamento, código ou chefe..."
                                style={{
                                    width: "100%",
                                }}
                            />
                        </span>

                        <Dropdown
                            value={departmentStatus}
                            options={statusOptions}
                            onChange={(event) =>
                                setDepartmentStatus(
                                    event.value
                                )
                            }
                            placeholder="Estado"
                            style={{
                                minWidth: "190px",
                            }}
                        />
                    </div>

                    <DataTable
                        value={filteredDepartments}
                        paginator
                        rows={8}
                        stripedRows
                        responsiveLayout="scroll"
                        emptyMessage="Nenhum departamento encontrado."
                        rowHover
                    >
                        <Column
                            header="Departamento"
                            body={
                                departmentNameBody
                            }
                            style={{
                                minWidth: "280px",
                            }}
                        />

                        <Column
                            header="Chefe de Departamento"
                            body={
                                departmentHeadBody
                            }
                            style={{
                                minWidth: "220px",
                            }}
                        />

                        <Column
                            field="courses"
                            header="Cursos"
                            body={(row) => (
                                <span
                                    style={{
                                        color: COLORS.text,
                                        fontWeight: 600,
                                    }}
                                >
                                    {row.courses}
                                </span>
                            )}
                        />

                        <Column
                            field="users"
                            header="Utilizadores"
                            body={(row) => (
                                <span
                                    style={{
                                        color: COLORS.text,
                                    }}
                                >
                                    {row.users}
                                </span>
                            )}
                        />

                        <Column
                            header="Estado"
                            body={statusBody}
                        />

                        <Column
                            header="Acções"
                            body={
                                departmentActions
                            }
                            style={{
                                width: "150px",
                            }}
                        />
                    </DataTable>
                </div>
            )}

            {/* =================================================
                CURSOS
            ================================================= */}

            {activeSection === "courses" && (
                <div
                    style={{
                        background: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                        borderTop: "none",
                        borderRadius: "0 0 10px 10px",
                        padding: "1rem",
                    }}
                >
                    <div className="flex justify-content-between align-items-center mb-3">
                        <div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    color: COLORS.dark,
                                }}
                            >
                                Cursos
                            </div>

                            <div
                                style={{
                                    fontSize: "0.76rem",
                                    color: COLORS.muted,
                                    marginTop: "3px",
                                }}
                            >
                                Cadastro, associação e gestão
                                dos cursos por departamento.
                            </div>
                        </div>

                        <Button
                            label="Adicionar curso"
                            icon={<Plus size={16} />}
                            onClick={openNewCourse}
                        />
                    </div>

                    <div
                        className="flex gap-2 mb-3"
                        style={{
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            className="p-input-icon-left"
                            style={{
                                flex: "1 1 280px",
                            }}
                        >
                            <Search size={16} />

                            <InputText
                                value={courseSearch}
                                onChange={(event) =>
                                    setCourseSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Pesquisar curso, código ou chefe..."
                                style={{
                                    width: "100%",
                                }}
                            />
                        </span>

                        <Dropdown
                            value={courseDepartment}
                            options={
                                departmentOptions
                            }
                            onChange={(event) =>
                                setCourseDepartment(
                                    event.value
                                )
                            }
                            placeholder="Departamento"
                            style={{
                                minWidth: "240px",
                            }}
                        />

                        <Dropdown
                            value={courseStatus}
                            options={statusOptions}
                            onChange={(event) =>
                                setCourseStatus(
                                    event.value
                                )
                            }
                            placeholder="Estado"
                            style={{
                                minWidth: "180px",
                            }}
                        />
                    </div>

                    <DataTable
                        value={filteredCourses}
                        paginator
                        rows={8}
                        stripedRows
                        responsiveLayout="scroll"
                        emptyMessage="Nenhum curso encontrado."
                        rowHover
                    >
                        <Column
                            header="Curso"
                            body={courseNameBody}
                            style={{
                                minWidth: "230px",
                            }}
                        />

                        <Column
                            header="Departamento"
                            body={
                                courseDepartmentBody
                            }
                            style={{
                                minWidth: "300px",
                            }}
                        />

                        <Column
                            header="Chefe de Curso"
                            body={courseHeadBody}
                            style={{
                                minWidth: "170px",
                            }}
                        />

                        <Column
                            field="students"
                            header="Estudantes"
                            body={(row) => (
                                <span
                                    style={{
                                        color: COLORS.text,
                                        fontWeight: 600,
                                    }}
                                >
                                    {row.students}
                                </span>
                            )}
                        />

                        <Column
                            header="Estado"
                            body={statusBody}
                        />

                        <Column
                            header="Acções"
                            body={courseActions}
                            style={{
                                width: "150px",
                            }}
                        />
                    </DataTable>
                </div>
            )}

            {/* =================================================
                DIALOG DEPARTAMENTO
            ================================================= */}

            <Dialog
                visible={departmentDialog}
                onHide={() =>
                    setDepartmentDialog(false)
                }
                header={
                    departmentForm.id === 0
                        ? "Novo departamento"
                        : "Editar departamento"
                }
                style={{
                    width: "500px",
                    maxWidth: "95vw",
                }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            severity="secondary"
                            outlined
                            onClick={() =>
                                setDepartmentDialog(
                                    false
                                )
                            }
                        />

                        <Button
                            label="Guardar"
                            icon={<Plus size={15} />}
                            onClick={
                                saveDepartment
                            }
                        />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label
                            htmlFor="department-name"
                            className="block mb-2"
                            style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: COLORS.text,
                            }}
                        >
                            Nome do departamento
                        </label>

                        <InputText
                            id="department-name"
                            value={
                                departmentForm.name
                            }
                            onChange={(event) =>
                                setDepartmentForm(
                                    (current) => ({
                                        ...current,
                                        name: event.target
                                            .value,
                                    })
                                )
                            }
                            placeholder="Ex.: Departamento de Engenharia Informática"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="department-code"
                            className="block mb-2"
                            style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: COLORS.text,
                            }}
                        >
                            Código
                        </label>

                        <InputText
                            id="department-code"
                            value={
                                departmentForm.code
                            }
                            onChange={(event) =>
                                setDepartmentForm(
                                    (current) => ({
                                        ...current,
                                        code: event.target
                                            .value
                                            .toUpperCase(),
                                    })
                                )
                            }
                            placeholder="Ex.: DEI"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Chefe de Departamento
                        </label>

                        <Dropdown
                            value={
                                departmentForm.head
                            }
                            options={headOptions}
                            onChange={(event) =>
                                setDepartmentForm(
                                    (current) => ({
                                        ...current,
                                        head: event.value,
                                    })
                                )
                            }
                            placeholder="Seleccionar chefe"
                            className="w-full"
                        />
                    </div>

                    <div
                        className="flex justify-content-between align-items-center"
                        style={{
                            padding: "0.8rem",
                            borderRadius: "8px",
                            background:
                                COLORS.background,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontWeight: 600,
                                    color: COLORS.text,
                                    fontSize: "0.82rem",
                                }}
                            >
                                Departamento activo
                            </div>

                            <div
                                style={{
                                    fontSize: "0.73rem",
                                    color: COLORS.muted,
                                    marginTop: "3px",
                                }}
                            >
                                Permitir utilização do
                                departamento no sistema.
                            </div>
                        </div>

                        <InputSwitch
                            checked={
                                departmentForm.status ===
                                "Activo"
                            }
                            onChange={(event) =>
                                setDepartmentForm(
                                    (current) => ({
                                        ...current,
                                        status: event.value
                                            ? "Activo"
                                            : "Inactivo",
                                    })
                                )
                            }
                        />
                    </div>
                </div>
            </Dialog>

            {/* =================================================
                DIALOG CURSO
            ================================================= */}

            <Dialog
                visible={courseDialog}
                onHide={() =>
                    setCourseDialog(false)
                }
                header={
                    courseForm.id === 0
                        ? "Novo curso"
                        : "Editar curso"
                }
                style={{
                    width: "540px",
                    maxWidth: "95vw",
                }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            severity="secondary"
                            outlined
                            onClick={() =>
                                setCourseDialog(
                                    false
                                )
                            }
                        />

                        <Button
                            label="Guardar"
                            icon={<Plus size={15} />}
                            onClick={saveCourse}
                        />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label
                            htmlFor="course-name"
                            className="block mb-2"
                            style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: COLORS.text,
                            }}
                        >
                            Nome do curso
                        </label>

                        <InputText
                            id="course-name"
                            value={courseForm.name}
                            onChange={(event) =>
                                setCourseForm(
                                    (current) => ({
                                        ...current,
                                        name: event.target
                                            .value,
                                    })
                                )
                            }
                            placeholder="Ex.: Engenharia Informática"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="course-code"
                            className="block mb-2"
                            style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: COLORS.text,
                            }}
                        >
                            Código
                        </label>

                        <InputText
                            id="course-code"
                            value={courseForm.code}
                            onChange={(event) =>
                                setCourseForm(
                                    (current) => ({
                                        ...current,
                                        code: event.target
                                            .value
                                            .toUpperCase(),
                                    })
                                )
                            }
                            placeholder="Ex.: EI"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Departamento
                        </label>

                        <Dropdown
                            value={
                                courseForm.departmentId ||
                                null
                            }
                            options={departments.map(
                                (department) => ({
                                    label: `${department.name} (${department.code})`,
                                    value: department.id,
                                })
                            )}
                            onChange={(event) => {
                                const department =
                                    departments.find(
                                        (item) =>
                                            item.id ===
                                            event.value
                                    );

                                setCourseForm(
                                    (current) => ({
                                        ...current,
                                        departmentId:
                                            event.value,
                                        department:
                                            department?.name ||
                                            "",
                                    })
                                );
                            }}
                            placeholder="Seleccionar departamento"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Chefe de Curso
                        </label>

                        <Dropdown
                            value={courseForm.head}
                            options={headOptions}
                            onChange={(event) =>
                                setCourseForm(
                                    (current) => ({
                                        ...current,
                                        head: event.value,
                                    })
                                )
                            }
                            placeholder="Seleccionar chefe de curso"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="course-students"
                            className="block mb-2"
                            style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: COLORS.text,
                            }}
                        >
                            Número de estudantes
                        </label>

                        <InputText
                            id="course-students"
                            type="number"
                            value={String(
                                courseForm.students
                            )}
                            onChange={(event) =>
                                setCourseForm(
                                    (current) => ({
                                        ...current,
                                        students: Number(
                                            event.target
                                                .value
                                        ),
                                    })
                                )
                            }
                            className="w-full"
                        />
                    </div>

                    <div
                        className="flex justify-content-between align-items-center"
                        style={{
                            padding: "0.8rem",
                            borderRadius: "8px",
                            background:
                                COLORS.background,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontWeight: 600,
                                    color: COLORS.text,
                                    fontSize: "0.82rem",
                                }}
                            >
                                Curso activo
                            </div>

                            <div
                                style={{
                                    fontSize: "0.73rem",
                                    color: COLORS.muted,
                                    marginTop: "3px",
                                }}
                            >
                                Permitir utilização do curso
                                na plataforma.
                            </div>
                        </div>

                        <InputSwitch
                            checked={
                                courseForm.status ===
                                "Activo"
                            }
                            onChange={(event) =>
                                setCourseForm(
                                    (current) => ({
                                        ...current,
                                        status: event.value
                                            ? "Activo"
                                            : "Inactivo",
                                    })
                                )
                            }
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}