// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import { Card } from "primereact/card";
// import { Button } from "primereact/button";
// import { InputText } from "primereact/inputtext";
// import { Dropdown } from "primereact/dropdown";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import { Dialog } from "primereact/dialog";
// import { Toast } from "primereact/toast";
// import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
// import { ProgressSpinner } from "primereact/progressspinner";
// import { Tag } from "primereact/tag";
// import {
//     BookOpen,
//     GraduationCap,
//     Users,
//     Plus,
//     Trash2,
//     RefreshCw,
//     Link2,
// } from "lucide-react";

// import {
//     getDepartments,
//     getCourses,
//     createCourse,
//     deleteCourse,
//     getAcademicYears,
//     getSubjects,
//     createSubject,
//     deleteSubject,
//     getClasses,
//     createClass,
//     deleteClass,
//     getClassSubjectTeachers,
//     assignTeacherToClassSubject,
//     removeTeacherFromClassSubject,
//     getUsers,
// } from "@/app/api/gestaoAcademica/gestaoAcademicService";
// // import { getSubjects } from "@/app/api/pedagogical/PedagogicalManagement";

// const COLORS = {
//     primary: "#1D4ED8",
//     primaryLight: "#EFF6FF",
//     dark: "#0F172A",
//     muted: "#64748B",
//     border: "#E2E8F0",
//     background: "#F8FAFC",
// };

// export default function GestaoAcademica() {
//     const toast = useRef<Toast>(null);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState<"cursos" | "disciplinas" | "turmas" | "atribuicoes">("cursos");

//     // Dados base
//     const [cursos, setCursos] = useState<any[]>([]);
//     const [departamentos, setDepartamentos] = useState<any[]>([]);
//     const [disciplinas, setDisciplinas] = useState<any[]>([]);
//     const [turmas, setTurmas] = useState<any[]>([]);
//     const [anosLectivos, setAnosLectivos] = useState<any[]>([]);
//     const [docentes, setDocentes] = useState<any[]>([]);
//     const [atribuicoes, setAtribuicoes] = useState<any[]>([]);

//     // Modais e Formulários
//     const [cursoDialog, setCursoDialog] = useState(false);
//     const [cursoForm, setCursoForm] = useState({ name: "", code: "", department_id: null });

//     const [disciplinaDialog, setDisciplinaDialog] = useState(false);
//     const [disciplinaForm, setDisciplinaForm] = useState({ name: "", code: "", course_id: null });

//     const [turmaDialog, setTurmaDialog] = useState(false);
//     const [turmaForm, setTurmaForm] = useState({ name: "", course_id: null, academic_year_id: null });

//     const [atribuicaoDialog, setAtribuicaoDialog] = useState(false);
//     const [atribuicaoForm, setAtribuicaoForm] = useState({ class_id: null, subject_id: null, teacher_id: null });

//     const loadAllData = async () => {
//         try {
//             setLoading(true);
//             const [deptRes, cursosRes, discRes, turmasRes, anosRes, usersRes, cstRes] = await Promise.all([
//                 getDepartments().catch(() => []),
//                 getCourses().catch(() => []),
//                 getSubjects().catch(() => []),
//                 getClasses().catch(() => []),
//                 getAcademicYears().catch(() => []),
//                 getUsers().catch(() => []),
//                 getClassSubjectTeachers().catch(() => []),
//             ]);

//             setDepartamentos(deptRes || []);
//             setCursos(cursosRes || []);
//             setDisciplinas(discRes || []);
//             setTurmas(turmasRes || []);
//             setAnosLectivos(anosRes || []);
//             setDocentes(usersRes || []);
//             setAtribuicoes(cstRes || []);
//         } catch (err: any) {
//             toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao carregar dados académicos.", life: 4000 });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadAllData();
//     }, []);

//     const handleSaveCurso = async () => {
//         try {
//             await createCourse(cursoForm);
//             toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Curso criado com sucesso." });
//             setCursoDialog(false);
//             setCursoForm({ name: "", code: "", department_id: null });
//             loadAllData();
//         } catch (err: any) {
//             toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao criar curso." });
//         }
//     };

//     const handleSaveDisciplina = async () => {
//         try {
//             await createSubject(disciplinaForm);
//             toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Disciplina criada com sucesso." });
//             setDisciplinaDialog(false);
//             setDisciplinaForm({ name: "", code: "", course_id: null });
//             loadAllData();
//         } catch (err: any) {
//             toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao criar disciplina." });
//         }
//     };

//     const handleSaveTurma = async () => {
//         try {
//             await createClass(turmaForm);
//             toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Turma criada com sucesso." });
//             setTurmaDialog(false);
//             setTurmaForm({ name: "", course_id: null, academic_year_id: null });
//             loadAllData();
//         } catch (err: any) {
//             toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao criar turma." });
//         }
//     };

//     const handleSaveAtribuicao = async () => {
//         try {
//             await assignTeacherToClassSubject(atribuicaoForm);
//             toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Associação efetuada com sucesso!" });
//             setAtribuicaoDialog(false);
//             setAtribuicaoForm({ class_id: null, subject_id: null, teacher_id: null });
//             loadAllData();
//         } catch (err: any) {
//             toast.current?.show({ severity: "error", summary: "Erro", detail: err.response?.data?.message || "Erro ao associar docente." });
//         }
//     };

//     const handleDeleteCurso = (id: number) => {
//         confirmDialog({
//             message: "Tem a certeza que deseja eliminar este curso?",
//             header: "Confirmação",
//             icon: <Trash2 size={18} />,
//             acceptClassName: "p-button-danger",
//             accept: async () => {
//                 try {
//                     await deleteCourse(id);
//                     toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Curso eliminado." });
//                     loadAllData();
//                 } catch {
//                     toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao eliminar curso." });
//                 }
//             }
//         });
//     };

//     const handleDeleteDisciplina = (id: number) => {
//         confirmDialog({
//             message: "Tem a certeza que deseja eliminar esta disciplina?",
//             header: "Confirmação",
//             icon: <Trash2 size={18} />,
//             acceptClassName: "p-button-danger",
//             accept: async () => {
//                 try {
//                     await deleteSubject(id);
//                     toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Disciplina eliminada." });
//                     loadAllData();
//                 } catch {
//                     toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao eliminar disciplina." });
//                 }
//             }
//         });
//     };

//     const handleDeleteTurma = (id: number) => {
//         confirmDialog({
//             message: "Tem a certeza que deseja eliminar esta turma?",
//             header: "Confirmação",
//             icon: <Trash2 size={18} />,
//             acceptClassName: "p-button-danger",
//             accept: async () => {
//                 try {
//                     await deleteClass(id);
//                     toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Turma eliminada." });
//                     loadAllData();
//                 } catch {
//                     toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao eliminar turma." });
//                 }
//             }
//         });
//     };

//     const handleDeleteAtribuicao = (id: number) => {
//         confirmDialog({
//             message: "Tem a certeza que deseja remover esta atribuição?",
//             header: "Confirmação",
//             icon: <Trash2 size={18} />,
//             acceptClassName: "p-button-danger",
//             accept: async () => {
//                 try {
//                     await removeTeacherFromClassSubject(id);
//                     toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Atribuição removida." });
//                     loadAllData();
//                 } catch {
//                     toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao remover atribuição." });
//                 }
//             }
//         });
//     };

//     if (loading && cursos.length === 0) {
//         return (
//             <div className="flex align-items-center justify-content-center min-h-screen">
//                 <ProgressSpinner />
//             </div>
//         );
//     }

//     return (
//         <div style={{ width: "100%", padding: "1rem 1.25rem 2rem", boxSizing: "border-box", background: COLORS.background, minHeight: "100vh" }}>
//             <Toast ref={toast} />
//             <ConfirmDialog />

//             {/* CABEÇALHO */}
//             <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
//                 <div className="flex align-items-center gap-2">
//                     <div className="flex align-items-center justify-content-center border-round-xl" style={{ width: 44, height: 44, background: COLORS.primaryLight }}>
//                         <GraduationCap size={24} color={COLORS.primary} />
//                     </div>
//                     <div>
//                         <h1 className="m-0" style={{ fontSize: "1.65rem", color: COLORS.dark, fontWeight: 700 }}>Gestão Académica e Atribuições</h1>
//                         <p className="m-0 mt-1" style={{ color: COLORS.muted, fontSize: "0.9rem" }}>Administração de Cursos, Disciplinas, Turmas e Atribuição Docente[cite: 20].</p>
//                     </div>
//                 </div>
//                 <div className="flex gap-2">
//                     <Button label="Atualizar" icon={<RefreshCw size={16} />} outlined severity="secondary" onClick={loadAllData} />
//                     <Button label="Nova Atribuição" icon={<Link2 size={17} />} onClick={() => setAtribuicaoDialog(true)} />
//                 </div>
//             </div>

//             {/* ABAS DE NAVEGAÇÃO */}
//             <div className="flex align-items-center gap-2 mb-4 p-2 border-round-xl bg-white" style={{ border: `1px solid ${COLORS.border}` }}>
//                 <Button label="Cursos" icon={<GraduationCap size={16} />} text={activeTab !== "cursos"} onClick={() => setActiveTab("cursos")} />
//                 <Button label="Disciplinas" icon={<BookOpen size={16} />} text={activeTab !== "disciplinas"} onClick={() => setActiveTab("disciplinas")} />
//                 <Button label="Turmas" icon={<Users size={16} />} text={activeTab !== "turmas"} onClick={() => setActiveTab("turmas")} />
//                 <Button label="Turma + Disciplina + Docente" icon={<Link2 size={16} />} text={activeTab !== "atribuicoes"} onClick={() => setActiveTab("atribuicoes")} />
//             </div>

//             {/* SECÇÃO: CURSOS */}
//             {activeTab === "cursos" && (
//                 <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
//                     <div className="flex justify-content-between align-items-center mb-4">
//                         <h2 className="m-0" style={{ fontSize: "1.15rem", color: COLORS.dark }}>Cursos Registados[cite: 20]</h2>
//                         <Button label="Adicionar Curso" icon={<Plus size={16} />} size="small" onClick={() => setCursoDialog(true)} />
//                     </div>
//                     <DataTable value={cursos} paginator rows={5} responsiveLayout="scroll" emptyMessage="Nenhum curso encontrado." size="small" stripedRows>
//                         <Column field="code" header="Código" style={{ width: "120px" }} />
//                         <Column field="name" header="Nome do Curso" />
//                         <Column field="department_name" header="Departamento" />
//                         <Column header="Ações" body={(row) => (
//                             <Button icon={<Trash2 size={16} />} text rounded severity="danger" onClick={() => handleDeleteCurso(row.id)} />
//                         )} />
//                     </DataTable>
//                 </Card>
//             )}

//             {/* SECÇÃO: DISCIPLINAS */}
//             {activeTab === "disciplinas" && (
//                 <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
//                     <div className="flex justify-content-between align-items-center mb-4">
//                         <h2 className="m-0" style={{ fontSize: "1.15rem", color: COLORS.dark }}>Unidades Curriculares / Disciplinas[cite: 20]</h2>
//                         <Button label="Adicionar Disciplina" icon={<Plus size={16} />} size="small" onClick={() => setDisciplinaDialog(true)} />
//                     </div>
//                     <DataTable value={disciplinas} paginator rows={5} responsiveLayout="scroll" emptyMessage="Nenhuma disciplina encontrada." size="small" stripedRows>
//                         <Column field="code" header="Código" style={{ width: "120px" }} />
//                         <Column field="name" header="Designação" />
//                         <Column field="course_name" header="Curso Associado" />
//                         <Column header="Ações" body={(row) => (
//                             <Button icon={<Trash2 size={16} />} text rounded severity="danger" onClick={() => handleDeleteDisciplina(row.id)} />
//                         )} />
//                     </DataTable>
//                 </Card>
//             )}

//             {/* SECÇÃO: TURMAS */}
//             {activeTab === "turmas" && (
//                 <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
//                     <div className="flex justify-content-between align-items-center mb-4">
//                         <h2 className="m-0" style={{ fontSize: "1.15rem", color: COLORS.dark }}>Turmas[cite: 20]</h2>
//                         <Button label="Adicionar Turma" icon={<Plus size={16} />} size="small" onClick={() => setTurmaDialog(true)} />
//                     </div>
//                     <DataTable value={turmas} paginator rows={5} responsiveLayout="scroll" emptyMessage="Nenhuma turma encontrada." size="small" stripedRows>
//                         <Column field="name" header="Nome da Turma" />
//                         <Column field="course_name" header="Curso" />
//                         <Column header="Ano / Semestre" body={(row) => `${row.academic_year || ''}º Ano (${row.semester || ''}º Sem)`} />
//                         <Column header="Ações" body={(row) => (
//                             <Button icon={<Trash2 size={16} />} text rounded severity="danger" onClick={() => handleDeleteTurma(row.id)} />
//                         )} />
//                     </DataTable>
//                 </Card>
//             )}

//             {/* SECÇÃO: ATRIBUIÇÕES */}
//             {activeTab === "atribuicoes" && (
//                 <Card style={{ border: `1px solid ${COLORS.border}`, boxShadow: "none", borderRadius: 14 }}>
//                     <div className="flex justify-content-between align-items-center mb-4">
//                         <div>
//                             <h2 className="m-0" style={{ fontSize: "1.15rem", color: COLORS.dark }}>Atribuição Docente (Turma + Disciplina + Docente)[cite: 20]</h2>
//                             <p className="m-0 mt-1 text-muted" style={{ fontSize: "0.82rem" }}>Associação fundamental para a submissão de pautas e avaliações.</p>
//                         </div>
//                         <Button label="Nova Atribuição" icon={<Plus size={16} />} size="small" onClick={() => setAtribuicaoDialog(true)} />
//                     </div>
//                     <DataTable value={atribuicoes} paginator rows={5} responsiveLayout="scroll" emptyMessage="Nenhuma atribuição encontrada." size="small" stripedRows>
//                         <Column field="class_name" header="Turma" style={{ fontWeight: 600 }} />
//                         <Column field="subject_name" header="Unidade Curricular" />
//                         <Column field="teacher_name" header="Docente Responsável" body={(row) => <Tag value={row.teacher_name} severity="info" />} />
//                         <Column header="Ações" body={(row) => (
//                             <Button icon={<Trash2 size={16} />} text rounded severity="danger" onClick={() => handleDeleteAtribuicao(row.id)} />
//                         )} />
//                     </DataTable>
//                 </Card>
//             )}

//             {/* MODAL: NOVO CURSO */}
//             <Dialog header="Registar Novo Curso" visible={cursoDialog} onHide={() => setCursoDialog(false)} style={{ width: "500px" }} modal>
//                 <div className="flex flex-column gap-3">
//                     <div>
//                         <label className="block mb-2 font-medium">Nome do Curso</label>
//                         <InputText value={cursoForm.name} onChange={(e) => setCursoForm({ ...cursoForm, name: e.target.value })} placeholder="Ex: Engenharia Informática" className="w-full" />
//                     </div>
//                     <div>
//                         <label className="block mb-2 font-medium">Código</label>
//                         <InputText value={cursoForm.code} onChange={(e) => setCursoForm({ ...cursoForm, code: e.target.value.toUpperCase() })} placeholder="Ex: EI" className="w-full" />
//                     </div>
//                     <div>
//                         <label className="block mb-2 font-medium">Departamento</label>
//                         <Dropdown value={cursoForm.department_id} onChange={(e) => setCursoForm({ ...cursoForm, department_id: e.value })} options={departamentos} optionLabel="name" optionValue="id" placeholder="Selecione o departamento" className="w-full" />
//                     </div>
//                     <div className="flex justify-content-end gap-2 mt-3">
//                         <Button label="Cancelar" outlined severity="secondary" onClick={() => setCursoDialog(false)} />
//                         <Button label="Guardar" icon={<Plus size={16} />} onClick={handleSaveCurso} />
//                     </div>
//                 </div>
//             </Dialog>

//             {/* MODAL: NOVA DISCIPLINA */}
//             <Dialog header="Registar Nova Disciplina" visible={disciplinaDialog} onHide={() => setDisciplinaDialog(false)} style={{ width: "500px" }} modal>
//                 <div className="flex flex-column gap-3">
//                     <div>
//                         <label className="block mb-2 font-medium">Nome da Disciplina</label>
//                         <InputText value={disciplinaForm.name} onChange={(e) => setDisciplinaForm({ ...disciplinaForm, name: e.target.value })} placeholder="Ex: Base de Dados" className="w-full" />
//                     </div>
//                     <div>
//                         <label className="block mb-2 font-medium">Código</label>
//                         <InputText value={disciplinaForm.code} onChange={(e) => setDisciplinaForm({ ...disciplinaForm, code: e.target.value.toUpperCase() })} placeholder="Ex: BD101" className="w-full" />
//                     </div>
//                     <div>
//                         <label className="block mb-2 font-medium">Curso</label>
//                         <Dropdown value={disciplinaForm.course_id} onChange={(e) => setDisciplinaForm({ ...disciplinaForm, course_id: e.value })} options={cursos} optionLabel="name" optionValue="id" placeholder="Selecione o curso" className="w-full" />
//                     </div>
//                     <div className="flex justify-content-end gap-2 mt-3">
//                         <Button label="Cancelar" outlined severity="secondary" onClick={() => setDisciplinaDialog(false)} />
//                         <Button label="Guardar" icon={<Plus size={16} />} onClick={handleSaveDisciplina} />
//                     </div>
//                 </div>
//             </Dialog>

//             {/* MODAL: NOVA TURMA */}
//             <Dialog header="Registar Nova Turma" visible={turmaDialog} onHide={() => setTurmaDialog(false)} style={{ width: "500px" }} modal>
//                 <div className="flex flex-column gap-3">
//                     <div>
//                         <label className="block mb-2 font-medium">Nome / Identificador da Turma</label>
//                         <InputText value={turmaForm.name} onChange={(e) => setTurmaForm({ ...turmaForm, name: e.target.value })} placeholder="Ex: 1M1" className="w-full" />
//                     </div>
//                     <div>
//                         <label className="block mb-2 font-medium">Curso</label>
//                         <Dropdown value={turmaForm.course_id} onChange={(e) => setTurmaForm({ ...turmaForm, course_id: e.value })} options={cursos} optionLabel="name" optionValue="id" placeholder="Selecione o curso" className="w-full" />
//                     </div>
//                     <div>
//                         <label className="block mb-2 font-medium">Ano Lectivo / Semestre</label>
//                         <Dropdown value={turmaForm.academic_year_id} onChange={(e) => setTurmaForm({ ...turmaForm, academic_year_id: e.value })} options={anosLectivos} optionLabel="year" optionValue="id" placeholder="Selecione o ano lectivo" className="w-full" />
//                     </div>
//                     <div className="flex justify-content-end gap-2 mt-3">
//                         <Button label="Cancelar" outlined severity="secondary" onClick={() => setTurmaDialog(false)} />
//                         <Button label="Guardar" icon={<Plus size={16} />} onClick={handleSaveTurma} />
//                     </div>
//                 </div>
//             </Dialog>

//             {/* MODAL: ATRIBUIÇÃO DOCENTE */}
//             <Dialog header="Atribuir Docente à Turma e Disciplina" visible={atribuicaoDialog} onHide={() => setAtribuicaoDialog(false)} style={{ width: "550px" }} modal>
//                 <div className="flex flex-column gap-3">
//                     <div>
//                         <label className="block mb-2 font-medium">Turma</label>
//                         <Dropdown value={atribuicaoForm.class_id} onChange={(e) => setAtribuicaoForm({ ...atribuicaoForm, class_id: e.value })} options={turmas} optionLabel="name" optionValue="id" placeholder="Selecione a turma" className="w-full" />
//                     </div>
//                     <div>
//                         <label className="block mb-2 font-medium">Unidade Curricular / Disciplina</label>
//                         <Dropdown value={atribuicaoForm.subject_id} onChange={(e) => setAtribuicaoForm({ ...atribuicaoForm, subject_id: e.value })} options={disciplinas} optionLabel="name" optionValue="id" placeholder="Selecione a disciplina" className="w-full" />
//                     </div>
//                     <div>
//                         <label className="block mb-2 font-medium">Docente Responsável</label>
//                         <Dropdown value={atribuicaoForm.teacher_id} onChange={(e) => setAtribuicaoForm({ ...atribuicaoForm, teacher_id: e.value })} options={docentes} optionLabel="name" optionValue="id" placeholder="Selecione o docente" className="w-full" />
//                     </div>
//                     <div className="flex justify-content-end gap-2 mt-3">
//                         <Button label="Cancelar" outlined severity="secondary" onClick={() => setAtribuicaoDialog(false)} />
//                         <Button label="Efetuar Atribuição" icon={<Link2 size={16} />} onClick={handleSaveAtribuicao} />
//                     </div>
//                 </div>
//             </Dialog>
//         </div>
//     );
// }