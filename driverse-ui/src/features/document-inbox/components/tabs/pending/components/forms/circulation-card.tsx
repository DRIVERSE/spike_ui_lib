/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/forms/circulation-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/forms/circulation-card.tsx
 * @status identical
 * @notes Byte-identical in both apps; purely presentational, driven entirely by `useCirculationCardForm`.
 *        `Header` is already in the library (`@/components/page-header/header`).
 */

import { Header } from "@/components/page-header/header";
import { useTranslate } from "@/i18n/translate";
import { Button, Card, Col, DatePicker, Form, Input, Row, Switch } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { Controller } from "react-hook-form";

import { useCirculationCardForm } from "../../../../../hooks/useCirculationCardForm";

export const CirculationCard: React.FC = () => {
	const t = useTranslate();
	const {
		control,
		errors,
		values,
		setValue,
		isUpdating,
		isExpiryInvalid,
		isSubmitDisabled,
		handleSubmit,
		handleClose,
	} = useCirculationCardForm();

	return (
		<Form layout="vertical" onFinish={handleSubmit} className="h-full flex flex-col">
			<div className="flex-1 overflow-auto">
				<Card>
					<div className="flex justify-between items-center">
						<Header title={t("sys.forms.addCirculation.cardDetails")} />
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600">{t("sys.forms.addCirculation.permanentCard")}</span>
							<Controller
								name="permanentCard"
								control={control}
								render={({ field }) => (
									<Switch
										checked={!!field.value}
										onChange={(val) => {
											field.onChange(val);
											if (val) setValue("expiry_date", null);
										}}
									/>
								)}
							/>
						</div>
					</div>

					<Row gutter={[16, 0]}>
						{/* Issue Date */}
						<Col span={12}>
							<Form.Item
								label={t("sys.forms.addCirculation.issueDate")}
								required
								validateStatus={errors.issue_date ? "error" : ""}
								help={errors.issue_date?.message}
							>
								<Controller
									name="issue_date"
									control={control}
									render={({ field }) => (
										<DatePicker
											style={{ width: "100%", height: 35 }}
											format="YYYY-MM-DD"
											value={field.value ? dayjs(field.value) : null}
											onChange={(date) => field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : undefined)}
										/>
									)}
								/>
							</Form.Item>
						</Col>

						{/* Expiry Date */}
						{!values.permanentCard && (
							<Col span={12}>
								<Form.Item
									label={t("sys.forms.addCirculation.expiryDate")}
									required
									validateStatus={isExpiryInvalid ? "error" : ""}
									help={isExpiryInvalid ? t("sys.forms.addCirculation.expiryAfterIssue") : ""}
								>
									<Controller
										name="expiry_date"
										control={control}
										render={({ field }) => (
											<DatePicker
												style={{ width: "100%", height: 35 }}
												format="YYYY-MM-DD"
												value={field.value ? dayjs(field.value) : null}
												disabledDate={(current) =>
													values.issue_date ? current.isBefore(dayjs(values.issue_date), "day") : false
												}
												onChange={(date) => field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : undefined)}
											/>
										)}
									/>
								</Form.Item>
							</Col>
						)}

						{/* Card Number */}
						<Col span={24}>
							<Form.Item
								label={t("sys.forms.addCirculation.cardNumber")}
								required
								validateStatus={errors.card_number ? "error" : ""}
								help={errors.card_number?.message}
							>
								<Controller
									name="card_number"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											style={{ height: 35 }}
											placeholder={t("sys.forms.addCirculation.cardNumberPlaceholder")}
										/>
									)}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Card>

				<div className="flex justify-end gap-3 pt-3 border-t flex-shrink-0">
					<Button onClick={handleClose} disabled={isUpdating}>
						{t("Cancel")}
					</Button>
					<Button type="primary" htmlType="submit" disabled={isSubmitDisabled} loading={isUpdating}>
						{t("Confirm & Save")}
					</Button>
				</div>
			</div>
		</Form>
	);
};
