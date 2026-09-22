
'use client';

import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';

const DashboardPage = () => {

    /*
     * ============================================================
     * DADOS SIMULADOS
     * ============================================================
     */

    const resumo = {
        aulasPrevistas: 48,
        aulasLeccionadas: 42,
        aulasPendentes: 6,
        cumprimento: 87.5,

        avaliacoesRealizadas: 14,
        avaliacoesPendentes: 3,

        pautasFinalizadas: 4,
        pautasPendentes: 1,

        actividadesAdHoc: 8,
        actividadesPendentes: 2
    };

    const disciplinas = [
        {
            nome: 'Programação Web',
            codigo: 'PW',
            previstas: 16,
            leccionadas: 15,
            percentagem: 93.8
        },
        {
            nome: 'Base de Dados',
            codigo: 'BD',
            previstas: 12,
            leccionadas: 10,
            percentagem: 83.3
        },
        {
            nome: 'Engenharia de Software',
            codigo: 'ES',
            previstas: 10,
            leccionadas: 9,
            percentagem: 90
        },
        {
            nome: 'Sistemas Operativos',
            codigo: 'SO',
            previstas: 10,
            leccionadas: 8,
            percentagem: 80
        }
    ];

    const actividades = [
        {
            titulo: 'Submissão da avaliação contínua',
            tipo: 'Avaliação',
            data: '22 Set. 2026',
            estado: 'Pendente',
            severity: 'warning'
        },
        {
            titulo: 'Entrega do Mapa Semanal de Aulas',
            tipo: 'Mapa de Aulas',
            data: '23 Set. 2026',
            estado: 'Pendente',
            severity: 'warning'
        },
        {
            titulo: 'Revisão do Plano Analítico',
            tipo: 'Plano Analítico',
            data: '25 Set. 2026',
            estado: 'Em curso',
            severity: 'info'
        },
        {
            titulo: 'Submissão da Pauta Final',
            tipo: 'Pauta',
            data: '30 Set. 2026',
            estado: 'Agendado',
            severity: 'success'
        }
    ];

    /*
     * ============================================================
     * CORES
     * ============================================================
     */

    const colors = {
        primary: '#1D4ED8',
        primaryLight: '#EFF6FF',
        green: '#16A34A',
        greenLight: '#DCFCE7',
        orange: '#D97706',
        orangeLight: '#FEF3C7',
        purple: '#7C3AED',
        purpleLight: '#F3E8FF',

        dark: '#0F172A',
        text: '#334155',
        muted: '#64748B',
        light: '#94A3B8',
        border: '#E2E8F0',
        background: '#F8FAFC'
    };

    /*
     * ============================================================
     * ESTILOS
     * ============================================================
     */

    const cardStyle = {
        border: `1px solid ${colors.border}`,
        borderRadius: '14px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
    };

    /*
     * ============================================================
     * GRÁFICO DE CUMPRIMENTO
     * ============================================================
     */

    const cumprimentoChartData = {
        labels: [
            'Semana 1',
            'Semana 2',
            'Semana 3',
            'Semana 4',
            'Semana 5',
            'Semana 6'
        ],
        datasets: [
            {
                label: 'Aulas cumpridas (%)',
                data: [92, 85, 88, 91, 82, 87],
                borderColor: colors.primary,
                backgroundColor: 'rgba(29, 78, 216, 0.10)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    const cumprimentoChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    callback: (value: number) => `${value}%`,
                    color: colors.muted
                },
                grid: {
                    color: colors.border
                }
            },
            x: {
                ticks: {
                    color: colors.muted
                },
                grid: {
                    display: false
                }
            }
        }
    };

    /*
     * ============================================================
     * GRÁFICO DE DISTRIBUIÇÃO
     * ============================================================
     */

    const distribuicaoChartData = {
        labels: [
            'Aulas leccionadas',
            'Avaliações',
            'Pautas',
            'Actividades Ad-Hoc'
        ],
        datasets: [
            {
                data: [42, 14, 4, 8],
                backgroundColor: [
                    colors.primary,
                    colors.green,
                    colors.orange,
                    colors.purple
                ],
                borderWidth: 0
            }
        ]
    };

    const distribuicaoChartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        cutout: '72%'
    };

    return (
        <div
            className="surface-ground min-h-screen"
            style={{
                width: '100%',
                minWidth: 0,
                margin: 0,
                padding: '1rem',
                background: colors.background,
                boxSizing: 'border-box'
            }}
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center gap-3"
                style={{
                    marginBottom: '1rem'
                }}
            >

                <div>

                    <div className="flex align-items-center gap-2">

                        <h1
                            className="m-0"
                            style={{
                                color: colors.dark,
                                fontSize: '1.6rem',
                                fontWeight: 700
                            }}
                        >
                            Dashboard
                        </h1>

                        <Tag
                            value="Docente"
                            style={{
                                background: colors.primaryLight,
                                color: colors.primary
                            }}
                        />

                    </div>

                    <p
                        className="m-0 mt-1"
                        style={{
                            color: colors.muted,
                            fontSize: '0.875rem'
                        }}
                    >
                        Visão geral da sua actividade pedagógica
                    </p>

                </div>

                <div className="flex gap-2">

                    <Button
                        label="Relatórios"
                        icon="pi pi-file-pdf"
                        outlined
                        style={{
                            color: colors.text,
                            borderColor: '#CBD5E1'
                        }}
                    />

                    <Button
                        label="Actualizar"
                        icon="pi pi-refresh"
                        style={{
                            background: colors.primary,
                            borderColor: colors.primary
                        }}
                    />

                </div>

            </div>


            {/* ==================================================
                PERFIL DO DOCENTE
            ================================================== */}

            <div
                className="surface-card border-round-xl"
                style={{
                    ...cardStyle,
                    padding: '0.9rem 1.15rem',
                    marginBottom: '1rem'
                }}
            >

                <div
                    className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-3"
                >

                    <div className="flex align-items-center gap-3">

                        <Avatar
                            label="FD"
                            shape="circle"
                            size="large"
                            style={{
                                background: '#DBEAFE',
                                color: colors.primary,
                                fontWeight: 700
                            }}
                        />

                        <div>

                            <div className="flex align-items-center gap-2">

                                <strong
                                    style={{
                                        color: colors.dark,
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Francisco Domingos
                                </strong>

                                <Badge
                                    value="Activo"
                                    severity="success"
                                />

                            </div>

                            <span
                                style={{
                                    color: colors.muted,
                                    fontSize: '0.8rem'
                                }}
                            >
                                Docente • Departamento de Engenharia Informática
                            </span>

                        </div>

                    </div>

                    <div className="flex align-items-center gap-4">

                        <div>

                            <span
                                className="block"
                                style={{
                                    color: colors.light,
                                    fontSize: '0.68rem',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Período
                            </span>

                            <strong
                                style={{
                                    color: colors.text,
                                    fontSize: '0.8rem'
                                }}
                            >
                                2º Semestre 2026
                            </strong>

                        </div>

                        <Divider
                            layout="vertical"
                            className="hidden md:block m-0"
                        />

                        <div>

                            <span
                                className="block"
                                style={{
                                    color: colors.light,
                                    fontSize: '0.68rem',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Actualização
                            </span>

                            <strong
                                style={{
                                    color: colors.text,
                                    fontSize: '0.8rem'
                                }}
                            >
                                Hoje, 14:30
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                BLOCO PRINCIPAL
                3 COLUNAS
            ================================================== */}

            <div className="grid">

                {/* ==================================================
                    DESEMPENHO GERAL
                ================================================== */}

                <div className="col-12 lg:col-3">

                    <Card
                        style={{
                            ...cardStyle,
                            height: '100%'
                        }}
                    >

                        <div
                            className="flex justify-content-between align-items-start"
                        >

                            <div>

                                <span
                                    style={{
                                        color: colors.muted,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Cumprimento geral
                                </span>

                                <h2
                                    className="m-0 mt-2"
                                    style={{
                                        color: colors.dark,
                                        fontSize: '2.3rem',
                                        fontWeight: 700
                                    }}
                                >
                                    87.5%
                                </h2>

                            </div>

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    background: colors.primaryLight,
                                    color: colors.primary
                                }}
                            >
                                <i className="pi pi-chart-line" />
                            </div>

                        </div>

                        <div className="mt-4">

                            <ProgressBar
                                value={87.5}
                                showValue={false}
                                style={{
                                    height: '8px'
                                }}
                            />

                        </div>

                        <div
                            className="flex justify-content-between mt-2"
                        >

                            <small
                                style={{
                                    color: colors.muted
                                }}
                            >
                                Meta do semestre
                            </small>

                            <small
                                style={{
                                    color: colors.primary,
                                    fontWeight: 600
                                }}
                            >
                                90%
                            </small>

                        </div>

                        <Divider />

                        <div className="flex flex-column gap-3">

                            <div
                                className="flex justify-content-between align-items-center"
                            >

                                <div className="flex align-items-center gap-2">

                                    <i
                                        className="pi pi-book"
                                        style={{
                                            color: colors.primary
                                        }}
                                    />

                                    <span
                                        style={{
                                            color: colors.muted,
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        Aulas
                                    </span>

                                </div>

                                <strong
                                    style={{
                                        color: colors.text
                                    }}
                                >
                                    42/48
                                </strong>

                            </div>

                            <div
                                className="flex justify-content-between align-items-center"
                            >

                                <div className="flex align-items-center gap-2">

                                    <i
                                        className="pi pi-check-square"
                                        style={{
                                            color: colors.green
                                        }}
                                    />

                                    <span
                                        style={{
                                            color: colors.muted,
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        Avaliações
                                    </span>

                                </div>

                                <strong
                                    style={{
                                        color: colors.text
                                    }}
                                >
                                    14
                                </strong>

                            </div>

                            <div
                                className="flex justify-content-between align-items-center"
                            >

                                <div className="flex align-items-center gap-2">

                                    <i
                                        className="pi pi-file-edit"
                                        style={{
                                            color: colors.orange
                                        }}
                                    />

                                    <span
                                        style={{
                                            color: colors.muted,
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        Pautas
                                    </span>

                                </div>

                                <strong
                                    style={{
                                        color: colors.text
                                    }}
                                >
                                    4
                                </strong>

                            </div>

                        </div>

                    </Card>

                </div>


                {/* ==================================================
                    GRÁFICO
                ================================================== */}

                <div className="col-12 lg:col-6">

                    <Card
                        style={{
                            ...cardStyle,
                            height: '100%'
                        }}
                    >

                        <div
                            className="flex justify-content-between align-items-start"
                        >

                            <div>

                                <h2
                                    className="m-0"
                                    style={{
                                        color: colors.dark,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Evolução semanal
                                </h2>

                                <span
                                    style={{
                                        color: colors.muted,
                                        fontSize: '0.78rem'
                                    }}
                                >
                                    Cumprimento das aulas por semana
                                </span>

                            </div>

                            <Tag
                                value="+5.5%"
                                severity="success"
                            />

                        </div>

                        <div
                            style={{
                                height: '275px',
                                marginTop: '1rem'
                            }}
                        >

                            <Chart
                                type="line"
                                data={cumprimentoChartData}
                                options={cumprimentoChartOptions}
                                style={{
                                    width: '100%',
                                    height: '100%'
                                }}
                            />

                        </div>

                    </Card>

                </div>


                {/* ==================================================
                    ACTIVIDADES
                ================================================== */}

                <div className="col-12 lg:col-3">

                    <Card
                        style={{
                            ...cardStyle,
                            height: '100%'
                        }}
                    >

                        <div
                            className="flex justify-content-between align-items-center"
                        >

                            <div>

                                <h2
                                    className="m-0"
                                    style={{
                                        color: colors.dark,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Pendências
                                </h2>

                                <span
                                    style={{
                                        color: colors.muted,
                                        fontSize: '0.78rem'
                                    }}
                                >
                                    Próximas actividades
                                </span>

                            </div>

                            <Badge
                                value="4"
                                severity="warning"
                            />

                        </div>

                        <div className="mt-3">

                            {actividades.map((actividade, index) => (

                                <div key={index}>

                                    <div
                                        className="flex align-items-start gap-2"
                                        style={{
                                            padding: '0.7rem 0'
                                        }}
                                    >

                                        <div
                                            className="flex align-items-center justify-content-center border-circle"
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                minWidth: '30px',
                                                background:
                                                    actividade.severity === 'warning'
                                                        ? colors.orangeLight
                                                        : actividade.severity === 'success'
                                                            ? colors.greenLight
                                                            : colors.primaryLight,
                                                color:
                                                    actividade.severity === 'warning'
                                                        ? colors.orange
                                                        : actividade.severity === 'success'
                                                            ? colors.green
                                                            : colors.primary
                                            }}
                                        >
                                            <i
                                                className="pi pi-calendar"
                                                style={{
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </div>

                                        <div
                                            style={{
                                                minWidth: 0
                                            }}
                                        >

                                            <strong
                                                className="block"
                                                style={{
                                                    color: colors.text,
                                                    fontSize: '0.76rem',
                                                    lineHeight: 1.4
                                                }}
                                            >
                                                {actividade.titulo}
                                            </strong>

                                            <small
                                                style={{
                                                    color: colors.light,
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                {actividade.data}
                                            </small>

                                        </div>

                                    </div>

                                    {index < actividades.length - 1 && (
                                        <Divider className="my-0" />
                                    )}

                                </div>

                            ))}

                        </div>

                    </Card>

                </div>

            </div>


            {/* ==================================================
                FAIXA DE INDICADORES
            ================================================== */}

            <div
                className="surface-card border-round-xl"
                style={{
                    ...cardStyle,
                    marginTop: '0.25rem',
                    overflow: 'hidden'
                }}
            >

                <div className="grid m-0">

                    {/* AULAS */}

                    <div className="col-12 sm:col-6 lg:col-3">

                        <div className="flex align-items-center gap-3 p-2">

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    background: colors.primaryLight,
                                    color: colors.primary
                                }}
                            >
                                <i className="pi pi-book" />
                            </div>

                            <div>

                                <span
                                    className="block"
                                    style={{
                                        color: colors.muted,
                                        fontSize: '0.72rem'
                                    }}
                                >
                                    Aulas pendentes
                                </span>

                                <strong
                                    style={{
                                        color: colors.dark,
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {resumo.aulasPendentes}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* AVALIAÇÕES */}

                    <div className="col-12 sm:col-6 lg:col-3">

                        <div className="flex align-items-center gap-3 p-2">

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    background: colors.greenLight,
                                    color: colors.green
                                }}
                            >
                                <i className="pi pi-check-square" />
                            </div>

                            <div>

                                <span
                                    className="block"
                                    style={{
                                        color: colors.muted,
                                        fontSize: '0.72rem'
                                    }}
                                >
                                    Avaliações pendentes
                                </span>

                                <strong
                                    style={{
                                        color: colors.dark,
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {resumo.avaliacoesPendentes}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* PAUTAS */}

                    <div className="col-12 sm:col-6 lg:col-3">

                        <div className="flex align-items-center gap-3 p-2">

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    background: colors.orangeLight,
                                    color: colors.orange
                                }}
                            >
                                <i className="pi pi-file-edit" />
                            </div>

                            <div>

                                <span
                                    className="block"
                                    style={{
                                        color: colors.muted,
                                        fontSize: '0.72rem'
                                    }}
                                >
                                    Pautas pendentes
                                </span>

                                <strong
                                    style={{
                                        color: colors.dark,
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {resumo.pautasPendentes}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* AD-HOC */}

                    <div className="col-12 sm:col-6 lg:col-3">

                        <div className="flex align-items-center gap-3 p-2">

                            <div
                                className="flex align-items-center justify-content-center border-round-lg"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    background: colors.purpleLight,
                                    color: colors.purple
                                }}
                            >
                                <i className="pi pi-list-check" />
                            </div>

                            <div>

                                <span
                                    className="block"
                                    style={{
                                        color: colors.muted,
                                        fontSize: '0.72rem'
                                    }}
                                >
                                    Actividades Ad-Hoc
                                </span>

                                <strong
                                    style={{
                                        color: colors.dark,
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {resumo.actividadesAdHoc}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                SEGUNDA ÁREA
            ================================================== */}

            <div className="grid">

                {/* ==================================================
                    DISCIPLINAS
                ================================================== */}

                <div className="col-12 xl:col-8">

                    <Card style={cardStyle}>

                        <div
                            className="flex justify-content-between align-items-center mb-3"
                        >

                            <div>

                                <h2
                                    className="m-0"
                                    style={{
                                        color: colors.dark,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Desempenho por disciplina
                                </h2>

                                <span
                                    style={{
                                        color: colors.muted,
                                        fontSize: '0.78rem'
                                    }}
                                >
                                    Acompanhamento das aulas por unidade curricular
                                </span>

                            </div>

                            <Button
                                label="Ver detalhes"
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                text
                                size="small"
                                style={{
                                    color: colors.primary
                                }}
                            />

                        </div>

                        <div className="grid">

                            {disciplinas.map((disciplina) => (

                                <div
                                    key={disciplina.codigo}
                                    className="col-12 md:col-6"
                                >

                                    <div
                                        className="surface-ground border-round-xl"
                                        style={{
                                            border: `1px solid ${colors.border}`,
                                            padding: '1rem'
                                        }}
                                    >

                                        <div
                                            className="flex justify-content-between align-items-center"
                                        >

                                            <div className="flex align-items-center gap-2">

                                                <Avatar
                                                    label={disciplina.codigo}
                                                    shape="circle"
                                                    style={{
                                                        background: colors.primaryLight,
                                                        color: colors.primary,
                                                        width: '38px',
                                                        height: '38px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: 700
                                                    }}
                                                />

                                                <div>

                                                    <strong
                                                        className="block"
                                                        style={{
                                                            color: colors.text,
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        {disciplina.nome}
                                                    </strong>

                                                    <small
                                                        style={{
                                                            color: colors.light
                                                        }}
                                                    >
                                                        {disciplina.leccionadas} de {disciplina.previstas} aulas
                                                    </small>

                                                </div>

                                            </div>

                                            <strong
                                                style={{
                                                    color: colors.primary,
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {disciplina.percentagem}%
                                            </strong>

                                        </div>

                                        <ProgressBar
                                            value={disciplina.percentagem}
                                            showValue={false}
                                            className="mt-3"
                                            style={{
                                                height: '6px'
                                            }}
                                        />

                                        <div
                                            className="flex justify-content-between mt-2"
                                        >

                                            <small
                                                style={{
                                                    color: colors.light
                                                }}
                                            >
                                                Cumprimento
                                            </small>

                                            <small
                                                style={{
                                                    color: colors.muted
                                                }}
                                            >
                                                {disciplina.previstas - disciplina.leccionadas} aulas restantes
                                            </small>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </Card>

                </div>


                {/* ==================================================
                    DISTRIBUIÇÃO
                ================================================== */}

                <div className="col-12 xl:col-4">

                    <Card style={cardStyle}>

                        <div>

                            <h2
                                className="m-0"
                                style={{
                                    color: colors.dark,
                                    fontSize: '1rem'
                                }}
                            >
                                Distribuição pedagógica
                            </h2>

                            <span
                                style={{
                                    color: colors.muted,
                                    fontSize: '0.78rem'
                                }}
                            >
                                Actividades registadas
                            </span>

                        </div>

                        <div
                            className="flex justify-content-center"
                            style={{
                                height: '205px',
                                marginTop: '0.5rem'
                            }}
                        >

                            <Chart
                                type="doughnut"
                                data={distribuicaoChartData}
                                options={distribuicaoChartOptions}
                                style={{
                                    width: '100%',
                                    height: '100%'
                                }}
                            />

                        </div>

                        <div className="flex flex-column gap-2 mt-2">

                            <div
                                className="flex justify-content-between align-items-center"
                            >

                                <div className="flex align-items-center gap-2">

                                    <span
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: colors.primary
                                        }}
                                    />

                                    <span
                                        style={{
                                            color: colors.muted,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Aulas leccionadas
                                    </span>

                                </div>

                                <strong
                                    style={{
                                        color: colors.text,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    42
                                </strong>

                            </div>

                            <div
                                className="flex justify-content-between align-items-center"
                            >

                                <div className="flex align-items-center gap-2">

                                    <span
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: colors.green
                                        }}
                                    />

                                    <span
                                        style={{
                                            color: colors.muted,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Avaliações
                                    </span>

                                </div>

                                <strong
                                    style={{
                                        color: colors.text,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    14
                                </strong>

                            </div>

                            <div
                                className="flex justify-content-between align-items-center"
                            >

                                <div className="flex align-items-center gap-2">

                                    <span
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: colors.orange
                                        }}
                                    />

                                    <span
                                        style={{
                                            color: colors.muted,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Pautas
                                    </span>

                                </div>

                                <strong
                                    style={{
                                        color: colors.text,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    4
                                </strong>

                            </div>

                            <div
                                className="flex justify-content-between align-items-center"
                            >

                                <div className="flex align-items-center gap-2">

                                    <span
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: colors.purple
                                        }}
                                    />

                                    <span
                                        style={{
                                            color: colors.muted,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Actividades Ad-Hoc
                                    </span>

                                </div>

                                <strong
                                    style={{
                                        color: colors.text,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    8
                                </strong>

                            </div>

                        </div>

                    </Card>

                </div>

            </div>


            {/* ==================================================
                ESTADO FINAL
            ================================================== */}

            <div
                className="surface-card border-round-xl"
                style={{
                    border: `1px solid ${colors.border}`,
                    padding: '1rem 1.25rem'
                }}
            >

                <div
                    className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-3"
                >

                    <div className="flex align-items-center gap-3">

                        <div
                            className="flex align-items-center justify-content-center border-circle"
                            style={{
                                width: '42px',
                                height: '42px',
                                background: colors.primaryLight,
                                color: colors.primary
                            }}
                        >
                            <i className="pi pi-check-circle" />
                        </div>

                        <div>

                            <strong
                                className="block"
                                style={{
                                    color: colors.dark,
                                    fontSize: '0.9rem'
                                }}
                            >
                                Estado geral do cumprimento pedagógico
                            </strong>

                            <small
                                style={{
                                    color: colors.muted
                                }}
                            >
                                Indicador baseado nas actividades registadas no SGPD.
                            </small>

                        </div>

                    </div>

                    <div
                        className="flex align-items-center gap-3"
                        style={{
                            width: '100%',
                            maxWidth: '400px'
                        }}
                    >

                        <ProgressBar
                            value={87.5}
                            showValue={false}
                            style={{
                                flex: 1,
                                height: '8px'
                            }}
                        />

                        <strong
                            style={{
                                color: colors.primary,
                                fontSize: '1rem'
                            }}
                        >
                            87.5%
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default DashboardPage;
