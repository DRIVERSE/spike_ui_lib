/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/forms/insurance.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/forms/insurance.tsx
 * @status decoupled
 * @notes Byte-identical in both apps besides import ordering and the `@/features/vehicle-park` (A) vs.
 *        `@/features/vehicle-parks` (B) path. `INSURANCE_COMPANIES` — a cross-feature import into
 *        vehicle-parks for one constant — is vendored locally as `./insurance-companies` (see its header).
 */

import { Header } from "@/components/page-header/header";
import { Button, Card, Col, DatePicker, Form, Input, Row, Select } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { Controller } from "react-hook-form";

import { useInsuranceForm } from "../../../../../hooks/useInsuranceForm";
import { INSURANCE_COMPANIES } from "./insurance-companies";

export const Insurance: React.FC = () => {
	const { t, control, errors, isUpdating, isSubmitDisabled, handleClose, handleSubmit } = useInsuranceForm();

	return (
		<Form layout="vertical" onFinish={handleSubmit} className="h-full flex flex-col">
			<div className="flex-1 overflow-auto">
				<Card>
					<div className="flex justify-between items-center mb-4">
						<Header title="Card Details" />
					</div>

					<Row gutter={[16, 16]} className="pt-5">
						{/* Insurance Company */}
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
											{...field}
											showSearch
											style={{ height: 35 }}
											placeholder="Select Insurance Company"
											defaultActiveFirstOption={false}
											options={INSURANCE_COMPANIES}
										/>
									)}
								/>
							</Form.Item>
						</Col>

						{/* Unique Policy Number */}
						<Col span={12}>
							<Form.Item
								required
								label="Unique Policy Number"
								className="!mb-3"
								validateStatus={errors.unique_policy_no ? "error" : ""}
								help={errors.unique_policy_no?.message}
								labelCol={{ span: 24 }}
							>
								<Controller
									name="unique_policy_no"
									control={control}
									render={({ field }) => <Input {...field} style={{ height: 35 }} />}
								/>
							</Form.Item>
						</Col>

						{/* Item */}
						<Col span={12}>
							<Form.Item
								label="Item"
								className="!mb-3"
								validateStatus={errors.item ? "error" : ""}
								help={errors.item?.message}
								labelCol={{ span: 24 }}
							>
								<Controller
									name="item"
									control={control}
									render={({ field }) => <Input {...field} style={{ height: 35 }} />}
								/>
							</Form.Item>
						</Col>

						{/* Policy Issue Date */}
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
											value={field.value ? dayjs(field.value) : null}
											onChange={(date) => field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : undefined)}
											style={{ height: 35, width: "100%" }}
										/>
									)}
								/>
							</Form.Item>
						</Col>

						{/* Coverage Start */}
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
											value={field.value ? dayjs(field.value) : null}
											onChange={(date) => field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : undefined)}
											style={{ height: 35, width: "100%" }}
										/>
									)}
								/>
							</Form.Item>
						</Col>

						{/* Coverage End */}
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
											value={field.value ? dayjs(field.value) : null}
											onChange={(date) => field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : undefined)}
											style={{ height: 35, width: "100%" }}
										/>
									)}
								/>
							</Form.Item>
						</Col>

						{/* Policyholder Name */}
						<Col span={12}>
							<Form.Item
								required
								label="Full Name of Policyholder"
								className="!mb-3"
								validateStatus={errors.policy_holder_name ? "error" : ""}
								help={errors.policy_holder_name?.message}
								labelCol={{ span: 24 }}
							>
								<Controller
									name="policy_holder_name"
									control={control}
									render={({ field }) => <Input {...field} style={{ height: 35 }} />}
								/>
							</Form.Item>
						</Col>

						{/* RFC */}
						<Col span={12}>
							<Form.Item
								required
								label="RFC"
								className="!mb-3"
								validateStatus={errors.rfc ? "error" : ""}
								help={errors.rfc?.message}
								labelCol={{ span: 24 }}
							>
								<Controller
									name="rfc"
									control={control}
									render={({ field }) => <Input {...field} style={{ height: 35 }} />}
								/>
							</Form.Item>
						</Col>

						{/* Address */}
						<Col span={24}>
							<Form.Item
								label="Full Address"
								className="!mb-3"
								validateStatus={errors.address ? "error" : ""}
								help={errors.address?.message}
								labelCol={{ span: 24 }}
							>
								<Controller
									name="address"
									control={control}
									render={({ field }) => <Input {...field} style={{ height: 35 }} />}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Card>

				{/* Footer */}
				<div className="flex justify-end gap-3 pt-3 border-t flex-shrink-0">
					<Button onClick={handleClose} disabled={isUpdating}>
						{t("Cancel")}
					</Button>
					<Button type="primary" htmlType="submit" loading={isUpdating} disabled={isSubmitDisabled}>
						{t("Confirm & Save")}
					</Button>
				</div>
			</div>
		</Form>
	);
};
