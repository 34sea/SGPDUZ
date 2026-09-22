/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { useRouter } from 'next/navigation';


const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));
    const router = useRouter();
    const handleLogout = () => {
        localStorage.removeItem("user-dashboard-SGPD");

        router.push('/');
    };

    // return (
    //     <div className="layout-topbar">
    //         {/* <Link href="/" className="layout-topbar-logo">
    //             <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
    //             <span>SAKAI</span>
    //         </Link> */}

    //         <Link href="/" className="layout-topbar-logo">
    //             {/* <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" /> */}
    //             <span>SGPD</span>
    //         </Link>

    //         <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
    //             <i className="pi pi-bars" />
    //         </button>

    //         <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
    //             <i className="pi pi-ellipsis-v" />
    //         </button>

    //         <div
    //             ref={topbarmenuRef}
    //             className={classNames('layout-topbar-menu', {
    //                 'layout-topbar-menu-mobile-active':
    //                     layoutState.profileSidebarVisible
    //             })}
    //         >
    //             <button
    //                 type="button"
    //                 className="p-link layout-topbar-button"
    //             >
    //                 <i className="pi pi-user"></i>
    //                 <span>Profile</span>
    //             </button>

    //             <button
    //                 type="button"
    //                 className="p-link layout-topbar-button"
    //                 onClick={handleLogout}
    //             >
    //                 <i className="pi pi-sign-out"></i>
    //                 <span>Logout</span>
    //             </button>
    //         </div>
    //     </div>
    // );

return (
    <div className="layout-topbar">

        {/* =========================================
            MARCA
        ========================================= */}

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
        ========================================= */}

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
        ========================================= */}

        <div className="layout-topbar-actions">

            {/* Notificações */}

            <button
                type="button"
                className="p-link layout-topbar-button layout-notification-button"
                aria-label="Notificações"
            >
                <i className="pi pi-bell" />

                <span className="notification-badge">
                    3
                </span>
            </button>


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
                    <span>FD</span>
                </div>


                {/* Informação */}

                <div className="layout-user-info">

                    <span className="layout-user-name">
                        Francisco Domingos
                    </span>

                    <span className="layout-user-email">
                        francisco@uz.ac.mz
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
        ========================================= */}

        <div
            ref={topbarmenuRef}
            className={classNames('layout-topbar-menu', {
                'layout-topbar-menu-mobile-active':
                    layoutState.profileSidebarVisible
            })}
        >

            <div className="layout-mobile-user">

                <div className="layout-user-avatar">
                    <span>MM</span>
                </div>

                <div>
                    <div className="layout-user-name">
                        Martinho Macovere
                    </div>

                    <div className="layout-user-email">
                        martinho@universidade.ac.mz
                    </div>
                </div>

            </div>


            <div className="layout-profile-divider" />


            <button
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
            </button>


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
