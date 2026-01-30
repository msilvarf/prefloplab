# Workflows do PreflopLab

Esta pasta contém workflows documentados para tarefas comuns do projeto.

## 📋 Lista de Workflows

| Workflow | Comando | Descrição |
|----------|---------|-----------|
| **Build** | `/build` | Construir o projeto para produção |
| **Dev** | `/dev` | Iniciar servidor de desenvolvimento |
| **Lint** | `/lint` | Verificar e corrigir problemas de código |
| **Deploy** | `/deploy` | Fazer deploy da aplicação |
| **Clean** | `/clean` | Limpar arquivos temporários e cache |
| **Test** | `/test` | Executar testes (configuração incluída) |
| **Update** | `/update` | Atualizar dependências |
| **Backup** | `/backup` | Fazer backup do projeto |
| **Diagnóstico** | `/diagnostico` | Diagnosticar e resolver problemas |
| **Referência** | `/referencia` | Comandos rápidos e úteis |

## 🚀 Como Usar

### Via Slash Commands (Recomendado)

Basta digitar o slash command durante a conversa:

```
/dev
```

Isso carregará automaticamente o workflow correspondente.

### Manualmente

Você também pode ler os workflows diretamente:

```bash
Get-Content .agent\workflows\dev.md
```

## 🔥 Workflows com Turbo Mode

Alguns workflows têm a anotação `// turbo` ou `// turbo-all`, que permite execução automática de comandos seguros:

- ✅ **dev.md** - Auto-run do servidor dev
- ✅ **build.md** - Auto-run do build
- ✅ **clean.md** - Auto-run de limpeza
- ✅ **deploy.md** - Alguns comandos auto-run

## 📚 Workflow Básico de Trabalho

### Desenvolvimento Diário

1. `/dev` - Iniciar servidor
2. Fazer mudanças no código
3. `/lint` - Verificar qualidade
4. Commit e push

### Antes de Deploy

1. `/lint` - Verificar código
2. `/build` - Testar build
3. `/backup` - Fazer backup (opcional)
4. `/deploy` - Deploy

### Quando Algo Dá Errado

1. `/diagnostico` - Identificar problema
2. `/clean` - Limpar cache
3. `/referencia` - Consultar comandos

## 🆕 Adicionar Novo Workflow

Para criar um novo workflow:

1. Crie um arquivo `.md` nesta pasta
2. Adicione o frontmatter YAML:
   ```yaml
   ---
   description: Descrição curta do workflow
   ---
   ```
3. Documente os passos claramente
4. Use `// turbo` para comandos seguros
5. Atualize este README

## 📖 Estrutura de um Workflow

```markdown
---
description: Descrição breve
---

# Título do Workflow

Descrição detalhada do que o workflow faz.

## Passos

1. Passo 1
\`\`\`bash
comando
\`\`\`

// turbo
2. Passo 2 (auto-run se seguro)
\`\`\`bash
comando-seguro
\`\`\`

## Notas

Informações adicionais, troubleshooting, etc.
```

## 🔧 Manutenção

- Mantenha os workflows atualizados
- Teste comandos antes de documentar
- Use PowerShell para Windows
- Adicione exemplos práticos

## 💡 Dicas

- Use `/referencia` para consulta rápida
- Combine workflows: `/clean` + `/dev`
- Leia os workflows para entender o projeto
- Contribua com melhorias

---

**Última atualização**: 30/01/2026  
**Total de workflows**: 9
