/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/hooks/useMarkAsReady.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/hooks/useMarkAsReady.ts
 * @status decoupled
 * @notes Byte-identical in both apps. `@apollo/client`'s `useMutation(MARK_DOCS_AS_READY)` is replaced by
 *        `dataSource.markAsReady`; `isUpdating` becomes local state since there's no Apollo mutation
 *        object to read `loading` off. `useDocumentInboxStore` is `useDocumentInbox()`. `sonner`'s `toast`
 *        is kept — it's a declared peer both apps already used.
 */

import { useState } from "react";
import { toast } from "sonner";

import { useDocumentInbox } from "../provider";
import type { MarkAsReadyInput } from "../types";

export const useMarkAsReady = () => {
	const { dataSource, formValues } = useDocumentInbox();
	const [isUpdating, setIsUpdating] = useState(false);

	const handleUpdate = (data?: Partial<MarkAsReadyInput>, callBack?: VoidFunction) => {
		if (!formValues.vehicle) {
			toast.error("Please select a vehicle before marking as ready.");
			return;
		}

		setIsUpdating(true);
		return dataSource
			.markAsReady({ ...data, status: "READY" } as MarkAsReadyInput)
			.then(() => {
				toast.success("Document marked as ready!", {
					position: "top-right",
				});
				callBack?.();
			})
			.catch((error: any) => {
				toast.error(error?.message?.includes("Uniqueness violation") ? "Details already exist" : error?.message, {
					position: "top-right",
				});
			})
			.finally(() => setIsUpdating(false));
	};

	return { handleUpdate, isUpdating };
};
