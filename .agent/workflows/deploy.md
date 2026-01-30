---
description: Fazer deploy da aplicação
---

# Deploy da Aplicação

Este workflow prepara e faz deploy do PreflopLab para produção.

## Opções de Deploy

### 1. Vercel (Recomendado)

// turbo-all

#### Passo a passo:

1. Instale a CLI da Vercel (primeira vez)
```bash
npm install -g vercel
```

2. Faça login na Vercel
```bash
vercel login
```

3. Navegue até a pasta do app
```bash
cd app
```

4. Execute o deploy
```bash
vercel
```

5. Para deploy de produção
```bash
vercel --prod
```

#### Configuração Automática

A Vercel detectará automaticamente que é um projeto Vite e usará as configurações corretas.

---

### 2. Netlify

1. Instale a CLI da Netlify
```bash
npm install -g netlify-cli
```

2. Faça login
```bash
netlify login
```

3. Navegue até a pasta do app
```bash
cd app
```

4. Faça o build
```bash
npm run build
```

5. Faça o deploy
```bash
netlify deploy --dir=dist --prod
```

---

### 3. GitHub Pages

1. Instale o pacote gh-pages
```bash
cd app
npm install -D gh-pages
```

2. Adicione ao `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. Configure o `base` no `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/PreflopLab/', // nome do repositório
  // ...
})
```

4. Execute o deploy
```bash
npm run deploy
```

---

### 4. Deploy Manual (Qualquer Servidor)

1. Navegue até a pasta do app
```bash
cd app
```

2. Faça o build
```bash
npm run build
```

3. Copie a pasta `dist/` para o servidor
```bash
# Exemplo com SCP
scp -r dist/* usuario@servidor:/var/www/html/
```

---

## Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] Build funciona sem erros: `npm run build`
- [ ] Lint sem problemas: `npm run lint`
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Teste local da build: `npm run preview`
- [ ] Git commit de todas as mudanças

## Preview Local da Build

Para testar a build localmente antes do deploy:
```bash
cd app
npm run build
npx vite preview
```

Acesse `http://localhost:4173` para ver a versão de produção.

## Variáveis de Ambiente

Se precisar de variáveis de ambiente:

1. Crie `.env.production` na pasta `app/`:
```
VITE_API_URL=https://api.exemplo.com
```

2. Use no código:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Rollback

Se precisar reverter um deploy:

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
Use o dashboard para reverter para uma versão anterior.

**GitHub Pages:**
```bash
git revert HEAD
git push origin main
```
