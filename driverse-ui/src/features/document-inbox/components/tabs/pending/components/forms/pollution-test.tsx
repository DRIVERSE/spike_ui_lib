/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/forms/pollution-test.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/forms/pollution-test.tsx
 * @status decoupled
 * @notes Byte-identical in both apps besides import ordering and the `@/features/vehicle-park` (A) vs.
 *        `@/features/vehicle-parks` (B) path. `hologramOptions` is vendored locally as `./hologram-options`
 *        (see its header) for the same reason as `INSURANCE_COMPANIES` in `insurance.tsx`.
 */

import { Header } from "@/components/page-header/header";
import { useTranslate } from "@/i18n/translate";
import { Button, Card, Col, DatePicker, Form, Row, Select } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { Controller } from "react-hook-form";

import { usePollutionTestForm } from "../../../../../hooks/usePollutionTestForm";
import { hologramOptions } from "./hologram-options";

export const PollutionTest: React.FC = () => {
	const t = useTranslate();
	const { control, errors, isUpdating, isSubmitDisabled, handleSubmit, handleClose } = usePollutionTestForm();

	return (
		<Form layout="vertical" onFinish={handleSubmit} className="h-full flex flex-col">
			<div className="flex-1 overflow-auto">
				<Card>
					<div className="flex justify-between items-center mb-6">
						<Header title="Card Details" />
					</div>

					<Row gutter={[16, 0]}>
						{/* Test Date */}
						<Col span={12}>
							<Form.Item
								label={t("sys.forms.addPollutionTest.testDate")}
								required
								validateStatus={errors.test_date ? "error" : ""}
								help={errors.test_date?.message}
							>
								<Controller
									name="test_date"
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

						{/* Hologram */}
						<Col span={12}>
							<Form.Item
								label={t("sys.forms.addPollutionTest.hologram")}
								required
								validateStatus={errors.hollogram ? "error" : ""}
								help={errors.hollogram?.message}
							>
								<Controller
									name="hollogram"
									control={control}
									render={({ field }) => (
										<Select
											{...field}
											style={{ height: 35 }}
											placeholder={t("sys.forms.addPollutionTest.hologramPlaceholder")}
											options={hologramOptions}
										/>
									)}
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
					<Button type="primary" htmlType="submit" disabled={isSubmitDisabled} loading={isUpdating}>
						{t("Confirm & Save")}
					</Button>
				</div>
			</div>
		</Form>
	);
};
