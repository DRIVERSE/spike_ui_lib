/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/payment-options/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/payment-options/index.tsx
 * @status decoupled
 * @notes Byte-identical in both apps otherwise. The one change: both used react-router's `<Link>` for the
 *        two option cards. This module has no hard react-router dependency anywhere else (navigation is
 *        the injected `ComplianceNavigation`), so `<Link to>` becomes a plain `<a href>` plus an optional
 *        `onClick` a consumer can use to call `navigation.push` and `preventDefault` the hard reload.
 */

import Iconify from "@/icons/iconify-icon";
import { Card } from "antd";

export type PaymentOptionsProps = {
	ocrLink: string;
	manualLink: string;
	onOcrClick?: () => void;
	onManualClick?: () => void;
};

export const PaymentOptions = ({ ocrLink, manualLink, onOcrClick, onManualClick }: PaymentOptionsProps) => {
	return (
		<div className="flex items-stretch gap-5">
			<a href={ocrLink} onClick={onOcrClick} className="w-[50%] h-72">
				<Card
					styles={{ body: { padding: 6 } }}
					className="h-full w-full flex flex-col items-center justify-center rounded-md border border-gray-300 hover:shadow-md transition-shadow"
				>
					<div className="flex flex-col items-center justify-center gap-2 text-center px-4">
						<div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#e6ecfc] mb-2">
							<Iconify icon="bytesize:upload" className="text-4xl text-primary" />
						</div>
						<p className="font-semibold text-lg">Upload Document</p>
						<p>Automatically extract data using OCR technology</p>
						<p className="text-primary">Recommended · Faster</p>
					</div>
				</Card>
			</a>

			<a href={manualLink} onClick={onManualClick} className="w-[50%] h-72">
				<Card
					styles={{ body: { padding: 6 } }}
					className="h-full w-full flex flex-col items-center justify-center rounded-md border border-gray-300 hover:shadow-md transition-shadow"
				>
					<div className="flex flex-col items-center justify-center gap-2 text-center px-4">
						<div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-2">
							<Iconify icon="akar-icons:edit" className="text-4xl" />
						</div>
						<p className="font-semibold text-lg">Enter Manually</p>
						<p>Fill out the form fields yourself</p>
						<p>Traditional Method</p>
					</div>
				</Card>
			</a>
		</div>
	);
};

export default PaymentOptions;
