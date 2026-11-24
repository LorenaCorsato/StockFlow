# AGENTS.md — Guia de Contexto e Regras do Projeto StockFlow

Este arquivo fornece contexto técnico, arquitetura, regras de negócio e restrições para assistentes de IA e agentes de codificação que atuam no repositório **StockFlow** (Hackathon Full Stack).

---

## 🎯 Objetivo do Sistema

O **StockFlow** é uma aplicação de controle de estoque multiplataforma onde **duas interfaces clientes (Web e Mobile) consomem a mesma API RESTful**.

- **Regra de Ouro:** Dados estáticos ou mockados não são permitidos nas entregas finais. Toda listagem, cadastro, edição, exclusão e movimentação deve refletir o estado real persistido no banco de dados via API.

---

## 🏗️ Arquitetura e Stack Tecnológica

O monorepo está dividido em três frentes principais:

1. **Backend (`/backend`)**
   - **Tecnologia:** Java 17+, Spring Boot, Spring Web, Spring Data JPA, Bean Validation, Banco de Dados **H2** (em memória).
   - **Arquitetura:** Estritamente dividida nas camadas `Entity`, `Repository`, `Service` e `Controller`.
   - **Configuração:** Deve habilitar **CORS** globalmente (ou para as origens do Angular e Expo) para evitar bloqueios de requisição.

2. **Frontend Web (`/frontend-web`)**
   - **Tecnologia:** Angular (TypeScript), Reactive/Template-driven Forms, `HttpClient`.
   - **Responsabilidades:** CRUD completo de produtos, exibição de saldo vs. estoque mínimo, filtro por categoria e destaque visual para estoque baixo.

3. **Aplicativo Mobile (`/mobile-expo`)**
   - **Tecnologia:** React Native com Expo, Fetch API ou Axios, navegação entre telas.
   - **Responsabilidades:** Listagem de produtos, tela de detalhes, registro de movimentação (`ENTRADA`/`SAIDA`) e tratamento visual de erros da API.

---

## ⚖️ Regras de Negócio e Domínio

Qualquer código gerado ou alterado pelos agentes deve obedecer rigorosamente às seguintes regras:

### 1. Entidade `Produto`
- **Campos obrigatórios:** `id`, `nome` (não vazio), `categoria` (não vazio), `quantidade` (inteiro $\ge 0$), `estoqueMinimo` (inteiro $\ge 0$).
- **Regra de Estoque Baixo:** Sempre que `quantidade <= estoqueMinimo`, o produto deve ser sinalizado visualmente nas interfaces Web e Mobile como **Estoque Baixo**.

### 2. Movimentação de Estoque
- **Payload esperado (`PATCH /api/produtos/{id}/movimentacao`):**
  ```json
  {
    "tipo": "ENTRADA", // ou "SAIDA"
    "quantidade": 3    // inteiro estritamente positivo (> 0)
  }
  ```
- **Validação de Saldo Negativo:** Uma operação do tipo `SAIDA` **nunca** pode resultar em saldo negativo (`quantidadeAtual - quantidadeSaida < 0`). Caso ocorra, o backend deve rejeitar a operação e retornar `400 Bad Request` com uma mensagem clara de erro (ex: *"Estoque insuficiente"*).
- **Persistência:** A movimentação atualiza diretamente o saldo na entidade `Produto`. Não é necessário criar uma tabela/entidade separada para histórico de movimentações.

### 3. Contratos HTTP da API
- `200 OK`: Consultas, atualizações e movimentações bem-sucedidas.
- `201 Created`: Cadastro de novo produto.
- `204 No Content`: Exclusão de produto.
- `400 Bad Request`: Campos obrigatórios ausentes, valores negativos ou tentativa de saída maior que o saldo disponível.
- `404 Not Found`: Operações em um `id` de produto inexistente.

---

## 🚫 Restrições de Escopo (O que NÃO implementar)

Para manter o foco nas entregas do Hackathon, **não adicione complexidade desnecessária**:
- ❌ Autenticação, login, JWT ou controle de perfis de usuário.
- ❌ Deploy em nuvem, Docker complexo ou geração de APK/IPA.
- ❌ Relatórios avançados, dashboards analíticos ou histórico detalhado de logs de movimentação.

---

## 🧪 Fluxo Crítico de Validação (Smoke Test)

Ao sugerir testes ou validar alterações, garanta que o seguinte cenário funcione sem falhas:
1. **Angular:** Cadastrar `"Caderno"` (`quantidade: 10`, `estoqueMinimo: 3`).
2. **Expo:** Listar e abrir detalhes de `"Caderno"` (deve exibir saldo `10`).
3. **Expo:** Registrar `SAIDA` de `8` unidades (novo saldo: `2`).
4. **Angular:** Recarregar lista e verificar saldo `2` + badge/alerta de **Estoque Baixo**.
5. **Expo:** Tentar registrar `SAIDA` de `3` unidades e validar que o app captura o erro `400` da API e exibe alerta de estoque insuficiente.

---

## 💡 Diretrizes para Geração de Código

- **No Backend:** Mantenha regras de negócio (como cálculo de saldo e validação de estoque insuficiente) dentro da camada `Service`, nunca no `Controller`.
- **No Angular:** Sempre atualize a lista de produtos (re-fetch ou atualização reativa do estado) imediatamente após operações de `POST`, `PUT` ou `DELETE`.
- **No Expo:** Lembre-se de que `localhost` no emulador/dispositivo físico não aponta para a máquina host; utilize variáveis de ambiente ou constantes configuráveis para o IP local da rede (ex: `http://192.168.x.x:8080`).