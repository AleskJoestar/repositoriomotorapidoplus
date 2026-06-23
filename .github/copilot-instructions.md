# MotoRapido PLUS — Instruções Globais

> Migrado para Cursor Composer. Ver também `AGENTS.md` e `.cursor/agents/`.

## Projeto

Sistema web de peças para oficinas de motocicletas. Spec: `specs/specs.md`.

## Workflow

Analisar → Quebrar → Desenvolver → Revisar → Fim

## Subagentes Cursor (`.cursor/agents/`)

| Subagente | Quando |
|-----------|--------|
| `/orquestrador` | Coordenação e delegação |
| `/analista` | Regras de negócio e produto |
| `/scrum` | Sprint e backlog |
| `/frontend` | UI e formulários |
| `/backend` | API e banco |

## Regras globais

- Senhas: `bcrypt`
- Login: erro genérico
- Exclusão com histórico → lógica
- Validação frontend + backend
- Auditoria em edição de peças
- Relatórios PDF + XLSX
- Secrets em `.env`

## Status

RF01-RF06 ✅ | RF07-RF10 🚀 próximo
