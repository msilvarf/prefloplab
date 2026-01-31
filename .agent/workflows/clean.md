---
description: Limpar arquivos temporários e cache
---

# Limpeza do Projeto

Este workflow limpa arquivos temporários, cache e rebuilds o projeto do zero.

## Passos

1. Navegue até a pasta do aplicativo
```bash
cd app
```

// turbo
2. Remova a pasta node_modules
```bash
Remove-Item -Recurse -Force node_modules
```

// turbo
3. Remova a pasta dist
```bash
Remove-Item -Recurse -Force dist
```

// turbo
4. Limpe o cache do npm
```bash
npm cache clean --force
```

// turbo
5. Reinstale as dependências
```bash
npm install
```

6. (Opcional) Faça um build limpo
```bash
npm run build
```

## Limpeza Rápida (Apenas Cache)

Para limpar apenas o cache do Vite sem remover node_modules:

```bash
Remove-Item -Recurse -Force dist, node_modules/.vite
```

## Limpeza Total com Lock File

Se estiver tendo problemas com dependências:

```bash
cd app
Remove-Item -Recurse -Force node_modules, dist, package-lock.json
npm install
```

## Verificar Tamanho das Pastas

Para ver quanto espaço está sendo usado:

```bash
Get-ChildItem -Directory | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    [PSCustomObject]@{
        Folder = $_.Name
        SizeMB = [math]::Round($size, 2)
    }
} | Sort-Object SizeMB -Descending
```

## Quando Usar

Use este workflow quando:
- Houver problemas estranhos de build ou desenvolvimento
- Atualizar versões de pacotes
- Mudar de branch com diferentes dependências
- O cache estiver causando comportamento inesperado
- Antes de fazer troubleshooting de problemas complexos
