# MotoRapido PLUS — Instruções do Agent

Sistema web de peças para oficinas de motocicletas. Spec completa: `specs/specs.md`.

## Status

| Módulo | RFs | Status |
|--------|-----|--------|
| Autenticação (Login) | RF01 | ✅ |
| Funcionários | RF02-RF05 | ✅ |
| Peças/Estoque | RF06-RF09 | ✅ |
| Departamentos/Cargos | RF10 | ✅ |
| Cadastros Auxiliares | RF11-RF12 | ✅ |
| Usuários e Acessos | RF13-RF14 | ✅ |

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
- **Sem auto-cadastro público** — usuários via Master (RF14)
- Exclusão com histórico → lógica; sem histórico → física (funcionários)
- Peças/fabricantes/categorias/deptos/usuários → apenas inativar
- Estoque mínimo peça: **≥ 1**
- Validação frontend **e** backend
- Auditoria obrigatória em edição de peças
- Relatórios: PDF + XLSX (funcionários/peças) | PDF + XML (auxiliares/usuários)
- Secrets em `.env` — nunca hardcode
- Master semente: `master@motorplus.com` — imortal (RF13)

## Stack

**Backend:** Express + TypeScript + Prisma + SQLite + Zod + JWT  
**Frontend:** React 18 + Vite + Tailwind + React Hook Form + Zod + Axios

## Setup local

```bash
npx prisma db push    # ou migrate dev
npx prisma generate
npm run prisma:seed   # RF13 master
npm run dev           # backend
cd frontend && npm run dev
```

Login master: `master@motorplus.com` / `usermaster#@`
