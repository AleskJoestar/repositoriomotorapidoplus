# MotoRapido PLUS — Explicação do Sistema

Sistema web para gestão de oficinas de motocicletas: estoque, funcionários, PDV, cadastros auxiliares e controle de acesso.

```
Frontend (React :5173)  ──HTTP/JWT──▶  Backend (Express :3000)  ──Prisma──▶  SQLite
```

**Fluxo padrão:** `Route → Controller → Service → Prisma → SQLite`

---

## Estrutura de Pastas

### `src/` — Backend

| Pasta | Responsabilidade |
|-------|------------------|
| `index.ts` | Bootstrap Express, middlewares, montagem de rotas |
| `routes/` | Definição de endpoints REST por domínio |
| `controllers/` | Handlers HTTP — parse request, chama service, retorna response |
| `services/` | Regras de negócio, transações, auditoria |
| `middleware/` | JWT (`auth.ts`), guard Master (`requireMaster.ts`), guard PDV (`requirePdvAccess.ts`) |
| `schemas/` | Validação Zod dos payloads |
| `types/` | Tipos TypeScript compartilhados |
| `utils/` | PDF (`pdfTable.ts`), XML (`xmlBuilder.ts`), formatação de relatórios |

### `frontend/src/` — Frontend

| Pasta | Responsabilidade |
|-------|------------------|
| `App.tsx` | Router principal + guards de rota |
| `pages/` | Telas por módulo (Login, Dashboard, Employees, Parts, Sales, …) |
| `components/` | Formulários reutilizáveis, modais, layout |
| `hooks/` | Estado e chamadas API por domínio (`useEmployees`, `useParts`, …) |
| `services/` | Client Axios — endpoints do backend |
| `context/` | `AuthContext` — sessão JWT em `localStorage` |
| `schemas/` | Validação Zod (espelho do backend) |
| `types/` | Interfaces de domínio |

### `prisma/` — Banco de Dados

| Arquivo | Responsabilidade |
|---------|------------------|
| `schema.prisma` | Modelos: User, Employee, Part, Sale, Department, … |
| `seed.ts` | Usuário Master semente (`master@motorplus.com`) |
| `migrations/` | Histórico de alterações do schema |

---

## Controllers e Services

### Controllers (`src/controllers/`)

| Controller | Rotas montadas em | Domínio |
|------------|-------------------|---------|
| `authController.ts` | `/api/auth` | Login, refresh token |
| `employeeController.ts` | `/api/employees` | CRUD funcionários + relatórios |
| `partController.ts` | `/api/parts` | CRUD peças + audit logs + relatórios |
| `saleController.ts` | `/api/sales` | PDV: carrinho, checkout, relatório |
| `userController.ts` | `/api/users` | Gestão de usuários (Master only) |
| `departmentController.ts` | `/api/departments` | Deptos + cargos |
| `manufacturerController.ts` | `/api/manufacturers` | Fabricantes |
| `categoryController.ts` | `/api/categories` | Categorias |

### Services (`src/services/`)

| Service | Funções principais |
|---------|-------------------|
| `authService.ts` | `login`, `refreshAccessToken`, geração JWT |
| `employeeService.ts` | CRUD, delete lógico/físico, audit log, cascade user |
| `employeeReportService.ts` | PDF/XLSX de funcionários |
| `partService.ts` | CRUD, código auto, audit log, movimentação estoque |
| `partReportService.ts` | PDF/XLSX de peças |
| `saleService.ts` | Carrinho, checkout, verificação Master, relatório |
| `saleReportService.ts` | PDF/XML de vendas |
| `userService.ts` | CRUD usuários, proteção seed, PDF/XML |
| `departmentService.ts` | CRUD deptos/cargos, inativação cascata |
| `manufacturerService.ts` | CRUD fabricantes + relatórios |
| `categoryService.ts` | CRUD categorias + relatórios |

---

## Funções-Chave

### 1. Login (`authService.login`)

```typescript
// src/services/authService.ts
const user = await prisma.user.findUnique({ where: { email } });
if (!user || user.status !== 'Ativo') throw 401; // mensagem genérica
if (!await bcrypt.compare(senha, user.password)) throw 401;
return { accessToken, refreshToken, usuario };
```

- Erro sempre `"E-mail ou senha incorretos"` (anti-enumeração)
- JWT carrega `{ id, email, accessType }` — `MASTER` ou `COMUM`

---

### 2. Middleware JWT (`authenticateToken`)

```typescript
// src/middleware/auth.ts
const token = req.headers['authorization']?.split(' ')[1];
const decoded = jwt.verify(token, JWT_SECRET);
req.userId = decoded.id;
req.accessType = decoded.accessType;
```

Injeta `userId` e `accessType` em toda rota protegida.

---

### 3. Exclusão de Funcionário — Lógica vs Física (`deleteEmployee`)

```typescript
// src/services/employeeService.ts
const requiresLogicalDelete =
  nonCreateAuditCount > 0 || linkedUser !== null;

if (requiresLogicalDelete) {
  // status → Inativo + audit log + inativa usuário vinculado
} else {
  // delete físico: remove audit logs + registro
}
```

| Condição | Ação |
|----------|------|
| Histórico além de CREATE **ou** usuário vinculado | Soft delete (`status = Inativo`) |
| Apenas log CREATE, sem usuário | Hard delete |

---

### 4. Auditoria de Peças (`updatePart` + `createPartAuditLog`)

```typescript
// src/services/partService.ts — toda edição gera PartAuditLog
await createPartAuditLog(partId, 'UPDATE', changedFields, userId);

// alteração de quantity → StockMovement automático
type: diff > 0 ? 'ENTRADA' : 'SAIDA'
```

- Endpoint: `GET /api/parts/:id/audit-logs`
- Exclusão de peça = sempre inativação (`status = Inativo`), nunca física

---

### 5. PDV — Adicionar Item (`addCartItem`)

Transação atômica:

1. Valida peça ativa + estoque suficiente
2. Decrementa `part.quantity`
3. Cria `StockMovement` tipo `VENDA_SAIDA`
4. Insere `SaleItem` no carrinho aberto (`status = ABERTA`)

---

### 6. PDV — Remover Item com Autorização Master (`removeCartItem`)

```typescript
// src/services/saleService.ts
if (requesterAccessType !== 'MASTER') {
  const isMaster = await verifyMasterCredentials(email, senha);
  if (!isMaster) throw 403;
}
// estorna estoque → StockMovement VENDA_ESTORNO
```

| Quem remove | Requisito |
|-------------|-----------|
| `MASTER` | Remove direto |
| `COMUM` | Body com `masterEmail` + `masterSenha` válidos |

Frontend: modal `MasterAuthModal.tsx` na tela `Sales.tsx`.

---

### 7. Checkout (`checkoutSale`)

```typescript
if (sale.items.length === 0) throw 400;
if (paymentMethod === 'DINHEIRO' && amountPaid < total) throw 400;
// status → FINALIZADA, registra paymentMethod, amountPaid, changeAmount
```

Formas: `PIX` | `DINHEIRO` | `DEBITO` | `CREDITO`

---

### 8. Guard Master (`requireMaster`)

```typescript
// src/middleware/requireMaster.ts
if (user.accessType !== 'MASTER' || user.status !== 'Ativo')
  return res.status(403);
```

Usado em: relatórios de peças/usuários/vendas, gestão de usuários.

---

### 9. Usuário Semente Imortal (`inactivateUser`)

```typescript
// src/services/userService.ts
if (user.isMasterSeed) throw 403; // "Usuário semente não pode ser desativado"
```

Seed em `prisma/seed.ts`: `master@motorplus.com` / `usermaster#@`

---

## Modelos Prisma (relacionamentos centrais)

```
User ──1:1──▶ Employee
Employee ──N:1──▶ Department, Position
Part ──N:1──▶ Category, Manufacturer
Sale ──1:N──▶ SaleItem ──N:1──▶ Part
Part ──1:N──▶ PartAuditLog, StockMovement
Employee ──1:N──▶ AuditLog
```

---

## Guards de Rota (Frontend)

| Guard | Acesso | Redirect se negado |
|-------|--------|-------------------|
| `ProtectedRoute` | Autenticado | `/login` |
| `AdminRoute` | `MASTER` | `/sales` |
| `MasterRoute` | `MASTER` | `/sales` |
| `PdvRoute` | `MASTER` ou `COMUM` | `/login` |

**Home pós-login:** Master → `/dashboard` | Comum → `/sales`

---

## Mapa de Endpoints

| Prefixo | Módulo | Auth |
|---------|--------|------|
| `/api/auth` | Login, refresh | Público |
| `/api/employees` | Funcionários | Token |
| `/api/parts` | Peças/estoque | Token (+ Master p/ relatórios) |
| `/api/sales` | PDV | Token + PDV (+ Master p/ relatórios) |
| `/api/users` | Usuários | Token + Master |
| `/api/departments` | Deptos/cargos | Token |
| `/api/manufacturers` | Fabricantes | Token |
| `/api/categories` | Categorias | Token |

---

## Relatórios

| Entidade | Formatos | Restrição |
|----------|----------|-----------|
| Funcionários | PDF, XLSX | Token |
| Peças | PDF, XLSX | Master |
| Fabricantes / Categorias | PDF, XML | Token |
| Usuários | PDF, XML | Master |
| Vendas | PDF, XML | Master |

Geração: `pdfTable.ts` (PDF) · `exceljs` (XLSX) · `xmlBuilder.ts` (XML)
