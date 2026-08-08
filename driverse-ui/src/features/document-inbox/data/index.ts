/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/data/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/data/index.tsx
 * @status merged
 * @notes A had all five document types live; B had four of them commented out (a runtime feature flag,
 *        not a structural difference — the manual-entry form in `view-manual-form/index.tsx` still has a
 *        working `case` for every one of them). Rather than pick one app's flag state, this module ships
 *        the full set — matching what the code actually supports — and lets a host app narrow it via
 *        `DocumentInboxDataSource.documentTypeOptions` (see `../types.ts`), which is what B effectively
 *        wanted.
 */

import type { DocumentTypeOption } from "../types";

export const DOCUMENT_TYPE_OPTIONS: DocumentTypeOption[] = [
	{ label: "Pollution Test", value: "pollution_test" },
	{ label: "Insurance", value: "insurance" },
	{ label: "Tenencia", value: "tenencia" },
	{ label: "Refrendo", value: "refrendo" },
	{ label: "Circulation Card", value: "circulation" },
];
