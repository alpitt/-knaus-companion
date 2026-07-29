# Ownership Intelligence guide

Knaus Companion 18.0.0 builds a local, traceable read model from records already stored in the app. Open **Ownership Intelligence** to review the active profile, record counts, unknown dates, costs and links to the dedicated timeline, costs and provenance views.

## Ownership profile and dates

Record only dates and odometer readings you know. Acquisition cost, disposal value, seller type and evidence are optional. Unknown is valid. Disposal must be an explicit owner action; the app does not infer ownership, valuation or depreciation.

## Ownership events and timeline

Every derived event retains its source type, source ID and source revision. `occurredAt` is the real-world date when known; `recordedAt` is never silently substituted. Rebuilding the in-memory index is deterministic and does not alter the sources.

## Statistics, comparisons and patterns

Statistics show sample sizes and missing data. Comparisons never treat missing data as zero. A recurring result means only that explicit identifiers or categories repeat; it is not a diagnosis or root-cause claim.

## Health, quality, reports and backup

Vehicle Health snapshots are created only on explicit request and are not roadworthiness certificates or forecasts. Quality checks report broken, orphaned or duplicate candidates without repairing them. JSON backup automatically includes additive ownership collections under schema version 2. Export a backup before major changes.

## Privacy and troubleshooting

All ownership information stays in this browser. Nothing is uploaded. If totals look incomplete, review filters, archived records, missing dates, allocations and currencies; different currencies are intentionally separate.
