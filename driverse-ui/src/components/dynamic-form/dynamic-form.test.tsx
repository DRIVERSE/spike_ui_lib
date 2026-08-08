import { useDynamicFormSchema } from "@/hooks/use-dynamic-form-schema";
import { composeStories } from "@storybook/react";
import { render, screen, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as stories from "./dynamic-form.stories";
import DynamicForm from "./index";

const { Default, SAMPLE_SCHEMA } = { ...composeStories(stories), SAMPLE_SCHEMA: stories.SAMPLE_SCHEMA };

describe("useDynamicFormSchema", () => {
	it("builds a zod schema that mirrors the field types and required flags", () => {
		const { result } = renderHook(() => useDynamicFormSchema(SAMPLE_SCHEMA));
		const schema = result.current.DynamicFormSchema;

		const ok = schema.safeParse({
			plate: "ABC-123",
			registered_on: "2026-01-01",
			state: "Jalisco",
			notes: "",
			insured: true,
		});
		expect(ok.success).toBe(true);
	});

	it("rejects an empty required text field with the label in the message", () => {
		const { result } = renderHook(() => useDynamicFormSchema(SAMPLE_SCHEMA));
		const parsed = result.current.DynamicFormSchema.safeParse({
			plate: "",
			registered_on: "2026-01-01",
			state: "Jalisco",
		});

		expect(parsed.success).toBe(false);
		expect(JSON.stringify(parsed.error?.issues)).toContain("Plate number is required");
	});

	it("constrains a select to its options", () => {
		const { result } = renderHook(() => useDynamicFormSchema(SAMPLE_SCHEMA));
		const parsed = result.current.DynamicFormSchema.safeParse({
			plate: "ABC-123",
			registered_on: "2026-01-01",
			state: "Atlantis",
		});
		expect(parsed.success).toBe(false);
	});

	it("treats fields without `required` as optional", () => {
		const { result } = renderHook(() =>
			useDynamicFormSchema({ type: "t", form: [{ id: "notes", type: "textarea", label: "Notes" }] }),
		);
		expect(result.current.DynamicFormSchema.safeParse({}).success).toBe(true);
	});
});

describe("DynamicForm", () => {
	it("renders one control per field, of the right kind", () => {
		render(<DynamicForm formData={SAMPLE_SCHEMA} loading={false} onSubmit={vi.fn()} />);

		expect(screen.getByPlaceholderText("ABC-123")).toBeInTheDocument();
		expect(screen.getByText("Registered on")).toBeInTheDocument();
		expect(screen.getByText("State")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Anything worth flagging")).toBeInTheDocument();
		expect(screen.getByRole("switch")).toBeInTheDocument();
	});

	it("submits the filled values", async () => {
		const onSubmit = vi.fn();
		render(
			<DynamicForm
				formData={{
					type: "t",
					form: [
						{ id: "plate", type: "text", label: "Plate", required: true, placeholder: "plate" },
						{ id: "insured", type: "checkbox", label: "Insured" },
					],
				}}
				loading={false}
				onSubmit={onSubmit}
			/>,
		);

		await userEvent.type(screen.getByPlaceholderText("plate"), "XYZ-987");
		await userEvent.click(screen.getByRole("switch"));
		await userEvent.click(screen.getByRole("button", { name: /submit|save/i }));

		await waitFor(() => expect(onSubmit).toHaveBeenCalled());
		expect(onSubmit.mock.calls[0][0]).toMatchObject({ plate: "XYZ-987", insured: true });
	});

	it("blocks submission and surfaces the zod message when a required field is empty", async () => {
		const onSubmit = vi.fn();
		render(
			<DynamicForm
				formData={{ type: "t", form: [{ id: "plate", type: "text", label: "Plate", required: true }] }}
				loading={false}
				onSubmit={onSubmit}
			/>,
		);

		await userEvent.click(screen.getByRole("button", { name: /submit|save/i }));

		await waitFor(() => expect(screen.getByText("Plate is required")).toBeInTheDocument());
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("renders the default story", () => {
		render(<Default />);
		expect(screen.getByPlaceholderText("ABC-123")).toBeInTheDocument();
	});
});
