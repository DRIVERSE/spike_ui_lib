/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/edit/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/edit/index.tsx
 * @status merged
 * @notes Functionally identical; B only re-wraps a few `rules={[{ ... }]}` arrays and two inline comments
 *        onto more lines (a prettier pass A didn't get). Base is A; biome reformats both the same way
 *        regardless. All visual JSX — the modal, the two-section form, the document swap panel, the action
 *        row — is verbatim.
 *        `useEditInsuranceForm` (not one of the 14 listed files, but this component's whole state) is
 *        vendored alongside it as `use-edit-insurance-form.ts`; `UploadComplianceImage` (compliance
 *        feature, also not listed) as `../components/upload-compliance-image`. `data: any` is now typed
 *        `InsurancePolicy`. `react-icons/ci`'s `CiImageOn` is rendered through the library's `Iconify`
 *        wrapper instead — same substitution `total-card`/`export-button` made — so this module takes no
 *        react-icons dependency of its own.
 */

import { Header } from "@/components/page-header/header";
import Iconify from "@/icons/iconify-icon";
import { Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Select } from "antd";
import type { FC } from "react";
import { UploadComplianceImage } from "../components/upload-compliance-image";
import { INSURANCE_COMPANIES } from "../overview/data";
import type { InsurancePolicy } from "../types";
import { useEditInsuranceForm } from "./use-edit-insurance-form";

type Props = {
	open: boolean;
	okText?: string;
	data?: InsurancePolicy;
	onOpen?: (open: boolean) => void;
};

const EditInsuranceForm: FC<Props> = ({ onOpen, open, data }) => {
	const {
		t,
		form,
		clientId,
		mappedFiles,
		hasFile,
		editing,
		deleting,
		isUploading,
		Dragger,
		draggerProps,
		preview,
		fileName,
		reset,
		shouldShowExisting,
		selectedFile,
		onFinish,
		handleDeleteFile,
		handleCancel,
	} = useEditInsuranceForm({ open, data, onOpen });

	const isLoading = editing || deleting || isUploading;

	return (
		<Modal
			centered
			title="Edit Insurance Policy"
			open={open}
			onCancel={handleCancel}
			footer={null}
			width={700}
			styles={{ body: { maxHeight: 600, overflowY: "auto" } }}
		>
			<div className="w-full flex h-full flex-col gap-4">
				<Form form={form} onFinish={onFinish} layout="vertical" className="h-full flex flex-col">
					<div className="flex flex-col gap-4 flex-1">
						<Card className="flex-1" styles={{ body: { height: "100%" } }}>
							{/* Policy Information */}
							<div className="flex justify-between items-center mb-6">
								<Header title="Policy Information" />
							</div>

							<Row gutter={[16, 16]}>
								<Col span={12}>
									<Form.Item
										label="Insurance Company"
										name="insuranceCompany"
										rules={[{ required: true, message: "Please select an insurance company" }]}
									>
										<Select placeholder="Select Insurance Company" options={INSURANCE_COMPANIES} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label="Unique Policy Number"
										name="policyNumber"
										rules={[{ required: true, message: "Please enter the policy number" }]}
									>
										<Input placeholder="Enter policy number" />
									</Form.Item>
								</Col>
							</Row>

							<Row gutter={[16, 16]}>
								<Col span={12}>
									<Form.Item label="Item" name="item">
										<Input placeholder="Enter item" />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label="Policy Issue Date" name="policyIssueDate">
										<DatePicker style={{ width: "100%", height: 35 }} format="YYYY-MM-DD" placeholder="Select date" />
									</Form.Item>
								</Col>
							</Row>

							<Row gutter={[16, 16]}>
								<Col span={12}>
									<Form.Item
										label="Start Date of Coverage"
										name="coverageStart"
										rules={[{ required: true, message: "Please select start date" }]}
									>
										<DatePicker style={{ width: "100%", height: 35 }} format="YYYY-MM-DD" placeholder="Select date" />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label="End Date of Coverage"
										name="coverageEnd"
										rules={[{ required: true, message: "Please select end date" }]}
									>
										<DatePicker style={{ width: "100%", height: 35 }} format="YYYY-MM-DD" placeholder="Select date" />
									</Form.Item>
								</Col>
							</Row>

							<Divider />

							{/* Policyholder Information */}
							<div className="flex justify-between items-center mb-6">
								<Header title="Policyholder Information" />
							</div>

							<Row gutter={[16, 16]}>
								<Col span={12}>
									<Form.Item
										label="Full Name of Policyholder"
										name="policyholderName"
										rules={[{ required: true, message: "Please enter the policyholder name" }]}
									>
										<Input placeholder="Enter full name" />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item label="RFC" name="rfc" rules={[{ required: true, message: "Please enter the RFC" }]}>
										<Input placeholder="Enter RFC" />
									</Form.Item>
								</Col>
							</Row>

							<Row gutter={[16, 16]}>
								<Col span={24}>
									<Form.Item label="Full Address" name="address">
										<Input placeholder="Enter full address" />
									</Form.Item>
								</Col>
							</Row>

							<Divider />

							{/* Document Section */}
							{hasFile ? (
								<div className="flex items-center justify-between p-3 rounded-md border border-gray-300">
									<div className="flex items-center gap-3">
										<Iconify icon="mdi:image-outline" size={20} />
										<span className="text-sm">{mappedFiles[0].fileName}</span>
									</div>
									<Button
										type="text"
										danger
										icon={<Iconify icon="mdi:trash-can-outline" />}
										loading={deleting}
										disabled={isLoading}
										onClick={() => handleDeleteFile()}
									>
										{t("sys.modal.action.delete")}
									</Button>
								</div>
							) : (
								<UploadComplianceImage
									data={mappedFiles}
									payload={{
										customerId: clientId,
										category: "insurance",
										uniqueId: `${data?.id || ""}`,
										documentGroup: "insurance",
										split: false,
									}}
									loading={isLoading}
									hideActions // suppresses internal Cancel/Process Document buttons
									controlled={{
										Dragger,
										props: draggerProps,
										preview,
										fileName,
										reset,
										shouldShowExisting,
										selectedFile,
										handleCancel,
										processUpload: async () => undefined, // no-op: upload is driven by onFinish
										isUploading,
									}}
								/>
							)}
						</Card>

						{/* Single row of action buttons */}
						<div className="flex justify-end gap-2">
							<Button onClick={handleCancel} style={{ maxWidth: 170, width: "100%" }} disabled={isLoading}>
								{t("sys.forms.addTenure.cancel")}
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								style={{ maxWidth: 170, width: "100%" }}
								disabled={isLoading}
								loading={isLoading}
							>
								{t("sys.forms.addTenure.submit")}
							</Button>
						</div>
					</div>
				</Form>
			</div>
		</Modal>
	);
};

export default EditInsuranceForm;
