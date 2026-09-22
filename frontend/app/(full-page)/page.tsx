
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
import { relative } from 'path';

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

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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
            'linear-gradient(145deg, #f4f6fb 0%, #eef1f8 50%, #e7ebf5 100%)',
        position: 'relative',
        width: '100vw',
        maxWidth: '100vw',
        overflow: 'hidden'
            }}
        >

            {/* Elementos decorativos */}
            <div
                className="absolute"
                style={{
                    width: '350px',
                    height: '350px',
                    borderRadius: '50%',
                    background: 'rgba(46, 46, 118, 0.06)',
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
                    background: 'rgba(46, 46, 118, 0.05)',
                    bottom: '-80px',
                    left: '-70px'
                }}
            />

            {/* Container principal */}
            <div
                className="relative z-1 w-full"
                style={{
                    maxWidth: '1050px',
                    overflow: 'hidden'
                }}
            >

                {/* Marca institucional */}
                <div className="flex align-items-center justify-content-center mb-5">

                    <div
                        className="flex align-items-center justify-content-center mr-3"
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '16px',
                            background: '#2E2E76',
                            boxShadow: '0 8px 20px rgba(46,46,118,.20)'
                        }}
                    >
                        <i
                            className="pi pi-calendar"
                            style={{
                                color: '#ffffff',
                                fontSize: '1.5rem'
                            }}
                        />
                    </div>

                    <div>
                        <div
                            className="font-bold"
                            style={{
                                fontSize: '1.5rem',
                                color: '#202342'
                            }}
                        >
                            SGPD
                        </div>

                        <div
                            className="text-sm"
                            style={{
                                color: '#73778c'
                            }}
                        >
                            Gestão Pedagógica Digital
                        </div>
                    </div>

                </div>


                {/* Card */}
                <div
                    className="surface-card overflow-hidden"
                    style={{
                        borderRadius: '28px',
                        boxShadow:
                            '0 25px 70px rgba(32, 35, 66, 0.12)'
                    }}
                >

                    <div className="grid m-0">

                        {/* =================================================
                            ÁREA VISUAL
                        ================================================== */}
                        <div
                            className="col-12 lg:col-5 hidden lg:flex align-items-center justify-content-center p-6"
                            style={{
                                background: '#2E2E76',
                                minHeight: '560px'
                            }}
                        >

                            <div className="w-full">

                                {/* Ilustração */}
                                <div
                                    className="flex justify-content-center mb-6"
                                >

                                    <div
                                        className="relative"
                                        style={{
                                            width: '230px',
                                            height: '230px'
                                        }}
                                    >

                                        {/* círculo */}
                                        <div
                                            className="absolute"
                                            style={{
                                                width: '230px',
                                                height: '230px',
                                                borderRadius: '50%',
                                                background:
                                                    'rgba(255,255,255,.08)'
                                            }}
                                        />

                                        {/* cartão */}
                                        <div
                                            className="absolute surface-card"
                                            style={{
                                                width: '165px',
                                                height: '180px',
                                                borderRadius: '18px',
                                                top: '25px',
                                                left: '32px',
                                                transform: 'rotate(-4deg)',
                                                boxShadow:
                                                    '0 20px 40px rgba(0,0,0,.18)'
                                            }}
                                        >

                                            {/* topo */}
                                            <div
                                                style={{
                                                    height: '42px',
                                                    background: '#ececf7',
                                                    borderRadius:
                                                        '18px 18px 0 0'
                                                }}
                                            />

                                            <div className="p-3">

                                                <div
                                                    className="mb-3"
                                                    style={{
                                                        width: '70%',
                                                        height: '9px',
                                                        borderRadius: '5px',
                                                        background:
                                                            '#2E2E76'
                                                    }}
                                                />

                                                <div
                                                    className="mb-2"
                                                    style={{
                                                        width: '90%',
                                                        height: '7px',
                                                        borderRadius: '5px',
                                                        background: '#dfe1ea'
                                                    }}
                                                />

                                                <div
                                                    className="mb-4"
                                                    style={{
                                                        width: '75%',
                                                        height: '7px',
                                                        borderRadius: '5px',
                                                        background: '#dfe1ea'
                                                    }}
                                                />

                                                <div className="flex gap-2">

                                                    <div
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '8px',
                                                            background:
                                                                '#ececf7'
                                                        }}
                                                    />

                                                    <div
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '8px',
                                                            background:
                                                                '#ececf7'
                                                        }}
                                                    />

                                                    <div
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '8px',
                                                            background:
                                                                '#2E2E76'
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
                                                background: '#ffffff',
                                                right: '5px',
                                                bottom: '25px',
                                                boxShadow:
                                                    '0 12px 30px rgba(0,0,0,.2)'
                                            }}
                                        >
                                            <i
                                                className="pi pi-check"
                                                style={{
                                                    color: '#2E2E76',
                                                    fontSize: '1.5rem'
                                                }}
                                            />
                                        </div>

                                    </div>

                                </div>


                                <div className="text-center">

                                    <h2
                                        className="font-bold mb-3"
                                        style={{
                                            color: '#ffffff',
                                            fontSize: '1.8rem'
                                        }}
                                    >
                                        Gestão pedagógica
                                        <br />
                                        num só lugar
                                    </h2>

                                    <p
                                        className="line-height-3 m-0"
                                        style={{
                                            color: 'rgba(255,255,255,.72)',
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
                                minHeight: '560px'
                            }}
                        >

                            <form
                                onSubmit={handleLogin}
                                className="w-full"
                                style={{
                                    maxWidth: '390px'
                                }}
                            >

                                {/* Cabeçalho */}
                                <div className="mb-6">

                                    <div
                                        className="font-bold mb-2"
                                        style={{
                                            color: '#202342',
                                            fontSize: '2rem'
                                        }}
                                    >
                                        Bem-vindo 
                                    </div>

                                    <div
                                        style={{
                                            color: '#777b8f',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Aceda ao seu espaço de gestão
                                        pedagógica.
                                    </div>

                                </div>


                                {/* Erro */}
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


                                {/* Email */}
                                <div className="mb-5">

                                    <label
                                        htmlFor="email"
                                        className="block mb-2 font-semibold"
                                        style={{
                                            color: '#30334d'
                                        }}
                                    >
                                        Email institucional
                                    </label>

                                    <span className="p-input-icon-left w-full">

                                        <i
                                            className="pi pi-envelope"
                                            style={{
                                                color: '#8b8fa3'
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
                                                borderRadius: '12px'
                                            }}
                                            autoComplete="username"
                                            required
                                        />

                                    </span>

                                </div>


                                {/* Password */}
                                <div className="mb-3">

                                    <div className="flex justify-content-between align-items-center mb-2">

                                        <label
                                            htmlFor="password"
                                            className="font-semibold"
                                            style={{
                                                color: '#30334d'
                                            }}
                                        >
                                            Senha
                                        </label>

                                        <button
                                            type="button"
                                            className="p-0 border-none bg-transparent cursor-pointer"
                                            style={{
                                                color: '#2E2E76'
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
                                            borderRadius: '12px'
                                        }}
                                        autoComplete="current-password"
                                        required
                                    />

                                </div>


                                {/* Lembrar */}
                                <div className="flex align-items-center mb-5">

                                    <i
                                        className="pi pi-shield mr-2"
                                        style={{
                                            color: '#8b8fa3'
                                        }}
                                    />

                                    <span
                                        className="text-sm"
                                        style={{
                                            color: '#85899b'
                                        }}
                                    >
                                        Acesso protegido e seguro
                                    </span>

                                </div>


                                {/* Botão */}
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
                                        borderRadius: '12px',
                                        background: '#2E2E76',
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}
                                />


                                {/* Rodapé */}
                                <div className="text-center mt-6">

                                    <div
                                        className="text-sm mb-1"
                                        style={{
                                            color: '#8a8d9d'
                                        }}
                                    >
                                        Sistema de Gestão Pedagógica Digital
                                    </div>

                                    <div
                                        className="text-xs"
                                        style={{
                                            color: '#a5a7b4'
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