/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/storage.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/storage.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim except for the key type. The apps typed keys as
 *        `StorageEnum` from the app-level `#/enum`; the library widens that to `string`, which every
 *        StorageEnum member already satisfies, so app call sites compile unchanged and the library
 *        avoids owning an app's storage-key namespace.
 */

export const getItem = <T>(key: string): T | null => {
	let value = null;
	try {
		const result = window.localStorage.getItem(key);
		if (result) {
			value = JSON.parse(result);
		}
	} catch (error) {
		console.error(error);
	}
	return value;
};

export const getStringItem = (key: string): string | null => {
	return localStorage.getItem(key);
};

export const setItem = <T>(key: string, value: T): void => {
	localStorage.setItem(key, JSON.stringify(value));
};

export const removeItem = (key: string): void => {
	localStorage.removeItem(key);
};

export const clearItems = () => {
	localStorage.clear();
};
