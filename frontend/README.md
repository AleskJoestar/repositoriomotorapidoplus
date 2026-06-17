# MotoRapido PLUS - Frontend React

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── FormInput.tsx
│   │   ├── Button.tsx
│   │   ├── AuthLayout.tsx
│   │   └── Toast.tsx
│   ├── context/             # Contexto de autenticação
│   │   └── AuthContext.tsx
│   ├── pages/               # Páginas da aplicação
│   │   ├── Register.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── ProtectedRoute.tsx
│   ├── schemas/             # Schemas de validação (Zod)
│   │   └── authSchema.ts
│   ├── services/            # Serviços de API
│   │   ├── api.ts
│   │   └── authService.ts
│   ├── types/               # Tipos TypeScript
│   │   └── auth.ts
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── index.html               # HTML raiz
├── vite.config.ts           # Configuração Vite
├── tailwind.config.js       # Configuração Tailwind CSS
├── postcss.config.js        # Configuração PostCSS
├── tsconfig.json            # Configuração TypeScript
├── package.json             # Dependências
└── .gitignore              # Arquivos ignorados
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Backend rodando em `http://localhost:3000`

### Passo 1: Navegar até a pasta frontend

```bash
cd frontend
```

### Passo 2: Instalar as dependências

```bash
npm install
```

### Passo 3: Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: **`http://localhost:5173`**

### Passo 4: Acessar a aplicação

Abra o navegador e acesse: `http://localhost:5173`

## 📝 Funcionalidades Implementadas

### ✅ Autenticação (RF01 + RF02)
- **Cadastro de Usuário** — Formulário com validação em tempo real
- **Login** — Validação de e-mail e senha
- **Tokens** — Armazenamento seguro em localStorage (accessToken + refreshToken)
- **Contexto Global** — useAuth para acesso a dados de autenticação em toda a app

### ✅ Componentes Reutilizáveis
- **FormInput** — Campo de formulário com label, erro e validação
- **Button** — Botão com estados de loading e variantes (primary/secondary)
- **AuthLayout** — Layout padrão para páginas de autenticação
- **Toast** — Notificações flutuantes (sucesso, erro, info)

### ✅ Validação
- Zod schemas para validação de formulários
- React Hook Form para gerenciamento de formulários
- Validação em tempo real com feedback visual

### ✅ Rotas Protegidas
- **ProtectedRoute** — Redireciona para login se não autenticado
- Redirecionamento automático para dashboard após login

### ✅ Integração com Backend
- Axios como cliente HTTP
- Interceptor automático de bearer token
- Proxy de API configurado no Vite

## 🔧 Configuração de Variáveis de Ambiente

Se necessário, crie um arquivo `.env` na raiz do frontend:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

Depois ajuste em `src/services/api.ts` se precisar usar a variável.

## 📦 Dependências

- **react** ^18.2.0
- **react-dom** ^18.2.0
- **react-router-dom** ^6.15.0 — Roteamento
- **axios** ^1.6.0 — Cliente HTTP
- **react-hook-form** ^7.48.0 — Gerenciamento de formulários
- **zod** ^3.22.0 — Validação de schemas
- **@hookform/resolvers** ^3.3.0 — Integração Zod + React Hook Form
- **tailwindcss** ^3.3.0 — Estilização
- **vite** ^5.0.0 — Build tool
- **typescript** ^5.3.0 — Type checking

## 🧪 Testes Manuais

### 1. Cadastro
1. Acesse `http://localhost:5173/register`
2. Preencha nome, e-mail e senha
3. Confirme a senha
4. Clique em "Cadastrar"
5. Deve redirecionar para login após 2 segundos

### 2. Login
1. Acesse `http://localhost:5173/login`
2. Preencha e-mail e senha (dados do cadastro anterior)
3. Clique em "Entrar"
4. Deve redirecionar para dashboard após 2 segundos

### 3. Dashboard
1. Após login, você deve ver a dashboard
2. Dados do usuário exibido (nome, e-mail, ID)
3. Botão "Sair" deve fazer logout e redirecionar para login

### 4. Rotas Protegidas
1. Faça logout
2. Tente acessar `/dashboard` diretamente
3. Deve redirecionar para `/login`

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

## 📋 Checklist de Implementação

- ✅ Estrutura base (Vite + React + TypeScript)
- ✅ Tailwind CSS configurado
- ✅ Types e interfaces
- ✅ Schemas de validação (Zod)
- ✅ Serviços de API (Axios)
- ✅ Contexto de autenticação (React Context)
- ✅ Componentes reutilizáveis
- ✅ Páginas (Register, Login, Dashboard)
- ✅ Rotas protegidas
- ✅ Validação em tempo real
- ✅ Toast de feedback
- ✅ Integração com backend

## ⚠️ Notas Importantes

1. **Backend deve estar rodando** em `http://localhost:3000` antes de usar o frontend
2. **localStorage** é usado para armazenar tokens — limpe se necessário via DevTools
3. **CORS** já deve estar configurado no backend para aceitar requests do frontend
4. **Tokens** são enviados automaticamente via interceptor do Axios
