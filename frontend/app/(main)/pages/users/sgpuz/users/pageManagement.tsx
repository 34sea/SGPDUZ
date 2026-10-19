"use client";

import React, { useMemo, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { TabView, TabPanel } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressBar } from "primereact/progressbar";

import {
    Users,
    UserPlus,
    ShieldCheck,
    KeyRound,
    UserCheck,
    UserX,
    Search,
    MoreVertical,
    Edit3,
    Trash2,
    Lock,
    Unlock,
    CheckCircle2,
    XCircle,
    UsersRound,
    GraduationCap,
    Building2,
    BookOpen,
    ClipboardCheck,
    CalendarCheck,
    Activity,
    Settings2,
    BarChart3,
} from "lucide-react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/* =========================================================
   TYPES
========================================================= */

type UserStatus = "Activo" | "Inactivo";

interface User {
    id: number;
    nome: string;
    email: string;
    contacto: string;
    perfil: string;
    departamento: string;
    curso: string;
    estado: UserStatus;
    iniciais: string;
}


interface Profile {
    id: number;
    nome: string;
    descricao: string;
    utilizadores: number;
    cor: string;
}

interface Permission {
    id: number;
    nome: string;
    descricao: string;
    icon: React.ReactNode;
}

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
   MOCK USERS
========================================================= */

const initialUsers: User[] = [
    {
        id: 1,
        nome: "John Doe",
        email: "john.doe@example.com",
        contacto: "+258 84 000 0001",
        perfil: "Administrador",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Activo",
        iniciais: "JD",
    },
    {
        id: 2,
        nome: "Jane Smith",
        email: "jane.smith@example.com",
        contacto: "+258 84 000 0002",
        perfil: "Docente",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Activo",
        iniciais: "JS",
    },
    {
        id: 3,
        nome: "Alex Johnson",
        email: "alex.johnson@example.com",
        contacto: "+258 84 000 0003",
        perfil: "Chefe de Curso",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Activo",
        iniciais: "AJ",
    },
    {
        id: 4,
        nome: "Emily Brown",
        email: "emily.brown@example.com",
        contacto: "+258 84 000 0004",
        perfil: "Chefe de Departamento",
        departamento: "Engenharia Informática",
        curso: "-",
        estado: "Activo",
        iniciais: "EB",
    },
    {
        id: 5,
        nome: "Michael Wilson",
        email: "michael.wilson@example.com",
        contacto: "+258 84 000 0005",
        perfil: "Chefe de Turma",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Inactivo",
        iniciais: "MW",
    },
    {
        id: 6,
        nome: "Sarah Davis",
        email: "sarah.davis@example.com",
        contacto: "+258 84 000 0006",
        perfil: "Subchefe de Turma",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Activo",
        iniciais: "SD",
    },
    {
        id: 7,
        nome: "Daniel Miller",
        email: "daniel.miller@example.com",
        contacto: "+258 84 000 0007",
        perfil: "Docente",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Activo",
        iniciais: "DM",
    },
    {
        id: 8,
        nome: "Olivia Taylor",
        email: "olivia.taylor@example.com",
        contacto: "+258 84 000 0008",
        perfil: "Docente",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Activo",
        iniciais: "OT",
    },
    {
        id: 9,
        nome: "James Anderson",
        email: "james.anderson@example.com",
        contacto: "+258 84 000 0009",
        perfil: "Chefe de Turma",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Activo",
        iniciais: "JA",
    },
    {
        id: 10,
        nome: "Sophia Thomas",
        email: "sophia.thomas@example.com",
        contacto: "+258 84 000 0010",
        perfil: "Docente",
        departamento: "Engenharia Informática",
        curso: "Engenharia Informática",
        estado: "Inactivo",
        iniciais: "ST",
    },
];

/* =========================================================
   PROFILES
========================================================= */

const profiles: Profile[] = [
    {
        id: 1,
        nome: "Administrador",
        descricao:
            "Acesso global à plataforma, utilizadores, perfis e configurações.",
        utilizadores: 2,
        cor: COLORS.primary,
    },
    {
        id: 2,
        nome: "Chefe de Departamento",
        descricao:
            "Gestão e acompanhamento das actividades académicas do departamento.",
        utilizadores: 2,
        cor: COLORS.purple,
    },
    {
        id: 3,
        nome: "Chefe de Curso",
        descricao:
            "Coordenação das actividades pedagógicas e acompanhamento do curso.",
        utilizadores: 3,
        cor: COLORS.orange,
    },
    {
        id: 4,
        nome: "Docente",
        descricao:
            "Gestão de aulas, avaliações, actividades e plano analítico.",
        utilizadores: 12,
        cor: COLORS.green,
    },
    {
        id: 5,
        nome: "Chefe de Turma",
        descricao:
            "Acompanhamento da turma e confirmação das actividades académicas.",
        utilizadores: 6,
        cor: "#0891B2",
    },
    {
        id: 6,
        nome: "Subchefe de Turma",
        descricao:
            "Apoio ao chefe de turma no acompanhamento das actividades.",
        utilizadores: 4,
        cor: "#DB2777",
    },
];

/* =========================================================
   PERMISSIONS
========================================================= */

const permissions: Permission[] = [
    {
        id: 1,
        nome: "Plano Analítico",
        descricao: "Consultar e gerir planos analíticos.",
        icon: <BookOpen size={18} />,
    },
    {
        id: 2,
        nome: "Aulas",
        descricao: "Registar e acompanhar aulas.",
        icon: <GraduationCap size={18} />,
    },
    {
        id: 3,
        nome: "Avaliações",
        descricao: "Gerir avaliações e resultados.",
        icon: <ClipboardCheck size={18} />,
    },
    {
        id: 4,
        nome: "Actividades",
        descricao: "Gerir actividades académicas.",
        icon: <Activity size={18} />,
    },
    {
        id: 5,
        nome: "Confirmação de Aulas",
        descricao: "Confirmar aulas leccionadas.",
        icon: <CalendarCheck size={18} />,
    },
    {
        id: 6,
        nome: "Acompanhamento",
        descricao: "Consultar indicadores e acompanhamento.",
        icon: <BarChart3 size={18} />,
    },
    {
        id: 7,
        nome: "Gestão Global",
        descricao: "Acesso à administração global do sistema.",
        icon: <Settings2 size={18} />,
    },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>(initialUsers);

    const [activeTab, setActiveTab] = useState(0);

    const [search, setSearch] = useState("");
    const [profileFilter, setProfileFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const [userDialog, setUserDialog] = useState(false);
    const [permissionDialog, setPermissionDialog] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [selectedProfile, setSelectedProfile] =
        useState<string>("Administrador");

    const [permissionState, setPermissionState] = useState<
        Record<string, boolean>
    >({
        "Administrador-Plano Analítico": true,
        "Administrador-Aulas": true,
        "Administrador-Avaliações": true,
        "Administrador-Actividades": true,
        "Administrador-Confirmação de Aulas": true,
        "Administrador-Acompanhamento": true,
        "Administrador-Gestão Global": true,

        "Docente-Plano Analítico": true,
        "Docente-Aulas": true,
        "Docente-Avaliações": true,
        "Docente-Actividades": true,
        "Docente-Confirmação de Aulas": true,
        "Docente-Acompanhamento": true,
        "Docente-Gestão Global": false,

        "Chefe de Curso-Plano Analítico": true,
        "Chefe de Curso-Aulas": true,
        "Chefe de Curso-Avaliações": true,
        "Chefe de Curso-Actividades": true,
        "Chefe de Curso-Confirmação de Aulas": true,
        "Chefe de Curso-Acompanhamento": true,
        "Chefe de Curso-Gestão Global": false,

        "Chefe de Departamento-Plano Analítico": true,
        "Chefe de Departamento-Aulas": true,
        "Chefe de Departamento-Avaliações": true,
        "Chefe de Departamento-Actividades": true,
        "Chefe de Departamento-Confirmação de Aulas": true,
        "Chefe de Departamento-Acompanhamento": true,
        "Chefe de Departamento-Gestão Global": false,

        "Chefe de Turma-Plano Analítico": false,
        "Chefe de Turma-Aulas": true,
        "Chefe de Turma-Avaliações": true,
        "Chefe de Turma-Actividades": true,
        "Chefe de Turma-Confirmação de Aulas": true,
        "Chefe de Turma-Acompanhamento": true,
        "Chefe de Turma-Gestão Global": false,

        "Subchefe de Turma-Plano Analítico": false,
        "Subchefe de Turma-Aulas": true,
        "Subchefe de Turma-Avaliações": false,
        "Subchefe de Turma-Actividades": true,
        "Subchefe de Turma-Confirmação de Aulas": true,
        "Subchefe de Turma-Acompanhamento": true,
        "Subchefe de Turma-Gestão Global": false,
    });

    /* =====================================================
       DERIVED DATA
    ===================================================== */

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                !search ||
                user.nome.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.contacto.toLowerCase().includes(search.toLowerCase());

            const matchesProfile =
                !profileFilter || user.perfil === profileFilter;

            const matchesStatus =
                !statusFilter || user.estado === statusFilter;

            return matchesSearch && matchesProfile && matchesStatus;
        });
    }, [users, search, profileFilter, statusFilter]);

    const totalUsers = users.length;

    const activeUsers = users.filter(
        (user) => user.estado === "Activo"
    ).length;

    const inactiveUsers = users.filter(
        (user) => user.estado === "Inactivo"
    ).length;

    /* =====================================================
       CHART
    ===================================================== */

  const profileChartData = {
    labels: profiles.map((profile) => profile.nome),

    datasets: [
        {
            label: "Utilizadores",

            data: profiles.map((profile) => profile.utilizadores),

            backgroundColor: [
                "#1D4ED8", // Administrador
                "#7C3AED", // Chefe de Departamento
                "#D97706", // Chefe de Curso
                "#16A34A", // Docente
                "#0891B2", // Chefe de Turma
                "#DB2777", // Subchefe de Turma
            ],

            borderColor: [
                "#1E40AF",
                "#6D28D9",
                "#B45309",
                "#15803D",
                "#0E7490",
                "#BE185D",
            ],

            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 34,
        },
    ],
};
   const profileChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: "#0F172A",
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
            padding: 10,
            displayColors: true,
        },
    },

    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: "#64748B",
                font: {
                    size: 11,
                },
            },
        },

        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1,
                color: "#64748B",
                font: {
                    size: 11,
                },
            },
            grid: {
                color: "#E2E8F0",
            },
            border: {
                display: false,
            },
        },
    },
};

    /* =====================================================
       ACTIONS
    ===================================================== */

    const openCreateUser = () => {
        setSelectedUser(null);
        setUserDialog(true);
    };

    const openEditUser = (user: User) => {
        setSelectedUser(user);
        setUserDialog(true);
    };

    const toggleUserStatus = (user: User) => {
        const newStatus =
            user.estado === "Activo" ? "Inactivo" : "Activo";

        setUsers((current) =>
            current.map((item) =>
                item.id === user.id
                    ? {
                          ...item,
                          estado: newStatus,
                      }
                    : item
            )
        );
    };

    const deleteUser = (user: User) => {
        confirmDialog({
            message: `Tem certeza que deseja remover ${user.nome}?`,
            header: "Remover utilizador",
            icon: <Trash2 size={24} />,
            acceptLabel: "Remover",
            rejectLabel: "Cancelar",
            acceptClassName: "p-button-danger",
            accept: () => {
                setUsers((current) =>
                    current.filter((item) => item.id !== user.id)
                );
            },
        });
    };

    const saveUser = () => {
        if (selectedUser) {
            setUsers((current) =>
                current.map((item) =>
                    item.id === selectedUser.id
                        ? selectedUser
                        : item
                )
            );
        }

        setUserDialog(false);
    };

    /* =====================================================
       TABLE TEMPLATES
    ===================================================== */

    const userTemplate = (user: User) => {
        return (
            <div className="flex align-items-center gap-3">
                <Avatar
                    label={user.iniciais}
                    shape="circle"
                    style={{
                        background: COLORS.primaryLight,
                        color: COLORS.primary,
                        fontWeight: 700,
                    }}
                />

                <div>
                    <div
                        style={{
                            fontWeight: 700,
                            color: COLORS.dark,
                            marginBottom: "3px",
                        }}
                    >
                        {user.nome}
                    </div>

                    <div
                        style={{
                            fontSize: "0.82rem",
                            color: COLORS.muted,
                        }}
                    >
                        {user.email}
                    </div>
                </div>
            </div>
        );
    };

    const profileTemplate = (user: User) => {
        const profile = profiles.find(
            (item) => item.nome === user.perfil
        );

        return (
            <Tag
                value={user.perfil}
                style={{
                    background: `${profile?.cor || COLORS.primary}12`,
                    color: profile?.cor || COLORS.primary,
                    border: `1px solid ${
                        profile?.cor || COLORS.primary
                    }25`,
                    fontWeight: 600,
                }}
            />
        );
    };

    const statusTemplate = (user: User) => {
        return (
            <Tag
                value={user.estado}
                icon={
                    user.estado === "Activo" ? (
                        <CheckCircle2 size={13} />
                    ) : (
                        <XCircle size={13} />
                    )
                }
                severity={
                    user.estado === "Activo"
                        ? "success"
                        : "danger"
                }
            />
        );
    };

    const actionsTemplate = (user: User) => {
        return (
            <div className="flex justify-content-end gap-1">
                <Button
                    icon={<Edit3 size={16} />}
                    rounded
                    text
                    severity="secondary"
                    tooltip="Editar"
                    onClick={() => openEditUser(user)}
                />

                <Button
                    icon={
                        user.estado === "Activo" ? (
                            <Lock size={16} />
                        ) : (
                            <Unlock size={16} />
                        )
                    }
                    rounded
                    text
                    severity={
                        user.estado === "Activo"
                            ? "warning"
                            : "success"
                    }
                    tooltip={
                        user.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"
                    }
                    onClick={() => toggleUserStatus(user)}
                />

                <Button
                    icon={<Trash2 size={16} />}
                    rounded
                    text
                    severity="danger"
                    tooltip="Remover"
                    onClick={() => deleteUser(user)}
                />
            </div>
        );
    };

    /* =====================================================
       KPI CARD
    ===================================================== */

    const KpiCard = ({
        title,
        value,
        description,
        icon,
        background,
        color,
    }: {
        title: string;
        value: number;
        description: string;
        icon: React.ReactNode;
        background: string;
        color: string;
    }) => {
        return (
            <Card
                style={{
                    height: "100%",
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "none",
                }}
            >
                <div className="flex align-items-start justify-content-between">
                    <div>
                        <div
                            style={{
                                color: COLORS.muted,
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                marginBottom: "8px",
                            }}
                        >
                            {title}
                        </div>

                        <div
                            style={{
                                color: COLORS.dark,
                                fontSize: "1.8rem",
                                fontWeight: 800,
                                lineHeight: 1,
                            }}
                        >
                            {value}
                        </div>

                        <div
                            style={{
                                color: COLORS.light,
                                fontSize: "0.75rem",
                                marginTop: "8px",
                            }}
                        >
                            {description}
                        </div>
                    </div>

                    <div
                        className="flex align-items-center justify-content-center"
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            background,
                            color,
                        }}
                    >
                        {icon}
                    </div>
                </div>
            </Card>
        );
    };

    /* =====================================================
       MAIN
    ===================================================== */

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "none",
                margin: 0,
                padding: "1.25rem",
                boxSizing: "border-box",
                background: COLORS.background,
                minHeight: "100%",
            }}
        >
            <ConfirmDialog />

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3"
                style={{
                    marginBottom: "1.25rem",
                }}
            >
                <div>
                    <div
                        className="flex align-items-center gap-2"
                        style={{
                            color: COLORS.primary,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            marginBottom: "6px",
                        }}
                    >
                        <ShieldCheck size={17} />
                        ADMINISTRAÇÃO DO SISTEMA
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            color: COLORS.dark,
                            fontSize: "1.7rem",
                            fontWeight: 800,
                        }}
                    >
                        Utilizadores, Perfis e Permissões
                    </h1>

                    <p
                        style={{
                            margin: "6px 0 0",
                            color: COLORS.muted,
                            fontSize: "0.9rem",
                        }}
                    >
                        Controle as contas, perfis de acesso e
                        permissões do sistema pedagógico.
                    </p>
                </div>

                <Button
                    label="Novo utilizador"
                    icon={<UserPlus size={17} />}
                    onClick={openCreateUser}
                    style={{
                        background: COLORS.primary,
                        border: "none",
                        padding: "0.75rem 1rem",
                    }}
                />
            </div>

            {/* =================================================
                KPIS
            ================================================= */}

            <div className="grid">
                <div className="col-12 sm:col-6 xl:col-3">
                    <KpiCard
                        title="Total de utilizadores"
                        value={totalUsers}
                        description="Contas registadas"
                        icon={<Users size={21} />}
                        background={COLORS.primaryLight}
                        color={COLORS.primary}
                    />
                </div>

                <div className="col-12 sm:col-6 xl:col-3">
                    <KpiCard
                        title="Contas activas"
                        value={activeUsers}
                        description="Utilizadores com acesso"
                        icon={<UserCheck size={21} />}
                        background={COLORS.greenLight}
                        color={COLORS.green}
                    />
                </div>

                <div className="col-12 sm:col-6 xl:col-3">
                    <KpiCard
                        title="Contas inactivas"
                        value={inactiveUsers}
                        description="Acesso temporariamente bloqueado"
                        icon={<UserX size={21} />}
                        background={COLORS.orangeLight}
                        color={COLORS.orange}
                    />
                </div>

                <div className="col-12 sm:col-6 xl:col-3">
                    <KpiCard
                        title="Perfis de acesso"
                        value={profiles.length}
                        description="Perfis configurados"
                        icon={<KeyRound size={21} />}
                        background={COLORS.purpleLight}
                        color={COLORS.purple}
                    />
                </div>
            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <Card
                style={{
                    marginTop: "1rem",
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "none",
                }}
            >
                <TabView
                    activeIndex={activeTab}
                    onTabChange={(event) =>
                        setActiveTab(event.index)
                    }
                >
                    {/* =========================================
                        TAB UTILIZADORES
                    ========================================= */}

                    <TabPanel
                        header="Utilizadores"
                        leftIcon={<Users size={16} className="mr-2" />}
                    >
                        {/* =====================================
                            CHART + SUMMARY
                        ===================================== */}

                        <div className="grid mb-3">
                            <div className="col-12 lg:col-8">
                                <div
                                    style={{
                                        border: `1px solid ${COLORS.border}`,
                                        borderRadius: "10px",
                                        padding: "1rem",
                                        height: "340px",
                                        background: COLORS.white,
                                    }}
                                >
                                    <div className="flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: "1rem",
                                                    fontWeight: 700,
                                                    color: COLORS.dark,
                                                }}
                                            >
                                                Distribuição por perfil
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: "0.78rem",
                                                    color: COLORS.muted,
                                                    marginTop: "4px",
                                                }}
                                            >
                                                Número de utilizadores
                                                associados a cada perfil.
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                width: "34px",
                                                height: "34px",
                                                borderRadius: "8px",
                                                background:
                                                    COLORS.primaryLight,
                                                color: COLORS.primary,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent:
                                                    "center",
                                            }}
                                        >
                                            <BarChart3 size={18} />
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            height: "250px",
                                        }}
                                    >
                                        <Bar
                                            data={profileChartData}
                                            options={
                                                profileChartOptions
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 lg:col-4">
                                <div
                                    style={{
                                        border: `1px solid ${COLORS.border}`,
                                        borderRadius: "10px",
                                        padding: "1rem",
                                        height: "340px",
                                        background: COLORS.white,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "1rem",
                                            fontWeight: 700,
                                            color: COLORS.dark,
                                        }}
                                    >
                                        Estado das contas
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "0.78rem",
                                            color: COLORS.muted,
                                            marginTop: "4px",
                                        }}
                                    >
                                        Visão rápida do acesso actual.
                                    </div>

                                    <Divider />

                                    <div
                                        className="flex align-items-center justify-content-between"
                                        style={{
                                            padding: "0.75rem 0",
                                        }}
                                    >
                                        <div className="flex align-items-center gap-2">
                                            <div
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
                                                    fontSize:
                                                        "0.85rem",
                                                }}
                                            >
                                                Activos
                                            </span>
                                        </div>

                                        <strong
                                            style={{
                                                color: COLORS.dark,
                                            }}
                                        >
                                            {activeUsers}
                                        </strong>
                                    </div>

                                    <ProgressBar
                                        value={
                                            totalUsers
                                                ? (activeUsers /
                                                      totalUsers) *
                                                  100
                                                : 0
                                        }
                                        showValue={false}
                                        style={{
                                            height: "7px",
                                        }}
                                    />

                                    <div
                                        className="flex align-items-center justify-content-between"
                                        style={{
                                            padding: "1rem 0 0.75rem",
                                        }}
                                    >
                                        <div className="flex align-items-center gap-2">
                                            <div
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
                                                    fontSize:
                                                        "0.85rem",
                                                }}
                                            >
                                                Inactivos
                                            </span>
                                        </div>

                                        <strong
                                            style={{
                                                color: COLORS.dark,
                                            }}
                                        >
                                            {inactiveUsers}
                                        </strong>
                                    </div>

                                    <ProgressBar
                                        value={
                                            totalUsers
                                                ? (inactiveUsers /
                                                      totalUsers) *
                                                  100
                                                : 0
                                        }
                                        showValue={false}
                                        style={{
                                            height: "7px",
                                        }}
                                        color={COLORS.red}
                                    />

                                    <div
                                        style={{
                                            marginTop: "1.5rem",
                                            padding: "0.85rem",
                                            background:
                                                COLORS.primaryLight,
                                            borderRadius: "8px",
                                            color: COLORS.primary,
                                            fontSize: "0.8rem",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        <strong>
                                            Perfis configurados:
                                        </strong>{" "}
                                        {profiles.length} perfis
                                        diferentes estão disponíveis
                                        no sistema.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =====================================
                            TABLE TOOLBAR
                        ===================================== */}

                        <div
                            className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-3"
                            style={{
                                padding: "1rem 0",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: "1.05rem",
                                        fontWeight: 700,
                                        color: COLORS.dark,
                                    }}
                                >
                                    Lista de utilizadores
                                </div>

                                <div
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.78rem",
                                        marginTop: "3px",
                                    }}
                                >
                                    Consulte e administre as contas
                                    registadas.
                                </div>
                            </div>

                            <div className="flex flex-column md:flex-row gap-2">
                                <span className="p-input-icon-left">
                                    <Search
                                        size={16}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "0.75rem",
                                            transform:
                                                "translateY(-50%)",
                                            color: COLORS.light,
                                        }}
                                    />

                                    <InputText
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Pesquisar utilizador..."
                                        style={{
                                            paddingLeft: "2.4rem",
                                            minWidth: "240px",
                                        }}
                                    />
                                </span>

                                <Dropdown
                                    value={profileFilter}
                                    options={profiles.map(
                                        (profile) => profile.nome
                                    )}
                                    onChange={(event) =>
                                        setProfileFilter(
                                            event.value
                                        )
                                    }
                                    placeholder="Perfil"
                                    showClear
                                    style={{
                                        minWidth: "190px",
                                    }}
                                />

                                <Dropdown
                                    value={statusFilter}
                                    options={[
                                        "Activo",
                                        "Inactivo",
                                    ]}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.value
                                        )
                                    }
                                    placeholder="Estado"
                                    showClear
                                    style={{
                                        minWidth: "140px",
                                    }}
                                />
                            </div>
                        </div>

                        {/* =====================================
                            USERS TABLE
                        ===================================== */}

                        <DataTable
                            value={filteredUsers}
                            paginator
                            rows={6}
                            rowsPerPageOptions={[6, 10, 20]}
                            responsiveLayout="scroll"
                            emptyMessage="Nenhum utilizador encontrado."
                            stripedRows
                            size="small"
                            tableStyle={{
                                minWidth: "950px",
                            }}
                        >
                            <Column
                                header="Utilizador"
                                body={userTemplate}
                                style={{
                                    minWidth: "260px",
                                }}
                            />

                            <Column
                                field="contacto"
                                header="Contacto"
                                style={{
                                    minWidth: "160px",
                                }}
                            />

                            <Column
                                header="Perfil"
                                body={profileTemplate}
                                style={{
                                    minWidth: "190px",
                                }}
                            />

                            <Column
                                field="departamento"
                                header="Departamento"
                                style={{
                                    minWidth: "180px",
                                }}
                            />

                            <Column
                                field="curso"
                                header="Curso"
                                style={{
                                    minWidth: "170px",
                                }}
                            />

                            <Column
                                header="Estado"
                                body={statusTemplate}
                                style={{
                                    width: "120px",
                                }}
                            />

                            <Column
                                header="Acções"
                                body={actionsTemplate}
                                align="right"
                                style={{
                                    width: "150px",
                                }}
                            />
                        </DataTable>
                    </TabPanel>

                    {/* =========================================
                        TAB PERFIS
                    ========================================= */}

                    <TabPanel
                        header="Perfis"
                        leftIcon={
                            <ShieldCheck
                                size={16}
                                className="mr-2"
                            />
                        }
                    >
                        <div
                            className="flex flex-column lg:flex-row gap-4"
                            style={{
                                minHeight: "500px",
                            }}
                        >
                            {/* PROFILE LIST */}

                            <div
                                style={{
                                    width: "100%",
                                    maxWidth: "340px",
                                }}
                            >
                                <div
                                    style={{
                                        marginBottom: "1rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            color: COLORS.dark,
                                        }}
                                    >
                                        Perfis disponíveis
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "0.78rem",
                                            color: COLORS.muted,
                                            marginTop: "4px",
                                        }}
                                    >
                                        Seleccione um perfil para
                                        consultar a configuração.
                                    </div>
                                </div>

                                <div className="flex flex-column gap-2">
                                    {profiles.map((profile) => (
                                        <div
                                            key={profile.id}
                                            onClick={() =>
                                                setSelectedProfile(
                                                    profile.nome
                                                )
                                            }
                                            style={{
                                                padding: "0.9rem",
                                                borderRadius: "10px",
                                                border: `1px solid ${
                                                    selectedProfile ===
                                                    profile.nome
                                                        ? profile.cor
                                                        : COLORS.border
                                                }`,
                                                background:
                                                    selectedProfile ===
                                                    profile.nome
                                                        ? `${profile.cor}08`
                                                        : COLORS.white,
                                                cursor: "pointer",
                                                transition:
                                                    "all .2s",
                                            }}
                                        >
                                            <div className="flex align-items-center gap-3">
                                                <div
                                                    style={{
                                                        width: "38px",
                                                        height: "38px",
                                                        borderRadius:
                                                            "9px",
                                                        display: "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        background: `${profile.cor}12`,
                                                        color: profile.cor,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <ShieldCheck
                                                        size={19}
                                                    />
                                                </div>

                                                <div
                                                    style={{
                                                        minWidth: 0,
                                                        flex: 1,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontWeight: 700,
                                                            color: COLORS.dark,
                                                            fontSize:
                                                                "0.87rem",
                                                        }}
                                                    >
                                                        {
                                                            profile.nome
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "0.72rem",
                                                            color: COLORS.muted,
                                                            marginTop:
                                                                "3px",
                                                        }}
                                                    >
                                                        {
                                                            profile.utilizadores
                                                        }{" "}
                                                        utilizadores
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PROFILE DETAIL */}

                            {(() => {
                                const profile =
                                    profiles.find(
                                        (item) =>
                                            item.nome ===
                                            selectedProfile
                                    );

                                if (!profile) return null;

                                return (
                                    <div
                                        style={{
                                            flex: 1,
                                            border: `1px solid ${COLORS.border}`,
                                            borderRadius: "12px",
                                            background:
                                                COLORS.white,
                                            padding: "1.5rem",
                                        }}
                                    >
                                        <div className="flex flex-column md:flex-row md:align-items-start md:justify-content-between gap-3">
                                            <div className="flex align-items-center gap-3">
                                                <div
                                                    style={{
                                                        width: "54px",
                                                        height: "54px",
                                                        borderRadius:
                                                            "12px",
                                                        background: `${profile.cor}12`,
                                                        color: profile.cor,
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >
                                                    <ShieldCheck
                                                        size={26}
                                                    />
                                                </div>

                                                <div>
                                                    <h2
                                                        style={{
                                                            margin: 0,
                                                            color: COLORS.dark,
                                                            fontSize:
                                                                "1.25rem",
                                                        }}
                                                    >
                                                        {
                                                            profile.nome
                                                        }
                                                    </h2>

                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "5px",
                                                            color: COLORS.muted,
                                                            fontSize:
                                                                "0.82rem",
                                                        }}
                                                    >
                                                        {
                                                            profile.descricao
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                label="Configurar permissões"
                                                icon={
                                                    <Settings2
                                                        size={16}
                                                    />
                                                }
                                                outlined
                                                onClick={() =>
                                                    setPermissionDialog(
                                                        true
                                                    )
                                                }
                                            />
                                        </div>

                                        <Divider />

                                        <div className="grid">
                                            <div className="col-12 md:col-4">
                                                <div
                                                    style={{
                                                        background:
                                                            COLORS.background,
                                                        borderRadius:
                                                            "10px",
                                                        padding:
                                                            "1rem",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color: COLORS.muted,
                                                            fontSize:
                                                                "0.75rem",
                                                        }}
                                                    >
                                                        Utilizadores
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "1.5rem",
                                                            fontWeight:
                                                                800,
                                                            color: COLORS.dark,
                                                            marginTop:
                                                                "5px",
                                                        }}
                                                    >
                                                        {
                                                            profile.utilizadores
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12 md:col-4">
                                                <div
                                                    style={{
                                                        background:
                                                            COLORS.background,
                                                        borderRadius:
                                                            "10px",
                                                        padding:
                                                            "1rem",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color: COLORS.muted,
                                                            fontSize:
                                                                "0.75rem",
                                                        }}
                                                    >
                                                        Permissões
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "1.5rem",
                                                            fontWeight:
                                                                800,
                                                            color: COLORS.dark,
                                                            marginTop:
                                                                "5px",
                                                        }}
                                                    >
                                                        {
                                                            permissions.filter(
                                                                (
                                                                    permission
                                                                ) =>
                                                                    permissionState[
                                                                        `${profile.nome}-${permission.nome}`
                                                                    ]
                                                            ).length
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12 md:col-4">
                                                <div
                                                    style={{
                                                        background:
                                                            COLORS.background,
                                                        borderRadius:
                                                            "10px",
                                                        padding:
                                                            "1rem",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color: COLORS.muted,
                                                            fontSize:
                                                                "0.75rem",
                                                        }}
                                                    >
                                                        Estado
                                                    </div>

                                                    <div
                                                        className="flex align-items-center gap-2"
                                                        style={{
                                                            marginTop:
                                                                "10px",
                                                        }}
                                                    >
                                                        <CheckCircle2
                                                            size={17}
                                                            color={
                                                                COLORS.green
                                                            }
                                                        />

                                                        <strong
                                                            style={{
                                                                color: COLORS.green,
                                                            }}
                                                        >
                                                            Activo
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Divider />

                                        <div>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    color: COLORS.dark,
                                                    marginBottom:
                                                        "1rem",
                                                }}
                                            >
                                                Permissões atribuídas
                                            </div>

                                            <div className="grid">
                                                {permissions.map(
                                                    (
                                                        permission
                                                    ) => {
                                                        const enabled =
                                                            permissionState[
                                                                `${profile.nome}-${permission.nome}`
                                                            ] ??
                                                            false;

                                                        return (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="col-12 md:col-6"
                                                            >
                                                                <div
                                                                    className="flex align-items-center justify-content-between gap-3"
                                                                    style={{
                                                                        padding:
                                                                            "0.85rem",
                                                                        border: `1px solid ${COLORS.border}`,
                                                                        borderRadius:
                                                                            "9px",
                                                                    }}
                                                                >
                                                                    <div className="flex align-items-center gap-3">
                                                                        <div
                                                                            style={{
                                                                                width: "35px",
                                                                                height: "35px",
                                                                                borderRadius:
                                                                                    "8px",
                                                                                background:
                                                                                    enabled
                                                                                        ? COLORS.greenLight
                                                                                        : COLORS.background,
                                                                                color:
                                                                                    enabled
                                                                                        ? COLORS.green
                                                                                        : COLORS.light,
                                                                                display:
                                                                                    "flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                justifyContent:
                                                                                    "center",
                                                                            }}
                                                                        >
                                                                            {
                                                                                permission.icon
                                                                            }
                                                                        </div>

                                                                        <div>
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "0.82rem",
                                                                                    fontWeight:
                                                                                        700,
                                                                                    color: COLORS.dark,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    permission.nome
                                                                                }
                                                                            </div>

                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "0.7rem",
                                                                                    color: COLORS.muted,
                                                                                    marginTop:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    permission.descricao
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <InputSwitch
                                                                        checked={
                                                                            enabled
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) =>
                                                                            setPermissionState(
                                                                                (
                                                                                    current
                                                                                ) => ({
                                                                                    ...current,
                                                                                    [`${profile.nome}-${permission.nome}`]:
                                                                                        event.value,
                                                                                })
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </TabPanel>

                    {/* =========================================
                        TAB PERMISSÕES
                    ========================================= */}

                    <TabPanel
                        header="Permissões"
                        leftIcon={
                            <KeyRound
                                size={16}
                                className="mr-2"
                            />
                        }
                    >
                        <div>
                            <div
                                className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3"
                                style={{
                                    marginBottom: "1.25rem",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "1.05rem",
                                            color: COLORS.dark,
                                        }}
                                    >
                                        Matriz de permissões
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "0.78rem",
                                            color: COLORS.muted,
                                            marginTop: "4px",
                                        }}
                                    >
                                        Configure as funcionalidades
                                        disponíveis para cada perfil.
                                    </div>
                                </div>

                                <Button
                                    label="Guardar alterações"
                                    icon={
                                        <CheckCircle2
                                            size={16}
                                        />
                                    }
                                    onClick={() => {
                                        confirmDialog({
                                            message:
                                                "As configurações de permissões foram actualizadas.",
                                            header: "Permissões",
                                            icon: (
                                                <CheckCircle2
                                                    size={24}
                                                />
                                            ),
                                            acceptLabel: "OK",
                                            rejectClassName:
                                                "hidden",
                                        });
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    overflowX: "auto",
                                    border: `1px solid ${COLORS.border}`,
                                    borderRadius: "10px",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        minWidth: "1100px",
                                        borderCollapse:
                                            "collapse",
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                background:
                                                    COLORS.background,
                                            }}
                                        >
                                            <th
                                                style={{
                                                    textAlign:
                                                        "left",
                                                    padding:
                                                        "1rem",
                                                    borderBottom: `1px solid ${COLORS.border}`,
                                                    minWidth:
                                                        "230px",
                                                    color: COLORS.dark,
                                                    fontSize:
                                                        "0.8rem",
                                                }}
                                            >
                                                Perfil
                                            </th>

                                            {permissions.map(
                                                (
                                                    permission
                                                ) => (
                                                    <th
                                                        key={
                                                            permission.id
                                                        }
                                                        style={{
                                                            padding:
                                                                "0.8rem",
                                                            borderBottom: `1px solid ${COLORS.border}`,
                                                            color: COLORS.dark,
                                                            fontSize:
                                                                "0.72rem",
                                                            textAlign:
                                                                "center",
                                                            minWidth:
                                                                "110px",
                                                        }}
                                                    >
                                                        <div
                                                            className="flex flex-column align-items-center gap-2"
                                                        >
                                                            {
                                                                permission.icon
                                                            }

                                                            <span>
                                                                {
                                                                    permission.nome
                                                                }
                                                            </span>
                                                        </div>
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {profiles.map(
                                            (profile) => (
                                                <tr
                                                    key={
                                                        profile.id
                                                    }
                                                    style={{
                                                        borderBottom: `1px solid ${COLORS.border}`,
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            padding:
                                                                "0.9rem 1rem",
                                                        }}
                                                    >
                                                        <div className="flex align-items-center gap-3">
                                                            <div
                                                                style={{
                                                                    width: "36px",
                                                                    height: "36px",
                                                                    borderRadius:
                                                                        "8px",
                                                                    background: `${profile.cor}12`,
                                                                    color: profile.cor,
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                }}
                                                            >
                                                                <ShieldCheck
                                                                    size={
                                                                        18
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontWeight:
                                                                            700,
                                                                        fontSize:
                                                                            "0.82rem",
                                                                        color: COLORS.dark,
                                                                    }}
                                                                >
                                                                    {
                                                                        profile.nome
                                                                    }
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "0.7rem",
                                                                        color: COLORS.muted,
                                                                    }}
                                                                >
                                                                    {
                                                                        profile.utilizadores
                                                                    }{" "}
                                                                    utilizadores
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {permissions.map(
                                                        (
                                                            permission
                                                        ) => {
                                                            const key = `${profile.nome}-${permission.nome}`;

                                                            const enabled =
                                                                permissionState[
                                                                    key
                                                                ] ??
                                                                false;

                                                            return (
                                                                <td
                                                                    key={
                                                                        permission.id
                                                                    }
                                                                    style={{
                                                                        padding:
                                                                            "0.9rem",
                                                                        textAlign:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <InputSwitch
                                                                        checked={
                                                                            enabled
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) =>
                                                                            setPermissionState(
                                                                                (
                                                                                    current
                                                                                ) => ({
                                                                                    ...current,
                                                                                    [key]:
                                                                                        event.value,
                                                                                })
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            );
                                                        }
                                                    )}
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </Card>

            {/* =================================================
                USER DIALOG
            ================================================= */}

            <Dialog
                visible={userDialog}
                onHide={() => setUserDialog(false)}
                header={
                    selectedUser
                        ? "Editar utilizador"
                        : "Novo utilizador"
                }
                modal
                style={{
                    width: "650px",
                    maxWidth: "95vw",
                }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            outlined
                            severity="secondary"
                            onClick={() =>
                                setUserDialog(false)
                            }
                        />

                        <Button
                            label={
                                selectedUser
                                    ? "Guardar alterações"
                                    : "Criar utilizador"
                            }
                            icon={<CheckCircle2 size={16} />}
                            onClick={saveUser}
                        />
                    </div>
                }
            >
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            style={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                            }}
                        >
                            Nome completo
                        </label>

                        <InputText
                            value={selectedUser?.nome || ""}
                            onChange={(event) =>
                                setSelectedUser(
                                    (current) =>
                                        ({
                                            ...(current ||
                                                initialUsers[0]),
                                            nome: event.target
                                                .value,
                                        } as User)
                                )
                            }
                            placeholder="Ex.: John Doe"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            style={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                            }}
                        >
                            E-mail
                        </label>

                        <InputText
                            value={selectedUser?.email || ""}
                            onChange={(event) =>
                                setSelectedUser(
                                    (current) =>
                                        ({
                                            ...(current ||
                                                initialUsers[0]),
                                            email: event.target
                                                .value,
                                        } as User)
                                )
                            }
                            placeholder="john.doe@example.com"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            style={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                            }}
                        >
                            Contacto
                        </label>

                        <InputText
                            value={
                                selectedUser?.contacto || ""
                            }
                            onChange={(event) =>
                                setSelectedUser(
                                    (current) =>
                                        ({
                                            ...(current ||
                                                initialUsers[0]),
                                            contacto:
                                                event.target
                                                    .value,
                                        } as User)
                                )
                            }
                            placeholder="+258 84 000 0000"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            style={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                            }}
                        >
                            Perfil
                        </label>

                        <Dropdown
                            value={selectedUser?.perfil}
                            options={profiles.map(
                                (profile) => profile.nome
                            )}
                            onChange={(event) =>
                                setSelectedUser(
                                    (current) =>
                                        ({
                                            ...(current ||
                                                initialUsers[0]),
                                            perfil: event.value,
                                        } as User)
                                )
                            }
                            placeholder="Seleccione o perfil"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            style={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                            }}
                        >
                            Departamento
                        </label>

                        <InputText
                            value={
                                selectedUser?.departamento ||
                                ""
                            }
                            onChange={(event) =>
                                setSelectedUser(
                                    (current) =>
                                        ({
                                            ...(current ||
                                                initialUsers[0]),
                                            departamento:
                                                event.target
                                                    .value,
                                        } as User)
                                )
                            }
                            placeholder="Departamento"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            style={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                            }}
                        >
                            Curso
                        </label>

                        <InputText
                            value={
                                selectedUser?.curso || ""
                            }
                            onChange={(event) =>
                                setSelectedUser(
                                    (current) =>
                                        ({
                                            ...(current ||
                                                initialUsers[0]),
                                            curso: event.target
                                                .value,
                                        } as User)
                                )
                            }
                            placeholder="Curso"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12">
                        <Divider />

                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        color: COLORS.dark,
                                    }}
                                >
                                    Conta activa
                                </div>

                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        color: COLORS.muted,
                                        marginTop: "3px",
                                    }}
                                >
                                    Permitir que o utilizador
                                    aceda ao sistema.
                                </div>
                            </div>

                            <InputSwitch
                                checked={
                                    selectedUser?.estado ===
                                    "Activo"
                                }
                                onChange={(event) =>
                                    setSelectedUser(
                                        (current) =>
                                            ({
                                                ...(current ||
                                                    initialUsers[0]),
                                                estado: event.value
                                                    ? "Activo"
                                                    : "Inactivo",
                                            } as User)
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* =================================================
                PERMISSION DIALOG
            ================================================= */}

            <Dialog
                visible={permissionDialog}
                onHide={() =>
                    setPermissionDialog(false)
                }
                header={`Permissões — ${selectedProfile}`}
                modal
                style={{
                    width: "600px",
                    maxWidth: "95vw",
                }}
            >
                <div className="flex flex-column gap-2">
                    {permissions.map((permission) => {
                        const key = `${selectedProfile}-${permission.nome}`;

                        return (
                            <div
                                key={permission.id}
                                className="flex align-items-center justify-content-between"
                                style={{
                                    padding: "0.9rem",
                                    border: `1px solid ${COLORS.border}`,
                                    borderRadius: "9px",
                                }}
                            >
                                <div className="flex align-items-center gap-3">
                                    <div
                                        style={{
                                            width: "38px",
                                            height: "38px",
                                            borderRadius: "8px",
                                            background:
                                                COLORS.primaryLight,
                                            color: COLORS.primary,
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                        }}
                                    >
                                        {permission.icon}
                                    </div>

                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                color: COLORS.dark,
                                                fontSize:
                                                    "0.85rem",
                                            }}
                                        >
                                            {
                                                permission.nome
                                            }
                                        </div>

                                        <div
                                            style={{
                                                color: COLORS.muted,
                                                fontSize:
                                                    "0.72rem",
                                                marginTop:
                                                    "3px",
                                            }}
                                        >
                                            {
                                                permission.descricao
                                            }
                                        </div>
                                    </div>
                                </div>

                                <InputSwitch
                                    checked={
                                        permissionState[
                                            key
                                        ] ?? false
                                    }
                                    onChange={(event) =>
                                        setPermissionState(
                                            (current) => ({
                                                ...current,
                                                [key]:
                                                    event.value,
                                            })
                                        )
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </Dialog>
        </div>
    );
}