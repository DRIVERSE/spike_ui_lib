/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/policy-holder/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/policy-holder/index.tsx
 * @status adopted-B
 * @notes B adopted for a real behavioural fix: the "Autofill with company profile information" checkbox
 *        in A actually copied fields from the vehicle's *existing* insurance policy
 *        (`useVehicleDetailsResponseStore().vehicleDetails.insurance_policies[0]`) — data that has
 *        nothing to do with "company profile". B copies from the signed-in user's company profile
 *        (`useUserInfo()`), which is what the label promises.
 *        Decoupled: B's `useUserInfo()` (app zustand `userStore`) becomes the injected `userProfile` on
 *        `useVehicleInsurance()`; `useInsuranceStore` becomes the same context's `formValues`/`setFormValue`;
 *        `useAddInsurance` becomes the module's `useAddInsurancePolicy`.
 */

import { Header } from "@/components/page-header/header";
import { Card, Checkbox, Col, Form, Input, Row } from "antd";
import type { FC } from "react";
import { Controller } from "react-hook-form";
import { useAddInsurancePolicy } from "../../../hooks/use-add-insurance-policy";
import { useVehicleInsurance } from "../../../provider";

const InsurancePolicyHolder: FC = () => {
	const { formValues, setFormValue, userProfile } = useVehicleInsurance();
	const { policyHolderForm } = useAddInsurancePolicy();
	const {
		formState: { errors },
		control,
	} = policyHolderForm;

	return (
		<div className="flex flex-col gap-3">
			<Card>
				<div className="flex flex-col gap-3">
					<Header title="Policyholder Information" />

					<Checkbox
						onChange={(e) => {
							const checked = e.target.checked;
							setFormValue("autoFil", checked);

							if (checked) {
								setFormValue("policy_holder_name", userProfile?.clientName ?? "");
								setFormValue("rfc", userProfile?.rfc ?? "");
								setFormValue("address", userProfile?.legalCompanyAddress ?? "");
							} else {
								// Optionally clear fields
								setFormValue("policy_holder_name", "");
								setFormValue("rfc", "");
								setFormValue("address", "");
							}
						}}
					>
						Autofill with company profile information
					</Checkbox>
					<Form layout="vertical">
						<Row gutter={[16, 16]} className="pt-5">
							<Col span={12}>
								<Form.Item
									label="Full Name of Policyholder"
									className="!mb-3"
									labelCol={{ span: 24 }}
									validateStatus={errors.policy_holder_name ? "error" : ""}
									help={errors.policy_holder_name?.message}
									required
								>
									<Controller
										name="policy_holder_name"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												style={{ height: 35 }}
												value={formValues.policy_holder_name}
												disabled={Boolean(formValues.autoFil)}
												onChange={(value) => {
													setFormValue("policy_holder_name", value.target.value);
												}}
											/>
										)}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="RFC "
									className="!mb-3"
									labelCol={{ span: 24 }}
									validateStatus={errors.rfc ? "error" : ""}
									help={errors.rfc?.message}
									required
								>
									<Controller
										name="rfc"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												style={{ height: 35 }}
												value={formValues.rfc}
												disabled={Boolean(formValues.autoFil)}
												onChange={(value) => {
													setFormValue("rfc", value.target.value);
												}}
											/>
										)}
									/>
								</Form.Item>
							</Col>
							<Col span={24}>
								<Form.Item
									label="Full Address"
									className="!mb-3"
									labelCol={{ span: 24 }}
									validateStatus={errors.address ? "error" : ""}
									help={errors.address?.message}
								>
									<Controller
										name="address"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												style={{ height: 35 }}
												value={formValues.address}
												disabled={Boolean(formValues.autoFil)}
												onChange={(value) => {
													setFormValue("address", value.target.value);
												}}
											/>
										)}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Form>
				</div>
			</Card>
		</div>
	);
};
export default InsurancePolicyHolder;
