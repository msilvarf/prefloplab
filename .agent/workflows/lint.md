---
description: Verificar e corrigir problemas de código (linting)
---

# Lint e Formatação de Código

Este workflow verifica e corrige problemas de estilo e qualidade do código.

## Passos

1. Navegue até a pasta do aplicativo
```bash
cd app
```

// turbo
2. Execute o linter (verificação)
```bash
npm run lint
```

3. Se houver erros corrigíveis automaticamente, use:
```bash
npx eslint src --fix
```

## Verificação de Tipos (TypeScript)

Para verificar apenas erros de tipo sem fazer build:
```bash
npx tsc --noEmit
```

## Linting de Arquivos Específicos

Para verificar apenas um arquivo ou pasta específica:
```bash
npx eslint src/components/Sidebar.tsx
npx eslint src/views/
```

## Ver Estatísticas de Problemas

Para contar quantos problemas existem:
```bash
npm run lint 2>&1 | Select-String "error" | Measure-Object
```

## Configuração do ESLint

O arquivo de configuração está em: `app/eslint.config.js`

## Ignorar Regras Específicas

Para ignorar uma regra em uma linha específica:
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unused = 'variável não usada'
```

Para ignorar em um arquivo inteiro:
```typescript
/* eslint-disable @typescript-eslint/no-unused-vars */
```

## Pre-commit Hook (Futuro)

Para automatizar o lint antes de commits, considere usar husky:
```bash
npm install -D husky lint-staged
```
