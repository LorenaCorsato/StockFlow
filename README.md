# 📦 StockFlow — Sistema de Controle de Estoque Full Stack

> Projeto desenvolvido para o **Hackathon Full Stack — StockFlow**, integrando **Backend (Java Spring Boot)**, **Frontend Web (Angular)** e **Aplicativo Mobile (React Native / Expo)** em uma única API RESTful.

## 📋 Sobre o Projeto

O **StockFlow** é uma solução multiplataforma para gerenciamento de estoque em tempo real. O principal objetivo do sistema é demonstrar a integração ponta a ponta entre diferentes clientes consumindo a mesma fonte de dados, aplicando validações rigorosas de regras de negócio no servidor.

### 🔄 Fluxo de Integração

* Um produto cadastrado na interface **Web (Angular)** fica imediatamente disponível no **Aplicativo Mobile (Expo)**.

* Uma movimentação de entrada ou saída registrada no **Mobile (Expo)** atualiza o saldo no banco de dados e reflete na interface **Web (Angular)**, alertando visualmente quando o estoque atinge o nível mínimo.

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Principais Recursos | 
| ----- | ----- | ----- | 
| **Backend** | **Java + Spring Boot** | Spring Web, Spring Data JPA, Validation, Banco em memória **H2**, Arquitetura em Camadas (`Entity`, `Repository`, `Service`, `Controller`), Configuração de CORS. | 
| **Frontend Web** | **Angular** | Componentes reativos, Reactive/Template-driven Forms, `HttpClient`, Filtros dinâmicos e alertas de estoque baixo. | 
| **Mobile** | **Expo (React Native)** | Navegação entre telas (Expo Router / React Navigation), consumo de API via `Axios` / `Fetch`, tratamento de erros e feedback visual. | 

## ⚙️ Regras de Negócio & Entidades

### Entidade `Produto`

* **Campos obrigatórios:** Nome, Categoria, Quantidade Disponível ($\ge 0$) e Estoque Mínimo ($\ge 0$).

* **Alerta de Estoque Baixo:** Todo produto cuja `quantidade` seja **menor ou igual** ao `estoqueMinimo` deve ser destacado visualmente nas interfaces.

### Movimentação de Estoque

* Aceita os tipos `ENTRADA` ou `SAIDA` com uma `quantidade` inteira e positiva ($> 0$).

* **Trava de Estoque Negativo:** O sistema impede qualquer operação de `SAIDA` cujo valor seja maior que o saldo atual disponível, retornando erro HTTP `400 Bad Request`.

## 🔌 Endpoints da API REST

Base URL padrão: `http://localhost:8080/api/produtos`

| Método | Endpoint | Descrição | Status HTTP Esperado | 
| ----- | ----- | ----- | ----- | 
| `GET` | `/api/produtos` | Lista todos os produtos cadastrados | `200 OK` | 
| `GET` | `/api/produtos/{id}` | Consulta detalhes de um produto específico | `200 OK` / `404 Not Found` | 
| `POST` | `/api/produtos` | Cadastra um novo produto | `201 Created` / `400 Bad Request` | 
| `PUT` | `/api/produtos/{id}` | Atualiza os dados cadastrais de um produto | `200 OK` / `400` / `404` | 
| `DELETE` | `/api/produtos/{id}` | Remove um produto do sistema | `204 No Content` / `404` | 
| `PATCH` | `/api/produtos/{id}/movimentacao` | Registra entrada ou saída no estoque | `200 OK` / `400` / `404` | 

#### Exemplo de Payload para Movimentação (`PATCH`):

```
{
  "tipo": "SAIDA",
  "quantidade": 3
}

```

O backend também aceita `/api/products` e `/products` para os clientes existentes.
Os campos do produto continuam no formato `name`, `description`, `category`,
`quantity` e `minStock`. O payload da movimentação usa `tipo` e `quantidade`,
conforme o exemplo acima; `quantidade` deve ser um número JSON inteiro maior que zero.

Uma movimentação bem-sucedida retorna `200 OK` com o produto atualizado:

```json
{
  "id": 1,
  "name": "Caderno",
  "description": null,
  "category": "Papelaria",
  "quantity": 2,
  "minStock": 3,
  "lowStock": true
}
```

`lowStock` é verdadeiro quando `quantity <= minStock` e pode ser usado pelos
clientes para exibir o alerta **Estoque Baixo**. Uma saída superior ao saldo retorna
`400 Bad Request`, com motivo `Estoque insuficiente`, sem alterar o banco.
Um produto inexistente lança `EntityNotFoundException`, seguindo o padrão dos
outros métodos do service, sem tratamento explícito de `404`. A movimentação é transacional e bloqueia
o produto durante a atualização para evitar consumo duplicado do mesmo saldo.

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

* **JDK 17+** e **Maven**

* **Node.js (LTS)** e **npm** / **yarn**

* **Angular CLI** (`npm install -g @angular/cli`)

* **Expo Go** instalado no dispositivo físico ou emulador Android/iOS

### 1. Executando o Backend (Spring Boot)

```
# Acesse a pasta do backend
cd stockflow-backend

# Execute a aplicação via Maven
./mvnw spring-boot:run

```

* A API estará disponível em: `http://localhost:8080`

* Console do Banco H2: `http://localhost:8080/h2-console`

### 2. Executando o Frontend Web (Angular)

```
# Acesse a pasta do frontend web
cd stockflow-frontend-angular

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve

```

* Acesse no navegador: `http://localhost:4200`

### 3. Executando o Aplicativo Mobile (Expo)

> **Nota:** Como o app mobile roda em um dispositivo/emulador separado, certifique-se de configurar a URL da API utilizando o **IP local da sua máquina** (ex: `http://192.168.x.x:8080`) em vez de `localhost`.

```
# Acesse a pasta do aplicativo mobile
cd stockflow-frontend-mobile

# Instale as dependências
npm install

# Inicie o servidor do Expo
npx expo start

```

* Escaneie o QR Code com o aplicativo **Expo Go** ou pressione `w` para abrir no modo web.

## 🧪 Roteiro de Demonstração (Validação de Integração)

Para validar todos os requisitos do Hackathon, execute o seguinte fluxo de testes ponta a ponta:

1. **Cadastro via Web (Angular):**

   * Crie o produto **"Caderno"** com `Quantidade = 10` e `Estoque Mínimo = 3`.

2. **Consulta via Mobile (Expo):**

   * Abra o app mobile, atualize a listagem e acesse os detalhes do produto **"Caderno"**, confirmando o saldo de `10` unidades.

3. **Movimentação via Mobile (Expo):**

   * Registre uma **SAÍDA** de `8` unidades para o produto "Caderno". O saldo atualizado passará a ser `2`.

4. **Verificação de Alerta via Web (Angular):**

   * Atualize a tela no Angular. O produto **"Caderno"** deve exibir saldo `2` e estar destacado com o indicador de **Estoque Baixo** ($\le 3$).

5. **Validação de Erro via Mobile (Expo):**

   * Tente registrar uma nova **SAÍDA** de `3` unidades no aplicativo mobile.

   * O sistema deve bloquear a operação e exibir a mensagem de erro retornada pela API (**Estoque insuficiente**).

## 📂 Estrutura do Repositório

```
stockflow-hackathon/
├── stockflow-backend/          # API RESTful em Java Spring Boot + Banco H2
├── stockflow-frontend-angular/     # Aplicação Web em Angular
├── stockflow-frontend-mobile/      # Aplicativo Mobile em React Native / Expo
└── README.md         # Documentação principal do projeto

```

## 👥 Equipe & Colaboração

Projeto desenvolvido seguindo boas práticas de versionamento com **Git/GitHub** (commits semânticos, pull requests e divisão clara de responsabilidades entre Backend, Web e Mobile).

* **Lorena** — Backend (Java Spring Boot)

* **Carlos** — Frontend Web (Angular)

* **Lyncon e Lavínia** — Mobile (Expo)
