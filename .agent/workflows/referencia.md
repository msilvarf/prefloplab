---
description: Referência rápida de comandos comuns
---

# Referência Rápida - PreflopLab

Comandos mais usados no dia a dia.

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
cd app && npm run dev

# Build de produção
cd app && npm run build

# Preview da build
cd app && npm run preview
```

## 🔍 Qualidade de Código

```bash
# Verificar erros
cd app && npm run lint

# Corrigir erros automaticamente
cd app && npx eslint src --fix

# Verificar tipos TypeScript
cd app && npx tsc --noEmit
```

## 📦 Gerenciamento de Pacotes

```bash
# Instalar dependência
cd app && npm install <pacote>

# Instalar dev dependency
cd app && npm install -D <pacote>

# Atualizar pacotes
cd app && npm update

# Ver pacotes desatualizados
cd app && npm outdated

# Remover pacote
cd app && npm uninstall <pacote>
```

## 🧹 Limpeza

```bash
# Limpar node_modules e reinstalar
cd app
Remove-Item -Recurse -Force node_modules
npm install

# Limpar cache
cd app && npm cache clean --force

# Limpar build
cd app && Remove-Item -Recurse -Force dist
```

## 🔧 Git

```bash
# Status
git status

# Adicionar todos arquivos
git add .

# Commit
git commit -m "mensagem"

# Push
git push

# Ver histórico
git log --oneline --graph -10

# Criar branch
git checkout -b feature/nova-funcionalidade

# Voltar ao main
git checkout main
```

## 📊 Informações

```bash
# Ver estrutura do projeto
cd app && tree /F /A

# Ver tamanho das pastas
Get-ChildItem -Directory | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    "$($_.Name): $([math]::Round($size, 2)) MB"
}

# Contar linhas de código
Get-ChildItem -Path src -Include *.ts,*.tsx,*.js,*.jsx -Recurse | 
    Get-Content | 
    Measure-Object -Line | 
    Select-Object Lines
```

## 🐛 Debug

```bash
# Ver processos Node rodando
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Matar processo na porta 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Ver logs em tempo real
cd app && npm run dev 2>&1 | Tee-Object -FilePath dev.log
```

## 📁 Estrutura do Projeto

```
PreflopLab/
├── app/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── library-tree/
│   │   │   ├── treinador/
│   │   │   └── ui/
│   │   ├── views/          # Views principais
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   └── lib/            # Utilitários
│   ├── public/             # Arquivos estáticos
│   └── dist/               # Build de produção
└── .agent/
    └── workflows/          # Este arquivo!
```

## 🔑 Atalhos do VSCode

- `Ctrl + Shift + P` - Command Palette
- `Ctrl + P` - Buscar arquivo
- `Ctrl + Shift + F` - Buscar em todos arquivos
- `Ctrl + B` - Toggle sidebar
- `Ctrl + J` - Toggle terminal
- `Ctrl + Shift + L` - Selecionar todas ocorrências
- `Alt + Up/Down` - Mover linha
- `Ctrl + /` - Comentar linha

## 📚 Comandos dos Workflows

```bash
# Usar workflows
/dev          # Iniciar desenvolvimento
/build        # Build de produção
/lint         # Verificar código
/deploy       # Deploy
/clean        # Limpar
/update       # Atualizar dependências
/backup       # Fazer backup
/diagnostico  # Diagnosticar problemas
```

## 🆘 Quando Algo Dá Errado

1. **Primeiro**: `cd app && npm run lint`
2. **Segundo**: `cd app && npx tsc --noEmit`
3. **Terceiro**: Limpar cache e reinstalar
4. **Último recurso**: Use `/diagnostico`

## 🎯 Próximos Passos Úteis

- Configurar testes: `/test`
- Fazer backup: `/backup`
- Atualizar deps: `/update`
- Deploy: `/deploy`
