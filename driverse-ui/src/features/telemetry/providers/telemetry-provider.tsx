/**
 * @lib-native
 * @notes `hooks/use-mileage-report.ts`'s `useMileageReport` / `useTrackHistoryMetrics` wrap the injected
 *        data source in `@tanstack/react-query`'s `useQuery`, which needs a `QueryClient` in context. Both
 *        apps already had one at the root for their own unrelated queries; rather than require every
 *        consumer to know that detail, this provider carries its own `QueryClient` (lazily constructed
 *        once per mount) — the same pattern `document-inbox`'s provider uses. Nesting under an app's own
 *        `QueryClientProvider` is harmless — the inner one just shadows it for this subtree.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, createContext, useContext, useState } from "react";
import type { TelemetryDataSource } from "../types";

const noopUnsubscribe = () => {};

/**
 * Used only if a consumer renders module internals outside a `TelemetryProvider` (e.g. in isolation during
 * development). `fetchTrackHistoryMetrics` throws instead of resolving so a missing provider surfaces as a
 * loud query error rather than a silently-empty metrics card.
 */
const missingDataSource: TelemetryDataSource = {
	fetchMileageReport: async () => ({ data: [] }),
	fetchTrackHistoryMetrics: async () => {
		throw new Error(
			"useTelemetryDataSource: no TelemetryDataSource was supplied. Wrap this tree in a TelemetryProvider.",
		);
	},
	subscribeVehicleTracking: () => noopUnsubscribe,
	subscribeTrackHistory: () => noopUnsubscribe,
};

const TelemetryDataSourceContext = createContext<TelemetryDataSource>(missingDataSource);

export type TelemetryProviderProps = {
	children: ReactNode;
	/** The injected transport seam — see `TelemetryDataSource`. */
	dataSource: TelemetryDataSource;
};

export function TelemetryProvider({ children, dataSource }: TelemetryProviderProps) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<TelemetryDataSourceContext.Provider value={dataSource}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</TelemetryDataSourceContext.Provider>
	);
}

export function useTelemetryDataSource() {
	return useContext(TelemetryDataSourceContext);
}
