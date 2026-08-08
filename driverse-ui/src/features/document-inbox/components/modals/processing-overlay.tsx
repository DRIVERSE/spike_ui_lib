/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/modals/processing-overlay.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/modals/processing-overlay.tsx
 * @status decoupled
 * @notes Byte-identical in both apps except two substitutions:
 *          - `colors.driverse_primary` (`@/theme/colors`) -> `var(--brand-primary)`, same token swap as
 *            `FeatureCard`.
 *          - `@ant-design/icons`' `LoadingOutlined`/`CheckCircleOutlined` -> the library's `<Iconify>`
 *            (`eos-icons:loading` / `mdi:check-circle`), the same "avoid a second icon peer" substitution
 *            page-header and total-card already made for that package.
 */

import Iconify from "@/icons/iconify-icon";
import { paletteColors } from "@/tokens";
import { Modal, Steps } from "antd";

export type Phase = "idle" | "preparing" | "uploading" | "processing" | "done";

interface ProcessingOverlayProps {
	open: boolean;
	phase: Phase;
	progress: number;
	fileCount: number;
}

const STEPS = [
	{ key: "preparing", title: "Preparing", description: "Getting files ready" },
	{
		key: "uploading",
		title: "Uploading",
		description: "Sending files to server",
	},
	{
		key: "processing",
		title: "Processing",
		description: "OCR extraction in progress",
	},
	{ key: "done", title: "Complete", description: "All files processed" },
];

const phaseIndex: Record<Phase, number> = {
	idle: 0,
	preparing: 0,
	uploading: 1,
	processing: 2,
	done: 3,
};

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ open, phase, progress, fileCount }) => {
	const currentStep = phaseIndex[phase];
	const isDone = phase === "done";

	return (
		<Modal open={open} footer={null} closable={false} maskClosable={false} centered width={750}>
			<div className="flex flex-col items-center gap-6 py-4">
				{/* Spinner or checkmark */}
				<div className="relative flex items-center justify-center w-20 h-20">
					{isDone ? (
						<Iconify icon="mdi:check-circle" size={48} color={paletteColors.success.default} />
					) : (
						<>
							{/* Rotating ring */}
							<svg
								className="animate-spin absolute"
								width="80"
								height="80"
								viewBox="0 0 80 80"
								aria-hidden="true"
								role="presentation"
							>
								<circle cx="40" cy="40" r="34" fill="none" stroke="#e0e0e0" strokeWidth="6" />
								<circle
									cx="40"
									cy="40"
									r="34"
									fill="none"
									stroke="var(--brand-primary)"
									strokeWidth="6"
									strokeDasharray="213"
									strokeDashoffset={213 - (213 * progress) / 100}
									strokeLinecap="round"
									style={{ transition: "stroke-dashoffset 0.3s ease" }}
								/>
							</svg>
							<span className="text-sm font-semibold text-gray-700">{Math.round(progress)}%</span>
						</>
					)}
				</div>

				{/* Phase title */}
				<div className="text-center">
					<h3 className="text-lg font-semibold text-gray-800">
						{phase === "preparing" && "Preparing Files"}
						{phase === "uploading" && `Uploading ${fileCount} file${fileCount > 1 ? "s" : ""}`}
						{phase === "processing" && "Processing Documents"}
						{phase === "done" && "Upload Complete!"}
					</h3>
					<p className="text-sm  mt-1">
						{phase === "preparing" && "Validating and packaging your files..."}
						{phase === "uploading" && "Please keep this window open while files are being sent."}
						{phase === "processing" && "Our OCR engine is extracting data from your documents. This may take a moment."}
						{phase === "done" && "Your files have been successfully processed."}
					</p>
				</div>

				{/* Progress bar */}
				{!isDone && (
					<div className="w-full">
						<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
							<div
								className="h-full bg-primary rounded-full transition-all duration-300"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				)}

				{/* Steps */}
				<Steps
					current={currentStep}
					size="small"
					className="w-full"
					items={STEPS.map((step, i) => ({
						title: step.title,
						description: step.description,
						icon: i === currentStep && !isDone ? <Iconify icon="eos-icons:loading" size={20} /> : undefined,
					}))}
				/>

				{phase === "processing" && (
					<p className="text-xs text-center">
						Do not close this window. You will be redirected automatically once processing is complete.
					</p>
				)}
			</div>
		</Modal>
	);
};
