/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/event/use-copy-to-clipboard.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/event/use-copy-to-clipboard.ts
 * @status decoupled
 * @notes Byte-identical in both apps. One decoupling: the apps fired `toast.success("Copied!")` from
 *        sonner directly inside the hook. The library takes optional `onSuccess`/`onError` callbacks
 *        instead, so a hook does not decide how the app notifies. W6 owns the toast component and will
 *        provide the default wiring; until then apps pass their own `toast.success` in one line.
 */

import { useCallback, useState } from "react";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

type Options = {
	onSuccess?: (text: string) => void;
	onError?: (error: unknown) => void;
};

type ReturnType = {
	copyFn: CopyFn;
	copiedText: CopiedValue;
};

export default function useCopyToClipboard({ onSuccess, onError }: Options = {}): ReturnType {
	const [copiedText, setCopiedText] = useState<CopiedValue>(null);

	const copyFn: CopyFn = useCallback(
		async (text) => {
			if (!navigator?.clipboard) {
				console.warn("Clipboard not supported");
				return false;
			}

			try {
				await navigator.clipboard.writeText(text);
				setCopiedText(text);
				onSuccess?.(text);
				return true;
			} catch (error) {
				console.warn("Copy failed", error);
				setCopiedText(null);
				onError?.(error);
				return false;
			}
		},
		[onSuccess, onError],
	);

	return { copiedText, copyFn };
}
