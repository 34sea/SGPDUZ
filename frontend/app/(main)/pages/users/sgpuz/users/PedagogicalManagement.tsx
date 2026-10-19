"use client";

import React, { useMemo, useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";

import {
    BookOpen,
    GraduationCap,
    Users,
    CalendarDays,
    ClipboardList,
    Clock3,
    CheckCircle2,
    AlertCircle,
    Plus,
    Pencil,
    Eye,
    Layers3,
    School,
    UserRound,
    ChevronRight,
    FileText,
    RefreshCw,
} from "lucide-react";

// import "primereact/resources/themes/lara-light-blue/theme.css";
// import "primereact/resources/primereact.min.css";
// import "primeflex/primeflex.css";

interface UnidadeCurricular {
    id: number;
    codigo: string;
    nome: string;
    curso: string;
    cargaHoraria: number;
    semestre: string;
    docente: string;
    turmas: number;
    estado: "Activa" | "Inactiva";
}

interface Turma {
    id: number;
    codigo: string;
    curso: string;
    anoLectivo: string;
    semestre: string;
    chefe: string;
    subchefe: string;
    estudantes: number;
    unidadesCurriculares: number;
}

interface UnidadeTematica {
    id: number;
    numero: number;
    unidade: string;
    conteudo: string;
    descricao: string;
    cargaHoraria: number;
    tipo: "Teórica" | "Prática" | "Laboratorial" | "Visita de estudo";
}

interface Dosificacao {
    id: number;
    semana: number;
    data: Date;
    conteudo: string;
    tipo: "Teórica" | "Prática" | "Laboratorial" | "Visita de estudo";
    horas: number;
    estado: "Pendente" | "Confirmada" | "Alterada";
    observacao?: string;
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

const unidadesIniciais: UnidadeCurricular[] = [
    {
        id: 1,
        codigo: "INF301",
        nome: "Engenharia de Software",
        curso: "Engenharia Informática",
        cargaHoraria: 64,
        semestre: "1.º Semestre",
        docente: "Jane Smith",
        turmas: 2,
        estado: "Activa",
    },
    {
        id: 2,
        codigo: "INF305",
        nome: "Bases de Dados",
        curso: "Engenharia Informática",
        cargaHoraria: 64,
        semestre: "1.º Semestre",
        docente: "John Doe",
        turmas: 3,
        estado: "Activa",
    },
    {
        id: 3,
        codigo: "INF402",
        nome: "Inteligência Artificial",
        curso: "Engenharia Informática",
        cargaHoraria: 72,
        semestre: "2.º Semestre",
        docente: "Alex Johnson",
        turmas: 2,
        estado: "Activa",
    },
    {
        id: 4,
        codigo: "INF410",
        nome: "Desenvolvimento Web",
        curso: "Engenharia Informática",
        cargaHoraria: 64,
        semestre: "2.º Semestre",
        docente: "Emily Brown",
        turmas: 2,
        estado: "Activa",
    },
];

const turmasIniciais: Turma[] = [
    {
        id: 1,
        codigo: "EI31A",
        curso: "Engenharia Informática",
        anoLectivo: "2026/2027",
        semestre: "1.º Semestre",
        chefe: "Michael Wilson",
        subchefe: "Sarah Davis",
        estudantes: 34,
        unidadesCurriculares: 6,
    },
    {
        id: 2,
        codigo: "EI31B",
        curso: "Engenharia Informática",
        anoLectivo: "2026/2027",
        semestre: "1.º Semestre",
        chefe: "Daniel Miller",
        subchefe: "Olivia Taylor",
        estudantes: 31,
        unidadesCurriculares: 6,
    },
    {
        id: 3,
        codigo: "EI41A",
        curso: "Engenharia Informática",
        anoLectivo: "2026/2027",
        semestre: "2.º Semestre",
        chefe: "James Anderson",
        subchefe: "Sophia Thomas",
        estudantes: 29,
        unidadesCurriculares: 7,
    },
];

const unidadesTematicasIniciais: UnidadeTematica[] = [
    {
        id: 1,
        numero: 1,
        unidade: "Introdução à Engenharia de Software",
        conteudo: "Conceitos fundamentais e evolução da engenharia de software",
        descricao: "Apresentação dos fundamentos, processos e áreas da engenharia de software.",
        cargaHoraria: 8,
        tipo: "Teórica",
    },
    {
        id: 2,
        numero: 2,
        unidade: "Processos de Desenvolvimento",
        conteudo: "Modelos de ciclo de vida e metodologias",
        descricao: "Estudo dos principais modelos e metodologias utilizadas no desenvolvimento.",
        cargaHoraria: 12,
        tipo: "Teórica",
    },
    {
        id: 3,
        numero: 3,
        unidade: "Levantamento de Requisitos",
        conteudo: "Técnicas de elicitação e documentação de requisitos",
        descricao: "Aplicação prática das técnicas de levantamento de requisitos.",
        cargaHoraria: 12,
        tipo: "Prática",
    },
    {
        id: 4,
        numero: 4,
        unidade: "Modelação de Sistemas",
        conteudo: "UML e diagramas de sistemas",
        descricao: "Construção e interpretação de diagramas UML.",
        cargaHoraria: 16,
        tipo: "Laboratorial",
    },
];

const dosificacaoInicial: Dosificacao[] = [
    {
        id: 1,
        semana: 1,
        data: new Date(2026, 1, 2),
        conteudo: "Apresentação da unidade curricular e introdução à Engenharia de Software",
        tipo: "Teórica",
        horas: 4,
        estado: "Confirmada",
    },
    {
        id: 2,
        semana: 2,
        data: new Date(2026, 1, 9),
        conteudo: "Conceitos fundamentais de Engenharia de Software",
        tipo: "Teórica",
        horas: 4,
        estado: "Confirmada",
    },
    {
        id: 3,
        semana: 3,
        data: new Date(2026, 1, 16),
        conteudo: "Processos e modelos de desenvolvimento",
        tipo: "Teórica",
        horas: 4,
        estado: "Pendente",
    },
    {
        id: 4,
        semana: 4,
        data: new Date(2026, 1, 23),
        conteudo: "Metodologias ágeis e tradicionais",
        tipo: "Prática",
        horas: 4,
        estado: "Pendente",
    },
    {
        id: 5,
        semana: 5,
        data: new Date(2026, 2, 2),
        conteudo: "Levantamento e análise de requisitos",
        tipo: "Teórica",
        horas: 4,
        estado: "Alterada",
        observacao: "Conteúdo ajustado devido ao calendário académico.",
    },
    {
        id: 6,
        semana: 6,
        data: new Date(2026, 2, 9),
        conteudo: "Técnicas de elicitação de requisitos",
        tipo: "Laboratorial",
        horas: 4,
        estado: "Pendente",
    },
];

const anoLectivoOptions = [
    { label: "2026/2027", value: "2026/2027" },
    { label: "2025/2026", value: "2025/2026" },
];

const semestreOptions = [
    { label: "1.º Semestre", value: "1.º Semestre" },
    { label: "2.º Semestre", value: "2.º Semestre" },
];

const tipoAulaOptions = [
    { label: "Teórica", value: "Teórica" },
    { label: "Prática", value: "Prática" },
    { label: "Laboratorial", value: "Laboratorial" },
    { label: "Visita de estudo", value: "Visita de estudo" },
];

const tipoSeverity = (
    tipo: string
): "info" | "success" | "warning" | "secondary" => {
    if (tipo === "Teórica") return "info";
    if (tipo === "Prática") return "success";
    if (tipo === "Laboratorial") return "warning";
    return "secondary";
};

const estadoSeverity = (
    estado: string
): "success" | "warning" | "danger" | "info" => {
    if (estado === "Confirmada" || estado === "Activa") return "success";
    if (estado === "Alterada") return "warning";
    if (estado === "Pendente") return "info";
    return "danger";
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-MZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function PedagogicalManagement() {
    const [activeModule, setActiveModule] = useState<
        "estrutura" | "plano" | "dosificacao"
    >("estrutura");

    const [activeStructureTab, setActiveStructureTab] = useState<
        "unidades" | "turmas"
    >("unidades");

    const [unidades, setUnidades] =
        useState<UnidadeCurricular[]>(unidadesIniciais);

    const [turmas] = useState<Turma[]>(turmasIniciais);

    const [unidadesTematicas] = useState<UnidadeTematica[]>(
        unidadesTematicasIniciais
    );

    const [dosificacao, setDosificacao] =
        useState<Dosificacao[]>(dosificacaoInicial);

    const [selectedYear, setSelectedYear] = useState("2026/2027");
    const [selectedSemester, setSelectedSemester] =
        useState("1.º Semestre");

    const [search, setSearch] = useState("");

    const [unitDialog, setUnitDialog] = useState(false);
    const [unitForm, setUnitForm] = useState({
        codigo: "",
        nome: "",
        curso: "Engenharia Informática",
        cargaHoraria: "",
        semestre: "1.º Semestre",
        docente: "",
    });

    const [topicDialog, setTopicDialog] = useState(false);
    const [topicForm, setTopicForm] = useState({
        numero: "",
        unidade: "",
        conteudo: "",
        descricao: "",
        cargaHoraria: "",
        tipo: "Teórica",
    });

    const filteredUnidades = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return unidades;

        return unidades.filter(
            (item) =>
                item.nome.toLowerCase().includes(value) ||
                item.codigo.toLowerCase().includes(value) ||
                item.docente.toLowerCase().includes(value)
        );
    }, [search, unidades]);

    const totalCargaHoraria = useMemo(
        () =>
            unidadesTematicas.reduce(
                (total, item) => total + item.cargaHoraria,
                0
            ),
        [unidadesTematicas]
    );

    const confirmedCount = dosificacao.filter(
        (item) => item.estado === "Confirmada"
    ).length;

    const progress = Math.round(
        (confirmedCount / Math.max(dosificacao.length, 1)) * 100
    );

    const handleAddUnit = () => {
        if (!unitForm.codigo || !unitForm.nome || !unitForm.docente) return;

        const novaUnidade: UnidadeCurricular = {
            id: Date.now(),
            codigo: unitForm.codigo,
            nome: unitForm.nome,
            curso: unitForm.curso,
            cargaHoraria: Number(unitForm.cargaHoraria) || 0,
            semestre: unitForm.semestre,
            docente: unitForm.docente,
            turmas: 0,
            estado: "Activa",
        };

        setUnidades((current) => [...current, novaUnidade]);

        setUnitForm({
            codigo: "",
            nome: "",
            curso: "Engenharia Informática",
            cargaHoraria: "",
            semestre: "1.º Semestre",
            docente: "",
        });

        setUnitDialog(false);
    };

    const handleAddTopic = () => {
        if (!topicForm.unidade || !topicForm.conteudo) return;

        setTopicDialog(false);
    };

    const handleConfirmDosificacao = (id: number) => {
        setDosificacao((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          estado: "Confirmada",
                      }
                    : item
            )
        );
    };

    const unidadeCodigoBody = (row: UnidadeCurricular) => (
        <div>
            <span
                style={{
                    fontWeight: 700,
                    color: COLORS.primary,
                }}
            >
                {row.codigo}
            </span>

            <div
                style={{
                    fontSize: "0.75rem",
                    color: COLORS.muted,
                    marginTop: 3,
                }}
            >
                {row.curso}
            </div>
        </div>
    );

    const unidadeNomeBody = (row: UnidadeCurricular) => (
        <div>
            <div
                style={{
                    fontWeight: 600,
                    color: COLORS.dark,
                }}
            >
                {row.nome}
            </div>

            <div
                style={{
                    marginTop: 5,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                }}
            >
                <Clock3 size={13} color={COLORS.muted} />

                <span
                    style={{
                        fontSize: "0.75rem",
                        color: COLORS.muted,
                    }}
                >
                    {row.cargaHoraria} horas
                </span>
            </div>
        </div>
    );

    const docenteBody = (row: UnidadeCurricular) => (
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
                    fontWeight: 700,
                    fontSize: 12,
                }}
            >
                {row.docente
                    .split(" ")
                    .map((item) => item[0])
                    .join("")
                    .slice(0, 2)}
            </div>

            <span>{row.docente}</span>
        </div>
    );

    const turmaBody = (row: Turma) => (
        <div>
            <div
                style={{
                    fontWeight: 700,
                    color: COLORS.primary,
                }}
            >
                {row.codigo}
            </div>

            <div
                style={{
                    fontSize: "0.75rem",
                    color: COLORS.muted,
                    marginTop: 3,
                }}
            >
                {row.curso}
            </div>
        </div>
    );

    const dosificacaoDataBody = (row: Dosificacao) =>
        formatDate(row.data);

    const dosificacaoTipoBody = (row: Dosificacao) => (
        <Tag
            value={row.tipo}
            // severity={tipoSeverity(row.tipo)}
        />
    );

    const dosificacaoEstadoBody = (row: Dosificacao) => (
        <Tag
            value={row.estado}
            severity={estadoSeverity(row.estado)}
        />
    );

    const dosificacaoActionBody = (row: Dosificacao) => (
        <div style={{ display: "flex", gap: 5 }}>
            <Button
                icon={<Eye size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Consultar"
            />

            <Button
                icon={<Pencil size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Editar"
            />

            {row.estado !== "Confirmada" && (
                <Button
                    icon={<CheckCircle2 size={15} />}
                    text
                    rounded
                    severity="success"
                    tooltip="Confirmar"
                    onClick={() =>
                        handleConfirmDosificacao(row.id)
                    }
                />
            )}
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
                background: COLORS.background,
                minHeight: "100vh",
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
                    marginBottom: 22,
                }}
            >
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                        }}
                    >
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: COLORS.primaryLight,
                                color: COLORS.primary,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <GraduationCap size={23} />
                        </div>

                        <div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "1.45rem",
                                    color: COLORS.dark,
                                    fontWeight: 750,
                                }}
                            >
                                Gestão Pedagógica
                            </h1>

                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: COLORS.muted,
                                    fontSize: "0.9rem",
                                }}
                            >
                                Estrutura académica, plano analítico e
                                dosificação semanal
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                    }}
                >
                    <Button
                        label="Actualizar"
                        icon={<RefreshCw size={16} />}
                        outlined
                        severity="secondary"
                    />

                    <Button
                        label={
                            activeModule === "estrutura"
                                ? "Nova Unidade Curricular"
                                : activeModule === "plano"
                                ? "Nova Unidade Temática"
                                : "Gerar Dosificação"
                        }
                        icon={<Plus size={17} />}
                        onClick={() => {
                            if (activeModule === "estrutura") {
                                setUnitDialog(true);
                            } else if (activeModule === "plano") {
                                setTopicDialog(true);
                            }
                        }}
                    />
                </div>
            </div>

            {/* =====================================================
                CONTEXTO ACADÉMICO
            ====================================================== */}

            <Card
                style={{
                    marginBottom: 18,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 20,
                        flexWrap: "wrap",
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
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: COLORS.greenLight,
                                color: COLORS.green,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CalendarDays size={19} />
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: COLORS.muted,
                                    marginBottom: 3,
                                }}
                            >
                                Contexto académico activo
                            </div>

                            <strong
                                style={{
                                    color: COLORS.dark,
                                    fontSize: "0.95rem",
                                }}
                            >
                                Ano Lectivo {selectedYear}
                            </strong>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <Dropdown
                            value={selectedYear}
                            options={anoLectivoOptions}
                            onChange={(e) =>
                                setSelectedYear(e.value)
                            }
                            style={{ minWidth: 150 }}
                        />

                        <Dropdown
                            value={selectedSemester}
                            options={semestreOptions}
                            onChange={(e) =>
                                setSelectedSemester(e.value)
                            }
                            style={{ minWidth: 155 }}
                        />

                        <Tag
                            value="Ano lectivo activo"
                            severity="success"
                            icon="pi pi-check"
                        />
                    </div>
                </div>
            </Card>

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
                            padding: 18,
                            height: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                    }}
                                >
                                    Unidades Curriculares
                                </span>

                                <div
                                    style={{
                                        fontSize: "1.65rem",
                                        fontWeight: 750,
                                        color: COLORS.dark,
                                        marginTop: 7,
                                    }}
                                >
                                    {unidades.length}
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 10,
                                    background:
                                        COLORS.primaryLight,
                                    color: COLORS.primary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <BookOpen size={21} />
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
                            padding: 18,
                            height: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                    }}
                                >
                                    Turmas
                                </span>

                                <div
                                    style={{
                                        fontSize: "1.65rem",
                                        fontWeight: 750,
                                        color: COLORS.dark,
                                        marginTop: 7,
                                    }}
                                >
                                    {turmas.length}
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 10,
                                    background: COLORS.purpleLight,
                                    color: COLORS.purple,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Users size={21} />
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
                            padding: 18,
                            height: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                    }}
                                >
                                    Plano Analítico
                                </span>

                                <div
                                    style={{
                                        fontSize: "1.65rem",
                                        fontWeight: 750,
                                        color: COLORS.dark,
                                        marginTop: 7,
                                    }}
                                >
                                    {unidadesTematicas.length}
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 10,
                                    background: COLORS.orangeLight,
                                    color: COLORS.orange,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <ClipboardList size={21} />
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
                            padding: 18,
                            height: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        fontSize: "0.78rem",
                                        color: COLORS.muted,
                                    }}
                                >
                                    Dosificação confirmada
                                </span>

                                <div
                                    style={{
                                        fontSize: "1.65rem",
                                        fontWeight: 750,
                                        color: COLORS.dark,
                                        marginTop: 7,
                                    }}
                                >
                                    {progress}%
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 10,
                                    background: COLORS.greenLight,
                                    color: COLORS.green,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CheckCircle2 size={21} />
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
                    borderRadius: 14,
                    padding: 8,
                    display: "flex",
                    gap: 8,
                    marginBottom: 18,
                    overflowX: "auto",
                }}
            >
                <button
                    onClick={() => setActiveModule("estrutura")}
                    style={{
                        border: "none",
                        background:
                            activeModule === "estrutura"
                                ? COLORS.primary
                                : "transparent",
                        color:
                            activeModule === "estrutura"
                                ? COLORS.white
                                : COLORS.text,
                        borderRadius: 10,
                        padding: "12px 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    <School size={17} />
                    Unidades Curriculares e Turmas
                </button>

                <button
                    onClick={() => setActiveModule("plano")}
                    style={{
                        border: "none",
                        background:
                            activeModule === "plano"
                                ? COLORS.primary
                                : "transparent",
                        color:
                            activeModule === "plano"
                                ? COLORS.white
                                : COLORS.text,
                        borderRadius: 10,
                        padding: "12px 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    <Layers3 size={17} />
                    Plano Analítico
                </button>

                <button
                    onClick={() => setActiveModule("dosificacao")}
                    style={{
                        border: "none",
                        background:
                            activeModule === "dosificacao"
                                ? COLORS.primary
                                : "transparent",
                        color:
                            activeModule === "dosificacao"
                                ? COLORS.white
                                : COLORS.text,
                        borderRadius: 10,
                        padding: "12px 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    <CalendarDays size={17} />
                    Dosificação Semanal
                </button>
            </div>

            {/* =====================================================
                UNIDADES CURRICULARES E TURMAS
            ====================================================== */}

            {activeModule === "estrutura" && (
                <Card
                    style={{
                        border: `1px solid ${COLORS.border}`,
                        boxShadow:
                            "0 2px 8px rgba(15,23,42,0.04)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 15,
                            marginBottom: 18,
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "1.15rem",
                                    color: COLORS.dark,
                                }}
                            >
                                Estrutura académica
                            </h2>

                            <p
                                style={{
                                    margin: "5px 0 0",
                                    color: COLORS.muted,
                                    fontSize: "0.85rem",
                                }}
                            >
                                Gestão das unidades curriculares, turmas
                                e atribuição de docentes.
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                background: COLORS.background,
                                padding: 4,
                                borderRadius: 9,
                            }}
                        >
                            <Button
                                label="Unidades Curriculares"
                                text={
                                    activeStructureTab !==
                                    "unidades"
                                }
                                onClick={() =>
                                    setActiveStructureTab(
                                        "unidades"
                                    )
                                }
                                size="small"
                            />

                            <Button
                                label="Turmas"
                                text={
                                    activeStructureTab !== "turmas"
                                }
                                onClick={() =>
                                    setActiveStructureTab("turmas")
                                }
                                size="small"
                            />
                        </div>
                    </div>

                    {activeStructureTab === "unidades" && (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
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
                                        placeholder="Pesquisar unidade curricular..."
                                        style={{
                                            minWidth: 320,
                                        }}
                                    />
                                </span>

                                <Button
                                    label="Nova Unidade Curricular"
                                    icon={<Plus size={16} />}
                                    onClick={() =>
                                        setUnitDialog(true)
                                    }
                                    size="small"
                                />
                            </div>

                            <DataTable
                                value={filteredUnidades}
                                paginator
                                rows={6}
                                responsiveLayout="scroll"
                                emptyMessage="Nenhuma unidade curricular encontrada."
                            >
                                <Column
                                    header="Código / Curso"
                                    body={unidadeCodigoBody}
                                    style={{
                                        minWidth: "180px",
                                    }}
                                />

                                <Column
                                    header="Unidade Curricular"
                                    body={unidadeNomeBody}
                                    style={{
                                        minWidth: "260px",
                                    }}
                                />

                                <Column
                                    field="semestre"
                                    header="Semestre"
                                />

                                <Column
                                    header="Docente responsável"
                                    body={docenteBody}
                                    style={{
                                        minWidth: "190px",
                                    }}
                                />

                                <Column
                                    field="turmas"
                                    header="Turmas"
                                    body={(row) => (
                                        <Tag
                                            value={`${row.turmas} turmas`}
                                            // severity="secondary"
                                        />
                                    )}
                                />

                                <Column
                                    header="Estado"
                                    body={(row) => (
                                        <Tag
                                            value={row.estado}
                                            severity="success"
                                        />
                                    )}
                                />

                                <Column
                                    header=""
                                    body={() => (
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 4,
                                            }}
                                        >
                                            <Button
                                                icon={
                                                    <Eye
                                                        size={15}
                                                    />
                                                }
                                                text
                                                rounded
                                                severity="secondary"
                                            />

                                            <Button
                                                icon={
                                                    <Pencil
                                                        size={15}
                                                    />
                                                }
                                                text
                                                rounded
                                                severity="secondary"
                                            />
                                        </div>
                                    )}
                                />
                            </DataTable>
                        </>
                    )}

                    {activeStructureTab === "turmas" && (
                        <DataTable
                            value={turmas}
                            paginator
                            rows={6}
                            responsiveLayout="scroll"
                            emptyMessage="Nenhuma turma encontrada."
                        >
                            <Column
                                header="Turma"
                                body={turmaBody}
                                style={{
                                    minWidth: "200px",
                                }}
                            />

                            <Column
                                field="anoLectivo"
                                header="Ano Lectivo"
                            />

                            <Column
                                field="semestre"
                                header="Semestre"
                            />

                            <Column
                                header="Chefe de Turma"
                                body={(row) => (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 7,
                                        }}
                                    >
                                        <UserRound
                                            size={15}
                                            color={
                                                COLORS.primary
                                            }
                                        />
                                        {row.chefe}
                                    </div>
                                )}
                            />

                            <Column
                                header="Subchefe"
                                field="subchefe"
                            />

                            <Column
                                header="Estudantes"
                                body={(row) => (
                                    <Tag
                                        value={`${row.estudantes}`}
                                        severity="info"
                                    />
                                )}
                            />

                            <Column
                                header="UC atribuídas"
                                body={(row) => (
                                    <Tag
                                        value={`${row.unidadesCurriculares}`}
                                        // severity="secondary"
                                    />
                                )}
                            />

                            <Column
                                header="Acções"
                                body={() => (
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 4,
                                        }}
                                    >
                                        <Button
                                            icon={
                                                <Eye size={15} />
                                            }
                                            text
                                            rounded
                                            severity="secondary"
                                        />

                                        <Button
                                            icon={
                                                <Pencil size={15} />
                                            }
                                            text
                                            rounded
                                            severity="secondary"
                                        />
                                    </div>
                                )}
                            />
                        </DataTable>
                    )}
                </Card>
            )}

            {/* =====================================================
                PLANO ANALÍTICO
            ====================================================== */}

            {activeModule === "plano" && (
                <>
                    <div className="grid">
                        <div className="col-12 xl:col-4">
                            <Card
                                style={{
                                    height: "100%",
                                    border: `1px solid ${COLORS.border}`,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        marginBottom: 18,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 10,
                                            background:
                                                COLORS.primaryLight,
                                            color:
                                                COLORS.primary,
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                        }}
                                    >
                                        <FileText size={20} />
                                    </div>

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
                                            Plano Analítico
                                        </h2>

                                        <span
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.78rem",
                                            }}
                                        >
                                            Configuração do plano
                                        </span>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background:
                                            COLORS.background,
                                        borderRadius: 10,
                                        padding: 14,
                                        marginBottom: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                "0.72rem",
                                            color:
                                                COLORS.muted,
                                        }}
                                    >
                                        Unidade Curricular
                                    </div>

                                    <strong
                                        style={{
                                            display: "block",
                                            marginTop: 4,
                                            color:
                                                COLORS.dark,
                                        }}
                                    >
                                        Engenharia de Software
                                    </strong>

                                    <div
                                        style={{
                                            marginTop: 8,
                                            display: "flex",
                                            gap: 8,
                                        }}
                                    >
                                        <Tag
                                            value="INF301"
                                            severity="info"
                                        />

                                        <Tag
                                            value={
                                                selectedSemester
                                            }
                                            // severity="secondary"
                                        />
                                    </div>
                                </div>

                                <div className="grid">
                                    <div className="col-6">
                                        <small
                                            style={{
                                                color:
                                                    COLORS.muted,
                                            }}
                                        >
                                            Docente
                                        </small>

                                        <div
                                            style={{
                                                fontWeight: 600,
                                                marginTop: 4,
                                            }}
                                        >
                                            Jane Smith
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <small
                                            style={{
                                                color:
                                                    COLORS.muted,
                                            }}
                                        >
                                            Ano Lectivo
                                        </small>

                                        <div
                                            style={{
                                                fontWeight: 600,
                                                marginTop: 4,
                                            }}
                                        >
                                            {selectedYear}
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        marginBottom: 10,
                                    }}
                                >
                                    <span
                                        style={{
                                            color:
                                                COLORS.muted,
                                        }}
                                    >
                                        Carga horária
                                    </span>

                                    <strong>
                                        {totalCargaHoraria} h
                                    </strong>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                    }}
                                >
                                    <span
                                        style={{
                                            color:
                                                COLORS.muted,
                                        }}
                                    >
                                        Unidades temáticas
                                    </span>

                                    <strong>
                                        {
                                            unidadesTematicas.length
                                        }
                                    </strong>
                                </div>

                                <Button
                                    label="Editar Plano Analítico"
                                    icon={<Pencil size={16} />}
                                    outlined
                                    style={{
                                        width: "100%",
                                        marginTop: 20,
                                    }}
                                />
                            </Card>
                        </div>

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
                                            "center",
                                        marginBottom: 15,
                                    }}
                                >
                                    <div>
                                        <h2
                                            style={{
                                                margin: 0,
                                                fontSize:
                                                    "1.1rem",
                                                color:
                                                    COLORS.dark,
                                            }}
                                        >
                                            Unidades Temáticas
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
                                            Conteúdos que compõem
                                            o plano analítico
                                        </p>
                                    </div>

                                    <Button
                                        label="Adicionar unidade"
                                        icon={
                                            <Plus size={15} />
                                        }
                                        size="small"
                                        onClick={() =>
                                            setTopicDialog(true)
                                        }
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection:
                                            "column",
                                        gap: 10,
                                    }}
                                >
                                    {unidadesTematicas.map(
                                        (item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    display:
                                                        "grid",
                                                    gridTemplateColumns:
                                                        "48px minmax(0,1fr) auto auto",
                                                    gap: 14,
                                                    alignItems:
                                                        "center",
                                                    border: `1px solid ${COLORS.border}`,
                                                    borderRadius: 10,
                                                    padding: 13,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 38,
                                                        height: 38,
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
                                                        fontWeight:
                                                            750,
                                                    }}
                                                >
                                                    {
                                                        item.numero
                                                    }
                                                </div>

                                                <div>
                                                    <strong
                                                        style={{
                                                            color:
                                                                COLORS.dark,
                                                            fontSize:
                                                                "0.9rem",
                                                        }}
                                                    >
                                                        {
                                                            item.unidade
                                                        }
                                                    </strong>

                                                    <div
                                                        style={{
                                                            color:
                                                                COLORS.muted,
                                                            fontSize:
                                                                "0.77rem",
                                                            marginTop:
                                                                4,
                                                        }}
                                                    >
                                                        {
                                                            item.conteudo
                                                        }
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    <Tag
                                                        value={
                                                            item.tipo
                                                        }
                                                        // severity={tipoSeverity(
                                                        //     item.tipo
                                                        // )}
                                                    />

                                                    <div
                                                        style={{
                                                            color:
                                                                COLORS.muted,
                                                            fontSize:
                                                                "0.72rem",
                                                            marginTop:
                                                                5,
                                                        }}
                                                    >
                                                        {
                                                            item.cargaHoraria
                                                        }{" "}
                                                        h
                                                    </div>
                                                </div>

                                                <Button
                                                    icon={
                                                        <Pencil
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    }
                                                    text
                                                    rounded
                                                    severity="secondary"
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}

            {/* =====================================================
                DOSIFICAÇÃO
            ====================================================== */}

            {activeModule === "dosificacao" && (
                <>
                    <div className="grid">
                        <div className="col-12 lg:col-8">
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
                                                fontSize:
                                                    "1.15rem",
                                                color:
                                                    COLORS.dark,
                                            }}
                                        >
                                            Dosificação Semanal
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
                                            Distribuição dos
                                            conteúdos ao longo das
                                            semanas do semestre.
                                        </p>
                                    </div>

                                    <Button
                                        label="Gerar automaticamente"
                                        icon={
                                            <RefreshCw
                                                size={16}
                                            />
                                        }
                                        size="small"
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
                                            Unidade Curricular
                                        </small>

                                        <strong
                                            style={{
                                                display:
                                                    "block",
                                                marginTop: 5,
                                                color:
                                                    COLORS.dark,
                                            }}
                                        >
                                            Engenharia de Software
                                        </strong>
                                    </div>

                                    <div className="col-12 md:col-3">
                                        <small
                                            style={{
                                                color:
                                                    COLORS.muted,
                                            }}
                                        >
                                            Semestre
                                        </small>

                                        <strong
                                            style={{
                                                display:
                                                    "block",
                                                marginTop: 5,
                                                color:
                                                    COLORS.dark,
                                            }}
                                        >
                                            {selectedSemester}
                                        </strong>
                                    </div>

                                    <div className="col-12 md:col-2">
                                        <small
                                            style={{
                                                color:
                                                    COLORS.muted,
                                            }}
                                        >
                                            Semanas
                                        </small>

                                        <strong
                                            style={{
                                                display:
                                                    "block",
                                                marginTop: 5,
                                                color:
                                                    COLORS.dark,
                                            }}
                                        >
                                            18
                                        </strong>
                                    </div>

                                    <div className="col-12 md:col-3">
                                        <small
                                            style={{
                                                color:
                                                    COLORS.muted,
                                            }}
                                        >
                                            Confirmadas
                                        </small>

                                        <strong
                                            style={{
                                                display:
                                                    "block",
                                                marginTop: 5,
                                                color:
                                                    COLORS.green,
                                            }}
                                        >
                                            {confirmedCount}/
                                            {
                                                dosificacao.length
                                            }
                                        </strong>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 lg:col-4">
                            <Card
                                style={{
                                    height: "100%",
                                    border: `1px solid ${COLORS.border}`,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        alignItems:
                                            "flex-start",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            background:
                                                COLORS.orangeLight,
                                            color:
                                                COLORS.orange,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <AlertCircle
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <strong
                                            style={{
                                                color:
                                                    COLORS.dark,
                                            }}
                                        >
                                            Geração automática
                                        </strong>

                                        <p
                                            style={{
                                                margin:
                                                    "6px 0 0",
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.78rem",
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            A distribuição considera
                                            o calendário académico,
                                            feriados, interrupções
                                            lectivas e semanas de
                                            avaliação.
                                        </p>
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
                        <DataTable
                            value={dosificacao}
                            paginator
                            rows={8}
                            responsiveLayout="scroll"
                            emptyMessage="Nenhuma dosificação encontrada."
                        >
                            <Column
                                field="semana"
                                header="Semana"
                                body={(row) => (
                                    <div
                                        style={{
                                            width: 38,
                                            height: 32,
                                            borderRadius: 8,
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
                                            fontWeight: 700,
                                        }}
                                    >
                                        {row.semana}
                                    </div>
                                )}
                            />

                            <Column
                                header="Data"
                                body={dosificacaoDataBody}
                            />

                            <Column
                                header="Conteúdo"
                                body={(row) => (
                                    <div>
                                        <strong
                                            style={{
                                                color:
                                                    COLORS.dark,
                                            }}
                                        >
                                            {row.conteudo}
                                        </strong>

                                        {row.observacao && (
                                            <div
                                                style={{
                                                    color:
                                                        COLORS.orange,
                                                    fontSize:
                                                        "0.75rem",
                                                    marginTop:
                                                        5,
                                                }}
                                            >
                                                {
                                                    row.observacao
                                                }
                                            </div>
                                        )}
                                    </div>
                                )}
                                style={{
                                    minWidth: "330px",
                                }}
                            />

                            <Column
                                header="Tipo"
                                body={dosificacaoTipoBody}
                            />

                            <Column
                                header="Horas"
                                body={(row) => (
                                    <span
                                        style={{
                                            fontWeight: 650,
                                        }}
                                    >
                                        {row.horas} h
                                    </span>
                                )}
                            />

                            <Column
                                header="Estado"
                                body={dosificacaoEstadoBody}
                            />

                            <Column
                                header="Acções"
                                body={dosificacaoActionBody}
                                style={{
                                    minWidth: "130px",
                                }}
                            />
                        </DataTable>
                    </Card>
                </>
            )}

            {/* =====================================================
                DIALOG - NOVA UNIDADE CURRICULAR
            ====================================================== */}

            <Dialog
                header="Nova Unidade Curricular"
                visible={unitDialog}
                onHide={() => setUnitDialog(false)}
                style={{ width: "620px", maxWidth: "95vw" }}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <label
                            htmlFor="codigo"
                            className="block mb-2"
                        >
                            Código
                        </label>

                        <InputText
                            id="codigo"
                            value={unitForm.codigo}
                            onChange={(e) =>
                                setUnitForm({
                                    ...unitForm,
                                    codigo: e.target.value,
                                })
                            }
                            className="w-full"
                            placeholder="Ex.: INF301"
                        />
                    </div>

                    <div className="col-12 md:col-8">
                        <label
                            htmlFor="nome"
                            className="block mb-2"
                        >
                            Nome da Unidade Curricular
                        </label>

                        <InputText
                            id="nome"
                            value={unitForm.nome}
                            onChange={(e) =>
                                setUnitForm({
                                    ...unitForm,
                                    nome: e.target.value,
                                })
                            }
                            className="w-full"
                            placeholder="Nome da unidade curricular"
                        />
                    </div>

                    <div className="col-12">
                        <label
                            htmlFor="curso"
                            className="block mb-2"
                        >
                            Curso
                        </label>

                        <InputText
                            id="curso"
                            value={unitForm.curso}
                            onChange={(e) =>
                                setUnitForm({
                                    ...unitForm,
                                    curso: e.target.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="col-12 md:col-4">
                        <label
                            htmlFor="carga"
                            className="block mb-2"
                        >
                            Carga Horária
                        </label>

                        <InputText
                            id="carga"
                            value={unitForm.cargaHoraria}
                            onChange={(e) =>
                                setUnitForm({
                                    ...unitForm,
                                    cargaHoraria:
                                        e.target.value,
                                })
                            }
                            className="w-full"
                            keyfilter="int"
                            placeholder="64"
                        />
                    </div>

                    <div className="col-12 md:col-8">
                        <label
                            htmlFor="semestre"
                            className="block mb-2"
                        >
                            Semestre
                        </label>

                        <Dropdown
                            id="semestre"
                            value={unitForm.semestre}
                            options={semestreOptions}
                            onChange={(e) =>
                                setUnitForm({
                                    ...unitForm,
                                    semestre: e.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="col-12">
                        <label
                            htmlFor="docente"
                            className="block mb-2"
                        >
                            Docente Responsável
                        </label>

                        <InputText
                            id="docente"
                            value={unitForm.docente}
                            onChange={(e) =>
                                setUnitForm({
                                    ...unitForm,
                                    docente: e.target.value,
                                })
                            }
                            className="w-full"
                            placeholder="Nome do docente"
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                        marginTop: 15,
                    }}
                >
                    <Button
                        label="Cancelar"
                        outlined
                        severity="secondary"
                        onClick={() => setUnitDialog(false)}
                    />

                    <Button
                        label="Guardar"
                        icon={<CheckCircle2 size={16} />}
                        onClick={handleAddUnit}
                    />
                </div>
            </Dialog>

            {/* =====================================================
                DIALOG - NOVA UNIDADE TEMÁTICA
            ====================================================== */}

            <Dialog
                header="Nova Unidade Temática"
                visible={topicDialog}
                onHide={() => setTopicDialog(false)}
                style={{ width: "700px", maxWidth: "95vw" }}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <label
                            htmlFor="numero"
                            className="block mb-2"
                        >
                            Número
                        </label>

                        <InputText
                            id="numero"
                            value={topicForm.numero}
                            onChange={(e) =>
                                setTopicForm({
                                    ...topicForm,
                                    numero: e.target.value,
                                })
                            }
                            className="w-full"
                            keyfilter="int"
                        />
                    </div>

                    <div className="col-12 md:col-9">
                        <label
                            htmlFor="unidade"
                            className="block mb-2"
                        >
                            Unidade Temática
                        </label>

                        <InputText
                            id="unidade"
                            value={topicForm.unidade}
                            onChange={(e) =>
                                setTopicForm({
                                    ...topicForm,
                                    unidade: e.target.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="col-12">
                        <label
                            htmlFor="conteudo"
                            className="block mb-2"
                        >
                            Conteúdo
                        </label>

                        <InputText
                            id="conteudo"
                            value={topicForm.conteudo}
                            onChange={(e) =>
                                setTopicForm({
                                    ...topicForm,
                                    conteudo: e.target.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="col-12">
                        <label
                            htmlFor="descricao"
                            className="block mb-2"
                        >
                            Descrição
                        </label>

                        <InputTextarea
                            id="descricao"
                            value={topicForm.descricao}
                            onChange={(e) =>
                                setTopicForm({
                                    ...topicForm,
                                    descricao: e.target.value,
                                })
                            }
                            className="w-full"
                            rows={3}
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            htmlFor="horas"
                            className="block mb-2"
                        >
                            Carga Horária
                        </label>

                        <InputText
                            id="horas"
                            value={topicForm.cargaHoraria}
                            onChange={(e) =>
                                setTopicForm({
                                    ...topicForm,
                                    cargaHoraria:
                                        e.target.value,
                                })
                            }
                            className="w-full"
                            keyfilter="int"
                        />
                    </div>

                    <div className="col-12 md:col-6">
                        <label
                            htmlFor="tipo"
                            className="block mb-2"
                        >
                            Tipo de Aula
                        </label>

                        <Dropdown
                            id="tipo"
                            value={topicForm.tipo}
                            options={tipoAulaOptions}
                            onChange={(e) =>
                                setTopicForm({
                                    ...topicForm,
                                    tipo: e.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                        marginTop: 15,
                    }}
                >
                    <Button
                        label="Cancelar"
                        outlined
                        severity="secondary"
                        onClick={() => setTopicDialog(false)}
                    />

                    <Button
                        label="Adicionar"
                        icon={<Plus size={16} />}
                        onClick={handleAddTopic}
                    />
                </div>
            </Dialog>
        </div>
    );
}