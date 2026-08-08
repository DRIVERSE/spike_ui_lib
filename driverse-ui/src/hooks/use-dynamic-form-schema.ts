/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-dynamic-form-schema.tsx
 * @status adopted-B
 * @notes Business-only. Lifted verbatim; the inner forEach became a for...of for the lint rule, and the file
 *        is .ts rather than .tsx since it contains no JSX. zod is an optional peer.
 */

import { useMemo } from "react";
import { z } from "zod";

type FormField = {
	id: string;
	type: "text" | "date" | "checkbox" | "select" | "textarea";
	label: string;
	value?: string | boolean;
	required?: string | boolean;
	options?: string[];
};

type DynamicFormData = {
	type: string;
	form: FormField[];
};

export type ZodSchemaShape = Record<string, z.ZodTypeAny>;

export function useDynamicFormSchema(formData: DynamicFormData) {
	const generateZodSchema = (formData: DynamicFormData) => {
		const schemaShape: ZodSchemaShape = {};

		for (const field of formData?.form ?? []) {
			let baseType: z.ZodTypeAny;

			const isRequired = field.required === true || field.required === "true";

			switch (field.type) {
				case "text":
					baseType = z.string();
					break;
				case "date":
					baseType = z.string();
					break;
				case "checkbox":
					baseType = z.boolean();
					break;
				case "select":
					baseType =
						field.options && field.options.length > 0 ? z.enum(field.options as [string, ...string[]]) : z.string();
					break;
				case "textarea":
					baseType = z.string();
					break;
				default:
					baseType = z.any();
			}

			if (isRequired) {
				schemaShape[field.id] =
					field.type === "text" || field.type === "textarea" || field.type === "date"
						? (baseType as z.ZodString).min(1, `${field.label} is required`)
						: baseType;
			} else {
				schemaShape[field.id] = baseType.optional();
			}
		}

		return z.object(schemaShape);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: generateZodSchema is pure over formData
	const DynamicFormSchema = useMemo(() => generateZodSchema(formData), [formData]);

	return {
		DynamicFormSchema,
	};
}

export type DynamicFormType = z.infer<ReturnType<typeof useDynamicFormSchema>["DynamicFormSchema"]>;
