/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/schema/vehicle.schema.ts (VehicleInsuranceFieldType, VehicleInsuranceSchema, VehicleInsurancePolicyHolderSchema)
 *   B: Driverse_FE_Business   @ b96eda3 src/schema/vehicle.schema.ts (VehicleInsuranceFieldType, VehicleInsuranceSchema, VehicleInsurancePolicyHolderSchema)
 * @status identical
 * @notes Redeclared here because both apps keep their zod schemas in a root-level `src/schema/` directory
 *        the library cannot import, and this module only needs three of that file's many exports. Byte-identical
 *        between the two apps.
 */

import { type ZodType, z } from "zod";

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
	unique_policy_no: z.string({ message: "Unique policy number is required" }).min(1, {
		message: "Unique policy number is required",
	}),
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

export const VehicleInsurancePolicyHolderSchema: ZodType<VehicleInsuranceFieldType> = z.object({
	policy_holder_name: z.string({ message: "Policy holder full name is required" }).min(1, {
		message: "Policy holder full name is required",
	}),
	rfc: z.string({ message: "Rfc  is required" }).min(1, { message: "Rfc is required" }),
	address: z.string().optional(),
});
