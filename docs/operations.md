# Operacao e recuperacao

## Health check

A API expõe `GET /health`. A resposta `200` confirma que o processo está ativo e que o PostgreSQL respondeu a `SELECT 1`. O Render usa essa rota para monitorar o serviço.

## Backup do PostgreSQL

O backup deve ser configurado no provedor do banco, fora do processo web do Render. Para um backup manual, use:

```powershell
pg_dump "$env:DATABASE_URL" --format=custom --file=tks-backup.dump
```

Para restaurar em um banco vazio ou de recuperação:

```powershell
pg_restore --clean --if-exists --dbname="$env:DATABASE_URL" tks-backup.dump
```

Boas práticas:

- manter backups automáticos diários;
- testar uma restauração mensalmente;
- armazenar cópias fora do servidor da aplicação;
- restringir o acesso aos arquivos de backup;
- nunca versionar `DATABASE_URL` ou arquivos `.dump`.

## Monitoramento

Configure um monitor externo para consultar:

```text
https://tks-api.onrender.com/health
```

Use alertas para respostas diferentes de `200`, latência alta e indisponibilidade consecutiva. O endpoint retorna `503` quando o banco não está disponível.

## Login social

Configure no Render as variáveis `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID` e `FACEBOOK_CLIENT_SECRET`.

Cadastre estas URLs de callback nos respectivos provedores:

```text
https://tks-api.onrender.com/api/auth/google/callback
https://tks-api.onrender.com/api/auth/github/callback
https://tks-api.onrender.com/api/auth/facebook/callback
```

Defina também `BACKEND_URL=https://tks-api.onrender.com` e mantenha `FRONTEND_URL=https://tks-psi.vercel.app` no Render.
