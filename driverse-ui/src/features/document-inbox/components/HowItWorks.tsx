/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/HowItWorks.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/HowItWorks.tsx
 * @status identical
 * @notes Byte-identical in both apps modulo a commented-out step title `<h3>` (dead code, dropped) and a
 *        stray extra space in a className, otherwise lifted verbatim; react/react-i18next are both
 *        declared peers.
 */

import { useTranslate } from "@/i18n/translate";
import type React from "react";

interface HowItWorksStep {
	number: number;
	titleKey: string;
	descriptionKey: string;
}

interface HowItWorksProps {
	steps?: HowItWorksStep[];
}

const defaultSteps: HowItWorksStep[] = [
	{
		number: 1,
		titleKey: "sys.documents.howItWorks.step1.title",
		descriptionKey: "sys.documents.howItWorks.step1.description",
	},
	{
		number: 2,
		titleKey: "sys.documents.howItWorks.step2.title",
		descriptionKey: "sys.documents.howItWorks.step2.description",
	},
	{
		number: 3,
		titleKey: "sys.documents.howItWorks.step3.title",
		descriptionKey: "sys.documents.howItWorks.step3.description",
	},
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ steps = defaultSteps }) => {
	const t = useTranslate();

	return (
		<div>
			<h2 style={{ margin: "0 0 22px 0", fontSize: "18px", fontWeight: 500 }}>{t("sys.documents.howItWorks.title")}</h2>
			<div className="flex flex-col gap-2 ">
				{steps.map((step) => (
					<div key={step.number} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
						{/* Step Number */}
						<div className="text-common-white bg-primary rounded-full w-7 h-7 flex items-center justify-center p-1">
							{step.number}
						</div>

						{/* Content */}
						<div style={{ flex: 1 }}>
							<p
								style={{
									margin: 0,
									fontSize: "14px",
									color: "#666",
									lineHeight: "1.6",
								}}
							>
								{t(step.descriptionKey)}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default HowItWorks;
