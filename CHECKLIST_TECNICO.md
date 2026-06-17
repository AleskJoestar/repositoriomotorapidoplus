# CHECKLIST TÉCNICO - Sprint 1: Autenticação

Este checklist oferece uma visão prática do que cada time deve executar e na qual ordem.

---

## FASE 1: SETUP (H1) — Backend Lead
**Duração estimada:** 2-3 dias  
**Status:** 🟡 Em Planejamento

### ✅ Infraestrutura
- [ ] Projeto Node.js inicializado com `npm init`
- [ ] Framework escolhido e instalado (Express/Fastify/NestJS)
- [ ] Dependências core instaladas:
  - [ ] `bcryptjs` (hash de senha)
  - [ ] `jsonwebtoken` (JWT)
  - [ ] `dotenv` (variáveis de ambiente)
  - [ ] `cors` (comunicação com frontend)
  - [ ] ORM escolhido (Prisma/TypeORM)
  - [ ] Validadores (zod/joi/yup)

### ✅ Banco de Dados
- [ ] Conexão com PostgreSQL/MySQL configurada
- [ ] `.env` criado com:
  - [ ] `DATABASE_URL=...`
  - [ ] `JWT_SECRET=...` (valor aleatório e seguro)
  - [ ] `PORT=3000`
- [ ] Migration criada: tabela `users`
  ```sql
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

### ✅ Middleware & Utilitários
- [ ] Middleware CORS configurado
- [ ] Função auxiliar: `hashPassword(pwd)` com bcrypt
- [ ] Função auxiliar: `comparePassword(pwd, hash)` com bcrypt
- [ ] Função auxiliar: `generateJWT(payload)` com 2h de expiração
- [ ] Função auxiliar: `verifyJWT(token)` para validação
- [ ] Middleware de autenticação: `authenticateToken(req, res, next)`

### ✅ Rota Stub (Teste)
- [ ] Rota simples: `GET /api/health` que retorna `{"status": "ok"}`

---

## FASE 2: FRONTEND + BACKEND (H2 + H3) — Paralelo
**Duração estimada:** 4-6 dias  
**Status:** 🟡 Em Planejamento

### FRONTEND: Páginas e Componentes

#### Página: `/register`
- [ ] Componente `RegisterForm` criado com:
  - [ ] Input: Nome (text)
  - [ ] Input: Email (email)
  - [ ] Input: Senha (password)
  - [ ] Input: Confirmar Senha (password)
  - [ ] Botão: Salvar
  - [ ] Botão: Cancelar (volta para `/`)
  - [ ] Link: "Já tem conta? Faça login"

#### Validações Frontend (Tempo Real)
- [ ] Email: formato válido (regex ou validator)
- [ ] Senha: mínimo 6 caracteres
- [ ] Confirmar Senha: match com Senha
- [ ] Nome: não vazio
- [ ] Feedback visual (mensagens em vermelho, campo com borda vermelha)

#### Integração Frontend: `/api/auth/register`
- [ ] Função `registerUser(name, email, password)` criada
- [ ] Request: `POST /api/auth/register`
- [ ] Body: `{ name, email, password }`
- [ ] Tratamento de erro 400 (validação)
- [ ] Tratamento de erro 409 (email duplicado) → exibir genérico
- [ ] Tratamento de erro 500
- [ ] Sucesso 201: exibir toast "Cadastro realizado! Redirecionando para login..."
- [ ] Redirect para `/login` após 2 segundos

#### Página: `/login`
- [ ] Componente `LoginForm` criado com:
  - [ ] Input: Email (email)
  - [ ] Input: Senha (password)
  - [ ] Botão: Entrar
  - [ ] Link: "Não tem conta? Cadastre-se"

#### Validações Frontend: Login (Tempo Real)
- [ ] Email: não vazio
- [ ] Senha: não vazio
- [ ] Botão desabilitado até preencher ambos

#### Integração Frontend: `/api/auth/login`
- [ ] Função `loginUser(email, password)` criada
- [ ] Request: `POST /api/auth/login`
- [ ] Body: `{ email, password }`
- [ ] Sucesso 200: recebe token JWT
- [ ] Armazenar token: `localStorage.setItem('authToken', token)`
- [ ] Configurar interceptor HTTP: adiciona header `Authorization: Bearer ${token}`
- [ ] Erro 401: exibir "E-mail ou senha incorretos"
- [ ] Redirect para `/dashboard` após sucesso

#### Página: `/dashboard`
- [ ] Layout básico criado (header + menu)
- [ ] Middleware de rota: verifica se token existe em localStorage
- [ ] Se sem token: redirect para `/login`
- [ ] Exibir: "Bem-vindo, [Nome do Usuário]"
- [ ] Botão: Logout (remove token, volta para `/login`)

---

### BACKEND: APIs

#### POST `/api/auth/register`
- [ ] Validar entrada (name, email, password, passwordConfirm)
- [ ] Verificar email inválido:
  - [ ] Regex ou validator (ex: `email@domain.com`)
  - [ ] Se inválido: retornar `400 { error: "Preencha todos os campos" }`
- [ ] Verificar senha < 6 chars:
  - [ ] Se inválido: retornar `400 { error: "Preencha todos os campos" }`
- [ ] Verificar passwordConfirm != password:
  - [ ] Se inválido: retornar `400 { error: "Preencha todos os campos" }`
- [ ] Verificar email duplicado:
  - [ ] Query: `SELECT * FROM users WHERE email = ?`
  - [ ] Se existe: retornar `409 { error: "E-mail ou senha incorretos" }` (GENÉRICO)
- [ ] Hash de senha com bcrypt (salt rounds: 10):
  - [ ] `const hashedPassword = await bcrypt.hash(password, 10)`
- [ ] Inserir usuário:
  - [ ] `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`
- [ ] Sucesso: retornar `201 { message: "Usuário registrado com sucesso" }`
- [ ] Erro de BD: retornar `500 { error: "Erro interno do servidor" }`

**Response (Sucesso):**
```json
{
  "message": "Usuário registrado com sucesso"
}
```

**Response (Erro - Email duplicado):**
```json
{
  "error": "E-mail ou senha incorretos"
}
```

#### POST `/api/auth/login`
- [ ] Validar entrada (email, password)
- [ ] Verificar email vazio:
  - [ ] Se inválido: retornar `400 { error: "Preencha todos os campos" }`
- [ ] Verificar senha vazio:
  - [ ] Se inválido: retornar `400 { error: "Preencha todos os campos" }`
- [ ] Buscar usuário por email:
  - [ ] Query: `SELECT * FROM users WHERE email = ?`
  - [ ] Se não encontra: retornar `401 { error: "E-mail ou senha incorretos" }` (GENÉRICO)
- [ ] Comparar senha com hash:
  - [ ] `const isPasswordValid = await bcrypt.compare(password, user.password)`
  - [ ] Se falha: retornar `401 { error: "E-mail ou senha incorretos" }` (GENÉRICO)
- [ ] Gerar JWT:
  - [ ] Payload: `{ id: user.id, email: user.email }`
  - [ ] Expiração: `2h` (7200 segundos)
  - [ ] `const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' })`
- [ ] Sucesso: retornar `200 { token, expiresIn: '2h' }`

**Response (Sucesso):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "2h"
}
```

**Response (Erro):**
```json
{
  "error": "E-mail ou senha incorretos"
}
```

#### GET `/api/auth/verify` (Auxiliar - Rota Protegida)
- [ ] Middleware de autenticação valida token
- [ ] Se inválido/expirado: retornar `401 { error: "Não autorizado" }`
- [ ] Se válido: retornar `200 { id, email }`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

---

## FASE 3: TESTES & REFINAMENTO
**Duração estimada:** 2-3 dias  
**Status:** 🟡 Em Planejamento

### ✅ Testes Manuais (Postman/Insomnia)
- [ ] Testar POST `/api/auth/register` com dados válidos → 201
- [ ] Testar POST `/api/auth/register` com email duplicado → 409 (genérico)
- [ ] Testar POST `/api/auth/register` com email inválido → 400
- [ ] Testar POST `/api/auth/register` com senha < 6 chars → 400
- [ ] Testar POST `/api/auth/login` com credenciais corretas → 200 + token
- [ ] Testar POST `/api/auth/login` com senha errada → 401 (genérico)
- [ ] Testar POST `/api/auth/login` com email inexistente → 401 (genérico)
- [ ] Decodificar JWT: verificar payload `{id, email}`
- [ ] Decodificar JWT: verificar expiração `2h`
- [ ] Testar GET `/api/auth/verify` com token válido → 200
- [ ] Testar GET `/api/auth/verify` com token expirado → 401
- [ ] Testar GET `/api/auth/verify` sem token → 401

### ✅ Testes Frontend End-to-End
- [ ] Fluxo completo: Register → Login → Dashboard
- [ ] Validações frontend rejeita dados inválidos
- [ ] Mensagens de erro aparecem corretamente
- [ ] Token é armazenado em localStorage
- [ ] Token é enviado em header `Authorization: Bearer ...`
- [ ] Logout remove token e redireciona para `/login`
- [ ] Página `/dashboard` redireciona para `/login` se sem token

### ✅ Segurança
- [ ] Senha **nunca** é retornada em resposta de API
- [ ] Token **não** expõe dados sensíveis (usar apenas id + email)
- [ ] CORS está configurado corretamente (não deixar `*`)
- [ ] `.env` **não** é commitado no git (adicionar a `.gitignore`)

---

## 📝 NOTAS IMPORTANTES

1. **Mensagens Genéricas:** Sempre que validação falha, retornar mensagem genérica: *"E-mail ou senha incorretos"* para não expor se email existe ou não (anti-enumeração).

2. **Validação Dupla:** Frontend valida UX; Backend valida segurança. **Ambas são obrigatórias.**

3. **Sem Commits de Secrets:** JWT_SECRET e DATABASE_URL devem estar em `.env`, nunca no código.

4. **Mock API:** Frontend pode usar mock até o backend estar 100% pronto — não bloqueia o desenvolvimento.

5. **Teste de Token:** Usar https://jwt.io para decodificar e verificar expiração antes de integrar.

---

## 🎯 DEFINITION OF DONE

✅ História está completa quando:
- Code Review passou
- Testes manuais passaram (todos os cenários acima)
- Mensagens de erro são genéricas
- Senha é hash bcrypt (verificar no banco de dados)
- Token é JWT válido com 2h de expiração
- Documentação atualizada (README com como testar)
- Sem secrets expostos no código
