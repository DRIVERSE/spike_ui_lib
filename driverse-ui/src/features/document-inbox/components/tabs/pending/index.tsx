/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/index.tsx
 * @status adopted-B
 * @notes B is the base: it renders the `TotalCard` stat row A left commented out (A had a `FeatureCard`
 *        row commented out in the same spot). `useDocumentInboxStore` is `useDocumentInbox()`;
 *        `TotalCard` is already in the library.
 */

import TotalCard from "@/components/total-card";
import { Icon } from "@iconify/react";
import { Button, Col, Divider, Row } from "antd";
import { Fragment } from "react";
import type React from "react";

import { usePendingAction } from "../../../hooks/usePendingAction";
import { useDocumentInbox } from "../../../provider";
import PendingUploadsTable from "../../table/pending-uploads-table";
import { ViewManualForm } from "./components/view-manual-form";

const PendingUploads: React.FC = () => {
	const { loading, STATS, confirmReadyDocs, isConfirming, counts } = usePendingAction({});
	const { viewMaanualEntry, resolvedDocType, setActiveTab } = useDocumentInbox();

	return (
		<Fragment>
			{!viewMaanualEntry && (
				<div className="flex flex-col gap-3 mb-4">
					<Row gutter={16} className="mt-4" justify="space-between">
						{STATS.map((item) => (
							<Col key={item.label} flex="1">
								<TotalCard
									count={item.value}
									title={item.label}
									showIncrease={false}
									description={item?.subLabel}
									loading={loading}
									icon={<Icon icon={item.icon} width={item.size} height={item.size} color={item.color} />}
								/>
							</Col>
						))}
					</Row>
					<PendingUploadsTable />
					<Divider />
					<div className="flex justify-end gap-3">
						<Button disabled={loading || isConfirming} onClick={() => setActiveTab("upload")}>
							Start New Batch
						</Button>
						<Button
							type="primary"
							loading={isConfirming}
							disabled={loading || isConfirming || counts.ready < 1}
							onClick={confirmReadyDocs}
						>
							Confirm
						</Button>
					</div>
				</div>
			)}
			{viewMaanualEntry && <ViewManualForm documentType={resolvedDocType} />}
		</Fragment>
	);
};

export default PendingUploads;
