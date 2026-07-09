# App Gestão — Setup rápido

Este README mostra como configurar e executar o projeto localmente usando Postgres no Docker (recomendado). Está escrito em português.

Pré-requisitos

- Node.js (v18+ recomendado)
- npm
- Docker (Docker Desktop) — ou `docker` / `docker compose` funcional
- DBeaver (opcional) para inspecionar a base

Arquivos relevantes

- `docker-compose.yml` — define um serviço Postgres local
- `.env` — contém `DATABASE_URL` usado pelo Prisma
- `prisma/schema.prisma` — modelo de dados
- `prisma.config.ts` — configura o datasource (usa `DATABASE_URL`)
- `prisma/seed.ts` — script para popular dados iniciais

Configuração e execução (passo a passo)

1) Copie/edite o `.env` (já existe com valor padrão para Docker):

```bash
# .env (exemplo)
DATABASE_URL=postgresql://prisma:prisma@localhost:5432/app_gestao?schema=public
```

2) Inicie o Postgres com Docker Compose

- Se tem Docker Compose v2 (recomendado):

```bash
docker compose up -d --build
```

- Se usa o cliente legacy:

```bash
docker-compose up -d --build
```

(Aguardar alguns segundos para o Postgres subir.)

3) Gerar Prisma Client

```bash
npm run prisma:generate
```

4) Criar e aplicar migrações (cria as tabelas no Postgres)

```bash
npm run prisma:migrate
```

(se preferir passar um nome: `npm run prisma:migrate -- --name init`)

6) Executar a aplicação Next.js

```bash
npm run dev
```

A aplicação estará em `http://localhost:3000`.

Conectar no DBeaver

- Tipo de base: PostgreSQL
- Host: `localhost`
- Port: `5432`
- Database: `app_gestao`
- User: `prisma`
- Password: `prisma`

Observações importantes

- Eu removi o `dev.db` (SQLite) e atualizei o `prisma/schema.prisma` para `provider = "postgresql"` e `prisma.config.ts` para ler `DATABASE_URL`.
- Se preferir voltar a SQLite (teste rápido), substitua `provider` por `sqlite` e a `datasource.url` por `file:./dev.db` no `prisma.config.ts`, depois rode `npm run prisma:migrate`.

Comandos úteis

```bash
# Parar o DB
docker compose down

# Ver logs do container Postgres
docker compose logs -f

# Regenerar client prisma
npm run prisma:generate

# Forçar re-criar migrações (CUIDADO: destrói dados locais)
# rm -rf prisma/migrations && npm run prisma:migrate
```

Problemas comuns

- `docker`/`docker compose` não encontrado: instale o Docker Desktop.
- Porta 5432 ocupada: ajuste `docker-compose.yml` ou pare o serviço que usa a porta.
- `prisma migrate` reclama do `DATABASE_URL`: confirme `.env` e reinicie o terminal (ou rode `export DATABASE_URL=...`).

Próximos passos opcionais

- Habilitar backups do volume Docker `db_data` ou montar um diretório local
- Configurar CI para rodar migrações e seeds
- Mudar `POSTGRES_*` credenciais em `docker-compose.yml` para valores mais seguros

Se quiser, eu:

- Inicio o container e executo as migrações aqui (preciso de acesso ao Docker).
- Gero um pequeno `README` adicional com screenshots de conexão no DBeaver.

Fim.
