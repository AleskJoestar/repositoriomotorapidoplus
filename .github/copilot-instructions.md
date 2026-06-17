# MotoRapido PLUS — Instruções Globais do Copilot

## Sobre o Projeto

**MotoRapido PLUS** é um sistema web de controle e gerenciamento de peças para oficinas de motocicletas de pequeno e médio porte.

A especificação completa do produto está em `specs/specs.md` — **sempre leia antes de implementar qualquer coisa**.

## Workflow de Desenvolvimento

Toda demanda segue obrigatoriamente este fluxo:

1. **Analisar** — entender o problema e a solução
2. **Quebrar** — decompor em atividades executáveis
3. **Desenvolver** — implementar com o agente especialista correto
4. **Revisar** — validar a entrega
5. **Fim** — confirmar e documentar

## Agentes Disponíveis

Use o agente correto para cada tipo de demanda:

| Agente | Quando usar |
|--------|-------------|
| `Orquestrador` | Ponto de entrada para qualquer nova demanda — coordena os demais |
| `Analista` | Dúvidas de regra de negócio, decisões de produto, validação de escopo |
| `Scrum` | Planejamento de sprint, criação de histórias, priorização de backlog |
| `Frontend` | Telas, componentes, formulários, UI, estilos |
| `Backend` | APIs, banco de dados, autenticação, lógica de servidor |

## Regras Globais

- Senhas **sempre** com `bcrypt` — nunca texto puro
- Erros de autenticação são **sempre** genéricos (anti-enumeração)
- Exclusão de registros com histórico → **exclusão lógica** (nunca física)
- Validações acontecem no **frontend E no backend** (nunca só em um)
- Log de auditoria obrigatório em edições de peças
- Relatórios exportáveis em **PDF e XLSX**
- Nunca expor senhas, tokens ou dados sensíveis em respostas de API
- Variáveis de ambiente em `.env` — nunca hardcode de secrets

## Módulos do Sistema

| Módulo | Requisitos |
|--------|-----------|
| Autenticação | RF01 (Cadastro), RF02 (Login) |
| Funcionários | RF03 (Cadastro), RF04 (Edição), RF05 (Exclusão), RF06 (Relatório) |
| Estoque de Peças | RF07 (Cadastro), RF08 (Edição), RF09 (Exclusão), RF10 (Relatório) |
