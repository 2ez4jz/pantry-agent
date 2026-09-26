# Personal Data Hub — Data Model v1

`data/store.json` is the repo-backed source of truth for the MVP.

## daily[]
One normalized row per date.

```json
{
  "date": "2026-09-26",
  "body": {
    "weightKg": 74.5,
    "vo2max": 35.0,
    "restingHr": 60
  },
  "activity": {
    "steps": 12000,
    "exerciseMinutes": 45,
    "activeCalories": 500,
    "distanceKm": 8.0
  },
  "nutrition": {
    "calories": 2100,
    "proteinG": 150,
    "carbsG": 180,
    "fatG": 70
  },
  "sleep": {
    "hours": 7.0
  }
}
```

## meals[]
Detailed meal-level records. Daily nutrition totals should remain in `daily[].nutrition`.

## workouts[]
Individual workouts: type, duration, distance, average heart rate, notes.

## bodyMetrics[]
Optional extra body measurements outside the daily aggregate.

## inventory[]
Current food inventory. Use stable IDs when possible.

## mealPrep[]
Prepared-food inventory with servings and per-serving nutrition.

## Current workflow
1. Codex can update `data/store.json` directly from the user's daily numbers.
2. The static dashboard reads that JSON automatically.
3. Manual browser entries are stored locally for fast experimentation and can be exported.
4. Later, replace the JSON file with a real database/API while preserving this schema as much as possible.
