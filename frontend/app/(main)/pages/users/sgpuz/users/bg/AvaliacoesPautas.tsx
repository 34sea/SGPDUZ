"use client";

import React, { useMemo, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { InputTextarea } from "primereact/inputtextarea";
import {
    ClipboardCheck,
    FileText,
    Upload,
    Camera,
    Search,
    CalendarDays,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    Archive,
    Eye,
    Download,
    Share2,
    Plus,
    Filter,
    BookOpen,
    GraduationCap,
    ScanLine,
    XCircle,
    FileCheck2,
    Timer,
    ArrowUpRight,
} from "lucide-react";

interface Avaliacao {
    id: number;
    unidadeCurricular: string;
    turma: string;
    tipo: string;
    titulo: string;
    dataRealizacao: Date;
    dataPublicacao: Date | null;
    estado: "Pendente" | "Dentro do prazo" | "Fora do prazo" | "Publicado";
    docente: string;
    prazoDias: number;
}

interface Pauta {
    id: number;
    curso: string;
    anoLectivo: string;
    semestre: string;
    epoca: string;
    unidadeCurricular: string;
    docente: string;
    ficheiro: string;
    dataDigitalizacao: Date;
    estado: "Digitalizada" | "Arquivada" | "Pendente";
    paginas: number;
}

const COLORS = {
    primary: "#1D4ED8",
    primaryLight: "#EFF6FF",
    green: "#16A34A",
    greenLight: "#DCFCE7",
    orange: "#D97706",
    orangeLight: "#FEF3C7",
    red: "#DC2626",
    redLight: "#FEE2E2",
    purple: "#7C3AED",
    purpleLight: "#F3E8FF",
    cyan: "#0891B2",
    cyanLight: "#CFFAFE",
    dark: "#0F172A",
    text: "#334155",
    muted: "#64748B",
    light: "#94A3B8",
    border: "#E2E8F0",
    background: "#F8FAFC",
};

const formatDate = (date: Date | null) => {
    if (!date) return "-";

    return date.toLocaleDateString("pt-MZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateShort = (date: Date | null) => {
    if (!date) return "-";

    return date.toLocaleDateString("pt-MZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const mockAvaliacoes: Avaliacao[] = [
    {
        id: 1,
        unidadeCurricular: "Programação Web",
        turma: "INF3-T1",
        tipo: "Teste",
        titulo: "1.º Teste de Programação Web",
        dataRealizacao: new Date(2026, 8, 4),
        dataPublicacao: new Date(2026, 8, 9),
        estado: "Publicado",
        docente: "Jane Smith",
        prazoDias: 7,
    },
    {
        id: 2,
        unidadeCurricular: "Base de Dados",
        turma: "INF3-T2",
        tipo: "Teste",
        titulo: "Avaliação de SQL",
        dataRealizacao: new Date(2026, 8, 8),
        dataPublicacao: new Date(2026, 8, 13),
        estado: "Dentro do prazo",
        docente: "Daniel Miller",
        prazoDias: 7,
    },
    {
        id: 3,
        unidadeCurricular: "Engenharia de Software",
        turma: "INF4-T1",
        tipo: "Trabalho",
        titulo: "Trabalho Prático I",
        dataRealizacao: new Date(2026, 8, 10),
        dataPublicacao: null,
        estado: "Pendente",
        docente: "Olivia Taylor",
        prazoDias: 7,
    },
    {
        id: 4,
        unidadeCurricular: "Redes de Computadores",
        turma: "INF3-T1",
        tipo: "Teste",
        titulo: "Teste de Redes",
        dataRealizacao: new Date(2026, 7, 28),
        dataPublicacao: new Date(2026, 8, 10),
        estado: "Fora do prazo",
        docente: "Alex Johnson",
        prazoDias: 7,
    },
    {
        id: 5,
        unidadeCurricular: "Inteligência Artificial",
        turma: "INF4-T2",
        tipo: "Exame",
        titulo: "Exame Normal",
        dataRealizacao: new Date(2026, 8, 18),
        dataPublicacao: null,
        estado: "Pendente",
        docente: "Sarah Davis",
        prazoDias: 7,
    },
    {
        id: 6,
        unidadeCurricular: "Interface Homem-Máquina",
        turma: "INF4-T1",
        tipo: "Trabalho",
        titulo: "Projecto de Interface",
        dataRealizacao: new Date(2026, 8, 2),
        dataPublicacao: new Date(2026, 8, 6),
        estado: "Publicado",
        docente: "Michael Wilson",
        prazoDias: 7,
    },
];

const mockPautas: Pauta[] = [
    {
        id: 1,
        curso: "Engenharia Informática",
        anoLectivo: "2026/2027",
        semestre: "1.º Semestre",
        epoca: "Normal",
        unidadeCurricular: "Programação Web",
        docente: "Jane Smith",
        ficheiro: "pauta-programacao-web-2026.pdf",
        dataDigitalizacao: new Date(2026, 8, 12),
        estado: "Digitalizada",
        paginas: 2,
    },
    {
        id: 2,
        curso: "Engenharia Informática",
        anoLectivo: "2026/2027",
        semestre: "1.º Semestre",
        epoca: "Normal",
        unidadeCurricular: "Base de Dados",
        docente: "Daniel Miller",
        ficheiro: "pauta-base-dados-2026.pdf",
        dataDigitalizacao: new Date(2026, 8, 13),
        estado: "Arquivada",
        paginas: 2,
    },
    {
        id: 3,
        curso: "Engenharia Informática",
        anoLectivo: "2026/2027",
        semestre: "1.º Semestre",
        epoca: "Normal",
        unidadeCurricular: "Redes de Computadores",
        docente: "Alex Johnson",
        ficheiro: "pauta-redes-2026.pdf",
        dataDigitalizacao: new Date(2026, 8, 15),
        estado: "Digitalizada",
        paginas: 3,
    },
    {
        id: 4,
        curso: "Engenharia Informática",
        anoLectivo: "2025/2026",
        semestre: "2.º Semestre",
        epoca: "Recorrente",
        unidadeCurricular: "Engenharia de Software",
        docente: "Olivia Taylor",
        ficheiro: "pauta-engenharia-software-2026.pdf",
        dataDigitalizacao: new Date(2026, 7, 25),
        estado: "Arquivada",
        paginas: 2,
    },
];

const statusSeverity = (
    estado: Avaliacao["estado"] | Pauta["estado"]
) => {
    switch (estado) {
        case "Publicado":
        case "Arquivada":
            return "success";

        case "Dentro do prazo":
        case "Digitalizada":
            return "info";

        case "Pendente":
            return "warning";

        case "Fora do prazo":
            return "danger";

        default:
            return "secondary";
    }
};

export default function AvaliacoesPautas() {
    const [activeSection, setActiveSection] = useState<
        "avaliacoes" | "pautas"
    >("avaliacoes");

    const [avaliacoes, setAvaliacoes] =
        useState<Avaliacao[]>(mockAvaliacoes);

    const [pautas, setPautas] =
        useState<Pauta[]>(mockPautas);

    const [searchAvaliacao, setSearchAvaliacao] = useState("");
    const [statusAvaliacao, setStatusAvaliacao] =
        useState<string | null>(null);

    const [searchPauta, setSearchPauta] = useState("");
    const [cursoPauta, setCursoPauta] = useState<string | null>(null);
    const [semestrePauta, setSemestrePauta] =
        useState<string | null>(null);
    const [epocaPauta, setEpocaPauta] = useState<string | null>(null);

    const [avaliacaoDialog, setAvaliacaoDialog] = useState(false);
    const [pautaDialog, setPautaDialog] = useState(false);

    const [selectedAvaliacao, setSelectedAvaliacao] =
        useState<Avaliacao | null>(null);

    const [selectedPauta, setSelectedPauta] =
        useState<Pauta | null>(null);

    const [newAvaliacao, setNewAvaliacao] = useState({
        unidadeCurricular: "",
        turma: "",
        tipo: "Teste",
        titulo: "",
        dataRealizacao: null as Date | null,
        docente: "",
    });

    const filteredAvaliacoes = useMemo(() => {
        return avaliacoes.filter((item) => {
            const text = searchAvaliacao.toLowerCase();

            const matchesSearch =
                !text ||
                item.unidadeCurricular
                    .toLowerCase()
                    .includes(text) ||
                item.turma.toLowerCase().includes(text) ||
                item.titulo.toLowerCase().includes(text) ||
                item.docente.toLowerCase().includes(text);

            const matchesStatus =
                !statusAvaliacao ||
                item.estado === statusAvaliacao;

            return matchesSearch && matchesStatus;
        });
    }, [avaliacoes, searchAvaliacao, statusAvaliacao]);

    const filteredPautas = useMemo(() => {
        return pautas.filter((item) => {
            const text = searchPauta.toLowerCase();

            const matchesSearch =
                !text ||
                item.unidadeCurricular
                    .toLowerCase()
                    .includes(text) ||
                item.docente.toLowerCase().includes(text) ||
                item.ficheiro.toLowerCase().includes(text);

            const matchesCurso =
                !cursoPauta || item.curso === cursoPauta;

            const matchesSemestre =
                !semestrePauta ||
                item.semestre === semestrePauta;

            const matchesEpoca =
                !epocaPauta || item.epoca === epocaPauta;

            return (
                matchesSearch &&
                matchesCurso &&
                matchesSemestre &&
                matchesEpoca
            );
        });
    }, [
        pautas,
        searchPauta,
        cursoPauta,
        semestrePauta,
        epocaPauta,
    ]);

    const totalAvaliacoes = avaliacoes.length;

    const publicadas = avaliacoes.filter(
        (item) => item.estado === "Publicado"
    ).length;

    const dentroPrazo = avaliacoes.filter(
        (item) =>
            item.estado === "Dentro do prazo" ||
            item.estado === "Publicado"
    ).length;

    const foraPrazo = avaliacoes.filter(
        (item) => item.estado === "Fora do prazo"
    ).length;

    const pendentes = avaliacoes.filter(
        (item) => item.estado === "Pendente"
    ).length;

    const taxaCumprimento =
        totalAvaliacoes > 0
            ? Math.round((dentroPrazo / totalAvaliacoes) * 100)
            : 0;

    const totalPautas = pautas.length;

    const pautasDigitalizadas = pautas.filter(
        (item) => item.estado === "Digitalizada"
    ).length;

    const pautasArquivadas = pautas.filter(
        (item) => item.estado === "Arquivada"
    ).length;

    const openAvaliacao = (item?: Avaliacao) => {
        if (item) {
            setSelectedAvaliacao(item);
        } else {
            setSelectedAvaliacao(null);
        }

        setAvaliacaoDialog(true);
    };

    const saveAvaliacao = () => {
        if (!newAvaliacao.titulo || !newAvaliacao.dataRealizacao) {
            return;
        }

        const item: Avaliacao = {
            id: Date.now(),
            unidadeCurricular:
                newAvaliacao.unidadeCurricular ||
                "Nova Unidade Curricular",
            turma: newAvaliacao.turma || "INF-T1",
            tipo: newAvaliacao.tipo,
            titulo: newAvaliacao.titulo,
            dataRealizacao: newAvaliacao.dataRealizacao,
            dataPublicacao: null,
            estado: "Pendente",
            docente: newAvaliacao.docente || "Docente não definido",
            prazoDias: 7,
        };

        setAvaliacoes((prev) => [item, ...prev]);

        setNewAvaliacao({
            unidadeCurricular: "",
            turma: "",
            tipo: "Teste",
            titulo: "",
            dataRealizacao: null,
            docente: "",
        });

        setAvaliacaoDialog(false);
    };

    const viewPauta = (pauta: Pauta) => {
        setSelectedPauta(pauta);
        setPautaDialog(true);
    };

    const archivePauta = (id: number) => {
        setPautas((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, estado: "Arquivada" }
                    : item
            )
        );
    };

    const avaliacaoStatusTemplate = (row: Avaliacao) => (
        <Tag
            value={row.estado}
            // severity={statusSeverity(row.estado)}
            rounded
        />
    );

    const pautaStatusTemplate = (row: Pauta) => (
        <Tag
            value={row.estado}
            // severity={statusSeverity(row.estado)}
            rounded
        />
    );

    const dateTemplate = (row: Avaliacao) => (
        <span>{formatDate(row.dataRealizacao)}</span>
    );

    const publicationTemplate = (row: Avaliacao) => (
        <span>{formatDate(row.dataPublicacao)}</span>
    );

    const prazoTemplate = (row: Avaliacao) => {
        if (row.estado === "Publicado") {
            return (
                <div className="flex align-items-center gap-2">
                    <CheckCircle2 size={16} color={COLORS.green} />
                    <span className="text-green-700 font-medium">
                        Cumprido
                    </span>
                </div>
            );
        }

        if (row.estado === "Fora do prazo") {
            return (
                <div className="flex align-items-center gap-2">
                    <AlertTriangle
                        size={16}
                        color={COLORS.red}
                    />
                    <span className="text-red-600 font-medium">
                        Fora do prazo
                    </span>
                </div>
            );
        }

        if (row.estado === "Dentro do prazo") {
            return (
                <div className="flex align-items-center gap-2">
                    <Timer size={16} color={COLORS.primary} />
                    <span className="text-blue-700 font-medium">
                        Dentro do prazo
                    </span>
                </div>
            );
        }

        return (
            <div className="flex align-items-center gap-2">
                <Clock3 size={16} color={COLORS.orange} />
                <span className="text-orange-700 font-medium">
                    Pendente
                </span>
            </div>
        );
    };

    const pautaActionsTemplate = (row: Pauta) => (
        <div className="flex justify-content-end gap-2">
            <Button
                icon={<Eye size={16} />}
                text
                rounded
                severity="secondary"
                tooltip="Visualizar"
                onClick={() => viewPauta(row)}
            />

            <Button
                icon={<Download size={16} />}
                text
                rounded
                severity="secondary"
                tooltip="Baixar PDF"
            />

            <Button
                icon={<Archive size={16} />}
                text
                rounded
                severity="secondary"
                tooltip="Arquivar"
                disabled={row.estado === "Arquivada"}
                onClick={() => archivePauta(row.id)}
            />

            <Button
                icon={<Share2 size={16} />}
                text
                rounded
                severity="secondary"
                tooltip="Partilhar"
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
                background: COLORS.background,
                minHeight: "100vh",
            }}
        >
            {/* =====================================================
                HEADER
            ===================================================== */}
            <div
                className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4"
            >
                <div>
                    <div className="flex align-items-center gap-2 mb-2">
                        <div
                            className="flex align-items-center justify-content-center border-round-xl"
                            style={{
                                width: 44,
                                height: 44,
                                background: COLORS.primaryLight,
                            }}
                        >
                            <ClipboardCheck
                                size={24}
                                color={COLORS.primary}
                            />
                        </div>

                        <div>
                            <h1
                                className="m-0"
                                style={{
                                    fontSize: "1.65rem",
                                    color: COLORS.dark,
                                    fontWeight: 700,
                                }}
                            >
                                Avaliações e Pautas
                            </h1>

                            <p
                                className="m-0 mt-1"
                                style={{
                                    color: COLORS.muted,
                                    fontSize: "0.9rem",
                                }}
                            >
                                Gestão de avaliações, controlo de
                                prazos e arquivo das pautas finais.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button
                        label="Digitalizar pauta"
                        icon={<ScanLine size={17} />}
                        outlined
                        onClick={() => setPautaDialog(true)}
                    />

                    <Button
                        label="Nova avaliação"
                        icon={<Plus size={17} />}
                        onClick={() => openAvaliacao()}
                    />
                </div>
            </div>

            {/* =====================================================
                KPI CARDS
            ===================================================== */}
            <div className="grid mb-4">
                <div className="col-12 md:col-6 xl:col-3">
                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                            borderRadius: 14,
                        }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    Total de avaliações
                                </span>

                                <div
                                    className="mt-2"
                                    style={{
                                        fontSize: "1.8rem",
                                        fontWeight: 700,
                                        color: COLORS.dark,
                                    }}
                                >
                                    {totalAvaliacoes}
                                </div>

                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    Registadas no semestre
                                </span>
                            </div>

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: 42,
                                    height: 42,
                                    background:
                                        COLORS.primaryLight,
                                }}
                            >
                                <ClipboardCheck
                                    size={21}
                                    color={COLORS.primary}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                            borderRadius: 14,
                        }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    Dentro do prazo
                                </span>

                                <div
                                    className="mt-2"
                                    style={{
                                        fontSize: "1.8rem",
                                        fontWeight: 700,
                                        color: COLORS.green,
                                    }}
                                >
                                    {taxaCumprimento}%
                                </div>

                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    Cumprimento regulamentar
                                </span>
                            </div>

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: 42,
                                    height: 42,
                                    background:
                                        COLORS.greenLight,
                                }}
                            >
                                <CheckCircle2
                                    size={21}
                                    color={COLORS.green}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                            borderRadius: 14,
                        }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    Fora do prazo
                                </span>

                                <div
                                    className="mt-2"
                                    style={{
                                        fontSize: "1.8rem",
                                        fontWeight: 700,
                                        color: COLORS.red,
                                    }}
                                >
                                    {foraPrazo}
                                </div>

                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    Requer atenção
                                </span>
                            </div>

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: 42,
                                    height: 42,
                                    background: COLORS.redLight,
                                }}
                            >
                                <AlertTriangle
                                    size={21}
                                    color={COLORS.red}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Card
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                            borderRadius: 14,
                        }}
                    >
                        <div className="flex justify-content-between align-items-start">
                            <div>
                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    Pautas arquivadas
                                </span>

                                <div
                                    className="mt-2"
                                    style={{
                                        fontSize: "1.8rem",
                                        fontWeight: 700,
                                        color: COLORS.purple,
                                    }}
                                >
                                    {pautasArquivadas}
                                </div>

                                <span
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    de {totalPautas} pautas
                                </span>
                            </div>

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: 42,
                                    height: 42,
                                    background:
                                        COLORS.purpleLight,
                                }}
                            >
                                <Archive
                                    size={21}
                                    color={COLORS.purple}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* =====================================================
                SECTION SWITCHER
            ===================================================== */}
            <div
                className="flex align-items-center gap-2 mb-4 p-2 border-round-xl"
                style={{
                    background: "#FFFFFF",
                    border: `1px solid ${COLORS.border}`,
                }}
            >
                <Button
                    label="Avaliações e prazos"
                    icon={<ClipboardCheck size={17} />}
                    text={activeSection !== "avaliacoes"}
                    className={
                        activeSection === "avaliacoes"
                            ? ""
                            : "text-600"
                    }
                    onClick={() =>
                        setActiveSection("avaliacoes")
                    }
                />

                <Button
                    label="Pautas finais"
                    icon={<FileText size={17} />}
                    text={activeSection !== "pautas"}
                    className={
                        activeSection === "pautas"
                            ? ""
                            : "text-600"
                    }
                    onClick={() => setActiveSection("pautas")}
                />
            </div>

            {/* =====================================================
                AVALIAÇÕES
            ===================================================== */}
            {activeSection === "avaliacoes" && (
                <>
                    <div className="grid">
                        <div className="col-12 xl:col-8">
                            <Card
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                    borderRadius: 14,
                                }}
                            >
                                <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                    <div>
                                        <h2
                                            className="m-0"
                                            style={{
                                                color: COLORS.dark,
                                                fontSize: "1.15rem",
                                            }}
                                        >
                                            Gestão de Avaliações
                                        </h2>

                                        <p
                                            className="m-0 mt-1"
                                            style={{
                                                color: COLORS.muted,
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            Registo e
                                            acompanhamento das
                                            avaliações do período
                                            lectivo.
                                        </p>
                                    </div>

                                    <Button
                                        label="Registar avaliação"
                                        icon={<Plus size={16} />}
                                        size="small"
                                        onClick={() =>
                                            openAvaliacao()
                                        }
                                    />
                                </div>

                                <div className="grid mb-3">
                                    <div className="col-12 md:col-7">
                                        <span className="p-input-icon-left w-full">
                                            <Search
                                                size={16}
                                                style={{
                                                    marginLeft: 10,
                                                    color: COLORS.light,
                                                }}
                                            />

                                            <InputText
                                                value={
                                                    searchAvaliacao
                                                }
                                                onChange={(e) =>
                                                    setSearchAvaliacao(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Pesquisar avaliação, UC, turma ou docente..."
                                                className="w-full"
                                                style={{
                                                    paddingLeft:
                                                        "2.3rem",
                                                }}
                                            />
                                        </span>
                                    </div>

                                    <div className="col-12 md:col-5">
                                        <Dropdown
                                            value={
                                                statusAvaliacao
                                            }
                                            onChange={(e) =>
                                                setStatusAvaliacao(
                                                    e.value
                                                )
                                            }
                                            options={[
                                                {
                                                    label: "Todos os estados",
                                                    value: null,
                                                },
                                                {
                                                    label: "Pendente",
                                                    value: "Pendente",
                                                },
                                                {
                                                    label: "Dentro do prazo",
                                                    value: "Dentro do prazo",
                                                },
                                                {
                                                    label: "Fora do prazo",
                                                    value: "Fora do prazo",
                                                },
                                                {
                                                    label: "Publicado",
                                                    value: "Publicado",
                                                },
                                            ]}
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Filtrar por estado"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <DataTable
                                    value={filteredAvaliacoes}
                                    paginator
                                    rows={5}
                                    responsiveLayout="scroll"
                                    emptyMessage="Nenhuma avaliação encontrada."
                                    size="small"
                                    stripedRows
                                >
                                    <Column
                                        field="unidadeCurricular"
                                        header="Unidade Curricular"
                                        style={{
                                            minWidth: "180px",
                                        }}
                                    />

                                    <Column
                                        field="turma"
                                        header="Turma"
                                        style={{
                                            minWidth: "90px",
                                        }}
                                    />

                                    <Column
                                        field="titulo"
                                        header="Avaliação"
                                        style={{
                                            minWidth: "200px",
                                        }}
                                    />

                                    <Column
                                        field="docente"
                                        header="Docente"
                                        style={{
                                            minWidth: "130px",
                                        }}
                                    />

                                    <Column
                                        header="Realização"
                                        body={dateTemplate}
                                    />

                                    <Column
                                        header="Publicação"
                                        body={publicationTemplate}
                                    />

                                    <Column
                                        header="Prazo"
                                        body={prazoTemplate}
                                    />

                                    <Column
                                        header="Estado"
                                        body={
                                            avaliacaoStatusTemplate
                                        }
                                    />

                                    <Column
                                        header=""
                                        body={(row) => (
                                            <Button
                                                icon={
                                                    <ArrowUpRight
                                                        size={16}
                                                    />
                                                }
                                                text
                                                rounded
                                                severity="secondary"
                                                tooltip="Consultar"
                                                onClick={() =>
                                                    openAvaliacao(
                                                        row
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </DataTable>
                            </Card>
                        </div>

                        {/* CONTROLO DE PRAZOS */}
                        <div className="col-12 xl:col-4">
                            <Card
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                    borderRadius: 14,
                                    height: "100%",
                                }}
                            >
                                <div className="flex align-items-center justify-content-between mb-4">
                                    <div>
                                        <h2
                                            className="m-0"
                                            style={{
                                                fontSize: "1.15rem",
                                                color: COLORS.dark,
                                            }}
                                        >
                                            Controlo de Prazos
                                        </h2>

                                        <p
                                            className="m-0 mt-1"
                                            style={{
                                                color: COLORS.muted,
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            Situação das avaliações
                                            registadas.
                                        </p>
                                    </div>

                                    <Timer
                                        size={22}
                                        color={COLORS.primary}
                                    />
                                </div>

                                <div className="flex flex-column gap-3">
                                    <div
                                        className="p-3 border-round-xl"
                                        style={{
                                            background:
                                                COLORS.greenLight,
                                        }}
                                    >
                                        <div className="flex justify-content-between align-items-center">
                                            <div className="flex align-items-center gap-2">
                                                <CheckCircle2
                                                    size={18}
                                                    color={
                                                        COLORS.green
                                                    }
                                                />

                                                <span
                                                    style={{
                                                        color:
                                                            COLORS.green,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Dentro do prazo
                                                </span>
                                            </div>

                                            <strong
                                                style={{
                                                    color:
                                                        COLORS.green,
                                                }}
                                            >
                                                {dentroPrazo}
                                            </strong>
                                        </div>
                                    </div>

                                    <div
                                        className="p-3 border-round-xl"
                                        style={{
                                            background:
                                                COLORS.orangeLight,
                                        }}
                                    >
                                        <div className="flex justify-content-between align-items-center">
                                            <div className="flex align-items-center gap-2">
                                                <Clock3
                                                    size={18}
                                                    color={
                                                        COLORS.orange
                                                    }
                                                />

                                                <span
                                                    style={{
                                                        color:
                                                            COLORS.orange,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Pendentes
                                                </span>
                                            </div>

                                            <strong
                                                style={{
                                                    color:
                                                        COLORS.orange,
                                                }}
                                            >
                                                {pendentes}
                                            </strong>
                                        </div>
                                    </div>

                                    <div
                                        className="p-3 border-round-xl"
                                        style={{
                                            background:
                                                COLORS.redLight,
                                        }}
                                    >
                                        <div className="flex justify-content-between align-items-center">
                                            <div className="flex align-items-center gap-2">
                                                <AlertTriangle
                                                    size={18}
                                                    color={
                                                        COLORS.red
                                                    }
                                                />

                                                <span
                                                    style={{
                                                        color:
                                                            COLORS.red,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Fora do prazo
                                                </span>
                                            </div>

                                            <strong
                                                style={{
                                                    color:
                                                        COLORS.red,
                                                }}
                                            >
                                                {foraPrazo}
                                            </strong>
                                        </div>
                                    </div>

                                    <div
                                        className="p-3 border-round-xl"
                                        style={{
                                            background:
                                                COLORS.primaryLight,
                                        }}
                                    >
                                        <div className="flex justify-content-between mb-2">
                                            <span
                                                style={{
                                                    color:
                                                        COLORS.text,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Taxa de cumprimento
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        COLORS.primary,
                                                }}
                                            >
                                                {taxaCumprimento}%
                                            </strong>
                                        </div>

                                        <div
                                            style={{
                                                height: 8,
                                                background:
                                                    "#DBEAFE",
                                                borderRadius: 10,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${taxaCumprimento}%`,
                                                    height: "100%",
                                                    background:
                                                        COLORS.primary,
                                                    borderRadius: 10,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                <div
                                    className="p-3 border-round-xl"
                                    style={{
                                        background:
                                            COLORS.background,
                                        border: `1px solid ${COLORS.border}`,
                                    }}
                                >
                                    <div className="flex gap-3">
                                        <AlertTriangle
                                            size={20}
                                            color={
                                                foraPrazo > 0
                                                    ? COLORS.red
                                                    : COLORS.green
                                            }
                                        />

                                        <div>
                                            <div
                                                className="font-semibold mb-1"
                                                style={{
                                                    color:
                                                        COLORS.dark,
                                                }}
                                            >
                                                Monitorização
                                                automática
                                            </div>

                                            <p
                                                className="m-0"
                                                style={{
                                                    color:
                                                        COLORS.muted,
                                                    fontSize:
                                                        "0.78rem",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                O sistema compara a
                                                data de realização
                                                com a data de
                                                publicação e
                                                identifica
                                                automaticamente
                                                situações fora do
                                                prazo regulamentar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* PUBLICADAS */}
                    <Card
                        className="mt-4"
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                            borderRadius: 14,
                        }}
                    >
                        <div className="flex justify-content-between align-items-center mb-3">
                            <div>
                                <h2
                                    className="m-0"
                                    style={{
                                        fontSize: "1.1rem",
                                        color: COLORS.dark,
                                    }}
                                >
                                    Resumo de Publicação
                                </h2>

                                <p
                                    className="m-0 mt-1"
                                    style={{
                                        color: COLORS.muted,
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    Acompanhamento da publicação
                                    das avaliações.
                                </p>
                            </div>

                            <Tag
                                value={`${publicadas} publicadas`}
                                severity="success"
                                rounded
                            />
                        </div>

                        <div className="grid">
                            {avaliacoes.slice(0, 4).map((item) => (
                                <div
                                    key={item.id}
                                    className="col-12 md:col-6 xl:col-3"
                                >
                                    <div
                                        className="p-3 border-round-xl h-full"
                                        style={{
                                            border: `1px solid ${COLORS.border}`,
                                        }}
                                    >
                                        <div className="flex justify-content-between gap-2">
                                            <div>
                                                <div
                                                    className="font-semibold"
                                                    style={{
                                                        color:
                                                            COLORS.dark,
                                                        fontSize:
                                                            "0.88rem",
                                                    }}
                                                >
                                                    {
                                                        item.unidadeCurricular
                                                    }
                                                </div>

                                                <div
                                                    className="mt-1"
                                                    style={{
                                                        color:
                                                            COLORS.muted,
                                                        fontSize:
                                                            "0.75rem",
                                                    }}
                                                >
                                                    {item.turma}
                                                </div>
                                            </div>

                                            <FileCheck2
                                                size={19}
                                                color={
                                                    item.estado ===
                                                    "Publicado"
                                                        ? COLORS.green
                                                        : COLORS.orange
                                                }
                                            />
                                        </div>

                                        <div
                                            className="mt-3"
                                            style={{
                                                color:
                                                    COLORS.text,
                                                fontSize:
                                                    "0.78rem",
                                            }}
                                        >
                                            {item.titulo}
                                        </div>

                                        <div className="mt-3">
                                            <Tag
                                                value={item.estado}
                                                // severity={statusSeverity(
                                                //     item.estado
                                                // )}
                                                rounded
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </>
            )}

            {/* =====================================================
                PAUTAS FINAIS
            ===================================================== */}
            {activeSection === "pautas" && (
                <>
                    <div className="grid">
                        <div className="col-12 xl:col-8">
                            <Card
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                    borderRadius: 14,
                                }}
                            >
                                <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                    <div>
                                        <h2
                                            className="m-0"
                                            style={{
                                                fontSize: "1.15rem",
                                                color: COLORS.dark,
                                            }}
                                        >
                                            Pautas Finais
                                        </h2>

                                        <p
                                            className="m-0 mt-1"
                                            style={{
                                                color: COLORS.muted,
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            Consulta, digitalização e
                                            arquivo das pautas
                                            finais.
                                        </p>
                                    </div>

                                    <Button
                                        label="Digitalizar"
                                        icon={<Camera size={16} />}
                                        onClick={() =>
                                            setPautaDialog(true)
                                        }
                                    />
                                </div>

                                {/* FILTROS */}
                                <div className="grid mb-3">
                                    <div className="col-12 md:col-6">
                                        <span className="p-input-icon-left w-full">
                                            <Search
                                                size={16}
                                                style={{
                                                    marginLeft: 10,
                                                    color: COLORS.light,
                                                }}
                                            />

                                            <InputText
                                                value={searchPauta}
                                                onChange={(e) =>
                                                    setSearchPauta(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Pesquisar pauta ou unidade curricular..."
                                                className="w-full"
                                                style={{
                                                    paddingLeft:
                                                        "2.3rem",
                                                }}
                                            />
                                        </span>
                                    </div>

                                    <div className="col-12 md:col-6">
                                        <Dropdown
                                            value={cursoPauta}
                                            onChange={(e) =>
                                                setCursoPauta(
                                                    e.value
                                                )
                                            }
                                            options={[
                                                {
                                                    label: "Todos os cursos",
                                                    value: null,
                                                },
                                                {
                                                    label: "Engenharia Informática",
                                                    value: "Engenharia Informática",
                                                },
                                            ]}
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Curso"
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="col-12 md:col-4">
                                        <Dropdown
                                            value={semestrePauta}
                                            onChange={(e) =>
                                                setSemestrePauta(
                                                    e.value
                                                )
                                            }
                                            options={[
                                                {
                                                    label: "Todos os semestres",
                                                    value: null,
                                                },
                                                {
                                                    label: "1.º Semestre",
                                                    value: "1.º Semestre",
                                                },
                                                {
                                                    label: "2.º Semestre",
                                                    value: "2.º Semestre",
                                                },
                                            ]}
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Semestre"
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="col-12 md:col-4">
                                        <Dropdown
                                            value={epocaPauta}
                                            onChange={(e) =>
                                                setEpocaPauta(
                                                    e.value
                                                )
                                            }
                                            options={[
                                                {
                                                    label: "Todas as épocas",
                                                    value: null,
                                                },
                                                {
                                                    label: "Normal",
                                                    value: "Normal",
                                                },
                                                {
                                                    label: "Recorrente",
                                                    value: "Recorrente",
                                                },
                                                {
                                                    label: "Especial",
                                                    value: "Especial",
                                                },
                                            ]}
                                            optionLabel="label"
                                            optionValue="value"
                                            placeholder="Época"
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="col-12 md:col-4">
                                        <Button
                                            label="Limpar filtros"
                                            icon={<Filter size={16} />}
                                            outlined
                                            className="w-full"
                                            onClick={() => {
                                                setSearchPauta("");
                                                setCursoPauta(null);
                                                setSemestrePauta(
                                                    null
                                                );
                                                setEpocaPauta(null);
                                            }}
                                        />
                                    </div>
                                </div>

                                <DataTable
                                    value={filteredPautas}
                                    paginator
                                    rows={5}
                                    responsiveLayout="scroll"
                                    emptyMessage="Nenhuma pauta encontrada."
                                    size="small"
                                    stripedRows
                                >
                                    <Column
                                        field="unidadeCurricular"
                                        header="Unidade Curricular"
                                        style={{
                                            minWidth: "180px",
                                        }}
                                    />

                                    <Column
                                        field="curso"
                                        header="Curso"
                                        style={{
                                            minWidth: "160px",
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
                                        field="epoca"
                                        header="Época"
                                    />

                                    <Column
                                        field="docente"
                                        header="Docente"
                                    />

                                    <Column
                                        header="Digitalização"
                                        body={(row: Pauta) => (
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize:
                                                            "0.8rem",
                                                    }}
                                                >
                                                    {formatDateShort(
                                                        row.dataDigitalizacao
                                                    )}
                                                </div>

                                                <div
                                                    style={{
                                                        color:
                                                            COLORS.muted,
                                                        fontSize:
                                                            "0.7rem",
                                                    }}
                                                >
                                                    {row.paginas}{" "}
                                                    páginas
                                                </div>
                                            </div>
                                        )}
                                    />

                                    <Column
                                        header="Estado"
                                        body={pautaStatusTemplate}
                                    />

                                    <Column
                                        header=""
                                        body={
                                            pautaActionsTemplate
                                        }
                                    />
                                </DataTable>
                            </Card>
                        </div>

                        {/* PAINEL DIGITALIZAÇÃO */}
                        <div className="col-12 xl:col-4">
                            <Card
                                style={{
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "none",
                                    borderRadius: 14,
                                    height: "100%",
                                }}
                            >
                                <div className="flex align-items-center justify-content-between mb-4">
                                    <div>
                                        <h2
                                            className="m-0"
                                            style={{
                                                fontSize: "1.15rem",
                                                color: COLORS.dark,
                                            }}
                                        >
                                            Digitalização de Pautas
                                        </h2>

                                        <p
                                            className="m-0 mt-1"
                                            style={{
                                                color: COLORS.muted,
                                                fontSize:
                                                    "0.82rem",
                                            }}
                                        >
                                            Captura e tratamento de
                                            documentos físicos.
                                        </p>
                                    </div>

                                    <ScanLine
                                        size={23}
                                        color={COLORS.primary}
                                    />
                                </div>

                                <div
                                    className="flex flex-column align-items-center justify-content-center p-5 border-round-xl"
                                    style={{
                                        border: `1.5px dashed ${COLORS.border}`,
                                        background:
                                            COLORS.background,
                                    }}
                                >
                                    <div
                                        className="flex align-items-center justify-content-center border-circle mb-3"
                                        style={{
                                            width: 68,
                                            height: 68,
                                            background:
                                                COLORS.primaryLight,
                                        }}
                                    >
                                        <Camera
                                            size={30}
                                            color={
                                                COLORS.primary
                                            }
                                        />
                                    </div>

                                    <div
                                        className="font-semibold text-center"
                                        style={{
                                            color: COLORS.dark,
                                        }}
                                    >
                                        Capturar pauta física
                                    </div>

                                    <p
                                        className="text-center m-0 mt-2"
                                        style={{
                                            color: COLORS.muted,
                                            fontSize: "0.78rem",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Utilize a câmara do
                                        dispositivo para capturar
                                        o documento e preparar o
                                        PDF.
                                    </p>

                                    <Button
                                        label="Iniciar digitalização"
                                        icon={<Camera size={16} />}
                                        className="mt-4"
                                        onClick={() =>
                                            setPautaDialog(true)
                                        }
                                    />
                                </div>

                                <Divider />

                                <div className="flex flex-column gap-3">
                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <FileText
                                                size={17}
                                                color={
                                                    COLORS.primary
                                                }
                                            />
                                            <span
                                                style={{
                                                    color:
                                                        COLORS.text,
                                                    fontSize:
                                                        "0.82rem",
                                                }}
                                            >
                                                Pautas digitalizadas
                                            </span>
                                        </div>

                                        <strong>
                                            {pautasDigitalizadas}
                                        </strong>
                                    </div>

                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <Archive
                                                size={17}
                                                color={
                                                    COLORS.purple
                                                }
                                            />
                                            <span
                                                style={{
                                                    color:
                                                        COLORS.text,
                                                    fontSize:
                                                        "0.82rem",
                                                }}
                                            >
                                                Pautas arquivadas
                                            </span>
                                        </div>

                                        <strong>
                                            {pautasArquivadas}
                                        </strong>
                                    </div>

                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <GraduationCap
                                                size={17}
                                                color={
                                                    COLORS.cyan
                                                }
                                            />
                                            <span
                                                style={{
                                                    color:
                                                        COLORS.text,
                                                    fontSize:
                                                        "0.82rem",
                                                }}
                                            >
                                                Documentos
                                                processados
                                            </span>
                                        </div>

                                        <strong>{totalPautas}</strong>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* FLUXO DE DIGITALIZAÇÃO */}
                    <Card
                        className="mt-4"
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "none",
                            borderRadius: 14,
                        }}
                    >
                        <div className="mb-4">
                            <h2
                                className="m-0"
                                style={{
                                    fontSize: "1.1rem",
                                    color: COLORS.dark,
                                }}
                            >
                                Fluxo de Digitalização
                            </h2>

                            <p
                                className="m-0 mt-1"
                                style={{
                                    color: COLORS.muted,
                                    fontSize: "0.8rem",
                                }}
                            >
                                Etapas previstas para transformar uma
                                pauta física num documento digital.
                            </p>
                        </div>

                        <div className="grid">
                            {[
                                {
                                    number: "01",
                                    title: "Captura",
                                    description:
                                        "Fotografar ou importar a pauta física.",
                                    icon: Camera,
                                    color: COLORS.primary,
                                    background:
                                        COLORS.primaryLight,
                                },
                                {
                                    number: "02",
                                    title: "Detecção",
                                    description:
                                        "Identificar automaticamente as bordas do documento.",
                                    icon: ScanLine,
                                    color: COLORS.purple,
                                    background:
                                        COLORS.purpleLight,
                                },
                                {
                                    number: "03",
                                    title: "Correção",
                                    description:
                                        "Corrigir perspectiva e enquadramento.",
                                    icon: FileCheck2,
                                    color: COLORS.orange,
                                    background:
                                        COLORS.orangeLight,
                                },
                                {
                                    number: "04",
                                    title: "PDF",
                                    description:
                                        "Gerar e guardar o documento digital.",
                                    icon: FileText,
                                    color: COLORS.green,
                                    background:
                                        COLORS.greenLight,
                                },
                            ].map((step) => {
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.number}
                                        className="col-12 md:col-6 xl:col-3"
                                    >
                                        <div
                                            className="p-3 border-round-xl h-full"
                                            style={{
                                                border: `1px solid ${COLORS.border}`,
                                            }}
                                        >
                                            <div className="flex align-items-center gap-3">
                                                <div
                                                    className="flex align-items-center justify-content-center border-round-lg"
                                                    style={{
                                                        width: 42,
                                                        height: 42,
                                                        background:
                                                            step.background,
                                                    }}
                                                >
                                                    <Icon
                                                        size={20}
                                                        color={
                                                            step.color
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <div
                                                        style={{
                                                            color:
                                                                COLORS.light,
                                                            fontSize:
                                                                "0.7rem",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        ETAPA{" "}
                                                        {
                                                            step.number
                                                        }
                                                    </div>

                                                    <div
                                                        className="font-semibold mt-1"
                                                        style={{
                                                            color:
                                                                COLORS.dark,
                                                        }}
                                                    >
                                                        {
                                                            step.title
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <p
                                                className="m-0 mt-3"
                                                style={{
                                                    color:
                                                        COLORS.muted,
                                                    fontSize:
                                                        "0.76rem",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {
                                                    step.description
                                                }
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </>
            )}

            {/* =====================================================
                DIALOG - NOVA AVALIAÇÃO
            ===================================================== */}
            <Dialog
                header={
                    selectedAvaliacao
                        ? "Detalhes da Avaliação"
                        : "Registar Nova Avaliação"
                }
                visible={avaliacaoDialog}
                onHide={() => setAvaliacaoDialog(false)}
                style={{ width: "650px" }}
                modal
            >
                {selectedAvaliacao ? (
                    <div>
                        <div
                            className="p-3 border-round-xl mb-4"
                            style={{
                                background: COLORS.primaryLight,
                            }}
                        >
                            <div className="flex align-items-center gap-3">
                                <div
                                    className="flex align-items-center justify-content-center border-round-lg"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        background: "#FFFFFF",
                                    }}
                                >
                                    <ClipboardCheck
                                        size={23}
                                        color={COLORS.primary}
                                    />
                                </div>

                                <div>
                                    <div
                                        style={{
                                            color: COLORS.muted,
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        Avaliação
                                    </div>

                                    <div
                                        className="font-bold mt-1"
                                        style={{
                                            color: COLORS.dark,
                                            fontSize: "1.05rem",
                                        }}
                                    >
                                        {
                                            selectedAvaliacao.titulo
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div
                                    className="text-sm mb-1"
                                    style={{
                                        color: COLORS.muted,
                                    }}
                                >
                                    Unidade Curricular
                                </div>

                                <div className="font-medium">
                                    {
                                        selectedAvaliacao.unidadeCurricular
                                    }
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div
                                    className="text-sm mb-1"
                                    style={{
                                        color: COLORS.muted,
                                    }}
                                >
                                    Turma
                                </div>

                                <div className="font-medium">
                                    {selectedAvaliacao.turma}
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div
                                    className="text-sm mb-1"
                                    style={{
                                        color: COLORS.muted,
                                    }}
                                >
                                    Docente
                                </div>

                                <div className="font-medium">
                                    {selectedAvaliacao.docente}
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div
                                    className="text-sm mb-1"
                                    style={{
                                        color: COLORS.muted,
                                    }}
                                >
                                    Tipo
                                </div>

                                <div className="font-medium">
                                    {selectedAvaliacao.tipo}
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div
                                    className="text-sm mb-1"
                                    style={{
                                        color: COLORS.muted,
                                    }}
                                >
                                    Data de realização
                                </div>

                                <div className="font-medium">
                                    {formatDate(
                                        selectedAvaliacao.dataRealizacao
                                    )}
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div
                                    className="text-sm mb-1"
                                    style={{
                                        color: COLORS.muted,
                                    }}
                                >
                                    Data de publicação
                                </div>

                                <div className="font-medium">
                                    {formatDate(
                                        selectedAvaliacao.dataPublicacao
                                    )}
                                </div>
                            </div>

                            <div className="col-12">
                                <Divider />

                                <div className="flex justify-content-between align-items-center">
                                    <span
                                        style={{
                                            color: COLORS.muted,
                                        }}
                                    >
                                        Estado actual
                                    </span>

                                    <Tag
                                        value={
                                            selectedAvaliacao.estado
                                        }
                                        // severity={statusSeverity(
                                        //     selectedAvaliacao.estado
                                        // )}
                                        rounded
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid">
                        <div className="col-12">
                            <label className="block mb-2 font-medium">
                                Título da avaliação
                            </label>

                            <InputText
                                value={newAvaliacao.titulo}
                                onChange={(e) =>
                                    setNewAvaliacao({
                                        ...newAvaliacao,
                                        titulo: e.target.value,
                                    })
                                }
                                placeholder="Ex.: 1.º Teste de Programação Web"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2 font-medium">
                                Unidade Curricular
                            </label>

                            <Dropdown
                                value={
                                    newAvaliacao.unidadeCurricular
                                }
                                onChange={(e) =>
                                    setNewAvaliacao({
                                        ...newAvaliacao,
                                        unidadeCurricular:
                                            e.value,
                                    })
                                }
                                options={[
                                    "Programação Web",
                                    "Base de Dados",
                                    "Engenharia de Software",
                                    "Redes de Computadores",
                                    "Inteligência Artificial",
                                ]}
                                placeholder="Seleccionar UC"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2 font-medium">
                                Turma
                            </label>

                            <Dropdown
                                value={newAvaliacao.turma}
                                onChange={(e) =>
                                    setNewAvaliacao({
                                        ...newAvaliacao,
                                        turma: e.value,
                                    })
                                }
                                options={[
                                    "INF3-T1",
                                    "INF3-T2",
                                    "INF4-T1",
                                    "INF4-T2",
                                ]}
                                placeholder="Seleccionar turma"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2 font-medium">
                                Tipo
                            </label>

                            <Dropdown
                                value={newAvaliacao.tipo}
                                onChange={(e) =>
                                    setNewAvaliacao({
                                        ...newAvaliacao,
                                        tipo: e.value,
                                    })
                                }
                                options={[
                                    "Teste",
                                    "Trabalho",
                                    "Exame",
                                    "Frequência",
                                    "Projecto",
                                ]}
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2 font-medium">
                                Data de realização
                            </label>

                            <Calendar
                                value={
                                    newAvaliacao.dataRealizacao
                                }
                                onChange={(e) =>
                                    setNewAvaliacao({
                                        ...newAvaliacao,
                                        dataRealizacao:
                                            e.value as Date,
                                    })
                                }
                                showIcon
                                dateFormat="dd/mm/yy"
                                className="w-full"
                                inputClassName="w-full"
                            />
                        </div>

                        <div className="col-12">
                            <label className="block mb-2 font-medium">
                                Docente responsável
                            </label>

                            <InputText
                                value={newAvaliacao.docente}
                                onChange={(e) =>
                                    setNewAvaliacao({
                                        ...newAvaliacao,
                                        docente: e.target.value,
                                    })
                                }
                                placeholder="Nome do docente"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 flex justify-content-end gap-2 mt-2">
                            <Button
                                label="Cancelar"
                                outlined
                                severity="secondary"
                                onClick={() =>
                                    setAvaliacaoDialog(false)
                                }
                            />

                            <Button
                                label="Registar avaliação"
                                icon={<CheckCircle2 size={16} />}
                                onClick={saveAvaliacao}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* =====================================================
                DIALOG - PAUTA
            ===================================================== */}
            <Dialog
                header={
                    selectedPauta
                        ? "Visualização da Pauta"
                        : "Digitalização de Pauta"
                }
                visible={pautaDialog}
                onHide={() => {
                    setPautaDialog(false);
                    setSelectedPauta(null);
                }}
                style={{ width: "850px" }}
                modal
            >
                {selectedPauta ? (
                    <div>
                        <div className="grid">
                            <div className="col-12 md:col-8">
                                <div
                                    className="border-round-xl flex align-items-center justify-content-center"
                                    style={{
                                        height: 360,
                                        background: "#F1F5F9",
                                        border: `1px solid ${COLORS.border}`,
                                    }}
                                >
                                    <div className="text-center">
                                        <FileText
                                            size={58}
                                            color={COLORS.primary}
                                        />

                                        <div
                                            className="mt-3 font-semibold"
                                            style={{
                                                color: COLORS.dark,
                                            }}
                                        >
                                            {selectedPauta.ficheiro}
                                        </div>

                                        <div
                                            className="mt-1"
                                            style={{
                                                color: COLORS.muted,
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            Pré-visualização do PDF
                                        </div>

                                        <Button
                                            label="Abrir documento"
                                            icon={
                                                <Eye size={16} />
                                            }
                                            className="mt-4"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 md:col-4">
                                <div
                                    className="font-semibold mb-3"
                                    style={{
                                        color: COLORS.dark,
                                    }}
                                >
                                    Metadados
                                </div>

                                <div className="flex flex-column gap-3">
                                    <div>
                                        <span
                                            className="block"
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.72rem",
                                            }}
                                        >
                                            Unidade Curricular
                                        </span>

                                        <span className="font-medium">
                                            {
                                                selectedPauta.unidadeCurricular
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span
                                            className="block"
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.72rem",
                                            }}
                                        >
                                            Docente
                                        </span>

                                        <span className="font-medium">
                                            {
                                                selectedPauta.docente
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span
                                            className="block"
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.72rem",
                                            }}
                                        >
                                            Curso
                                        </span>

                                        <span className="font-medium">
                                            {selectedPauta.curso}
                                        </span>
                                    </div>

                                    <div>
                                        <span
                                            className="block"
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.72rem",
                                            }}
                                        >
                                            Ano Lectivo
                                        </span>

                                        <span className="font-medium">
                                            {
                                                selectedPauta.anoLectivo
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span
                                            className="block"
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.72rem",
                                            }}
                                        >
                                            Semestre
                                        </span>

                                        <span className="font-medium">
                                            {
                                                selectedPauta.semestre
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span
                                            className="block"
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.72rem",
                                            }}
                                        >
                                            Época
                                        </span>

                                        <span className="font-medium">
                                            {selectedPauta.epoca}
                                        </span>
                                    </div>

                                    <div>
                                        <span
                                            className="block mb-1"
                                            style={{
                                                color:
                                                    COLORS.muted,
                                                fontSize:
                                                    "0.72rem",
                                            }}
                                        >
                                            Estado
                                        </span>

                                        <Tag
                                            value={
                                                selectedPauta.estado
                                            }
                                            // severity={statusSeverity(
                                            //     selectedPauta.estado
                                            // )}
                                            rounded
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <div className="flex justify-content-end gap-2">
                            <Button
                                label="Baixar PDF"
                                icon={<Download size={16} />}
                                outlined
                            />

                            <Button
                                label="Partilhar"
                                icon={<Share2 size={16} />}
                                outlined
                            />

                            <Button
                                label="Arquivar"
                                icon={<Archive size={16} />}
                                disabled={
                                    selectedPauta.estado ===
                                    "Arquivada"
                                }
                                onClick={() => {
                                    archivePauta(
                                        selectedPauta.id
                                    );
                                    setPautaDialog(false);
                                    setSelectedPauta(null);
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div
                            className="p-5 border-round-xl text-center"
                            style={{
                                background: COLORS.background,
                                border: `1.5px dashed ${COLORS.border}`,
                            }}
                        >
                            <div
                                className="flex align-items-center justify-content-center mx-auto border-circle"
                                style={{
                                    width: 76,
                                    height: 76,
                                    background:
                                        COLORS.primaryLight,
                                }}
                            >
                                <Camera
                                    size={34}
                                    color={COLORS.primary}
                                />
                            </div>

                            <h3
                                className="mt-4 mb-2"
                                style={{
                                    color: COLORS.dark,
                                }}
                            >
                                Digitalizar nova pauta
                            </h3>

                            <p
                                className="m-0 mx-auto"
                                style={{
                                    maxWidth: 520,
                                    color: COLORS.muted,
                                    fontSize: "0.85rem",
                                    lineHeight: 1.6,
                                }}
                            >
                                Capture a pauta física com a câmara
                                do dispositivo. O sistema deverá
                                detectar as bordas, corrigir a
                                perspectiva e preparar o documento
                                para geração do PDF.
                            </p>

                            <div className="flex justify-content-center gap-2 mt-4 flex-wrap">
                                <Button
                                    label="Abrir câmara"
                                    icon={<Camera size={17} />}
                                />

                                <Button
                                    label="Importar imagem"
                                    icon={<Upload size={17} />}
                                    outlined
                                />
                            </div>
                        </div>

                        <div className="grid mt-2">
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-medium">
                                    Unidade Curricular
                                </label>

                                <Dropdown
                                    options={[
                                        "Programação Web",
                                        "Base de Dados",
                                        "Engenharia de Software",
                                        "Redes de Computadores",
                                    ]}
                                    placeholder="Seleccionar UC"
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-medium">
                                    Época
                                </label>

                                <Dropdown
                                    options={[
                                        "Normal",
                                        "Recorrente",
                                        "Especial",
                                    ]}
                                    placeholder="Seleccionar época"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="flex justify-content-end gap-2 mt-3">
                            <Button
                                label="Cancelar"
                                outlined
                                severity="secondary"
                                onClick={() =>
                                    setPautaDialog(false)
                                }
                            />

                            <Button
                                label="Guardar documento"
                                icon={<FileCheck2 size={16} />}
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}