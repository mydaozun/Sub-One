# Frontend Architecture

## Directory Responsibilities

- `src/features/*`
  - Business feature modules.
  - Each feature owns its `components`, views, and feature-specific logic.
  - Cross-feature reuse is discouraged unless moved to `src/shared`.

- `src/shared/components/layout`
  - Global layout shell components (sidebar, footer).

- `src/shared/components/ui`
  - Reusable, domain-agnostic UI primitives and composites.
  - Examples: modal, pagination, empty state, toast.

- `src/shared/composables`
  - Reusable composables that are not tied to a single feature.
  - Examples: pagination, batch selection, tab action trigger.

- `src/shared/constants`
  - Global constants/config used across features.

- `src/pages`
  - Route-level pages that compose features.

- `src/stores`
  - Pinia stores for global state.

- `src/utils`
  - Pure utility helpers and API adapters.

- `src/types`
  - Shared TypeScript type definitions.

## Naming Rules

- Feature-specific components should include feature intent in name.
  - Example: `NodeDistributionChart.vue` (instead of generic `NodeChart.vue`).
- Reusable UI in `shared/components/ui` should use neutral names.
  - Example: `MoreMenu.vue`, `BatchActionToolbar.vue`.
- Composables use `useXxx` naming and live in `shared/composables` when reusable.

## Dependency Direction

- Allowed:
  - `pages -> features -> shared`
  - `features -> stores/utils/types`
- Avoid:
  - `shared -> features`
  - Feature A directly depending on Feature B internals.

## Refactor Checklist

When adding/changing frontend code:

1. Decide if logic is feature-specific or shared.
2. Place file by responsibility, not by file type only.
3. Prefer clear names over short names.
4. Keep page files orchestration-focused, push details into feature/shared layers.
5. Validate with `npm run build`.
