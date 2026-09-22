'use client';

import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import {
    useParams,
    useRouter
} from 'next/navigation';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

import {
    getPresidentDefenses,
    getEvaluationSheetsBySchedule,
    getDefenseMinutesBySchedule,
    createDefenseMinutes,
    PresidentDefense,
    DefenseEvaluation,
    DefenseMinute
} from '@/app/api/scheduleDefense/minutesService';

const DefenseMinutesForm = () => {
    const params = useParams();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const scheduleId = Number(
        params.id
    );

    const [defense, setDefense] =
        useState<PresidentDefense | null>(null);

    const [evaluations, setEvaluations] =
        useState<DefenseEvaluation[]>([]);

    const [minutes, setMinutes] =
        useState<DefenseMinute | null>(null);

    const [resultado, setResultado] =
        useState<string | null>(null);

    const [observacoes, setObservacoes] =
        useState('');

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const resultados = [
        {
            label: 'Aprovado',
            value: 'aprovado'
        },
        {
            label: 'Reprovado',
            value: 'reprovado'
        }
    ];

    useEffect(() => {
        console.log(`scheduleId: ${scheduleId}`)
        if (!scheduleId || Number.isNaN(scheduleId)) {
            return;
        }

        loadData();
    }, [scheduleId]);

    const loadData = async () => {
        try {
            setLoading(true);

            /*
             * Primeiro procuramos a defesa entre as
             * defesas atribuídas ao Presidente.
             */
            const defenses =
                await getPresidentDefenses();

            const currentDefense =
                defenses.find(
                    (item) =>
                        Number(
                            item.defense_schedule_id
                        ) === scheduleId
                );

            if (!currentDefense) {
                throw new Error(
                    'Esta defesa não está atribuída ao Presidente autenticado.'
                );
            }

            setDefense(currentDefense);

            /*
             * Buscar avaliações individuais.
             */
            const evaluationData =
                await getEvaluationSheetsBySchedule(
                    scheduleId
                );

            setEvaluations(
                evaluationData || []
            );

            /*
             * Se já existe acta, carregar.
             */
            if (currentDefense.minutes) {
                setMinutes(
                    currentDefense.minutes
                );

                setResultado(
                    currentDefense.minutes.decision
                );

                setObservacoes(
                    currentDefense.minutes
                        .deliberation_notes || ''
                );
            } else {
                /*
                 * Também tentamos o endpoint da acta
                 * directamente.
                 */
                try {
                    const existingMinutes =
                        await getDefenseMinutesBySchedule(
                            scheduleId
                        );

                    if (existingMinutes) {
                        setMinutes(
                            existingMinutes
                        );

                        setResultado(
                            existingMinutes.decision
                        );

                        setObservacoes(
                            existingMinutes
                                .deliberation_notes || ''
                        );
                    }
                } catch (error: any) {
                    /*
                     * 404 significa apenas que a acta
                     * ainda não existe.
                     */
                    if (
                        error?.response?.status !==
                        404
                    ) {
                        console.error(error);
                    }
                }
            }

        } catch (error: any) {
            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Erro ao carregar os dados da defesa.',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    /*
     * A nota final da defesa é a média das
     * notas individuais dos membros.
     */
    const finalScore = useMemo(() => {
        const scores = evaluations
            .map(
                (evaluation) =>
                    evaluation.individual_score
            )
            .filter(
                (
                    score
                ): score is number =>
                    score !== null &&
                    score !== undefined
            );

        if (scores.length === 0) {
            return null;
        }

        const total = scores.reduce(
            (sum, score) =>
                sum + Number(score),
            0
        );

        return Number(
            (total / scores.length).toFixed(2)
        );
    }, [evaluations]);

    const allEvaluationsSubmitted =
        defense
            ? evaluations.length > 0 &&
              evaluations.length >=
                  getExpectedJuryMembersCount(
                      defense
                  )
            : false;

    function getExpectedJuryMembersCount(
        currentDefense: PresidentDefense
    ) {
        /*
         * O endpoint da lista não traz ainda
         * explicitamente o número de membros.
         *
         * Para não bloquear a criação da acta,
         * usamos as avaliações existentes.
         *
         * Se quiseres obrigar todos os membros,
         * recomendo adicionar no endpoint:
         * jury_members_count.
         */
        return evaluations.length;
    }

    const formatDate = (
        date: string | null | undefined
    ) => {
        if (!date) {
            return '-';
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString(
            'pt-PT'
        );
    };

    const formatTime = (
        time: string | null | undefined
    ) => {
        if (!time) {
            return '-';
        }

        return String(time).substring(0, 5);
    };

    const roleLabel = (
        role: string
    ) => {
        switch (role) {
            case 'PRESIDENTE':
                return 'Presidente do Júri';

            case 'OPONENTE':
                return 'Oponente';

            case 'ORIENTADOR':
                return 'Orientador';

            case 'VOGAL':
                return 'Membro do Júri';

            default:
                return role;
        }
    };

    const roleSeverity = (
        role: string
    ) => {
        switch (role) {
            case 'PRESIDENTE':
                return 'danger' as const;

            case 'OPONENTE':
                return 'warning' as const;

            case 'ORIENTADOR':
                return 'info' as const;

            default:
                return 'secondary' as const;
        }
    };

    const handleSave = async () => {
        if (!defense) {
            return;
        }

        if (minutes) {
            toast.current?.show({
                severity: 'info',
                summary: 'Acta já registada',
                detail:
                    'Esta acta já foi lavrada e não pode ser registada novamente.',
                life: 4000
            });

            return;
        }

        if (evaluations.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Avaliações em falta',
                detail:
                    'Ainda não existem avaliações individuais submetidas.',
                life: 5000
            });

            return;
        }

        if (finalScore === null) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Nota indisponível',
                detail:
                    'Não foi possível calcular a média das avaliações.',
                life: 5000
            });

            return;
        }

        if (!resultado) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Resultado obrigatório',
                detail:
                    'Seleccione o resultado da defesa.',
                life: 4000
            });

            return;
        }

        try {
            setSaving(true);

            const response =
                await createDefenseMinutes({
                    defense_schedule_id:
                        defense.defense_schedule_id,

                    institutional_header:
                        'UNIVERSIDADE ZAMBEZE',

                    final_score: finalScore,

                    decision: resultado,

                    deliberation_notes:
                        observacoes || null
                });

            toast.current?.show({
                severity: 'success',
                summary: 'Acta registada',
                detail:
                    response?.message ||
                    'A Acta de Defesa foi registada com sucesso.',
                life: 5000
            });

            await loadData();

        } catch (error: any) {
            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Não foi possível registar a acta.',
                life: 5000
            });
        } finally {
            setSaving(false);
        }
    };

    const memberTemplate = (
        rowData: DefenseEvaluation
    ) => {
        return (
            <div>
                <div className="font-semibold text-900">
                    {rowData.member_name}
                </div>

                <div className="mt-2">
                    <Tag
                        value={roleLabel(
                            rowData.role_in_jury
                        )}
                        // severity={roleSeverity(
                        //     rowData.role_in_jury
                        // )}
                    />
                </div>
            </div>
        );
    };

    const scoreTemplate = (
        rowData: DefenseEvaluation
    ) => {
        if (
            rowData.individual_score === null ||
            rowData.individual_score === undefined
        ) {
            return (
                <Tag
                    value="Não submetida"
                    severity="warning"
                />
            );
        }

        return (
            <span className="font-bold text-primary">
                {Number(
                    rowData.individual_score
                ).toFixed(1)}{' '}
                valores
            </span>
        );
    };

    const publicationTemplate = (
        rowData: DefenseEvaluation
    ) => {
        return rowData.publication_recommended ? (
            <Tag
                value="Recomendado"
                severity="success"
            />
        ) : (
            <Tag
                value="Não recomendado"
                // severity="secondary"
            />
        );
    };

    if (loading) {
        return (
            <div
                className="flex justify-content-center align-items-center"
                style={{
                    minHeight: '70vh'
                }}
            >
                <ProgressSpinner />
            </div>
        );
    }

    if (!defense) {
        return (
            <div className="card">
                <div className="text-center p-5">
                    <i
                        className="pi pi-exclamation-triangle text-orange-500"
                        style={{
                            fontSize: '3rem'
                        }}
                    />

                    <h4 className="text-900">
                        Defesa não encontrada
                    </h4>

                    <p className="text-600">
                        A defesa não está atribuída ao
                        Presidente autenticado.
                    </p>

                    <Button
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        onClick={() =>
                            router.push(
                                '/pages/minutes'
                            )
                        }
                    />
                </div>
            </div>
        );
    }

    const isCompleted =
        !!minutes;

    return (
        <>
            <Toast ref={toast} />

            <div className="grid">

                {/* CABEÇALHO */}
                <div className="col-12">

                    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                        <div>
                            <div className="flex align-items-center gap-2 mb-2">

                                <Button
                                    icon="pi pi-arrow-left"
                                    text
                                    rounded
                                    onClick={() =>
                                        router.push(
                                            '/pages/minutes'
                                        )
                                    }
                                />

                                <h3 className="text-900 font-semibold m-0">
                                    {isCompleted
                                        ? 'Consulta da Acta de Defesa'
                                        : 'Elaboração da Acta de Defesa'}
                                </h3>

                            </div>

                            <p className="text-600 mt-2 mb-0">
                                {isCompleted
                                    ? 'Acta de Defesa Pública já lavrada.'
                                    : 'Consolidação das avaliações individuais do júri.'}
                            </p>
                        </div>

                        <Tag
                            value={
                                isCompleted
                                    ? 'Acta lavrada'
                                    : 'Em elaboração'
                            }
                            severity={
                                isCompleted
                                    ? 'success'
                                    : 'warning'
                            }
                        />

                    </div>

                </div>

                {/* DADOS DA DEFESA */}
                <div className="col-12">
                    <Card>

                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-calendar text-primary text-xl" />

                            <h5 className="m-0 text-900">
                                Dados da Defesa
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-12 lg:col-8">
                                <label className="block text-600 font-medium mb-2">
                                    Título do Trabalho
                                </label>

                                <InputText
                                    value={
                                        defense.tcc.title
                                    }
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 lg:col-4">
                                <label className="block text-600 font-medium mb-2">
                                    Código / Notebook
                                </label>

                                <InputText
                                    value={
                                        defense.tcc
                                            .notebook_id
                                            ? String(
                                                  defense
                                                      .tcc
                                                      .notebook_id
                                              )
                                            : '-'
                                    }
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-3">
                                <label className="block text-600 font-medium mb-2">
                                    Data
                                </label>

                                <InputText
                                    value={formatDate(
                                        defense.schedule
                                            .date
                                    )}
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-3">
                                <label className="block text-600 font-medium mb-2">
                                    Hora
                                </label>

                                <InputText
                                    value={`${formatTime(
                                        defense.schedule
                                            .start_time
                                    )} - ${formatTime(
                                        defense.schedule
                                            .end_time
                                    )}`}
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-3">
                                <label className="block text-600 font-medium mb-2">
                                    Sala
                                </label>

                                <InputText
                                    value={
                                        defense.room
                                            ?.name || '-'
                                    }
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-3">
                                <label className="block text-600 font-medium mb-2">
                                    Estado
                                </label>

                                <div className="pt-2">
                                    <Tag
                                        value={
                                            defense
                                                .schedule
                                                .status ||
                                            '-'
                                        }
                                        severity={
                                            defense
                                                .schedule
                                                .status ===
                                            'REALIZADO'
                                                ? 'success'
                                                : 'info'
                                        }
                                    />
                                </div>
                            </div>

                        </div>

                    </Card>
                </div>

                {/* ESTUDANTE */}
                <div className="col-12 lg:col-6">
                    <Card className="h-full">

                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-user text-primary text-xl" />

                            <h5 className="m-0 text-900">
                                Dados do Estudante
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-12">
                                <label className="block text-600 font-medium mb-2">
                                    Nome completo
                                </label>

                                <InputText
                                    value={
                                        defense.student
                                            .name
                                    }
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12">
                                <label className="block text-600 font-medium mb-2">
                                    E-mail
                                </label>

                                <InputText
                                    value={
                                        defense.student
                                            .email ||
                                        '-'
                                    }
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                        </div>

                    </Card>
                </div>

                {/* RESUMO */}
                <div className="col-12 lg:col-6">
                    <Card className="h-full">

                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-chart-bar text-primary text-xl" />

                            <h5 className="m-0 text-900">
                                Resultado das Avaliações
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-6">
                                <div className="surface-100 border-round p-3 text-center">
                                    <span className="block text-600 mb-2">
                                        Avaliações
                                    </span>

                                    <span className="text-900 font-bold text-2xl">
                                        {evaluations.length}
                                    </span>
                                </div>
                            </div>

                            <div className="col-6">
                                <div className="surface-100 border-round p-3 text-center">
                                    <span className="block text-600 mb-2">
                                        Média
                                    </span>

                                    <span className="text-primary font-bold text-2xl">
                                        {finalScore !== null
                                            ? `${finalScore.toFixed(
                                                  1
                                              )} valores`
                                            : '-'}
                                    </span>
                                </div>
                            </div>

                        </div>

                        <div className="mt-4 surface-50 border-round p-3">

                            <div className="flex align-items-start gap-2">
                                <i className="pi pi-info-circle text-primary mt-1" />

                                <span className="text-600 line-height-3">
                                    A classificação final apresentada
                                    na acta é calculada pela média
                                    aritmética das notas individuais
                                    submetidas pelos membros do júri.
                                </span>
                            </div>

                        </div>

                    </Card>
                </div>

                {/* JÚRI */}
                <div className="col-12">
                    <Card>

                        <div className="flex align-items-center justify-content-between mb-4">

                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-users text-primary text-xl" />

                                <h5 className="m-0 text-900">
                                    Avaliações Individuais do Júri
                                </h5>
                            </div>

                            <Tag
                                value={`${evaluations.length} avaliação(ões)`}
                                severity="info"
                            />

                        </div>

                        <DataTable
                            value={evaluations}
                            responsiveLayout="scroll"
                            stripedRows
                            showGridlines
                            emptyMessage="Nenhum membro do júri submeteu avaliação."
                        >
                            <Column
                                body={memberTemplate}
                                header="Membro do Júri"
                            />

                            <Column
                                header="Classificação Individual"
                                body={scoreTemplate}
                            />

                            <Column
                                field="considerations"
                                header="Considerações"
                                body={(
                                    rowData: DefenseEvaluation
                                ) => (
                                    <span className="text-600 line-height-3">
                                        {rowData.considerations ||
                                            '-'}
                                    </span>
                                )}
                            />

                            <Column
                                header="Publicação"
                                body={publicationTemplate}
                            />

                        </DataTable>

                        <Divider />

                        <div className="flex justify-content-end">

                            <div
                                className="surface-100 border-round p-4 text-center"
                                style={{
                                    minWidth: '250px'
                                }}
                            >
                                <span className="block text-600 mb-2">
                                    Média das avaliações
                                </span>

                                <span className="text-primary font-bold text-3xl">
                                    {finalScore !== null
                                        ? finalScore.toFixed(
                                              1
                                          )
                                        : '-'}
                                </span>

                                <span className="text-700 ml-2">
                                    valores
                                </span>
                            </div>

                        </div>

                    </Card>
                </div>

                {/* DECISÃO */}
                <div className="col-12 lg:col-6">
                    <Card>

                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-check-circle text-primary text-xl" />

                            <h5 className="m-0 text-900">
                                Decisão da Defesa
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-12">
                                <label className="block text-600 font-medium mb-2">
                                    Resultado
                                </label>

                                <Dropdown
                                    value={
                                        resultado
                                    }
                                    onChange={(e) =>
                                        setResultado(
                                            e.value
                                        )
                                    }
                                    options={
                                        resultados
                                    }
                                    placeholder="Seleccione o resultado"
                                    className="w-full"
                                    disabled={
                                        isCompleted
                                    }
                                />
                            </div>

                            <div className="col-12">
                                <label className="block text-600 font-medium mb-2">
                                    Classificação final
                                </label>

                                <InputText
                                    value={
                                        finalScore !==
                                        null
                                            ? finalScore.toFixed(
                                                  1
                                              )
                                            : ''
                                    }
                                    readOnly
                                    className="w-full"
                                />

                                <small className="text-600">
                                    Calculada automaticamente
                                    pela média das avaliações
                                    individuais.
                                </small>
                            </div>

                        </div>

                    </Card>
                </div>

                {/* OBSERVAÇÕES */}
                <div className="col-12 lg:col-6">
                    <Card>

                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-comment text-primary text-xl" />

                            <h5 className="m-0 text-900">
                                Considerações da Defesa
                            </h5>
                        </div>

                        <InputTextarea
                            value={
                                observacoes
                            }
                            onChange={(e) =>
                                setObservacoes(
                                    e.target.value
                                )
                            }
                            rows={7}
                            className="w-full"
                            readOnly={
                                isCompleted
                            }
                            placeholder="Registe as considerações finais da defesa, recomendações ou observações do júri..."
                        />

                    </Card>
                </div>

                {/* PRÉ-VISUALIZAÇÃO DA ACTA */}
                <div className="col-12">
                    <Card>

                        <div className="flex align-items-center justify-content-between mb-4">

                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-file text-primary text-xl" />

                                <h5 className="m-0 text-900">
                                    Documento da Acta
                                </h5>
                            </div>

                            <Tag
                                value={
                                    isCompleted
                                        ? 'Acta confirmada'
                                        : 'Pré-visualização'
                                }
                                severity={
                                    isCompleted
                                        ? 'success'
                                        : 'info'
                                }
                            />

                        </div>

                        <div className="surface-100 border-round p-5">

                            <div className="text-center">

                                <div className="text-900 font-bold text-xl mb-2">
                                    UNIVERSIDADE ZAMBEZE
                                </div>

                                <div className="text-700 font-medium">
                                    FACULDADE DE CIÊNCIAS E TECNOLOGIA
                                </div>

                                <div className="text-700 mt-1">
                                    DEPARTAMENTO DE ENGENHARIA INFORMÁTICA
                                </div>

                                <Divider />

                                <div className="text-900 font-bold text-lg">
                                    ACTA DE DEFESA PÚBLICA
                                </div>

                            </div>

                            <p className="text-700 line-height-3 mt-4">
                                Aos{' '}
                                <strong>
                                    {defense.schedule.date
                                        ? formatDate(
                                              defense
                                                  .schedule
                                                  .date
                                          )
                                        : '___'}
                                </strong>
                                , realizou-se a defesa pública
                                do Trabalho de Culminação de Curso
                                intitulado{' '}
                                <strong>
                                    "{defense.tcc.title}"
                                </strong>
                                , apresentado pelo estudante{' '}
                                <strong>
                                    {defense.student.name}
                                </strong>
                                .
                            </p>

                            <p className="text-700 line-height-3">
                                Após a apresentação e discussão
                                do trabalho, tendo em consideração
                                as avaliações individuais dos
                                membros do júri, foi determinada
                                a classificação final de:
                            </p>

                            <div className="flex justify-content-center mt-4">

                                <div className="surface-card border-round p-4 text-center shadow-1">

                                    <span className="block text-600 mb-2">
                                        Classificação Final
                                    </span>

                                    <span className="text-primary font-bold text-3xl">
                                        {finalScore !==
                                        null
                                            ? finalScore.toFixed(
                                                  1
                                              )
                                            : '-'}
                                    </span>

                                    <span className="text-700 ml-2">
                                        valores
                                    </span>

                                </div>

                            </div>

                            {resultado && (
                                <p className="text-center text-700 line-height-3 mt-4">
                                    <strong>
                                        Resultado:
                                    </strong>{' '}
                                    {resultado}
                                </p>
                            )}

                            {observacoes && (
                                <div className="mt-4">
                                    <strong className="text-900">
                                        Considerações:
                                    </strong>

                                    <p className="text-700 line-height-3">
                                        {observacoes}
                                    </p>
                                </div>
                            )}

                        </div>

                    </Card>
                </div>

                {/* AÇÕES */}
                <div className="col-12">
                    <Card>

                        <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">

                            <div>
                                <span className="text-600">
                                    {isCompleted
                                        ? 'Esta acta já foi lavrada e confirmada.'
                                        : 'Confirme a acta depois de verificar as avaliações e a classificação final.'}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">

                                <Button
                                    label="Voltar"
                                    icon="pi pi-arrow-left"
                                    outlined
                                    onClick={() =>
                                        router.push(
                                            '/pages/minutes'
                                        )
                                    }
                                />

                                {isCompleted ? (
                                    <>
                                        {minutes?.pdf_url && (
                                            <Button
                                                label="Ver PDF"
                                                icon="pi pi-file-pdf"
                                                severity="danger"
                                                outlined
                                                onClick={() =>
                                                    window.open(
                                                        minutes.pdf_url!,
                                                        '_blank'
                                                    )
                                                }
                                            />
                                        )}

                                        {minutes?.docx_url && (
                                            <Button
                                                label="Ver Word"
                                                icon="pi pi-file-word"
                                                severity="info"
                                                outlined
                                                onClick={() =>
                                                    window.open(
                                                        minutes.docx_url!,
                                                        '_blank'
                                                    )
                                                }
                                            />
                                        )}
                                    </>
                                ) : (
                                    <Button
                                        label="Confirmar Acta"
                                        icon="pi pi-check"
                                        loading={saving}
                                        disabled={
                                            !finalScore ||
                                            !resultado ||
                                            evaluations.length ===
                                                0
                                        }
                                        onClick={
                                            handleSave
                                        }
                                    />
                                )}

                            </div>

                        </div>

                    </Card>
                </div>

            </div>
        </>
    );
};

export default DefenseMinutesForm;