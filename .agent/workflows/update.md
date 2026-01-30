---
description: Atualizar dependências do projeto
---

# Atualizar Dependências

Este workflow atualiza as dependências do projeto de forma segura.

## Verificar Dependências Desatualizadas

1. Navegue até a pasta do aplicativo
```bash
cd app
```

// turbo
2. Liste pacotes desatualizados
```bash
npm outdated
```

## Atualização Segura (Versões Menores e Patches)

// turbo
Atualizar respeitando o semver do package.json:
```bash
npm update
```

## Atualização de Versões Maiores

Para atualizar para versões maiores (pode quebrar compatibilidade):

1. Instale o npm-check-updates
```bash
npm install -g npm-check-updates
```

2. Verifique o que pode ser atualizado
```bash
ncu
```

3. Atualize o package.json (apenas visualizar)
```bash
ncu -u
```

4. Instale as novas versões
```bash
npm install
```

## Atualizar Pacote Específico

Para atualizar apenas um pacote:
```bash
npm install react@latest
npm install -D typescript@latest
```

## Checklist Pós-Atualização

Após atualizar dependências:

- [ ] Execute `npm run build` para verificar se compila
- [ ] Execute `npm run lint` para verificar problemas
- [ ] Execute `npm run dev` e teste a aplicação
- [ ] Verifique mudanças no CHANGELOG dos pacotes principais
- [ ] Faça commit: `git commit -m "chore: update dependencies"`

## Atualização do Node.js

Verifique a versão do Node:
```bash
node --version
```

Para atualizar o Node, use o instalador oficial ou nvm:
```bash
# Com nvm (recomendado)
nvm install lts
nvm use lts
```

## Auditoria de Segurança

Verificar vulnerabilidades de segurança:
```bash
npm audit
```

Corrigir automaticamente (quando possível):
```bash
npm audit fix
```

Forçar correções (pode quebrar compatibilidade):
```bash
npm audit fix --force
```

## Rollback de Atualizações

Se algo quebrar após atualização:

1. Reverter o package.json
```bash
git checkout HEAD -- package.json package-lock.json
```

2. Reinstalar
```bash
Remove-Item -Recurse -Force node_modules
npm install
```
