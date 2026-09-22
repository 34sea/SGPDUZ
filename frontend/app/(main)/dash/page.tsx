'use client';

import React, {
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';

import { useRouter } from 'next/navigation';

import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';

import { LayoutContext } from '@/layout/context/layoutcontext';

import {
    getDashboard,
    DashboardData,
    DashboardDefesa
} from '@/app/api/dashboard/dashboardService';

const Dashboard = () => {

    const router = useRouter();

    const { layoutConfig } =
        useContext(LayoutContext);

    const [dashboard, setDashboard] =
        useState<DashboardData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    // =========================================================
    // CARREGAR DASHBOARD
    // =========================================================

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError(null);

            const data = await getDashboard();

            setDashboard(data);

        } catch (error) {

            console.error(
                'Erro ao carregar dashboard:',
                error
            );

            setError(
                'Não foi possível carregar os dados do dashboard.'
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    // =========================================================
    // CONFIGURAÇÃO DO GRÁFICO DE EVOLUÇÃO
    // =========================================================

    const lineData = useMemo(() => {

        if (!dashboard) {
            return {
                labels: [],
                datasets: []
            };
        }

        const meses = [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Out',
            'Nov',
            'Dez'
        ];

        return {

            labels: meses,

            datasets: [

                {
                    label: 'Pré-projectos submetidos',

                    data: dashboard.evolucao.map(
                        item =>
                            item.pre_projectos_submetidos
                    ),

                    fill: false,

                    tension: 0.4
                },

                {
                    label: 'Pré-projectos aprovados',

                    data: dashboard.evolucao.map(
                        item =>
                            item.pre_projectos_aprovados
                    ),

                    fill: false,

                    tension: 0.4
                },

                {
                    label: 'Defesas realizadas',

                    data: dashboard.evolucao.map(
                        item =>
                            item.defesas_realizadas
                    ),

                    fill: false,

                    tension: 0.4
                }

            ]
        };

    }, [dashboard]);

    // =========================================================
    // CONFIGURAÇÃO DO DOUGHNUT
    // =========================================================

    const doughnutData = useMemo(() => {

        if (!dashboard) {

            return {
                labels: [],
                datasets: [
                    {
                        data: []
                    }
                ]
            };

        }

        return {

            labels:
                dashboard.estado_tccs.map(
                    item => item.status
                ),

            datasets: [

                {
                    data:
                        dashboard.estado_tccs.map(
                            item => item.total
                        ),

                    borderWidth: 1
                }

            ]

        };

    }, [dashboard]);

    // =========================================================
    // OPÇÕES DO GRÁFICO DE LINHA
    // =========================================================

    const lineOptions = useMemo(() => {

        const textColor =
            layoutConfig.colorScheme === 'dark'
                ? '#ffffff'
                : '#495057';

        const gridColor =
            layoutConfig.colorScheme === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.1)';

        return {

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    labels: {
                        color: textColor
                    }
                }

            },

            scales: {

                x: {

                    ticks: {
                        color: textColor
                    },

                    grid: {
                        color: gridColor
                    }

                },

                y: {

                    ticks: {
                        color: textColor
                    },

                    grid: {
                        color: gridColor
                    },

                    beginAtZero: true

                }

            }

        };

    }, [layoutConfig.colorScheme]);

    // =========================================================
    // OPÇÕES DO DOUGHNUT
    // =========================================================

    const doughnutOptions = useMemo(() => {

        const textColor =
            layoutConfig.colorScheme === 'dark'
                ? '#ffffff'
                : '#495057';

        return {

            cutout: '60%',

            plugins: {

                legend: {

                    position: 'bottom',

                    labels: {
                        color: textColor
                    }

                }

            },

            maintainAspectRatio: false

        };

    }, [layoutConfig.colorScheme]);

    // =========================================================
    // FORMATAR DATA
    // =========================================================

    const formatDate = (
        date: string
    ) => {

        if (!date) {
            return '-';
        }

        try {

            return new Date(date).toLocaleDateString(
                'pt-PT',
                {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }
            );

        } catch {

            return date;

        }

    };

    // =========================================================
    // FORMATAR HORA
    // =========================================================

    const formatTime = (
        start?: string | null,
        end?: string | null
    ) => {

        if (!start) {
            return '-';
        }

        if (!end) {
            return start;
        }

        return `${start} - ${end}`;

    };

    // =========================================================
    // ESTADO DA DEFESA
    // =========================================================

    const defenseStatusTemplate = (
        rowData: DashboardDefesa
    ) => {

        const status =
            String(rowData.estado || '')
                .toUpperCase();

        let severity:
            | 'success'
            | 'info'
            | 'warning'
            | 'danger'
            | 'secondary'
            | 'contrast'
            | undefined;

        switch (status) {

            case 'REALIZADO':
                severity = 'success';
                break;

            case 'AGENDADO':
                severity = 'info';
                break;

            case 'CANCELADO':
                severity = 'danger';
                break;

            case 'PENDENTE':
                severity = 'warning';
                break;

            default:
                severity = 'secondary';

        }

        return (
            <Tag
                value={
                    rowData.estado || 'N/A'
                }
                // severity={severity}
            />
        );

    };

    // =========================================================
    // AÇÃO DA DEFESA
    // =========================================================

    const actionTemplate = (
        rowData: DashboardDefesa
    ) => {

        return (

            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="secondary"
                tooltip="Ver defesa"
                tooltipOptions={{
                    position: 'top'
                }}
                onClick={() =>
                    router.push(
                        `/pages/minutes/form/${rowData.id}`
                    )
                }
            />

        );

    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div
                className="
                    flex
                    align-items-center
                    justify-content-center
                    min-h-screen
                "
            >

                <div className="text-center">

                    <ProgressSpinner />

                    <div className="mt-3 text-600">
                        Carregando dashboard...
                    </div>

                </div>

            </div>

        );

    }

    // =========================================================
    // ERRO
    // =========================================================

    if (error) {

        return (

            <div className="grid">

                <div className="col-12">

                    <Card>

                        <div
                            className="
                                flex
                                flex-column
                                align-items-center
                                justify-content-center
                                py-6
                            "
                        >

                            <i
                                className="
                                    pi
                                    pi-exclamation-triangle
                                    text-5xl
                                    text-orange-500
                                "
                            />

                            <h3 className="mt-3 mb-2">
                                Erro ao carregar dashboard
                            </h3>

                            <p className="text-600 mb-4">
                                {error}
                            </p>

                            <Button
                                label="Tentar novamente"
                                icon="pi pi-refresh"
                                onClick={
                                    loadDashboard
                                }
                            />

                        </div>

                    </Card>

                </div>

            </div>

        );

    }

    // =========================================================
    // DASHBOARD
    // =========================================================

    const statistics =
        dashboard?.statistics;

    return (

        <div className="grid">

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="col-12">

                <div
                    className="
                        flex
                        flex-column
                        md:flex-row
                        md:align-items-center
                        md:justify-content-between
                        gap-3
                        mb-3
                    "
                >

                    <div>

                        <h2 className="text-900 font-bold m-0">
                            Dashboard
                        </h2>

                        <p className="text-600 mt-2 mb-0">
                            Visão geral do Sistema de
                            Acompanhamento e Defesas Académicas
                            de TCC.
                        </p>

                    </div>

                    <Button
                        label="Actualizar"
                        icon="pi pi-refresh"
                        outlined
                        loading={loading}
                        onClick={loadDashboard}
                    />

                </div>

            </div>


            {/* =================================================
                CARDS
            ================================================= */}

            <div className="col-12 md:col-6 xl:col-3">

                <div className="card mb-0">

                    <div
                        className="
                            flex
                            justify-content-between
                            mb-3
                        "
                    >

                        <div>

                            <span className="block text-500 font-medium mb-3">
                                TCCs em andamento
                            </span>

                            <div className="text-900 font-medium text-xl">
                                {
                                    statistics
                                        ?.tccs_em_andamento ?? 0
                                }
                            </div>

                        </div>

                        <div
                            className="
                                flex
                                align-items-center
                                justify-content-center
                                bg-blue-100
                                border-round
                            "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i
                                className="
                                    pi
                                    pi-book
                                    text-blue-500
                                    text-xl
                                "
                            />

                        </div>

                    </div>

                    <span className="text-500">
                        Trabalhos actualmente em acompanhamento
                    </span>

                </div>

            </div>


            <div className="col-12 md:col-6 xl:col-3">

                <div className="card mb-0">

                    <div
                        className="
                            flex
                            justify-content-between
                            mb-3
                        "
                    >

                        <div>

                            <span className="block text-500 font-medium mb-3">
                                Pré-projectos
                            </span>

                            <div className="text-900 font-medium text-xl">
                                {
                                    statistics
                                        ?.pre_projectos ?? 0
                                }
                            </div>

                        </div>

                        <div
                            className="
                                flex
                                align-items-center
                                justify-content-center
                                bg-orange-100
                                border-round
                            "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i
                                className="
                                    pi
                                    pi-file
                                    text-orange-500
                                    text-xl
                                "
                            />

                        </div>

                    </div>

                    <span className="text-500">
                        Pré-projectos registados no sistema
                    </span>

                </div>

            </div>


            <div className="col-12 md:col-6 xl:col-3">

                <div className="card mb-0">

                    <div
                        className="
                            flex
                            justify-content-between
                            mb-3
                        "
                    >

                        <div>

                            <span className="block text-500 font-medium mb-3">
                                Defesas agendadas
                            </span>

                            <div className="text-900 font-medium text-xl">
                                {
                                    statistics
                                        ?.defesas_agendadas ?? 0
                                }
                            </div>

                        </div>

                        <div
                            className="
                                flex
                                align-items-center
                                justify-content-center
                                bg-purple-100
                                border-round
                            "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i
                                className="
                                    pi
                                    pi-calendar
                                    text-purple-500
                                    text-xl
                                "
                            />

                        </div>

                    </div>

                    <span className="text-500">
                        Defesas actualmente marcadas
                    </span>

                </div>

            </div>


            <div className="col-12 md:col-6 xl:col-3">

                <div className="card mb-0">

                    <div
                        className="
                            flex
                            justify-content-between
                            mb-3
                        "
                    >

                        <div>

                            <span className="block text-500 font-medium mb-3">
                                TCCs defendidos
                            </span>

                            <div className="text-900 font-medium text-xl">
                                {
                                    statistics
                                        ?.tccs_defendidos ?? 0
                                }
                            </div>

                        </div>

                        <div
                            className="
                                flex
                                align-items-center
                                justify-content-center
                                bg-green-100
                                border-round
                            "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i
                                className="
                                    pi
                                    pi-check-circle
                                    text-green-500
                                    text-xl
                                "
                            />

                        </div>

                    </div>

                    <span className="text-500">
                        Defesas já realizadas
                    </span>

                </div>

            </div>


            {/* =================================================
                CARDS SECUNDÁRIOS
            ================================================= */}

            <div className="col-12 md:col-6">

                <div className="card mb-0">

                    <div
                        className="
                            flex
                            justify-content-between
                            align-items-center
                        "
                    >

                        <div>

                            <span className="block text-500 font-medium mb-2">
                                Avaliações submetidas
                            </span>

                            <div className="text-900 font-bold text-2xl">
                                {
                                    statistics
                                        ?.avaliacoes_submetidas ?? 0
                                }
                            </div>

                        </div>

                        <i
                            className="
                                pi
                                pi-star
                                text-yellow-500
                                text-3xl
                            "
                        />

                    </div>

                </div>

            </div>


            <div className="col-12 md:col-6">

                <div className="card mb-0">

                    <div
                        className="
                            flex
                            justify-content-between
                            align-items-center
                        "
                    >

                        <div>

                            <span className="block text-500 font-medium mb-2">
                                Actas lavradas
                            </span>

                            <div className="text-900 font-bold text-2xl">
                                {
                                    statistics
                                        ?.actas_lavradas ?? 0
                                }
                            </div>

                        </div>

                        <i
                            className="
                                pi
                                pi-file-edit
                                text-blue-500
                                text-3xl
                            "
                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                GRÁFICO DE EVOLUÇÃO
            ================================================= */}

            <div className="col-12 xl:col-8">

                <div className="card">

                    <div
                        className="
                            flex
                            justify-content-between
                            align-items-center
                            mb-4
                        "
                    >

                        <div>

                            <h5 className="m-0">
                                Evolução académica
                            </h5>

                            <span className="text-500 text-sm">
                                Dados do ano corrente
                            </span>

                        </div>

                    </div>

                    <div
                        style={{
                            height: '350px'
                        }}
                    >

                        <Chart
                            type="line"
                            data={lineData}
                            options={lineOptions}
                            className="w-full h-full"
                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                ESTADO DOS TCCs
            ================================================= */}

            <div className="col-12 xl:col-4">

                <div className="card">

                    <h5>
                        Estado dos TCCs
                    </h5>

                    <div
                        style={{
                            height: '350px'
                        }}
                    >

                        {
                            dashboard &&
                            dashboard.estado_tccs.length > 0
                                ? (

                                    <Chart
                                        type="doughnut"
                                        data={doughnutData}
                                        options={
                                            doughnutOptions
                                        }
                                        className="w-full h-full"
                                    />

                                )
                                : (

                                    <div
                                        className="
                                            flex
                                            align-items-center
                                            justify-content-center
                                            h-full
                                            text-500
                                        "
                                    >
                                        Não existem dados.
                                    </div>

                                )
                        }

                    </div>

                </div>

            </div>


            {/* =================================================
                PRÓXIMAS DEFESAS
            ================================================= */}

            <div className="col-12">

                <div className="card">

                    <div
                        className="
                            flex
                            flex-column
                            md:flex-row
                            md:align-items-center
                            md:justify-content-between
                            gap-3
                            mb-4
                        "
                    >

                        <div>

                            <h5 className="m-0">
                                Próximas Defesas
                            </h5>

                            <span className="text-500 text-sm">
                                Defesas agendadas no sistema
                            </span>

                        </div>

                        <Button
                            label="Ver todas"
                            icon="pi pi-arrow-right"
                            text
                            onClick={() =>
                                router.push(
                                    '/pages/minutes'
                                )
                            }
                        />

                    </div>

                    <DataTable
                        value={
                            dashboard
                                ?.proximas_defesas ?? []
                        }
                        dataKey="id"
                        responsiveLayout="scroll"
                        emptyMessage="Não existem próximas defesas."
                        stripedRows
                    >

                        <Column
                            header="Estudante"
                            body={(rowData) =>
                                rowData.estudante?.nome ||
                                '-'
                            }
                        />

                        <Column
                            header="Título do TCC"
                            body={(rowData) => (

                                <div
                                    style={{
                                        maxWidth: '400px'
                                    }}
                                    className="white-space-normal"
                                >
                                    {
                                        rowData.tcc
                                            ?.titulo || '-'
                                    }
                                </div>

                            )}
                        />

                        <Column
                            header="Data"
                            body={(rowData) =>
                                formatDate(
                                    rowData.data
                                )
                            }
                        />

                        <Column
                            header="Hora"
                            body={(rowData) =>
                                formatTime(
                                    rowData.hora_inicio,
                                    rowData.hora_fim
                                )
                            }
                        />

                        <Column
                            header="Sala"
                            body={(rowData) =>
                                rowData.sala || '-'
                            }
                        />

                        <Column
                            header="Estado"
                            body={
                                defenseStatusTemplate
                            }
                        />

                        <Column
                            header="Acções"
                            body={
                                actionTemplate
                            }
                            style={{
                                width: '100px'
                            }}
                        />

                    </DataTable>

                </div>

            </div>


            {/* =================================================
                ACTAS / AVALIAÇÕES
            ================================================= */}

            <div className="col-12 md:col-6">

                <div className="card">

                    <div
                        className="
                            flex
                            justify-content-between
                            align-items-center
                            mb-4
                        "
                    >

                        <div>

                            <h5 className="m-0">
                                Actas de Defesa
                            </h5>

                            <p className="text-500 text-sm mt-2 mb-0">
                                Consulte e acompanhe as actas
                                registadas.
                            </p>

                        </div>

                        <i
                            className="
                                pi
                                pi-file-edit
                                text-primary
                                text-2xl
                            "
                        />

                    </div>

                    <div
                        className="
                            flex
                            align-items-center
                            justify-content-between
                            p-3
                            border-1
                            surface-border
                            border-round
                        "
                    >

                        <div>

                            <div className="text-500 text-sm">
                                Total de actas
                            </div>

                            <div className="text-900 font-bold text-2xl mt-1">
                                {
                                    statistics
                                        ?.actas_lavradas ?? 0
                                }
                            </div>

                        </div>

                        <Button
                            label="Consultar"
                            icon="pi pi-arrow-right"
                            outlined
                            onClick={() =>
                                router.push(
                                    '/pages/minutes'
                                )
                            }
                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                AVALIAÇÕES
            ================================================= */}

            <div className="col-12 md:col-6">

                <div className="card">

                    <div
                        className="
                            flex
                            justify-content-between
                            align-items-center
                            mb-4
                        "
                    >

                        <div>

                            <h5 className="m-0">
                                Avaliações do Júri
                            </h5>

                            <p className="text-500 text-sm mt-2 mb-0">
                                Avaliações individuais submetidas
                                pelos membros do júri.
                            </p>

                        </div>

                        <i
                            className="
                                pi
                                pi-star
                                text-yellow-500
                                text-2xl
                            "
                        />

                    </div>

                    <div
                        className="
                            flex
                            align-items-center
                            justify-content-between
                            p-3
                            border-1
                            surface-border
                            border-round
                        "
                    >

                        <div>

                            <div className="text-500 text-sm">
                                Avaliações submetidas
                            </div>

                            <div className="text-900 font-bold text-2xl mt-1">
                                {
                                    statistics
                                        ?.avaliacoes_submetidas ?? 0
                                }
                            </div>

                        </div>

                        {/* <Button
                            label="Consultar"
                            icon="pi pi-arrow-right"
                            outlined
                            onClick={() =>
                                router.push(
                                    '/pages/evaluations'
                                )
                            }
                        /> */}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Dashboard;