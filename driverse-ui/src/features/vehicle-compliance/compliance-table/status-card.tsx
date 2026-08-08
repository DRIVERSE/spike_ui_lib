/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/status-card.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/tenure/ownership.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/pollution-test.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/status-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/tenure/ownership.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/pollution-test.tsx
 * @status merged
 * @notes All three files are the same card: a `Header` + one status `Chip` on the top row, a message,
 *        and one or more primary-button CTAs gated behind a permission. B adopted for all three (A and B
 *        differ only in formatting/i18n key drift). `ownership.tsx` is the odd one out — it shows the
 *        overall ownership-fee chip *plus* two secondary badges (tenencia + refrendo) and up to two CTAs
 *        — so this component takes `secondaryChips` and `actions: []` instead of one chip/one button,
 *        which folds all three into a single generic card instead of three near-identical ones.
 *        `router.push`/`useParams` -> the config functions in `configs/` build the href strings (that
 *        logic is not app-specific) and call them through `onClick`, which closes over the injected
 *        `ComplianceNavigation.push`. `useCan("business.action...")` -> `usePermission` from `@/hooks`,
 *        fed the context's `permissions` list; each action already carries its own permission code so
 *        the filtering happens once, here, instead of once per call site.
 */

import Chip, { type ChipVariant } from "@/components/chip";
import { Header } from "@/components/page-header";
import { usePermission } from "@/hooks";
import { Button, Card } from "antd";
import { useVehicleCompliance } from "../provider";
import type { ComplianceStatusCardConfig } from "../types";

export type ComplianceStatusCardProps = ComplianceStatusCardConfig;

/**
 * Both apps typed the status payload `any` and passed the raw document/payment status string (e.g.
 * "REFRENDO", a dynamic value from the compliance service) straight into `variant`, wider than the
 * `ChipVariant` union the library's Chip declares. Unknown variants fall back to Chip's own "default"
 * styling rather than a type error, matching the apps' actual (unchecked) runtime behaviour.
 */
const asChipVariant = (variant: string) => variant as ChipVariant;

export const ComplianceStatusCard = ({ title, chip, message, secondaryChips, actions }: ComplianceStatusCardProps) => {
	const { permissions } = useVehicleCompliance();
	const { has } = usePermission(permissions);

	const visibleActions = (actions ?? []).filter((action) => !action.permission || has(action.permission));

	return (
		<Card>
			<div className="flex justify-between items-center mb-6">
				<Header title={title} />
				{chip && <Chip variant={asChipVariant(chip.variant)} label={chip.label} />}
			</div>

			<div className="flex flex-col gap-3">
				{secondaryChips && secondaryChips.length > 0 && (
					<div className="flex gap-5">
						{secondaryChips.map(({ label, chip: badge }) => (
							<div key={label} className="flex gap-2 items-center">
								<p>{label}:</p>
								<Chip label={badge.label} variant={asChipVariant(badge.variant)} style={{ height: "23px" }} />
							</div>
						))}
					</div>
				)}

				<div>{message}</div>

				{visibleActions.length > 0 && (
					<div className="flex gap-5">
						{visibleActions.map((action) => (
							<Button
								key={action.key}
								type={action.type ?? "primary"}
								style={{ maxWidth: 220, width: "100%" }}
								onClick={action.onClick}
							>
								{action.label}
							</Button>
						))}
					</div>
				)}
			</div>
		</Card>
	);
};

export default ComplianceStatusCard;
