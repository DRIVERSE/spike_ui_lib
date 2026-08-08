import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import DynamicForm from "./index";

export const SAMPLE_SCHEMA = {
	type: "vehicle-intake",
	form: [
		{ id: "plate", type: "text" as const, label: "Plate number", required: true, placeholder: "ABC-123" },
		{ id: "registered_on", type: "date" as const, label: "Registered on", required: true },
		{
			id: "state",
			type: "select" as const,
			label: "State",
			options: ["Jalisco", "Nuevo León", "CDMX"],
			required: true,
		},
		{ id: "notes", type: "textarea" as const, label: "Notes", placeholder: "Anything worth flagging" },
		{ id: "insured", type: "checkbox" as const, label: "Currently insured" },
	],
};

const meta = {
	title: "Components/DynamicForm",
	component: DynamicForm,
	args: { formData: SAMPLE_SCHEMA, loading: false, onSubmit: fn() },
} satisfies Meta<typeof DynamicForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleColumn: Story = { args: { columns: 1 } };

export const Submitting: Story = { args: { loading: true, buttonText: "Saving…" } };
