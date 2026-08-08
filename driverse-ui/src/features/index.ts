/**
 * Feature modules are consumed through their own subpath export — `@driverse/ui/features/telemetry`,
 * `@driverse/ui/features/multi-tabs`, and so on — so each one's heavy optional peers (leaflet, dnd-kit,
 * ag-grid, apollo-shaped data sources) stay out of an app that does not use it.
 *
 * This barrel exists for the library's own cross-module imports and for tooling that wants one entry
 * point. It re-exports each module under a namespace rather than flat, because the modules legitimately
 * share names — `UploadComplianceImage` is defined by both vehicle-insurance and vehicle-compliance, and
 * flattening would make one silently shadow the other.
 */

export * as documentInbox from "./document-inbox";
export * as fleetTrackingMap from "./fleet-tracking-map";
export * as multiTabs from "./multi-tabs";
export * as telemetry from "./telemetry";
export * as vehicleCompliance from "./vehicle-compliance";
export * as vehicleInsurance from "./vehicle-insurance";
