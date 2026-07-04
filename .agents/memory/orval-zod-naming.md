---
name: Orval query-param/response Zod naming
description: How Orval names generated Zod schemas for GET endpoint query params and response bodies, since they don't match the OpenAPI component name directly.
---

For a GET endpoint with a named response schema (e.g. `AppointmentWithClinic`) and inline query
params, the Orval-generated `@workspace/api-zod` exports use operation-derived names, not the
OpenAPI component name:

- Query params → `<OperationId>QueryParams` (e.g. `listAppointmentsByEmail` query params →
  `ListAppointmentsByEmailQueryParams`), not `<OperationId>Params`.
- Array response body → `<OperationId>Response` = `zod.array(<OperationId>ResponseItem)`, and the
  per-item schema is `<OperationId>ResponseItem`, not the referenced component schema name.

**Why:** Assuming the component schema name (e.g. `AppointmentWithClinic`) is importable directly
caused `TS2693: only refers to a type, but is being used as a value` — the referenced schema exists
as a TypeScript type in `api-zod/generated/types/`, but the runtime Zod validator is only exported
under the operation-derived name in `api-zod/generated/api.ts`.

**How to apply:** After running codegen for a new GET endpoint, grep
`lib/api-zod/src/generated/api.ts` for the actual exported const names before writing route code,
rather than guessing based on the OpenAPI schema name.
