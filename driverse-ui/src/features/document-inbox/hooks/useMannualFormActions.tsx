/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/hooks/useMannualFormActions.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/hooks/useMannualFormActions.tsx
 * @status decoupled
 * @notes B is the base (adds `useClientId`; A read `selectedClientId` off the store). Three couplings
 *        removed:
 *          - `@/hooks/web/use-get-fileurl` (an app hook wrapping `useApiResource`) -> the library's
 *            `useGetFileUrl` (`@/hooks/use-get-fileurl`), fed `dataSource.apiResource`/`dataSource.filesApiUrl`.
 *          - `@apollo/client`'s `useQuery(GET_CLIENT_VEHICLES)` -> `dataSource.fetchClientVehicles`, wrapped
 *            in `@tanstack/react-query` (same pattern as `useOwnershipForm`'s payments-status fetch).
 *          - `@/store/taskStore`'s `useFileStore` (zustand, holding the previewed document's blob URL) is
 *            gone along with the rest of the store layer; the `{ url, extension, loading }` it used to hold
 *            is now local state in this hook, returned as `blobUrl` for `ViewManualForm` to hand to its
 *            `renderDocumentPreview` render prop (see that component's notes).
 *        `#/entity`'s `VehicleType` is `../types`'s redeclared version. `useDocumentInboxStore` is
 *        `useDocumentInbox()`.
 */

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useGetFileUrl } from "@/hooks/use-get-fileurl";
import { getExtensionFromContentType } from "@/utils";
import { useDocumentInbox } from "../provider";
import type { VehicleType } from "../types";

export const useMannualFormActions = () => {
	const { dataSource, clientId, viewMaanualEntry, columnValues, formValues, setFormValue } = useDocumentInbox();

	const [blobUrl, setBlobUrlState] = useState<{ url: string | null; extension: string; loading: boolean }>({
		url: null,
		extension: "",
		loading: false,
	});

	const { data, isLoading, error } = useGetFileUrl({
		apiResource: dataSource.apiResource,
		filesApiUrl: dataSource.filesApiUrl,
		enabled: viewMaanualEntry,
		bucketId: columnValues?.bucket_name || "",
		fileName: columnValues?.file_name || "",
	});

	const { isLoading: loadingAll, data: allVehiclesData } = useQuery({
		queryKey: ["documentInboxClientVehicles", clientId],
		queryFn: () => dataSource.fetchClientVehicles(clientId),
		enabled: !!clientId,
	});

	const vehicleList = allVehiclesData || [];

	const fileUrl = data?.detail?.file?.url || "";
	const extension = getExtensionFromContentType(columnValues?.content_type || "");

	const vehicleOptions = useMemo(() => {
		return (
			vehicleList?.map((vehicle: VehicleType) => ({
				label: `${vehicle.make || ""} ${vehicle.model || ""} ${vehicle.year || ""} - ${vehicle.alias || ""} - ${vehicle.vin || ""}`,
				value: vehicle.id || "",
			})) || []
		);
	}, [vehicleList]);

	const vinFromOcr = columnValues?.ocr_data?.extracted_data?.vin || columnValues?.form?.vehicleId || "";

	const defaultVehicleId = useMemo(() => {
		if (!vinFromOcr || vehicleList.length === 0) return undefined;
		const match = vehicleList.find((v: VehicleType) => v.vin?.toLowerCase() === vinFromOcr?.toLowerCase());
		return match?.id;
	}, [vinFromOcr, vehicleList]);

	const handleVehicleChange = (value: string) => {
		setFormValue("vehicle", value);
		const selectedVehicle = vehicleList.find((option: VehicleType) => {
			return option.id === value || option.id === defaultVehicleId;
		});

		setFormValue("selectedVehicle", selectedVehicle || null);
	};

	const selectedVehicle = formValues.vehicle || defaultVehicleId;

	// Sync into local state when URL is ready
	useEffect(() => {
		if (fileUrl && viewMaanualEntry) {
			setBlobUrlState({ url: fileUrl, extension, loading: false });
		}
	}, [fileUrl, viewMaanualEntry, extension]);
	useEffect(() => {
		if (isLoading && viewMaanualEntry) {
			setBlobUrlState({ url: null, extension, loading: isLoading });
		}
	}, [isLoading, viewMaanualEntry, extension]);

	// Clear local state when the form closes
	useEffect(() => {
		if (!viewMaanualEntry) {
			setBlobUrlState({ url: null, extension: "", loading: false });
		}
	}, [viewMaanualEntry]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: mirrors the original app hook's deps
	useEffect(() => {
		if (defaultVehicleId && !formValues.vehicle) {
			setFormValue("vehicle", defaultVehicleId);

			const selectedVehicle = vehicleList.find((v: VehicleType) => v.id === defaultVehicleId);
			setFormValue("selectedVehicle", selectedVehicle || null);
		}
	}, [defaultVehicleId, vehicleList]);

	return {
		data,
		isLoading,
		error,
		loadingAll,
		allVehiclesData,
		vehicleOptions,
		formValues,
		defaultVehicleId,
		columnValues,
		selectedVehicle,
		blobUrl,
		handleVehicleChange,
		setFormValue,
	};
};
