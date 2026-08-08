# Chip / Pill / StatusChip

## What shipped

`src/components/chip` is the merge of both apps' `components/chip/index.tsx`. Business's exported
`VARIANT_STYLES` is the base — Autocredit rebuilt an identical map inside every render, and Business's
`Pill` already imported the exported one. Autocredit's three telematics keys (`moving`, `parked`,
`offline`, all success-coloured) are added on top. 56 variants total, no value conflicts: every key the
two maps shared already carried the same colours.

`ChipVariant` lives in `src/components/chip/types.ts` rather than the apps' 600-line `types/entity.ts`.
It is the union of both apps' unions.

## Label handling

Business normalized underscores and capitalized unconditionally; Autocredit did neither. That is now the
`labelTransform` prop, defaulting to Business's behaviour:

```tsx
<Chip label="UNDER_REVIEW" />                              // "Under review"
<Chip label="UNDER_REVIEW" isTextNormal />                 // "UNDER REVIEW"
<Chip label="UNDER_REVIEW" isTextNormal labelTransform={(s) => s} />  // "UNDER_REVIEW" (Autocredit)
```

## status-chip is deliberately not ported

Business's `src/components/status-chip` is redundant with Chip: same pill shape, same status vocabulary,
a smaller colour table, and no remove affordance. The program manifest lists it under "never extract".
Call sites migrate to `<Chip variant={status} label={status} />`, or `<Pill variant={status}>` when they
only need the read-only badge. `src/charts/presets/count-badge.tsx` shows the pattern — it maps antd
colour names onto chip variants rather than keeping its own palette.

## Tests

`src/components/components.test.tsx` snapshots the full variant matrix, so any colour change to any
status shows up as a diff.
