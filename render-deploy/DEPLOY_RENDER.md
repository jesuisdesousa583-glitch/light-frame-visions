# Deploy no Render — oficial-2026 (versão revisada)

Esta versão ajusta o `DEPLOY_RENDER.md` original para os arquivos exatos
do zip enviado (`backend/build.sh`, `backend/start.sh`,
`baileys-service/server.js`, `frontend` em CRA+craco) e introduz o
**Blueprint** (`render.yaml`) para automação.

---

## 0. Pré-requisitos

- Conta no [Render](https://render.com) (cartão para os planos Starter).
- Conta no [MongoDB Atlas](https://cloud.mongodb.com) (M0 Free serve).
- Repositório GitHub com o conteúdo do zip na raiz
  (`backend/`, `baileys-service/`, `frontend/`, mais o `render.yaml`
  desta pasta `render-deploy/`).

---

## 1. MongoDB Atlas (5 min)

1. **Build a Database → M0 Free** → região mais próxima.
2. **Database Access** → crie usuário `kenia-prod` com senha forte
   e permissão *Read and write to any database*.
3. **Network Access** → *Allow access from anywhere* (`0.0.0.0/0`).
4. **Connect → Drivers** → copie a string:
   ```
   mongodb+srv://kenia-prod:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## 2. Subir o código pro GitHub

```bash
unzip oficial-2026-main.zip
cd oficial-2026-main
cp ../render-deploy/render.yaml ./render.yaml   # blueprint na raiz
git init && git add . && git commit -m "initial"
git branch -M main
git remote add origin git@github.com:<você>/kenia-garcia-advocacia.git
git push -u origin main
```

---

## 3. Deploy via Blueprint (recomendado)

1. Render → **New + → Blueprint** → conecte o repo.
2. Render lê o `render.yaml` e propõe **3 serviços**:
   `kenia-backend`, `kenia-baileys`, `kenia-frontend`.
3. Clique **Apply**. Os builds começam.
4. **Preencha os segredos** (campos marcados *required*):

   | Serviço         | Variável                  | Valor                                                                 |
   | --------------- | ------------------------- | --------------------------------------------------------------------- |
   | kenia-backend   | `MONGO_URL`               | string do Atlas (passo 1)                                             |
   | kenia-backend   | `ADMIN_PASSWORD`          | senha do admin do app                                                 |
   | kenia-backend   | `EMERGENT_LLM_KEY`        | sua chave Emergent (`sk-emergent-...`)                                |
   | kenia-baileys   | `BAILEYS_INTERNAL_TOKEN`  | **copie do backend** (Render gerou auto lá; cole o mesmo aqui)        |

   `JWT_SECRET` e o `BAILEYS_INTERNAL_TOKEN` do backend são gerados
   automaticamente pelo Render (`generateValue: true`).

5. **Após o 1º deploy concluir**, copie as URLs geradas e preencha as
   variáveis cruzadas:

   | Serviço         | Variável               | Valor                                                                          |
   | --------------- | ---------------------- | ------------------------------------------------------------------------------ |
   | kenia-backend   | `BAILEYS_URL`          | `https://kenia-baileys.onrender.com`                                           |
   | kenia-backend   | `BACKEND_WEBHOOK`      | `https://kenia-backend.onrender.com/api/whatsapp/webhook/baileys`              |
   | kenia-backend   | `CORS_ORIGINS`         | `https://kenia-frontend.onrender.com` (vírgula-separado p/ domínio extra)      |
   | kenia-baileys   | `BACKEND_WEBHOOK`      | igual ao do backend                                                            |
   | kenia-frontend  | `REACT_APP_BACKEND_URL`| `https://kenia-backend.onrender.com`                                           |

6. Em cada serviço → **Manual Deploy → Clear cache & deploy** para
   recompilar com as URLs corretas.

---

## 4. Detalhes que mudaram em relação ao guia original

| Tópico                  | Original                              | Versão revisada                                                                    |
| ----------------------- | ------------------------------------- | ---------------------------------------------------------------------------------- |
| Python version          | `3.11.10`                             | `3.11.9` (bate com `backend/runtime.txt`)                                          |
| Build do backend        | `pip install -r requirements.txt`     | `./build.sh` (inclui `emergentintegrations` via `--extra-index-url`)               |
| Start do backend        | `uvicorn server:app --host 0.0.0.0`   | `./start.sh` (já usa `--workers 2` e `$PORT`)                                      |
| Baileys package manager | `yarn install --frozen-lockfile`      | `npm install --omit=dev` (o zip só traz `package-lock.json`, não `yarn.lock`)      |
| Baileys disk            | mencionado em texto                   | declarado no blueprint: `/opt/render/project/src/auth_info`, 1 GB                  |
| Frontend SPA fallback   | não documentado                       | rewrite `/* → /index.html` no blueprint (senão o React Router quebra em F5)        |
| Secrets sensíveis       | colados no `.env` do guia             | `sync: false` / `generateValue: true` no blueprint (não vão pro Git)               |

---

## 5. Verificação pós-deploy

```bash
# Backend respondendo?
curl https://kenia-backend.onrender.com/api/health

# Baileys vivo? (precisa do token interno)
curl -H "X-Internal-Token: $BAILEYS_INTERNAL_TOKEN" \
     https://kenia-baileys.onrender.com/status

# Frontend servindo?
curl -I https://kenia-frontend.onrender.com
```

Se algum 502/503 persistir, abra a aba **Logs** do serviço no Render —
99% das falhas iniciais são variável de ambiente faltando ou URL
cruzada errada.

---

## 6. Domínio próprio (opcional)

Render → serviço `kenia-frontend` → **Settings → Custom Domain** →
adicione `kenia-garcia.com.br` e configure o CNAME na sua DNS.
Depois adicione o domínio em `CORS_ORIGINS` do backend e refaça o
deploy do backend.
