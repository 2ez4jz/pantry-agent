# Work Log

## 2026-09-26 — Personal Data Hub V1
- Reframed the project from Pantry Agent into a broader personal health/food data hub.
- Added Overview, Nutrition, Activity, Body, and Food views.
- Added repo-backed `data/store.json` so Codex can enter daily data through Git commits.
- Added trend views for weight and calorie intake.
- Added manual local-entry forms for daily data, meals, workouts, body metrics, and inventory.
- Preserved Food inventory and Meal Prep as first-class modules.
- Kept LLM/Agent logic out of the deterministic data layer for now.
