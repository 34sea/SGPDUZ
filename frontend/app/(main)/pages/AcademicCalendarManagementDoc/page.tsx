"use client";

import React, { useEffect, useMemo, useState } from "react";

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

import {
    getAcademicYears,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
} from "@/app/api/calendar/calendarService";
// import { getHolidays } from "@/app/api/calendar/calendarService";

// import { getAcademicYears } from "@/app/api/gestaoAcademica/gestaoAcademicService";

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
    year: string | number;
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
}

/* =========================================================
   FUNÇÕES DE APOIO
========================================================= */

const formatDate = (date: string) => {
    if (!date) return "-";
    const cleanDate = date.split("T")[0];
    const [year, month, day] = cleanDate.split("-");
    if (!year || !month || !day) return date;
    return `${day}/${month}/${year}`;
};

const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate && !endDate) return "-";
    if (startDate === endDate || !endDate) {
        return formatDate(startDate);
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function AcademicCalendarManagement() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
    const [events, setEvents] = useState<AcademicEvent[]>([]);
    const [loading, setLoading] = useState(false);

    const [activeSection, setActiveSection] = useState<"year" | "calendar">("year");
    const [selectedSemester, setSelectedSemester] = useState<string>("Todos");
    const [yearSearch, setYearSearch] = useState("");
    const [eventSearch, setEventSearch] = useState("");
    const [eventType, setEventType] = useState<EventType | null>(null);

    const [yearDialog, setYearDialog] = useState(false);
    const [periodDialog, setPeriodDialog] = useState(false);
    const [eventDialog, setEventDialog] = useState(false);

    const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<AcademicPeriod | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);

    /* =====================================================
       FORMULÁRIOS
    ===================================================== */

    const [yearForm, setYearForm] = useState<{
        id: number;
        year: string;
        semester: '1' | '2' | 'Anual';
        startDate: string;
        endDate: string;
        status: Status;
    }>({
        id: 0,
        year: "",
        semester: "1",
        startDate: "",
        endDate: "",
        status: "Activo",
    });

    const [periodForm, setPeriodForm] = useState<AcademicPeriod>({
        id: 0,
        name: "",
        type: "Semestre",
        semester: "1.º Semestre",
        startDate: "",
        endDate: "",
        status: "Activo",
    });

    const [eventForm, setEventForm] = useState<AcademicEvent>({
        id: 0,
        title: "",
        type: "Feriado",
        semester: "1.º Semestre",
        startDate: "",
        endDate: "",
        description: "",
    });

    /* =====================================================
       CARREGAMENTO DE DADOS DO BACKEND
    ===================================================== */

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Buscar Anos Lectivos do Backend
            const yearsRes = await getAcademicYears();
            const mappedYears: AcademicYear[] = (yearsRes || []).map((y: any) => ({
                id: y.id,
                year: y.year,
                semester: y.semester === '1' ? '1.º Semestre' : y.semester === '2' ? '2.º Semestre' : y.semester,
                startDate: y.start_date,
                endDate: y.end_date,
                status: y.is_active ? "Activo" : "Inactivo",
            }));
            setAcademicYears(mappedYears);

            // 2. Buscar Feriados / Eventos do Backend
            const holidaysRes = await getHolidays();
            const mappedHolidays: AcademicEvent[] = (holidaysRes || []).map((h: any) => ({
                id: h.id,
                title: h.description,
                type: "Feriado",
                semester: "1.º Semestre",
                startDate: h.date,
                endDate: h.date,
                description: h.description,
            }));
            setEvents(mappedHolidays);
        } catch (error) {
            console.error("Erro ao carregar dados do calendário:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* =====================================================
       ANO ACTIVO & ESTATÍSTICAS
    ===================================================== */

    const activeYear = academicYears.find((year) => year.status === "Activo");

    const activeYearsCount = academicYears.filter((year) => year.status === "Activo").length;
    const activePeriodsCount = periods.filter((period) => period.status === "Activo").length;
    const evaluationPeriodsCount = periods.filter((period) => period.type === "Avaliação").length;
    const totalEventsCount = events.length;

    /* =====================================================
       FILTROS
    ===================================================== */

    const filteredYears = useMemo(() => {
        const search = yearSearch.toLowerCase();
        return academicYears.filter((year) =>
            String(year.year).toLowerCase().includes(search)
        );
    }, [academicYears, yearSearch]);

    const filteredEvents = useMemo(() => {
        const search = eventSearch.toLowerCase();
        return events.filter((event) => {
            const matchesSearch =
                event.title.toLowerCase().includes(search) ||
                event.description.toLowerCase().includes(search);
            const matchesSemester =
                selectedSemester === "Todos" || event.semester === selectedSemester;
            const matchesType = !eventType || event.type === eventType;

            return matchesSearch && matchesSemester && matchesType;
        });
    }, [events, eventSearch, selectedSemester, eventType]);

    /* =====================================================
       OPÇÕES DE DROPDOWN
    ===================================================== */

    const semesterOptions = [
        { label: "Todos os semestres", value: "Todos" },
        { label: "1.º Semestre", value: "1.º Semestre" },
        { label: "2.º Semestre", value: "2.º Semestre" },
    ];

    const semesterOnlyOptions = [
        { label: "1.º Semestre", value: "1" },
        { label: "2.º Semestre", value: "2" },
        { label: "Anual", value: "Anual" },
    ];

    const periodTypeOptions = [
        { label: "Semestre", value: "Semestre" },
        { label: "Férias", value: "Férias" },
        { label: "Interrupção", value: "Interrupção" },
        { label: "Avaliação", value: "Avaliação" },
    ];

    const eventTypeOptions = [
        { label: "Todos os tipos", value: null },
        { label: "Início do semestre", value: "Início do semestre" },
        { label: "Fim do semestre", value: "Fim do semestre" },
        { label: "Feriado", value: "Feriado" },
        { label: "Avaliação", value: "Avaliação" },
        { label: "Interrupção lectiva", value: "Interrupção lectiva" },
        { label: "Outro", value: "Outro" },
    ];

    /* =====================================================
       OPERAÇÕES: ANO LECTIVO
    ===================================================== */

    const openNewYear = () => {
        setSelectedYear(null);
        setYearForm({
            id: 0,
            year: "",
            semester: "1",
            startDate: "",
            endDate: "",
            status: "Activo",
        });
        setYearDialog(true);
    };

    const editYear = (year: AcademicYear) => {
        setSelectedYear(year);
        setYearForm({
            id: year.id,
            year: String(year.year),
            semester: year.semester.includes('2') ? '2' : '1',
            startDate: year.startDate,
            endDate: year.endDate,
            status: year.status,
        });
        setYearDialog(true);
    };

    const saveYear = async () => {
        if (!yearForm.year || !yearForm.startDate || !yearForm.endDate) return;

        try {
            const payload = {
                year: Number(yearForm.year),
                semester: yearForm.semester === 'Anual' ? '1' : yearForm.semester,
                start_date: yearForm.startDate,
                end_date: yearForm.endDate,
                is_active: yearForm.status === "Activo",
            };

            if (yearForm.id === 0) {
                await createAcademicYear(payload);
            } else {
                await updateAcademicYear(yearForm.id, payload);
            }

            setYearDialog(false);
            fetchData();
        } catch (error) {
            console.error("Erro ao guardar ano lectivo:", error);
        }
    };

    const toggleYear = async (year: AcademicYear) => {
        try {
            const newActiveState = year.status !== "Activo";
            await updateAcademicYear(year.id, {
                is_active: newActiveState,
            });
            fetchData();
        } catch (error) {
            console.error("Erro ao alterar estado do ano lectivo:", error);
        }
    };

    const deleteYearRecord = async (year: AcademicYear) => {
        if (!confirm("Tem certeza que deseja eliminar este ano lectivo?")) return;
        try {
            await deleteAcademicYear(year.id);
            fetchData();
        } catch (error) {
            console.error("Erro ao eliminar ano lectivo:", error);
        }
    };

    /* =====================================================
       OPERAÇÕES: PERÍODOS
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
        setPeriodForm({ ...period });
        setPeriodDialog(true);
    };

    const savePeriod = () => {
        if (!periodForm.name || !periodForm.startDate || !periodForm.endDate) return;

        if (periodForm.id === 0) {
            setPeriods((current) => [...current, { ...periodForm, id: Date.now() }]);
        } else {
            setPeriods((current) =>
                current.map((p) => (p.id === periodForm.id ? periodForm : p))
            );
        }
        setPeriodDialog(false);
    };

    const togglePeriod = (period: AcademicPeriod) => {
        setPeriods((current) =>
            current.map((item) =>
                item.id === period.id
                    ? { ...item, status: item.status === "Activo" ? "Inactivo" : "Activo" }
                    : item
            )
        );
    };

    const deletePeriod = (period: AcademicPeriod) => {
        setPeriods((current) => current.filter((item) => item.id !== period.id));
    };

    /* =====================================================
       OPERAÇÕES: EVENTOS / FERIADOS
    ===================================================== */

    const openNewEvent = () => {
        setSelectedEvent(null);
        setEventForm({
            id: 0,
            title: "",
            type: "Feriado",
            semester: "1.º Semestre",
            startDate: "",
            endDate: "",
            description: "",
        });
        setEventDialog(true);
    };

    const editEvent = (event: AcademicEvent) => {
        setSelectedEvent(event);
        setEventForm({ ...event });
        setEventDialog(true);
    };

    const saveEvent = async () => {
        if (!eventForm.title || !eventForm.startDate) return;

        try {
            const payload = {
                date: eventForm.startDate,
                description: eventForm.title,
            };

            if (eventForm.id === 0 || eventForm.id > 1000000) {
                await createHoliday(payload);
            } else {
                await updateHoliday(eventForm.id, payload);
            }

            setEventDialog(false);
            fetchData();
        } catch (error) {
            console.error("Erro ao guardar evento/feriado:", error);
        }
    };

    const deleteEventRecord = async (event: AcademicEvent) => {
        if (!confirm("Tem certeza que deseja eliminar este feriado/evento?")) return;
        try {
            await deleteHoliday(event.id);
            fetchData();
        } catch (error) {
            console.error("Erro ao eliminar feriado:", error);
        }
    };

    /* =====================================================
       TEMPLATES DA TABELA
    ===================================================== */

    const statusBody = (row: { status: Status }) => (
        <Tag
            value={row.status}
            severity={row.status === "Activo" ? "success" : "danger"}
            style={{ fontSize: "0.72rem" }}
        />
    );

    const yearDateBody = (row: AcademicYear) => (
        <span style={{ color: COLORS.text, fontSize: "0.82rem" }}>
            {formatDateRange(row.startDate, row.endDate)}
        </span>
    );

    const periodDateBody = (row: AcademicPeriod) => (
        <span style={{ color: COLORS.text, fontSize: "0.8rem" }}>
            {formatDateRange(row.startDate, row.endDate)}
        </span>
    );

    const eventDateBody = (row: AcademicEvent) => (
        <span style={{ color: COLORS.text, fontSize: "0.8rem" }}>
            {formatDateRange(row.startDate, row.endDate)}
        </span>
    );

    const periodTypeBody = (row: AcademicPeriod) => {
        const colors: Record<PeriodType, { background: string; color: string }> = {
            Semestre: { background: COLORS.primaryLight, color: COLORS.primary },
            Férias: { background: COLORS.greenLight, color: COLORS.green },
            Interrupção: { background: COLORS.orangeLight, color: COLORS.orange },
            Avaliação: { background: COLORS.purpleLight, color: COLORS.purple },
        };

        return (
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "6px",
                    background: colors[row.type]?.background || COLORS.primaryLight,
                    color: colors[row.type]?.color || COLORS.primary,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                }}
            >
                {row.type}
            </span>
        );
    };

    const eventTypeBody = (row: AcademicEvent) => {
        return (
            <span
                className="flex align-items-center gap-2"
                style={{
                    width: "fit-content",
                    padding: "0.3rem 0.55rem",
                    borderRadius: "6px",
                    background: COLORS.orangeLight,
                    color: COLORS.orange,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                }}
            >
                <CalendarDays size={13} />
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
                severity={row.status === "Activo" ? "warning" : "success"}
                tooltip={row.status === "Activo" ? "Desactivar" : "Activar"}
                onClick={() => toggleYear(row)}
            />
            <Button
                icon={<Trash2 size={15} />}
                text
                rounded
                severity="danger"
                tooltip="Remover"
                onClick={() => deleteYearRecord(row)}
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
                severity={row.status === "Activo" ? "warning" : "success"}
                tooltip={row.status === "Activo" ? "Desactivar" : "Activar"}
                onClick={() => togglePeriod(row)}
            />
            <Button
                icon={<Trash2 size={15} />}
                text
                rounded
                severity="danger"
                tooltip="Remover"
                onClick={() => deletePeriod(row)}
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
                onClick={() => deleteEventRecord(row)}
            />
        </div>
    );

    /* =====================================================
       RENDERIZAÇÃO DA TELA
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
            {/* CABEÇALHO */}
            <div
                className="flex justify-content-between align-items-center"
                style={{ marginBottom: "1.25rem" }}
            >
                <div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: COLORS.dark }}>
                        Ano Lectivo e Calendário Académico
                    </div>
                    {/* <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: "5px" }}>
                        Configure os períodos académicos, calendário lectivo e feriados integrados no sistema.
                    </div> */}
                </div>

                {/* <div className="flex gap-2">
                    <Button
                        label="Novo ano lectivo"
                        icon={<Plus size={16} />}
                        severity="secondary"
                        outlined
                        onClick={openNewYear}
                    />
                    <Button
                        label="Novo evento / feriado"
                        icon={<Plus size={16} />}
                        onClick={openNewEvent}
                        style={{ background: COLORS.primary, borderColor: COLORS.primary }}
                    />
                </div> */}
            </div>

            {/* ANO ACTIVO */}
            <div
                style={{
                    background: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)",
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
                                background: COLORS.primary,
                                color: COLORS.white,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CalendarDays size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: COLORS.muted }}>
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
                                {activeYear ? `Ano Lectivo ${activeYear.year}` : "Nenhum ano activo"}
                            </div>
                            {activeYear && (
                                <div style={{ fontSize: "0.75rem", color: COLORS.muted, marginTop: "3px" }}>
                                    {formatDateRange(activeYear.startDate, activeYear.endDate)}
                                </div>
                            )}
                        </div>
                    </div>
                    {activeYear && <Tag value="Activo" severity="success" />}
                </div>
            </div>

            {/* INDICADORES */}
            <div className="grid mb-3">
                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.76rem" }}>Anos lectivos</div>
                                <div style={{ color: COLORS.dark, fontWeight: 700, fontSize: "1.6rem", marginTop: "3px" }}>
                                    {academicYears.length}
                                </div>
                                <div style={{ color: COLORS.green, fontSize: "0.7rem", marginTop: "3px" }}>
                                    {activeYearsCount} activo
                                </div>
                            </div>
                            <CalendarDays size={22} color={COLORS.primary} />
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.76rem" }}>Períodos lectivos</div>
                                <div style={{ color: COLORS.dark, fontWeight: 700, fontSize: "1.6rem", marginTop: "3px" }}>
                                    {periods.length}
                                </div>
                                <div style={{ color: COLORS.green, fontSize: "0.7rem", marginTop: "3px" }}>
                                    {activePeriodsCount} activos
                                </div>
                            </div>
                            <Clock3 size={22} color={COLORS.green} />
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.76rem" }}>Períodos de avaliação</div>
                                <div style={{ color: COLORS.dark, fontWeight: 700, fontSize: "1.6rem", marginTop: "3px" }}>
                                    {evaluationPeriodsCount}
                                </div>
                                <div style={{ color: COLORS.purple, fontSize: "0.7rem", marginTop: "3px" }}>
                                    Integrados no calendário
                                </div>
                            </div>
                            <GraduationCap size={22} color={COLORS.purple} />
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
                        <div className="flex justify-content-between">
                            <div>
                                <div style={{ color: COLORS.muted, fontSize: "0.76rem" }}>Eventos / Feriados</div>
                                <div style={{ color: COLORS.dark, fontWeight: 700, fontSize: "1.6rem", marginTop: "3px" }}>
                                    {totalEventsCount}
                                </div>
                                <div style={{ color: COLORS.orange, fontSize: "0.7rem", marginTop: "3px" }}>
                                    Registados no banco
                                </div>
                            </div>
                            <FileClock size={22} color={COLORS.orange} />
                        </div>
                    </div>
                </div>
            </div>

            {/* NAVEGAÇÃO DE ABAS */}
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
                    onClick={() => setActiveSection("year")}
                    style={{
                        border: "none",
                        cursor: "pointer",
                        padding: "0.7rem 1rem",
                        borderRadius: "7px",
                        background: activeSection === "year" ? COLORS.primaryLight : "transparent",
                        color: activeSection === "year" ? COLORS.primary : COLORS.muted,
                        fontWeight: activeSection === "year" ? 600 : 500,
                    }}
                >
                    <span className="flex align-items-center gap-2">
                        <CalendarDays size={16} />
                        Ano Lectivo
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection("calendar")}
                    style={{
                        border: "none",
                        cursor: "pointer",
                        padding: "0.7rem 1rem",
                        borderRadius: "7px",
                        background: activeSection === "calendar" ? COLORS.primaryLight : "transparent",
                        color: activeSection === "calendar" ? COLORS.primary : COLORS.muted,
                        fontWeight: activeSection === "calendar" ? 600 : 500,
                    }}
                >
                    <span className="flex align-items-center gap-2">
                        <CalendarDays size={16} />
                        Feriados e Calendário
                    </span>
                </button>
            </div>

            {/* CONTEÚDO: ANO LECTIVO */}
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
                            <div style={{ fontWeight: 700, color: COLORS.dark }}>Ano Lectivo</div>
                            <div style={{ fontSize: "0.76rem", color: COLORS.muted, marginTop: "3px" }}>
                                Período académico utilizado pela instituição.
                            </div>
                        </div>
                        {/* <Button label="Adicionar ano" icon={<Plus size={16} />} onClick={openNewYear} /> */}
                    </div>

                    <DataTable
                        value={filteredYears}
                        paginator
                        rows={5}
                        stripedRows
                        responsiveLayout="scroll"
                        emptyMessage="Nenhum ano lectivo encontrado."
                        loading={loading}
                        rowHover
                    >
                        <Column
                            field="year"
                            header="Ano Lectivo"
                            body={(row) => (
                                <div>
                                    <div style={{ fontWeight: 700, color: COLORS.dark }}>{row.year}</div>
                                    <div style={{ fontSize: "0.7rem", color: COLORS.muted, marginTop: "3px" }}>
                                        {row.semester}
                                    </div>
                                </div>
                            )}
                        />
                        <Column field="semester" header="Período" />
                        <Column header="Data inicial / final" body={yearDateBody} />
                        {/* <Column header="Estado" body={statusBody} /> */}
                        {/* <Column header="Acções" body={yearActions} style={{ width: "150px" }} /> */}
                    </DataTable>
                </div>
            )}

            {/* CONTEÚDO: CALENDÁRIO / FERIADOS */}
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
                            <div style={{ fontWeight: 700, color: COLORS.dark }}>Feriados e Eventos do Calendário</div>
                            <div style={{ fontSize: "0.76rem", color: COLORS.muted, marginTop: "3px" }}>
                                Feriados
                            </div>
                        </div>
                        {/* <Button label="Adicionar evento" icon={<Plus size={16} />} onClick={openNewEvent} /> */}
                    </div>

                    <DataTable
                        value={filteredEvents}
                        paginator
                        rows={8}
                        stripedRows
                        responsiveLayout="scroll"
                        emptyMessage="Nenhum evento encontrado."
                        loading={loading}
                        rowHover
                    >
                        <Column
                            header="Evento / Descrição"
                            body={(row) => (
                                <div style={{ maxWidth: "320px" }}>
                                    <div style={{ fontWeight: 600, color: COLORS.dark, fontSize: "0.82rem" }}>
                                        {row.title}
                                    </div>
                                    <div style={{ fontSize: "0.7rem", color: COLORS.muted, marginTop: "3px" }}>
                                        {row.description}
                                    </div>
                                </div>
                            )}
                        />
                        <Column header="Tipo" body={eventTypeBody} />
                        <Column field="semester" header="Semestre" />
                        <Column header="Data" body={eventDateBody} />
                        {/* <Column header="Acções" body={eventActions} style={{ width: "110px" }} /> */}
                    </DataTable>
                </div>
            )}

            {/* DIALOG: ANO LECTIVO */}
            <Dialog
                visible={yearDialog}
                onHide={() => setYearDialog(false)}
                header={yearForm.id === 0 ? "Novo ano lectivo" : "Editar ano lectivo"}
                style={{ width: "520px", maxWidth: "95vw" }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" severity="secondary" outlined onClick={() => setYearDialog(false)} />
                        <Button label="Guardar" onClick={saveYear} />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-2">Ano lectivo</label>
                        <InputText
                            value={yearForm.year}
                            onChange={(e) => setYearForm((c) => ({ ...c, year: e.target.value }))}
                            placeholder="Ex.: 2026"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Período</label>
                        <Dropdown
                            value={yearForm.semester}
                            options={semesterOnlyOptions}
                            onChange={(e) => setYearForm((c) => ({ ...c, semester: e.value }))}
                            className="w-full"
                        />
                    </div>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="block mb-2">Data inicial</label>
                            <Calendar
                                value={yearForm.startDate ? new Date(`${yearForm.startDate}T00:00:00`) : null}
                                onChange={(e) => {
                                    const dateValue = e.value;
                                    if (dateValue instanceof Date) {
                                        setYearForm((c) => ({
                                            ...c,
                                            startDate: dateValue.toISOString().split("T")[0],
                                        }));
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                showIcon
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <label className="block mb-2">Data final</label>
                            <Calendar
                                value={yearForm.endDate ? new Date(`${yearForm.endDate}T00:00:00`) : null}
                                onChange={(e) => {
                                    const dateValue = e.value;
                                    if (dateValue instanceof Date) {
                                        setYearForm((c) => ({
                                            ...c,
                                            endDate: dateValue.toISOString().split("T")[0],
                                        }));
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                showIcon
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div
                        className="flex justify-content-between align-items-center"
                        style={{ background: COLORS.background, padding: "0.85rem", borderRadius: "8px" }}
                    >
                        <div>
                            <div style={{ fontWeight: 600, color: COLORS.text, fontSize: "0.82rem" }}>
                                Ano lectivo activo
                            </div>
                            <div style={{ fontSize: "0.72rem", color: COLORS.muted, marginTop: "3px" }}>
                                Disponibilizar este ano para utilização académica.
                            </div>
                        </div>
                        <InputSwitch
                            checked={yearForm.status === "Activo"}
                            onChange={(e) =>
                                setYearForm((c) => ({
                                    ...c,
                                    status: e.value ? "Activo" : "Inactivo",
                                }))
                            }
                        />
                    </div>
                </div>
            </Dialog>

            {/* DIALOG: EVENTO / FERIADO */}
            <Dialog
                visible={eventDialog}
                onHide={() => setEventDialog(false)}
                header={eventForm.id === 0 ? "Novo feriado/evento" : "Editar feriado/evento"}
                style={{ width: "560px", maxWidth: "95vw" }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" severity="secondary" outlined onClick={() => setEventDialog(false)} />
                        <Button label="Guardar" onClick={saveEvent} />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-2">Descrição do Feriado / Evento</label>
                        <InputText
                            value={eventForm.title}
                            onChange={(e) => setEventForm((c) => ({ ...c, title: e.target.value }))}
                            placeholder="Ex.: Dia da Independência"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Data</label>
                        <InputText
                            value={eventForm.startDate}
                            onChange={(e) => setEventForm((c) => ({ ...c, startDate: e.target.value }))}
                            placeholder="AAAA-MM-DD"
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}