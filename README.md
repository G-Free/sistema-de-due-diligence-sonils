# Sistema de Due Diligence SONILS - Full Stack

Esta é a versão full-stack da aplicação, com um frontend em React e um backend em Node.js/Express com Prisma.

## Estrutura do Projeto

O projeto está agora dividido em duas pastas principais:

- `/frontend`: Contém a aplicação React (o que antes era a raiz do projeto).
- `/backend`: Contém o novo servidor da API em Node.js.

## Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Um servidor de base de dados PostgreSQL (pode usar Docker para o configurar facilmente)

## Configuração do Backend

1.  **Navegue para a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure a Base de Dados com Prisma:**
    - Crie um ficheiro `.env` na pasta `backend/` copiando o exemplo de `backend/.env.example`.
    - Edite o ficheiro `.env` e atualize a variável `DATABASE_URL` com a sua string de conexão do PostgreSQL.
      Exemplo: `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"`

4.  **Execute as Migrações da Base de Dados:**
    Este comando irá ler o `schema.prisma`, criar as tabelas na sua base de dados e gerar o Prisma Client.
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Faça o Seed dos Dados Iniciais:**
    Este comando irá executar o script `prisma/seed.ts` para popular a sua base de dados com os dados simulados que a aplicação usava anteriormente.
    ```bash
    npx prisma db seed
    ```

6.  **Inicie o Servidor do Backend:**
    O servidor irá correr em `http://localhost:3001`.
    ```bash
    npm run dev
    ```

## Configuração do Frontend

1.  **Abra um novo terminal.**

2.  **Navegue para a pasta do frontend:**
    ```bash
    cd frontend
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**
    - Crie um ficheiro `.env` na pasta `frontend/`.
    - Adicione a seguinte linha para indicar ao frontend onde encontrar a API do backend:
      ```
      VITE_API_URL=http://localhost:3001/api
      ```
    - Adicione também a sua chave da API do Gemini:
      ```
      API_KEY=SUA_CHAVE_GEMINI_AQUI
      ```

5.  **Inicie o Servidor de Desenvolvimento do Frontend:**
    A aplicação estará acessível em `http://localhost:5173` (ou outra porta indicada pelo Vite).
    ```bash
    npm run dev
    ```

Agora, a aplicação frontend irá comunicar com o seu backend local para obter e guardar dados.