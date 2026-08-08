/** @lib-native */

/**
 * Theme enums owned by the library.
 *
 * Both apps import these from a root-level `#/enum` module that also carries auth, router and
 * permission enums. The library re-declares only the theme-facing members so nothing in `src/`
 * depends on an app path alias. Apps can keep their own `#/enum` — the string values are
 * identical, so the two are structurally interchangeable.
 */
export enum ThemeMode {
	Light = "light",
	Dark = "dark",
}

export enum ThemeColorPresets {
	Default = "default",
	Cyan = "cyan",
	Purple = "purple",
	Blue = "blue",
	Orange = "orange",
	Red = "red",
}
