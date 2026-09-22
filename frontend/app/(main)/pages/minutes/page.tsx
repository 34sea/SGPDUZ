'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

import {
    getPresidentDefenses,
    PresidentDefense
} from '@/app/api/scheduleDefense/minutesService';

const DefenseMinutes = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [defenses, setDefenses] = useState<PresidentDefense[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadDefenses();
    }, []);

    const loadDefenses = async () => {
        try {
            setLoading(true);

            const data = await getPresidentDefenses();

            setDefenses(data);
        } catch (error: any) {
            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Não foi possível carregar as defesas.',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const normalize = (value: string | null | undefined) =>
        String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    const filteredDefenses = useMemo(() => {
        const query = normalize(search.trim());

        if (!query) {
            return defenses;
        }

        return defenses.filter((defense) => {
            return (
                normalize(defense.student.name).includes(query) ||
                normalize(defense.student.email).includes(query) ||
                normalize(defense.tcc.title).includes(query) ||
                normalize(defense.room?.name).includes(query)
            );
        });
    }, [defenses, search]);

    const pendingMinutes = useMemo(() => {
        return filteredDefenses.filter(
            (defense) => !defense.minutes
        );
    }, [filteredDefenses]);

    const completedMinutes = useMemo(() => {
        return filteredDefenses.filter(
            (defense) => !!defense.minutes
        );
    }, [filteredDefenses]);

    const totalDefenses = defenses.length;

    const totalWithMinutes = defenses.filter(
        (defense) => !!defense.minutes
    ).length;

    const totalWithoutMinutes = totalDefenses - totalWithMinutes;

    const formatDate = (
        date: string | null | undefined
    ) => {
        if (!date) return '-';

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString('pt-PT');
    };

    const formatTime = (
        time: string | null | undefined
    ) => {
        if (!time) return '-';

        return String(time).substring(0, 5);
    };

    const getDefenseStatus = (
        defense: PresidentDefense
    ) => {
        if (defense.minutes) {
            return {
                value: 'Acta lavrada',
                severity: 'success' as const
            };
        }

        if (
            defense.schedule.status === 'REALIZADO'
        ) {
            return {
                value: 'Realizada — sem acta',
                severity: 'warning' as const
            };
        }

        return {
            value: 'Defesa marcada',
            severity: 'info' as const
        };
    };

    const openMinutes = (
        defense: PresidentDefense
    ) => {
        router.push(
            `/pages/minutes/${defense.defense_schedule_id}`
        );
    };

    const studentTemplate = (
        rowData: PresidentDefense
    ) => {
        return (
            <div>
                <div className="font-semibold text-900">
                    {rowData.student.name}
                </div>

                {rowData.student.email && (
                    <div className="text-600 text-sm mt-1">
                        {rowData.student.email}
                    </div>
                )}
            </div>
        );
    };

    const tccTemplate = (
        rowData: PresidentDefense
    ) => {
        return (
            <div
                style={{
                    minWidth: '250px',
                    maxWidth: '400px'
                }}
            >
                <div className="font-medium text-900 line-height-3">
                    {rowData.tcc.title}
                </div>

                {rowData.tcc.notebook_id && (
                    <div className="text-600 text-sm mt-1">
                        TCC #{rowData.tcc.notebook_id}
                    </div>
                )}
            </div>
        );
    };

    const scheduleTemplate = (
        rowData: PresidentDefense
    ) => {
        return (
            <div>
                <div className="font-medium text-900">
                    {formatDate(rowData.schedule.date)}
                </div>

                <div className="text-600 text-sm mt-1">
                    {formatTime(rowData.schedule.start_time)}
                    {' - '}
                    {formatTime(rowData.schedule.end_time)}
                </div>
            </div>
        );
    };

    const roomTemplate = (
        rowData: PresidentDefense
    ) => {
        return (
            <div>
                <div className="font-medium text-900">
                    {rowData.room?.name || '-'}
                </div>

                {rowData.room?.location && (
                    <div className="text-600 text-sm mt-1">
                        {rowData.room.location}
                    </div>
                )}
            </div>
        );
    };

    const evaluationTemplate = (
        rowData: PresidentDefense
    ) => {
        const count = rowData.evaluations.count;
        const average = rowData.evaluations.average;

        return (
            <div>
                <div className="font-semibold text-900">
                    {average !== null
                        ? `${average.toFixed(1)} valores`
                        : '-'}
                </div>

                <div className="text-600 text-sm mt-1">
                    {count} avaliação
                    {count === 1 ? '' : 'ões'}
                </div>
            </div>
        );
    };

    const statusTemplate = (
        rowData: PresidentDefense
    ) => {
        const status = getDefenseStatus(rowData);

        return (
            <Tag
                value={status.value}
                severity={status.severity}
            />
        );
    };

    const actionTemplate = (
        rowData: PresidentDefense
    ) => {
        const hasMinutes = !!rowData.minutes;

        return (
            <Button
                label={
                    hasMinutes
                        ? 'Ver Acta'
                        : 'Lavrar Acta'
                }
                icon={
                    hasMinutes
                        ? 'pi pi-eye'
                        : 'pi pi-file-edit'
                }
                outlined={!hasMinutes}
                // severity={
                //     hasMinutes
                //         ? 'success'
                //         : 'primary'
                // }
                onClick={() =>
                    openMinutes(rowData)
                }
            />
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="grid">

                {/* CABEÇALHO */}
                <div className="col-12">
                    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                        <div>
                            <h3 className="text-900 font-semibold m-0">
                                Actas de Defesa
                            </h3>

                            <p className="text-600 mt-2 mb-0">
                                Gestão das defesas e elaboração das Actas
                                de Defesa Pública.
                            </p>
                        </div>

                        <Button
                            label="Actualizar"
                            icon="pi pi-refresh"
                            outlined
                            loading={loading}
                            onClick={loadDefenses}
                        />

                    </div>
                </div>

                {/* ESTATÍSTICAS */}
                <div className="col-12 md:col-4">
                    <Card>
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <span className="block text-600 mb-2">
                                    Total de defesas
                                </span>

                                <span className="text-900 font-bold text-3xl">
                                    {totalDefenses}
                                </span>
                            </div>

                            <div className="surface-100 border-round p-3">
                                <i className="pi pi-calendar text-primary text-2xl" />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card>
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <span className="block text-600 mb-2">
                                    Actas pendentes
                                </span>

                                <span className="text-orange-600 font-bold text-3xl">
                                    {totalWithoutMinutes}
                                </span>
                            </div>

                            <div className="surface-100 border-round p-3">
                                <i className="pi pi-file-edit text-orange-500 text-2xl" />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card>
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <span className="block text-600 mb-2">
                                    Actas lavradas
                                </span>

                                <span className="text-green-600 font-bold text-3xl">
                                    {totalWithMinutes}
                                </span>
                            </div>

                            <div className="surface-100 border-round p-3">
                                <i className="pi pi-check-circle text-green-500 text-2xl" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* LISTA */}
                <div className="col-12">
                    <Card>

                        <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">

                            <div>
                                <h5 className="text-900 m-0">
                                    Defesas
                                </h5>

                                <p className="text-600 mt-2 mb-0">
                                    Seleccione uma defesa para consultar
                                    ou elaborar a respectiva acta.
                                </p>
                            </div>

                            <span className="p-input-icon-left w-full md:w-20rem">
                                <i className="pi pi-search" />

                                <InputText
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Pesquisar..."
                                    className="w-full"
                                />
                            </span>

                        </div>

                        {loading ? (
                            <div
                                className="flex justify-content-center align-items-center"
                                style={{
                                    minHeight: '300px'
                                }}
                            >
                                <ProgressSpinner />
                            </div>
                        ) : (
                            <TabView>

                                {/* PENDENTES */}
                                <TabPanel
                                    header={`Pendentes (${pendingMinutes.length})`}
                                    leftIcon="pi pi-file-edit mr-2"
                                >
                                    <DataTable
                                        value={pendingMinutes}
                                        paginator
                                        rows={10}
                                        responsiveLayout="scroll"
                                        stripedRows
                                        showGridlines
                                        emptyMessage="Não existem defesas pendentes de acta."
                                    >
                                        <Column
                                            body={studentTemplate}
                                            header="Estudante"
                                        />

                                        <Column
                                            body={tccTemplate}
                                            header="Trabalho"
                                        />

                                        <Column
                                            body={scheduleTemplate}
                                            header="Defesa"
                                        />

                                        <Column
                                            body={roomTemplate}
                                            header="Sala"
                                        />

                                        <Column
                                            body={evaluationTemplate}
                                            header="Avaliações"
                                        />

                                        <Column
                                            body={statusTemplate}
                                            header="Estado"
                                        />

                                        <Column
                                            body={actionTemplate}
                                            header="Acção"
                                            style={{
                                                width: '150px'
                                            }}
                                        />
                                    </DataTable>
                                </TabPanel>

                                {/* ACTAS */}
                                <TabPanel
                                    header={`Actas lavradas (${completedMinutes.length})`}
                                    leftIcon="pi pi-check-circle mr-2"
                                >
                                    <DataTable
                                        value={completedMinutes}
                                        paginator
                                        rows={10}
                                        responsiveLayout="scroll"
                                        stripedRows
                                        showGridlines
                                        emptyMessage="Ainda não existem actas lavradas."
                                    >
                                        <Column
                                            body={studentTemplate}
                                            header="Estudante"
                                        />

                                        <Column
                                            body={tccTemplate}
                                            header="Trabalho"
                                        />

                                        <Column
                                            body={scheduleTemplate}
                                            header="Defesa"
                                        />

                                        <Column
                                            body={evaluationTemplate}
                                            header="Média"
                                        />

                                        <Column
                                            header="Nota Final"
                                            body={(
                                                rowData: PresidentDefense
                                            ) => (
                                                <span className="font-bold text-primary">
                                                    {rowData.minutes?.final_score !== null &&
                                                    rowData.minutes?.final_score !== undefined
                                                        ? `${Number(
                                                              rowData.minutes.final_score
                                                          ).toFixed(1)} valores`
                                                        : '-'}
                                                </span>
                                            )}
                                        />

                                        <Column
                                            header="Resultado"
                                            body={(
                                                rowData: PresidentDefense
                                            ) => (
                                                <Tag
                                                    value={
                                                        rowData.minutes?.decision ||
                                                        '-'
                                                    }
                                                    severity={
                                                        rowData.minutes?.decision?.toLowerCase() ===
                                                        'aprovado'
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                />
                                            )}
                                        />

                                        <Column
                                            body={actionTemplate}
                                            header="Acção"
                                            style={{
                                                width: '130px'
                                            }}
                                        />
                                    </DataTable>
                                </TabPanel>

                            </TabView>
                        )}

                    </Card>
                </div>

            </div>
        </>
    );
};

export default DefenseMinutes;