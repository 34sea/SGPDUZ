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
-- 7.4 UTILIZADORES DE DEMONSTRAÇÃO
-- Palavra-passe: password
-- Hash bcrypt de exemplo.
-- ------------------------------------------

INSERT INTO users (name, email, password, role_id)
SELECT
    seed.name,
    seed.email,
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    r.id
FROM (
    SELECT 'Administrador do Sistema' AS name,
           'admin@sgpduz.test' AS email,
           'ADMIN' AS role_name
    UNION ALL
    SELECT 'Director do Departamento',
           'chefe.departamento@sgpduz.test',
           'CHEFE_DEPARTAMENTO'
    UNION ALL
    SELECT 'Coordenador do Curso',
           'chefe.curso@sgpduz.test',
           'CHEFE_CURSO'
    UNION ALL
    SELECT 'Docente de Programacao',
           'docente.programacao@sgpduz.test',
           'DOCENTE'
    UNION ALL
    SELECT 'Docente de Bases de Dados',
           'docente.basedados@sgpduz.test',
           'DOCENTE'
    UNION ALL
    SELECT 'Chefe da Turma de Informatica',
           'chefe.turma@sgpduz.test',
           'CHEFE_TURMA'
    UNION ALL
    SELECT 'Subchefe da Turma de Informatica',
           'subchefe.turma@sgpduz.test',
           'SUBCHEFE_TURMA'
) AS seed
JOIN roles r ON r.name = seed.role_name
WHERE NOT EXISTS (
    SELECT 1
    FROM users u
    WHERE u.email = seed.email
);

-- ------------------------------------------
-- 7.5 DEPARTAMENTO
-- ------------------------------------------

INSERT IGNORE INTO departments (name)
VALUES ('Departamento de Engenharia Informatica');

-- Associar o Chefe de Departamento.
UPDATE departments d
JOIN users u
    ON u.email = 'chefe.departamento@sgpduz.test'
SET d.head_user_id = u.id
WHERE d.name = 'Departamento de Engenharia Informatica'
  AND d.head_user_id IS NULL;

-- ------------------------------------------
-- 7.6 CURSO
-- ------------------------------------------

INSERT IGNORE INTO courses (
    name,
    code,
    department_id
)
SELECT
    'Engenharia Informatica',
    'ENG-INF',
    d.id
FROM departments d
WHERE d.name = 'Departamento de Engenharia Informatica';

UPDATE courses c
JOIN departments d
    ON d.id = c.department_id
JOIN users u
    ON u.email = 'chefe.curso@sgpduz.test'
SET c.head_user_id = u.id
WHERE c.code = 'ENG-INF'
  AND d.name = 'Departamento de Engenharia Informatica'
  AND c.head_user_id IS NULL;

-- ------------------------------------------
-- 7.7 ANO LECTIVO E SEMESTRE
-- ------------------------------------------

INSERT IGNORE INTO academic_years (
    year,
    semester,
    start_date,
    end_date,
    is_active
)
VALUES
(2026, '1', '2026-03-02', '2026-07-31', FALSE),
(2026, '2', '2026-08-03', '2026-12-18', TRUE);

-- Desactivar outros períodos para garantir apenas
-- um período activo no conjunto de demonstração.
UPDATE academic_years
SET is_active = FALSE
WHERE is_active = TRUE
  AND (year <> 2026 OR semester <> '2');

UPDATE academic_years
SET is_active = TRUE
WHERE year = 2026 AND semester = '2';

-- ------------------------------------------
-- 7.8 UNIDADES CURRICULARES
-- ------------------------------------------

INSERT IGNORE INTO subjects (code, name, course_id)
SELECT 'ENGINF-POO', 'Programacao Orientada a Objectos', c.id
FROM courses c
WHERE c.code = 'ENG-INF';

INSERT IGNORE INTO subjects (code, name, course_id)
SELECT 'ENGINF-BD', 'Bases de Dados', c.id
FROM courses c
WHERE c.code = 'ENG-INF';

INSERT IGNORE INTO subjects (code, name, course_id)
SELECT 'ENGINF-ES', 'Engenharia de Software', c.id
FROM courses c
WHERE c.code = 'ENG-INF';

-- ------------------------------------------
-- 7.9 TURMAS
-- ------------------------------------------

INSERT INTO classes (
    name,
    course_id,
    academic_year_id,
    class_chief_id,
    sub_chief_id
)
SELECT
    'Informatica 3o Ano 2026 - Semestre 2',
    c.id,
    ay.id,
    chefe.id,
    subchefe.id
FROM courses c
JOIN academic_years ay
    ON ay.year = 2026 AND ay.semester = '2'
JOIN users chefe
    ON chefe.email = 'chefe.turma@sgpduz.test'
JOIN users subchefe
    ON subchefe.email = 'subchefe.turma@sgpduz.test'
WHERE c.code = 'ENG-INF'
AND NOT EXISTS (
    SELECT 1
    FROM classes cl
    WHERE cl.name = 'Informatica 3o Ano 2026 - Semestre 2'
      AND cl.course_id = c.id
      AND cl.academic_year_id = ay.id
);

-- ------------------------------------------
-- 7.10 ATRIBUIÇÃO DOS DOCENTES
-- ------------------------------------------

INSERT IGNORE INTO class_subject_teachers (
    class_id,
    subject_id,
    teacher_id
)
SELECT cl.id, s.id, u.id
FROM classes cl
JOIN courses c ON c.id = cl.course_id
JOIN subjects s ON s.course_id = c.id
JOIN users u ON (
    (s.code = 'ENGINF-POO'
        AND u.email = 'docente.programacao@sgpduz.test')
    OR
    (s.code = 'ENGINF-BD'
        AND u.email = 'docente.basedados@sgpduz.test')
    OR
    (s.code = 'ENGINF-ES'
        AND u.email = 'docente.programacao@sgpduz.test')
)
WHERE cl.name = 'Informatica 3o Ano 2026 - Semestre 2';

-- ------------------------------------------
-- 7.11 FERIADOS DE DEMONSTRAÇÃO
-- ------------------------------------------

INSERT IGNORE INTO holidays (date, description)
VALUES
('2026-04-07', 'Dia da Mulher Mocambicana'),
('2026-05-01', 'Dia Internacional dos Trabalhadores'),
('2026-06-25', 'Dia da Independencia Nacional'),
('2026-09-07', 'Dia da Vitoria'),
('2026-09-25', 'Dia das Forcas Armadas'),
('2026-10-04', 'Dia da Paz e Reconciliacao');

-- ------------------------------------------
-- 7.12 PLANOS ANALÍTICOS
-- ------------------------------------------

INSERT INTO analytical_plans (
    subject_id,
    academic_year_id,
    created_by
)
SELECT s.id, ay.id, u.id
FROM subjects s
JOIN courses c ON c.id = s.course_id
JOIN academic_years ay
    ON ay.year = 2026 AND ay.semester = '2'
JOIN users u ON u.email = CASE
    WHEN s.code = 'ENGINF-BD'
        THEN 'docente.basedados@sgpduz.test'
    ELSE 'docente.programacao@sgpduz.test'
END
WHERE c.code = 'ENG-INF'
AND NOT EXISTS (
    SELECT 1
    FROM analytical_plans ap
    WHERE ap.subject_id = s.id
      AND ap.academic_year_id = ay.id
);

-- ------------------------------------------
-- 7.13 UNIDADES TEMÁTICAS
-- ------------------------------------------

INSERT INTO topic_units (
    analytical_plan_id,
    title,
    description,
    planned_hours,
    lesson_type,
    sequence_order
)
SELECT
    ap.id,
    seed.title,
    seed.description,
    seed.planned_hours,
    seed.lesson_type,
    seed.sequence_order
FROM analytical_plans ap
JOIN subjects s ON s.id = ap.subject_id
JOIN (
    SELECT 1 AS sequence_order,
           'Introducao a unidade curricular' AS title,
           'Apresentacao dos objectivos e conceitos fundamentais.' AS description,
           4 AS planned_hours,
           'TEORICA' AS lesson_type,
           'ENGINF-POO' AS subject_code
    UNION ALL
    SELECT 2, 'Fundamentos da programacao',
           'Variaveis, tipos de dados e estruturas de controlo.',
           8, 'PRATICA', 'ENGINF-POO'
    UNION ALL
    SELECT 3, 'Programacao orientada a objectos',
           'Classes, objectos, heranca e encapsulamento.',
           8, 'LABORATORIAL', 'ENGINF-POO'
    UNION ALL
    SELECT 1, 'Introducao as bases de dados',
           'Conceitos, sistemas de gestao e modelos de dados.',
           4, 'TEORICA', 'ENGINF-BD'
    UNION ALL
    SELECT 2, 'Modelo relacional',
           'Tabelas, chaves e integridade referencial.',
           8, 'PRATICA', 'ENGINF-BD'
    UNION ALL
    SELECT 3, 'SQL e consultas',
           'Criacao de tabelas, consultas e relacionamentos.',
           8, 'LABORATORIAL', 'ENGINF-BD'
    UNION ALL
    SELECT 1, 'Fundamentos de engenharia de software',
           'Processos, requisitos e ciclo de desenvolvimento.',
           4, 'TEORICA', 'ENGINF-ES'
    UNION ALL
    SELECT 2, 'Levantamento de requisitos',
           'Requisitos funcionais e nao funcionais.',
           8, 'PRATICA', 'ENGINF-ES'
    UNION ALL
    SELECT 3, 'Modelacao de sistemas',
           'Modelacao e documentacao de sistemas de software.',
           8, 'LABORATORIAL', 'ENGINF-ES'
) seed ON seed.subject_code = s.code
WHERE NOT EXISTS (
    SELECT 1
    FROM topic_units tu
    WHERE tu.analytical_plan_id = ap.id
      AND tu.sequence_order = seed.sequence_order
);

-- ------------------------------------------
-- 7.14 DOSIFICAÇÕES SEMANAIS
-- ------------------------------------------

INSERT INTO weekly_dosifications (
    analytical_plan_id,
    topic_unit_id,
    week_number,
    is_evaluation_week,
    is_confirmed_by_teacher,
    custom_notes
)
SELECT
    tu.analytical_plan_id,
    tu.id,
    tu.sequence_order,
    FALSE,
    tu.sequence_order = 1,
    'Dosificacao inicial de demonstracao'
FROM topic_units tu
WHERE NOT EXISTS (
    SELECT 1
    FROM weekly_dosifications wd
    WHERE wd.analytical_plan_id = tu.analytical_plan_id
      AND wd.topic_unit_id = tu.id
      AND wd.week_number = tu.sequence_order
);

-- ------------------------------------------
-- 7.15 AULAS
-- ------------------------------------------

-- Aula registada.
INSERT INTO lessons (
    class_subject_teacher_id,
    topic_unit_id,
    lesson_date,
    status,
    is_cancelled,
    content_taught
)
SELECT
    cst.id,
    tu.id,
    '2026-09-08',
    'REGISTADA',
    FALSE,
    'Introducao e apresentacao dos conceitos fundamentais.'
FROM class_subject_teachers cst
JOIN subjects s ON s.id = cst.subject_id
JOIN analytical_plans ap ON ap.subject_id = s.id
JOIN academic_years ay ON ay.id = ap.academic_year_id
JOIN topic_units tu ON tu.analytical_plan_id = ap.id
WHERE s.code = 'ENGINF-POO'
  AND tu.sequence_order = 1
  AND ay.year = 2026 AND ay.semester = '2'
  AND NOT EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.class_subject_teacher_id = cst.id
        AND l.lesson_date = '2026-09-08'
  );

-- Aula confirmada.
INSERT INTO lessons (
    class_subject_teacher_id,
    topic_unit_id,
    lesson_date,
    status,
    is_cancelled,
    content_taught
)
SELECT
    cst.id,
    tu.id,
    '2026-09-10',
    'CONFIRMADA',
    FALSE,
    'Aula realizada: conceitos introdutorios.'
FROM class_subject_teachers cst
JOIN subjects s ON s.id = cst.subject_id
JOIN analytical_plans ap ON ap.subject_id = s.id
JOIN topic_units tu ON tu.analytical_plan_id = ap.id
WHERE s.code = 'ENGINF-POO'
  AND tu.sequence_order = 1
  AND NOT EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.class_subject_teacher_id = cst.id
        AND l.lesson_date = '2026-09-10'
  );

-- Aula confirmada com ressalva.
INSERT INTO lessons (
    class_subject_teacher_id,
    topic_unit_id,
    lesson_date,
    status,
    is_cancelled,
    content_taught
)
SELECT
    cst.id,
    tu.id,
    '2026-09-15',
    'CONFIRMADA_COM_RESSALVA',
    FALSE,
    'Aula realizada parcialmente.'
FROM class_subject_teachers cst
JOIN subjects s ON s.id = cst.subject_id
JOIN analytical_plans ap ON ap.subject_id = s.id
JOIN topic_units tu ON tu.analytical_plan_id = ap.id
WHERE s.code = 'ENGINF-BD'
  AND tu.sequence_order = 1
  AND NOT EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.class_subject_teacher_id = cst.id
        AND l.lesson_date = '2026-09-15'
  );

-- Aula em disputa.
INSERT INTO lessons (
    class_subject_teacher_id,
    topic_unit_id,
    lesson_date,
    status,
    is_cancelled,
    content_taught
)
SELECT
    cst.id,
    tu.id,
    '2026-09-17',
    'EM_DISPUTA',
    FALSE,
    'Aula aguardando resolucao da divergencia.'
FROM class_subject_teachers cst
JOIN subjects s ON s.id = cst.subject_id
JOIN analytical_plans ap ON ap.subject_id = s.id
JOIN topic_units tu ON tu.analytical_plan_id = ap.id
WHERE s.code = 'ENGINF-BD'
  AND tu.sequence_order = 1
  AND NOT EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.class_subject_teacher_id = cst.id
        AND l.lesson_date = '2026-09-17'
  );

-- Aula resolvida.
INSERT INTO lessons (
    class_subject_teacher_id,
    topic_unit_id,
    lesson_date,
    status,
    is_cancelled,
    content_taught
)
SELECT
    cst.id,
    tu.id,
    '2026-09-22',
    'RESOLVIDA',
    FALSE,
    'Divergencia resolvida apos verificacao.'
FROM class_subject_teachers cst
JOIN subjects s ON s.id = cst.subject_id
JOIN analytical_plans ap ON ap.subject_id = s.id
JOIN topic_units tu ON tu.analytical_plan_id = ap.id
WHERE s.code = 'ENGINF-POO'
  AND tu.sequence_order = 2
  AND NOT EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.class_subject_teacher_id = cst.id
        AND l.lesson_date = '2026-09-22'
  );

-- Aula pendente prolongada.
INSERT INTO lessons (
    class_subject_teacher_id,
    topic_unit_id,
    lesson_date,
    status,
    is_cancelled,
    cancellation_reason,
    content_taught
)
SELECT
    cst.id,
    tu.id,
    '2026-09-24',
    'PENDENTE_PROLONGADA',
    TRUE,
    'Aula cancelada para demonstracao do fluxo.',
    NULL
FROM class_subject_teachers cst
JOIN subjects s ON s.id = cst.subject_id
JOIN analytical_plans ap ON ap.subject_id = s.id
JOIN topic_units tu ON tu.analytical_plan_id = ap.id
WHERE s.code = 'ENGINF-BD'
  AND tu.sequence_order = 2
  AND NOT EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.class_subject_teacher_id = cst.id
        AND l.lesson_date = '2026-09-24'
  );

-- ------------------------------------------
-- 7.16 CONFIRMAÇÕES DAS AULAS
-- ------------------------------------------

-- O chefe confirma a aula de 10 de Setembro.
INSERT INTO lesson_confirmations (
    lesson_id,
    user_id,
    status_given,
    remarks
)
SELECT
    l.id,
    u.id,
    'CONFIRMADA',
    'Confirmacao de demonstracao pelo chefe da turma.'
FROM lessons l
JOIN class_subject_teachers cst
    ON cst.id = l.class_subject_teacher_id
JOIN subjects s ON s.id = cst.subject_id
JOIN users u ON u.email = 'chefe.turma@sgpduz.test'
WHERE s.code = 'ENGINF-POO'
  AND l.lesson_date = '2026-09-10'
  AND NOT EXISTS (
      SELECT 1
      FROM lesson_confirmations lc
      WHERE lc.lesson_id = l.id AND lc.user_id = u.id
  );

-- O subchefe confirma a mesma aula.
INSERT INTO lesson_confirmations (
    lesson_id,
    user_id,
    status_given,
    remarks
)
SELECT
    l.id,
    u.id,
    'CONFIRMADA',
    'Confirmacao de demonstracao pelo subchefe da turma.'
FROM lessons l
JOIN class_subject_teachers cst
    ON cst.id = l.class_subject_teacher_id
JOIN subjects s ON s.id = cst.subject_id
JOIN users u ON u.email = 'subchefe.turma@sgpduz.test'
WHERE s.code = 'ENGINF-POO'
  AND l.lesson_date = '2026-09-10'
  AND NOT EXISTS (
      SELECT 1
      FROM lesson_confirmations lc
      WHERE lc.lesson_id = l.id AND lc.user_id = u.id
  );

-- ------------------------------------------
-- 7.17 AVALIAÇÕES
-- ------------------------------------------

INSERT INTO assessments (
    class_subject_teacher_id,
    title,
    assessment_date,
    results_published_date,
    deadline_date,
    status
)
SELECT
    cst.id,
    seed.title,
    seed.assessment_date,
    seed.results_published_date,
    seed.deadline_date,
    seed.status
FROM class_subject_teachers cst
JOIN subjects s ON s.id = cst.subject_id
JOIN (
    SELECT
        'ENGINF-POO' AS subject_code,
        'Teste 1 - Programacao' AS title,
        CAST('2026-09-14' AS DATE) AS assessment_date,
        CAST('2026-09-20' AS DATE) AS results_published_date,
        CAST('2026-09-24' AS DATE) AS deadline_date,
        'DENTRO_DO_PRAZO' AS status
    UNION ALL
    SELECT
        'ENGINF-BD',
        'Teste 1 - Bases de Dados',
        '2026-09-16',
        '2026-09-29',
        '2026-09-26',
        'FORA_DO_PRAZO'
    UNION ALL
    SELECT
        'ENGINF-ES',
        'Trabalho Pratico - Engenharia de Software',
        '2026-10-20',
        NULL,
        '2026-10-30',
        'PENDENTE'
) seed ON seed.subject_code = s.code
WHERE NOT EXISTS (
    SELECT 1
    FROM assessments a
    WHERE a.class_subject_teacher_id = cst.id
      AND a.title = seed.title
);

-- ------------------------------------------
-- 7.18 PAUTAS FINAIS
-- ------------------------------------------

INSERT INTO final_grade_sheets (
    class_subject_teacher_id,
    epoch,
    file_url,
    uploaded_by
)
SELECT
    cst.id,
    'NORMAL',
    CONCAT('/uploads/pautas/demo-', s.code, '-2026.pdf'),
    u.id
FROM class_subject_teachers cst
JOIN subjects s ON s.id = cst.subject_id
JOIN users u ON u.email = CASE
    WHEN s.code = 'ENGINF-BD'
        THEN 'docente.basedados@sgpduz.test'
    ELSE 'docente.programacao@sgpduz.test'
END
WHERE s.code IN ('ENGINF-POO', 'ENGINF-BD')
AND NOT EXISTS (
    SELECT 1
    FROM final_grade_sheets fs
    WHERE fs.class_subject_teacher_id = cst.id
      AND fs.epoch = 'NORMAL'
);

-- ------------------------------------------
-- 7.19 ACTIVIDADES AD-HOC
-- ------------------------------------------

-- Actividade pendente.
INSERT INTO adhoc_tasks (
    title,
    description,
    assigned_by,
    assigned_to,
    deadline,
    status
)
SELECT
    'Preparar materiais da unidade curricular',
    'Organizar os materiais pedagogicos do semestre.',
    chefe.id,
    docente.id,
    '2026-11-15 23:59:00',
    'PENDENTE'
FROM users chefe
JOIN users docente
    ON docente.email = 'docente.programacao@sgpduz.test'
WHERE chefe.email = 'chefe.curso@sgpduz.test'
AND NOT EXISTS (
    SELECT 1
    FROM adhoc_tasks t
    WHERE t.title = 'Preparar materiais da unidade curricular'
      AND t.assigned_to = docente.id
);

-- Actividade entregue.
INSERT INTO adhoc_tasks (
    title,
    description,
    assigned_by,
    assigned_to,
    deadline,
    status
)
SELECT
    'Actualizar plano analitico',
    'Rever os conteudos e a sequencia das unidades tematicas.',
    chefe.id,
    docente.id,
    '2026-10-25 23:59:00',
    'ENTREGUE'
FROM users chefe
JOIN users docente
    ON docente.email = 'docente.basedados@sgpduz.test'
WHERE chefe.email = 'chefe.departamento@sgpduz.test'
AND NOT EXISTS (
    SELECT 1
    FROM adhoc_tasks t
    WHERE t.title = 'Actualizar plano analitico'
      AND t.assigned_to = docente.id
);

-- Actividade verificada.
INSERT INTO adhoc_tasks (
    title,
    description,
    assigned_by,
    assigned_to,
    deadline,
    status
)
SELECT
    'Preparar relatorio pedagogico',
    'Preparar um resumo do acompanhamento pedagogico.',
    chefe.id,
    docente.id,
    '2026-10-10 23:59:00',
    'VERIFICADA'
FROM users chefe
JOIN users docente
    ON docente.email = 'docente.programacao@sgpduz.test'
WHERE chefe.email = 'chefe.curso@sgpduz.test'
AND NOT EXISTS (
    SELECT 1
    FROM adhoc_tasks t
    WHERE t.title = 'Preparar relatorio pedagogico'
      AND t.assigned_to = docente.id
);

-- Actividade atrasada.
INSERT INTO adhoc_tasks (
    title,
    description,
    assigned_by,
    assigned_to,
    deadline,
    status
)
SELECT
    'Entregar documentacao pedagogica',
    'Actividade de demonstracao com prazo ultrapassado.',
    chefe.id,
    docente.id,
    '2026-09-30 23:59:00',
    'ATRASADA'
FROM users chefe
JOIN users docente
    ON docente.email = 'docente.basedados@sgpduz.test'
WHERE chefe.email = 'chefe.departamento@sgpduz.test'
AND NOT EXISTS (
    SELECT 1
    FROM adhoc_tasks t
    WHERE t.title = 'Entregar documentacao pedagogica'
      AND t.assigned_to = docente.id
);

-- ------------------------------------------
-- 7.20 SUBMISSÕES DAS ACTIVIDADES
-- ------------------------------------------

-- Submissão pendente de verificação.
INSERT INTO task_submissions (
    task_id,
    proof_file_url,
    notes,
    is_approved,
    feedback
)
SELECT
    t.id,
    '/uploads/comprovativos/plano-analitico-demo.pdf',
    'Plano analitico actualizado para revisao.',
    NULL,
    NULL
FROM adhoc_tasks t
WHERE t.title = 'Actualizar plano analitico'
AND NOT EXISTS (
    SELECT 1
    FROM task_submissions ts
    WHERE ts.task_id = t.id
);

-- Submissão aprovada.
INSERT INTO task_submissions (
    task_id,
    proof_file_url,
    notes,
    is_approved,
    feedback
)
SELECT
    t.id,
    '/uploads/comprovativos/relatorio-pedagogico-demo.pdf',
    'Relatorio submetido para verificacao.',
    TRUE,
    'Actividade verificada com sucesso.'
FROM adhoc_tasks t
WHERE t.title = 'Preparar relatorio pedagogico'
AND NOT EXISTS (
    SELECT 1
    FROM task_submissions ts
    WHERE ts.task_id = t.id
);

-- ==========================================
-- FIM DOS DADOS DE DEMONSTRAÇÃO
-- ==========================================
