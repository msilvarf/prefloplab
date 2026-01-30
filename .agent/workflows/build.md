---
description: Construir o projeto para produção
---

# Build para Produção

Este workflow compila o projeto PreflopLab para produção, gerando os arquivos otimizados na pasta `dist/`.

## Passos

1. Navegue até a pasta do aplicativo
```bash
cd app
```

// turbo
2. Execute o build de produção
```bash
npm run build
```

3. Verifique a pasta de saída
```bash
ls dist
```

## Saída Esperada

Após o build bem-sucedido, você verá:
- `dist/index.html` - HTML principal
- `dist/assets/` - CSS e JavaScript otimizados e minificados
- Mensagem: `✓ built in [tempo]s`

## Possíveis Problemas

### Erro de TypeScript
Se houver erros de tipo, corrija-os antes de fazer o build:
```bash
npm run build 2>&1 | Select-String "error TS"
```

### Limpeza de Cache
Se o build estiver com problemas, limpe o cache:
```bash
Remove-Item -Recurse -Force dist, node_modules/.vite
npm run build
```

## Build para Verificação Rápida

Para apenas verificar se o código compila sem gerar arquivos:
```bash
npx tsc --noEmit
```
