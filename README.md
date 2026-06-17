# 🏍️ MotoRapido PLUS

## Descrição do Projeto

Sistema web moderno e eficiente de **controle e gerenciamento de peças** para oficinas de motocicletas de pequeno e médio porte. Desenvolvido com as melhores práticas de segurança, performance e user experience, o MotoRapido PLUS oferece uma solução completa para organizar o inventário, autenticar usuários e gerenciar operações diárias de uma oficina.

## 🎯 Objetivo da Aplicação

O MotoRapido PLUS foi desenvolvido com o objetivo de:

- ✅ **Simplificar o gerenciamento**: Centralizar todas as informações de peças, funcionários e clientes em um único sistema
- ✅ **Aumentar a eficiência**: Reduzir tempo operacional e minimizar erros manuais
- ✅ **Garantir segurança**: Implementar autenticação robusta e controle de acesso
- ✅ **Melhorar a organização**: Proporcionar relatórios e ferramentas de análise de dados
- ✅ **Escalar o negócio**: Fornecer uma base sólida para expansão futura

**Status:** ✅ Módulo 1 (Autenticação) — Pronto para Produção  
**Qualidade:** ⭐⭐⭐⭐⭐ (5/5)  
**Última Atualização:** 17 de junho de 2026

## 👥 Equipe

| Integrante |
|-----------|
| **Alessandro Diniz Loss** |

---

## 📋 Sumário

- [Características](#características)
- [Tech Stack](#tech-stack)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Rodar](#como-rodar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Próximos Módulos](#próximos-módulos)
- [Suporte](#suporte)

---

## 🎯 Características

### Módulo 1: Autenticação (Implementado ✅)

- ✅ **Cadastro de Usuário** (RF01)
  - Validação em tempo real
  - Email e senha seguros
  - Verificação de duplicidade

- ✅ **Login** (RF02)
  - Autenticação com JWT (2h de expiração)
  - Refresh token (7 dias)
  - Mensagens genéricas de erro (anti-enumeração)

- ✅ **Segurança**
  - Criptografia bcryptjs (10 rounds)
  - JWT com Bearer token
  - CORS e Helmet configurados
  - Variáveis de ambiente protegidas

### Módulo 2: Gerenciamento de Funcionários (Implementado ✅)

- ✅ **Cadastrar Funcionário** (RF03)
  - Formulário com 3 seções (Dados Pessoais, Profissionais, Contato)
  - Validação de CPF (formato e duplicidade)
  - Validação de email, telefone, datas
  - Status padrão: Ativo

- ✅ **Editar Funcionário** (RF04)
  - Atualização de dados (CPF desabilitado)
  - Validação de duplicidade de email/CPF
  - Log de auditoria com usuário e timestamp
  - Partial update suportado

- ✅ **Excluir Funcionário** (RF05)
  - Exclusão lógica (Status = Inativo)
  - Histórico preservado
  - Modal de confirmação
  - Dados não reutilizáveis enquanto inativo

- ✅ **Relatório de Funcionários** (RF06)
  - Filtros: Cargo, Departamento, Status, Período
  - Exportação em PDF e XLSX
  - Layout profissional com cabeçalho e rodapé
  - Sumário estatístico

### Próximos Módulos

- 🚀 Módulo 3: Gerenciamento de Peças/Estoque (RF07-RF10)

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Linguagem:** TypeScript (Strict Mode)
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma
- **Validação:** Zod
- **Autenticação:** JWT + Bcryptjs
- **Segurança:** Helmet, CORS

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Linguagem:** TypeScript (Strict Mode)
- **Formulários:** React Hook Form
- **Validação:** Zod
- **Estilo:** Tailwind CSS
- **Cliente HTTP:** Axios
- **Roteamento:** React Router v6

### DevOps
- **Versionamento:** Git
- **Repositório:** GitHub
- **Agents:** GitHub Copilot (customizados)

---

## 📦 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Git

**Versões Testadas:**
```
Node.js: 18.x LTS
npm: 9.x+
```

---

## 💾 Instalação

### 1. Clonar Repositório

```bash
git clone https://github.com/AleskJoestar/repositoriomotorapidoplus.git
cd repositoriomotorapidoplus
```

### 2. Instalar Dependências Backend

```bash
npm install
```

### 3. Instalar Dependências Frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite `.env` com suas variáveis:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=seu-secret-aqui-min-32-chars
JWT_EXPIRATION=2h
REFRESH_TOKEN_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development
```

### 5. Executar Migrations

```bash
npm run prisma:migrate
```

---

## 🚀 Como Rodar

### Backend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm run start
```

**Servidor disponível em:** `http://localhost:3000`

**Health Check:** `GET http://localhost:3000/health`

### Frontend

```bash
# Abrir novo terminal
cd frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

**Aplicação disponível em:** `http://localhost:5173`

---

## 📁 Estrutura do Projeto

```
repositoriomotorapidoplus/
│
├── src/                          # Backend (Node.js + Express)
│   ├── controllers/
│   │   └── authController.ts     # Handlers HTTP de autenticação
│   ├── services/
│   │   └── authService.ts        # Lógica de negócio
│   ├── middleware/
│   │   └── auth.ts               # Middleware JWT
│   ├── routes/
│   │   └── auth.ts               # Rotas de autenticação
│   ├── schemas/
│   │   └── authSchema.ts         # Validação Zod
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   └── index.ts                  # Express app
│
├── frontend/                     # Frontend (React 18)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Register.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── components/
│   │   │   ├── FormInput.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── Toast.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── authService.ts
│   │   ├── schemas/
│   │   │   └── authSchema.ts
│   │   ├── types/
│   │   │   └── auth.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── prisma/                       # Database
│   ├── schema.prisma             # ORM schema
│   └── migrations/               # Migrations automáticas
│
├── .github/
│   ├── agents/                   # Agentes customizados
│   │   ├── orquestrador.agent.md
│   │   ├── analista.agent.md
│   │   ├── frontend.agent.md
│   │   ├── backend.agent.md
│   │   └── scrum.agent.md
│   └── copilot-instructions.md
│
├── specs/
│   └── specs.md                  # Especificação técnica
│
├── .env                          # Variáveis de ambiente (não versionar)
├── .env.example                  # Template de variáveis
├── .gitignore                    # Proteção de secrets
├── package.json                  # Dependências backend
├── tsconfig.json                 # TypeScript config
│
├── README.md                     # Este arquivo
├── ENTREGA_FINAL.md              # Documentação de entrega
├── CHECKLIST_TECNICO.md          # Guia técnico
├── SPRINT_PLANNING.md            # Histórias de usuário
└── package-lock.json             # Dependências lockadas
```

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [specs/specs.md](specs/specs.md) | Especificação técnica completa do projeto |
| [ENTREGA_FINAL.md](ENTREGA_FINAL.md) | Resumo executivo da entrega do Módulo 1 |
| [CHECKLIST_TECNICO.md](CHECKLIST_TECNICO.md) | Guia técnico passo-a-passo de implementação |
| [SPRINT_PLANNING.md](SPRINT_PLANNING.md) | Histórias de usuário e planning |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Instruções globais para desenvolvimento |

---

## 🧪 Testando a Aplicação

### Fluxo Completo: Register → Login → Dashboard

#### 1. Cadastro (Register)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta (201):**
```json
{
  "message": "Usuário registrado com sucesso"
}
```

#### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "2h"
}
```

#### 3. Acessar Dashboard

No frontend, após login:
- ✅ Token é armazenado em `localStorage`
- ✅ Usuário é redirecionado para `/dashboard`
- ✅ Dashboard exibe dados do usuário

### Testes Manuais (Postman/Insomnia)

Cenários de teste documentados em [CHECKLIST_TECNICO.md](CHECKLIST_TECNICO.md#fase-3-testes--refinamento)

---

## 🔒 Segurança

### Implementado

- ✅ Criptografia de senha com bcryptjs (10 rounds)
- ✅ JWT com 2 horas de expiração
- ✅ Refresh token com 7 dias de expiração
- ✅ Middleware de autenticação
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Mensagens de erro genéricas (anti-enumeração)
- ✅ Variáveis de ambiente em `.env` (não versionadas)

### Recomendações de Produção

- [ ] Alterar `JWT_SECRET` para valor aleatório (32+ chars)
- [ ] Migrar tokens de localStorage para sessionStorage/cookies HttpOnly
- [ ] Implementar rate limiting em endpoints de auth
- [ ] Configurar HTTPS
- [ ] Configurar CORS para domínios específicos
- [ ] Setup de backup automático do banco de dados
- [ ] Monitoramento e logs de acesso

Ver [ENTREGA_FINAL.md](ENTREGA_FINAL.md#checklist-pré-produção) para checklist completo.

---

## 🚀 Próximos Módulos

### Módulo 3: Gerenciamento de Peças/Estoque (RF07-RF10)

**Funcionalidades:**
- RF07: Cadastrar Peça (código único, categoria, quantidade, localização)
- RF08: Editar Peça (com log de auditoria)
- RF09: Excluir Peça (exclusão lógica com validação de histórico)
- RF10: Relatório de Peças (PDF/XLSX com alerta de estoque baixo)

**Características:**
- Validação de combinação única (Nome + Fabricante)
- Log de auditoria automático em edições
- Prevenção de exclusão física se houver histórico de movimentação
- Filtros: Categoria, Fabricante, Status, Alerta de Estoque Baixo
- Exportação profissional em PDF e XLSX

**Estimativa:** 45-55 Story Points | 4-5 semanas

---

## 🤝 Contribuindo

### Workflow de Desenvolvimento

Este projeto usa **5 Agentes Especializados** com metodologia estruturada:

1. **Orquestrador** — Coordena workflow
2. **Analista** — Valida regras de negócio
3. **Backend** — Cria APIs e banco de dados
4. **Frontend** — Cria interfaces e componentes
5. **Scrum** — Planeja sprints e histórias

Ver [.github/agents/](./github/agents/) para instruções de cada agente.

---

## 📞 Suporte

### Dúvidas Técnicas

Consulte:
- [specs/specs.md](specs/specs.md) — Especificação técnica
- [ENTREGA_FINAL.md](ENTREGA_FINAL.md) — Resumo técnico
- [CHECKLIST_TECNICO.md](CHECKLIST_TECNICO.md) — Guia passo-a-passo

### Problemas Comuns

**Backend não inicia:**
```bash
# Verifique se a porta 3000 está em uso
netstat -ano | findstr :3000

# Ou rode em porta diferente
PORT=3001 npm run dev
```

**Frontend não conecta ao backend:**
```bash
# Verifique CORS em src/index.ts
# Certifique-se que o backend está rodando em http://localhost:3000
```

**Erro de migrations:**
```bash
# Resete o banco de dados
npm run prisma:reset
npm run prisma:migrate
```

---

## 📝 Licença

Este projeto é privado e desenvolvido para MotoRapido PLUS.

---

## 👥 Time

- **Orquestrador** — Coordenação e planning
- **Analista** — Validação de regras
- **Backend** — APIs e banco de dados
- **Frontend** — Interfaces e UX
- **Scrum** — Organização de sprints

---

## 📊 Status do Projeto

| Módulo | Status | Qualidade | Data |
|--------|--------|-----------|------|
| Módulo 1: Autenticação | ✅ Completo | ⭐⭐⭐⭐⭐ | 17/06/2026 |
| Módulo 2: Funcionários | ✅ Completo | ⭐⭐⭐⭐⭐ | 17/06/2026 |
| Módulo 3: Peças/Estoque | 🚀 Próximo | — | — |

---

**Desenvolvido com ❤️ usando Node.js, React e TypeScript**

Para mais informações, acesse: https://github.com/AleskJoestar/repositoriomotorapidoplus
