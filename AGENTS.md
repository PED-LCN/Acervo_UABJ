# Panel UA — Product and Engineering Guide

## Product mission

Panel UA is the student-facing interface for the UABJ Computer Engineering
materials repository. GitHub is the storage and contribution backend, not the
experience to reproduce.

The primary journey is: find a material, understand its academic context,
preview it, then download or share it.

## Domain model

- Represent repository directories as friendly branches and files as leaves.
- Translate technical paths into academic labels without changing source URLs.
- Prefer the hierarchy period → subject → category → material when the
  source repository supports it; preserve unknown structures gracefully.
- Search must return both branches and leaves and reveal each result's path.
- Never invent academic metadata that cannot be derived from the repository.

## Experience principles

- Design for students, not GitHub users: avoid `root`, `DIR`, `FILE`, SHA and
  branch terminology in the main interface.
- The collection tree, search and preview are one connected workflow.
- PDF preview is a first-class feature and must have a spacious reading mode.
- Every material must remain downloadable and linkable to its GitHub source.
- Mobile navigation must be usable without rendering a dense node graph.
- A graph may be an optional collection map, never the only navigation method.

## Architecture

- React, TypeScript and Vite remain the base stack.
- Keep GitHub transport in `src/services` and environment access in
  `src/config`.
- Keep repository types and student-facing derived models in `src/types`.
- UI components must not call the GitHub API directly.
- Handle GitHub errors, rate limits and truncated tree responses explicitly.
- Never ship a GitHub token through `VITE_*`; browser variables are public.
- Prefer derived state over duplicated Zustand state.

## Implementation quality

- Provide visible loading, empty and error states.
- Preserve deep links for branches and materials.
- Resolve relative Markdown links and images against the source file.
- Keep interactions keyboard accessible and controls clearly labelled.
- Remove abandoned features, assets and dependencies when replacing them.
- Keep documentation aligned with implemented behavior.

## Required verification

Before completing a meaningful change:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Test repository loading without a token.
4. Test branch navigation, file search and a direct deep link.
5. Test PDF, Markdown, image and unsupported-file behavior.
6. Check the main layout at desktop and mobile widths.

