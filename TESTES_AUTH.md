# Testes dos Endpoints de Autenticação

## 1. Health Check
```
GET http://localhost:3000/health
```

## 2. Registrar novo usuário (RF01)
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "confirmarSenha": "senha123"
}
```

**Respostas esperadas:**
- ✅ 201: Usuário registrado com sucesso
- ❌ 409: E-mail já cadastrado
- ❌ 400: Dados inválidos (senha curta, emails não batem, etc.)

---

## 3. Login (RF02)
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Respostas esperadas:**
- ✅ 200: Login bem-sucedido (retorna accessToken, refreshToken, usuario)
- ❌ 401: E-mail ou senha incorretos (genérico, não diferencia casos)
- ❌ 400: Dados inválidos

---

## 4. Refresh Token
```
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "JWT_TOKEN_AQUI"
}
```

**Respostas esperadas:**
- ✅ 200: Novo accessToken e refreshToken gerados
- ❌ 401: Refresh token inválido ou expirado
- ❌ 400: Dados inválidos
