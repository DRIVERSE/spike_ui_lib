/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/policy-info/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/policy-info/index.tsx
 * @status adopted-A
 * @notes A adopted: B is the same file with stray whitespace (a double space in the antd import, blank
 *        lines inside the destructure, a misaligned `<Controller`) that biome would only partly clean up.
 *        No functional difference otherwise.
 *        Decoupled: `useInsuranceStore` -> `useVehicleInsurance()`; `useAddInsurance` ->
 *        `useAddInsurancePolicy()` (the module's own hook, see `hooks/use-add-insurance-policy.ts`).
 */

import { Header } from "@/components/page-header/header";
import { Card, Col, DatePicker, Form, Input, Row, Select } from "antd";
import dayjs from "dayjs";
import type { FC } from "react";
import { Controller } from "react-hook-form";
import { useAddInsurancePolicy } from "../../../hooks/use-add-insurance-policy";
import { useVehicleInsurance } from "../../../provider";
import { INSURANCE_COMPANIES } from "../../data";

const InsurancePolicyInfo: FC = () => {
	const { formValues, setFormValue } = useVehicleInsurance();
	const { form } = useAddInsurancePolicy();
	const {
		formState: { errors },
		control,
	} = form;
	return (
		<div className="flex flex-col gap-3">
			<Card>
				<div className="flex flex-col gap-3">
					<Header title="Policy Information" />
					<Form layout="vertical">
						<Row gutter={[16, 16]} className="pt-5">
							<Col span={12}>
								<Form.Item
									required
									label="Insurance Company"
									className="!mb-0"
									validateStatus={errors.company_name ? "error" : ""}
									help={errors.company_name?.message}
									labelCol={{ span: 24 }}
								>
									<Controller
										name="company_name"
										control={control}
										render={({ field }) => (
											<Select
												showSearch
												value={formValues.company_name}
												style={{ height: 35 }}
												placeholder="Select Insurance Company"
												defaultActiveFirstOption={false}
												options={INSURANCE_COMPANIES}
												onChange={(value) => {
													field.onChange(value);
													setFormValue("company_name", value);
												}}
											/>
										)}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="Unique Policy Number"
									className="!mb-3"
									labelCol={{ span: 24 }}
									validateStatus={errors.unique_policy_no ? "error" : ""}
									help={errors.unique_policy_no?.message}
									required
								>
									<Controller
										name="unique_policy_no"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												style={{ height: 35 }}
												value={formValues.unique_policy_no}
												onChange={(value) => {
													setFormValue("unique_policy_no", value.target.value);
												}}
											/>
										)}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="Item"
									className="!mb-3"
									labelCol={{ span: 24 }}
									validateStatus={errors.item ? "error" : ""}
									help={errors.item?.message}
								>
									<Controller
										name="item"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												style={{ height: 35 }}
												value={formValues.item}
												onChange={(value) => {
													setFormValue("item", value.target.value);
												}}
											/>
										)}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="Policy Issue Date"
									className="!mb-0"
									validateStatus={errors.policy_issue_date ? "error" : ""}
									help={errors.policy_issue_date?.message}
									labelCol={{ span: 24 }}
								>
									<Controller
										name="policy_issue_date"
										control={control}
										render={({ field }) => (
											<DatePicker
												value={formValues.policy_issue_date ? dayjs(formValues.policy_issue_date) : null}
												style={{ width: "100%", height: 35 }}
												onChange={(date) => {
													const value = date ? date : null;
													field.onChange(value);
													setFormValue("policy_issue_date", value);
												}}
												format="YYYY-MM-DD"
											/>
										)}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									required
									label="Start Date of Coverage"
									className="!mb-0"
									validateStatus={errors.coverage_start_date ? "error" : ""}
									help={errors.coverage_start_date?.message}
									labelCol={{ span: 24 }}
								>
									<Controller
										name="coverage_start_date"
										control={control}
										render={({ field }) => (
											<DatePicker
												value={formValues.coverage_start_date ? dayjs(formValues.coverage_start_date) : null}
												style={{ width: "100%", height: 35 }}
												onChange={(date) => {
													field.onChange(date);
													setFormValue("coverage_start_date", date);
												}}
												format="YYYY-MM-DD"
											/>
										)}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									required
									label="End Date of Coverage"
									className="!mb-0"
									validateStatus={errors.coverage_end_date ? "error" : ""}
									help={errors.coverage_end_date?.message}
									labelCol={{ span: 24 }}
								>
									<Controller
										name="coverage_end_date"
										control={control}
										render={({ field }) => (
											<DatePicker
												value={formValues.coverage_end_date ? dayjs(formValues.coverage_end_date) : null}
												style={{ width: "100%", height: 35 }}
												onChange={(date) => {
													field.onChange(date);
													setFormValue("coverage_end_date", date);
												}}
												format="YYYY-MM-DD"
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
export default InsurancePolicyInfo;
