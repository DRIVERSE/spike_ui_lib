/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/capitalize.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/capitalize.ts
 * @status adopted-B
 * @notes B is A plus two behaviours: a falsy input returns "-" (A returned "undefined" via string
 *        concatenation), and underscores become spaces before casing. Both are strict improvements and
 *        B is the version the merged Chip depends on.
 */

export function capitalize(str: string) {
	if (!str) return "-";
	const normalizedStr = str?.split("_")?.join(" ");
	const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedStr);
	if (isEmail) {
		return normalizedStr;
	}
	return normalizedStr?.charAt(0).toUpperCase() + normalizedStr?.slice(1).toLowerCase() || "";
}
