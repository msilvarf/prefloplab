---
description: Executar testes unitários e de integração
---

# Testes

Este workflow executa os testes do projeto.

## Nota

⚠️ **Testes não estão configurados ainda neste projeto.**

Para adicionar testes ao PreflopLab, siga os passos abaixo.

## Setup de Testes (Vitest)

### 1. Instalação

```bash
cd app
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2. Configuração do Vitest

Adicione ao `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### 3. Arquivo de Setup

Crie `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

### 4. Script no package.json

Adicione em `scripts`:

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

## Executar Testes (Quando Configurado)

// turbo
### Modo Watch (recomendado para desenvolvimento)
```bash
npm test
```

### Executar uma vez
```bash
npm test -- --run
```

### Com UI
```bash
npm run test:ui
```

### Com Coverage
```bash
npm run test:coverage
```

## Exemplo de Teste

Crie `src/components/__tests__/Sidebar.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  it('deve renderizar o título Biblioteca', () => {
    const mockLibrary = {
      nodes: [],
      // ... outros props necessários
    }
    
    render(<Sidebar library={mockLibrary} onSelectChart={() => {}} />)
    expect(screen.getByText('Biblioteca')).toBeInTheDocument()
  })
})
```

## Testes Recomendados para PreflopLab

1. **Componentes UI**
   - `Sidebar.test.tsx`
   - `TreeNode.test.tsx`
   - `DrillCard.test.tsx`

2. **Hooks**
   - `useDrillSession.test.ts`
   - `useSidebarDialog.test.ts`
   - `useLibrary.test.ts`

3. **Utilitários**
   - `NodeStyles.test.tsx`
   - Funções de cálculo de ranges

## E2E Testing (Futuro)

Para testes end-to-end, considere Playwright:

```bash
npm install -D @playwright/test
npx playwright install
```

Adicione script:
```json
{
  "test:e2e": "playwright test"
}
```
