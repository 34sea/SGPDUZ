'use client';

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';

import { LayoutContext } from '../../layout/context/layoutcontext';
import { useAuth } from '../hooks/auth/useAuth';

const LoginPage = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const containerClassName = classNames(
        'min-h-screen flex align-items-center justify-content-center p-4 overflow-hidden',
        {
            'p-input-filled': layoutConfig.inputStyle === 'filled'
        }
    );

    const { authenticate, loading, error } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('admin@sgpduz.local');
    const [password, setPassword] = useState('admin123');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (loading) return;

        await authenticate({
            email: username,
            password
        });
    };

    return (
        <div
            className={containerClassName}
            style={{
                background:
                    'linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 50%, #EAF2FF 100%)',
                position: 'relative',
                width: '100vw',
                maxWidth: '100vw',
                overflow: 'hidden'
            }}
        >

            {/* =========================================
                ELEMENTOS DECORATIVOS
            ========================================= */}

            <div
                className="absolute"
                style={{
                    width: '350px',
                    height: '350px',
                    borderRadius: '50%',
                    background: 'rgba(29, 78, 216, 0.055)',
                    top: '-120px',
                    right: '-100px',
                    overflow: 'hidden'
                }}
            />

            <div
                className="absolute"
                style={{
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    background: 'rgba(29, 78, 216, 0.045)',
                    bottom: '-80px',
                    left: '-70px'
                }}
            />


            {/* =========================================
                CONTAINER PRINCIPAL
            ========================================= */}

            <div
                className="relative z-1 w-full"
                style={{
                    maxWidth: '1050px',
                    overflow: 'hidden'
                }}
            >

                {/* =========================================
                    MARCA INSTITUCIONAL
                ========================================= */}

                <div className="flex align-items-center justify-content-center mb-5">

                    <div
                        className="flex align-items-center justify-content-center mr-3"
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: '#1D4ED8',
                            boxShadow:
                                '0 8px 20px rgba(29, 78, 216, 0.20)'
                        }}
                    >
                        <i
                            className="pi pi-book"
                            style={{
                                color: '#FFFFFF',
                                fontSize: '1.45rem'
                            }}
                        />
                    </div>

                    <div>

                        <div
                            className="font-bold"
                            style={{
                                fontSize: '1.5rem',
                                color: '#1E293B',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            SGPD
                        </div>

                        <div
                            className="text-sm"
                            style={{
                                color: '#64748B'
                            }}
                        >
                            Gestão Pedagógica Digital
                        </div>

                    </div>

                </div>


                {/* =========================================
                    CARD PRINCIPAL
                ========================================= */}

                <div
                    className="surface-card overflow-hidden"
                    style={{
                        borderRadius: '24px',
                        border: '1px solid #E2E8F0',
                        boxShadow:
                            '0 25px 70px rgba(15, 23, 42, 0.10)'
                    }}
                >

                    <div className="grid m-0">


                        {/* =================================================
                            ÁREA VISUAL
                        ================================================== */}

                        <div
                            className="col-12 lg:col-5 hidden lg:flex align-items-center justify-content-center p-6"
                            style={{
                                background:
                                    'linear-gradient(145deg, #1E40AF 0%, #1D4ED8 100%)',
                                minHeight: '560px'
                            }}
                        >

                            <div className="w-full">

                                {/* =================================
                                    ILUSTRAÇÃO
                                ================================= */}

                                <div className="flex justify-content-center mb-6">

                                    <div
                                        className="relative"
                                        style={{
                                            width: '230px',
                                            height: '230px'
                                        }}
                                    >

                                        {/* Círculo */}

                                        <div
                                            className="absolute"
                                            style={{
                                                width: '230px',
                                                height: '230px',
                                                borderRadius: '50%',
                                                background:
                                                    'rgba(255,255,255,0.08)'
                                            }}
                                        />


                                        {/* Documento */}

                                        <div
                                            className="absolute"
                                            style={{
                                                width: '165px',
                                                height: '180px',
                                                borderRadius: '18px',
                                                top: '25px',
                                                left: '32px',
                                                transform: 'rotate(-4deg)',
                                                background: '#FFFFFF',
                                                boxShadow:
                                                    '0 20px 40px rgba(0,0,0,0.18)'
                                            }}
                                        >

                                            {/* Cabeçalho */}

                                            <div
                                                style={{
                                                    height: '42px',
                                                    background: '#EFF6FF',
                                                    borderRadius:
                                                        '18px 18px 0 0'
                                                }}
                                            />

                                            <div className="p-3">

                                                {/* Linha principal */}

                                                <div
                                                    className="mb-3"
                                                    style={{
                                                        width: '70%',
                                                        height: '9px',
                                                        borderRadius: '5px',
                                                        background: '#1D4ED8'
                                                    }}
                                                />

                                                {/* Linhas */}

                                                <div
                                                    className="mb-2"
                                                    style={{
                                                        width: '90%',
                                                        height: '7px',
                                                        borderRadius: '5px',
                                                        background: '#E2E8F0'
                                                    }}
                                                />

                                                <div
                                                    className="mb-4"
                                                    style={{
                                                        width: '75%',
                                                        height: '7px',
                                                        borderRadius: '5px',
                                                        background: '#E2E8F0'
                                                    }}
                                                />

                                                {/* Indicadores */}

                                                <div className="flex gap-2">

                                                    <div
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '8px',
                                                            background:
                                                                '#EFF6FF'
                                                        }}
                                                    />

                                                    <div
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '8px',
                                                            background:
                                                                '#EFF6FF'
                                                        }}
                                                    />

                                                    <div
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '8px',
                                                            background:
                                                                '#1D4ED8'
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        </div>


                                        {/* Check */}

                                        <div
                                            className="absolute flex align-items-center justify-content-center"
                                            style={{
                                                width: '58px',
                                                height: '58px',
                                                borderRadius: '18px',
                                                background: '#FFFFFF',
                                                right: '5px',
                                                bottom: '25px',
                                                boxShadow:
                                                    '0 12px 30px rgba(0,0,0,0.20)'
                                            }}
                                        >

                                            <i
                                                className="pi pi-check"
                                                style={{
                                                    color: '#1D4ED8',
                                                    fontSize: '1.5rem'
                                                }}
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* =================================
                                    TEXTO
                                ================================= */}

                                <div className="text-center">

                                    <h2
                                        className="font-bold mb-3"
                                        style={{
                                            color: '#FFFFFF',
                                            fontSize: '1.8rem',
                                            lineHeight: '1.25'
                                        }}
                                    >
                                        Gestão pedagógica
                                        <br />
                                        num só lugar
                                    </h2>

                                    <p
                                        className="line-height-3 m-0"
                                        style={{
                                            color:
                                                'rgba(255,255,255,0.75)',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Organize o plano analítico,
                                                                             acompanhe as aulas, avaliações,
                                                                             pautas e actividades pedagógicas.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            ÁREA DO LOGIN
                        ================================================== */}

                        <div
                            className="col-12 lg:col-7 flex align-items-center justify-content-center p-5 md:p-7"
                            style={{
                                minHeight: '560px',
                                background: '#FFFFFF'
                            }}
                        >

                            <form
                                onSubmit={handleLogin}
                                className="w-full"
                                style={{
                                    maxWidth: '390px'
                                }}
                            >

                                {/* =================================
                                    CABEÇALHO
                                ================================= */}

                                <div className="mb-6">

                                    <div
                                        className="font-bold mb-2"
                                        style={{
                                            color: '#1E293B',
                                            fontSize: '2rem',
                                            letterSpacing: '-0.03em'
                                        }}
                                    >
                                        Bem-vindo
                                    </div>

                                    <div
                                        style={{
                                            color: '#64748B',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Aceda ao seu espaço no SGPD.
                                    </div>

                                </div>


                                {/* =================================
                                    ERRO
                                ================================= */}

                                {error && (
                                    <Message
                                        severity="error"
                                        text={
                                            typeof error === 'string'
                                                ? error
                                                : 'Não foi possível iniciar sessão. Verifique as suas credenciais.'
                                        }
                                        className="w-full mb-5"
                                    />
                                )}


                                {/* =================================
                                    EMAIL
                                ================================= */}

                                <div className="mb-5">

                                    <label
                                        htmlFor="email"
                                        className="block mb-2 font-semibold"
                                        style={{
                                            color: '#334155'
                                        }}
                                    >
                                        Email institucional
                                    </label>

                                    <span className="p-input-icon-left w-full">

                                        <i
                                            className="pi pi-envelope"
                                            style={{
                                                color: '#64748B'
                                            }}
                                        />

                                        <InputText
                                            id="email"
                                            type="email"
                                            value={username}
                                            onChange={(e) =>
                                                setUsername(e.target.value)
                                            }
                                            placeholder="nome@universidade.ac.mz"
                                            className="w-full"
                                            style={{
                                                padding: '1rem',
                                                paddingLeft: '2.8rem',
                                                borderRadius: '10px',
                                                border:
                                                    '1px solid #CBD5E1'
                                            }}
                                            autoComplete="username"
                                            required
                                        />

                                    </span>

                                </div>


                                {/* =================================
                                    PASSWORD
                                ================================= */}

                                <div className="mb-3">

                                    <div className="flex justify-content-between align-items-center mb-2">

                                        <label
                                            htmlFor="password"
                                            className="font-semibold"
                                            style={{
                                                color: '#334155'
                                            }}
                                        >
                                            Senha
                                        </label>

                                        <button
                                            type="button"
                                            className="p-0 border-none bg-transparent cursor-pointer"
                                            style={{
                                                color: '#1D4ED8'
                                            }}
                                            onClick={() =>
                                                router.push(
                                                    '/auth/forgot-password'
                                                )
                                            }
                                        >
                                            Esqueceu a senha?
                                        </button>

                                    </div>

                                    <Password
                                        inputId="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Digite a sua senha"
                                        toggleMask
                                        feedback={false}
                                        className="w-full"
                                        inputClassName="w-full"
                                        style={{
                                            width: '100%'
                                        }}
                                        inputStyle={{
                                            padding: '1rem',
                                            borderRadius: '10px',
                                            border:
                                                '1px solid #CBD5E1'
                                        }}
                                        autoComplete="current-password"
                                        required
                                    />

                                </div>


                                {/* =================================
                                    SEGURANÇA
                                ================================= */}

                                <div className="flex align-items-center mb-5">

                                    <i
                                        className="pi pi-shield mr-2"
                                        style={{
                                            color: '#64748B'
                                        }}
                                    />

                                    <span
                                        className="text-sm"
                                        style={{
                                            color: '#64748B'
                                        }}
                                    >
                                        Acesso protegido e seguro
                                    </span>

                                </div>


                                {/* =================================
                                    BOTÃO
                                ================================= */}

                                <Button
                                    type="submit"
                                    label={
                                        loading
                                            ? 'A entrar...'
                                            : 'Iniciar sessão'
                                    }
                                    icon={
                                        loading
                                            ? 'pi pi-spin pi-spinner'
                                            : 'pi pi-arrow-right'
                                    }
                                    iconPos="right"
                                    disabled={loading}
                                    className="w-full border-none"
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        background: '#1D4ED8',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        boxShadow:
                                            '0 6px 16px rgba(29, 78, 216, 0.18)'
                                    }}
                                />


                                {/* =================================
                                    RODAPÉ
                                ================================= */}

                                <div className="text-center mt-6">

                                    <div
                                        className="text-sm mb-1"
                                        style={{
                                            color: '#64748B'
                                        }}
                                    >
                                        Gestão Pedagógica Digital
                                    </div>

                                    <div
                                        className="text-xs"
                                        style={{
                                            color: '#94A3B8'
                                        }}
                                    >
                                        FCT · Universidade Zambeze
                                    </div>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default LoginPage;
