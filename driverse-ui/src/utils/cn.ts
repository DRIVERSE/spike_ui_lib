/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/index.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/index.ts
 * @status identical
 * @notes Both apps declare the same `cn` at the top of a large app-specific utils/index.ts (compliance
 *        rules, payment schedules, GraphQL shapes). Only `cn` is library-grade, so it is lifted into its
 *        own module; the rest of utils/index.ts stays app-side.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** clsx + tailwind-merge: conditional class names with later tailwind utilities winning. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
