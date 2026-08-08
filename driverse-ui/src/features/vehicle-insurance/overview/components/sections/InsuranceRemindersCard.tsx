/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/sections/InsuranceRemindersCard.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/sections/InsuranceRemindersCard.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Both apps also leave it commented out at the
 *        `InsuranceOverview` call site — see `overview/index.tsx` — so it's dead UI today, kept for parity
 *        with the file list. `React.FC` import replaced with a plain `FC` type import.
 */

import { Header } from "@/components/page-header/header";
import { Card, Checkbox, Form, Select } from "antd";
import type { FC } from "react";
import { reminderPolicyOptions } from "../../data";

export const InsuranceRemindersCard: FC = () => {
	return (
		<Card>
			<div className="flex flex-col gap-3">
				<Header title="Insurance Reminders" />

				<div className="grid grid-cols-2 gap-6">
					<div className="flex flex-col gap-3">
						<Form layout="vertical">
							<Form.Item label="Remind before policy expiry">
								<Select options={reminderPolicyOptions} />
							</Form.Item>
						</Form>

						<p className="text-lg font-medium">Additional reminders</p>
						<Checkbox>Premium payment due dates</Checkbox>
						<Checkbox>Policy renewal opportunities</Checkbox>
					</div>

					<div className="flex flex-col gap-3">
						<p className="text-lg font-medium">Notification method</p>
						<Checkbox>Email notifications</Checkbox>
						<Checkbox>SMS notifications</Checkbox>
					</div>
				</div>
			</div>
		</Card>
	);
};
