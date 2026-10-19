"use client";

import React, { useState } from "react";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";

import {
    Sliders, Bell, Link2, ShieldCheck, Building2, Save, Search, Plus, FileText,
} from "lucide-react";

const COLORS = {
    primary: "#1D4ED8", primaryLight: "#EFF6FF",
    green: "#16A34A", greenLight: "#DCFCE7",
    orange: "#D97706", orangeLight: "#FEF3C7",
    purple: "#7C3AED", purpleLight: "#F3E8FF",
    cyan: "#0891B2", cyanLight: "#CFFAFE",
    red: "#DC2626", redLight: "#FEE2E2",
    dark: "#0F172A", text: "#334155", muted: "#64748B", light: "#94A3B8",
    border: "#E2E8F0", background: "#F8FAFC", white: "#FFFFFF",
};

interface SettingItem {
    id: number;
    nome: string;
    descricao: string;
    valor: string;
    tipo: "texto" | "numero" | "booleano" | "selecao";
}

const settings: SettingItem[] = [
    { id: 1, nome: "Nome da instituição", descricao: "Nome exibido nos cabeçalhos e relatórios.", valor: "Universidade Zambeze", tipo: "texto" },
    { id: 2, nome: "Departamento", descricao: "Departamento responsável pelo sistema.", valor: "Engenharia Informática", tipo: "texto" },
    { id: 3, nome: "Prazo de publicação de avaliações (dias)", descricao: "Prazo regulamentar para publicação de resultados.", valor: "7", tipo: "numero" },
    { id: 4, nome: "Notificações por e-mail", descricao: "Enviar notificações através do correio electrónico institucional.", valor: "true", tipo: "booleano" },
    { id: 5, nome: "Integração Microsoft Teams", descricao: "Partilhar documentos e notificações via Microsoft Teams.", valor: "false", tipo: "booleano" },
    { id: 6, nome: "Cabeçalho dos relatórios", descricao: "Texto ou logotipo institucional nos relatórios exportados.", valor: "Logo institucional", tipo: "texto" },
];

export default function Configuracoes() {
    const [activeSection, setActiveSection] = useState<"gerais" | "notificacoes" | "integracao">("gerais");
    const [search, setSearch] = useState("");
    const [editedValue, setEditedValue] = useState<Record<number, string>>({});

    const getSettingValue = (id: number): string => {
        return editedValue[id] !== undefined ? editedValue[id] : settings.find((s) => s.id === id)!.valor;
    };

    const saveSettings = () => {
        alert("Configurações guardadas com sucesso!");
    };

    const toggleSection = (section: "gerais" | "notificacoes" | "integracao") => {
        setActiveSection(section);
    };

    const filteredSettings = settings.filter((s) => {
        const text = search.toLowerCase().trim();
        return !text || s.nome.toLowerCase().includes(text) || s.descricao.toLowerCase().includes(text);
    });

    return (
        <div
            style={{ width: "100%", maxWidth: "none", margin: 0, padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}
        >
            <div className="flex justify-content-between align-items-center" style={{ marginBottom: "1.25rem" }}>
                <div>
                    <div style={{ fontSize: "1.55rem", fontWeight: 700, color: COLORS.dark }}>Configurações</div>
                    <div style={{ fontSize: "0.85rem", color: COLORS.muted, marginTop: "5px" }}>
                        Configure parâmetros gerais, notificações e integrações institucionais do sistema.
                    </div>
                </div>
                <Button label="Guardar alterações" icon={<Save size={16} />} onClick={saveSettings} style={{ background: COLORS.primary, borderColor: COLORS.primary }} />
            </div>

            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "0.5rem", marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
                <SectionBtn active={activeSection === "gerais"} label="Geral" icon={<Sliders size={17} />} onClick={() => toggleSection("gerais")} />
                <SectionBtn active={activeSection === "notificacoes"} label="Notificações" icon={<Bell size={17} />} onClick={() => toggleSection("notificacoes")} />
                <SectionBtn active={activeSection === "integracao"} label="Integrações" icon={<Link2 size={17} />} onClick={() => toggleSection("integracao")} />
            </div>

            {activeSection === "gerais" && (
                <>
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1.5rem" }}>
                        <div style={{ padding: "1.1rem" }}>
                            <div className="flex justify-content-between align-items-start mb-1">
                                <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem" }}>Dados Institucionais</div>
                                <ShieldCheck size={20} color={COLORS.primary} />
                            </div>
                            <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginBottom: "1rem" }}>
                                Defina os dados da instituição utilizados em cabeçalhos e relatórios.
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Nome da instituição</label>
                                    <InputText value={getSettingValue(1)} onChange={(e) => setEditedValue({ ...editedValue, [1]: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Departamento</label>
                                    <InputText value={getSettingValue(2)} onChange={(e) => setEditedValue({ ...editedValue, [2]: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ padding: "1.1rem" }}>
                            <div className="flex justify-content-between align-items-start mb-1">
                                <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem" }}>Regras do Sistema</div>
                                <Building2 size={20} color={COLORS.primary} />
                            </div>
                            <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginBottom: "1rem" }}>
                                Configure as regras pedagógicas e prazos regulamentares.
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>
                                    Prazo de publicação de avaliações (dias)
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <InputText type="number" value={getSettingValue(3)} onChange={(e) => setEditedValue({ ...editedValue, [3]: e.target.value })} style={{ width: "80px" }} />
                                    <span style={{ fontSize: "0.8rem", color: COLORS.muted }}>dias</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}

            {activeSection === "notificacoes" && (
                <>
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1.5rem" }}>
                        <div style={{ padding: "1.1rem" }}>
                            <div className="flex justify-content-between align-items-start mb-1">
                                <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem" }}>Notificações</div>
                                <Bell size={20} color={COLORS.primary} />
                            </div>
                            <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginBottom: "1rem" }}>
                                Configure como as notificações são enviadas aos utilizadores.
                            </div>
                            <SettingRow
                                item={settings[4]}
                                value={getSettingValue(4)}
                                onChange={(v) => setEditedValue({ ...editedValue, [4]: v })}
                            />
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ padding: "1.1rem" }}>
                            <div className="flex justify-content-between align-items-start mb-1">
                                <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem" }}>Preferências</div>
                                <FileText size={20} color={COLORS.primary} />
                            </div>
                            <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginBottom: "1rem" }}>
                                Preferências de exibição e comunicação.
                            </div>
                            <SettingRow
                                item={settings[6]}
                                value={getSettingValue(6)}
                                onChange={(v) => setEditedValue({ ...editedValue, [6]: v })}
                            />
                        </div>
                    </Card>
                </>
            )}

            {activeSection === "integracao" && (
                <>
                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", marginBottom: "1.5rem" }}>
                        <div style={{ padding: "1.1rem" }}>
                            <div className="flex justify-content-between align-items-start mb-1">
                                <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem" }}>Microsoft Teams</div>
                                <Link2 size={20} color={COLORS.primary} />
                            </div>
                            <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginBottom: "1rem" }}>
                                Integre o sistema com o Microsoft Teams para partilha de documentos e notificações.
                            </div>
                            <SettingRow
                                item={settings[5]}
                                value={getSettingValue(5)}
                                onChange={(v) => setEditedValue({ ...editedValue, [5]: v })}
                            />
                            <div style={{ marginTop: "1rem", padding: "1rem", background: COLORS.primaryLight, borderRadius: "8px", border: `1px solid ${COLORS.primary}40` }}>
                                <div style={{ fontSize: "0.78rem", color: COLORS.primary, fontWeight: 600, marginBottom: "0.5rem" }}>Estado da integração: Desactivada</div>
                                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>
                                    Configure as credenciais do Microsoft Teams para activar esta funcionalidade.
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none" }}>
                        <div style={{ padding: "1.1rem" }}>
                            <div className="flex justify-content-between align-items-start mb-1">
                                <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: "1rem" }}>Correio Electrónico Institucional</div>
                                <FileText size={20} color={COLORS.primary} />
                            </div>
                            <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginBottom: "1rem" }}>
                                Envie notificações através do correio electrónico institucional quando configurado.
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Servidor SMTP</label>
                                <InputText placeholder="smtp.institucional.mz" />
                            </div>
                            <div style={{ marginTop: "0.75rem" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: COLORS.muted, marginBottom: "6px" }}>Porta</label>
                                <InputText type="number" placeholder="587" />
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}

const SectionBtn = ({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) => (
    <button
        onClick={onClick}
        style={{
            border: "none", cursor: "pointer", padding: "0.7rem 1rem", borderRadius: "7px",
            background: active ? COLORS.primaryLight : "transparent",
            color: active ? COLORS.primary : COLORS.muted, fontWeight: active ? 600 : 500,
            display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem",
        }}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const SettingRow = ({ item, value, onChange }: { item: SettingItem; value: string; onChange: (v: string) => void }) => {
    const C = { text: "#334155", dark: "#0F172A", muted: "#64748B" };
    return (
        <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: C.muted, marginBottom: "6px" }}>{item.nome}</label>
            <div style={{ fontSize: "0.78rem", color: C.muted, marginBottom: "0.5rem" }}>{item.descricao}</div>
            {item.tipo === "booleano" ? (
                <InputSwitch checked={value === "true"} onChange={(e) => onChange(e.checked ? "true" : "false")} />
            ) : (
                <InputText value={value} onChange={(e) => onChange(e.target.value)} />
            )}
        </div>
    );
};
