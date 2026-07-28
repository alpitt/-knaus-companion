# Maintenance Intelligence guide

Version 17.0.0 adds local structured maintenance plans, explicit intervals, due-state assessment, recurrence previews, forecasts, campaigns, deferrals, completion records, parts, consumables, warranties, a calendar and a dashboard.

Create a plan from **Maintenance Intelligence**. Choose an interval only when you have an owner-defined requirement or cited source. Date, distance, trip, usage, seasonal and compound intervals retain their entered anchors, units, confidence and sources. Missing inputs show as `not-assessable`; they are never treated as not due.

Forecasts are deterministic schedule projections, not failure predictions. Deferral retains the original due information. Completion, partial completion, verification and next-cycle activation require explicit action. Workshop Job and inspection creation uses previews and never modifies faults, Trips or source records automatically.

Parts preserve installation, removal and replacement chains. Consumable use/refill quantities are explicitly entered. Warranty states use only recorded dates and terms. Calendar and dashboard information remains offline. Printing uses the browser print function; normal JSON backup/export includes metadata but no new binary data.

Troubleshooting: if an item is not assessable, review its interval anchor, current odometer/trip/usage input, source and warning window. Back up before large imports. Nothing is uploaded.
