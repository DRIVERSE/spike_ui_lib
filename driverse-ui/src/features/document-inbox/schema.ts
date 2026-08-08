/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/schema/vehicle.schema.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/schema/vehicle.schema.ts
 * @status identical
 * @notes `vehicle.schema.ts` holds ~15 schemas shared across vehicle-parks; document-inbox only ever
 *        imported four of them (`CirculationCardSchema`, `PollutionTestSchema`, `OwnershipSchema`, and
 *        `VehicleInsuranceSchema`, the last one indirectly through `useAddInsurance` — see
 *        `hooks/useInsuranceForm.ts`). Those four are vendored here verbatim; the rest of the file
 *        belongs to vehicle-parks and is out of scope for this module.
 */

import dayjs from "dayjs";
import { type ZodType, z } from "zod";

export const CirculationCardSchema = z
	.object({
		card_number: z.string().min(1, "Card number is required"),
		issue_date: z.string().min(1, "Issue date is required"),
		expiry_date: z.string().optional().nullable(),
		permanentCard: z.boolean().default(false),
	})
	.refine(
		(data) => {
			if (data.permanentCard) return true;
			return !!data.expiry_date;
		},
		{ message: "Expiry date is required", path: ["expiry_date"] },
	)
	.refine(
		(data) => {
			if (!data.issue_date || !data.expiry_date) return true;
			return dayjs(data.expiry_date).isAfter(dayjs(data.issue_date), "day");
		},
		{ message: "Expiry date must be after issue date", path: ["expiry_date"] },
	);

export type CirculationCardFieldType = z.infer<typeof CirculationCardSchema>;

export const PollutionTestSchema = z.object({
	test_date: z.string().min(1, "Test date is required"),
	hollogram: z.string().min(1, "Hologram is required"),
});

export type PollutionTestFieldType = z.infer<typeof PollutionTestSchema>;

export const OwnershipSchema = z.object({
	FiscalYear: z.string().min(1, "Please select a year!"),
	amount: z.string().min(1, "Amount is required!"),
	paymentDate: z.string().min(1, "Please select the payment date!"),
});

export type OwnershipFieldType = z.infer<typeof OwnershipSchema>;

export type VehicleInsuranceFieldType = {
	unique_policy_no?: string;
	policy_issue_date?: string;
	company_name?: string;
	item?: string;
	coverage_start_date?: string;
	coverage_end_date?: string;
	policy_holder_name?: string;
	rfc?: string;
	address?: string;
};

export const VehicleInsuranceSchema: ZodType<VehicleInsuranceFieldType> = z.object({
	unique_policy_no: z
		.string({ message: "Unique policy number is required" })
		.min(1, { message: "Unique policy number is required" }),
	policy_issue_date: z.string().optional(),
	company_name: z.string({ message: "Company name  is required" }).min(1, { message: "Company name is required" }),
	coverage_start_date: z
		.string({ message: "Coverage start date  is required" })
		.min(1, { message: "Coverage start date  is required" }),
	coverage_end_date: z
		.string({ message: "Coverage end date  is required" })
		.min(1, { message: "Coverage end date  is required" }),
	item: z.string().optional(),
});
