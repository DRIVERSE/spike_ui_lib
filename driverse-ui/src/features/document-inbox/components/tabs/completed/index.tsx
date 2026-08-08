/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/tabs/completed/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/tabs/completed/index.tsx
 * @status decoupled
 * @notes B is the base (uses `useClientId()` instead of A's `useDocumentInboxStore()?.selectedClientId`).
 *        `@apollo/client`'s `useSubscription(GET_COMPLETED_UPLOADS)` is replaced by
 *        `dataSource.subscribeCompletedUploads`, wired up in a `useEffect`; `loading` now means "no
 *        callback has fired yet", mirroring Apollo's initial `loading: true`. `useDocumentInboxStore` is
 *        `useDocumentInbox()`. One bug fixed in passing: both apps closed the logs modal with
 *        `setColumnValues({ columnValues: null })`, nesting the state inside itself instead of clearing
 *        it (harmless only because `columnValues.logs` then reads as `undefined`); this calls
 *        `setColumnValues({})`.
 */

import type React from "react";
import { useEffect, useState } from "react";

import { useDocumentInbox } from "../../../provider";
import type { DocumentInboxRecord } from "../../../types";
import { LogsView } from "../../modals/logs-view";
import PendingUploadsTable from "../../table/pending-uploads-table";

const CompletedUploads: React.FC = () => {
	const { dataSource, clientId, columnValues, setColumnValues } = useDocumentInbox();
	const [loading, setLoading] = useState(true);
	const [records, setRecords] = useState<DocumentInboxRecord[]>([]);

	useEffect(() => {
		setLoading(true);
		const unsubscribe = dataSource.subscribeCompletedUploads(clientId, (data) => {
			setRecords(data);
			setLoading(false);
		});
		return unsubscribe;
	}, [dataSource, clientId]);

	return (
		<>
			<PendingUploadsTable data={records} showActions={false} isLoading={loading} />
			<LogsView
				open={!!columnValues?.logs}
				logs={columnValues?.logs}
				onClose={() => {
					setColumnValues({});
				}}
			/>
		</>
	);
};

export default CompletedUploads;
