    'use client';

    import React, {
        useEffect,
        useRef,
        useState
    } from 'react';

    import { useRouter } from 'next/navigation';

    import { Button } from 'primereact/button';
    import { Card } from 'primereact/card';
    import { Tag } from 'primereact/tag';
    import { InputText } from 'primereact/inputtext';
    import { Toast } from 'primereact/toast';
    import { ProgressSpinner } from 'primereact/progressspinner';

    import {
        getMyAssignedDefenses,
        MyAssignedDefense
    } from '@/app/api/scheduleDefense/evaluationService';


    // =====================================================
    // COMPONENT
    // =====================================================

    const EvaluatorDefenses = () => {

        const router = useRouter();

        const toast = useRef<Toast>(null);

        const [
            defenses,
            setDefenses
        ] = useState<MyAssignedDefense[]>([]);

        const [
            loading,
            setLoading
        ] = useState(false);

        const [
            search,
            setSearch
        ] = useState('');


        // =====================================================
        // LOAD DEFENSES
        // =====================================================

        const loadDefenses = async () => {

            try {

                setLoading(true);

                const data =
                    await getMyAssignedDefenses();

                setDefenses(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error: any) {

                console.error(
                    'Erro ao carregar defesas:',
                    error
                );

                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail:
                        error?.response?.data?.message ||
                        error?.message ||
                        'Não foi possível carregar os TCCs atribuídos.',
                    life: 5000
                });

            } finally {

                setLoading(false);

            }
        };


        // =====================================================
        // INITIAL LOAD
        // =====================================================

        useEffect(() => {

            loadDefenses();

        }, []);


        // =====================================================
        // SEARCH
        // =====================================================

        const filteredDefenses =
            defenses.filter(
                (defense) => {

                    const value =
                        search
                            .toLowerCase()
                            .trim();

                    if (!value) {
                        return true;
                    }

                    return (

                        defense.tcc?.title
                            ?.toLowerCase()
                            .includes(value) ||

                        defense.student?.name
                            ?.toLowerCase()
                            .includes(value) ||

                        defense.student?.email
                            ?.toLowerCase()
                            .includes(value)

                    );

                }
            );


        // =====================================================
        // ROLE LABEL
        // =====================================================

        const getRoleLabel =
            (role?: string) => {

                switch (role) {

                    case 'PRESIDENTE':
                        return 'Presidente';

                    case 'ORIENTADOR':
                        return 'Orientador';

                    case 'OPONENTE':
                        return 'Oponente';

                    case 'VOGAL':
                        return 'Vogal';

                    default:
                        return role || '-';

                }

            };


        // =====================================================
        // ROLE SEVERITY
        // =====================================================

        const getRoleSeverity =
            (
                role?: string
            ) => {

                switch (role) {

                    case 'PRESIDENTE':
                        return 'danger';

                    case 'ORIENTADOR':
                        return 'info';

                    case 'OPONENTE':
                        return 'warning';

                    case 'VOGAL':
                        return 'success';

                    default:
                        return 'secondary';

                }

            };


        // =====================================================
        // EVALUATION STATUS
        // =====================================================

        const evaluationStatusTemplate =
            (
                defense: MyAssignedDefense
            ) => {

                if (defense.evaluation) {

                    return (
                        <Tag
                            value="Avaliado"
                            severity="success"
                            icon="pi pi-check"
                        />
                    );

                }

                return (
                    <Tag
                        value="Pendente"
                        severity="warning"
                        icon="pi pi-clock"
                    />
                );

            };


        // =====================================================
        // INDIVIDUAL SCORE
        // =====================================================

        const individualScoreTemplate =
            (
                defense: MyAssignedDefense
            ) => {

                if (!defense.evaluation) {

                    return (
                        <span className="text-500">
                            -
                        </span>
                    );

                }

                return (
                    <span
                        className="
                            font-semibold
                            text-primary
                        "
                    >
                        {Number(
                            defense.evaluation.individual_score
                        ).toFixed(2)}
                    </span>
                );

            };


        // =====================================================
        // DATE
        // =====================================================

        const formatDate =
            (date?: string) => {

                if (!date) {
                    return '-';
                }

                const [
                    year,
                    month,
                    day
                ] =
                    date
                        .split('T')[0]
                        .split('-');

                if (
                    !year ||
                    !month ||
                    !day
                ) {
                    return date;
                }

                return `${day}/${month}/${year}`;

            };


        // =====================================================
        // TIME
        // =====================================================

        const formatTime =
            (time?: string) => {

                if (!time) {
                    return '-';
                }

                return time.substring(
                    0,
                    5
                );

            };


        // =====================================================
        // ACTION
        // =====================================================

        const actionTemplate =
            (
                defense: MyAssignedDefense
            ) => {

                const evaluated =
                    !!defense.evaluation;

                return (

                    <Button
                        label={
                            evaluated
                                ? 'Ver avaliação'
                                : 'Avaliar'
                        }
                        icon={
                            evaluated
                                ? 'pi pi-eye'
                                : 'pi pi-pencil'
                        }
                        severity={
                            evaluated
                                ? 'secondary'
                                : undefined
                        }
                        outlined
                        size="small"
                        onClick={() => {

                            router.push(
                                `/pages/minutes/form/${defense.jury_member_id}`
                            );

                        }}
                    />

                );

            };


        // =====================================================
        // STATISTICS
        // =====================================================

        const total =
            defenses.length;

        const evaluated =
            defenses.filter(
                defense =>
                    !!defense.evaluation
            ).length;

        const pending =
            total - evaluated;


        // =====================================================
        // LOADING
        // =====================================================

        if (
            loading &&
            defenses.length === 0
        ) {

            return (

                <div
                    className="
                        flex
                        justify-content-center
                        align-items-center
                        p-5
                    "
                    style={{
                        minHeight: '300px'
                    }}
                >

                    <ProgressSpinner />

                </div>

            );

        }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="col-12">

                <div
                    className="
                        flex
                        flex-column
                        md:flex-row
                        md:justify-content-between
                        md:align-items-center
                        gap-3
                    "
                >

                    <div>

                        <h3
                            className="
                                text-900
                                font-semibold
                                m-0
                            "
                        >
                            Meus TCCs para Avaliar
                        </h3>

                        <p
                            className="
                                text-600
                                mt-2
                                mb-0
                            "
                        >
                            Trabalhos de Culminação de Curso
                            atribuídos para sua avaliação individual.
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


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="col-12">

                <div className="grid">


                    {/* TOTAL */}

                    <div className="col-12 md:col-4">

                        <Card>

                            <div
                                className="
                                    flex
                                    justify-content-between
                                    align-items-center
                                "
                            >

                                <div>

                                    <span
                                        className="
                                            block
                                            text-600
                                            mb-2
                                        "
                                    >
                                        TCCs atribuídos
                                    </span>

                                    <span
                                        className="
                                            text-900
                                            text-3xl
                                            font-semibold
                                        "
                                    >
                                        {total}
                                    </span>

                                </div>

                                <i
                                    className="
                                        pi
                                        pi-book
                                        text-primary
                                        text-2xl
                                    "
                                />

                            </div>

                        </Card>

                    </div>


                    {/* PENDING */}

                    <div className="col-12 md:col-4">

                        <Card>

                            <div
                                className="
                                    flex
                                    justify-content-between
                                    align-items-center
                                "
                            >

                                <div>

                                    <span
                                        className="
                                            block
                                            text-600
                                            mb-2
                                        "
                                    >
                                        Pendentes
                                    </span>

                                    <span
                                        className="
                                            text-900
                                            text-3xl
                                            font-semibold
                                        "
                                    >
                                        {pending}
                                    </span>

                                </div>

                                <i
                                    className="
                                        pi
                                        pi-clock
                                        text-orange-500
                                        text-2xl
                                    "
                                />

                            </div>

                        </Card>

                    </div>


                    {/* EVALUATED */}

                    <div className="col-12 md:col-4">

                        <Card>

                            <div
                                className="
                                    flex
                                    justify-content-between
                                    align-items-center
                                "
                            >

                                <div>

                                    <span
                                        className="
                                            block
                                            text-600
                                            mb-2
                                        "
                                    >
                                        Avaliados
                                    </span>

                                    <span
                                        className="
                                            text-900
                                            text-3xl
                                            font-semibold
                                        "
                                    >
                                        {evaluated}
                                    </span>

                                </div>

                                <i
                                    className="
                                        pi
                                        pi-check-circle
                                        text-green-500
                                        text-2xl
                                    "
                                />

                            </div>

                        </Card>

                    </div>

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="col-12">

                <Card>

                    {/* SEARCH */}

                    <div
                        className="
                            flex
                            flex-column
                            md:flex-row
                            gap-3
                            mb-4
                        "
                    >

                        <span
                            className="
                                p-input-icon-left
                                flex-1
                            "
                        >

                            <i className="pi pi-search" />

                            <InputText
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Pesquisar por estudante ou título do TCC..."
                                className="w-full"
                            />

                        </span>

                    </div>


                    {/* =================================================
                        DESKTOP
                    ================================================= */}

                    <div className="hidden md:block">

                        <div
                            className="
                                border-1
                                surface-border
                                border-round
                                overflow-hidden
                            "
                        >

                            {/* HEADER */}

                            <div
                                className="
                                    grid
                                    m-0
                                    p-3
                                    surface-100
                                    font-semibold
                                "
                            >

                                <div className="col-1">
                                    #
                                </div>

                                <div className="col-3">
                                    TCC
                                </div>

                                <div className="col-2">
                                    Estudante
                                </div>

                                <div className="col-2">
                                    Defesa
                                </div>

                                <div className="col-1">
                                    Função
                                </div>

                                <div className="col-1">
                                    Avaliação
                                </div>

                                <div className="col-1">
                                    Nota
                                </div>

                                <div className="col-1">
                                    Acção
                                </div>

                            </div>


                            {/* ROWS */}

                            {filteredDefenses.map(
                                defense => (

                                    <div
                                        key={
                                            defense.jury_member_id
                                        }
                                        className="
                                            grid
                                            m-0
                                            p-3
                                            align-items-center
                                            border-top-1
                                            surface-border
                                        "
                                    >

                                        {/* ID */}

                                        <div className="col-1">

                                            <span
                                                className="
                                                    text-600
                                                    font-medium
                                                "
                                            >
                                                {defense.jury_member_id}
                                            </span>

                                        </div>


                                        {/* TCC */}

                                        <div className="col-3">

                                            <div
                                                className="
                                                    font-semibold
                                                    text-900
                                                    line-height-3
                                                "
                                            >
                                                {
                                                    defense.tcc?.title ||
                                                    'Sem título'
                                                }
                                            </div>

                                            <small className="text-500">
                                                Caderno #
                                                {
                                                    defense.tcc?.notebook_id ??
                                                    '-'
                                                }
                                            </small>

                                        </div>


                                        {/* STUDENT */}

                                        <div className="col-2">

                                            <div
                                                className="
                                                    font-medium
                                                    text-900
                                                "
                                            >
                                                {
                                                    defense.student?.name ||
                                                    '-'
                                                }
                                            </div>

                                            <div
                                                className="
                                                    text-sm
                                                    text-600
                                                "
                                            >
                                                {
                                                    defense.student?.email ||
                                                    '-'
                                                }
                                            </div>

                                        </div>


                                        {/* DEFENSE */}

                                        <div className="col-2">

                                            <div
                                                className="
                                                    font-medium
                                                    text-900
                                                "
                                            >
                                                {
                                                    formatDate(
                                                        defense.schedule?.date
                                                    )
                                                }
                                            </div>

                                            <div
                                                className="
                                                    text-sm
                                                    text-600
                                                "
                                            >

                                                {
                                                    formatTime(
                                                        defense.schedule?.start_time
                                                    )
                                                }

                                                {' - '}

                                                {
                                                    formatTime(
                                                        defense.schedule?.end_time
                                                    )
                                                }

                                            </div>

                                            <small
                                                className="
                                                    text-500
                                                    block
                                                    mt-1
                                                "
                                            >
                                                {
                                                    defense.room?.name ||
                                                    '-'
                                                }
                                            </small>

                                        </div>


                                        {/* ROLE */}

                                        <div className="col-1">

                                            <Tag
                                                value={
                                                    getRoleLabel(
                                                        defense.role_in_jury
                                                    )
                                                }
                                                // severity={
                                                //     getRoleSeverity(
                                                //         defense.role_in_jury
                                                //     )
                                                // }
                                            />

                                        </div>


                                        {/* EVALUATION */}

                                        <div className="col-1">

                                            {
                                                evaluationStatusTemplate(
                                                    defense
                                                )
                                            }

                                        </div>


                                        {/* SCORE */}

                                        <div className="col-1">

                                            {
                                                individualScoreTemplate(
                                                    defense
                                                )
                                            }

                                        </div>


                                        {/* ACTION */}

                                        <div className="col-1">

                                            {
                                                actionTemplate(
                                                    defense
                                                )
                                            }

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>


                    {/* =================================================
                        MOBILE
                    ================================================= */}

                    <div className="md:hidden">

                        {filteredDefenses.map(
                            defense => (

                                <div
                                    key={
                                        defense.jury_member_id
                                    }
                                    className="
                                        surface-card
                                        border-1
                                        surface-border
                                        border-round-lg
                                        p-3
                                        mb-3
                                    "
                                >

                                    {/* TOP */}

                                    <div
                                        className="
                                            flex
                                            justify-content-between
                                            align-items-start
                                            gap-2
                                            mb-3
                                        "
                                    >

                                        <div>

                                            <div
                                                className="
                                                    text-xs
                                                    text-600
                                                    mb-1
                                                "
                                            >
                                                ESTUDANTE
                                            </div>

                                            <div
                                                className="
                                                    font-bold
                                                    text-900
                                                "
                                            >
                                                {
                                                    defense.student?.name ||
                                                    '-'
                                                }
                                            </div>

                                            <div
                                                className="
                                                    text-sm
                                                    text-600
                                                    mt-1
                                                "
                                            >
                                                {
                                                    defense.student?.email ||
                                                    '-'
                                                }
                                            </div>

                                        </div>

                                        {
                                            evaluationStatusTemplate(
                                                defense
                                            )
                                        }

                                    </div>


                                    {/* TCC */}

                                    <div
                                        className="
                                            text-xs
                                            text-600
                                            mb-1
                                        "
                                    >
                                        TCC
                                    </div>

                                    <div
                                        className="
                                            font-semibold
                                            text-900
                                            line-height-3
                                            mb-3
                                        "
                                    >
                                        {
                                            defense.tcc?.title ||
                                            'Sem título'
                                        }
                                    </div>


                                    {/* INFORMATION */}

                                    <div className="grid">


                                        {/* DATE */}

                                        <div className="col-6">

                                            <div className="text-sm text-600">
                                                Data
                                            </div>

                                            <div className="font-medium mt-1">

                                                {
                                                    formatDate(
                                                        defense.schedule?.date
                                                    )
                                                }

                                            </div>

                                        </div>


                                        {/* TIME */}

                                        <div className="col-6">

                                            <div className="text-sm text-600">
                                                Horário
                                            </div>

                                            <div className="font-medium mt-1">

                                                {
                                                    formatTime(
                                                        defense.schedule?.start_time
                                                    )
                                                }

                                                {' - '}

                                                {
                                                    formatTime(
                                                        defense.schedule?.end_time
                                                    )
                                                }

                                            </div>

                                        </div>


                                        {/* ROOM */}

                                        <div className="col-6">

                                            <div className="text-sm text-600">
                                                Sala
                                            </div>

                                            <div className="font-medium mt-1">

                                                {
                                                    defense.room?.name ||
                                                    '-'
                                                }

                                            </div>

                                        </div>


                                        {/* ROLE */}

                                        <div className="col-6">

                                            <div className="text-sm text-600">
                                                Minha função
                                            </div>

                                            <div className="mt-1">

                                                <Tag
                                                    value={
                                                        getRoleLabel(
                                                            defense.role_in_jury
                                                        )
                                                    }
                                                    // severity={
                                                    //     getRoleSeverity(
                                                    //         defense.role_in_jury
                                                    //     )
                                                    // }
                                                />

                                            </div>

                                        </div>


                                        {/* INDIVIDUAL SCORE */}

                                        <div className="col-12">

                                            <div className="text-sm text-600">
                                                Minha nota individual
                                            </div>

                                            <div className="font-semibold text-primary mt-1">

                                                {
                                                    defense.evaluation
                                                        ? Number(
                                                            defense.evaluation.individual_score
                                                        ).toFixed(2)
                                                        : 'Ainda não avaliado'
                                                }

                                            </div>

                                        </div>

                                    </div>


                                    {/* ACTION */}

                                    <Button
                                        label={
                                            defense.evaluation
                                                ? 'Ver avaliação'
                                                : 'Avaliar TCC'
                                        }
                                        icon={
                                            defense.evaluation
                                                ? 'pi pi-eye'
                                                : 'pi pi-pencil'
                                        }
                                        severity={
                                            defense.evaluation
                                                ? 'secondary'
                                                : undefined
                                        }
                                        outlined
                                        className="w-full mt-3"
                                        onClick={() =>
                                            router.push(
                                                `/pages/minutes/form/${defense.jury_member_id}`
                                            )
                                        }
                                    />

                                </div>

                            )
                        )}

                    </div>


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {filteredDefenses.length === 0 && (

                        <div
                            className="
                                text-center
                                p-5
                            "
                        >

                            <i
                                className="
                                    pi
                                    pi-book
                                    text-5xl
                                    text-400
                                "
                            />

                            <h3 className="text-900 mt-3">
                                Nenhum TCC atribuído
                            </h3>

                            <p className="text-600 mb-0">
                                Não existem trabalhos de
                                Culminação de Curso atribuídos
                                para sua avaliação.
                            </p>

                        </div>

                    )}

                </Card>

            </div>

        </div>

    );

};

export default EvaluatorDefenses;