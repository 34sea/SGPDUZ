CREATE DATABASE IF NOT EXISTS SGPDUZ;
USE SGPDUZ;

-- ==========================================
-- 1. ESTRUTURA DE ACESSO, ROLES E PERMISSÕES
-- ==========================================

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE -- 'DOCENTE', 'CHEFE_TURMA', 'SUBCHEFE_TURMA', 'CHEFE_CURSO', 'CHEFE_DEPARTAMENTO', 'ADMIN'
);

CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- ==========================================
-- 2. ESTRUTURA INSTITUCIONAL E ACADÉMICA
-- ==========================================

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  head_user_id INT NULL,
  FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  head_user_id INT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS academic_years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL,
  semester ENUM('1', '2') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  UNIQUE(year, semester)
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  course_id INT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Turmas e Atribuição de Representantes
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- Ex: "Informatica 3º Ano 2026"
  course_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  class_chief_id INT NULL, -- Chefe de Turma
  sub_chief_id INT NULL,   -- Subchefe de Turma
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  FOREIGN KEY (class_chief_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_chief_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Atribuição do Docente à Turma/Disciplina
CREATE TABLE IF NOT EXISTS class_subject_teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(class_id, subject_id, teacher_id)
);

-- Feriados e Exceções do Calendário
CREATE TABLE IF NOT EXISTS holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  description VARCHAR(100) NOT NULL
);

-- ==========================================
-- 3. PLANO ANALÍTICO E DOSIFICAÇÃO SEMANAL
-- ==========================================

CREATE TABLE IF NOT EXISTS analytical_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topic_units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analytical_plan_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  planned_hours INT NOT NULL,
  lesson_type ENUM('TEORICA', 'PRATICA', 'LABORATORIAL', 'VISITA_ESTUDO') NOT NULL,
  sequence_order INT NOT NULL,
  FOREIGN KEY (analytical_plan_id) REFERENCES analytical_plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weekly_dosifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analytical_plan_id INT NOT NULL,
  topic_unit_id INT NOT NULL,
  week_number INT NOT NULL,
  is_evaluation_week BOOLEAN DEFAULT FALSE,
  is_confirmed_by_teacher BOOLEAN DEFAULT FALSE,
  custom_notes TEXT,
  FOREIGN KEY (analytical_plan_id) REFERENCES analytical_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_unit_id) REFERENCES topic_units(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. MAPA SEMANAL DE AULAS E VALIDAÇÃO
-- ==========================================

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_subject_teacher_id INT NOT NULL,
  topic_unit_id INT NULL,
  lesson_date DATE NOT NULL,
  status ENUM(
    'REGISTADA', 
    'CONFIRMADA', 
    'CONFIRMADA_COM_RESSALVA', 
    'EM_DISPUTA', 
    'RESOLVIDA', 
    'PENDENTE_PROLONGADA'
  ) DEFAULT 'REGISTADA',
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT NULL,
  content_taught TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_subject_teacher_id) REFERENCES class_subject_teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_unit_id) REFERENCES topic_units(id) ON DELETE SET NULL
);

-- Histórico de Confirmação pelos Representantes (Chefe / Subchefe)
CREATE TABLE IF NOT EXISTS lesson_confirmations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  user_id INT NOT NULL, -- Chefe ou Subchefe de turma
  status_given ENUM('CONFIRMADA', 'RESSALVA', 'EM_DISPUTA') NOT NULL,
  remarks TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. GESTÃO DE AVALIAÇÕES E PAUTAS FINAIS
-- ==========================================

CREATE TABLE IF NOT EXISTS assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_subject_teacher_id INT NOT NULL,
  title VARCHAR(100) NOT NULL, -- Ex: "Teste 1", "Trabalho Prático"
  assessment_date DATE NOT NULL,
  results_published_date DATE NULL,
  deadline_date DATE NOT NULL, -- Data limite calculada pelo Regulamento
  status ENUM('DENTRO_DO_PRAZO', 'FORA_DO_PRAZO', 'PENDENTE') DEFAULT 'PENDENTE',
  FOREIGN KEY (class_subject_teacher_id) REFERENCES class_subject_teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS final_grade_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_subject_teacher_id INT NOT NULL,
  epoch ENUM('NORMAL', 'RECURSO', 'ESPECIAL') NOT NULL,
  file_url VARCHAR(255) NOT NULL, -- Link do arquivo gerado/PDF
  uploaded_by INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_subject_teacher_id) REFERENCES class_subject_teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. ACTIVIDADES AD-HOC
-- ==========================================

CREATE TABLE IF NOT EXISTS adhoc_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_by INT NOT NULL, -- Chefe de Curso ou Chefe de Departamento
  assigned_to INT NOT NULL, -- Docente responsável
  deadline DATETIME NOT NULL,
  status ENUM('PENDENTE', 'ENTREGUE', 'VERIFICADA', 'ATRASADA') DEFAULT 'PENDENTE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  proof_file_url VARCHAR(255) NULL, -- Anexo/Comprovativo
  notes TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_approved BOOLEAN NULL,
  feedback TEXT NULL,
  FOREIGN KEY (task_id) REFERENCES adhoc_tasks(id) ON DELETE CASCADE
);

-- ==========================================
-- 7. DADOS INICIAIS COMPLETOS (SEEDS)
-- SGPDUZ - Seguro para reinicializações
-- ==========================================

USE SGPDUZ;

-- ------------------------------------------
-- 7.1 ROLES
-- ------------------------------------------

INSERT IGNORE INTO roles (name) VALUES
('ADMIN'),
('CHEFE_DEPARTAMENTO'),
('CHEFE_CURSO'),
('DOCENTE'),
('CHEFE_TURMA'),
('SUBCHEFE_TURMA');

-- ------------------------------------------
-- 7.2 PERMISSÕES
-- ------------------------------------------

INSERT IGNORE INTO permissions (name) VALUES
('MANAGE_USERS'),
('MANAGE_ROLES'),
('MANAGE_DEPARTMENTS'),
('MANAGE_COURSES'),
('MANAGE_ACADEMIC_YEARS'),
('MANAGE_SUBJECTS'),
('MANAGE_CLASSES'),
('MANAGE_HOLIDAYS'),
('CREATE_ANALYTICAL_PLAN'),
('MANAGE_TOPIC_UNITS'),
('MANAGE_DOSIFICATION'),
('CONFIRM_LESSONS'),
('REGISTER_LESSONS'),
('MANAGE_ASSESSMENTS'),
('MANAGE_FINAL_GRADE_SHEETS'),
('ASSIGN_ADHOC_TASK'),
('SUBMIT_ADHOC_TASK'),
('VERIFY_ADHOC_TASK'),
('VIEW_REPORTS');

-- ------------------------------------------
-- 7.3 ASSOCIAÇÃO DE PERMISSÕES AOS PERFIS
-- ------------------------------------------

-- Administrador: todas as permissões existentes.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN';

-- Chefe de Departamento.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'MANAGE_DEPARTMENTS',
    'MANAGE_COURSES',
    'MANAGE_ACADEMIC_YEARS',
    'MANAGE_SUBJECTS',
    'MANAGE_CLASSES',
    'MANAGE_HOLIDAYS',
    'MANAGE_DOSIFICATION',
    'MANAGE_ASSESSMENTS',
    'MANAGE_FINAL_GRADE_SHEETS',
    'ASSIGN_ADHOC_TASK',
    'VERIFY_ADHOC_TASK',
    'VIEW_REPORTS'
)
WHERE r.name = 'CHEFE_DEPARTAMENTO';

-- Chefe de Curso.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'MANAGE_SUBJECTS',
    'MANAGE_CLASSES',
    'MANAGE_DOSIFICATION',
    'MANAGE_ASSESSMENTS',
    'MANAGE_FINAL_GRADE_SHEETS',
    'ASSIGN_ADHOC_TASK',
    'VERIFY_ADHOC_TASK',
    'VIEW_REPORTS'
)
WHERE r.name = 'CHEFE_CURSO';

-- Docente.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'CREATE_ANALYTICAL_PLAN',
    'MANAGE_TOPIC_UNITS',
    'MANAGE_DOSIFICATION',
    'REGISTER_LESSONS',
    'MANAGE_ASSESSMENTS',
    'MANAGE_FINAL_GRADE_SHEETS',
    'SUBMIT_ADHOC_TASK'
)
WHERE r.name = 'DOCENTE';

-- Chefe e Subchefe de Turma.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name = 'CONFIRM_LESSONS'
WHERE r.name IN ('CHEFE_TURMA', 'SUBCHEFE_TURMA');

-- ------------------------------------------
-- Dados de demonstracao para SGPDUZ
-- Apenas INSERTs: nao cria nem altera tabelas e nao insere roles/permissoes.
-- Pressupoe que a estrutura ja existe e que roles contem os seis perfis usados.
-- Os nomes pessoais sao ficticios; cursos/unidades curriculares sao nomes academicos plausiveis.

-- 1. Utilizadores: 20 perfis com nomes variados e e-mails de teste.
INSERT INTO users (name, email, password, role_id)
SELECT x.name, x.email,
       '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', r.id
FROM (
 SELECT 'Celso Mucavele' name, 'celso.mucavele@sgpduz.test' email, 'ADMIN' role_name UNION ALL
 SELECT 'Amelia Chissano','amelia.chissano@sgpduz.test','CHEFE_DEPARTAMENTO' UNION ALL
 SELECT 'Ernesto Mabunda','ernesto.mabunda@sgpduz.test','CHEFE_DEPARTAMENTO' UNION ALL
 SELECT 'Lidia Chongo','lidia.chongo@sgpduz.test','CHEFE_DEPARTAMENTO' UNION ALL
 SELECT 'Armando Macuacua','armando.macuacua@sgpduz.test','CHEFE_DEPARTAMENTO' UNION ALL
 SELECT 'Teresa Nhantumbo','teresa.nhantumbo@sgpduz.test','CHEFE_DEPARTAMENTO' UNION ALL
 SELECT 'Adelino Cossa','adelino.cossa@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Rosa Bila','rosa.bila@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Fernando Sitoe','fernando.sitoe@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Marta Jamal','marta.jamal@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Joaquim Tembe','joaquim.tembe@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Ivone Macamo','ivone.macamo@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Nelson Nhaca','nelson.nhaca@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Helena Muianga','helena.muianga@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Paulo Mondlane','paulo.mondlane@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Sara Cuamba','sara.cuamba@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Bento Mbanze','bento.mbanze@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Fatima Langa','fatima.langa@sgpduz.test','DOCENTE' UNION ALL
 SELECT 'Dercio Macuacua','dercio.macuacua@sgpduz.test','CHEFE_TURMA' UNION ALL
 SELECT 'Eunice Cumbane','eunice.cumbane@sgpduz.test','SUBCHEFE_TURMA'
) x
JOIN roles r ON r.name=x.role_name
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email=x.email);

-- 2. Cinco departamentos, sem criar departamentos de demonstracao numerados.
INSERT INTO departments (name, head_user_id)
SELECT x.name, u.id
FROM (
 SELECT 'Departamento de Engenharia Informatica' name, 'amelia.chissano@sgpduz.test' email UNION ALL
 SELECT 'Departamento de Engenharia Civil','ernesto.mabunda@sgpduz.test' UNION ALL
 SELECT 'Departamento de Engenharia Mecanica','lidia.chongo@sgpduz.test' UNION ALL
 SELECT 'Departamento de Engenharia Electrotecnica','armando.macuacua@sgpduz.test' UNION ALL
 SELECT 'Departamento de Engenharia Quimica','teresa.nhantumbo@sgpduz.test'
) x JOIN users u ON u.email=x.email
WHERE NOT EXISTS (SELECT 1 FROM departments d WHERE d.name=x.name);

-- 3. Cursos, um por departamento.
INSERT INTO courses (name, code, department_id, head_user_id)
SELECT x.course_name, x.code, d.id, u.id
FROM (
 SELECT 'Engenharia Informatica' course_name,'ENG-INF' code,'Departamento de Engenharia Informatica' dept,'amelia.chissano@sgpduz.test' email UNION ALL
 SELECT 'Engenharia Civil','ENG-CIV','Departamento de Engenharia Civil','ernesto.mabunda@sgpduz.test' UNION ALL
 SELECT 'Engenharia Mecanica','ENG-MEC','Departamento de Engenharia Mecanica','lidia.chongo@sgpduz.test' UNION ALL
 SELECT 'Engenharia Electrotecnica','ENG-ELET','Departamento de Engenharia Electrotecnica','armando.macuacua@sgpduz.test' UNION ALL
 SELECT 'Engenharia Quimica','ENG-QUI','Departamento de Engenharia Quimica','teresa.nhantumbo@sgpduz.test'
) x JOIN departments d ON d.name=x.dept JOIN users u ON u.email=x.email
WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.code=x.code);

-- 4. Anos lectivos e semestres.
INSERT INTO academic_years (year, semester, start_date, end_date, is_active)
SELECT x.year, x.semester, x.start_date, x.end_date, x.is_active
FROM (
 SELECT 2025 year,'1' semester,'2025-03-03' start_date,'2025-07-25' end_date,FALSE is_active UNION ALL
 SELECT 2025,'2','2025-08-04','2025-12-12',FALSE UNION ALL
 SELECT 2026,'1','2026-03-02','2026-07-31',FALSE UNION ALL
 SELECT 2026,'2','2026-08-03','2026-12-18',TRUE
) x WHERE NOT EXISTS (SELECT 1 FROM academic_years a WHERE a.year=x.year AND a.semester=x.semester);

-- 5. Unidades curriculares reais/plausiveis por area, com codigos unicos.
INSERT INTO subjects (code, name, course_id)
SELECT x.code,x.name,c.id
FROM (
 SELECT 'INF-POO' code,'Programacao Orientada a Objectos' name,'ENG-INF' course UNION ALL
 SELECT 'INF-BD','Bases de Dados','ENG-INF' UNION ALL
 SELECT 'INF-ES','Engenharia de Software','ENG-INF' UNION ALL
 SELECT 'CIV-MAT','Materiais de Construcao','ENG-CIV' UNION ALL
 SELECT 'CIV-EST','Resistencia dos Materiais','ENG-CIV' UNION ALL
 SELECT 'CIV-HID','Hidraulica Geral','ENG-CIV' UNION ALL
 SELECT 'MEC-TER','Termodinamica','ENG-MEC' UNION ALL
 SELECT 'MEC-MEC','Mecanica dos Fluidos','ENG-MEC' UNION ALL
 SELECT 'MEC-DES','Desenho Tecnico','ENG-MEC' UNION ALL
 SELECT 'EEL-CIR','Circuitos Electricos','ENG-ELET' UNION ALL
 SELECT 'EEL-MAQ','Maquinas Electricas','ENG-ELET' UNION ALL
 SELECT 'EEL-AUT','Automacao Industrial','ENG-ELET' UNION ALL
 SELECT 'QUI-ORG','Quimica Organica','ENG-QUI' UNION ALL
 SELECT 'QUI-OPU','Operacoes Unitarias','ENG-QUI' UNION ALL
 SELECT 'QUI-ANA','Quimica Analitica'
 ,'ENG-QUI'
) x JOIN courses c ON c.code=x.course
WHERE NOT EXISTS (SELECT 1 FROM subjects s WHERE s.code=x.code);

-- 6. Turmas para 2026, com chefes e subchefes definidos.
INSERT INTO classes (name,course_id,academic_year_id,class_chief_id,sub_chief_id)
SELECT x.class_name,c.id,ay.id,ch.id,subc.id
FROM (
 SELECT 'Engenharia Informatica - 3o Ano - 2026' class_name,'ENG-INF' course UNION ALL
 SELECT 'Engenharia Civil - 3o Ano - 2026','ENG-CIV' UNION ALL
 SELECT 'Engenharia Mecanica - 3o Ano - 2026','ENG-MEC' UNION ALL
 SELECT 'Engenharia Electrotecnica - 3o Ano - 2026','ENG-ELET' UNION ALL
 SELECT 'Engenharia Quimica - 3o Ano - 2026','ENG-QUI'
) x JOIN courses c ON c.code=x.course
JOIN academic_years ay ON ay.year=2026 AND ay.semester='2'
JOIN users ch ON ch.email='dercio.macuacua@sgpduz.test'
JOIN users subc ON subc.email='eunice.cumbane@sgpduz.test'
WHERE NOT EXISTS (SELECT 1 FROM classes cl WHERE cl.name=x.class_name AND cl.course_id=c.id AND cl.academic_year_id=ay.id);

-- 7. Atribuicoes docentes: disciplinas distribuidas por varios docentes.
INSERT INTO class_subject_teachers (class_id,subject_id,teacher_id)
SELECT cl.id,s.id,u.id
FROM classes cl JOIN courses c ON c.id=cl.course_id
JOIN subjects s ON s.course_id=c.id
JOIN users u ON u.email = CASE s.code
 WHEN 'INF-POO' THEN 'adelino.cossa@sgpduz.test'
 WHEN 'INF-BD' THEN 'rosa.bila@sgpduz.test'
 WHEN 'INF-ES' THEN 'fernando.sitoe@sgpduz.test'
 WHEN 'CIV-MAT' THEN 'marta.jamal@sgpduz.test'
 WHEN 'CIV-EST' THEN 'joaquim.tembe@sgpduz.test'
 WHEN 'CIV-HID' THEN 'ivone.macamo@sgpduz.test'
 WHEN 'MEC-TER' THEN 'nelson.nhaca@sgpduz.test'
 WHEN 'MEC-MEC' THEN 'helena.muianga@sgpduz.test'
 WHEN 'MEC-DES' THEN 'paulo.mondlane@sgpduz.test'
 WHEN 'EEL-CIR' THEN 'sara.cuamba@sgpduz.test'
 WHEN 'EEL-MAQ' THEN 'bento.mbanze@sgpduz.test'
 WHEN 'EEL-AUT' THEN 'fatima.langa@sgpduz.test'
 WHEN 'QUI-ORG' THEN 'adelino.cossa@sgpduz.test'
 WHEN 'QUI-OPU' THEN 'marta.jamal@sgpduz.test'
 WHEN 'QUI-ANA' THEN 'rosa.bila@sgpduz.test' END
WHERE NOT EXISTS (SELECT 1 FROM class_subject_teachers old WHERE old.class_id=cl.id AND old.subject_id=s.id AND old.teacher_id=u.id);

-- 8. Feriados nacionais de demonstracao.
INSERT INTO holidays (date,description)
SELECT x.date,x.description FROM (
 SELECT '2026-04-07' date,'Dia da Mulher Mocambicana' description UNION ALL
 SELECT '2026-05-01','Dia Internacional dos Trabalhadores' UNION ALL
 SELECT '2026-06-25','Dia da Independencia Nacional' UNION ALL
 SELECT '2026-09-07','Dia da Vitoria' UNION ALL
 SELECT '2026-09-25','Dia das Forcas Armadas' UNION ALL
 SELECT '2026-10-04','Dia da Paz e Reconciliacao'
) x WHERE NOT EXISTS (SELECT 1 FROM holidays h WHERE h.date=x.date);

-- 9. Planos analiticos por unidade curricular para o semestre activo.
INSERT INTO analytical_plans (subject_id,academic_year_id,created_by)
SELECT s.id,ay.id,u.id FROM subjects s
JOIN courses c ON c.id=s.course_id
JOIN academic_years ay ON ay.year=2026 AND ay.semester='2'
JOIN users u ON u.email=CASE c.code
 WHEN 'ENG-INF' THEN 'adelino.cossa@sgpduz.test'
 WHEN 'ENG-CIV' THEN 'marta.jamal@sgpduz.test'
 WHEN 'ENG-MEC' THEN 'nelson.nhaca@sgpduz.test'
 WHEN 'ENG-ELET' THEN 'sara.cuamba@sgpduz.test'
 ELSE 'fatima.langa@sgpduz.test' END
WHERE NOT EXISTS (SELECT 1 FROM analytical_plans ap WHERE ap.subject_id=s.id AND ap.academic_year_id=ay.id);

-- 10. Unidades tematicas: tres por unidade curricular.
INSERT INTO topic_units (analytical_plan_id,title,description,planned_hours,lesson_type,sequence_order)
SELECT ap.id,x.title,x.description,x.hours,x.kind,x.seq
FROM analytical_plans ap JOIN subjects s ON s.id=ap.subject_id
JOIN (
 SELECT 1 seq,'Fundamentos e conceitos introdutorios' title,'Apresentacao dos conceitos fundamentais e objectivos da unidade curricular.' description,4 hours,'TEORICA' kind UNION ALL
 SELECT 2,'Aplicacao pratica dos conceitos','Resolucao de exercicios e aplicacao dos conteudos estudados.',8,'PRATICA' UNION ALL
 SELECT 3,'Trabalho laboratorial e consolidacao','Actividades praticas, analise de resultados e consolidacao da aprendizagem.',8,'LABORATORIAL'
) x
WHERE NOT EXISTS (SELECT 1 FROM topic_units tu WHERE tu.analytical_plan_id=ap.id AND tu.sequence_order=x.seq);

-- 11. Dosificacoes semanais associadas as unidades tematicas.
INSERT INTO weekly_dosifications (analytical_plan_id,topic_unit_id,week_number,is_evaluation_week,is_confirmed_by_teacher,custom_notes)
SELECT tu.analytical_plan_id,tu.id,tu.sequence_order,(tu.sequence_order=3),(tu.sequence_order=1),
       CASE tu.sequence_order WHEN 1 THEN 'Dosificacao confirmada pelo docente.' WHEN 2 THEN 'Conteudos praticos previstos para a semana.' ELSE 'Semana reservada para actividade pratica ou avaliacao.' END
FROM topic_units tu
WHERE NOT EXISTS (SELECT 1 FROM weekly_dosifications wd WHERE wd.analytical_plan_id=tu.analytical_plan_id AND wd.topic_unit_id=tu.id AND wd.week_number=tu.sequence_order);

-- 12. Aulas: quantidade variavel de 3 a 8 por atribuicao docente, com estados distintos.
INSERT INTO lessons (class_subject_teacher_id,topic_unit_id,lesson_date,status,is_cancelled,cancellation_reason,content_taught)
SELECT cst.id,tu.id,DATE_ADD('2026-08-10',INTERVAL n.n*7 DAY),
       CASE MOD(n.n+cst.id,6) WHEN 0 THEN 'CONFIRMADA' WHEN 1 THEN 'REGISTADA' WHEN 2 THEN 'CONFIRMADA_COM_RESSALVA' WHEN 3 THEN 'RESOLVIDA' WHEN 4 THEN 'EM_DISPUTA' ELSE 'PENDENTE_PROLONGADA' END,
       (MOD(n.n+cst.id,11)=0),
       CASE WHEN MOD(n.n+cst.id,11)=0 THEN 'Aula cancelada para demonstracao do sistema.' ELSE NULL END,
       CASE n.n WHEN 1 THEN 'Apresentacao e introducao aos conteudos.' WHEN 2 THEN 'Exposicao dos conceitos fundamentais.' WHEN 3 THEN 'Resolucao orientada de exercicios.' WHEN 4 THEN 'Actividade pratica em grupo.' WHEN 5 THEN 'Discussao e correcao dos exercicios.' WHEN 6 THEN 'Aplicacao dos conhecimentos a um caso pratico.' WHEN 7 THEN 'Revisao dos conteudos leccionados.' ELSE 'Consolidacao e esclarecimento de duvidas.' END
FROM class_subject_teachers cst
JOIN subjects s ON s.id=cst.subject_id
JOIN analytical_plans ap ON ap.subject_id=s.id
JOIN topic_units tu ON tu.analytical_plan_id=ap.id AND tu.sequence_order=MOD(cst.id,3)+1
JOIN (
 SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
) n ON n.n <= 3 + MOD(cst.id,6)
WHERE NOT EXISTS (SELECT 1 FROM lessons l WHERE l.class_subject_teacher_id=cst.id AND l.lesson_date=DATE_ADD('2026-08-10',INTERVAL n.n*7 DAY));

-- 13. Confirmacoes: apenas parte das aulas e confirmada pelos representantes.
INSERT INTO lesson_confirmations (lesson_id,user_id,status_given,remarks)
SELECT l.id,u.id,CASE WHEN MOD(l.id,5)=0 THEN 'RESSALVA' WHEN MOD(l.id,7)=0 THEN 'EM_DISPUTA' ELSE 'CONFIRMADA' END,
       CASE WHEN MOD(l.id,5)=0 THEN 'Conteudo confirmado com uma ressalva.' WHEN MOD(l.id,7)=0 THEN 'Aguardando esclarecimento do representante.' ELSE 'Aula confirmada pelo representante da turma.' END
FROM lessons l JOIN class_subject_teachers cst ON cst.id=l.class_subject_teacher_id
JOIN classes cl ON cl.id=cst.class_id
JOIN users u ON u.id=cl.class_chief_id
WHERE MOD(l.id,3)<>0
AND NOT EXISTS (SELECT 1 FROM lesson_confirmations lc WHERE lc.lesson_id=l.id AND lc.user_id=u.id);

-- 14. Avaliacoes: algumas atribuicoes tem uma, duas ou tres; outras ficam sem avaliacao registada.
INSERT INTO assessments (class_subject_teacher_id,title,assessment_date,results_published_date,deadline_date,status)
SELECT cst.id,x.title,x.assessment_date,x.published,x.deadline,x.status
FROM class_subject_teachers cst
JOIN subjects s ON s.id=cst.subject_id
JOIN (
 SELECT 1 n,'Teste escrito' title,CAST('2026-09-14' AS DATE) assessment_date,CAST('2026-09-22' AS DATE) published,CAST('2026-09-24' AS DATE) deadline,'DENTRO_DO_PRAZO' status UNION ALL
 SELECT 2,'Trabalho pratico','2026-10-05','2026-10-19','2026-10-15','FORA_DO_PRAZO' UNION ALL
 SELECT 3,'Teste de frequencia','2026-11-02',NULL,'2026-11-16','PENDENTE'
) x ON x.n <= MOD(cst.id,4)
WHERE NOT EXISTS (SELECT 1 FROM assessments a WHERE a.class_subject_teacher_id=cst.id AND a.title=x.title);

-- 15. Pautas: algumas disciplinas ja entregaram, outras continuam sem pauta.
INSERT INTO final_grade_sheets (class_subject_teacher_id,epoch,file_url,uploaded_by)
SELECT cst.id,x.epoch,CONCAT('/uploads/pautas/',s.code,'-',x.epoch,'-2026.pdf'),u.id
FROM class_subject_teachers cst JOIN subjects s ON s.id=cst.subject_id
JOIN users u ON u.id=cst.teacher_id
JOIN (
 SELECT 1 n,'NORMAL' epoch UNION ALL SELECT 2,'RECURSO'
) x ON x.n=CASE WHEN MOD(cst.id,5)=0 THEN 2 WHEN MOD(cst.id,3)=0 THEN 1 ELSE 0 END
WHERE NOT EXISTS (SELECT 1 FROM final_grade_sheets fs WHERE fs.class_subject_teacher_id=cst.id AND fs.epoch=x.epoch);

-- 16. Actividades administrativas/pedagogicas com estados diferentes.
INSERT INTO adhoc_tasks (title,description,assigned_by,assigned_to,deadline,status)
SELECT x.title,x.description,chef.id,doc.id,x.deadline,x.status
FROM (
 SELECT 'Rever o plano analitico' title,'Actualizar a sequencia dos conteudos e a carga horaria.' description,'amelia.chissano@sgpduz.test' chef_email,'adelino.cossa@sgpduz.test' doc_email,'2026-10-25 23:59:00' deadline,'ENTREGUE' status UNION ALL
 SELECT 'Preparar relatorio de acompanhamento','Apresentar o resumo das aulas e dificuldades dos estudantes.','ernesto.mabunda@sgpduz.test','marta.jamal@sgpduz.test','2026-10-28 23:59:00','PENDENTE' UNION ALL
 SELECT 'Submeter pautas do semestre','Conferir e submeter as pautas finais das unidades curriculares.','lidia.chongo@sgpduz.test','nelson.nhaca@sgpduz.test','2026-10-10 23:59:00','ATRASADA' UNION ALL
 SELECT 'Organizar material de laboratorio','Actualizar os guiões e os recursos para as aulas praticas.','armando.macuacua@sgpduz.test','sara.cuamba@sgpduz.test','2026-11-05 23:59:00','VERIFICADA' UNION ALL
 SELECT 'Entregar sumario das avaliacoes','Registar o ponto de situacao das avaliacoes realizadas.','teresa.nhantumbo@sgpduz.test','fatima.langa@sgpduz.test','2026-11-12 23:59:00','PENDENTE' UNION ALL
 SELECT 'Actualizar bibliografia recomendada','Rever as referencias indicadas aos estudantes.','amelia.chissano@sgpduz.test','rosa.bila@sgpduz.test','2026-11-15 23:59:00','ENTREGUE' UNION ALL
 SELECT 'Preparar acta de reuniao pedagogica','Organizar os pontos discutidos e as decisoes tomadas.','ernesto.mabunda@sgpduz.test','joaquim.tembe@sgpduz.test','2026-10-18 23:59:00','ATRASADA' UNION ALL
 SELECT 'Conferir dosificacao semanal','Confirmar a correspondencia entre plano e aulas dadas.','lidia.chongo@sgpduz.test','helena.muianga@sgpduz.test','2026-11-08 23:59:00','PENDENTE' UNION ALL
 SELECT 'Submeter relatorio de aulas praticas','Descrever as actividades praticas realizadas no laboratorio.','armando.macuacua@sgpduz.test','bento.mbanze@sgpduz.test','2026-10-30 23:59:00','VERIFICADA' UNION ALL
 SELECT 'Rever resultados de frequencia','Verificar os resultados e preparar a devolucao aos estudantes.','teresa.nhantumbo@sgpduz.test','ivone.macamo@sgpduz.test','2026-11-10 23:59:00','ENTREGUE'
) x JOIN users chef ON chef.email=x.chef_email JOIN users doc ON doc.email=x.doc_email
WHERE NOT EXISTS (SELECT 1 FROM adhoc_tasks t WHERE t.title=x.title AND t.assigned_to=doc.id);

-- 17. Submissoes apenas para actividades que foram entregues/verificadas.
INSERT INTO task_submissions (task_id,proof_file_url,notes,is_approved,feedback)
SELECT t.id,
       CASE WHEN t.status='VERIFICADA' THEN '/uploads/comprovativos/relatorio-revisto.pdf' ELSE '/uploads/comprovativos/entrega-docente.pdf' END,
       CASE WHEN t.status='VERIFICADA' THEN 'Documento analisado e validado.' ELSE 'Documento submetido para apreciacao.' END,
       CASE WHEN t.status='VERIFICADA' THEN TRUE ELSE NULL END,
       CASE WHEN t.status='VERIFICADA' THEN 'Submissao validada.' ELSE NULL END
FROM adhoc_tasks t
WHERE t.status IN ('ENTREGUE','VERIFICADA')
AND NOT EXISTS (SELECT 1 FROM task_submissions ts WHERE ts.task_id=t.id);

-- Fim: os registos sao dados ficticios de demonstracao e nao representam dados oficiais da UniZambeze.

-- 8. Datas de registo variadas e cronologicamente coerentes.
-- Os dados académicos mantêm as suas datas próprias; estes comandos variam apenas
-- os carimbos de registo/auditoria dos registos de demonstração.
UPDATE users
SET created_at = DATE_ADD('2026-07-20 08:00:00', INTERVAL (id * 47) MINUTE)
WHERE email LIKE '%@sgpduz.test';

UPDATE analytical_plans ap
JOIN subjects s ON s.id = ap.subject_id
SET ap.created_at = DATE_ADD('2026-07-25 09:00:00', INTERVAL (ap.id * 2) DAY)
WHERE s.code IN ('INF-ALG','INF-BD','INF-RED','CIV-MAT','CIV-EST','CIV-HID',
                 'MEC-TER','MEC-DES','MEC-MAT','ELE-CIR','ELE-ENE','ELE-AUT',
                 'QUI-ORG','QUI-FIS','QUI-ANA');

UPDATE lessons
SET created_at = TIMESTAMP(DATE_SUB(lesson_date, INTERVAL MOD(id, 4) DAY), '08:00:00')
WHERE lesson_date >= '2026-08-17';

UPDATE lesson_confirmations lc
JOIN lessons l ON l.id = lc.lesson_id
SET lc.created_at = TIMESTAMP(DATE_ADD(l.lesson_date, INTERVAL 1 DAY), '10:00:00')
WHERE l.lesson_date >= '2026-08-17';

UPDATE final_grade_sheets fs
JOIN class_subject_teachers cst ON cst.id = fs.class_subject_teacher_id
SET fs.uploaded_at = DATE_ADD('2026-10-01 09:00:00', INTERVAL (fs.id * 3) DAY)
WHERE fs.file_url LIKE '/uploads/pautas/%';

UPDATE adhoc_tasks
SET created_at = DATE_SUB(deadline, INTERVAL (2 + MOD(id, 9)) DAY)
WHERE title LIKE 'Actividade %';

UPDATE task_submissions ts
JOIN adhoc_tasks t ON t.id = ts.task_id
SET ts.submitted_at = DATE_ADD(t.created_at, INTERVAL (1 + MOD(ts.id, 4)) DAY)
WHERE t.title LIKE 'Actividade %';

-- Fim do ficheiro completo de demonstração.
