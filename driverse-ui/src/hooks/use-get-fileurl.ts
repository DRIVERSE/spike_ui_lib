/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/web/use-get-fileurl.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-get-fileurl.tsx
 * @status decoupled
 * @notes Byte-identical in both apps. Same decoupling as use-delete-file: `apiResource` and the files
 *        endpoint are injected rather than imported from the app's keycloak/env wiring (the apps pulled
 *        FILE_BASE_API out of use-uploadfile, which read import.meta.env.VITE_UPLOAD_URL).
 *        @tanstack/react-query stays — both apps already depend on it — but it is an optional peer, so
 *        only consumers of this hook need it installed.
 */

import { useQuery } from "@tanstack/react-query";
import type { ApiResourceRequest } from "./use-resource";

export type UseGetFileUrlProps = {
	apiResource: (request: ApiResourceRequest) => Promise<any>;
	/** Files endpoint, e.g. `${uploadUrl}/api/v1/files`. */
	filesApiUrl: string;
	bucketId: string;
	fileName: string;
	enabled?: boolean;
};

export const useGetFileUrl = ({ apiResource, filesApiUrl, bucketId, fileName, enabled }: UseGetFileUrlProps) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["getFileUrl", filesApiUrl, bucketId, fileName],
		queryFn: () =>
			apiResource({
				path: `${filesApiUrl}/info?bucketId=${encodeURIComponent(bucketId)}&fileName=${encodeURIComponent(fileName)}`,
			}),
		enabled: !!enabled && !!bucketId && !!fileName,
	});

	return { data, isLoading, error };
};

export default useGetFileUrl;
