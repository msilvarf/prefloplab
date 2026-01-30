---
description: Iniciar servidor de desenvolvimento
---

# Servidor de Desenvolvimento

Este workflow inicia o servidor de desenvolvimento local com hot-reload.

## Passos

1. Navegue até a pasta do aplicativo
```bash
cd app
```

// turbo
2. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

3. Abra o navegador em `http://localhost:5173`

## Informações

- **Porta padrão**: 5173
- **Hot Reload**: Ativado (mudanças são refletidas automaticamente)
- **URL Local**: http://localhost:5173
- **URL Rede**: Exibido no terminal ao iniciar

## Para Parar o Servidor

- Pressione `Ctrl + C` no terminal
- Ou use `q` (dependendo da configuração)

## Servidor em Porta Diferente

Se a porta 5173 estiver ocupada:
```bash
npm run dev -- --port 3000
```

## Ver Servidor Rodando

Para verificar se o servidor está ativo:
```bash
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

## Modo de Rede (Acesso de Outros Dispositivos)

Para acessar de outros dispositivos na mesma rede:
```bash
npm run dev -- --host
```
Isso exibirá um endereço IP que pode ser acessado de outros dispositivos.
