# UABJ Repository Dashboard

Dashboard visual para explorar o repositório acadêmico de Engenharia da Computação (UABJ):

- Sidebar com buscas paralelas dinâmicas (adicionar/remover painéis)
- Navegação por pastas com breadcrumbs
- Grafo no painel principal com dois modos: hierarquia e semântico
- Visualização interna de arquivos
  - Markdown
  - Texto e código
  - Imagens
  - PDF
  - Office (fallback com download e abertura no GitHub)
- Ações por arquivo
  - Download
  - Copiar link do GitHub
  - Copiar deep link da visualização atual

## Stack

- React + Vite + TypeScript
- Zustand (estado global)
- React Flow (grafo)
- React Markdown + Remark GFM

## Configuração

Copie `.env.example` para `.env` e ajuste se necessário:

```bash
VITE_GITHUB_OWNER=FelipePatriota
VITE_GITHUB_REPO=uabj-engenharia-computacao
VITE_GITHUB_BRANCH=main
VITE_BASE_PATH=/Panel_UA/
VITE_GITHUB_TOKEN=
```

`VITE_GITHUB_TOKEN` é opcional e ajuda a evitar limites de requisição anônima.

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy no GitHub Pages

O workflow já está pronto em `.github/workflows/deploy.yml`.

Pré-requisitos no repositório:

1. Habilitar GitHub Pages com source “GitHub Actions”.
2. Usar branch `main` para disparar deploy.

Ao fazer push em `main`, o build gera `dist` e publica automaticamente.

## Limitações do MVP

- Sem autenticação GitHub (fase 2)
- Preview de arquivos Office ainda não nativo
- Grafo semântico exibe amostra dos arquivos para manter performance

## Status de autenticação

Este MVP está configurado para acesso público, sem login.
Se quiser ativar autenticação depois, isso entra como evolução separada (fase 2).
