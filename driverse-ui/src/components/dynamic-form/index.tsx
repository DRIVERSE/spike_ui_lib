/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/dynamic-form/index.tsx
 * @status adopted-B
 * @notes Business-only. Lifted verbatim; only the util/hook/icon import paths changed. react-hook-form,
 *        @hookform/resolvers and zod are optional peers, matching the component's own imports.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Col, DatePicker, Form, Input, Row, Select, Space, Switch } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { type FC, useEffect } from "react";
import { Controller, type FieldError, useForm } from "react-hook-form";

import { type DynamicFormType, useDynamicFormSchema } from "@/hooks/use-dynamic-form-schema";
import { getColSpan } from "@/utils/misc";
import { DATE_FORMAT } from "@/utils/time";

import Iconify from "@/icons/iconify-icon";

type FormField = {
	id: string;
	type: "text" | "date" | "checkbox" | "select" | "textarea";
	label: string;
	value?: string | boolean;
	required?: string | boolean;
	options?: string[];
	placeholder?: string;
};

type DynamicFormData = {
	type: string;
	form: FormField[];
};

type Props = {
	formData: DynamicFormData;
	loading: boolean;
	buttonText?: string;
	buttonIcon?: string;
	columns?: 1 | 2 | 3 | 4;
	onSubmit: (formData: DynamicFormType) => void;
};

const DynamicForm: FC<Props> = ({ formData, loading, buttonText, buttonIcon, onSubmit, columns = 2 }) => {
	const { DynamicFormSchema } = useDynamicFormSchema(formData);
	const {
		control,
		formState: { errors },
		reset,
		handleSubmit,
	} = useForm<DynamicFormType>({
		resolver: zodResolver(DynamicFormSchema),
		mode: "onBlur",
	});

	useEffect(() => {
		const defaultValues = formData?.form?.reduce(
			(acc: DynamicFormType, field: FormField) => {
				acc[field.id] = field.value ?? "";
				return acc;
			},
			{} as Record<string, string | boolean>,
		);

		reset(defaultValues);
	}, [formData, reset]);

	const renderField = (field: FormField) => {
		const isRequired = field.required === true || field.required === "true";
		const error = errors[field.id] as FieldError | undefined;

		switch (field.type) {
			case "text":
				return (
					<Form.Item
						key={field.id}
						label={field.label}
						validateStatus={error ? "error" : ""}
						help={error?.message}
						required={isRequired}
					>
						<Controller
							name={field.id}
							control={control}
							render={({ field: inputField }) => (
								<Input {...inputField} className="ant-input" placeholder={field.placeholder} />
							)}
						/>
					</Form.Item>
				);

			case "date":
				return (
					<Form.Item
						key={field.id}
						label={field.label}
						validateStatus={error ? "error" : ""}
						help={error?.message}
						required={isRequired}
					>
						<Controller
							name={field.id}
							control={control}
							render={({ field: inputField }) => (
								<DatePicker
									className="w-full"
									placeholder=" 12-06-1970"
									format={DATE_FORMAT}
									value={inputField.value ? dayjs(inputField.value, DATE_FORMAT) : null}
									onChange={(date) => {
										inputField.onChange(date ? date.format(DATE_FORMAT) : "");
									}}
									disabledDate={(current) => {
										return current?.isAfter(dayjs().endOf("day"));
									}}
								/>
							)}
						/>
					</Form.Item>
				);

			case "checkbox":
				return (
					<Form.Item key={field.id} label={field.label} validateStatus={error ? "error" : ""} help={error?.message}>
						<Controller
							name={field.id}
							control={control}
							render={({ field: inputField }) => (
								<Switch checked={inputField.value as boolean} onChange={inputField.onChange} />
							)}
						/>
					</Form.Item>
				);

			case "select":
				return (
					<Form.Item
						key={field.id}
						label={field.label}
						validateStatus={error ? "error" : ""}
						help={error?.message}
						required={isRequired}
					>
						<Controller
							name={field.id}
							control={control}
							render={({ field: inputField }) => (
								<Select {...inputField} placeholder={field.placeholder || "Select..."} style={{ width: "100%" }}>
									{field.options?.map((option) => (
										<Select.Option key={option} value={option}>
											{option}
										</Select.Option>
									))}
								</Select>
							)}
						/>
					</Form.Item>
				);

			case "textarea":
				return (
					<Form.Item
						key={field.id}
						label={field.label}
						validateStatus={error ? "error" : ""}
						help={error?.message}
						required={isRequired}
					>
						<Controller
							name={field.id}
							control={control}
							render={({ field: inputField }) => (
								<TextArea {...inputField} placeholder={field.placeholder} rows={4} style={{ resize: "vertical" }} />
							)}
						/>
					</Form.Item>
				);

			default:
				return null;
		}
	};

	const colSpan = getColSpan(columns);

	return (
		<Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
			<Row gutter={[16, 0]}>
				{formData?.form?.map((field) => (
					<Col key={field.id} span={colSpan} xs={24} sm={colSpan}>
						{renderField(field)}
					</Col>
				))}
			</Row>

			<Form.Item style={{ marginTop: 24 }}>
				<Space style={{ width: "100%", justifyContent: "space-between" }}>
					<Button
						type="primary"
						htmlType="submit"
						icon={<Iconify icon={buttonIcon || ""} />}
						loading={loading}
						disabled={loading}
					>
						{buttonText || "Save"}
					</Button>
				</Space>
			</Form.Item>
		</Form>
	);
};

export default DynamicForm;
