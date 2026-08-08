/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/useDebounce.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-debounce.tsx
 * @status identical
 * @notes Byte-identical in both apps despite living at different paths (A files it under utils/).
 *        Lifted verbatim; the value type is widened from `string` to a generic so non-string search
 *        state can use it too — every existing call site passes a string and still type-checks.
 */

import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay = 500) => {
	const [debounceValue, setDebounceValue] = useState(value);

	useEffect(() => {
		const handleTimer = setTimeout(() => {
			setDebounceValue(value);
		}, delay);

		return () => {
			clearTimeout(handleTimer);
		};
	}, [value, delay]);

	return debounceValue;
};
