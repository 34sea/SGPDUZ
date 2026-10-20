import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { useRouter } from 'next/navigation';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    // Estado para armazenar os dados do utilizador logado
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user-dashboard-SGPD");
        if (storedUser) {
            try {
                const parsedData = JSON.parse(storedUser);
                // Valida se os dados vêm dentro de 'data' (conforme a estrutura do JSON fornecido)
                const userData = parsedData.data || parsedData;
                setUser({
                    name: userData.name || "Utilizador",
                    email: userData.email || ""
                });
            } catch (error) {
                console.error("Erro ao analisar dados do utilizador do localStorage", error);
            }
        }
    }, []);

    // Função para gerar as iniciais do avatar com base no nome (ex: "Administrador do Sistema" -> "AS")
    const getInitials = (name: string) => {
        if (!name) return "US";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const router = useRouter();
    const handleLogout = () => {
        localStorage.removeItem("user-dashboard-SGPD");
        localStorage.removeItem("token-dashboard-SGPD");
        router.push('/');
    };

    const userName = user?.name || "Carregando...";
    const userEmail = user?.email || "";
    const userInitials = getInitials(userName);

    return (
        <div className="layout-topbar">

            {/* =========================================
                MARCA
            ========================================================= */}

            <Link href="/" className="layout-topbar-logo">
                <div className="layout-topbar-logo-icon">
                    <i className="pi pi-book" />
                </div>

                <div className="layout-topbar-brand">
                    <span className="layout-topbar-title">
                        SGPD
                    </span>

                    <span className="layout-topbar-subtitle">
                        Gestão Pedagógica Digital
                    </span>
                </div>
            </Link>


            {/* =========================================
                BOTÃO MENU
            ========================================================= */}

            <button
                ref={menubuttonRef}
                type="button"
                className="p-link layout-menu-button layout-topbar-button"
                onClick={onMenuToggle}
                aria-label="Abrir menu"
            >
                <i className="pi pi-bars" />
            </button>


            {/* =========================================
                ÁREA DIREITA
            ========================================================= */}

            <div className="layout-topbar-actions">

                {/* Notificações */}

                {/* <button
                    type="button"
                    className="p-link layout-topbar-button layout-notification-button"
                    aria-label="Notificações"
                >
                    <i className="pi pi-bell" />

                    <span className="notification-badge">
                        3
                    </span>
                </button> */}


                {/* Separador */}

                <div className="layout-topbar-divider" />


                {/* =====================================
                    UTILIZADOR
                ===================================== */}

                <button
                    type="button"
                    className="p-link layout-user-profile"
                    onClick={showProfileSidebar}
                >

                    {/* Avatar */}

                    <div className="layout-user-avatar">
                        <span>{userInitials}</span>
                    </div>


                    {/* Informação */}

                    <div className="layout-user-info">

                        <span className="layout-user-name">
                            {userName}
                        </span>

                        <span className="layout-user-email">
                            {userEmail}
                        </span>

                    </div>


                    {/* Seta */}

                    <i className="pi pi-chevron-down layout-user-chevron" />

                </button>


                {/* =====================================
                    MENU MOBILE
                ===================================== */}

                <button
                    ref={topbarmenubuttonRef}
                    type="button"
                    className="p-link layout-topbar-menu-button layout-topbar-button"
                    onClick={showProfileSidebar}
                    aria-label="Abrir menu do utilizador"
                >
                    <i className="pi pi-ellipsis-v" />
                </button>

            </div>


            {/* =========================================
                MENU DO UTILIZADOR
            ========================================================= */}

            <div
                ref={topbarmenuRef}
                className={classNames('layout-topbar-menu', {
                    'layout-topbar-menu-mobile-active':
                        layoutState.profileSidebarVisible
                })}
            >

                <div className="layout-mobile-user">

                    <div className="layout-user-avatar">
                        <span>{userInitials}</span>
                    </div>

                    <div>
                        <div className="layout-user-name">
                            {userName}
                        </div>

                        <div className="layout-user-email">
                            {userEmail}
                        </div>
                    </div>

                </div>


                <div className="layout-profile-divider" />


                {/* <button
                    type="button"
                    className="p-link layout-topbar-menu-item"
                >
                    <i className="pi pi-user" />

                    <span>
                        Meu perfil
                    </span>
                </button>


                <button
                    type="button"
                    className="p-link layout-topbar-menu-item"
                >
                    <i className="pi pi-cog" />

                    <span>
                        Definições
                    </span>
                </button> */}


                <button
                    type="button"
                    className="p-link layout-topbar-menu-item logout"
                    onClick={handleLogout}
                >
                    <i className="pi pi-sign-out" />

                    <span>
                        Terminar sessão
                    </span>
                </button>

            </div>

        </div>
    );

});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;