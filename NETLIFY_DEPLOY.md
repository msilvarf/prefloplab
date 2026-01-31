# PreflopLab - Netlify Deployment Guide

## 🚀 Deploy Automático via Git

A maneira mais fácil de fazer deploy no Netlify é conectar seu repositório GitHub:

1. **Acesse o Netlify**: https://app.netlify.com
2. **Clique em "Add new site" → "Import an existing project"**
3. **Conecte seu repositório GitHub**
4. **Configure as opções de build**:
   - **Base directory**: `app`
   - **Build command**: `npm run build`
   - **Publish directory**: `app/dist`
   - **Node version**: 24.13.0 (detectado automaticamente via `.nvmrc`)

5. **Clique em "Deploy site"**

### ✨ Deploy Automático
Após a configuração inicial, cada push para o branch principal fará deploy automático!

---

## 🛠️ Deploy Manual via CLI

### Instalação da CLI (primeira vez)

```bash
npm install -g netlify-cli
```

### Login no Netlify

```bash
netlify login
```

### Deploy de Produção

```bash
cd app
npm run deploy:netlify
```

### Deploy de Preview (teste)

```bash
cd app
npm run deploy:netlify:preview
```

---

## 📋 Arquivos de Configuração

O projeto já está configurado com:

- ✅ **netlify.toml** - Configuração principal do Netlify
  - Build settings
  - Redirects para SPA
  - Headers de segurança e cache
  
- ✅ **public/_redirects** - Fallback para redirects
  
- ✅ **.nvmrc** - Versão do Node.js (24.13.0)

- ✅ **Scripts no package.json**:
  - `npm run deploy:netlify` - Deploy de produção
  - `npm run deploy:netlify:preview` - Deploy de preview

---

## 🔧 Configurações Importantes

### Variáveis de Ambiente

Se precisar de variáveis de ambiente:

1. No dashboard do Netlify: **Site settings → Environment variables**
2. Adicione variáveis com prefixo `VITE_`:
   ```
   VITE_API_URL=https://api.exemplo.com
   ```

### Domínio Customizado

1. **Site settings → Domain management**
2. **Add custom domain**
3. Siga as instruções para configurar DNS

### HTTPS

O Netlify fornece HTTPS automático via Let's Encrypt!

---

## 📊 Recursos do Netlify

- ✅ Deploy automático via Git
- ✅ Deploy previews para Pull Requests
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Rollback instantâneo
- ✅ Formulários (se necessário)
- ✅ Funções serverless (se necessário)

---

## 🔍 Troubleshooting

### Build falha no Netlify

1. Verifique os logs de build no dashboard
2. Certifique-se que a versão do Node.js está correta
3. Teste localmente: `npm run build`

### Rotas 404

- O arquivo `netlify.toml` já está configurado com redirects
- O arquivo `public/_redirects` serve como backup
- Ambos garantem que todas as rotas sejam tratadas pelo React Router

### Cache de assets antigos

- O Netlify faz cache automático
- Para forçar atualização, faça um novo deploy
- Headers de cache já estão otimizados no `netlify.toml`

---

## 🎯 URLs Úteis

- **Dashboard**: https://app.netlify.com
- **Documentação**: https://docs.netlify.com
- **Status**: https://www.netlifystatus.com

---

## 💡 Dicas

1. **Branch Deploys**: Configure branches específicos para deploy automático
2. **Deploy Previews**: Ative para ver mudanças antes do merge
3. **Build Hooks**: Crie webhooks para triggers customizados
4. **Analytics**: Ative Netlify Analytics para métricas detalhadas
