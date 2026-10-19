"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login, LoginData } from "@/app/api/auth/authService";

const COLORS = {
    primary: "#1D4ED8", primaryLight: "#EFF6FF",
    dark: "#0F172A", text: "#334155", muted: "#64748B", light: "#94A3B8",
    border: "#E2E8F0", background: "#F8FAFC", white: "#FFFFFF",
    red: "#DC2626", redLight: "#FEE2E2",
};

export default function Login() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<LoginData>({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await login(form);
            // Armazena a resposta completa no localStorage (token está no nível raiz: result.token)
            localStorage.setItem("token-dashboard-SGPD", JSON.stringify(result));
            localStorage.setItem("user-dashboard-SGPD", JSON.stringify(result));
            router.push("/dash");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Credenciais inválidas. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                width: "100%", height: "100vh", display: "flex",
                alignItems: "center", justifyContent: "center", background: COLORS.background,
            }}
        >
            <div style={{ width: "100%", maxWidth: "440px", padding: "0 1.5rem", boxSizing: "border-box" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: COLORS.primary, color: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l5 5 5-5h5a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: COLORS.dark, letterSpacing: "0.5px" }}>SGPD</div>
                    <div style={{ fontSize: "0.85rem", color: COLORS.muted, marginTop: "4px", lineHeight: 1.5 }}>
                        Sistema de Gestão Pedagógica Digital<br />
                        Departamento de Engenharia Informática<br />
                        Universidade Zambeze
                    </div>
                </div>

                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "2rem", boxSizing: "border-box" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: COLORS.dark, marginBottom: "0.5rem" }}>Aceder ao Sistema</div>
                    <div style={{ fontSize: "0.875rem", color: COLORS.muted, marginBottom: "1.5rem" }}>
                        Insira as suas credenciais para entrar na plataforma pedagógica.
                    </div>

                    {error && (
                        <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1.25rem", border: `1px solid ${COLORS.red}33` }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: COLORS.text, marginBottom: "0.5rem" }}>E-mail / Utilizador</label>
                            <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@sgpduz.local" required style={{ width: "100%", padding: "0.75rem 1rem", fontSize: "0.9rem", border: `1px solid ${COLORS.border}`, borderRadius: "8px", boxSizing: "border-box", outline: "none" }} />
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: COLORS.text }}>Palavra-passe</label>
                                <a href="#" style={{ fontSize: "0.8rem", color: COLORS.primary, textDecoration: "none" }}>Recuperar palavra-passe</a>
                            </div>
                            <input type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required style={{ width: "100%", padding: "0.75rem 1rem", fontSize: "0.9rem", border: `1px solid ${COLORS.border}`, borderRadius: "8px", boxSizing: "border-box", outline: "none" }} />
                        </div>

                        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem", fontWeight: 600, color: COLORS.white, background: loading ? COLORS.muted : COLORS.primary, border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
                            {loading ? "A entrar..." : "Entrar"}
                        </button>
                    </form>

                    <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ fontSize: "0.8rem", color: COLORS.muted }}>Credenciais de demonstração:</div>
                        <div style={{ fontSize: "0.8rem", color: COLORS.primary, fontWeight: 600, background: COLORS.primaryLight, padding: "0.4rem 0.8rem", borderRadius: "6px", border: `1px solid ${COLORS.primary}33` }}>
                            admin@sgpduz.local / admin123
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: COLORS.muted, textAlign: "center" }}>
                    © 2026 Universidade Zambeze - Departamento de Engenharia Informática
                </div>
            </div>
        </div>
    );
}
