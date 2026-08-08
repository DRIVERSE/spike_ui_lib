/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/additional-info.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/tenure/additional-info.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/additional-info.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/additional-info.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/tenure/additional-info.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/additional-info.tsx
 * @status merged
 * @notes All three are a notes list plus a 2-column grid of link cards, reading `notes`/`importantLinks()`
 *        from that kind's local `data/index.tsx` — self-contained, unlike `reminders.tsx` (see the
 *        README for why reminders was left out). B adopted for markup (A/B differ only in formatting).
 *        `LuExternalLink` (react-icons) -> `Iconify` (`mdi:open-in-new`) to avoid adding react-icons as a
 *        peer for one glyph. None of the three call sites render this component — `additional-info.tsx`
 *        is imported and immediately commented out in every one of `circulation/index.tsx`,
 *        `tenure/index.tsx` and `verification/index.tsx` in both apps — so it is exported here but not
 *        wired into `ComplianceDocumentSection` by default; a consumer opts in explicitly.
 */

import { Header } from "@/components/page-header";
import Iconify from "@/icons/iconify-icon";
import { Card } from "antd";
import type { ComplianceAdditionalInfoConfig } from "../types";

export type ComplianceAdditionalInfoProps = ComplianceAdditionalInfoConfig;

export const ComplianceAdditionalInfo = ({
	title,
	notesTitle,
	notes,
	linksTitle,
	links,
}: ComplianceAdditionalInfoProps) => {
	return (
		<Card style={{ minHeight: 170 }}>
			<div className="flex flex-col gap-3">
				<Header title={title} />

				<p className="text-medium font-medium text-gray-900">{notesTitle}</p>
				<ul className="list-disc list-inside space-y-1 text-gray-800">
					{notes.map((note) => (
						<li key={note} className="text-base leading-relaxed">
							{note}
						</li>
					))}
				</ul>

				<p className="text-medium font-medium text-gray-900 mt-4">{linksTitle}</p>
				<div className="grid grid-cols-2 gap-y-4 gap-x-10">
					{links.map((item) => (
						<Card
							key={item.title}
							styles={{ body: { padding: 10, minHeight: 20, border: "1px solid #e6edff" } }}
							className="!bg-[#e6edff]"
						>
							<div className="flex justify-between">
								<div>
									<p className="!text-primary">{item.title}</p>
									<p>{item.sub}</p>
								</div>
								<a href={item.link} style={{ color: "#000" }}>
									<Iconify icon="mdi:open-in-new" />
								</a>
							</div>
						</Card>
					))}
				</div>
			</div>
		</Card>
	);
};

export default ComplianceAdditionalInfo;
