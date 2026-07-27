# Owner records guide

## Recording real vehicle history

Open **Vehicle records** and choose **Create record**. Select the record type and status, then add only what is known. A title is required; dates, mileage, costs, components and evidence remain optional when genuinely unknown. Records are private to this browser and included in application backups.

Use an **observation** for something noticed but not diagnosed. Use **fault** to follow a symptom from open through investigation, waiting, resolution, monitoring or archive. Suspected causes remain separate from confirmed causes, and reopening retains earlier revisions. Use **maintenance**, **service**, **repair** or **part replacement** for work. Explicit time and distance intervals calculate the next due point deterministically; no predictive maintenance is performed.

Use **modification** to record original and new configuration, affected components, evidence, implications and rollback information. A completed modification appears in owner history but never rewrites the reference Digital Twin. Measurement records preserve the entered value and unit. Record conditions and instrument context; the app does not silently convert or diagnose a reading.

## Evidence, timeline and reports

Link records to components, other records, photographs, documents, manual pages, chapters or Canon identifiers. Pending evidence may be recorded without claiming a file exists. The **Vehicle timeline** groups records chronologically without copying full payloads. Individual records, filtered history and the timeline can be printed. JSON imports are previewed and validated; conflicts can be skipped, explicitly replaced or imported as a draft copy.

Archive instead of deleting. Archived records retain revisions and can be restored. Export an application backup before major imports or maintenance work. Restore previews include owner-record counts and validation failure never partially replaces current data.

## Troubleshooting and privacy

- Save rejected: review the error summary for title, date, reference, measurement or unsafe-text errors.
- Missing component: choose an existing Digital Twin component; misspelled input never creates one.
- Import rejected: correct invalid records and retry; no partial import is retained.
- Storage unavailable/full: free browser storage before retrying.
- Broken links: review Application Health; incomplete evidence is a review item, malformed data is an application error.

No owner record, photograph, document, assistant trace or measurement is uploaded. There is no analytics, telemetry, remote logging or external AI.
