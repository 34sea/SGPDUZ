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
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";

import {
    CalendarDays,
    BookOpen,
    Clock3,
    Plus,
    Search,
    Pencil,
    Trash2,
    Power,
    CheckCircle2,
    AlertCircle,
    GraduationCap,
    FileClock,
    Settings2,
    ArrowRight,
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

type Status = "Activo" | "Inactivo";

type PeriodType =
    | "Semestre"
    | "Férias"
    | "Interrupção"
    | "Avaliação";

type EventType =
    | "Início do semestre"
    | "Fim do semestre"
    | "Feriado"
    | "Avaliação"
    | "Interrupção lectiva"
    | "Outro";

interface AcademicYear {
    id: number;
    year: string;
    semester: string;
    startDate: string;
    endDate: string;
    status: Status;
}

interface AcademicPeriod {
    id: number;
    name: string;
    type: PeriodType;
    semester: string;
    startDate: string;
    endDate: string;
    status: Status;
}

interface AcademicEvent {
    id: number;
    title: string;
    type: EventType;
    semester: string;
    startDate: string;
    endDate: string;
    description: string;
};

/* =========================================================
   DADOS FICTÍCIOS
========================================================= */

const initialAcademicYears: AcademicYear[] = [
    {
        id: 1,
        year: "2026",
        semester: "Anual",
        startDate: "2026-02-02",
        endDate: "2026-12-18",
        status: "Activo",
    },
    {
        id: 2,
        year: "2025",
        semester: "Anual",
        startDate: "2025-02-03",
        endDate: "2025-12-19",
        status: "Inactivo",
    },
    {
        id: 3,
        year: "2024",
        semester: "Anual",
        startDate: "2024-02-05",
        endDate: "2024-12-20",
        status: "Inactivo",
    },
];

const initialPeriods: AcademicPeriod[] = [
    {
        id: 1,
        name: "1.º Semestre",
        type: "Semestre",
        semester: "1.º Semestre",
        startDate: "2026-02-02",
        endDate: "2026-06-26",
        status: "Activo",
    },
    {
        id: 2,
        name: "Interrupção do 1.º Semestre",
        type: "Interrupção",
        semester: "1.º Semestre",
        startDate: "2026-04-06",
        endDate: "2026-04-10",
        status: "Activo",
    },
    {
        id: 3,
        name: "Avaliações do 1.º Semestre",
        type: "Avaliação",
        semester: "1.º Semestre",
        startDate: "2026-06-15",
        endDate: "2026-06-26",
        status: "Activo",
    },
    {
        id: 4,
        name: "2.º Semestre",
        type: "Semestre",
        semester: "2.º Semestre",
        startDate: "2026-07-13",
        endDate: "2026-12-18",
        status: "Activo",
    },
    {
        id: 5,
        name: "Avaliações do 2.º Semestre",
        type: "Avaliação",
        semester: "2.º Semestre",
        startDate: "2026-11-30",
        endDate: "2026-12-11",
        status: "Activo",
    },
    {
        id: 6,
        name: "Férias Académicas",
        type: "Férias",
        semester: "Anual",
        startDate: "2026-06-29",
        endDate: "2026-07-10",
        status: "Activo",
    },
];

const initialEvents: AcademicEvent[] = [
    {
        id: 1,
        title: "Início do 1.º Semestre",
        type: "Início do semestre",
        semester: "1.º Semestre",
        startDate: "2026-02-02",
        endDate: "2026-02-02",
        description:
            "Início oficial das actividades lectivas do primeiro semestre.",
    },
    {
        id: 2,
        title: "Dia da Mulher Moçambicana",
        type: "Feriado",
        semester: "1.º Semestre",
        startDate: "2026-04-07",
        endDate: "2026-04-07",
        description:
            "Feriado nacional.",
    },
    {
        id: 3,
        title: "Semana de Avaliação Intercalar",
        type: "Avaliação",
        semester: "1.º Semestre",
        startDate: "2026-05-18",
        endDate: "2026-05-22",
        description:
            "Período destinado às avaliações intercalares.",
    },
    {
        id: 4,
        title: "Interrupção Lectiva",
        type: "Interrupção lectiva",
        semester: "1.º Semestre",
        startDate: "2026-04-06",
        endDate: "2026-04-10",
        description:
            "Interrupção das actividades lectivas.",
    },
    {
        id: 5,
        title: "Exames do 1.º Semestre",
        type: "Avaliação",
        semester: "1.º Semestre",
        startDate: "2026-06-15",
        endDate: "2026-06-26",
        description:
            "Período de exames do primeiro semestre.",
    },
    {
        id: 6,
        title: "Início do 2.º Semestre",
        type: "Início do semestre",
        semester: "2.º Semestre",
        startDate: "2026-07-13",
        endDate: "2026-07-13",
        description:
            "Início oficial das actividades do segundo semestre.",
    },
    {
        id: 7,
        title: "Semana de Avaliação Final",
        type: "Avaliação",
        semester: "2.º Semestre",
        startDate: "2026-11-30",
        endDate: "2026-12-11",
        description:
            "Período reservado para avaliações finais.",
    },
    {
        id: 8,
        title: "Encerramento do Ano Lectivo",
        type: "Fim do semestre",
        semester: "2.º Semestre",
        startDate: "2026-12-18",
        endDate: "2026-12-18",
        description:
            "Encerramento oficial das actividades académicas.",
    },
];

/* =========================================================
   FUNÇÕES
========================================================= */

const formatDate = (date: string) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
};

const formatDateRange = (
    startDate: string,
    endDate: string
) => {
    if (startDate === endDate) {
        return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/* =========================================================
   COMPONENTE
========================================================= */

export default function AcademicCalendarManagement() {
    const [academicYears, setAcademicYears] =
        useState<AcademicYear[]>(initialAcademicYears);

    const [periods, setPeriods] =
        useState<AcademicPeriod[]>(initialPeriods);

    const [events, setEvents] =
        useState<AcademicEvent[]>(initialEvents);

    const [activeSection, setActiveSection] = useState<
        "year" | "calendar"
    >("year");

    const [selectedSemester, setSelectedSemester] =
        useState<string>("Todos");

    const [yearSearch, setYearSearch] =
        useState("");

    const [eventSearch, setEventSearch] =
        useState("");

    const [eventType, setEventType] =
        useState<EventType | null>(null);

    const [yearDialog, setYearDialog] =
        useState(false);

    const [periodDialog, setPeriodDialog] =
        useState(false);

    const [eventDialog, setEventDialog] =
        useState(false);

    const [selectedYear, setSelectedYear] =
        useState<AcademicYear | null>(null);

    const [selectedPeriod, setSelectedPeriod] =
        useState<AcademicPeriod | null>(null);

    const [selectedEvent, setSelectedEvent] =
        useState<AcademicEvent | null>(null);

    /* =====================================================
       FORMULÁRIOS
    ===================================================== */

    const [yearForm, setYearForm] =
        useState<AcademicYear>({
            id: 0,
            year: "",
            semester: "Anual",
            startDate: "",
            endDate: "",
            status: "Activo",
        });

    const [periodForm, setPeriodForm] =
        useState<AcademicPeriod>({
            id: 0,
            name: "",
            type: "Semestre",
            semester: "1.º Semestre",
            startDate: "",
            endDate: "",
            status: "Activo",
        });

    const [eventForm, setEventForm] =
        useState<AcademicEvent>({
            id: 0,
            title: "",
            type: "Outro",
            semester: "1.º Semestre",
            startDate: "",
            endDate: "",
            description: "",
        });

    /* =====================================================
       ANO ACTIVO
    ===================================================== */

    const activeYear = academicYears.find(
        (year) => year.status === "Activo"
    );

    /* =====================================================
       ESTATÍSTICAS
    ===================================================== */

    const activeYears = academicYears.filter(
        (year) => year.status === "Activo"
    ).length;

    const activePeriods = periods.filter(
        (period) => period.status === "Activo"
    ).length;

    const evaluationPeriods = periods.filter(
        (period) => period.type === "Avaliação"
    ).length;

    const totalEvents = events.length;

    /* =====================================================
       FILTROS
    ===================================================== */

    const filteredYears = useMemo(() => {
        const search = yearSearch.toLowerCase();

        return academicYears.filter((year) =>
            year.year.toLowerCase().includes(search)
        );
    }, [academicYears, yearSearch]);

    const filteredEvents = useMemo(() => {
        const search = eventSearch.toLowerCase();

        return events.filter((event) => {
            const matchesSearch =
                event.title
                    .toLowerCase()
                    .includes(search) ||
                event.description
                    .toLowerCase()
                    .includes(search);

            const matchesSemester =
                selectedSemester === "Todos" ||
                event.semester === selectedSemester;

            const matchesType =
                !eventType || event.type === eventType;

            return (
                matchesSearch &&
                matchesSemester &&
                matchesType
            );
        });
    }, [
        events,
        eventSearch,
        selectedSemester,
        eventType,
    ]);

    /* =====================================================
       OPÇÕES
    ===================================================== */

    const semesterOptions = [
        {
            label: "Todos os semestres",
            value: "Todos",
        },
        {
            label: "1.º Semestre",
            value: "1.º Semestre",
        },
        {
            label: "2.º Semestre",
            value: "2.º Semestre",
        },
    ];

    const semesterOnlyOptions = [
        {
            label: "1.º Semestre",
            value: "1.º Semestre",
        },
        {
            label: "2.º Semestre",
            value: "2.º Semestre",
        },
        {
            label: "Anual",
            value: "Anual",
        },
    ];

    const periodTypeOptions = [
        {
            label: "Semestre",
            value: "Semestre",
        },
        {
            label: "Férias",
            value: "Férias",
        },
        {
            label: "Interrupção",
            value: "Interrupção",
        },
        {
            label: "Avaliação",
            value: "Avaliação",
        },
    ];

    const eventTypeOptions = [
        {
            label: "Todos os tipos",
            value: null,
        },
        {
            label: "Início do semestre",
            value: "Início do semestre",
        },
        {
            label: "Fim do semestre",
            value: "Fim do semestre",
        },
        {
            label: "Feriado",
            value: "Feriado",
        },
        {
            label: "Avaliação",
            value: "Avaliação",
        },
        {
            label: "Interrupção lectiva",
            value: "Interrupção lectiva",
        },
        {
            label: "Outro",
            value: "Outro",
        },
    ];

    /* =====================================================
       ANO LECTIVO
    ===================================================== */

    const openNewYear = () => {
        setSelectedYear(null);

        setYearForm({
            id: 0,
            year: "",
            semester: "Anual",
            startDate: "",
            endDate: "",
            status: "Activo",
        });

        setYearDialog(true);
    };

    const editYear = (year: AcademicYear) => {
        setSelectedYear(year);
        setYearForm({
            ...year,
        });

        setYearDialog(true);
    };

    const saveYear = () => {
        if (
            !yearForm.year ||
            !yearForm.startDate ||
            !yearForm.endDate
        ) {
            return;
        }

        if (yearForm.id === 0) {
            const newYear = {
                ...yearForm,
                id: Date.now(),
            };

            setAcademicYears((current) => [
                ...current,
                newYear,
            ]);
        } else {
            setAcademicYears((current) =>
                current.map((year) =>
                    year.id === yearForm.id
                        ? yearForm
                        : year
                )
            );
        }

        setYearDialog(false);
    };

    const toggleYear = (year: AcademicYear) => {
        setAcademicYears((current) =>
            current.map((item) =>
                item.id === year.id
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

    const deleteYear = (year: AcademicYear) => {
        setAcademicYears((current) =>
            current.filter(
                (item) => item.id !== year.id
            )
        );
    };

    /* =====================================================
       PERÍODOS
    ===================================================== */

    const openNewPeriod = () => {
        setSelectedPeriod(null);

        setPeriodForm({
            id: 0,
            name: "",
            type: "Semestre",
            semester: "1.º Semestre",
            startDate: "",
            endDate: "",
            status: "Activo",
        });

        setPeriodDialog(true);
    };

    const editPeriod = (period: AcademicPeriod) => {
        setSelectedPeriod(period);

        setPeriodForm({
            ...period,
        });

        setPeriodDialog(true);
    };

    const savePeriod = () => {
        if (
            !periodForm.name ||
            !periodForm.startDate ||
            !periodForm.endDate
        ) {
            return;
        }

        if (periodForm.id === 0) {
            setPeriods((current) => [
                ...current,
                {
                    ...periodForm,
                    id: Date.now(),
                },
            ]);
        } else {
            setPeriods((current) =>
                current.map((period) =>
                    period.id === periodForm.id
                        ? periodForm
                        : period
                )
            );
        }

        setPeriodDialog(false);
    };

    const togglePeriod = (period: AcademicPeriod) => {
        setPeriods((current) =>
            current.map((item) =>
                item.id === period.id
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

    const deletePeriod = (period: AcademicPeriod) => {
        setPeriods((current) =>
            current.filter(
                (item) => item.id !== period.id
            )
        );
    };

    /* =====================================================
       EVENTOS
    ===================================================== */

    const openNewEvent = () => {
        setSelectedEvent(null);

        setEventForm({
            id: 0,
            title: "",
            type: "Outro",
            semester: "1.º Semestre",
            startDate: "",
            endDate: "",
            description: "",
        });

        setEventDialog(true);
    };

    const editEvent = (event: AcademicEvent) => {
        setSelectedEvent(event);

        setEventForm({
            ...event,
        });

        setEventDialog(true);
    };

    const saveEvent = () => {
        if (
            !eventForm.title ||
            !eventForm.startDate ||
            !eventForm.endDate
        ) {
            return;
        }

        if (eventForm.id === 0) {
            setEvents((current) => [
                ...current,
                {
                    ...eventForm,
                    id: Date.now(),
                },
            ]);
        } else {
            setEvents((current) =>
                current.map((event) =>
                    event.id === eventForm.id
                        ? eventForm
                        : event
                )
            );
        }

        setEventDialog(false);
    };

    const deleteEvent = (event: AcademicEvent) => {
        setEvents((current) =>
            current.filter(
                (item) => item.id !== event.id
            )
        );
    };

    /* =====================================================
       TEMPLATES
    ===================================================== */

    const statusBody = (row: {
        status: Status;
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
            }}
        />
    );

    const yearDateBody = (row: AcademicYear) => (
        <span
            style={{
                color: COLORS.text,
                fontSize: "0.82rem",
            }}
        >
            {formatDateRange(
                row.startDate,
                row.endDate
            )}
        </span>
    );

    const periodDateBody = (row: AcademicPeriod) => (
        <span
            style={{
                color: COLORS.text,
                fontSize: "0.8rem",
            }}
        >
            {formatDateRange(
                row.startDate,
                row.endDate
            )}
        </span>
    );

    const eventDateBody = (row: AcademicEvent) => (
        <span
            style={{
                color: COLORS.text,
                fontSize: "0.8rem",
            }}
        >
            {formatDateRange(
                row.startDate,
                row.endDate
            )}
        </span>
    );

    const periodTypeBody = (row: AcademicPeriod) => {
        const colors: Record<
            PeriodType,
            {
                background: string;
                color: string;
            }
        > = {
            Semestre: {
                background: COLORS.primaryLight,
                color: COLORS.primary,
            },
            Férias: {
                background: COLORS.greenLight,
                color: COLORS.green,
            },
            Interrupção: {
                background: COLORS.orangeLight,
                color: COLORS.orange,
            },
            Avaliação: {
                background: COLORS.purpleLight,
                color: COLORS.purple,
            },
        };

        return (
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "6px",
                    background:
                        colors[row.type].background,
                    color: colors[row.type].color,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                }}
            >
                {row.type}
            </span>
        );
    };

    const eventTypeBody = (row: AcademicEvent) => {
        const iconMap: Record<EventType, React.ReactNode> = {
            "Início do semestre": (
                <ArrowRight size={13} />
            ),
            "Fim do semestre": (
                <CheckCircle2 size={13} />
            ),
            Feriado: <CalendarDays size={13} />,
            Avaliação: <GraduationCap size={13} />,
            "Interrupção lectiva": (
                <Clock3 size={13} />
            ),
            Outro: <FileClock size={13} />,
        };

        const colorMap: Record<
            EventType,
            {
                background: string;
                color: string;
            }
        > = {
            "Início do semestre": {
                background: COLORS.greenLight,
                color: COLORS.green,
            },
            "Fim do semestre": {
                background: COLORS.primaryLight,
                color: COLORS.primary,
            },
            Feriado: {
                background: COLORS.orangeLight,
                color: COLORS.orange,
            },
            Avaliação: {
                background: COLORS.purpleLight,
                color: COLORS.purple,
            },
            "Interrupção lectiva": {
                background: COLORS.redLight,
                color: COLORS.red,
            },
            Outro: {
                background: COLORS.cyanLight,
                color: COLORS.cyan,
            },
        };

        return (
            <span
                className="flex align-items-center gap-2"
                style={{
                    width: "fit-content",
                    padding: "0.3rem 0.55rem",
                    borderRadius: "6px",
                    background:
                        colorMap[row.type].background,
                    color: colorMap[row.type].color,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                }}
            >
                {iconMap[row.type]}
                {row.type}
            </span>
        );
    };

    const yearActions = (row: AcademicYear) => (
        <div className="flex gap-1">
            <Button
                icon={<Pencil size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Editar"
                onClick={() => editYear(row)}
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
                onClick={() => toggleYear(row)}
            />

            <Button
                icon={<Trash2 size={15} />}
                text
                rounded
                severity="danger"
                tooltip="Remover"
                onClick={() => deleteYear(row)}
            />
        </div>
    );

    const periodActions = (row: AcademicPeriod) => (
        <div className="flex gap-1">
            <Button
                icon={<Pencil size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Editar"
                onClick={() => editPeriod(row)}
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
                    togglePeriod(row)
                }
            />

            <Button
                icon={<Trash2 size={15} />}
                text
                rounded
                severity="danger"
                tooltip="Remover"
                onClick={() =>
                    deletePeriod(row)
                }
            />
        </div>
    );

    const eventActions = (row: AcademicEvent) => (
        <div className="flex gap-1">
            <Button
                icon={<Pencil size={15} />}
                text
                rounded
                severity="secondary"
                tooltip="Editar"
                onClick={() => editEvent(row)}
            />

            <Button
                icon={<Trash2 size={15} />}
                text
                rounded
                severity="danger"
                tooltip="Remover"
                onClick={() => deleteEvent(row)}
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
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: COLORS.dark,
                        }}
                    >
                        Gestão do Ano Lectivo e
                        Calendário Académico
                    </div>

                    <div
                        style={{
                            color: COLORS.muted,
                            fontSize: "0.85rem",
                            marginTop: "5px",
                        }}
                    >
                        Configure os períodos académicos,
                        calendário lectivo e eventos utilizados
                        na geração da dosificação.
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        label="Novo ano lectivo"
                        icon={<Plus size={16} />}
                        severity="secondary"
                        outlined
                        onClick={openNewYear}
                    />

                    <Button
                        label="Novo evento"
                        icon={<Plus size={16} />}
                        onClick={openNewEvent}
                        style={{
                            background:
                                COLORS.primary,
                            borderColor:
                                COLORS.primary,
                        }}
                    />
                </div>
            </div>

            {/* =================================================
                ANO ACTIVO
            ================================================= */}

            <div
                style={{
                    background:
                        "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "10px",
                    padding: "1rem 1.15rem",
                    marginBottom: "1rem",
                }}
            >
                <div className="flex justify-content-between align-items-center">
                    <div className="flex align-items-center gap-3">
                        <div
                            style={{
                                width: "45px",
                                height: "45px",
                                borderRadius: "10px",
                                background:
                                    COLORS.primary,
                                color: COLORS.white,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CalendarDays size={22} />
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: "0.72rem",
                                    color: COLORS.muted,
                                }}
                            >
                                ANO LECTIVO ACTIVO
                            </div>

                            <div
                                style={{
                                    fontSize: "1.15rem",
                                    fontWeight: 700,
                                    color: COLORS.dark,
                                    marginTop: "2px",
                                }}
                            >
                                {activeYear
                                    ? `Ano Lectivo ${activeYear.year}`
                                    : "Nenhum ano activo"}
                            </div>

                            {activeYear && (
                                <div
                                    style={{
                                        fontSize:
                                            "0.75rem",
                                        color:
                                            COLORS.muted,
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    {formatDateRange(
                                        activeYear.startDate,
                                        activeYear.endDate
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {activeYear && (
                        <Tag
                            value="Activo"
                            severity="success"
                        />
                    )}
                </div>
            </div>

            {/* =================================================
                INDICADORES
            ================================================= */}

            <div className="grid mb-3">
                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1rem",
                        }}
                    >
                        <div className="flex justify-content-between">
                            <div>
                                <div
                                    style={{
                                        color: COLORS.muted,
                                        fontSize:
                                            "0.76rem",
                                    }}
                                >
                                    Anos lectivos
                                </div>

                                <div
                                    style={{
                                        color: COLORS.dark,
                                        fontWeight: 700,
                                        fontSize:
                                            "1.6rem",
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    {
                                        academicYears.length
                                    }
                                </div>

                                <div
                                    style={{
                                        color: COLORS.green,
                                        fontSize:
                                            "0.7rem",
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    {activeYears} activo
                                </div>
                            </div>

                            <CalendarDays
                                size={22}
                                color={COLORS.primary}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1rem",
                        }}
                    >
                        <div className="flex justify-content-between">
                            <div>
                                <div
                                    style={{
                                        color: COLORS.muted,
                                        fontSize:
                                            "0.76rem",
                                    }}
                                >
                                    Períodos lectivos
                                </div>

                                <div
                                    style={{
                                        color: COLORS.dark,
                                        fontWeight: 700,
                                        fontSize:
                                            "1.6rem",
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    {
                                        periods.length
                                    }
                                </div>

                                <div
                                    style={{
                                        color: COLORS.green,
                                        fontSize:
                                            "0.7rem",
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    {activePeriods} activos
                                </div>
                            </div>

                            <Clock3
                                size={22}
                                color={COLORS.green}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1rem",
                        }}
                    >
                        <div className="flex justify-content-between">
                            <div>
                                <div
                                    style={{
                                        color: COLORS.muted,
                                        fontSize:
                                            "0.76rem",
                                    }}
                                >
                                    Períodos de avaliação
                                </div>

                                <div
                                    style={{
                                        color: COLORS.dark,
                                        fontWeight: 700,
                                        fontSize:
                                            "1.6rem",
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    {
                                        evaluationPeriods
                                    }
                                </div>

                                <div
                                    style={{
                                        color:
                                            COLORS.purple,
                                        fontSize:
                                            "0.7rem",
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    Integrados no calendário
                                </div>
                            </div>

                            <GraduationCap
                                size={22}
                                color={COLORS.purple}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div
                        style={{
                            background: COLORS.white,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "10px",
                            padding: "1rem",
                        }}
                    >
                        <div className="flex justify-content-between">
                            <div>
                                <div
                                    style={{
                                        color: COLORS.muted,
                                        fontSize:
                                            "0.76rem",
                                    }}
                                >
                                    Eventos académicos
                                </div>

                                <div
                                    style={{
                                        color: COLORS.dark,
                                        fontWeight: 700,
                                        fontSize:
                                            "1.6rem",
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    {totalEvents}
                                </div>

                                <div
                                    style={{
                                        color:
                                            COLORS.orange,
                                        fontSize:
                                            "0.7rem",
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    Registados no calendário
                                </div>
                            </div>

                            <FileClock
                                size={22}
                                color={COLORS.orange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                ÁREA DE CONFIGURAÇÃO
            ================================================= */}

            <div className="grid mb-3">
                <div className="col-12 lg:col-8">
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
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: COLORS.dark,
                                    }}
                                >
                                    Linha temporal do ano lectivo
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            "0.76rem",
                                        color:
                                            COLORS.muted,
                                        marginTop:
                                            "4px",
                                    }}
                                >
                                    Visualização dos principais
                                    períodos configurados.
                                </div>
                            </div>

                            <Settings2
                                size={19}
                                color={COLORS.primary}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: "0.7rem",
                            }}
                        >
                            {periods.map(
                                (period) => {
                                    const typeColors: Record<
                                        PeriodType,
                                        string
                                    > = {
                                        Semestre:
                                            COLORS.primary,
                                        Férias:
                                            COLORS.green,
                                        Interrupção:
                                            COLORS.orange,
                                        Avaliação:
                                            COLORS.purple,
                                    };

                                    return (
                                        <div
                                            key={
                                                period.id
                                            }
                                            style={{
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "10px 1fr auto",
                                                gap: "0.7rem",
                                                alignItems:
                                                    "center",
                                                padding:
                                                    "0.65rem",
                                                border: `1px solid ${COLORS.border}`,
                                                borderRadius:
                                                    "8px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "10px",
                                                    height: "10px",
                                                    borderRadius:
                                                        "50%",
                                                    background:
                                                        typeColors[
                                                            period
                                                                .type
                                                        ],
                                                }}
                                            />

                                            <div>
                                                <div
                                                    style={{
                                                        fontSize:
                                                            "0.8rem",
                                                        fontWeight:
                                                            600,
                                                        color:
                                                            COLORS.dark,
                                                    }}
                                                >
                                                    {
                                                        period.name
                                                    }
                                                </div>

                                                <div
                                                    style={{
                                                        fontSize:
                                                            "0.7rem",
                                                        color:
                                                            COLORS.muted,
                                                        marginTop:
                                                            "2px",
                                                    }}
                                                >
                                                    {
                                                        period.semester
                                                    }{" "}
                                                    ·{" "}
                                                    {formatDateRange(
                                                        period.startDate,
                                                        period.endDate
                                                    )}
                                                </div>
                                            </div>

                                            <span
                                                style={{
                                                    fontSize:
                                                        "0.68rem",
                                                    color:
                                                        typeColors[
                                                            period
                                                                .type
                                                        ],
                                                    fontWeight:
                                                        600,
                                                }}
                                            >
                                                {
                                                    period.type
                                                }
                                            </span>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 lg:col-4">
                    <div
                        style={{
                            background:
                                COLORS.dark,
                            borderRadius: "10px",
                            padding: "1.2rem",
                            height: "100%",
                            color: COLORS.white,
                        }}
                    >
                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "9px",
                                background:
                                    "rgba(255,255,255,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                marginBottom:
                                    "1rem",
                            }}
                        >
                            <BookOpen
                                size={21}
                            />
                        </div>

                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: "1rem",
                            }}
                        >
                            Geração automática da
                            dosificação
                        </div>

                        <div
                            style={{
                                fontSize: "0.78rem",
                                lineHeight: 1.6,
                                color: "#CBD5E1",
                                marginTop:
                                    "0.65rem",
                            }}
                        >
                            O calendário académico
                            fornece ao sistema as datas
                            disponíveis para organizar
                            automaticamente os conteúdos,
                            aulas, avaliações e períodos
                            de interrupção.
                        </div>

                        <Divider
                            style={{
                                borderColor:
                                    "rgba(255,255,255,0.12)",
                            }}
                        />

                        <div className="flex flex-column gap-3">
                            <div className="flex align-items-center gap-2">
                                <CheckCircle2
                                    size={16}
                                    color="#4ADE80"
                                />

                                <span
                                    style={{
                                        fontSize:
                                            "0.76rem",
                                        color:
                                            "#E2E8F0",
                                    }}
                                >
                                    Semestres configurados
                                </span>
                            </div>

                            <div className="flex align-items-center gap-2">
                                <CheckCircle2
                                    size={16}
                                    color="#4ADE80"
                                />

                                <span
                                    style={{
                                        fontSize:
                                            "0.76rem",
                                        color:
                                            "#E2E8F0",
                                    }}
                                >
                                    Avaliações identificadas
                                </span>
                            </div>

                            <div className="flex align-items-center gap-2">
                                <CheckCircle2
                                    size={16}
                                    color="#4ADE80"
                                />

                                <span
                                    style={{
                                        fontSize:
                                            "0.76rem",
                                        color:
                                            "#E2E8F0",
                                    }}
                                >
                                    Interrupções consideradas
                                </span>
                            </div>

                            <div className="flex align-items-center gap-2">
                                <CheckCircle2
                                    size={16}
                                    color="#4ADE80"
                                />

                                <span
                                    style={{
                                        fontSize:
                                            "0.76rem",
                                        color:
                                            "#E2E8F0",
                                    }}
                                >
                                    Feriados considerados
                                </span>
                            </div>
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
                        setActiveSection("year")
                    }
                    style={{
                        border: "none",
                        cursor: "pointer",
                        padding: "0.7rem 1rem",
                        borderRadius: "7px",
                        background:
                            activeSection === "year"
                                ? COLORS.primaryLight
                                : "transparent",
                        color:
                            activeSection === "year"
                                ? COLORS.primary
                                : COLORS.muted,
                        fontWeight:
                            activeSection === "year"
                                ? 600
                                : 500,
                    }}
                >
                    <span className="flex align-items-center gap-2">
                        <CalendarDays size={16} />
                        Ano Lectivo
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setActiveSection("calendar")
                    }
                    style={{
                        border: "none",
                        cursor: "pointer",
                        padding: "0.7rem 1rem",
                        borderRadius: "7px",
                        background:
                            activeSection ===
                            "calendar"
                                ? COLORS.primaryLight
                                : "transparent",
                        color:
                            activeSection ===
                            "calendar"
                                ? COLORS.primary
                                : COLORS.muted,
                        fontWeight:
                            activeSection ===
                            "calendar"
                                ? 600
                                : 500,
                    }}
                >
                    <span className="flex align-items-center gap-2">
                        <CalendarDays size={16} />
                        Calendário Académico
                    </span>
                </button>
            </div>

            {/* =================================================
                ANO LECTIVO
            ================================================= */}

            {activeSection === "year" && (
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
                                Configuração do Ano Lectivo
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        "0.76rem",
                                    color:
                                        COLORS.muted,
                                    marginTop:
                                        "3px",
                                }}
                            >
                                Defina o período académico
                                utilizado pela instituição.
                            </div>
                        </div>

                        <Button
                            label="Adicionar ano"
                            icon={<Plus size={16} />}
                            onClick={openNewYear}
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
                                flex:
                                    "1 1 280px",
                            }}
                        >
                            <Search size={16} />

                            <InputText
                                value={yearSearch}
                                onChange={(event) =>
                                    setYearSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Pesquisar ano lectivo..."
                                style={{
                                    width: "100%",
                                }}
                            />
                        </span>
                    </div>

                    <DataTable
                        value={filteredYears}
                        paginator
                        rows={5}
                        stripedRows
                        responsiveLayout="scroll"
                        emptyMessage="Nenhum ano lectivo encontrado."
                        rowHover
                    >
                        <Column
                            field="year"
                            header="Ano Lectivo"
                            body={(row) => (
                                <div>
                                    <div
                                        style={{
                                            fontWeight:
                                                700,
                                            color:
                                                COLORS.dark,
                                        }}
                                    >
                                        {row.year}
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "0.7rem",
                                            color:
                                                COLORS.muted,
                                            marginTop:
                                                "3px",
                                        }}
                                    >
                                        {
                                            row.semester
                                        }
                                    </div>
                                </div>
                            )}
                        />

                        <Column
                            field="semester"
                            header="Período"
                        />

                        <Column
                            header="Data inicial / final"
                            body={
                                yearDateBody
                            }
                        />

                        <Column
                            header="Estado"
                            body={statusBody}
                        />

                        <Column
                            header="Acções"
                            body={yearActions}
                            style={{
                                width: "150px",
                            }}
                        />
                    </DataTable>

                    <Divider />

                    <div className="flex justify-content-between align-items-center mb-3">
                        <div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    color: COLORS.dark,
                                }}
                            >
                                Períodos Lectivos
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        "0.75rem",
                                    color:
                                        COLORS.muted,
                                    marginTop:
                                        "3px",
                                }}
                            >
                                Configure semestres, férias,
                                interrupções e períodos de
                                avaliação.
                            </div>
                        </div>

                        <Button
                            label="Novo período"
                            icon={<Plus size={15} />}
                            outlined
                            onClick={
                                openNewPeriod
                            }
                        />
                    </div>

                    <DataTable
                        value={periods}
                        paginator
                        rows={6}
                        stripedRows
                        responsiveLayout="scroll"
                        emptyMessage="Nenhum período configurado."
                    >
                        <Column
                            field="name"
                            header="Período"
                            body={(row) => (
                                <div>
                                    <div
                                        style={{
                                            fontWeight:
                                                600,
                                            color:
                                                COLORS.dark,
                                            fontSize:
                                                "0.82rem",
                                        }}
                                    >
                                        {row.name}
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "0.7rem",
                                            color:
                                                COLORS.muted,
                                            marginTop:
                                                "3px",
                                        }}
                                    >
                                        {
                                            row.semester
                                        }
                                    </div>
                                </div>
                            )}
                        />

                        <Column
                            header="Tipo"
                            body={
                                periodTypeBody
                            }
                        />

                        <Column
                            header="Período"
                            body={
                                periodDateBody
                            }
                        />

                        <Column
                            header="Estado"
                            body={statusBody}
                        />

                        <Column
                            header="Acções"
                            body={
                                periodActions
                            }
                            style={{
                                width: "150px",
                            }}
                        />
                    </DataTable>
                </div>
            )}

            {/* =================================================
                CALENDÁRIO
            ================================================= */}

            {activeSection === "calendar" && (
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
                                Calendário Académico
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        "0.76rem",
                                    color:
                                        COLORS.muted,
                                    marginTop:
                                        "3px",
                                }}
                            >
                                Registe feriados, avaliações,
                                interrupções e outros eventos
                                académicos.
                            </div>
                        </div>

                        <Button
                            label="Adicionar evento"
                            icon={<Plus size={16} />}
                            onClick={openNewEvent}
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
                                flex:
                                    "1 1 300px",
                            }}
                        >
                            <Search size={16} />

                            <InputText
                                value={eventSearch}
                                onChange={(event) =>
                                    setEventSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Pesquisar evento..."
                                style={{
                                    width: "100%",
                                }}
                            />
                        </span>

                        <Dropdown
                            value={
                                selectedSemester
                            }
                            options={
                                semesterOptions
                            }
                            onChange={(event) =>
                                setSelectedSemester(
                                    event.value
                                )
                            }
                            style={{
                                minWidth: "190px",
                            }}
                        />

                        <Dropdown
                            value={eventType}
                            options={
                                eventTypeOptions
                            }
                            onChange={(event) =>
                                setEventType(
                                    event.value
                                )
                            }
                            placeholder="Tipo de evento"
                            style={{
                                minWidth: "210px",
                            }}
                        />
                    </div>

                    {/* RESUMO DOS EVENTOS */}

                    <div className="grid mb-3">
                        <div className="col-12 md:col-4">
                            <div
                                style={{
                                    padding:
                                        "0.8rem",
                                    background:
                                        COLORS.primaryLight,
                                    borderRadius:
                                        "8px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize:
                                            "0.7rem",
                                        color:
                                            COLORS.primary,
                                    }}
                                >
                                    1.º SEMESTRE
                                </div>

                                <div
                                    style={{
                                        fontWeight:
                                            700,
                                        color:
                                            COLORS.dark,
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    02 Fev — 26 Jun
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-4">
                            <div
                                style={{
                                    padding:
                                        "0.8rem",
                                    background:
                                        COLORS.purpleLight,
                                    borderRadius:
                                        "8px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize:
                                            "0.7rem",
                                        color:
                                            COLORS.purple,
                                    }}
                                >
                                    AVALIAÇÕES
                                </div>

                                <div
                                    style={{
                                        fontWeight:
                                            700,
                                        color:
                                            COLORS.dark,
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    {evaluationPeriods} períodos
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-4">
                            <div
                                style={{
                                    padding:
                                        "0.8rem",
                                    background:
                                        COLORS.greenLight,
                                    borderRadius:
                                        "8px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize:
                                            "0.7rem",
                                        color:
                                            COLORS.green,
                                    }}
                                >
                                    2.º SEMESTRE
                                </div>

                                <div
                                    style={{
                                        fontWeight:
                                            700,
                                        color:
                                            COLORS.dark,
                                        marginTop:
                                            "3px",
                                    }}
                                >
                                    13 Jul — 18 Dez
                                </div>
                            </div>
                        </div>
                    </div>

                    <DataTable
                        value={filteredEvents}
                        paginator
                        rows={8}
                        stripedRows
                        responsiveLayout="scroll"
                        emptyMessage="Nenhum evento encontrado."
                        rowHover
                    >
                        <Column
                            header="Evento"
                            body={(row) => (
                                <div
                                    style={{
                                        maxWidth:
                                            "320px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight:
                                                600,
                                            color:
                                                COLORS.dark,
                                            fontSize:
                                                "0.82rem",
                                        }}
                                    >
                                        {row.title}
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "0.7rem",
                                            color:
                                                COLORS.muted,
                                            marginTop:
                                                "3px",
                                        }}
                                    >
                                        {
                                            row.description
                                        }
                                    </div>
                                </div>
                            )}
                        />

                        <Column
                            header="Tipo"
                            body={
                                eventTypeBody
                            }
                        />

                        <Column
                            field="semester"
                            header="Semestre"
                        />

                        <Column
                            header="Data"
                            body={
                                eventDateBody
                            }
                        />

                        <Column
                            header="Acções"
                            body={
                                eventActions
                            }
                            style={{
                                width: "110px",
                            }}
                        />
                    </DataTable>
                </div>
            )}

            {/* =================================================
                DIALOG ANO LECTIVO
            ================================================= */}

            <Dialog
                visible={yearDialog}
                onHide={() =>
                    setYearDialog(false)
                }
                header={
                    yearForm.id === 0
                        ? "Novo ano lectivo"
                        : "Editar ano lectivo"
                }
                style={{
                    width: "520px",
                    maxWidth: "95vw",
                }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            severity="secondary"
                            outlined
                            onClick={() =>
                                setYearDialog(
                                    false
                                )
                            }
                        />

                        <Button
                            label="Guardar"
                            onClick={saveYear}
                        />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-2">
                            Ano lectivo
                        </label>

                        <InputText
                            value={yearForm.year}
                            onChange={(event) =>
                                setYearForm(
                                    (current) => ({
                                        ...current,
                                        year: event
                                            .target
                                            .value,
                                    })
                                )
                            }
                            placeholder="Ex.: 2027"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Período
                        </label>

                        <Dropdown
                            value={
                                yearForm.semester
                            }
                            options={
                                semesterOnlyOptions
                            }
                            onChange={(event) =>
                                setYearForm(
                                    (current) => ({
                                        ...current,
                                        semester:
                                            event.value,
                                    })
                                )
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Data inicial
                            </label>

                            <Calendar
                                value={
                                    yearForm.startDate
                                        ? new Date(
                                              `${yearForm.startDate}T00:00:00`
                                          )
                                        : null
                                }
                                onChange={(event) => {
                                    if (
                                        event.value instanceof
                                        Date
                                    ) {
                                        const date =
                                            event.value;

                                        const value =
                                            date
                                                .toISOString()
                                                .split(
                                                    "T"
                                                )[0];

                                        setYearForm(
                                            (current) => ({
                                                ...current,
                                                startDate:
                                                    value,
                                            })
                                        );
                                    }
                                }}
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Data final
                            </label>

                            <Calendar
                                value={
                                    yearForm.endDate
                                        ? new Date(
                                              `${yearForm.endDate}T00:00:00`
                                          )
                                        : null
                                }
                                onChange={(event) => {
                                    if (
                                        event.value instanceof
                                        Date
                                    ) {
                                        const date =
                                            event.value;

                                        const value =
                                            date
                                                .toISOString()
                                                .split(
                                                    "T"
                                                )[0];

                                        setYearForm(
                                            (current) => ({
                                                ...current,
                                                endDate:
                                                    value,
                                            })
                                        );
                                    }
                                }}
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div
                        className="flex justify-content-between align-items-center"
                        style={{
                            background:
                                COLORS.background,
                            padding: "0.85rem",
                            borderRadius: "8px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontWeight:
                                        600,
                                    color:
                                        COLORS.text,
                                    fontSize:
                                        "0.82rem",
                                }}
                            >
                                Ano lectivo activo
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        "0.72rem",
                                    color:
                                        COLORS.muted,
                                    marginTop:
                                        "3px",
                                }}
                            >
                                Disponibilizar este ano para
                                utilização académica.
                            </div>
                        </div>

                        <InputSwitch
                            checked={
                                yearForm.status ===
                                "Activo"
                            }
                            onChange={(event) =>
                                setYearForm(
                                    (current) => ({
                                        ...current,
                                        status:
                                            event.value
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
                DIALOG PERÍODO
            ================================================= */}

            <Dialog
                visible={periodDialog}
                onHide={() =>
                    setPeriodDialog(false)
                }
                header={
                    periodForm.id === 0
                        ? "Novo período lectivo"
                        : "Editar período lectivo"
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
                                setPeriodDialog(
                                    false
                                )
                            }
                        />

                        <Button
                            label="Guardar"
                            onClick={savePeriod}
                        />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-2">
                            Nome do período
                        </label>

                        <InputText
                            value={
                                periodForm.name
                            }
                            onChange={(event) =>
                                setPeriodForm(
                                    (current) => ({
                                        ...current,
                                        name: event
                                            .target
                                            .value,
                                    })
                                )
                            }
                            placeholder="Ex.: 1.º Semestre"
                            className="w-full"
                        />
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Tipo
                            </label>

                            <Dropdown
                                value={
                                    periodForm.type
                                }
                                options={
                                    periodTypeOptions
                                }
                                onChange={(event) =>
                                    setPeriodForm(
                                        (current) => ({
                                            ...current,
                                            type: event
                                                .value,
                                        })
                                    )
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Semestre
                            </label>

                            <Dropdown
                                value={
                                    periodForm.semester
                                }
                                options={
                                    semesterOnlyOptions
                                }
                                onChange={(event) =>
                                    setPeriodForm(
                                        (current) => ({
                                            ...current,
                                            semester:
                                                event
                                                    .value,
                                        })
                                    )
                                }
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Data inicial
                            </label>

                            <InputText
                                value={
                                    periodForm.startDate
                                }
                                onChange={(event) =>
                                    setPeriodForm(
                                        (current) => ({
                                            ...current,
                                            startDate:
                                                event
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="AAAA-MM-DD"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Data final
                            </label>

                            <InputText
                                value={
                                    periodForm.endDate
                                }
                                onChange={(event) =>
                                    setPeriodForm(
                                        (current) => ({
                                            ...current,
                                            endDate:
                                                event
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="AAAA-MM-DD"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div
                        className="flex justify-content-between align-items-center"
                        style={{
                            background:
                                COLORS.background,
                            padding: "0.85rem",
                            borderRadius: "8px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontWeight:
                                        600,
                                    color:
                                        COLORS.text,
                                    fontSize:
                                        "0.82rem",
                                }}
                            >
                                Período activo
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        "0.72rem",
                                    color:
                                        COLORS.muted,
                                }}
                            >
                                Considerar este período na
                                organização académica.
                            </div>
                        </div>

                        <InputSwitch
                            checked={
                                periodForm.status ===
                                "Activo"
                            }
                            onChange={(event) =>
                                setPeriodForm(
                                    (current) => ({
                                        ...current,
                                        status:
                                            event.value
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
                DIALOG EVENTO
            ================================================= */}

            <Dialog
                visible={eventDialog}
                onHide={() =>
                    setEventDialog(false)
                }
                header={
                    eventForm.id === 0
                        ? "Novo evento académico"
                        : "Editar evento académico"
                }
                style={{
                    width: "560px",
                    maxWidth: "95vw",
                }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            severity="secondary"
                            outlined
                            onClick={() =>
                                setEventDialog(
                                    false
                                )
                            }
                        />

                        <Button
                            label="Guardar"
                            onClick={saveEvent}
                        />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-2">
                            Nome do evento
                        </label>

                        <InputText
                            value={
                                eventForm.title
                            }
                            onChange={(event) =>
                                setEventForm(
                                    (current) => ({
                                        ...current,
                                        title: event
                                            .target
                                            .value,
                                    })
                                )
                            }
                            placeholder="Ex.: Semana de Avaliação"
                            className="w-full"
                        />
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Tipo de evento
                            </label>

                            <Dropdown
                                value={
                                    eventForm.type
                                }
                                options={
                                    eventTypeOptions.filter(
                                        (option) =>
                                            option
                                                .value !==
                                            null
                                    )}
                                onChange={(event) =>
                                    setEventForm(
                                        (current) => ({
                                            ...current,
                                            type: event
                                                .value,
                                        })
                                    )
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Semestre
                            </label>

                            <Dropdown
                                value={
                                    eventForm.semester
                                }
                                options={
                                    semesterOnlyOptions.filter(
                                        (option) =>
                                            option
                                                .value !==
                                            "Anual"
                                    )}
                                onChange={(event) =>
                                    setEventForm(
                                        (current) => ({
                                            ...current,
                                            semester:
                                                event
                                                    .value,
                                        })
                                    )
                                }
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Data inicial
                            </label>

                            <InputText
                                value={
                                    eventForm.startDate
                                }
                                onChange={(event) =>
                                    setEventForm(
                                        (current) => ({
                                            ...current,
                                            startDate:
                                                event
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="AAAA-MM-DD"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2">
                                Data final
                            </label>

                            <InputText
                                value={
                                    eventForm.endDate
                                }
                                onChange={(event) =>
                                    setEventForm(
                                        (current) => ({
                                            ...current,
                                            endDate:
                                                event
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="AAAA-MM-DD"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2">
                            Descrição
                        </label>

                        <InputText
                            value={
                                eventForm.description
                            }
                            onChange={(event) =>
                                setEventForm(
                                    (current) => ({
                                        ...current,
                                        description:
                                            event
                                                .target
                                                .value,
                                    })
                                )
                            }
                            placeholder="Descrição do evento académico..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}