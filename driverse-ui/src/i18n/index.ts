/** @lib-native */

/**
 * GENERATED bundles, hand-written helper. Run `node scripts/gen-i18n-base.mjs` to refresh the JSON.
 *
 * The base translation bundle: every `sys.*` key both apps define in both locales — 534 keys.
 * App-specific keys stay in the apps, and `mergeLibI18n` never overwrites them.
 *
 * 101 shared key(s) carry different copy between the two apps (28 en_US, 73 es_ES) — almost all of it
 * es_ES phrasing drift. Business's wording is used; every divergence is tabulated in
 * docs/i18n-conflicts.md so it can be reconciled deliberately rather than silently.
 */
import type { i18n as I18nInstance } from "i18next";
import en_US from "./en_US.json";
import es_ES from "./es_ES.json";

export { en_US, es_ES };

export const baseResources = { en_US, es_ES } as const;

export type BaseLocale = keyof typeof baseResources;

/**
 * Adds the library's base bundle to an existing i18next instance. The bundle keeps the `sys` root the
 * apps' sys.json files have and goes into i18next's default `translation` namespace, which is where both
 * apps spread theirs — so `t("sys.api.errorTip")` resolves unchanged.
 * Deep-merged and non-destructive: `addResourceBundle(..., deep, overwrite=false)` means an app key
 * always wins over the library's.
 *
 * @example
 * import i18n from "@/locales/i18n";
 * mergeLibI18n(i18n);
 */
export function mergeLibI18n(i18n: I18nInstance, namespace = "translation"): void {
	for (const [locale, resources] of Object.entries(baseResources)) {
		i18n.addResourceBundle(locale, namespace, resources, /* deep */ true, /* overwrite */ false);
	}
}

export {
	type TranslateFn,
	type TranslateOptions,
	type TranslateProviderProps,
	TranslateProvider,
	translateFromBundle,
	useTranslate,
} from "./translate";
