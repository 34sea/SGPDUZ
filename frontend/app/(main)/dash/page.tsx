'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    Users, BookOpen, Layers3, GraduationCap, Building2, ClipboardCheck,
    CheckCircle2, Clock3, AlertTriangle, RefreshCw, CalendarDays,
    ArrowUpRight, CircleHelp, Search, Mail, BookMarked
} from 'lucide-react';
import { getDashboardMetrics } from '@/app/api/dashboard/dashboardService';

type DashboardData = {
    period?: string;
    summary?: Record<string, number | string>;
    teachers?: any[];
    courseUnits?: any[];
    departments?: any[];
};

const numberValue = (value: unknown) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value: unknown) =>
    new Intl.NumberFormat('pt-PT').format(numberValue(value));

const formatPercent = (value: unknown) =>
    `${numberValue(value).toLocaleString('pt-PT', { maximumFractionDigits: 1 })}%`;

export default function InstitutionalDashboardExpanded() {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [subjectSearch, setSubjectSearch] = useState('');

    const loadData = useCallback(async (quiet = false) => {
        if (quiet) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await getDashboardMetrics({ period: '2026-1' });
            // Supports either the API payload itself or an Axios-style { data: payload } response.
            const payload = response?.data?.summary ? response.data : response;
            setData(payload);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Não foi possível atualizar',
                detail: error?.message || 'Ocorreu um erro ao carregar os indicadores.',
                life: 4500
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const summary = data?.summary ?? {};
    const teachers = data?.teachers ?? [];
    const courseUnits = data?.courseUnits ?? [];
    const departments = data?.departments ?? [];

    const filteredTeachers = useMemo(
        () => teachers.filter((teacher) =>
            `${teacher.name ?? ''} ${teacher.email ?? ''}`.toLowerCase().includes(teacherSearch.toLowerCase())
        ),
        [teachers, teacherSearch]
    );

    const filteredUnits = useMemo(
        () => courseUnits.filter((unit) =>
            `${unit.name ?? ''} ${unit.code ?? ''} ${unit.course_name ?? ''} ${unit.teacher ?? ''}`
                .toLowerCase().includes(subjectSearch.toLowerCase())
        ),
        [courseUnits, subjectSearch]
    );

    const lessonTotal = numberValue(summary.total_realized);
    const confirmedTotal = numberValue(summary.total_confirmed);
    const disputedTotal = numberValue(summary.total_disputed);
    const cancelledTotal = numberValue(summary.total_cancelled);
    const performanceAverage = teachers.length
        ? teachers.reduce((sum, teacher) => sum + numberValue(teacher.performance_rate), 0) / teachers.length
        : 0;

    const teacherChartData = {
        labels: teachers.slice(0, 8).map((teacher) => teacher.name),
        datasets: [{
            label: 'Taxa de confirmação',
            data: teachers.slice(0, 8).map((teacher) => numberValue(teacher.performance_rate)),
            backgroundColor: '#2563eb',
            hoverBackgroundColor: '#1d4ed8',
            borderRadius: 7,
            maxBarThickness: 38
        }]
    };

    const lessonChartData = {
        labels: ['Realizadas', 'Confirmadas', 'Em disputa', 'Canceladas'],
        datasets: [{
            data: [lessonTotal, confirmedTotal, disputedTotal, cancelledTotal],
            backgroundColor: ['#2563eb', '#3977f6', '#f4b740', '#e46b75'],
            hoverBackgroundColor: ['#1d4ed8', '#285fd0', '#d99b21', '#ca4e5a'],
            borderWidth: 0,
            spacing: 4,
            borderRadius: 5
        }]
    };

    const activityChartData = {
        labels: ['Avaliações no prazo', 'Avaliações atrasadas', 'Atividades concluídas', 'Atividades atrasadas'],
        datasets: [{
            label: 'Quantidade',
            data: [
                numberValue(summary.total_eval_on_time),
                numberValue(summary.total_eval_late),
                numberValue(summary.total_activities_completed),
                numberValue(summary.total_activities_delayed)
            ],
            backgroundColor: ['#2563eb', '#f4b740', '#3977f6', '#e46b75'],
            borderRadius: 7,
            maxBarThickness: 48
        }]
    };

    const chartText = '#64748b';
    const chartGrid = '#edf1f5';
    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: chartText, usePointStyle: true, boxWidth: 8, padding: 18, font: { family: 'inherit', size: 11 } } },
            tooltip: { backgroundColor: '#172033', padding: 12, cornerRadius: 8, titleFont: { size: 12 }, bodyFont: { size: 12 } }
        }
    };

    const teacherChartOptions = {
        ...commonChartOptions,
        indexAxis: 'y' as const,
        scales: {
            x: { beginAtZero: true, max: 100, grid: { color: chartGrid }, border: { display: false }, ticks: { color: chartText, callback: (value: string | number) => `${value}%` } },
            y: { grid: { display: false }, border: { display: false }, ticks: { color: chartText, font: { size: 11 } } }
        },
        plugins: { ...commonChartOptions.plugins, legend: { display: false } }
    };

    const activityChartOptions = {
        ...commonChartOptions,
        scales: {
            y: { beginAtZero: true, grid: { color: chartGrid }, border: { display: false }, ticks: { color: chartText, precision: 0 } },
            x: { grid: { display: false }, border: { display: false }, ticks: { color: chartText, maxRotation: 0, minRotation: 0, font: { size: 10 } } }
        },
        plugins: { ...commonChartOptions.plugins, legend: { display: false } }
    };

    const teacherNameBody = (row: any) => (
        <div className="person-cell">
            <div className="avatar">{String(row.name ?? '?').trim().charAt(0).toUpperCase()}</div>
            <div className="person-info">
                <span className="person-name">{row.name || 'Nome não disponível'}</span>
                <span className="person-meta"><Mail size={12} />{row.email || 'Sem email registado'}</span>
            </div>
        </div>
    );

    const performanceBody = (row: any) => {
        const rate = Math.min(100, Math.max(0, numberValue(row.performance_rate)));
        const tone = rate >= 70 ? 'good' : rate >= 35 ? 'medium' : 'low';
        return (
            <div className="performance-cell">
                <div className="performance-top"><span>{formatPercent(rate)}</span><span className="muted">{formatNumber(row.confirmed_lessons)} confirmadas</span></div>
                <div className="mini-progress"><span className={tone} style={{ width: `${rate}%` }} /></div>
            </div>
        );
    };

    const unitNameBody = (row: any) => (
        <div className="unit-cell">
            <span className="unit-code">{row.code || 'S/C'}</span>
            <span className="unit-name">{row.name || 'Unidade sem nome'}</span>
        </div>
    );

    const teacherBody = (row: any) => row.teacher
        ? <span className="teacher-assigned"><CheckCircle2 size={14} />{row.teacher}</span>
        : <span className="teacher-pending"><Clock3 size={14} />Por atribuir</span>;

    if (loading && !data) {
        return (
            <div className="dashboard-loading">
                <div className="loading-mark"><Layers3 size={26} /></div>
                <ProgressSpinner style={{ width: 36, height: 36 }} strokeWidth="3" />
                <strong>A preparar o painel institucional</strong>
                <span>A carregar os indicadores do SGPDUZ...</span>
                <style jsx>{`
                    .dashboard-loading{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#f5f7fa;color:#172033;font-family:inherit}
                    .loading-mark{width:54px;height:54px;display:grid;place-items:center;border-radius:16px;background:#e8efff;color:#1d4ed8}
                    .dashboard-loading span{font-size:14px;color:#748094}
                `}</style>
            </div>
        );
    }

    return (
        <main className="institution-dashboard">
            <Toast ref={toast} />
            <header className="dashboard-header">
                <div className="header-main">
                    <div className="eyebrow"><span className="status-dot" /> PAINEL DE GESTÃO INSTITUCIONAL</div>
                    <h1>Visão geral</h1>
                    <p>Acompanhe a estrutura académica, a execução das aulas e as atividades pedagógicas num só lugar.</p>
                    <div className="period-pill"><CalendarDays size={15} /> Ano lectivo <strong>{data?.period || '2026-1'}</strong></div>
                </div>
                <Button
                    label={refreshing ? 'A atualizar...' : 'Atualizar dados'}
                    icon={<RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />}
                    onClick={() => void loadData(true)}
                    disabled={refreshing}
                    className="refresh-button"
                />
            </header>

            <section className="section-block">
                <div className="section-heading">
                    <div><h2>Resumo institucional</h2><p>Indicadores principais do período seleccionado</p></div>
                </div>
                <div className="kpi-grid">
                    <article className="kpi-card kpi-primary">
                        <div className="kpi-top"><span className="kpi-label">Utilizadores</span><span className="kpi-icon"><Users size={20} /></span></div>
                        <div className="kpi-value">{formatNumber(summary.total_users)}</div>
                        <div className="kpi-foot">Gestores, docentes e representantes</div>
                    </article>
                    <article className="kpi-card">
                        <div className="kpi-top"><span className="kpi-label">Departamentos</span><span className="kpi-icon purple"><Building2 size={20} /></span></div>
                        <div className="kpi-value">{formatNumber(summary.total_departments)}</div>
                        <div className="kpi-foot"><span className="foot-strong">{formatNumber(summary.total_courses)} cursos</span> registados</div>
                    </article>
                    <article className="kpi-card">
                        <div className="kpi-top"><span className="kpi-label">Estrutura lectiva</span><span className="kpi-icon blue"><GraduationCap size={20} /></span></div>
                        <div className="kpi-value">{formatNumber(summary.total_subjects)}<small> unidades</small></div>
                        <div className="kpi-foot">{formatNumber(summary.total_classes)} turma(s) registada(s)</div>
                    </article>
                    <article className="kpi-card">
                        <div className="kpi-top"><span className="kpi-label">Aulas realizadas</span><span className="kpi-icon green"><BookOpen size={20} /></span></div>
                        <div className="kpi-value">{formatNumber(summary.total_realized)}</div>
                        <div className="kpi-foot">Em {formatNumber(summary.total_lessons)} aulas registadas</div>
                    </article>
                </div>
            </section>

            <section className="secondary-stats">
                <div className="secondary-stat"><span className="stat-symbol teal"><CheckCircle2 size={17} /></span><div><span>Confirmadas</span><strong>{formatNumber(summary.total_confirmed)}</strong></div></div>
                <div className="secondary-stat"><span className="stat-symbol amber"><AlertTriangle size={17} /></span><div><span>Em disputa</span><strong>{formatNumber(summary.total_disputed)}</strong></div></div>
                <div className="secondary-stat"><span className="stat-symbol rose"><Layers3 size={17} /></span><div><span>Canceladas</span><strong>{formatNumber(summary.total_cancelled)}</strong></div></div>
                <div className="secondary-stat"><span className="stat-symbol blue"><ClipboardCheck size={17} /></span><div><span>Pautas</span><strong>{formatNumber(summary.total_pautas)}</strong></div></div>
                <div className="secondary-stat"><span className="stat-symbol violet"><BookMarked size={17} /></span><div><span>Tarefas</span><strong>{formatNumber(summary.total_tasks)}</strong></div></div>
            </section>

            <section className="section-block">
                <div className="section-heading">
                    <div><h2>Desempenho e execução</h2><p>Leitura rápida da atividade pedagógica</p></div>
                    <div className="average-chip"><span>Desempenho médio dos docentes</span><strong>{formatPercent(performanceAverage)}</strong></div>
                </div>
                <div className="analytics-grid">
                    <article className="panel chart-panel">
                        <div className="panel-heading"><div><h3>Desempenho por docente</h3><p>Percentagem de aulas confirmadas face às realizadas</p></div><span className="panel-icon"><Users size={18} /></span></div>
                        {teachers.length ? <div className="chart-area teacher-chart"><Chart type="bar" data={teacherChartData} options={teacherChartOptions} /></div> : <div className="empty-state">Ainda não existem dados de docentes.</div>}
                    </article>
                    <article className="panel chart-panel">
                        <div className="panel-heading"><div><h3>Estado das aulas</h3><p>Distribuição dos registos no período</p></div><span className="panel-icon"><BookOpen size={18} /></span></div>
                        <div className="donut-layout">
                            <div className="chart-area donut-chart"><Chart type="doughnut" data={lessonChartData} options={{ ...commonChartOptions, cutout: '72%', plugins: { ...commonChartOptions.plugins, legend: { display: false } } }} /></div>
                            <div className="donut-legend">
                                {[
                                    { label: 'Realizadas', value: lessonTotal, color: '#2563eb' },
                                    { label: 'Confirmadas', value: confirmedTotal, color: '#3977f6' },
                                    { label: 'Em disputa', value: disputedTotal, color: '#f4b740' },
                                    { label: 'Canceladas', value: cancelledTotal, color: '#e46b75' }
                                ].map((item) => <div className="legend-row" key={item.label}><span className="legend-dot" style={{ background: item.color }} /><span>{item.label}</span><strong>{formatNumber(item.value)}</strong></div>)}
                            </div>
                        </div>
                    </article>
                    <article className="panel chart-panel activity-panel">
                        <div className="panel-heading"><div><h3>Avaliações e atividades</h3><p>Prazos e conclusão das tarefas pedagógicas</p></div><span className="panel-icon"><ClipboardCheck size={18} /></span></div>
                        <div className="chart-area activity-chart"><Chart type="bar" data={activityChartData} options={activityChartOptions} /></div>
                        <div className="activity-summary">
                            <span><i className="summary-dot completed" />{formatNumber(summary.total_activities_completed)} atividades concluídas</span>
                            <span><i className="summary-dot delayed" />{formatNumber(summary.total_activities_delayed)} atrasadas</span>
                        </div>
                    </article>
                </div>
            </section>

            <section className="section-block data-section">
                <div className="section-heading">
                    <div><h2>Registos académicos</h2><p>Consulte e pesquise os detalhes por docente e unidade curricular</p></div>
                </div>
                <div className="tables-grid">
                    <article className="panel table-panel">
                        <div className="panel-heading table-heading"><div><h3>Docentes</h3><p>{teachers.length} registo(s) no período</p></div><span className="count-badge">{teachers.length}</span></div>
                        <div className="table-search"><Search size={16} /><input value={teacherSearch} onChange={(event) => setTeacherSearch(event.target.value)} placeholder="Pesquisar docente ou email..." aria-label="Pesquisar docente" /></div>
                        <DataTable value={filteredTeachers} paginator rows={5} size="small" responsiveLayout="scroll" emptyMessage="Nenhum docente encontrado." className="modern-table">
                            <Column header="Docente" body={teacherNameBody} sortable sortField="name" style={{ minWidth: '230px' }} />
                            <Column field="assigned_subjects" header="Unidades" sortable body={(row) => <span className="number-cell">{formatNumber(row.assigned_subjects)}</span>} style={{ width: '90px' }} />
                            <Column field="realized_lessons" header="Aulas" sortable body={(row) => <span className="number-cell">{formatNumber(row.realized_lessons)}</span>} style={{ width: '80px' }} />
                            <Column header="Desempenho" body={performanceBody} style={{ minWidth: '180px' }} />
                        </DataTable>
                    </article>

                    <article className="panel table-panel">
                        <div className="panel-heading table-heading"><div><h3>Unidades curriculares</h3><p>{courseUnits.length} unidade(s) registada(s)</p></div><span className="count-badge">{courseUnits.length}</span></div>
                        <div className="table-search"><Search size={16} /><input value={subjectSearch} onChange={(event) => setSubjectSearch(event.target.value)} placeholder="Pesquisar unidade, código ou curso..." aria-label="Pesquisar unidade curricular" /></div>
                        <DataTable value={filteredUnits} paginator rows={5} size="small" responsiveLayout="scroll" emptyMessage="Nenhuma unidade encontrada." className="modern-table">
                            <Column header="Unidade curricular" body={unitNameBody} sortable sortField="name" style={{ minWidth: '225px' }} />
                            <Column field="course_name" header="Curso" sortable body={(row) => <span className="table-secondary">{row.course_name || '—'}</span>} style={{ minWidth: '150px' }} />
                            <Column field="teacher" header="Docente atribuído" body={teacherBody} style={{ minWidth: '175px' }} />
                            <Column field="realized_lessons" header="Aulas" sortable body={(row) => <span className="number-cell">{formatNumber(row.realized_lessons)}</span>} style={{ width: '75px' }} />
                        </DataTable>
                    </article>
                </div>
            </section>

            <section className="section-block departments-section">
                <div className="section-heading"><div><h2>Departamentos</h2><p>Visão resumida da distribuição dos cursos</p></div></div>
                <div className="department-grid">
                    {departments.map((department: any) => (
                        <article className="department-card" key={department.id}>
                            <div className="department-icon"><Building2 size={19} /></div>
                            <div className="department-copy"><strong>{department.name}</strong><span>{formatNumber(department.courses_count)} curso(s)</span></div>
                            <ArrowUpRight size={17} className="department-arrow" />
                        </article>
                    ))}
                    {!departments.length && <div className="empty-state">Não existem departamentos para apresentar.</div>}
                </div>
            </section>

            <footer className="dashboard-footer"><span>SGPDUZ <b>•</b> Painel institucional</span><span><CircleHelp size={14} /> Os indicadores refletem os dados devolvidos pela plataforma.</span></footer>

            <style jsx global>{`
                .institution-dashboard{--ink:#182230;--muted:#748094;--line:#e8edf2;--canvas:#f5f7fa;--teal:#2563eb;min-height:100vh;padding:30px clamp(16px,3vw,42px) 24px;background:var(--canvas);color:var(--ink);font-family:inherit;box-sizing:border-box}
                .institution-dashboard *{box-sizing:border-box}
                .dashboard-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin:0 auto 30px;max-width:1600px}
                .eyebrow{display:flex;align-items:center;gap:8px;color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:1.35px;margin-bottom:12px}
                .status-dot{width:7px;height:7px;border-radius:50%;background:#2563eb;box-shadow:0 0 0 4px #dbeafe}
                .dashboard-header h1{font-size:clamp(29px,3vw,38px);letter-spacing:-1.2px;line-height:1.15;margin:0;font-weight:750;color:#172033}
                .dashboard-header p{margin:10px 0 14px;color:#758196;font-size:14px;line-height:1.6;max-width:650px}
                .period-pill{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--line);border-radius:9px;padding:8px 11px;color:#64748b;font-size:12px}
                .period-pill strong{color:#273449;font-weight:700}
                .refresh-button.p-button{display:flex;align-items:center;gap:9px;padding:11px 15px;background:#2563eb;border:1px solid #2563eb;border-radius:10px;box-shadow:0 4px 10px #2563eb20;font-size:13px;font-weight:700;white-space:nowrap}
                .refresh-button.p-button:hover{background:#1d4ed8;border-color:#1d4ed8}
                .refresh-button.p-button:focus{box-shadow:0 0 0 3px #2563eb30}
                .spin-icon{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
                .section-block{max-width:1600px;margin:0 auto 30px}
                .section-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:15px}
                .section-heading h2{font-size:17px;letter-spacing:-.25px;margin:0 0 5px;font-weight:750;color:#202b3b}
                .section-heading p{font-size:12px;color:#8490a2;margin:0}
                .kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}
                .kpi-card{background:#fff;border:1px solid var(--line);border-radius:15px;padding:20px 21px 18px;min-width:0;box-shadow:0 2px 5px #17203304}
                .kpi-primary{background:#172d3c;border-color:#172d3c;color:#fff;position:relative;overflow:hidden}
                .kpi-primary:after{content:"";position:absolute;width:140px;height:140px;border:1px solid #ffffff15;border-radius:50%;right:-42px;top:38px;box-shadow:0 0 0 18px #ffffff08,0 0 0 36px #ffffff05}
                .kpi-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
                .kpi-label{font-size:12px;font-weight:650;color:#778397}
                .kpi-primary .kpi-label{color:#c5d4dc}
                .kpi-icon{width:39px;height:39px;display:grid;place-items:center;border-radius:11px;background:#e8efff;color:#1d4ed8;flex-shrink:0}
                .kpi-icon.purple{background:#f0eaff;color:#8863d8}.kpi-icon.blue{background:#e7efff;color:#3977f6}.kpi-icon.green{background:#e1f7eb;color:#229c68}
                .kpi-primary .kpi-icon{background:#ffffff17;color:#bfdbfe}
                .kpi-value{font-size:33px;font-weight:760;letter-spacing:-1px;margin:15px 0 9px;line-height:1.1;color:#1d2939}
                .kpi-primary .kpi-value{color:white}
                .kpi-value small{font-size:13px;letter-spacing:0;font-weight:600;color:#8490a2}
                .kpi-foot{font-size:11px;color:#8a95a6;line-height:1.5}
                .kpi-primary .kpi-foot{color:#c3d0d8}.foot-strong{font-weight:750;color:#8863d8}
                .secondary-stats{max-width:1600px;margin:0 auto 32px;background:#fff;border:1px solid var(--line);border-radius:13px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));padding:5px 8px}
                .secondary-stat{display:flex;align-items:center;gap:10px;padding:13px 15px;min-width:0;border-right:1px solid #eef1f5}
                .secondary-stat:last-child{border-right:0}.stat-symbol{width:33px;height:33px;display:grid;place-items:center;border-radius:10px;flex-shrink:0}
                .stat-symbol.teal{color:#1d4ed8;background:#e8efff}.stat-symbol.amber{color:#c58a14;background:#fff4d9}.stat-symbol.rose{color:#d75b67;background:#ffeaed}.stat-symbol.blue{color:#3977f6;background:#eaf0ff}.stat-symbol.violet{color:#8863d8;background:#f0eaff}
                .secondary-stat div{display:flex;flex-direction:column;gap:3px;min-width:0}.secondary-stat span:not(.stat-symbol){font-size:11px;color:#7f8a9b}.secondary-stat strong{font-size:19px;line-height:1.2;color:#202b3b}
                .average-chip{display:flex;align-items:center;gap:12px;background:#e8efff;padding:9px 12px;border-radius:9px;color:#52716f;font-size:11px}.average-chip strong{font-size:17px;color:#1d4ed8}
                .analytics-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:15px}
                .panel{background:#fff;border:1px solid var(--line);border-radius:15px;min-width:0;box-shadow:0 2px 5px #17203304}
                .chart-panel{padding:20px 21px 18px}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px}
                .panel-heading h3{font-size:14px;font-weight:750;margin:0 0 5px;color:#253145}
                .panel-heading p{font-size:11px;line-height:1.5;margin:0;color:#8a95a6}
                .panel-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#edf4ff;color:#1d4ed8;flex-shrink:0}
                .chart-area{position:relative;width:100%;min-width:0}.teacher-chart{height:260px}.donut-layout{display:flex;align-items:center;gap:20px;min-height:260px}.donut-chart{height:205px;max-width:230px;flex:1}.donut-legend{flex:1;min-width:115px;display:flex;flex-direction:column;gap:17px}
                .legend-row{display:grid;grid-template-columns:8px minmax(0,1fr) auto;align-items:center;gap:8px;font-size:11px;color:#748094}.legend-row strong{font-size:13px;color:#293548}.legend-dot{width:7px;height:7px;border-radius:3px}
                .activity-panel{grid-column:1/-1}.activity-chart{height:210px}.activity-summary{display:flex;gap:20px;flex-wrap:wrap;margin-top:12px;padding-top:13px;border-top:1px solid #eef1f5}.activity-summary span{display:flex;align-items:center;gap:7px;font-size:11px;color:#778397}.summary-dot{width:7px;height:7px;border-radius:50%;display:inline-block}.summary-dot.completed{background:#3977f6}.summary-dot.delayed{background:#e46b75}
                .tables-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.table-panel{overflow:hidden}.table-heading{padding:20px 20px 0;margin-bottom:14px;align-items:center}.count-badge{min-width:29px;height:27px;padding:0 8px;display:grid;place-items:center;background:#e8efff;color:#1d4ed8;border-radius:8px;font-size:12px;font-weight:750}
                .table-search{margin:0 20px 13px;display:flex;align-items:center;gap:9px;padding:0 11px;border:1px solid #e7ecf1;background:#fbfcfd;border-radius:9px;height:37px;color:#98a3b2}
                .table-search:focus-within{border-color:#93b4fb;box-shadow:0 0 0 3px #2563eb15}.table-search input{border:0;outline:0;background:transparent;width:100%;min-width:0;color:#263448;font:inherit;font-size:12px}.table-search input::placeholder{color:#a0a9b7}
                .modern-table.p-datatable{font-size:12px}.modern-table .p-datatable-wrapper{border-top:1px solid #f0f2f5}
                .modern-table .p-datatable-thead>tr>th{background:#fafbfd;color:#8a95a6;border:0;border-bottom:1px solid #edf0f4;padding:12px 13px;font-size:10px;font-weight:750;letter-spacing:.35px;text-transform:uppercase;white-space:nowrap}
                .modern-table .p-datatable-tbody>tr{background:#fff;color:#344054}.modern-table .p-datatable-tbody>tr>td{border:0;border-bottom:1px solid #f0f2f5;padding:13px;vertical-align:middle}.modern-table .p-datatable-tbody>tr:hover{background:#f9fcfc}.modern-table .p-paginator{border:0;background:#fff;padding:11px 12px;justify-content:flex-end;gap:2px}.modern-table .p-paginator .p-paginator-element{min-width:28px;height:28px;border-radius:7px;font-size:11px}.modern-table .p-paginator .p-highlight{background:#e8efff;color:#1d4ed8}
                .person-cell{display:flex;align-items:center;gap:10px;min-width:0}.avatar{width:33px;height:33px;border-radius:10px;background:#e8efff;color:#1d4ed8;display:grid;place-items:center;font-size:13px;font-weight:800;flex-shrink:0}.person-info{display:flex;flex-direction:column;gap:4px;min-width:0}.person-name{font-size:12px;font-weight:700;color:#293548;white-space:normal}.person-meta{display:flex;align-items:center;gap:4px;font-size:10px;color:#98a2b2;overflow-wrap:anywhere}
                .number-cell{display:inline-flex;align-items:center;justify-content:center;min-width:27px;padding:5px 7px;border-radius:7px;background:#f4f6f9;color:#344054;font-size:11px;font-weight:750}
                .performance-cell{min-width:115px}.performance-top{display:flex;justify-content:space-between;gap:6px;margin-bottom:7px;align-items:center}.performance-top>span:first-child{font-size:11px;font-weight:800;color:#344054}.muted{font-size:9px;color:#98a2b2;white-space:nowrap}.mini-progress{height:5px;border-radius:10px;background:#eef1f4;overflow:hidden}.mini-progress span{height:100%;display:block;border-radius:10px}.mini-progress .good{background:#2563eb}.mini-progress .medium{background:#f4b740}.mini-progress .low{background:#e46b75}
                .unit-cell{display:flex;flex-direction:column;align-items:flex-start;gap:6px}.unit-code{padding:3px 6px;background:#eef3ff;color:#5174c7;border-radius:5px;font-size:9px;font-weight:800;letter-spacing:.3px}.unit-name{font-size:11px;font-weight:700;line-height:1.45;color:#293548;white-space:normal}.table-secondary{font-size:11px;line-height:1.5;color:#778397;white-space:normal}.teacher-assigned,.teacher-pending{display:inline-flex;align-items:center;gap:5px;font-size:10px;line-height:1.5;white-space:normal}.teacher-assigned{color:#1d4ed8}.teacher-pending{color:#b78119;background:#fff7e4;border-radius:6px;padding:5px 7px}
                .departments-section{margin-bottom:20px}.department-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.department-card{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:15px;min-width:0}.department-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:#f0eaff;color:#8863d8;flex-shrink:0}.department-copy{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}.department-copy strong{font-size:12px;line-height:1.4;color:#293548}.department-copy span{font-size:11px;color:#8a95a6}.department-arrow{color:#a1acba;flex-shrink:0}.empty-state{display:grid;place-items:center;min-height:140px;color:#98a2b2;font-size:12px}
                .dashboard-footer{max-width:1600px;margin:0 auto;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:17px;border-top:1px solid #e6ebf0;color:#98a2b2;font-size:11px}.dashboard-footer span{display:flex;align-items:center;gap:7px}.dashboard-footer b{color:#2563eb}
                @media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.secondary-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.secondary-stat:nth-child(3){border-right:0}.secondary-stat:nth-child(n+4){border-top:1px solid #eef1f5}.analytics-grid{grid-template-columns:1fr 1fr}.activity-panel{grid-column:1/-1}.tables-grid{grid-template-columns:1fr}}
                @media(max-width:700px){.institution-dashboard{padding:22px 13px}.dashboard-header{flex-direction:column;gap:17px;margin-bottom:24px}.refresh-button.p-button{width:100%;justify-content:center}.kpi-grid{gap:10px}.kpi-card{padding:15px}.kpi-value{font-size:29px}.kpi-icon{width:34px;height:34px}.kpi-label{font-size:11px}.kpi-foot{font-size:10px}.secondary-stats{grid-template-columns:repeat(2,minmax(0,1fr));padding:4px}.secondary-stat{padding:11px 8px;border-right:1px solid #eef1f5!important}.secondary-stat:nth-child(even){border-right:0!important}.secondary-stat:nth-child(n+3){border-top:1px solid #eef1f5}.secondary-stat:last-child{grid-column:1/-1}.analytics-grid{grid-template-columns:1fr}.activity-panel{grid-column:auto}.chart-panel{padding:16px}.teacher-chart{height:230px}.donut-layout{gap:10px}.donut-chart{max-width:170px;height:180px}.donut-legend{gap:13px}.section-heading{align-items:flex-start;flex-direction:column}.average-chip{width:100%;justify-content:space-between}.department-grid{grid-template-columns:1fr}.dashboard-footer{flex-direction:column}.table-heading{padding:16px 14px 0}.table-search{margin-left:14px;margin-right:14px}.modern-table .p-datatable-thead>tr>th,.modern-table .p-datatable-tbody>tr>td{padding:11px 10px}}
                @media(max-width:390px){.kpi-grid{grid-template-columns:1fr}.kpi-card{padding:17px}.donut-layout{flex-direction:column}.donut-chart{width:100%;flex:none}.donut-legend{width:100%;display:grid;grid-template-columns:1fr 1fr}.secondary-stat{gap:7px}.stat-symbol{width:29px;height:29px}}
            `}</style>
        </main>
    );
}
