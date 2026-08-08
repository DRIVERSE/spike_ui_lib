/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/forms/ownership.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/forms/ownership.tsx
 * @status identical
 * @notes Byte-identical in both apps; purely presentational, driven entirely by `useOwnershipForm`.
 *        `Header`/`CircleLoading` are already in the library.
 */

import { CircleLoading } from "@/components/loading";
import { Header } from "@/components/page-header/header";
import { Button, Card, Col, DatePicker, Form, Input, Row, Select } from "antd";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

import { useOwnershipForm } from "../../../../../hooks/useOwnershipForm";

type Props = {
	selectedVehicle?: string;
};
const Ownership = ({ selectedVehicle }: Props) => {
	const { t, control, errors, isUpdating, isSubmitDisabled, handleClose, handleSubmit, isLoading, years, error } =
		useOwnershipForm();

	if (isLoading) return <CircleLoading />;
	if (error) return null;
	return (
		<div className="w-full flex flex-col gap-4">
			<Card>
				{!selectedVehicle && "Please select a vehicle to continue."}
				{selectedVehicle && (
					<>
						<div className="flex justify-between items-center mb-6">
							<Header title="Payment Details" />
						</div>

						<Form onFinish={handleSubmit} layout="vertical">
							<Row gutter={[16, 16]}>
								{/* Fiscal Year */}
								<Col span={12}>
									<Form.Item
										label="Fiscal Year"
										required
										validateStatus={errors.FiscalYear ? "error" : ""}
										help={errors.FiscalYear?.message}
									>
										<Controller
											name="FiscalYear"
											control={control}
											render={({ field }) => (
												<Select
													{...field}
													style={{ height: 35 }}
													defaultActiveFirstOption={false}
													options={years?.map((y: string) => ({
														label: y,
														value: y,
													}))}
													loading={isLoading}
												/>
											)}
										/>
									</Form.Item>
								</Col>

								{/* Amount */}
								<Col span={12}>
									<Form.Item
										label="Amount paid"
										required
										validateStatus={errors.amount ? "error" : ""}
										help={errors.amount?.message}
									>
										<Controller
											name="amount"
											control={control}
											render={({ field }) => <Input {...field} style={{ height: 35 }} placeholder="Enter amount" />}
										/>
									</Form.Item>
								</Col>

								{/* Payment Date */}
								<Col span={12}>
									<Form.Item
										label="Payment Date"
										required
										validateStatus={errors.paymentDate ? "error" : ""}
										help={errors.paymentDate?.message}
									>
										<Controller
											name="paymentDate"
											control={control}
											render={({ field }) => (
												<DatePicker
													style={{ width: "100%", height: 35 }}
													format="YYYY-MM-DD"
													value={field.value ? dayjs(field.value) : null}
													onChange={(date) => field.onChange(date ? dayjs(date).toISOString() : undefined)}
												/>
											)}
										/>
									</Form.Item>
								</Col>
							</Row>

							<div className="flex justify-end gap-3 pt-3 border-t flex-shrink-0">
								<Button onClick={handleClose} disabled={isUpdating}>
									{t("Cancel")}
								</Button>
								<Button type="primary" htmlType="submit" loading={isUpdating} disabled={isSubmitDisabled}>
									{t("Confirm & Save")}
								</Button>
							</div>
						</Form>
					</>
				)}
			</Card>
		</div>
	);
};

export default Ownership;
