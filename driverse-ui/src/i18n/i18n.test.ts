import i18next from "i18next";
import { describe, expect, it } from "vitest";
import { baseResources, en_US, es_ES, mergeLibI18n } from "./index";

/** { a: { b: "x" } } -> ["a.b"] */
const flatKeys = (obj: Record<string, unknown>, prefix = ""): string[] =>
	Object.entries(obj).flatMap(([key, value]) => {
		const next = prefix ? `${prefix}.${key}` : key;
		return value && typeof value === "object" ? flatKeys(value as Record<string, unknown>, next) : [next];
	});

describe("i18n base bundle", () => {
	it("ships both locales with identical key sets", () => {
		const en = flatKeys(en_US).sort();
		const es = flatKeys(es_ES).sort();
		expect(en).toEqual(es);
		expect(en.length).toBeGreaterThan(500);
	});

	it("has no empty translations", () => {
		for (const [locale, bundle] of Object.entries(baseResources)) {
			const empties = flatKeys(bundle).filter((key) => {
				const value = key.split(".").reduce<any>((cursor, part) => cursor?.[part], bundle);
				return typeof value !== "string" || value.trim() === "";
			});
			expect(empties, `${locale} has empty values`).toEqual([]);
		}
	});

	it("carries the shared keys both apps define", () => {
		const keys = flatKeys(en_US);
		for (const key of ["sys.api.apiRequestFailed", "sys.login.signInFormTitle", "sys.menu.dashboard"]) {
			expect(keys, `missing ${key}`).toContain(key);
		}
	});

	it("mergeLibI18n adds the bundle without overwriting app keys", async () => {
		const instance = i18next.createInstance();
		await instance.init({
			lng: "en_US",
			// Same shape the apps use: sys.json spread into the default translation namespace.
			resources: { en_US: { translation: { sys: { api: { errorTip: "App wins" } } } } },
		});

		mergeLibI18n(instance);

		// App key survives, library keys are added underneath it.
		expect(instance.t("sys.api.errorTip")).toBe("App wins");
		expect(instance.t("sys.api.apiRequestFailed")).toBe((en_US as any).sys.api.apiRequestFailed);
	});

	it("merges es_ES too", async () => {
		const instance = i18next.createInstance();
		await instance.init({ lng: "es_ES", resources: {} });
		mergeLibI18n(instance);

		expect(instance.t("sys.api.apiRequestFailed")).toBe((es_ES as any).sys.api.apiRequestFailed);
	});
});
