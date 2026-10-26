# tournament-batalha

Este README mostra como configurar e executar o projeto localmente usando Postgres no Docker (recomendado). Está escrito em português.

Pré-requisitos

- Node.js (v18+ recomendado)
- npm
- Docker (Docker Desktop) — ou `docker` / `docker compose` funcional
- DBeaver (opcional) para inspecionar a base

Arquivos relevantes

- `docker-compose.yml` — define um serviço Postgres local
- `.env.local` — contém `DATABASE_URL` usado localmente pelo Prisma
- `.env.prd` — ficheiro que o `prisma.config.ts` carrega quando `NODE_ENV=production`
- `prisma/schema.prisma` — modelo de dados
- `prisma.config.ts` — configura o datasource (usa `DATABASE_URL`)
- `prisma/seed.ts` — script para popular dados iniciais

Configuração e execução (passo a passo)

1. Crie ou edite `.env.local` na raiz do projeto para a configuração local:

```bash
# .env.local
DATABASE_URL=postgresql://prisma:prisma@localhost:5432/app_gestao?schema=public
```

O `prisma.config.ts` carrega `.env.local` quando `NODE_ENV` não é `production` e `.env.prd` quando `NODE_ENV=production`. Em produção, configure também as variáveis de ambiente da aplicação na plataforma onde esta é executada.

2. Inicie o Postgres com Docker Compose

- Se tem Docker Compose v2 (recomendado):

```bash
docker compose up -d --build
```

- Se usa o cliente legacy:

```bash
docker-compose up -d --build
```

(Aguardar alguns segundos para o Postgres subir.)

3. Gerar Prisma Client

```bash
npm run prisma:generate
```

4. Para permitir fotos de jogadores e staff, configure um bucket Neon Object Storage com acesso `public_read` e credenciais com permissões `storage:write`. Defina `STORAGE_ENDPOINT_URL_S3`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` e `STORAGE_BUCKET` no ambiente do servidor. O endpoint é o endpoint S3 da branch Neon; nunca exponha as credenciais no cliente.

5. Criar e aplicar migrações (cria as tabelas no Postgres)

```bash
npm run prisma:migrate
```

(se preferir passar um nome: `npm run prisma:migrate -- --name init`)

6. Executar a aplicação Next.js

```bash
npm run dev
```

A aplicação estará em `http://localhost:3000`.

Potes das equipas

Antes de sortear uma competição, atribua a cada equipa um pote no formulário da equipa. O valor tem de ser um número inteiro positivo: use `1` para as equipas mais fortes e números seguintes para os restantes níveis. Equipas no mesmo pote são distribuídas por grupos diferentes de forma equilibrada. No formato `LEAGUE`, os potes são intercalados na ordem usada para gerar os emparelhamentos e ajudam a espaçar equipas do mesmo nível; não alteram o conjunto de adversários. Se cada equipa tiver de defrontar todas as outras, isso continua a acontecer.

O pote pode ser alterado enquanto a competição estiver em `DRAFT`. Depois do sorteio, a edição das equipas fica bloqueada.

Seed em produção

O seed de produção apaga os jogos, eventos, jogadores, staff, equipas e competições existentes antes de inserir os dados de exemplo. Por segurança, `npm run db:seed:prd` é bloqueado por predefinição. Só o execute depois de confirmar que pretende substituir esses dados:

```bash
CONFIRM_PRODUCTION_SEED=I_UNDERSTAND_THIS_WILL_DELETE_DATA npm run db:seed:prd
```

Conectar no DBeaver

- Tipo de base: PostgreSQL
- Host: `localhost`
- Port: `5432`
- Database: `app_gestao`
- User: `prisma`
- Password: `prisma`

Observações importantes

- A configuração atual usa PostgreSQL (`provider = "postgresql"`) e o adaptador PostgreSQL em `lib/prisma.ts`. O ficheiro `dev.db` que está no repositório é um artefacto antigo de SQLite e não é usado por esta configuração.

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
- `prisma migrate` reclama do `DATABASE_URL`: confirme `.env.local` (ou `.env.prd` se `NODE_ENV=production`) e reinicie o terminal; também pode definir `DATABASE_URL` no ambiente do processo.

Próximos passos opcionais

- Habilitar backups do volume Docker `db_data` ou montar um diretório local
- Configurar CI para rodar migrações e seeds
- Mudar `POSTGRES_*` credenciais em `docker-compose.yml` para valores mais seguros

Se quiser, eu:

- Inicio o container e executo as migrações aqui (preciso de acesso ao Docker).
- Gero um pequeno `README` adicional com screenshots de conexão no DBeaver.

Fim.
