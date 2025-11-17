# Node React Monorepo

Projeto fullstack monorepo com API Node.js e interface React para inspeção de webhooks.

## 🚀 Tecnologias

### Backend (API)

- **Node.js** com **TypeScript**
- **Fastify** - Framework web rápido e eficiente
- **Drizzle ORM** - ORM TypeScript-first
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de schemas
- **Swagger/Scalar** - Documentação automática da API
- **Biome** - Formatador e linter

### Frontend (Web)

- **React 19** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server

### Infraestrutura

- **Docker Compose** - Orquestração do PostgreSQL
- **pnpm** - Gerenciador de pacotes e workspaces

## 📋 Requisitos

- **Node.js** 18+
- **pnpm** 10.12.1+
- **Docker** e **Docker Compose**

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd node-react
```

2.Instale as dependências:

```bash
pnpm install
```

3.Configure as variáveis de ambiente da API:

```bash
cd api
cp .env.example .env  # Se houver, ou crie o arquivo .env
```

Exemplo de `.env`:

```env
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/webhooks
```

4.Inicie o banco de dados PostgreSQL:

```bash
cd api
docker-compose up -d
```

5.Execute as migrações do banco:

```bash
cd api
pnpm db:migrate
```

## 🎯 Uso

### Executar todo o projeto (recomendado)

Execute API e Web simultaneamente em terminais separados:

**Terminal 1 - API:**

```bash
cd api
pnpm dev
```

A API estará disponível em: <http://localhost:3333>  
Documentação em: <http://localhost:3333/docs>

**Terminal 2 - Web:**

```bash
cd web
pnpm dev
```

O frontend estará disponível em: <http://localhost:5173>

### Comandos úteis da API

```bash
cd api

# Desenvolvimento com hot reload
pnpm dev

# Gerar migrações do banco
pnpm db:generate

# Executar migrações
pnpm db:migrate

# Abrir Drizzle Studio (interface visual do DB)
pnpm db:studio

# Formatar código
pnpm format
```

### Comandos úteis do Web

```bash
cd web

# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview do build de produção
pnpm preview
```

## 📁 Estrutura do Projeto

```text
node-react/
├── api/                      # Backend API
│   ├── src/
│   │   ├── db/              # Configuração e schemas do banco
│   │   │   ├── migrations/  # Migrações SQL
│   │   │   └── schema/      # Schemas Drizzle
│   │   ├── routes/          # Rotas da API
│   │   ├── env.ts           # Validação de env vars
│   │   └── server.ts        # Entry point
│   ├── docker-compose.yml   # PostgreSQL container
│   ├── drizzle.config.ts    # Config do Drizzle ORM
│   └── package.json
├── web/                      # Frontend React
│   ├── src/
│   │   ├── app.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   └── package.json
├── pnpm-workspace.yaml       # Configuração workspace
└── package.json
```

## 🐛 Problemas Comuns

### Porta já em uso

Se a porta 3333 ou 5173 estiver em uso, você pode alterá-las:

- **API**: Modifique a variável `PORT` no `.env`
- **Web**: Configure no `vite.config.ts`

### Erro de conexão com banco

Verifique se o PostgreSQL está rodando:

```bash
docker ps
```

Se não estiver, inicie:

```bash
cd api
docker-compose up -d
```

## 📝 Licença

ISC
