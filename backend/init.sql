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
-- 7. DADOS INICIAIS (SEEDS DE EXEMPLO)
-- ==========================================

INSERT IGNORE INTO roles (id, name) VALUES 
(1, 'ADMIN'), 
(2, 'CHEFE_DEPARTAMENTO'), 
(3, 'CHEFE_CURSO'), 
(4, 'DOCENTE'), 
(5, 'CHEFE_TURMA'), 
(6, 'SUBCHEFE_TURMA');

INSERT IGNORE INTO permissions (id, name) VALUES 
(1, 'MANAGE_USERS'), 
(2, 'CREATE_ANALYTICAL_PLAN'), 
(3, 'CONFIRM_LESSONS'), 
(4, 'ASSIGN_ADHOC_TASK'), 
(5, 'VIEW_REPORTS');

-- Admin Padrão
INSERT IGNORE INTO users (id, name, email, password, role_id) VALUES 
(1, 'Administrador do Sistema', 'admin@unizambeze.ac.mz', '$2a$12$eImiTXuWVxfM37uY4JANjOL.88T8a8B5S.Gf9/Q7C89F3tW2S0O5a', 1);