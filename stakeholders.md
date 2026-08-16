# 👥 Project Stakeholders & Work Breakdown

## 📌 Project Overview
**EduTrack** is an autonomous education tracking and student management platform developed under the autonomous multi-agent engineering workflow.

---

## 🏛️ Core Stakeholders

### 1. Nachiket
- **Role**: Project Lead & Primary Stakeholder / Product Owner
- **Work & Responsibilities**:
  - Sets overall vision, product goals, and project requirements.
  - Final approval authority for technical specifications and system architecture.
  - Reviews milestone deliverables, production artifacts, and deployment releases.
  - Defines feature priority and business constraints.

### 2. Tejasva
- **Role**: Co-Lead & Technical Evaluator / Reviewer
- **Work & Responsibilities**:
  - Reviews architecture designs and technical specifications alongside Nachiket.
  - Validates user experience, feature completeness, and functional correctness.
  - Participates in milestone sign-offs and acceptance testing.
  - Provides feedback on roadmap progression and deployment readiness.

---

## 🤖 Autonomous Development Team & Work Scopes

| Agent Role | Title | Primary Work & Deliverables | Core Artifacts |
| :--- | :--- | :--- | :--- |
| **`@pm`** | Product Manager & Lead Architect | Requirement analysis, architectural design, creating rigorous Technical Specifications, approval coordination. | `production_artifacts/Technical_Specification.md`, `progress.md` |
| **`@engineer`** | Full-Stack Engineer | Translating approved specs into clean, scalable backend and frontend code, scaffolding project structure. | `app_build/*` |
| **`@qa`** | QA Engineer & Security Auditor | Rigorous code inspection, syntax verification, unhandled promise tracking, logic validation, vulnerability checks. | `bugs.md`, `app_build/*` fixes |
| **`@devops`** | DevOps Master | Dependency resolution, local/cloud environment configuration, server runtime management, deployment reporting. | Server runtime, deploy logs, Local URL output |

---

## 📋 RACI Matrix (Responsibility Assignment)

| Phase / Activity | Nachiket | Tejasva | `@pm` | `@engineer` | `@qa` | `@devops` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Idea & Requirements** | **A** | **C** | **R** | **I** | **I** | **I** |
| **Tech Spec Approval** | **A** | **A** | **R** | **I** | **C** | **C** |
| **Code Implementation** | **I** | **I** | **C** | **R** | **I** | **I** |
| **Quality Audit & Fixes**| **I** | **I** | **I** | **C** | **R** | **I** |
| **Build & Deployment** | **I** | **I** | **I** | **I** | **C** | **R** |
| **Final Acceptance** | **A** | **A** | **C** | **I** | **I** | **I** |

*Legend: **R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed*
