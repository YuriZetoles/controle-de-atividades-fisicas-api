# Suite de Testes E2E — Alunos (`/alunos`)

> Testes E2E com Jest + Supertest contra banco real, validando as regras de negócio e validações das rotas de alunos.

> **Arquivo:** `src/tests/routes/alunoRoutes.test.ts`

---

## Rastreabilidade de Requisitos (`PROJETO.md`)

| Requisito | Descrição no projeto | Cobertura nesta suíte |
| :--- | :--- | :--- |
| **RF001** | Cadastro de usuário | Cobertura indireta: criação de perfil de aluno depende de `user_id` válido e existente. |
| **RF002** | Login de usuário | Cobertura indireta: todas as rotas exigem autenticação (`401` sem sessão/token). |
| **RF003** | Tipos de usuários | Cobertura indireta: suíte valida operações de perfil de aluno com usuário autenticado. |
| **RF004** | Informações de usuário | Cobertura direta: criação, consulta, edição e remoção do perfil de aluno. |
| **RF0012** | Lista de alunos | Cobertura direta: listagem paginada em `GET /alunos`. |

---

## GET /alunos — Listagem de Alunos

| Funcionalidade | Comportamento Esperado | Verificações | Critérios de Aceite |
| :--- | :--- | :--- | :--- |
| **Cenários felizes** |  |  |  |
| Usuário autenticado lista alunos | Deve retornar lista paginada com `200`. | Fazer `GET /alunos` com autenticação válida. | Retorna `200`; contém `dados`, `total`, `page`, `limite`, `totalPages`. |
| Query vazia usa padrão do schema | Deve usar `page=1` e `limite=10`. | Fazer `GET /alunos` sem query params. | Retorna `200`; metadados com valores padrão. |
| Paginação explícita | Deve respeitar `page` e `limite`. | Fazer `GET /alunos?page=1&limite=1`. | Retorna `200`; no máximo 1 item em `dados`; metadados coerentes. |
| **Cenários tristes** |  |  |  |
| `page` inválido | Deve rejeitar com `422`. | Fazer `GET /alunos?page=0`. | Retorna `422`; erro de validação em `errors`. |
| `limite` inválido | Deve rejeitar com `422`. | Fazer `GET /alunos?limite=101`. | Retorna `422`; erro de validação em `errors`. |
| `limite` não numérico | Deve rejeitar com `422`. | Fazer `GET /alunos?limite=abc`. | Retorna `422`; erro de validação em `errors`. |
| Campo extra na query (`.strict()`) | Deve rejeitar com `422`. | Fazer `GET /alunos?foo=bar`. | Retorna `422`; erro Zod de campo não reconhecido. |
| Sem autenticação | Deve rejeitar com `401`. | Fazer `GET /alunos` sem sessão/token válido. | Retorna `401`. |

---

## GET /alunos/:id — Detalhe de Aluno

| Funcionalidade | Comportamento Esperado | Verificações | Critérios de Aceite |
| :--- | :--- | :--- | :--- |
| **Cenários felizes** |  |  |  |
| Buscar aluno existente por ID | Deve retornar aluno com `200`. | Fazer `GET /alunos/:id` com UUID existente. | Retorna `200`; `data` contém os campos do perfil de aluno. |
| **Cenários tristes** |  |  |  |
| ID inexistente (UUID válido) | Deve rejeitar com `404`. | Fazer `GET /alunos/{uuid-valido-inexistente}`. | Retorna `404`; mensagem de não encontrado. |
| ID inválido (não UUID) | Deve rejeitar com `422`. | Fazer `GET /alunos/nao-e-uuid`. | Retorna `422`; erro de validação em `errors`. |
| Sem autenticação | Deve rejeitar com `401`. | Fazer `GET /alunos/:id` sem sessão/token válido. | Retorna `401`. |

---

## POST /alunos — Criação de Aluno

| Funcionalidade | Comportamento Esperado | Verificações | Critérios de Aceite |
| :--- | :--- | :--- | :--- |
| **Cenários felizes** |  |  |  |
| Criação válida com campos obrigatórios | Deve criar aluno com `201`. | Fazer `POST /alunos` com `user_id`, `nome`, `data_nascimento`, `sexo`, `academia_id`. | Retorna `201`; `data` contém aluno criado. |
| Criação válida com campos opcionais | Deve persistir opcionais (`url_foto`, `status_conta`, `treinador_id`). | Fazer `POST /alunos` com opcionais preenchidos. | Retorna `201`; campos opcionais refletidos na resposta. |
| **Cenários tristes** |  |  |  |
| `user_id` ausente | Deve rejeitar com `400`. | Fazer `POST /alunos` sem `user_id`. | Retorna `400`; mensagem de dados obrigatórios. |
| `nome` ausente | Deve rejeitar com `400`. | Fazer `POST /alunos` sem `nome`. | Retorna `400`; mensagem de dados obrigatórios. |
| `academia_id` inválido | Deve rejeitar com `422`. | Fazer `POST /alunos` com `academia_id` não UUID. | Retorna `422`; erro de validação em `errors`. |
| `data_nascimento` inválida (formato) | Deve rejeitar com `422`. | Fazer `POST /alunos` com `data_nascimento: "01-01-2000"`. | Retorna `422`; erro de validação em `errors`. |
| `data_nascimento` inválida (data impossível) | Deve rejeitar com `422`. | Fazer `POST /alunos` com `2025-02-30`. | Retorna `422`; erro de validação em `errors`. |
| `sexo` fora do enum | Deve rejeitar com `422`. | Fazer `POST /alunos` com `sexo: "X"`. | Retorna `422`; erro de validação em `errors`. |
| `treinador_id` inválido | Deve rejeitar com `422`. | Fazer `POST /alunos` com `treinador_id` não UUID. | Retorna `422`; erro de validação em `errors`. |
| `user_id` inexistente na tabela `user` | Deve rejeitar com `422`. | Fazer `POST /alunos` com `user_id` não existente. | Retorna `422`; mensagem de referência inválida. |
| `user_id` já vinculado a outro aluno | Deve rejeitar com `409`. | Fazer `POST /alunos` com `user_id` já utilizado. | Retorna `409`; mensagem de conflito de duplicidade. |
| Sem autenticação | Deve rejeitar com `401`. | Fazer `POST /alunos` sem sessão/token válido. | Retorna `401`. |

---

## PATCH /alunos/:id — Atualização de Aluno

| Funcionalidade | Comportamento Esperado | Verificações | Critérios de Aceite |
| :--- | :--- | :--- | :--- |
| **Cenários felizes** |  |  |  |
| Atualização parcial válida | Deve atualizar campos e retornar `200`. | Fazer `PATCH /alunos/:id` com subset de campos válidos. | Retorna `200`; `data` com valores atualizados. |
| Atualização para desvincular treinador | Deve aceitar `treinador_id: null`. | Fazer `PATCH /alunos/:id` com `{ treinador_id: null }`. | Retorna `200`; `treinador_id` nulo na resposta. |
| **Cenários tristes** |  |  |  |
| Body vazio | Deve rejeitar com `400`. | Fazer `PATCH /alunos/:id` com `{}`. | Retorna `400`; mensagem de corpo obrigatório. |
| ID inválido | Deve rejeitar com `422`. | Fazer `PATCH /alunos/nao-e-uuid`. | Retorna `422`; erro de validação em `errors`. |
| Aluno inexistente | Deve rejeitar com `404`. | Fazer `PATCH /alunos/{uuid-inexistente}`. | Retorna `404`; mensagem de não encontrado. |
| Campo inválido (`sexo` fora do enum) | Deve rejeitar com `422`. | Fazer `PATCH /alunos/:id` com `sexo: "X"`. | Retorna `422`; erro de validação em `errors`. |
| `treinador_id` inválido | Deve rejeitar com `422`. | Fazer `PATCH /alunos/:id` com `treinador_id` não UUID. | Retorna `422`; erro de validação em `errors`. |
| Sem autenticação | Deve rejeitar com `401`. | Fazer `PATCH /alunos/:id` sem sessão/token válido. | Retorna `401`. |

---

## DELETE /alunos/:id — Exclusão de Aluno

| Funcionalidade | Comportamento Esperado | Verificações | Critérios de Aceite |
| :--- | :--- | :--- | :--- |
| **Cenários felizes** |  |  |  |
| Exclusão de aluno existente | Deve deletar aluno com `200`. | Fazer `DELETE /alunos/:id` com ID existente. | Retorna `200`; mensagem de sucesso e registro removido. |
| **Cenários tristes** |  |  |  |
| ID inválido | Deve rejeitar com `422`. | Fazer `DELETE /alunos/nao-e-uuid`. | Retorna `422`; erro de validação em `errors`. |
| ID inexistente | Deve rejeitar com `404`. | Fazer `DELETE /alunos/{uuid-inexistente}`. | Retorna `404`; mensagem de não encontrado. |
| Sem autenticação | Deve rejeitar com `401`. | Fazer `DELETE /alunos/:id` sem sessão/token válido. | Retorna `401`. |
