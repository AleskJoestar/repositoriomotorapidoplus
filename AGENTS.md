# MotoRapido PLUS — Instruções do Agent

Sistema web de peças para oficinas de motocicletas. Spec completa: `specs/specs.md`.

## Status

| Módulo | RFs | Status |
|--------|-----|--------|
| Autenticação | RF01-RF02 | ✅ |
| Funcionários | RF03-RF06 | ✅ |
| Peças/Estoque | RF07-RF10 | ✅ implementado |

## Workflow

1. **Analisar** → 2. **Quebrar** → 3. **Desenvolver** → 4. **Revisar** → 5. **Fim**

Use `/orquestrador` como ponto de entrada para novas demandas.

## Subagentes (`.cursor/agents/`)

| Subagente | Quando |
|-----------|--------|
| `/orquestrador` | Coordenação, delegação, workflow |
| `/analista` | Regras de negócio, produto, escopo |
| `/scrum` | Sprint, histórias, backlog |
| `/frontend` | UI, formulários, telas |
| `/backend` | API, banco, auth, relatórios |

## Regras globais

- Senhas: `bcrypt` — nunca texto puro
- Login: erro genérico (anti-enumeração)
- Exclusão com histórico → lógica, nunca física
- Validação frontend **e** backend
- Auditoria obrigatória em edição de peças
- Relatórios: PDF + XLSX
- Secrets em `.env` — nunca hardcode

## Stack

**Backend:** Express + TypeScript + Prisma + SQLite + Zod + JWT  
**Frontend:** React 18 + Vite + Tailwind + React Hook Form + Zod + Axios

## Retomada — Módulo 3 (Peças)

Ordem sugerida:

1. Prisma: models `Part`, `PartAuditLog`, `StockMovement` (se RF09 exigir histórico)
2. Backend: CRUD RF07-RF09 + auditoria RF08 + relatório RF10
3. Frontend: telas listagem/formulário peças + filtros relatório
4. Testes manuais: cadastro → edição (log) → exclusão com/sem histórico → export PDF/XLSX

Invocar: `/orquestrador retomar Módulo 3 conforme specs/specs.md`
