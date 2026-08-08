/** @lib-native */

/**
 * The library's translation seam.
 *
 * `@driverse/ui` deliberately ships no i18next runtime — react-i18next is not a dependency and not a
 * peer, so a consumer that does not localise pays nothing for the feature modules that do. But the
 * extracted feature modules ask for real `sys.*` keys (the apps' own), and returning the raw key would
 * render `sys.forms.insurance.overview` at the user, which is exactly the failure mode W5 caught in
 * export-button.
 *
 * So `useTranslate()` resolves in three steps:
 *   1. the `t` an app supplied through `<TranslateProvider t={t}>` — normally i18next's, so a localised
 *      app sees precisely what it saw before extraction;
 *   2. the library's own bundled `en_US` resources (`src/i18n/en_US.json`), which already carry the
 *      shared `sys.*` keys both apps defined — so an app with no i18n at all still gets English copy;
 *   3. the explicit fallback, or the key itself.
 *
 * Modules that need a single label rather than a whole tree should keep taking it as a plain prop
 * (see `export-button`'s `label`); this is for the deep trees where prop-drilling `t` is not viable.
 */

import { createContext, useContext, useMemo } from "react";
import en_US from "./en_US.json";

/**
 * i18next's `t`, narrowed to the call shapes the extracted modules use: a bare key, a key with a
 * literal fallback, or a key with `{{name}}` interpolation values.
 */
export type TranslateOptions = string | Record<string, unknown>;
export type TranslateFn = (key: string, options?: TranslateOptions) => string;

const TranslateContext = createContext<TranslateFn | null>(null);

/** Walks a dotted key through a nested resource bundle. Returns undefined unless it lands on a string. */
function lookup(resources: unknown, key: string): string | undefined {
	let cursor: unknown = resources;
	for (const part of key.split(".")) {
		if (typeof cursor !== "object" || cursor === null) return undefined;
		cursor = (cursor as Record<string, unknown>)[part];
	}
	return typeof cursor === "string" ? cursor : undefined;
}

/** Substitutes i18next's `{{name}}` placeholders. Unknown placeholders are left in place, as i18next does. */
function interpolate(template: string, values: Record<string, unknown>): string {
	return template.replace(/{{\s*(\w+)\s*}}/g, (match, name) => (name in values ? String(values[name]) : match));
}

export const translateFromBundle: TranslateFn = (key, options) => {
	const fallback = typeof options === "string" ? options : undefined;
	const resolved = lookup(en_US, key) ?? fallback ?? key;
	return options && typeof options !== "string" ? interpolate(resolved, options) : resolved;
};

export type TranslateProviderProps = {
	children: React.ReactNode;
	/**
	 * Usually i18next's `t`. Because i18next returns the key itself for a missing translation, a key it
	 * cannot resolve falls through to the library's bundle rather than reaching the user as a key.
	 */
	t?: TranslateFn;
};

export function TranslateProvider({ children, t }: TranslateProviderProps) {
	const translate = useMemo<TranslateFn>(() => {
		if (!t) return translateFromBundle;
		return (key, options) => {
			const translated = t(key, options);
			return translated && translated !== key ? translated : translateFromBundle(key, options);
		};
	}, [t]);

	return <TranslateContext.Provider value={translate}>{children}</TranslateContext.Provider>;
}

/**
 * Returns the active translator. Safe to call outside a `TranslateProvider` — it falls back to the
 * library's bundled English copy, so a module renders sensibly in Storybook and tests with no setup.
 */
export function useTranslate(): TranslateFn {
	return useContext(TranslateContext) ?? translateFromBundle;
}
