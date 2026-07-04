---
  name: NYU Health Finder feature patterns
  description: Patterns used for filter dropdowns and multi-item comparison features in the nyu-health-finder artifact
  ---

  For filtering clinics by a related entity (e.g. insurance plan), add the filter as an optional query param on the list endpoint and resolve matching IDs via the join table, falling back to an impossible ID (e.g. -1) when no matches exist so the query safely returns zero rows instead of erroring or returning everything.

  For multi-item comparison features (2-3 items), prefer a dedicated route with selected IDs in the query string (e.g. /compare?ids=1,2,3) over a modal — it's shareable/bookmarkable and simpler state management than a modal reachable from multiple pages.

  **Why:** Keeps filtering logic server-side and reusable, and makes comparison state part of the URL rather than component state that's lost on navigation.
  