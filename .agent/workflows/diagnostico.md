---
description: Diagnosticar problemas no projeto
---

# Diagnóstico de Problemas

Este workflow ajuda a identificar e resolver problemas comuns no PreflopLab.

## Diagnóstico Rápido

// turbo
Execute este comando para coletar informações do sistema:

```bash
cd app
Write-Host "=== Diagnóstico PreflopLab ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Node.js:" -ForegroundColor Yellow
node --version
Write-Host ""
Write-Host "npm:" -ForegroundColor Yellow
npm --version
Write-Host ""
Write-Host "Estrutura do projeto:" -ForegroundColor Yellow
Get-ChildItem -Directory | Select-Object Name
Write-Host ""
Write-Host "Tamanho node_modules:" -ForegroundColor Yellow
if (Test-Path node_modules) {
    $size = (Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "$([math]::Round($size, 2)) MB"
} else {
    Write-Host "node_modules não existe" -ForegroundColor Red
}
```

## Problemas Comuns

### 1. "npm run dev" não funciona

**Sintomas**: Erro ao iniciar servidor

**Soluções**:

```bash
# Limpar e reinstalar
cd app
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run dev
```

### 2. Erros de TypeScript

**Sintomas**: Erros de tipo ao compilar

**Soluções**:

```bash
# Verificar erros
cd app
npx tsc --noEmit

# Limpar cache do TypeScript
Remove-Item -Recurse -Force node_modules/.vite
```

### 3. Build falha

**Sintomas**: `npm run build` retorna erro

**Soluções**:

```bash
cd app

# 1. Verificar sintaxe
npm run lint

# 2. Verificar tipos
npx tsc --noEmit

# 3. Limpar e rebuildar
Remove-Item -Recurse -Force dist, node_modules/.vite
npm run build
```

### 4. Hot reload não funciona

**Sintomas**: Mudanças não aparecem no navegador

**Soluções**:

1. Limpe o cache do navegador (Ctrl+Shift+Del)
2. Reinicie o servidor dev
3. Verifique se há erros no console do navegador
4. Verifique se o arquivo está sendo salvo corretamente

### 5. Importações não encontradas

**Sintomas**: `Cannot find module '@/...'`

**Soluções**:

```bash
# Verificar tsconfig.json paths
cat tsconfig.json | Select-String "paths"

# Verificar vite.config.ts alias
cat vite.config.ts | Select-String "alias"

# Reiniciar TypeScript server no VSCode
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### 6. Porta já em uso

**Sintomas**: `Port 5173 is already in use`

**Soluções**:

```bash
# Usar porta diferente
npm run dev -- --port 3000

# Ou matar processo na porta 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

## Verificar Integridade do Projeto

// turbo
Script completo de verificação:

```bash
cd app

Write-Host "1. Verificando arquivos essenciais..." -ForegroundColor Yellow
$files = @("package.json", "vite.config.ts", "tsconfig.json", "index.html")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file FALTANDO!" -ForegroundColor Red
    }
}

Write-Host "`n2. Verificando dependências..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "  ✓ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "  ✗ node_modules não existe - Execute 'npm install'" -ForegroundColor Red
}

Write-Host "`n3. Verificando TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit --pretty 2>&1 | Select-String "error TS" | Measure-Object | ForEach-Object {
    if ($_.Count -eq 0) {
        Write-Host "  ✓ Sem erros de tipo" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($_.Count) erros de tipo encontrados" -ForegroundColor Red
    }
}

Write-Host "`n4. Verificando estrutura de pastas..." -ForegroundColor Yellow
$folders = @("src", "src/components", "src/views", "src/hooks", "public")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        $count = (Get-ChildItem $folder -Recurse -File | Measure-Object).Count
        Write-Host "  ✓ $folder ($count arquivos)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $folder FALTANDO!" -ForegroundColor Red
    }
}

Write-Host "`nDiagnóstico concluído!" -ForegroundColor Cyan
```

## Logs de Erro

Para salvar logs de erro para análise:

```bash
npm run build 2>&1 | Out-File -FilePath "build-errors.log"
npm run dev 2>&1 | Out-File -FilePath "dev-errors.log"
```

## Pedir Ajuda

Se ainda tiver problemas, colete estas informações:

1. Versão do Node: `node --version`
2. Versão do npm: `npm --version`
3. Sistema Operacional: `systeminfo | Select-String "OS Name"`
4. Mensagem de erro completa
5. Últimas mudanças feitas no código

## Reset Completo (Último Recurso)

Se nada funcionar, faça um reset completo:

```bash
cd D:\downloads\PreflopLab

# Backup primeiro!
$backupPath = "D:\Backups\PreflopLab_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').zip"
Compress-Archive -Path "app\src" -DestinationPath $backupPath

# Reset
cd app
Remove-Item -Recurse -Force node_modules, dist, package-lock.json
npm install
npm run dev
```
