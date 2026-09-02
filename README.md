# Acervo UABJ

Interface estudantil para consultar o repositório comunitário de materiais de
Engenharia da Computação da UABJ.

A aplicação transforma a estrutura técnica do GitHub em uma navegação amigável:

- períodos, disciplinas e categorias aparecem como seções visuais;
- arquivos aparecem como materiais pesquisáveis;
- PDFs, Markdown, imagens e código podem ser conferidos na plataforma;
- cada material continua disponível para download e consulta no GitHub;
- links diretos preservam a seção e o material selecionados.
- planejador de grade com catálogo do PPC, pré-requisitos e conflitos de horário;
- progresso e simulações salvos somente no navegador, com backup em JSON.

O conteúdo vem de
[`FelipePatriota/uabj-engenharia-computacao`](https://github.com/FelipePatriota/uabj-engenharia-computacao).

O catálogo inicial do planejador foi transcrito do PPC de Engenharia de
Computação de 2020. Ele é uma referência de apoio e não substitui a oferta ou
as regras publicadas nos sistemas oficiais da universidade.

## Stack

- React 19 + TypeScript + Vite
- Zustand
- React Markdown + Remark GFM
- GitHub REST API

## Configuração

Copie `.env.example` para `.env` quando quiser alterar a fonte do acervo:

```env
VITE_GITHUB_OWNER=FelipePatriota
VITE_GITHUB_REPO=uabj-engenharia-computacao
VITE_GITHUB_BRANCH=main
VITE_BASE_PATH=/Acervo_UABJ/
```

Tokens não são aceitos no frontend: variáveis `VITE_*` são públicas no
bundle. O site consulta apenas dados de um repositório público.

## Desenvolvimento

```bash
npm ci
npm run dev
```

## Verificação

```bash
npm run lint
npm run build
npm run preview
```

## Publicação

O workflow `.github/workflows/deploy.yml` publica o build no GitHub Pages em
pushes para `main`. No repositório do painel, configure Pages com a fonte
**GitHub Actions**.

## Princípios do projeto

Consulte [`AGENTS.md`](./AGENTS.md) antes de fazer mudanças amplas. O GitHub é
a fonte dos arquivos, mas a interface deve falar a linguagem dos alunos.
