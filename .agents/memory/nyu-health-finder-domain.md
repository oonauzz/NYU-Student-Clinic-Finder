---
name: NYU Health Finder domain decisions
description: Non-obvious modeling choices for the clinic directory (borough/insurance/doctor images/NYU comparison sector)
---

- Clinic insurance coverage is modeled as a many-to-many join table (clinic <-> insurance_plans), not a boolean flag, since clinics accept multiple named plans that need individual display.
- Doctor headshot photos are NOT stored in the DB — they're computed deterministically at the API layer as `https://i.pravatar.cc/300?u=doctor-${id}` so the same doctor always gets the same avatar without needing image storage/upload.
- The official NYU Student Health Center is modeled as a regular row in the `clinics` table with `is_nyu_health_center=true`, not a separate table — this lets it be filtered/sorted/compared alongside off-campus clinics using the same UI and API.
- Location filtering is two-level (borough -> neighborhood), mirroring StreetEasy's drill-down pattern, backed by a `/clinics/boroughs` endpoint that groups neighborhoods per borough rather than a flat neighborhood list.
