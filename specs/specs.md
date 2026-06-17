# Especificação Técnica: Motorápido PLUS

## 1. Visão Geral do Produto
O **Motorápido PLUS** é um sistema web focado no controle e gerenciamento de peças para oficinas de motocicletas de pequeno e médio porte. A aplicação visa organizar o estoque, registrar funcionários, emitir relatórios de controle e otimizar a tomada de decisões sobre reposição de peças de forma prática e acessível.

---

## 2. Escopo Técnico e Módulos do Sistema

### MÓDULO 1: AUTENTICAÇÃO E USUÁRIOS

#### [RF01] Cadastrar Usuário
* **Descrição:** O sistema deve permitir o autoregistro de novos usuários administradores.
* **Campos do Formulário:** Nome Completo (texto), E-mail (email), Senha (password) e Confirmar Senha (password).
* **Botões:** Salvar, Cancelar.
* **Regras de Negócio e Segurança:**
    * Validação em tempo real dos campos (formato de e-mail válido, senha com no mínimo 6 caracteres).
    * Verificar se o e-mail já existe no banco de dados para evitar duplicidade.
    * A senha **deve obrigatoriamente** ser criptografada usando o algoritmo `bcrypt` antes de ser persistida.
* **Comportamento:** Após o sucesso, redirecionar o usuário para a tela de Login (`/login`).
* **Persistência (Banco de Dados):** ID (PK sequencial ou UUID), Nome, E-mail, Senha (hash), Data de Cadastro.

#### [RF02] Autenticar Usuário (Login)
* **Descrição:** Permitir o acesso de usuários cadastrados ao sistema.
* **Campos do Formulário:** E-mail (email) e Senha (password).
* **Botões:** Entrar.
* **Regras de Negócio e Segurança:**
    * Em caso de falha na autenticação (e-mail inexistente ou senha incorreta), exibir a mensagem genérica: *"E-mail ou senha incorretos"* (segurança contra enumeração de usuários).
* **Comportamento:** Após login bem-sucedido, iniciar a sessão do usuário (Session/JWT) e redirecionar para a Dashboard Principal (`/dashboard`).

---

### MÓDULO 2: GERENCIAMENTO DE FUNCIONÁRIOS

#### [RF03] Cadastrar Funcionário
* **Descrição:** Permitir o registro de funcionários com dados pessoais, profissionais e de contato.
* **Interface:** Formulário organizado visualmente por abas ou seções: *Dados Pessoais*, *Dados Profissionais* e *Contato*.
* **Campos:** Nome Completo, CPF, RG, E-mail, Telefone, Cargo, Departamento, Data de Admissão, Salário, Data de Nascimento, Endereço Completo e Status (Padrão: Ativo).
* **Botões:** Salvar, Limpar, Cancelar.
* **Regras de Negócio:**
    * Validar automaticamente o formato do CPF (`XXX.XXX.XXX-XX`).
    * Validar duplicidade de CPF (não permitir dois funcionários com o mesmo CPF).
* **Comportamento:** Redirecionar para a listagem de funcionários ou oferecer atalho para novo cadastro.

#### [RF04] Editar Funcionário
* **Descrição:** Permitir a alteração de dados de um funcionário cadastrado.
* **Interface:** Idêntica à de cadastro, mas com os campos preenchidos com os dados vigentes.
* **Botões:** Atualizar, Cancelar.
* **Regras de Negócio:** O código único (ID) do funcionário fica visível mas desabilitado para alteração. Aplica-se a mesma validação de duplicidade de CPF para as alterações.
* **Comportamento:** Redirecionar para a listagem exibindo mensagem de confirmação de sucesso.

#### [RF05] Excluir Funcionário
* **Descrição:** Remover ou inativar o registro de um funcionário do sistema.
* **Interface:** Disparar um componente Modal de confirmação: *"Confirmar exclusão do funcionário [Nome do Funcionário]?"*.
* **Botões:** Confirmar, Cancelar.
* **Regras de Negócio (Exclusão Lógica vs Física):**
    * O sistema deve checar se o funcionário possui vínculos ativos no sistema.
    * Se possuir vínculos/histórico ativo, realizar **Exclusão Lógica** (alterar o Status para Inativo), preservando o histórico no banco de dados.
* **Comportamento:** Atualizar a listagem de funcionários e exibir toast/mensagem de confirmação.

#### [RF06] Emitir Relatório de Funcionários
* **Descrição:** Geração de relatório de funcionários cadastrados com filtros dinâmicos.
* **Filtros Disponíveis:** Cargo, Departamento, Status (Ativo/Inativo), Período (Data de Admissão de/até).
* **Estrutura do Relatório:**
    * *Cabeçalho:* Título do relatório, Data e Hora de emissão.
    * *Colunas:* Código, Nome, CPF, Cargo, Departamento, Data de Admissão, Salário, Status.
    * *Rodapé:* Contador total de registros encontrados.
* **Formatos de Exportação:** Download disponível em PDF e XLSX (Excel) com layout profissional.

---

### MÓDULO 3: GERENCIAMENTO DE PEÇAS (ESTOQUE)

#### [RF07] Cadastrar Peça
* **Descrição:** Realizar a entrada de novos itens e peças automotivas no estoque.
* **Campos:**
    * *Obrigatórios:* Nome da Peça, Categoria, Quantidade em Estoque.
    * *Opcionais:* Descrição, Fabricante, Número de Série, Localização no Estoque, Quantidade Mínima.
* **Botões:** Salvar, Cancelar.
* **Regras de Negócio:**
    * O sistema deve gerar de forma automatizada e sequencial um código único para a peça.
    * Validar se já existe combinação idêntica de `Nome da Peça` + `Fabricante` para alertar sobre duplicidade.

#### [RF08] Editar Peça
* **Descrição:** Atualizar informações cadastrais ou quantidades de uma peça.
* **Interface:** Campos preenchidos com dados atuais. O código identificador fica bloqueado para edição.
* **Botões:** Atualizar, Cancelar.
* **Regras de Negócio e Auditoria:** O sistema deve registrar de forma automática um Log de Auditoria contendo: Data, Hora e Usuário logado que realizou a modificação na peça.

#### [RF09] Excluir Peça
* **Descrição:** Remover uma peça do cadastro do estoque.
* **Interface:** Modal de confirmação: *"Deseja realmente excluir a peça [Nome da Peça]?"*.
* **Botões:** Confirmar, Cancelar.
* **Regras de Negócio:**
    * O sistema deve varrer o histórico antes da exclusão. Se a peça possuir qualquer movimentação de estoque registrada (histórico de entrada/saída), a exclusão física é **proibida**.
    * Exibir erro: *"Não é possível excluir peça com histórico de movimentações"*. Sugerir e executar a inativação/exclusão lógica do item.

#### [RF10] Emitir Relatório de Peças
* **Descrição:** Gerador de relatórios analíticos de estoque.
* **Filtros Disponíveis:** Categoria, Fabricante, Status (Ativo/Inativo), Alerta de Estoque Baixo (Peças com quantidade em estoque abaixo da quantidade mínima cadastrada).
* **Estrutura do Relatório:**
    * *Cabeçalho:* Logo da oficina, Título do Relatório, Data/Hora de geração.
    * *Colunas:* Código, Nome, Categoria, Fabricante, Quantidade em Estoque, Localização, Status.
    * *Rodapé:* Paginação do documento.
* **Formatos de Exportação:** Download disponível em PDF e XLSX (Excel).