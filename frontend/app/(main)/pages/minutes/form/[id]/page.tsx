'use client';

import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import { useParams, useRouter } from 'next/navigation';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';

import {
    getEvaluationSheetByJuryMember,
    submitEvaluationSheet
} from '@/app/api/scheduleDefense/evaluationService';
import { getUserFromStorage } from '@/app/api/auth/authService';


// =====================================================
// TYPES
// =====================================================

interface Criterion {
    id?: number;
    criterion_name: string;
    score: number | null;
}

interface EvaluationSheet {
    id: number;

    jury_member_id: number;

    defense_schedule_id?: number;

    user_id?: number;

    member_name?: string;

    role_in_jury?: string;

    individual_score?: number | null;

    considerations?: string | null;

    publication_recommended?: boolean;

    criteria?: Criterion[];
}


// =====================================================
// CRITERIA
// =====================================================

const DEFAULT_CRITERIA = [
    {
        criterion_name:
            'Relevância e actualidade do tema',
        weight: 15
    },
    {
        criterion_name:
            'Qualidade do enquadramento teórico',
        weight: 15
    },
    {
        criterion_name:
            'Adequação da metodologia',
        weight: 20
    },
    {
        criterion_name:
            'Qualidade dos resultados apresentados',
        weight: 20
    },
    {
        criterion_name:
            'Discussão e interpretação dos resultados',
        weight: 15
    },
    {
        criterion_name:
            'Qualidade da apresentação e organização',
        weight: 15
    }
];


// =====================================================
// COMPONENT
// =====================================================

const EvaluationPage = () => {
    const userData = getUserFromStorage();
    const router = useRouter();

    const params = useParams();

    const toast = useRef<Toast>(null);


    // =================================================
    // ID
    // =================================================

    // const juryMemberId = Number(
    //     params?.juryMemberId
    // );


    const juryMemberId = Number(
        userData?.data?.user?.id
    );


    // =================================================
    // STATE
    // =================================================

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        submitting,
        setSubmitting
    ] = useState(false);

    const [
        sheet,
        setSheet
    ] = useState<EvaluationSheet | null>(null);

    const [
        criteria,
        setCriteria
    ] = useState<Criterion[]>(
        DEFAULT_CRITERIA.map(item => ({
            criterion_name:
                item.criterion_name,
            score: null
        }))
    );

    const [
        considerations,
        setConsiderations
    ] = useState('');

    const [
        publicationRecommended,
        setPublicationRecommended
    ] = useState(false);


    // =================================================
    // LOAD
    // =================================================

    const loadEvaluation = async () => {
        console.log(`juryMemberId: ${juryMemberId}`)

        try {

            setLoading(true);

            if (
                !juryMemberId ||
                Number.isNaN(juryMemberId)
            ) {

                throw new Error(
                    'Membro do júri inválido.'
                );

            }

            const data =
                await getEvaluationSheetByJuryMember(
                    juryMemberId
                );

            setSheet(data);

            const existingCriteria = data?.criteria ?? [];

            setCriteria(
                DEFAULT_CRITERIA.map(
                    defaultCriterion => {

                        const existing =
                            existingCriteria.find(
                                criterion =>
                                    criterion.criterion_name ===
                                    defaultCriterion.criterion_name
                            );

                        return {
                            id: existing?.id,

                            criterion_name:
                                defaultCriterion.criterion_name,

                            score:
                                existing?.score ?? null
                        };
                    }
                )
            );

            setConsiderations(
                data?.considerations || ''
            );

            setPublicationRecommended(
                !!data?.publication_recommended
            );

        } catch (error: any) {

            /*
             * 404 significa que a ficha ainda não foi
             * submetida. Nesse caso a página continua
             * em modo de preenchimento.
             */

            if (
                error?.response?.status === 404
            ) {

                setSheet(null);

                return;

            }

            console.error(
                'Erro ao carregar avaliação:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Não foi possível carregar a avaliação.',
                life: 5000
            });

        } finally {

            setLoading(false);

        }
    };


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {
        console.log(userData?.data?.user)
        loadEvaluation();

    }, [juryMemberId]);


    // =================================================
    // CHANGE SCORE
    // =================================================

    const updateCriterionScore = (
        index: number,
        score: number | null
    ) => {

        setCriteria(
            previous =>
                previous.map(
                    (criterion, criterionIndex) =>
                        criterionIndex === index
                            ? {
                                ...criterion,
                                score
                            }
                            : criterion
                )
        );

    };


    // =================================================
    // CALCULATE SCORE
    // =================================================

    const calculateIndividualScore = () => {

        const validCriteria =
            criteria.filter(
                criterion =>
                    criterion.score !== null &&
                    criterion.score !== undefined
            );

        if (
            validCriteria.length === 0
        ) {
            return 0;
        }

        let total = 0;

        criteria.forEach(
            (criterion, index) => {

                const score =
                    criterion.score;

                if (
                    score === null ||
                    score === undefined
                ) {
                    return;
                }

                const weight =
                    DEFAULT_CRITERIA[index].weight;

                total +=
                    (score * weight) / 100;

            }
        );

        return Number(
            total.toFixed(2)
        );
    };


    const individualScore =
        sheet?.individual_score ??
        calculateIndividualScore();


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async () => {

        try {

            /*
             * Verificar se todos os critérios
             * foram preenchidos.
             */

            const incomplete =
                criteria.some(
                    criterion =>
                        criterion.score === null ||
                        criterion.score === undefined
                );

            if (incomplete) {

                toast.current?.show({
                    severity: 'warn',
                    summary: 'Avaliação incompleta',
                    detail:
                        'Preencha a nota de todos os critérios.',
                    life: 4000
                });

                return;
            }


            /*
             * Confirmar nota individual
             */

            const finalScore =
                calculateIndividualScore();


            if (
                finalScore < 0 ||
                finalScore > 20
            ) {

                toast.current?.show({
                    severity: 'error',
                    summary: 'Nota inválida',
                    detail:
                        'A nota individual deve estar entre 0 e 20.',
                    life: 4000
                });

                return;
            }


            setSubmitting(true);


            await submitEvaluationSheet({

                jury_member_id:
                    juryMemberId,

                individual_score:
                    finalScore,

                considerations:
                    considerations.trim() ||
                    null,

                publication_recommended:
                    publicationRecommended,

                criteria:
                    criteria.map(
                        criterion => ({
                            criterion_name:
                                criterion.criterion_name,

                            score:
                                criterion.score as number
                        })
                    )
            });


            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail:
                    'A sua avaliação foi submetida com sucesso.',
                life: 4000
            });


            /*
             * Recarregar a ficha.
             */

            await loadEvaluation();

        } catch (error: any) {

            console.error(
                'Erro ao submeter avaliação:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Não foi possível submeter a avaliação.',
                life: 5000
            });

        } finally {

            setSubmitting(false);

        }
    };


    // =================================================
    // ROLE
    // =================================================

    const getRoleLabel = (
        role?: string
    ) => {

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


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <div
                className="
                    flex
                    justify-content-center
                    align-items-center
                    p-5
                "
                style={{
                    minHeight: '400px'
                }}
            >

                <ProgressSpinner />

            </div>

        );

    }


    // =================================================
    // RENDER
    // =================================================

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
                            Avaliação Individual do TCC
                        </h3>

                        <p
                            className="
                                text-600
                                mt-2
                                mb-0
                            "
                        >
                            Avalie individualmente o Trabalho
                            de Culminação de Curso atribuído a si.
                        </p>

                    </div>


                    <Button
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        outlined
                        onClick={() =>
                            router.push(
                                '/pages/minutes/form'
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="grid">


                        {/* TCC */}

                        <div className="col-12 md:col-8">

                            <span
                                className="
                                    block
                                    text-600
                                    text-sm
                                    mb-2
                                "
                            >
                                Trabalho
                            </span>

                            <h4
                                className="
                                    text-900
                                    m-0
                                    line-height-3
                                "
                            >
                                {sheet?.member_name
                                    ? `Avaliação de ${sheet.member_name}`
                                    : 'Trabalho de Culminação de Curso'}
                            </h4>

                        </div>


                        {/* ROLE */}

                        {/* <div className="col-12 md:col-4">

                            <span
                                className="
                                    block
                                    text-600
                                    text-sm
                                    mb-2
                                "
                            >
                                Minha função na banca
                            </span>

                            <Tag
                                value={getRoleLabel(
                                    sheet?.role_in_jury
                                )}
                            />

                        </div> */}

                    </div>

                </Card>

            </div>


            {/* =================================================
                CRITERIA
            ================================================= */}

            <div className="col-12">

                <Card>

                    <div
                        className="
                            flex
                            justify-content-between
                            align-items-center
                            flex-wrap
                            gap-2
                        "
                    >

                        <div>

                            <h4 className="text-900 m-0">
                                Critérios de Avaliação
                            </h4>

                            <p className="text-600 mt-2 mb-0">
                                Atribua uma nota de 0 a 20
                                para cada critério.
                            </p>

                        </div>


                        {sheet && (

                            <Tag
                                value="Avaliação submetida"
                                severity="success"
                                icon="pi pi-check"
                            />

                        )}

                    </div>


                    <Divider />


                    <div className="grid">

                        {/* HEADER */}

                        <div
                            className="
                                col-12
                                hidden
                                md:block
                            "
                        >

                            <div
                                className="
                                    grid
                                    surface-100
                                    border-round
                                    p-3
                                    font-semibold
                                "
                            >

                                <div className="col-6">
                                    Critério
                                </div>

                                <div className="col-2">
                                    Peso
                                </div>

                                <div className="col-4">
                                    Nota
                                </div>

                            </div>

                        </div>


                        {criteria.map(
                            (criterion, index) => (

                                <div
                                    key={
                                        criterion.criterion_name
                                    }
                                    className="
                                        col-12
                                        border-bottom-1
                                        surface-border
                                        pb-3
                                        mb-2
                                    "
                                >

                                    <div className="grid align-items-center">

                                        {/* CRITERION */}

                                        <div className="col-12 md:col-6">

                                            <div
                                                className="
                                                    font-semibold
                                                    text-900
                                                "
                                            >
                                                {index + 1}.
                                                {' '}
                                                {
                                                    criterion.criterion_name
                                                }
                                            </div>

                                        </div>


                                        {/* WEIGHT */}

                                        <div className="col-6 md:col-2">

                                            <span
                                                className="
                                                    text-600
                                                "
                                            >
                                                Peso
                                            </span>

                                            <div
                                                className="
                                                    font-semibold
                                                    mt-1
                                                "
                                            >
                                                {
                                                    DEFAULT_CRITERIA[
                                                        index
                                                    ].weight
                                                }%
                                            </div>

                                        </div>


                                        {/* SCORE */}

                                        <div className="col-6 md:col-4">

                                            <span
                                                className="
                                                    text-600
                                                    md:hidden
                                                "
                                            >
                                                Nota
                                            </span>

                                            <InputNumber
                                                value={
                                                    criterion.score
                                                }
                                                onValueChange={(e) =>
                                                    updateCriterionScore(
                                                        index,
                                                        e.value ?? null
                                                    )
                                                }
                                                min={0}
                                                max={20}
                                                minFractionDigits={0}
                                                maxFractionDigits={2}
                                                disabled={!!sheet}
                                                className="w-full mt-1"
                                                inputClassName="w-full"
                                                placeholder="0 - 20"
                                            />

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>


                    {/* =================================================
                        INDIVIDUAL SCORE
                    ================================================= */}

                    <div
                        className="
                            surface-100
                            border-round
                            p-4
                            mt-3
                        "
                    >

                        <div
                            className="
                                flex
                                justify-content-between
                                align-items-center
                                flex-wrap
                                gap-3
                            "
                        >

                            <div>

                                <span
                                    className="
                                        block
                                        text-600
                                        text-sm
                                    "
                                >
                                    Minha nota individual
                                </span>

                                <span
                                    className="
                                        text-900
                                        text-3xl
                                        font-bold
                                    "
                                >
                                    {Number(
                                        individualScore
                                    ).toFixed(2)}
                                    /20
                                </span>

                            </div>


                            <i
                                className="
                                    pi
                                    pi-star
                                    text-primary
                                    text-3xl
                                "
                            />

                        </div>

                    </div>

                </Card>

            </div>


            {/* =================================================
                CONSIDERATIONS
            ================================================= */}

            <div className="col-12">

                <Card>

                    <h4 className="text-900 mt-0">
                        Considerações
                    </h4>

                    <p className="text-600">
                        Registe observações ou comentários
                        relacionados com a sua avaliação.
                    </p>

                    <InputTextarea
                        value={considerations}
                        onChange={
                            e =>
                                setConsiderations(
                                    e.target.value
                                )
                        }
                        rows={6}
                        autoResize
                        disabled={!!sheet}
                        className="w-full"
                        placeholder="Digite as suas considerações..."
                    />

                </Card>

            </div>


            {/* =================================================
                PUBLICATION
            ================================================= */}

            <div className="col-12">

                <Card>

                    <div
                        className="
                            flex
                            align-items-center
                            gap-2
                        "
                    >

                        <Checkbox
                            inputId="publication"
                            checked={
                                publicationRecommended
                            }
                            onChange={
                                e =>
                                    setPublicationRecommended(
                                        e.checked ?? false
                                    )
                            }
                            disabled={!!sheet}
                        />

                        <label
                            htmlFor="publication"
                            className="text-900"
                        >
                            Recomendo a publicação deste trabalho.
                        </label>

                    </div>

                </Card>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="col-12">

                <div
                    className="
                        flex
                        flex-column
                        md:flex-row
                        justify-content-end
                        gap-2
                    "
                >

                    <Button
                        label="Cancelar"
                        icon="pi pi-times"
                        outlined
                        severity="secondary"
                        onClick={() =>
                            router.push(
                                '/pages/evaluations'
                            )
                        }
                    />


                    {!sheet && (

                        <Button
                            label="Submeter avaliação"
                            icon="pi pi-check"
                            loading={submitting}
                            onClick={handleSubmit}
                        />

                    )}

                </div>

            </div>

        </div>

    );

};

export default EvaluationPage;