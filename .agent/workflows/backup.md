---
description: Fazer backup do projeto
---

# Backup do Projeto

Este workflow cria backups seguros do PreflopLab.

## Backup Completo

// turbo
1. Crie uma pasta de backups (primeira vez)
```bash
New-Item -ItemType Directory -Force -Path "D:\Backups\PreflopLab"
```

2. Crie um backup com data
```bash
$date = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupPath = "D:\Backups\PreflopLab\backup_$date.zip"
Compress-Archive -Path "D:\downloads\PreflopLab\*" -DestinationPath $backupPath -Force
Write-Host "Backup criado em: $backupPath"
```

## Backup Apenas do Código-fonte

Para backup sem node_modules e dist:

```bash
$date = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupPath = "D:\Backups\PreflopLab\source_$date.zip"

Get-ChildItem -Path "D:\downloads\PreflopLab" -Recurse | 
    Where-Object { 
        $_.FullName -notmatch "node_modules|dist|\\.git" 
    } | 
    Compress-Archive -DestinationPath $backupPath -Update

Write-Host "Backup do código criado em: $backupPath"
```

## Backup Git (Recomendado)

O melhor backup é usar Git com repositório remoto:

### Criar repositório no GitHub

1. Vá para github.com e crie um novo repositório "PreflopLab"

2. Configure o Git local
```bash
cd D:\downloads\PreflopLab
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/PreflopLab.git
git push -u origin main
```

### Backup via Git (diário)

```bash
cd D:\downloads\PreflopLab
git add .
git commit -m "Backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push
```

## Restaurar Backup

### De arquivo ZIP
```bash
Expand-Archive -Path "D:\Backups\PreflopLab\backup_2026-01-30.zip" -DestinationPath "D:\downloads\PreflopLab_Restaurado"
```

### Do Git
```bash
git clone https://github.com/seu-usuario/PreflopLab.git
cd PreflopLab/app
npm install
```

## Backup Automático (Agendado)

Crie um script `backup.ps1`:

```powershell
$date = Get-Date -Format "yyyy-MM-dd_HHmmss"
$source = "D:\downloads\PreflopLab"
$destination = "D:\Backups\PreflopLab\backup_$date.zip"

# Manter apenas últimos 10 backups
Get-ChildItem "D:\Backups\PreflopLab" -Filter "backup_*.zip" | 
    Sort-Object CreationTime -Descending | 
    Select-Object -Skip 10 | 
    Remove-Item -Force

# Criar novo backup
Compress-Archive -Path "$source\*" -DestinationPath $destination -Force

Write-Host "✓ Backup automático criado: $destination"
```

Agende no Windows Task Scheduler para rodar diariamente.

## Backup na Nuvem

### OneDrive/Google Drive
Copie a pasta para sua nuvem:
```bash
Copy-Item -Path "D:\downloads\PreflopLab" -Destination "C:\Users\SeuUsuario\OneDrive\Backups\PreflopLab" -Recurse -Force
```

### Dropbox
Similar ao OneDrive, copie para a pasta do Dropbox.

## Checklist de Backup

Antes de fazer mudanças grandes:
- [ ] Commit no Git
- [ ] Push para repositório remoto
- [ ] Backup ZIP local (opcional)
- [ ] Testar restauração (periodicamente)
