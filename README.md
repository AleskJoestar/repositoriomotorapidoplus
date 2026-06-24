# MotoRapido PLUS

Sistema web de gestão operacional para oficinas de motocicletas de pequeno e médio porte. Centraliza estoque de peças, cadastro de funcionários, controle de acessos, vendas no balcão (PDV) e relatórios gerenciais em uma única aplicação.

**Missão:** organizar inventário, registrar movimentações, apoiar vendas no caixa e fornecer dados confiáveis para reposição de peças e gestão de equipe — com segurança, auditoria e controle de permissões por perfil de usuário.

---

## Tecnologias

### Backend

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Linguagem | TypeScript |
| ORM | Prisma 5 |
| Banco de dados | SQLite |
| Validação | Zod |
| Autenticação | JWT + bcryptjs |
| Relatórios | PDFKit, ExcelJS |
| Segurança | Helmet, CORS |

### Frontend

| Camada | Tecnologia |
|--------|------------|
| Framework | React 18 |
| Build | Vite 5 |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Formulários | React Hook Form + Zod |
| HTTP | Axios |
| Roteamento | React Router v6 |

---

## Funcionalidades

Estado atual do sistema após auditoria funcional (backend + frontend).

### Autenticação e sessão

- Login com e-mail e senha (`POST /api/auth/login`)
- JWT de acesso (padrão: 2h) e refresh token (padrão: 7d)
- Mensagem genérica de erro em falha de login (anti-enumeração)
- Senhas armazenadas com bcrypt (10 rounds)
- **Sem auto-cadastro público** — rota `/register` redireciona para `/login`
- Usuários criados exclusivamente pelo perfil Master (RF14)

### Funcionários

- CRUD completo com validação de CPF, idade mínima (18 anos) e duplicidade
- Vínculo com departamento e cargo ativos
- Exclusão inteligente: lógica se houver histórico de auditoria ou usuário vinculado; física caso contrário
- Reativação de funcionários inativos
- Relatório com filtros (cargo, departamento, status, período de admissão) — **PDF e XLSX**
- Log de auditoria em create/update/delete (backend)

### Peças e estoque

- Cadastro com código automático (`P-000001`, …), categoria, fabricante, quantidade e estoque mínimo (≥ 1)
- Edição com trilha de auditoria (`PartAuditLog`) — data, hora e usuário
- Exclusão por inativação (soft delete)
- Movimentações de estoque registradas (entrada, saída, venda, estorno)
- Filtros: categoria, fabricante, status, alerta de estoque baixo
- Relatório — **PDF e XLSX** (somente Master)
- Usuários COMUM visualizam estoque; CRUD restrito ao Master

### Departamentos e cargos

- CRUD de departamentos com cargos (posições) aninhados
- Inativação em cascata (departamento + cargos)
- Reativação de departamentos e cargos

### Cadastros auxiliares

- **Fabricantes:** CRUD, inativação/reativação, relatório **PDF e XML**
- **Categorias:** CRUD, inativação/reativação, relatório **PDF e XML**

### Usuários e acessos

- Gestão exclusiva do Master: criar, listar, inativar e reativar usuários
- Tipos de acesso: `MASTER` (administrador) e `COMUM` (operador de caixa)
- Vínculo opcional 1:1 com funcionário ativo
- Usuário Master semente imortal (`isMasterSeed`) — não pode ser inativado
- Relatório — **PDF e XML**

### Vendas / PDV (Caixa)

- Carrinho de venda aberto por usuário
- Adição de peças ativas com débito imediato no estoque
- Remoção de item: operador COMUM exige credenciais de Master
- Checkout com formas de pagamento: PIX, Dinheiro, Débito, Crédito
- Cálculo de troco para pagamento em dinheiro
- Relatório de vendas finalizadas com filtros de data/hora — **PDF e XML** (somente Master)

### Controle de acesso (frontend)

| Perfil | Acesso |
|--------|--------|
| **MASTER** | Dashboard, todos os módulos, relatórios, CRUD de peças, PDV |
| **COMUM** | PDV (`/sales`) e consulta de estoque (`/parts`) |

Após login: Master → `/dashboard` | Comum → `/sales`

---

## Regras de negócio implementadas

- Validação dupla: frontend (Zod + React Hook Form) e backend (Zod)
- Funcionários: exclusão lógica vs física conforme histórico e vínculo com usuário
- Peças, fabricantes, categorias, departamentos e usuários: apenas inativação (sem exclusão física)
- Estoque mínimo de peça: valor inteiro ≥ 1
- Auditoria obrigatória em alterações de peças
- Alerta de estoque baixo: quantidade ≤ 5 (limiar fixo no sistema)
- Secrets em `.env` — nunca versionados

---

## Arquitetura

```
Frontend (React/Vite :5173)
        │
        ▼  HTTP + Bearer JWT
Backend (Express :3000)
        │
        ▼  Prisma ORM
SQLite (dev.db)
```

**API base:** `http://localhost:3000/api`  
**Health check:** `GET http://localhost:3000/health`

---

## MANUAL DE INSTALAÇÃO

### 1. Pré-requisitos

| Requisito | Versão mínima |
|-----------|---------------|
| Node.js | 18.x LTS |
| npm | 9.x |
| Git | qualquer versão recente |

Banco de dados: **SQLite** (embutido — não requer instalação separada). O arquivo é criado automaticamente via Prisma a partir de `DATABASE_URL`.

### 2. Clonar o repositório

```bash
git clone https://github.com/AleskJoestar/repositoriomotorapidoplus.git
cd repositoriomotorapidoplus
```

### 3. Instalar dependências

**Backend (raiz do projeto):**

```bash
npm install
```

**Frontend:**

```bash
cd frontend
npm install
cd ..
```

### 4. Configurar variáveis de ambiente

Copie o template na raiz do projeto:

```bash
# Linux / macOS / Git Bash
cp .env.example .env
```

```powershell
# Windows (PowerShell)
Copy-Item .env.example .env
```

Edite o arquivo `.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRATION=2h
REFRESH_TOKEN_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development
```

> **Produção:** altere `JWT_SECRET` para um valor aleatório com no mínimo 32 caracteres.

### 5. Sincronizar o banco de dados

Na raiz do projeto, execute em sequência:

```bash
# Opção A — migrations (recomendado para desenvolvimento com histórico)
npm run prisma:migrate

# Opção B — push direto do schema (alternativa rápida)
npx prisma db push

# Gerar client Prisma
npm run prisma:generate

# Criar usuário Master semente (RF13)
npm run prisma:seed
```

O seed cria/atualiza o usuário administrador padrão do sistema.

### 6. Inicializar a aplicação

Abra **dois terminais**.

**Terminal 1 — Backend:**

```bash
npm run dev
```

Servidor disponível em `http://localhost:3000`.

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

### 7. Acesso inicial

1. Acesse `http://localhost:5173/login`
2. Utilize as credenciais do **Usuário Master Semente**:

| Campo | Valor |
|-------|-------|
| E-mail | `master@motorplus.com` |
| Senha | `usermaster#@` |

3. Após login, o Master é redirecionado para o Dashboard (`/dashboard`)
4. A partir do Dashboard, acesse os módulos: Funcionários, Peças, PDV, Departamentos, Fabricantes, Categorias e Usuários

> Crie usuários COMUM pelo módulo **Usuários** para operadores de caixa. Usuários COMUM acessam diretamente o PDV após login.

---

## Scripts úteis

### Backend (raiz)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor em modo desenvolvimento |
| `npm run build` | Compila TypeScript → `dist/` |
| `npm run start` | Executa build de produção |
| `npm run prisma:migrate` | Aplica migrations |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:seed` | Executa seed (Master semente) |
| `npm run prisma:studio` | Interface visual do banco |

### Frontend (`frontend/`)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor Vite (porta 5173) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview da build |

---

## Estrutura do projeto

```
repositoriomotorapidoplus/
├── src/                    # Backend Express + TypeScript
│   ├── controllers/
│   ├── services/
│   ├── routes/             # auth, employees, parts, sales, users, ...
│   ├── middleware/
│   ├── schemas/
│   └── index.ts
├── frontend/               # Frontend React + Vite
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── context/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── specs/
│   └── specs.md            # Especificação técnica (RF01–RF10)
├── .env.example
├── AGENTS.md
└── README.md
```

---

## Documentação complementar

| Arquivo | Conteúdo |
|---------|----------|
| [specs/specs.md](specs/specs.md) | Requisitos funcionais detalhados |
| [AGENTS.md](AGENTS.md) | Instruções de desenvolvimento e status dos módulos |

---

## Solução de problemas

**Porta 3000 em uso:**

```bash
# Windows
netstat -ano | findstr :3000

# Linux / macOS
lsof -i :3000
```

Alternativa: defina `PORT=3001` no `.env`.

**Frontend não conecta ao backend:** confirme que o backend está rodando em `http://localhost:3000` e que o endpoint `/health` responde.

**Erro de banco / schema desatualizado:**

```bash
npx prisma db push
npm run prisma:generate
npm run prisma:seed
```

---

**Desenvolvido por Alessandro Diniz Loss**

Repositório: https://github.com/AleskJoestar/repositoriomotorapidoplus
