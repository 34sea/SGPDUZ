"use client";

import React, { useMemo, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Divider } from "primereact/divider";

import {
    CalendarDays,
    BookOpen,
    Users,
    Clock3,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    CircleDot,
    ClipboardCheck,
    FileText,
    Eye,
    Pencil,
    Plus,
    ChevronLeft,
    ChevronRight,
    MessageSquareWarning,
    History,
    RotateCcw,
    XCircle,
    Send,
    ShieldCheck,
    UserCheck,
} from "lucide-react";

// import "primereact/resources/themes/lara-light-blue/theme.css";
// import "primereact/resources/primereact.min.css";
// import "primeflex/primeflex.css";

interface Aula {
    id: number;
    data: Date;
    unidadeCurricular: string;
    codigoUC: string;
    turma: string;
    conteudoPrevisto: string;
    conteudoLeccionado: string;
    docente: string;
    horario: string;
    estado:
        | "Prevista"
        | "Registada"
        | "Confirmada"
        | "Confirmada com Ressalva"
        | "Em Disputa"
        | "Resolvida"
        | "Pendente Prolongada"
        | "Não Realizada";
    unidadeTematica: string;
    observacoes?: string;
    motivo?: string;
}

interface Historico {
    id: number;
    data: Date;
    acao: string;
    utilizador: string;
    perfil: string;
    observacao: string;
}

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

const aulasIniciais: Aula[] = [
    {
        id: 1,
        data: new Date(2026, 8, 21),
        unidadeCurricular: "Engenharia de Software",
        codigoUC: "INF301",
        turma: "EI31A",
        conteudoPrevisto:
            "Processos e modelos de desenvolvimento de software",
        conteudoLeccionado:
            "Processos e modelos de desenvolvimento de software",
        docente: "Jane Smith",
        horario: "08:00 - 10:00",
        estado: "Confirmada",
        unidadeTematica: "Processos de Desenvolvimento",
        observacoes: "Aula realizada conforme planificação.",
    },
    {
        id: 2,
        data: new Date(2026, 8, 21),
        unidadeCurricular: "Bases de Dados",
        codigoUC: "INF305",
        turma: "EI31B",
        conteudoPrevisto: "Modelo Entidade-Relacionamento",
        conteudoLeccionado: "Modelo Entidade-Relacionamento",
        docente: "John Doe",
        horario: "10:30 - 12:30",
        estado: "Confirmada com Ressalva",
        unidadeTematica: "Modelação de Dados",
        observacoes:
            "Foi necessário reduzir a parte prática por limitação de tempo.",
    },
    {
        id: 3,
        data: new Date(2026, 8, 22),
        unidadeCurricular: "Engenharia de Software",
        codigoUC: "INF301",
        turma: "EI31A",
        conteudoPrevisto: "Metodologias Ágeis",
        conteudoLeccionado: "",
        docente: "Jane Smith",
        horario: "08:00 - 10:00",
        estado: "Registada",
        unidadeTematica: "Metodologias de Desenvolvimento",
    },
    {
        id: 4,
        data: new Date(2026, 8, 22),
        unidadeCurricular: "Programação Web",
        codigoUC: "INF307",
        turma: "EI31B",
        conteudoPrevisto: "Componentes React",
        conteudoLeccionado:
            "Componentes funcionais e reutilização de componentes",
        docente: "Daniel Miller",
        horario: "10:30 - 12:30",
        estado: "Pendente Prolongada",
        unidadeTematica: "React.js",
        observacoes:
            "Aguardando confirmação do Chefe de Turma.",
    },
    {
        id: 5,
        data: new Date(2026, 8, 23),
        unidadeCurricular: "Bases de Dados",
        codigoUC: "INF305",
        turma: "EI31A",
        conteudoPrevisto: "SQL e consultas",
        conteudoLeccionado: "",
        docente: "John Doe",
        horario: "08:00 - 10:00",
        estado: "Prevista",
        unidadeTematica: "Linguagem SQL",
    },
    {
        id: 6,
        data: new Date(2026, 8, 23),
        unidadeCurricular: "Engenharia de Software",
        codigoUC: "INF301",
        turma: "EI31B",
        conteudoPrevisto: "Levantamento de requisitos",
        conteudoLeccionado: "",
        docente: "Jane Smith",
        horario: "14:00 - 16:00",
        estado: "Prevista",
        unidadeTematica: "Requisitos de Software",
    },
    {
        id: 7,
        data: new Date(2026, 8, 24),
        unidadeCurricular: "Desenvolvimento Web",
        codigoUC: "INF410",
        turma: "EI41A",
        conteudoPrevisto: "APIs REST",
        conteudoLeccionado:
            "Introdução às APIs REST e métodos HTTP",
        docente: "Emily Brown",
        horario: "08:00 - 10:00",
        estado: "Em Disputa",
        unidadeTematica: "APIs e Serviços Web",
        observacoes:
            "Conteúdo registado parcialmente. Turma solicita revisão.",
    },
    {
        id: 8,
        data: new Date(2026, 8, 24),
        unidadeCurricular: "Inteligência Artificial",
        codigoUC: "INF402",
        turma: "EI41A",
        conteudoPrevisto: "Introdução à aprendizagem automática",
        conteudoLeccionado: "",
        docente: "Alex Johnson",
        horario: "10:30 - 12:30",
        estado: "Não Realizada",
        unidadeTematica: "Fundamentos de Machine Learning",
        motivo:
            "Docente indisponível por motivo devidamente justificado.",
    },
    {
        id: 9,
        data: new Date(2026, 8, 25),
        unidadeCurricular: "Programação Web",
        codigoUC: "INF307",
        turma: "EI31A",
        conteudoPrevisto: "React Hooks",
        conteudoLeccionado: "",
        docente: "Daniel Miller",
        horario: "08:00 - 10:00",
        estado: "Prevista",
        unidadeTematica: "React.js",
    },
    {
        id: 10,
        data: new Date(2026, 8, 25),
        unidadeCurricular: "Bases de Dados",
        codigoUC: "INF305",
        turma: "EI31B",
        conteudoPrevisto: "Normalização",
        conteudoLeccionado:
            "Primeira e segunda formas normais",
        docente: "John Doe",
        horario: "14:00 - 16:00",
        estado: "Resolvida",
        unidadeTematica: "Normalização",
        observacoes:
            "Disputa resolvida após revisão do registo.",
    },
];

const historicoInicial: Historico[] = [
    {
        id: 1,
        data: new Date(2026, 8, 22, 13, 30),
        acao: "Aula colocada em disputa",
        utilizador: "Michael Wilson",
        perfil: "Chefe de Turma",
        observacao:
            "Conteúdo registado não corresponde integralmente ao conteúdo previsto.",
    },
    {
        id: 2,
        data: new Date(2026, 8, 22, 14, 10),
        acao: "Registo actualizado",
        utilizador: "Jane Smith",
        perfil: "Docente",
        observacao:
            "Docente adicionou observação ao registo da aula.",
    },
    {
        id: 3,
        data: new Date(2026, 8, 22, 15, 0),
        acao: "Aula confirmada",
        utilizador: "Sarah Davis",
        perfil: "Subchefe de Turma",
        observacao:
            "Aula confirmada após consulta do conteúdo leccionado.",
    },
];

const statusSeverity = (
    estado: Aula["estado"]
):
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "secondary" => {
    switch (estado) {
        case "Confirmada":
        case "Resolvida":
            return "success";

        case "Confirmada com Ressalva":
        case "Pendente Prolongada":
            return "warning";

        case "Em Disputa":
        case "Não Realizada":
            return "danger";

        case "Registada":
            return "info";

        case "Prevista":
        default:
            return "secondary";
    }
};

const formatDate = (date: Date) =>
    date.toLocaleDateString("pt-MZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const formatDateTime = (date: Date) =>
    date.toLocaleString("pt-MZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

export default function ClassesValidation() {
    const [activeModule, setActiveModule] = useState<
        "mapa" | "registo" | "validacao"
    >("mapa");

    const [aulas, setAulas] = useState<Aula[]>(aulasIniciais);

    const [historico] = useState<Historico[]>(historicoInicial);

    const [selectedDate, setSelectedDate] = useState(
        new Date(2026, 8, 22)
    );

    const [selectedTurma, setSelectedTurma] =
        useState<string>("Todas");

    const [selectedEstado, setSelectedEstado] =
        useState<string>("Todos");

    const [search, setSearch] = useState("");

    const [selectedAula, setSelectedAula] =
        useState<Aula | null>(null);

    const [registerDialog, setRegisterDialog] =
        useState(false);

    const [historyDialog, setHistoryDialog] =
        useState(false);

    const [selectedHistoryAula, setSelectedHistoryAula] =
        useState<Aula | null>(null);

    const [registerForm, setRegisterForm] = useState({
        data: new Date(2026, 8, 22),
        unidadeCurricular: "Engenharia de Software",
        turma: "EI31A",
        unidadeTematica: "Processos de Desenvolvimento",
        conteudo: "",
        inicio: "08:00",
        fim: "10:00",
        observacoes: "",
        motivo: "",
    });

    const turmasOptions = [
        { label: "Todas as turmas", value: "Todas" },
        { label: "EI31A", value: "EI31A" },
        { label: "EI31B", value: "EI31B" },
        { label: "EI41A", value: "EI41A" },
    ];

    const estadosOptions = [
        { label: "Todos os estados", value: "Todos" },
        { label: "Prevista", value: "Prevista" },
        { label: "Registada", value: "Registada" },
        { label: "Confirmada", value: "Confirmada" },
        {
            label: "Confirmada com Ressalva",
            value: "Confirmada com Ressalva",
        },
        { label: "Em Disputa", value: "Em Disputa" },
        { label: "Resolvida", value: "Resolvida" },
        {
            label: "Pendente Prolongada",
            value: "Pendente Prolongada",
        },
        { label: "Não Realizada", value: "Não Realizada" },
    ];

    const aulasDoDia = useMemo(() => {
        return aulas.filter((aula) => {
            const sameDay =
                aula.data.getFullYear() ===
                    selectedDate.getFullYear() &&
                aula.data.getMonth() ===
                    selectedDate.getMonth() &&
                aula.data.getDate() ===
                    selectedDate.getDate();

            const turmaMatch =
                selectedTurma === "Todas" ||
                aula.turma === selectedTurma;

            const estadoMatch =
                selectedEstado === "Todos" ||
                aula.estado === selectedEstado;

            return sameDay && turmaMatch && estadoMatch;
        });
    }, [
        aulas,
        selectedDate,
        selectedTurma,
        selectedEstado,
    ]);

    const aulasFiltradas = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return aulas;

        return aulas.filter(
            (aula) =>
                aula.unidadeCurricular
                    .toLowerCase()
                    .includes(value) ||
                aula.turma
                    .toLowerCase()
                    .includes(value) ||
                aula.docente
                    .toLowerCase()
                    .includes(value) ||
                aula.conteudoPrevisto
                    .toLowerCase()
                    .includes(value)
        );
    }, [aulas, search]);

    const totalAulas = aulas.length;

    const confirmadas = aulas.filter(
        (aula) =>
            aula.estado === "Confirmada" ||
            aula.estado === "Resolvida"
    ).length;

    const pendentes = aulas.filter(
        (aula) =>
            aula.estado === "Registada" ||
            aula.estado === "Pendente Prolongada"
    ).length;

    const disputas = aulas.filter(
        (aula) => aula.estado === "Em Disputa"
    ).length;

    const naoRealizadas = aulas.filter(
        (aula) => aula.estado === "Não Realizada"
    ).length;

    const changeDay = (amount: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + amount);
        setSelectedDate(date);
    };

    const handleSaveClass = () => {
        if (
            !registerForm.unidadeCurricular ||
            !registerForm.turma ||
            !registerForm.conteudo
        ) {
            return;
        }

        const novaAula: Aula = {
            id: Date.now(),
            data: registerForm.data,
            unidadeCurricular:
                registerForm.unidadeCurricular,
            codigoUC: "INF301",
            turma: registerForm.turma,
            conteudoPrevisto:
                registerForm.conteudo,
            conteudoLeccionado:
                registerForm.conteudo,
            docente: "Docente actual",
            horario: `${registerForm.inicio} - ${registerForm.fim}`,
            estado: "Registada",
            unidadeTematica:
                registerForm.unidadeTematica,
            observacoes:
                registerForm.observacoes,
            motivo: registerForm.motivo,
        };

        setAulas((current) => [...current, novaAula]);

        setRegisterDialog(false);

        setRegisterForm({
            data: new Date(2026, 8, 22),
            unidadeCurricular:
                "Engenharia de Software",
            turma: "EI31A",
            unidadeTematica:
                "Processos de Desenvolvimento",
            conteudo: "",
            inicio: "08:00",
            fim: "10:00",
            observacoes: "",
            motivo: "",
        });
    };

    const updateAulaEstado = (
        id: number,
        estado: Aula["estado"]
    ) => {
        setAulas((current) =>
            current.map((aula) =>
                aula.id === id
                    ? {
                          ...aula,
                          estado,
                      }
                    : aula
            )
        );

        setSelectedAula((current) =>
            current && current.id === id
                ? {
                      ...current,
                      estado,
                  }
                : current
        );
    };

    const aulaStatusBody = (row: Aula) => (
        <Tag
            value={row.estado}
            // severity={statusSeverity(row.estado)}
        />
    );

    const aulaDataBody = (row: Aula) => (
        <div>
            <strong
                style={{
                    color: COLORS.dark,
                }}
            >
                {formatDate(row.data)}
            </strong>

            <div
                style={{
                    color: COLORS.muted,
                    fontSize: "0.75rem",
                    marginTop: 4,
                }}
            >
                {row.horario}
            </div>
        </div>
    );

    const aulaUCBody = (row: Aula) => (
        <div>
            <strong
                style={{
                    color: COLORS.dark,
                }}
            >
                {row.unidadeCurricular}
            </strong>

            <div
                style={{
                    color: COLORS.primary,
                    fontSize: "0.75rem",
                    fontWeight: 650,
                    marginTop: 3,
                }}
            >
                {row.codigoUC}
            </div>
        </div>
    );

    const aulaConteudoBody = (row: Aula) => (
        <div style={{ maxWidth: 360 }}>
            <div
                style={{
                    color: COLORS.dark,
                    fontWeight: 600,
                    fontSize: "0.82rem",
                }}
            >
                Previsto:
            </div>

            <div
                style={{
                    color: COLORS.muted,
                    fontSize: "0.78rem",
                    marginTop: 2,
                }}
            >
                {row.conteudoPrevisto}
            </div>

            {row.conteudoLeccionado && (
                <>
                    <div
                        style={{
                            color: COLORS.dark,
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            marginTop: 8,
                        }}
                    >
                        Leccionado:
                    </div>

                    <div
                        style={{
                            color: COLORS.green,
                            fontSize: "0.78rem",
                            marginTop: 2,
                        }}
                    >
                        {row.conteudoLeccionado}
                    </div>
                </>
            )}
        </div>
    );

    const aulaDocenteBody = (row: Aula) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: COLORS.primaryLight,
                    color: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 750,
                }}
            >
                {row.docente
                    .split(" ")
                    .map((item) => item[0])
                    .join("")
                    .slice(0, 2)}
            </div>

            <span
                style={{
                    fontSize: "0.82rem",
                }}
            >
                {row.docente}
            </span>
        </div>
    );

    const actionBody = (row: Aula) => (
        <div
            style={{
                display: "flex",
                gap: 3,
            }}
        >
            <Button
                icon={<Eye size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Consultar aula"
                onClick={() => setSelectedAula(row)}
            />

            <Button
                icon={<Pencil size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Editar registo"
            />

            <Button
                icon={<History size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Histórico"
                onClick={() => {
                    setSelectedHistoryAula(row);
                    setHistoryDialog(true);
                }}
            />
        </div>
    );

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "none",
                margin: 0,
                padding: "1rem 1.25rem 2rem",
                boxSizing: "border-box",
                minHeight: "100vh",
                background: COLORS.background,
            }}
        >
            {/* =====================================================
                HEADER
            ====================================================== */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 20,
                    marginBottom: 20,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: COLORS.primaryLight,
                            color: COLORS.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <BookOpen size={23} />
                    </div>

                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: "1.45rem",
                                fontWeight: 750,
                                color: COLORS.dark,
                            }}
                        >
                            Aulas e Validação
                        </h1>

                        <p
                            style={{
                                margin: "4px 0 0",
                                color: COLORS.muted,
                                fontSize: "0.88rem",
                            }}
                        >
                            Planeamento, registo, confirmação e
                            acompanhamento das aulas.
                        </p>
                    </div>
                </div>

                <Button
                    label="Registar Aula"
                    icon={<Plus size={17} />}
                    onClick={() => setRegisterDialog(true)}
                />
            </div>

            {/* =====================================================
                KPIs
            ====================================================== */}

            <div className="grid" style={{ marginBottom: 18 }}>
                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 12,
                            padding: 17,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.76rem",
                                    }}
                                >
                                    Aulas no mapa
                                </span>

                                <div
                                    style={{
                                        color: COLORS.dark,
                                        fontWeight: 750,
                                        fontSize: "1.6rem",
                                        marginTop: 5,
                                    }}
                                >
                                    {totalAulas}
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background:
                                        COLORS.primaryLight,
                                    color: COLORS.primary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CalendarDays size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 12,
                            padding: 17,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.76rem",
                                    }}
                                >
                                    Confirmadas
                                </span>

                                <div
                                    style={{
                                        color: COLORS.green,
                                        fontWeight: 750,
                                        fontSize: "1.6rem",
                                        marginTop: 5,
                                    }}
                                >
                                    {confirmadas}
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background:
                                        COLORS.greenLight,
                                    color: COLORS.green,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 12,
                            padding: 17,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.76rem",
                                    }}
                                >
                                    Pendentes
                                </span>

                                <div
                                    style={{
                                        color: COLORS.orange,
                                        fontWeight: 750,
                                        fontSize: "1.6rem",
                                        marginTop: 5,
                                    }}
                                >
                                    {pendentes}
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background:
                                        COLORS.orangeLight,
                                    color: COLORS.orange,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Clock3 size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 12,
                            padding: 17,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.76rem",
                                    }}
                                >
                                    Em disputa
                                </span>

                                <div
                                    style={{
                                        color: COLORS.red,
                                        fontWeight: 750,
                                        fontSize: "1.6rem",
                                        marginTop: 5,
                                    }}
                                >
                                    {disputas}
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background:
                                        COLORS.redLight,
                                    color: COLORS.red,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MessageSquareWarning
                                    size={20}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                MODULE NAVIGATION
            ====================================================== */}

            <div
                style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 13,
                    padding: 7,
                    display: "flex",
                    gap: 7,
                    marginBottom: 18,
                    overflowX: "auto",
                }}
            >
                <button
                    onClick={() => setActiveModule("mapa")}
                    style={{
                        border: "none",
                        borderRadius: 9,
                        padding: "11px 17px",
                        background:
                            activeModule === "mapa"
                                ? COLORS.primary
                                : "transparent",
                        color:
                            activeModule === "mapa"
                                ? COLORS.white
                                : COLORS.text,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    <CalendarDays size={17} />
                    Mapa Semanal
                </button>

                <button
                    onClick={() => setActiveModule("registo")}
                    style={{
                        border: "none",
                        borderRadius: 9,
                        padding: "11px 17px",
                        background:
                            activeModule === "registo"
                                ? COLORS.primary
                                : "transparent",
                        color:
                            activeModule === "registo"
                                ? COLORS.white
                                : COLORS.text,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    <FileText size={17} />
                    Registo de Aula
                </button>

                <button
                    onClick={() => setActiveModule("validacao")}
                    style={{
                        border: "none",
                        borderRadius: 9,
                        padding: "11px 17px",
                        background:
                            activeModule === "validacao"
                                ? COLORS.primary
                                : "transparent",
                        color:
                            activeModule === "validacao"
                                ? COLORS.white
                                : COLORS.text,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    <ShieldCheck size={17} />
                    Confirmação / Validação
                </button>
            </div>

            {/* =====================================================
                MAPA SEMANAL
            ====================================================== */}

            {activeModule === "mapa" && (
                <>
                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            marginBottom: 18,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                gap: 15,
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <Button
                                    icon={
                                        <ChevronLeft
                                            size={17}
                                        />
                                    }
                                    text
                                    rounded
                                    severity="secondary"
                                    onClick={() =>
                                        changeDay(-1)
                                    }
                                />

                                <div
                                    style={{
                                        textAlign: "center",
                                        minWidth: 180,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                "0.75rem",
                                            color:
                                                COLORS.muted,
                                        }}
                                    >
                                        Dia seleccionado
                                    </div>

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            color:
                                                COLORS.dark,
                                            fontSize:
                                                "1rem",
                                            marginTop: 3,
                                        }}
                                    >
                                        {selectedDate.toLocaleDateString(
                                            "pt-MZ",
                                            {
                                                weekday:
                                                    "long",
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            }
                                        )}
                                    </strong>
                                </div>

                                <Button
                                    icon={
                                        <ChevronRight
                                            size={17}
                                        />
                                    }
                                    text
                                    rounded
                                    severity="secondary"
                                    onClick={() =>
                                        changeDay(1)
                                    }
                                />
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Calendar
                                    value={selectedDate}
                                    onChange={(e) => {
                                        if (
                                            e.value instanceof
                                            Date
                                        ) {
                                            setSelectedDate(
                                                e.value
                                            );
                                        }
                                    }}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                />

                                <Dropdown
                                    value={selectedTurma}
                                    options={turmasOptions}
                                    onChange={(e) =>
                                        setSelectedTurma(
                                            e.value
                                        )
                                    }
                                    style={{
                                        minWidth: 160,
                                    }}
                                />

                                <Dropdown
                                    value={selectedEstado}
                                    options={estadosOptions}
                                    onChange={(e) =>
                                        setSelectedEstado(
                                            e.value
                                        )
                                    }
                                    style={{
                                        minWidth: 180,
                                    }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Timeline diária */}

                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            overflowX: "auto",
                            paddingBottom: 5,
                            marginBottom: 18,
                        }}
                    >
                        {[
                            {
                                day: "Seg",
                                date: 21,
                                value: new Date(
                                    2026,
                                    8,
                                    21
                                ),
                            },
                            {
                                day: "Ter",
                                date: 22,
                                value: new Date(
                                    2026,
                                    8,
                                    22
                                ),
                            },
                            {
                                day: "Qua",
                                date: 23,
                                value: new Date(
                                    2026,
                                    8,
                                    23
                                ),
                            },
                            {
                                day: "Qui",
                                date: 24,
                                value: new Date(
                                    2026,
                                    8,
                                    24
                                ),
                            },
                            {
                                day: "Sex",
                                date: 25,
                                value: new Date(
                                    2026,
                                    8,
                                    25
                                ),
                            },
                        ].map((item) => {
                            const active =
                                selectedDate.toDateString() ===
                                item.value.toDateString();

                            const count = aulas.filter(
                                (aula) =>
                                    aula.data.toDateString() ===
                                    item.value.toDateString()
                            ).length;

                            return (
                                <button
                                    key={item.date}
                                    onClick={() =>
                                        setSelectedDate(
                                            item.value
                                        )
                                    }
                                    style={{
                                        minWidth: 130,
                                        border: active
                                            ? `2px solid ${COLORS.primary}`
                                            : `1px solid ${COLORS.border}`,
                                        borderRadius: 11,
                                        background:
                                            active
                                                ? COLORS.primaryLight
                                                : COLORS.white,
                                        padding: 13,
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                >
                                    <div
                                        style={{
                                            color: active
                                                ? COLORS.primary
                                                : COLORS.muted,
                                            fontSize:
                                                "0.72rem",
                                            fontWeight: 650,
                                        }}
                                    >
                                        {item.day}
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "1.25rem",
                                            color:
                                                COLORS.dark,
                                            fontWeight: 750,
                                            marginTop: 4,
                                        }}
                                    >
                                        {item.date}
                                    </div>

                                    <div
                                        style={{
                                            color:
                                                COLORS.muted,
                                            fontSize:
                                                "0.72rem",
                                            marginTop: 4,
                                        }}
                                    >
                                        {count} aula
                                        {count !== 1
                                            ? "s"
                                            : ""}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom: 15,
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "1.1rem",
                                        color: COLORS.dark,
                                    }}
                                >
                                    Aulas do dia
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            "4px 0 0",
                                        color:
                                            COLORS.muted,
                                        fontSize:
                                            "0.8rem",
                                    }}
                                >
                                    Aulas previstas e realizadas
                                    no dia seleccionado.
                                </p>
                            </div>

                            <Tag
                                value={`${aulasDoDia.length} aulas`}
                                severity="info"
                            />
                        </div>

                        {aulasDoDia.length === 0 ? (
                            <div
                                style={{
                                    padding: 35,
                                    textAlign: "center",
                                    color:
                                        COLORS.muted,
                                }}
                            >
                                Não existem aulas para os
                                filtros seleccionados.
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    gap: 10,
                                }}
                            >
                                {aulasDoDia.map((aula) => (
                                    <div
                                        key={aula.id}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "100px 220px 100px minmax(0,1fr) 180px auto",
                                            gap: 15,
                                            alignItems:
                                                "center",
                                            border: `1px solid ${COLORS.border}`,
                                            borderRadius: 11,
                                            padding: 14,
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    color:
                                                        COLORS.primary,
                                                    fontWeight:
                                                        750,
                                                }}
                                            >
                                                {
                                                    aula.horario
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    color:
                                                        COLORS.muted,
                                                    fontSize:
                                                        "0.72rem",
                                                    marginTop:
                                                        3,
                                                }}
                                            >
                                                {
                                                    aula.turma
                                                }
                                            </div>
                                        </div>

                                        <div>
                                            <strong
                                                style={{
                                                    color:
                                                        COLORS.dark,
                                                    fontSize:
                                                        "0.83rem",
                                                }}
                                            >
                                                {
                                                    aula.unidadeCurricular
                                                }
                                            </strong>

                                            <div
                                                style={{
                                                    color:
                                                        COLORS.muted,
                                                    fontSize:
                                                        "0.72rem",
                                                    marginTop:
                                                        3,
                                                }}
                                            >
                                                {
                                                    aula.codigoUC
                                                }
                                            </div>
                                        </div>

                                        <Tag
                                            value={aula.turma}
                                            // severity="secondary"
                                        />

                                        <div
                                            style={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    color:
                                                        COLORS.muted,
                                                    fontSize:
                                                        "0.72rem",
                                                }}
                                            >
                                                Conteúdo
                                            </div>

                                            <div
                                                style={{
                                                    color:
                                                        COLORS.dark,
                                                    fontSize:
                                                        "0.8rem",
                                                    fontWeight:
                                                        600,
                                                    marginTop:
                                                        3,
                                                }}
                                            >
                                                {
                                                    aula.conteudoPrevisto
                                                }
                                            </div>
                                        </div>

                                        <div>
                                            <div
                                                style={{
                                                    color:
                                                        COLORS.muted,
                                                    fontSize:
                                                        "0.72rem",
                                                    marginBottom:
                                                        5,
                                                }}
                                            >
                                                Estado
                                            </div>

                                            <Tag
                                                value={
                                                    aula.estado
                                                }
                                                // severity={statusSeverity(
                                                //     aula.estado
                                                // )}
                                            />
                                        </div>

                                        <Button
                                            icon={
                                                <Eye
                                                    size={15}
                                                />
                                            }
                                            text
                                            rounded
                                            severity="secondary"
                                            tooltip="Consultar"
                                            onClick={() =>
                                                setSelectedAula(
                                                    aula
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </>
            )}

            {/* =====================================================
                REGISTO DE AULA
            ====================================================== */}

            {activeModule === "registo" && (
                <>
                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "flex-start",
                                gap: 20,
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        color: COLORS.dark,
                                        fontSize:
                                            "1.15rem",
                                    }}
                                >
                                    Registo de Aula
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            "5px 0 0",
                                        color:
                                            COLORS.muted,
                                        fontSize:
                                            "0.82rem",
                                    }}
                                >
                                    Registe o conteúdo
                                    efectivamente leccionado e
                                    as ocorrências da aula.
                                </p>
                            </div>

                            <Button
                                label="Novo Registo"
                                icon={
                                    <Plus size={16} />
                                }
                                onClick={() =>
                                    setRegisterDialog(true)
                                }
                            />
                        </div>

                        <Divider />

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                gap: 15,
                                marginBottom: 14,
                                flexWrap: "wrap",
                            }}
                        >
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />

                                <InputText
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Pesquisar aulas..."
                                    style={{
                                        minWidth: 320,
                                    }}
                                />
                            </span>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                }}
                            >
                                <Tag
                                    value={`${aulasFiltradas.length} registos`}
                                    severity="info"
                                />
                            </div>
                        </div>

                        <DataTable
                            value={aulasFiltradas}
                            paginator
                            rows={8}
                            responsiveLayout="scroll"
                            emptyMessage="Nenhuma aula encontrada."
                        >
                            <Column
                                header="Data / Horário"
                                body={aulaDataBody}
                                style={{
                                    minWidth: "150px",
                                }}
                            />

                            <Column
                                header="Unidade Curricular"
                                body={aulaUCBody}
                                style={{
                                    minWidth: "210px",
                                }}
                            />

                            <Column
                                header="Turma"
                                field="turma"
                            />

                            <Column
                                header="Conteúdo"
                                body={aulaConteudoBody}
                                style={{
                                    minWidth: "350px",
                                }}
                            />

                            <Column
                                header="Docente"
                                body={aulaDocenteBody}
                                style={{
                                    minWidth: "180px",
                                }}
                            />

                            <Column
                                header="Estado"
                                body={aulaStatusBody}
                                style={{
                                    minWidth: "180px",
                                }}
                            />

                            <Column
                                header="Acções"
                                body={actionBody}
                                style={{
                                    minWidth: "130px",
                                }}
                            />
                        </DataTable>
                    </Card>
                </>
            )}

            {/* =====================================================
                VALIDAÇÃO
            ====================================================== */}

            {activeModule === "validacao" && (
                <>
                    <div className="grid">
                        <div className="col-12 xl:col-8">
                            <Card
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "flex-start",
                                        gap: 15,
                                    }}
                                >
                                    <div>
                                        <h2
                                            style={{
                                                margin: 0,
                                                color:
                                                    COLORS.dark,
                                                fontSize:
                                                    "1.15rem",
                                            }}
                                        >
                                            Aulas pendentes de
                                            validação
                                        </h2>

                                        <p
                                            style={{
                                                margin:
                                                    "5px 0 0",
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            Confirme a realização
                                            das aulas ou solicite
                                            revisão quando
                                            necessário.
                                        </p>
                                    </div>

                                    <Tag
                                        value={`${pendentes + disputas} pendentes`}
                                        severity={
                                            disputas > 0
                                                ? "danger"
                                                : "warning"
                                        }
                                    />
                                </div>

                                <Divider />

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection:
                                            "column",
                                        gap: 10,
                                    }}
                                >
                                    {aulas
                                        .filter(
                                            (aula) =>
                                                aula.estado ===
                                                    "Registada" ||
                                                aula.estado ===
                                                    "Pendente Prolongada" ||
                                                aula.estado ===
                                                    "Em Disputa"
                                        )
                                        .map((aula) => (
                                            <div
                                                key={aula.id}
                                                style={{
                                                    border: `1px solid ${COLORS.border}`,
                                                    borderRadius:
                                                        11,
                                                    padding: 15,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        gap: 15,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            gap: 12,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius:
                                                                    10,
                                                                background:
                                                                    COLORS.primaryLight,
                                                                color:
                                                                    COLORS.primary,
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <ClipboardCheck
                                                                size={
                                                                    20
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <strong
                                                                style={{
                                                                    color:
                                                                        COLORS.dark,
                                                                }}
                                                            >
                                                                {
                                                                    aula.unidadeCurricular
                                                                }
                                                            </strong>

                                                            <div
                                                                style={{
                                                                    color:
                                                                        COLORS.muted,
                                                                    fontSize:
                                                                        "0.76rem",
                                                                    marginTop:
                                                                        4,
                                                                }}
                                                            >
                                                                {
                                                                    aula.codigoUC
                                                                }{" "}
                                                                •{" "}
                                                                {
                                                                    aula.turma
                                                                }{" "}
                                                                •{" "}
                                                                {
                                                                    aula.horario
                                                                }
                                                            </div>

                                                            <div
                                                                style={{
                                                                    color:
                                                                        COLORS.text,
                                                                    fontSize:
                                                                        "0.79rem",
                                                                    marginTop:
                                                                        8,
                                                                }}
                                                            >
                                                                {
                                                                    aula.conteudoPrevisto
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Tag
                                                        value={
                                                            aula.estado
                                                        }
                                                        // severity={statusSeverity(
                                                        //     aula.estado
                                                        // )}
                                                    />
                                                </div>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "flex-end",
                                                        gap: 7,
                                                        marginTop:
                                                            13,
                                                        paddingTop:
                                                            12,
                                                        borderTop: `1px solid ${COLORS.border}`,
                                                    }}
                                                >
                                                    <Button
                                                        label="Consultar"
                                                        icon={
                                                            <Eye
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        }
                                                        text
                                                        size="small"
                                                        onClick={() =>
                                                            setSelectedAula(
                                                                aula
                                                            )
                                                        }
                                                    />

                                                    <Button
                                                        label="Confirmar"
                                                        icon={
                                                            <CheckCircle2
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        }
                                                        severity="success"
                                                        outlined
                                                        size="small"
                                                        onClick={() =>
                                                            updateAulaEstado(
                                                                aula.id,
                                                                "Confirmada"
                                                            )
                                                        }
                                                    />

                                                    <Button
                                                        label="Com ressalva"
                                                        icon={
                                                            <AlertTriangle
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        }
                                                        severity="warning"
                                                        outlined
                                                        size="small"
                                                        onClick={() =>
                                                            updateAulaEstado(
                                                                aula.id,
                                                                "Confirmada com Ressalva"
                                                            )
                                                        }
                                                    />

                                                    <Button
                                                        label="Disputar"
                                                        icon={
                                                            <MessageSquareWarning
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        }
                                                        severity="danger"
                                                        outlined
                                                        size="small"
                                                        onClick={() =>
                                                            updateAulaEstado(
                                                                aula.id,
                                                                "Em Disputa"
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 xl:col-4">
                            <Card
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    height: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: 10,
                                        marginBottom: 18,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius:
                                                10,
                                            background:
                                                COLORS.purpleLight,
                                            color:
                                                COLORS.purple,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                        }}
                                    >
                                        <ShieldCheck
                                            size={21}
                                        />
                                    </div>

                                    <div>
                                        <h3
                                            style={{
                                                margin: 0,
                                                color:
                                                    COLORS.dark,
                                                fontSize:
                                                    "1rem",
                                            }}
                                        >
                                            Fluxo de validação
                                        </h3>

                                        <span
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.75rem",
                                            }}
                                        >
                                            Estados da aula
                                        </span>
                                    </div>
                                </div>

                                {[
                                    {
                                        label: "Registada",
                                        color: COLORS.primary,
                                        bg: COLORS.primaryLight,
                                        icon: FileText,
                                    },
                                    {
                                        label: "Confirmada",
                                        color: COLORS.green,
                                        bg: COLORS.greenLight,
                                        icon: CheckCircle2,
                                    },
                                    {
                                        label: "Confirmada com Ressalva",
                                        color: COLORS.orange,
                                        bg: COLORS.orangeLight,
                                        icon: AlertTriangle,
                                    },
                                    {
                                        label: "Em Disputa",
                                        color: COLORS.red,
                                        bg: COLORS.redLight,
                                        icon: MessageSquareWarning,
                                    },
                                    {
                                        label: "Resolvida",
                                        color: COLORS.green,
                                        bg: COLORS.greenLight,
                                        icon: ShieldCheck,
                                    },
                                    {
                                        label: "Pendente Prolongada",
                                        color: COLORS.orange,
                                        bg: COLORS.orangeLight,
                                        icon: Clock3,
                                    },
                                ].map((item, index) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.label}
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap: 10,
                                                marginBottom:
                                                    11,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius:
                                                        "50%",
                                                    background:
                                                        item.bg,
                                                    color:
                                                        item.color,
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                }}
                                            >
                                                <Icon
                                                    size={15}
                                                />
                                            </div>

                                            <span
                                                style={{
                                                    color:
                                                        COLORS.text,
                                                    fontSize:
                                                        "0.8rem",
                                                    fontWeight:
                                                        550,
                                                }}
                                            >
                                                {item.label}
                                            </span>

                                            {index <
                                                5 && (
                                                <ChevronRight
                                                    size={
                                                        14
                                                    }
                                                    color={
                                                        COLORS.light
                                                    }
                                                />
                                            )}
                                        </div>
                                    );
                                })}

                                <Divider />

                                <div
                                    style={{
                                        background:
                                            COLORS.background,
                                        borderRadius: 10,
                                        padding: 13,
                                    }}
                                >
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            gap: 9,
                                        }}
                                    >
                                        <UserCheck
                                            size={18}
                                            color={
                                                COLORS.primary
                                            }
                                        />

                                        <div>
                                            <strong
                                                style={{
                                                    color:
                                                        COLORS.dark,
                                                    fontSize:
                                                        "0.8rem",
                                                }}
                                            >
                                                Responsáveis pela
                                                validação
                                            </strong>

                                            <p
                                                style={{
                                                    margin:
                                                        "5px 0 0",
                                                    color:
                                                        COLORS.muted,
                                                    fontSize:
                                                        "0.75rem",
                                                    lineHeight:
                                                        1.5,
                                                }}
                                            >
                                                Chefe de Turma e
                                                Subchefe de Turma
                                                podem consultar o
                                                registo e efectuar a
                                                validação da aula.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <Card
                        style={{
                            marginTop: 18,
                            border: `1px solid ${COLORS.border}`,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom: 15,
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize:
                                            "1.05rem",
                                        color:
                                            COLORS.dark,
                                    }}
                                >
                                    Histórico de validações
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            "4px 0 0",
                                        color:
                                            COLORS.muted,
                                        fontSize:
                                            "0.78rem",
                                    }}
                                >
                                    Registo das acções realizadas
                                    sobre as aulas.
                                </p>
                            </div>

                            <Button
                                label="Ver histórico completo"
                                icon={<History size={16} />}
                                text
                                size="small"
                                onClick={() =>
                                    setHistoryDialog(true)
                                }
                            />
                        </div>

                        <DataTable
                            value={historico}
                            responsiveLayout="scroll"
                            emptyMessage="Nenhum histórico encontrado."
                        >
                            <Column
                                header="Data"
                                body={(row) =>
                                    formatDateTime(row.data)
                                }
                            />

                            <Column
                                field="acao"
                                header="Acção"
                            />

                            <Column
                                field="utilizador"
                                header="Utilizador"
                            />

                            <Column
                                header="Perfil"
                                body={(row) => (
                                    <Tag
                                        value={row.perfil}
                                        // severity="secondary"
                                    />
                                )}
                            />

                            <Column
                                field="observacao"
                                header="Observação"
                                style={{
                                    minWidth: "350px",
                                }}
                            />
                        </DataTable>
                    </Card>
                </>
            )}

            {/* =====================================================
                DIALOG - REGISTAR AULA
            ====================================================== */}

            <Dialog
                header="Registo de Aula"
                visible={registerDialog}
                onHide={() => setRegisterDialog(false)}
                modal
                style={{
                    width: "760px",
                    maxWidth: "95vw",
                }}
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label
                            className="block mb-2"
                            htmlFor="data-aula"
                        >
                            Data
                        </label>

                        <Calendar
                            id="data-aula"
                            value={registerForm.data}
                            onChange={(e) => {
                                if (
                                    e.value instanceof
                                    Date
                                ) {
                                    setRegisterForm({
                                        ...registerForm,
                                        data: e.value,
                                    });
                                }
                            }}
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-8">
                        <label
                            className="block mb-2"
                            htmlFor="uc-aula"
                        >
                            Unidade Curricular
                        </label>

                        <Dropdown
                            id="uc-aula"
                            value={
                                registerForm.unidadeCurricular
                            }
                            options={[
                                {
                                    label:
                                        "Engenharia de Software",
                                    value:
                                        "Engenharia de Software",
                                },
                                {
                                    label: "Bases de Dados",
                                    value: "Bases de Dados",
                                },
                                {
                                    label:
                                        "Programação Web",
                                    value:
                                        "Programação Web",
                                },
                                {
                                    label:
                                        "Inteligência Artificial",
                                    value:
                                        "Inteligência Artificial",
                                },
                            ]}
                            onChange={(e) =>
                                setRegisterForm({
                                    ...registerForm,
                                    unidadeCurricular:
                                        e.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            htmlFor="turma-aula"
                        >
                            Turma
                        </label>

                        <Dropdown
                            id="turma-aula"
                            value={registerForm.turma}
                            options={turmasOptions.filter(
                                (item) =>
                                    item.value !== "Todas"
                            )}
                            onChange={(e) =>
                                setRegisterForm({
                                    ...registerForm,
                                    turma: e.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            htmlFor="tema-aula"
                        >
                            Unidade Temática
                        </label>

                        <InputText
                            id="tema-aula"
                            value={
                                registerForm.unidadeTematica
                            }
                            onChange={(e) =>
                                setRegisterForm({
                                    ...registerForm,
                                    unidadeTematica:
                                        e.target.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="col-12">
                        <label
                            className="block mb-2"
                            htmlFor="conteudo-aula"
                        >
                            Conteúdo Leccionado
                        </label>

                        <InputTextarea
                            id="conteudo-aula"
                            value={registerForm.conteudo}
                            onChange={(e) =>
                                setRegisterForm({
                                    ...registerForm,
                                    conteudo:
                                        e.target.value,
                                })
                            }
                            rows={4}
                            className="w-full"
                            placeholder="Descreva o conteúdo efectivamente leccionado..."
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            htmlFor="inicio"
                        >
                            Hora de início
                        </label>

                        <InputText
                            id="inicio"
                            value={registerForm.inicio}
                            onChange={(e) =>
                                setRegisterForm({
                                    ...registerForm,
                                    inicio:
                                        e.target.value,
                                })
                            }
                            className="w-full"
                            placeholder="08:00"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            className="block mb-2"
                            htmlFor="fim"
                        >
                            Hora de fim
                        </label>

                        <InputText
                            id="fim"
                            value={registerForm.fim}
                            onChange={(e) =>
                                setRegisterForm({
                                    ...registerForm,
                                    fim: e.target.value,
                                })
                            }
                            className="w-full"
                            placeholder="10:00"
                        />
                    </div>

                    <div className="col-12">
                        <label
                            className="block mb-2"
                            htmlFor="observacoes"
                        >
                            Observações
                        </label>

                        <InputTextarea
                            id="observacoes"
                            value={
                                registerForm.observacoes
                            }
                            onChange={(e) =>
                                setRegisterForm({
                                    ...registerForm,
                                    observacoes:
                                        e.target.value,
                                })
                            }
                            rows={3}
                            className="w-full"
                            placeholder="Observações sobre a aula..."
                        />
                    </div>

                    <div className="col-12">
                        <div
                            style={{
                                background:
                                    COLORS.orangeLight,
                                border: `1px solid #FCD34D`,
                                borderRadius: 9,
                                padding: 12,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: 9,
                                }}
                            >
                                <AlertTriangle
                                    size={18}
                                    color={
                                        COLORS.orange
                                    }
                                />

                                <div>
                                    <strong
                                        style={{
                                            color:
                                                COLORS.dark,
                                            fontSize:
                                                "0.8rem",
                                        }}
                                    >
                                        Aula não realizada?
                                    </strong>

                                    <InputTextarea
                                        value={
                                            registerForm.motivo
                                        }
                                        onChange={(e) =>
                                            setRegisterForm({
                                                ...registerForm,
                                                motivo:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        rows={2}
                                        className="w-full"
                                        style={{
                                            marginTop: 8,
                                        }}
                                        placeholder="Informe a justificação do cancelamento ou da não realização..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "flex-end",
                        gap: 8,
                        marginTop: 12,
                    }}
                >
                    <Button
                        label="Cancelar"
                        outlined
                        severity="secondary"
                        onClick={() =>
                            setRegisterDialog(false)
                        }
                    />

                    <Button
                        label="Registar Aula"
                        icon={<Send size={16} />}
                        onClick={handleSaveClass}
                    />
                </div>
            </Dialog>

            {/* =====================================================
                DIALOG - DETALHE DA AULA
            ====================================================== */}

            <Dialog
                header="Detalhes da Aula"
                visible={!!selectedAula}
                onHide={() =>
                    setSelectedAula(null)
                }
                modal
                style={{
                    width: "700px",
                    maxWidth: "95vw",
                }}
            >
                {selectedAula && (
                    <>
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                gap: 15,
                                alignItems:
                                    "flex-start",
                            }}
                        >
                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                        color:
                                            COLORS.dark,
                                    }}
                                >
                                    {
                                        selectedAula.unidadeCurricular
                                    }
                                </h3>

                                <p
                                    style={{
                                        margin:
                                            "5px 0 0",
                                        color:
                                            COLORS.muted,
                                        fontSize:
                                            "0.8rem",
                                    }}
                                >
                                    {
                                        selectedAula.codigoUC
                                    }{" "}
                                    •{" "}
                                    {
                                        selectedAula.turma
                                    }{" "}
                                    •{" "}
                                    {
                                        selectedAula.horario
                                    }
                                </p>
                            </div>

                            <Tag
                                value={
                                    selectedAula.estado
                                }
                                // severity={statusSeverity(
                                //     selectedAula.estado
                                // )}
                            />
                        </div>

                        <Divider />

                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <small
                                    style={{
                                        color:
                                            COLORS.muted,
                                    }}
                                >
                                    Data
                                </small>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop: 4,
                                    }}
                                >
                                    {formatDate(
                                        selectedAula.data
                                    )}
                                </strong>
                            </div>

                            <div className="col-12 md:col-4">
                                <small
                                    style={{
                                        color:
                                            COLORS.muted,
                                    }}
                                >
                                    Docente
                                </small>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop: 4,
                                    }}
                                >
                                    {
                                        selectedAula.docente
                                    }
                                </strong>
                            </div>

                            <div className="col-12 md:col-4">
                                <small
                                    style={{
                                        color:
                                            COLORS.muted,
                                    }}
                                >
                                    Unidade Temática
                                </small>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop: 4,
                                    }}
                                >
                                    {
                                        selectedAula.unidadeTematica
                                    }
                                </strong>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: 12,
                                background:
                                    COLORS.background,
                                borderRadius: 10,
                                padding: 14,
                            }}
                        >
                            <small
                                style={{
                                    color:
                                        COLORS.muted,
                                }}
                            >
                                Conteúdo previsto
                            </small>

                            <div
                                style={{
                                    marginTop: 5,
                                    color:
                                        COLORS.dark,
                                    fontSize:
                                        "0.85rem",
                                }}
                            >
                                {
                                    selectedAula.conteudoPrevisto
                                }
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: 10,
                                background:
                                    COLORS.greenLight,
                                borderRadius: 10,
                                padding: 14,
                            }}
                        >
                            <small
                                style={{
                                    color:
                                        COLORS.green,
                                }}
                            >
                                Conteúdo leccionado
                            </small>

                            <div
                                style={{
                                    marginTop: 5,
                                    color:
                                        COLORS.dark,
                                    fontSize:
                                        "0.85rem",
                                }}
                            >
                                {selectedAula
                                    .conteudoLeccionado ||
                                    "Ainda não registado."}
                            </div>
                        </div>

                        {selectedAula.observacoes && (
                            <div
                                style={{
                                    marginTop: 10,
                                    background:
                                        COLORS.orangeLight,
                                    borderRadius: 10,
                                    padding: 14,
                                }}
                            >
                                <small
                                    style={{
                                        color:
                                            COLORS.orange,
                                    }}
                                >
                                    Observações
                                </small>

                                <div
                                    style={{
                                        marginTop: 5,
                                        color:
                                            COLORS.dark,
                                        fontSize:
                                            "0.85rem",
                                    }}
                                >
                                    {
                                        selectedAula.observacoes
                                    }
                                </div>
                            </div>
                        )}

                        {selectedAula.motivo && (
                            <div
                                style={{
                                    marginTop: 10,
                                    background:
                                        COLORS.redLight,
                                    borderRadius: 10,
                                    padding: 14,
                                }}
                            >
                                <small
                                    style={{
                                        color:
                                            COLORS.red,
                                    }}
                                >
                                    Justificação
                                </small>

                                <div
                                    style={{
                                        marginTop: 5,
                                        color:
                                            COLORS.dark,
                                        fontSize:
                                            "0.85rem",
                                    }}
                                >
                                    {
                                        selectedAula.motivo
                                    }
                                </div>
                            </div>
                        )}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                gap: 8,
                                marginTop: 18,
                            }}
                        >
                            <Button
                                label="Histórico"
                                icon={
                                    <History
                                        size={15}
                                    />
                                }
                                outlined
                                severity="secondary"
                                onClick={() => {
                                    setSelectedHistoryAula(
                                        selectedAula
                                    );
                                    setHistoryDialog(true);
                                }}
                            />

                            <Button
                                label="Editar"
                                icon={
                                    <Pencil
                                        size={15}
                                    />
                                }
                                outlined
                            />
                        </div>
                    </>
                )}
            </Dialog>

            {/* =====================================================
                DIALOG - HISTÓRICO
            ====================================================== */}

            <Dialog
                header="Histórico da Aula"
                visible={historyDialog}
                onHide={() =>
                    setHistoryDialog(false)
                }
                modal
                style={{
                    width: "800px",
                    maxWidth: "95vw",
                }}
            >
                {selectedHistoryAula && (
                    <div
                        style={{
                            background:
                                COLORS.background,
                            borderRadius: 10,
                            padding: 13,
                            marginBottom: 15,
                        }}
                    >
                        <strong
                            style={{
                                color:
                                    COLORS.dark,
                            }}
                        >
                            {
                                selectedHistoryAula.unidadeCurricular
                            }
                        </strong>

                        <div
                            style={{
                                color:
                                    COLORS.muted,
                                fontSize:
                                    "0.76rem",
                                marginTop: 4,
                            }}
                        >
                            {
                                selectedHistoryAula.codigoUC
                            }{" "}
                            •{" "}
                            {
                                selectedHistoryAula.turma
                            }{" "}
                            •{" "}
                            {
                                selectedHistoryAula.horario
                            }
                        </div>
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        flexDirection:
                            "column",
                        gap: 0,
                    }}
                >
                    {historico.map(
                        (item, index) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        alignItems:
                                            "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius:
                                                "50%",
                                            background:
                                                COLORS.primaryLight,
                                            color:
                                                COLORS.primary,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                        }}
                                    >
                                        <CircleDot
                                            size={15}
                                        />
                                    </div>

                                    {index <
                                        historico.length -
                                            1 && (
                                        <div
                                            style={{
                                                width: 1,
                                                background:
                                                    COLORS.border,
                                                flex: 1,
                                                minHeight:
                                                    50,
                                            }}
                                        />
                                    )}
                                </div>

                                <div
                                    style={{
                                        paddingBottom:
                                            18,
                                    }}
                                >
                                    <strong
                                        style={{
                                            color:
                                                COLORS.dark,
                                            fontSize:
                                                "0.84rem",
                                        }}
                                    >
                                        {item.acao}
                                    </strong>

                                    <div
                                        style={{
                                            color:
                                                COLORS.muted,
                                            fontSize:
                                                "0.75rem",
                                            marginTop:
                                                4,
                                        }}
                                    >
                                        {
                                            item.utilizador
                                        }{" "}
                                        •{" "}
                                        {
                                            item.perfil
                                        }{" "}
                                        •{" "}
                                        {formatDateTime(
                                            item.data
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            color:
                                                COLORS.text,
                                            fontSize:
                                                "0.78rem",
                                            marginTop:
                                                6,
                                        }}
                                    >
                                        {
                                            item.observacao
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </Dialog>
        </div>
    );
}