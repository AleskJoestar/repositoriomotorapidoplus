# SPRINT PLANNING - MotoRapido PLUS

## SPRINT 1: Fundação - Autenticação (RF01 + RF02)

**Objetivo da Sprint:** Implementar o módulo de autenticação completo (cadastro e login com JWT) permitindo que usuários administradores se registrem e acessem o sistema de forma segura.

**Duração estimada:** 2 semanas (10 dias úteis)

**Capacidade:** 13 Story Points

---

## 📋 HISTÓRIAS DE USUÁRIO

### **H1: Setup Inicial — Infraestrutura Backend + Banco de Dados** | [BLOCKER]
**Story Points:** 5

**Como** desenvolvedor backend,  
**Quero** configurar o projeto com autenticação JWT, banco de dados e validações,  
**Para que** as histórias de RF01 e RF02 possam ser implementadas.

#### ✅ Critérios de Aceite

| Dado | Quando | Então |
|------|--------|-------|
| Projeto backend inicializado | Executo `npm install && npm run dev` | O servidor sobe em `localhost:3000` sem erros |
| Arquivo `.env` configurado | Informo `DATABASE_URL` e `JWT_SECRET` | Variáveis são lidas corretamente pela aplicação |
| Tabela `users` criada no banco | Executo migration do Prisma/TypeORM | Schema contém `id`, `name`, `email`, `password`, `createdAt`, `updatedAt` |
| Dependências JWT instaladas | Verifico `package.json` | `jsonwebtoken` e `bcrypt` estão nas dependências |
| CORS configurado | Frontend faz request para backend | Resposta inclui headers CORS apropriados |

#### 🛠️ Tarefas Técnicas

**Backend:**
- [ ] Inicializar projeto Node.js/Express (ou framework escolhido)
- [ ] Configurar variáveis de ambiente (`.env.example` e `.env`)
- [ ] Instalar dependências: `bcrypt`, `jsonwebtoken`, ORM (Prisma/TypeORM), validadores
- [ ] Configurar conexão com banco de dados (PostgreSQL/MySQL)
- [ ] Criar migration: tabela `users`
- [ ] Configurar CORS para comunicação frontend
- [ ] Criar arquivo de middleware JWT básico (stub)

**Frontend:**
- [ ] Não há tarefas nesta história (bloqueador de infra)

#### 📌 Notas
- Esta história é **bloqueadora** para as demais
- Frontend pode começar esboço de telas enquanto isso é feito
- Sem mudanças de escopo — setup padrão

---

### **H2: Cadastrar Novo Usuário (RF01)** | [Depende de H1]
**Story Points:** 5

**Como** novo administrador,  
**Quero** me registrar no sistema informando nome, email e senha,  
**Para que** possa acessar o MotoRapido PLUS como usuário autenticado.

#### ✅ Critérios de Aceite

| Dado | Quando | Então |
|------|--------|-------|
| Formulário de cadastro aberto | Preencho nome, email válido e senha com 6+ caracteres | Botão "Salvar" fica habilitado |
| Email já cadastrado no sistema | Tento registrar com email duplicado | Sistema exibe: "E-mail ou senha incorretos" (genérico) |
| Senha com menos de 6 caracteres | Digito apenas 5 caracteres | Validação em tempo real mostra erro: "Mínimo 6 caracteres" |
| Email inválido | Digito "email_invalido" | Validação em tempo real mostra: "Email inválido" |
| Todos os campos válidos | Clico "Salvar" | Usuário é criado com senha em bcrypt; redirecionado para `/login` com mensagem de sucesso |
| Usuário criado | Verifico banco de dados | Senha NÃO aparece em texto puro (apenas hash bcrypt) |
| Campos em branco | Deixo nome ou email em branco e clico "Salvar" | Mensagem de erro: "Preencha todos os campos" |

#### 🛠️ Tarefas Técnicas

**Frontend:**
- [ ] Criar componente formulário: `RegisterForm`
  - Campos: Nome, Email, Senha, Confirmar Senha
  - Validação em tempo real (email, senha min 6 chars, match senhas)
  - Botões: Salvar, Cancelar
- [ ] Integrar com API `POST /api/auth/register`
- [ ] Tratar erros genéricos da API
- [ ] Redirect para `/login` após sucesso
- [ ] Exibir toast/alert de confirmação
- [ ] Criar página `/register`

**Backend:**
- [ ] Criar rota: `POST /api/auth/register`
- [ ] Validação de entrada (name, email, password)
  - Email válido (formato)
  - Senha mínimo 6 caracteres
  - Confirmar senha matches
- [ ] Verificar duplicidade de email no banco
- [ ] Hash de senha com bcrypt (salt rounds: 10)
- [ ] Persistir usuário no banco
- [ ] Retornar resposta genérica de sucesso (sem expor dados)
- [ ] Tratar erros e retornar mensagens genéricas (anti-enumeração)

#### 📌 Notas
- Frontend e Backend podem trabalhar **em paralelo** (mock API até integração final)
- Mensagem de erro é **sempre genérica** para email duplicado (não diz "email já existe")
- Validação acontece no **frontend E backend**

---

### **H3: Autenticar Usuário — Login com JWT (RF02)** | [Depende de H1]
**Story Points:** 5

**Como** usuário registrado,  
**Quero** fazer login com email e senha,  
**Para que** acesse o sistema autenticado com sessão segura (JWT).

#### ✅ Critérios de Aceite

| Dado | Quando | Então |
|------|--------|-------|
| Formulário de login vazio | Deixo email e senha em branco e clico "Entrar" | Mensagem de erro: "Preencha todos os campos" |
| Email/senha incorretos | Digito email e senha válidos mas não cadastrados | Sistema retorna: "E-mail ou senha incorretos" (genérico) |
| Usuário registrado com dados corretos | Digito email e senha corretos | JWT é gerado; armazenado em localStorage/cookie |
| JWT gerado | Verifico token armazenado | Token contém: `payload = {id, email, iat, exp}` |
| JWT com expiração 2h | Decodifico o token | Campo `exp` = `iat + 7200 segundos` (2 horas) |
| Usuário autenticado | Sou redirecionado para `/dashboard` | Dashboard carrega corretamente |
| Token expirado | Faço request com token expirado | Recebo erro 401 "Não autorizado" |

#### 🛠️ Tarefas Técnicas

**Frontend:**
- [ ] Criar componente formulário: `LoginForm`
  - Campos: Email, Senha
  - Botão: Entrar
  - Link: "Não tem conta? Cadastre-se"
- [ ] Integrar com API `POST /api/auth/login`
- [ ] Armazenar JWT em localStorage (ou sessionStorage)
- [ ] Configurar interceptor HTTP para incluir JWT em headers (`Authorization: Bearer <token>`)
- [ ] Redirect para `/dashboard` após sucesso
- [ ] Tratamento de erro 401 (redirecionado para `/login`)
- [ ] Criar página `/login`
- [ ] Criar rota protegida: `/dashboard` (requer JWT válido)

**Backend:**
- [ ] Criar rota: `POST /api/auth/login`
- [ ] Validação de entrada (email, password)
- [ ] Buscar usuário por email no banco
- [ ] Comparar senha com bcrypt (`bcrypt.compare()`)
- [ ] Se credenciais incorretas: retornar mensagem genérica 401
- [ ] Se corretas: gerar JWT com payload `{id, email}` e `expiresIn: '2h'`
- [ ] Retornar token ao frontend
- [ ] Criar middleware de autenticação para validar JWT em rotas protegidas
- [ ] Teste: token expirado deve retornar 401

#### 📌 Notas
- Frontend e Backend trabalham **em paralelo** (mock de token até integração)
- Mensagem de erro é **sempre genérica** (não diferencia "email não existe" de "senha errada")
- Token armazenado em **localStorage** (consider httpOnly cookie em produção, mas por enquanto localStorage)
- Expiração: **2 horas** (7200 segundos)

---

### **H4: Refresh Token — Renovação de Sessão (Opcional para Sprint 1)** | [Depende de H3]
**Story Points:** 2

**Como** usuário autenticado,  
**Quero** que minha sessão seja renovada automaticamente sem fazer novo login,  
**Para que** não seja desconectado enquanto estou ativo no sistema.

#### ✅ Critérios de Aceite

| Dado | Quando | Então |
|------|--------|-------|
| Token de acesso próximo de expirar | Frontend detecta `exp - agora < 5 minutos` | Frontend faz request para `POST /api/auth/refresh` |
| Refresh token válido | Backend recebe refresh token armazenado em cookie | Novo access token é gerado com expiração 2h |
| Refresh token expirado (7 dias) | Tento usar refresh token após 8 dias | Recebo erro 401; redirecionado para `/login` |
| Novos tokens gerados | Verifico localStorage | Access token atualizado; refresh token renovado |

#### 🛠️ Tarefas Técnicas

**Frontend:**
- [ ] Configurar interceptor HTTP para detectar token próximo de expirar
- [ ] Fazer request automático `POST /api/auth/refresh` antes de expirar
- [ ] Atualizar tokens em localStorage

**Backend:**
- [ ] Criar rota: `POST /api/auth/refresh`
- [ ] Validar refresh token (verificar expiração 7 dias)
- [ ] Gerar novo access token (2h)
- [ ] Gerar novo refresh token (7 dias)
- [ ] Armazenar refresh token em banco (rastreabilidade)

#### 📌 Notas
- **Opcional para Sprint 1** — pode ser H5 em Sprint 2 se houver time constraints
- Refresh token armazenado em **httpOnly cookie** ou **localStorage** (decidir com Backend)

---

## 🎯 ORDEM DE DESENVOLVIMENTO

```
┌─────────────────────────────────────────────────────────┐
│ H1: Setup (Backend + Banco) [BLOCKER]                   │
│ Duração: 2-3 dias                                       │
│ Responsável: Backend Lead                              │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   H2: Cadastro (RF01)           H3: Login (RF02)
   Frontend + Backend            Frontend + Backend
   Duração: 3-4 dias            Duração: 3-4 dias
   Paralelo ✓                    Paralelo ✓
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
            H4: Refresh Token [Optional]
            Duração: 1-2 dias
            Responsável: Backend
```

### ⚡ Dependências

| História | Depende de | Razão |
|----------|-----------|-------|
| H2 (RF01) | H1 | Precisa de backend + tabela `users` configurados |
| H3 (RF02) | H1 | Precisa de JWT middleware e tabela `users` |
| H4 (Refresh) | H3 | Precisa de login funcional; tokens em armazenamento |

### 🚀 Paralelo Frontend/Backend

**Dias 1-3:** Backend implementa H1 (setup)

**Dias 2-4:** Frontend esboça telas de Register/Login (pode usar mock API)

**Dias 4-7:** Frontend + Backend implementam H2 e H3 **em paralelo**
- Backend: APIs `/auth/register` e `/auth/login`
- Frontend: Componentes + Integração

**Dias 8-10:** Testes, refinamentos, feedback, H4 (se tempo permitir)

---

## 📊 RESUMO DA SPRINT

| Métrica | Valor |
|---------|-------|
| Total de Story Points | 13 pts (5+5+3 core + 2 refresh) |
| Histórias | 4 (3 obrigatórias + 1 opcional) |
| Bloqueadores | 1 (H1: Setup) |
| Dias Úteis | 10 |
| Velocidade esperada | ~1.3 pts/dia |

---

## ✋ RISCOS E MITIGATION

| Risco | Impacto | Mitigation |
|-------|--------|-----------|
| Setup de banco demora mais que o previsto | Alto | Backend começa hoje mesmo; Frontend trabalha em mock |
| Integração JWT com frontend falha | Médio | Fazer teste manual de token antes de integrar |
| Email duplicado causa falha de validação | Médio | Testar duplicidade no backend; mensagem genérica |
| Token expira durante teste | Baixo | Usar refresh token ou testar com `expiresIn: '24h'` temporário |

---

## ✅ CRITÉRIO DE SUCESSO DA SPRINT

- [ ] Backend responde com JWT após login correto
- [ ] Frontend armazena JWT e o inclui em requisições
- [ ] Usuário novo consegue se registrar e fazer login
- [ ] Mensagens de erro são sempre genéricas (anti-enumeração)
- [ ] Senha é armazenada como hash bcrypt (nunca texto puro)
- [ ] Redirecionamentos funcionam: `/register` → `/login` → `/dashboard`
- [ ] Testes básicos passam (registro, login, token expiration)
