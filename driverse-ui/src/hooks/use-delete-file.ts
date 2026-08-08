/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/web/use-delete-file.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-delete-file.ts
 * @status decoupled
 * @notes Byte-identical in both apps. Decoupled from `import.meta.env.VITE_UPLOAD_URL`, which a library
 *        cannot read: the file API root arrives as a `filesApiUrl` option (or via the shared
 *        `apiResource`'s baseUrl). The caller also supplies `apiResource` — see use-resource.ts, which
 *        replaced the keycloak/axios pair.
 */

import { useState } from "react";
import type { ApiResourceRequest } from "./use-resource";

export type DeleteFilePayload = {
	bucketId: string;
	fileId: string;
};

export type DeleteFileDetail = {
	deletedFiles: string[];
	failedFiles: string[];
	failureCount: number;
	successCount: number;
};

export type DeleteFileResponse = {
	status: number;
	message: string;
	detail: DeleteFileDetail;
	path: string;
};

export type UseDeleteFileProps = {
	/** The `useApiResource()` caller. */
	apiResource: (request: ApiResourceRequest) => Promise<any>;
	/** Files endpoint, e.g. `${uploadUrl}/api/v1/files`. Was VITE_UPLOAD_URL-derived in the apps. */
	filesApiUrl: string;
	onSuccess?: (response: DeleteFileResponse) => void;
	onError?: (error: unknown) => void;
};

export const useDeleteFile = ({ apiResource, filesApiUrl, onSuccess, onError }: UseDeleteFileProps) => {
	const [deleting, setDeleting] = useState(false);

	const deleteFiles = async (files: DeleteFilePayload[]): Promise<DeleteFileResponse | undefined> => {
		try {
			setDeleting(true);
			const response: DeleteFileResponse = await apiResource({
				path: filesApiUrl,
				method: "delete",
				payload: { files },
			});
			onSuccess?.(response);
			return response;
		} catch (error) {
			onError?.(error);
		} finally {
			setDeleting(false);
		}
	};

	const deleteFile = ({ bucketId, fileId }: DeleteFilePayload) => deleteFiles([{ bucketId, fileId }]);

	return { deleteFile, deleteFiles, deleting };
};
