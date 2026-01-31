# 🚀 Guia de Deploy - PreflopLab

Este documento descreve como fazer deploy do PreflopLab em diferentes plataformas.

---

## 📋 Índice

- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Comparação de Plataformas](#comparação-de-plataformas)

---

## 🐙 GitHub Pages

### Deploy Rápido

```bash
cd app
npm run deploy
```

### Como Funciona

1. Faz build do projeto com base path `/PreflopLab/`
2. Publica a pasta `dist` no branch `gh-pages`
3. GitHub Pages serve automaticamente do branch `gh-pages`

### Configuração Inicial

Certifique-se de que o GitHub Pages está ativado:

1. Vá para **Settings** → **Pages** no repositório
2. Em **Source**, selecione **Deploy from a branch**
3. Em **Branch**, selecione **gh-pages** e **/ (root)**
4. Clique em **Save**

### URL da Aplicação

```
https://<seu-usuario>.github.io/PreflopLab/
```

### Arquivos Relacionados

- `vite.config.ts` - Base path configurado para `/PreflopLab/`
- `package.json` - Script `deploy`

---

## 🌐 Netlify

### Opção 1: Deploy Automático via Git (Recomendado)

1. **Acesse**: https://app.netlify.com
2. **Clique em**: "Add new site" → "Import an existing project"
3. **Conecte seu repositório GitHub**
4. **Configure**:
   - **Base directory**: `app`
   - **Build command**: `npm run build`
   - **Publish directory**: `app/dist`
5. **Deploy!**

Após isso, cada push no branch principal fará deploy automático! 🎉

### Opção 2: Deploy Manual via CLI

#### Instalação (primeira vez)

```bash
npm install -g netlify-cli
netlify login
```

#### Deploy de Produção

```bash
cd app
npm run deploy:netlify
```

#### Deploy de Preview (teste)

```bash
cd app
npm run deploy:netlify:preview
```

### Configurações Especiais

O projeto está configurado com:

✅ **netlify.toml** - Configuração completa:
- Build settings
- Redirects para SPA
- Headers de segurança
- Cache otimizado

✅ **public/_redirects** - Fallback para SPA routing

✅ **.nvmrc** - Versão do Node.js (24.13.0)

✅ **Variável de ambiente** - `VITE_DEPLOY_TARGET=netlify` para usar base path `/`

### URL da Aplicação

```
https://<seu-site>.netlify.app
```

Ou configure um domínio customizado!

### Arquivos Relacionados

- `netlify.toml` - Configuração principal
- `public/_redirects` - Redirects SPA
- `.nvmrc` - Versão Node.js
- `vite.config.ts` - Base path dinâmico
- `package.json` - Scripts `deploy:netlify` e `build:netlify`

---

## ⚖️ Comparação de Plataformas

| Recurso | GitHub Pages | Netlify |
|---------|--------------|---------|
| **Deploy Automático** | ❌ (via GitHub Actions) | ✅ Nativo |
| **HTTPS** | ✅ Automático | ✅ Automático |
| **CDN Global** | ✅ | ✅ |
| **Domínio Customizado** | ✅ | ✅ |
| **Deploy Previews** | ❌ | ✅ |
| **Rollback** | Manual (Git) | ✅ Interface |
| **Formulários** | ❌ | ✅ |
| **Funções Serverless** | ❌ | ✅ |
| **Analytics** | ❌ | ✅ (pago) |
| **Build Time** | ~2-5 min | ~1-3 min |
| **Custo** | 🆓 Grátis | 🆓 Grátis (com limites) |

### Recomendações

- **GitHub Pages**: Ideal para projetos open source, simples e direto
- **Netlify**: Melhor para projetos que precisam de CI/CD robusto, previews e recursos avançados

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build            # Build para GitHub Pages
npm run build:netlify    # Build para Netlify (base path /)

# Preview
npm run preview          # Preview da build localmente

# Deploy
npm run deploy           # Deploy para GitHub Pages
npm run deploy:netlify   # Deploy produção Netlify
npm run deploy:netlify:preview  # Deploy preview Netlify

# Qualidade
npm run lint             # Verifica código
```

---

## 🐛 Troubleshooting

### Build falha

```bash
# Teste localmente primeiro
cd app
npm run build

# Verifique os logs
npm run lint
```

### Rotas retornam 404

- ✅ GitHub Pages: Configurado automaticamente via `gh-pages`
- ✅ Netlify: Configurado via `netlify.toml` e `_redirects`

### Assets não carregam

- Verifique o base path no `vite.config.ts`
- GitHub Pages usa `/PreflopLab/`
- Netlify usa `/`

### Variável de ambiente não funciona

```bash
# Instale cross-env (já instalado)
npm install -D cross-env

# Verifique o script no package.json
"build:netlify": "cross-env VITE_DEPLOY_TARGET=netlify npm run build"
```

---

## 📚 Documentação Adicional

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Netlify Docs](https://docs.netlify.com/)
- [Deploy Workflow](.agent/workflows/deploy.md)

---

## ✅ Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] Build funciona sem erros: `npm run build`
- [ ] Lint sem problemas: `npm run lint`
- [ ] Teste local da build: `npm run preview`
- [ ] Git commit de todas as mudanças
- [ ] Variáveis de ambiente configuradas (se necessário)

---

## 💡 Dicas

1. **Teste localmente** antes de fazer deploy
2. **Use deploy preview** no Netlify para testar mudanças
3. **Configure branch protection** para evitar deploys acidentais
4. **Monitore os builds** para identificar problemas rapidamente
5. **Use domínio customizado** para uma URL profissional

---

**Feito com ❤️ para o PreflopLab**
