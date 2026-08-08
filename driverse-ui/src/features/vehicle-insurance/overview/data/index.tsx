/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/data/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/data/index.tsx
 * @status adopted-A
 * @notes B differs by one dead line, `// import dayjs from "dayjs";`, left over from an abandoned edit.
 *        A adopted. `InsurancePolicy` now comes from the module's own `types.ts` instead of the app's
 *        root `#/entity`.
 */

import type { InsurancePolicy } from "../../types";

export const policyInfoData = (data?: InsurancePolicy, t?: (key: string) => string) => [
	{
		label: t ? t("sys.forms.policyInformation.policyNumber") : "Policy Number",
		value: data?.policy_number ?? (t ? t("sys.forms.policyInformation.notAvailable") : "N/A"),
	},
	{
		label: t ? t("sys.forms.policyInformation.insuranceCompany") : "Insurance Company",
		value: data?.insurance_company ?? (t ? t("sys.forms.policyInformation.notAvailable") : "N/A"),
	},
	{
		label: t ? t("sys.forms.policyInformation.item") : "Item",
		value: data?.clause ?? (t ? t("sys.forms.policyInformation.notAvailable") : "N/A"),
	},
	{
		label: t ? t("sys.forms.policyInformation.policyIssueDate") : "Policy Issue Date",
		value: data?.issue_date
			? data?.issue_date?.split("T")[0]
			: t
				? t("sys.forms.policyInformation.notAvailable")
				: "N/A",
	},
	{
		label: t ? t("sys.forms.policyInformation.coverageStartDate") : "Coverage Start Date",
		value: data?.coverage_start
			? data?.coverage_start?.split("T")[0]
			: t
				? t("sys.forms.policyInformation.notAvailable")
				: "N/A",
	},
	{
		label: t ? t("sys.forms.policyInformation.coverageEndDate") : "Coverage End Date",
		value: data?.coverage_end
			? data?.coverage_end?.split("T")[0]
			: t
				? t("sys.forms.policyInformation.notAvailable")
				: "N/A",
	},
];

export const policyholder = (data?: InsurancePolicy, t?: (key: string) => string) => [
	{
		label: t?.("sys.forms.insurance.policyholder.name") ?? "Policyholder Name",
		value: data?.policyholder_name ?? "N/A",
	},
	{
		label: t?.("sys.forms.insurance.policyholder.rfc") ?? "RFC",
		value: data?.rfc ?? "N/A",
	},
	{
		label: t?.("sys.forms.insurance.policyholder.address") ?? "Address",
		value: data?.address ?? "N/A",
	},
];

export const INSURANCE_COMPANIES = [
	{ label: "A.N.A. Compañía de Seguros, S.A. de C.V.", value: "A.N.A. Compañía de Seguros, S.A. de C.V." },
	{ label: "Agroasemex, S.A.", value: "Agroasemex, S.A." },
	{ label: "AIG Seguros México, S.A. de C.V.", value: "AIG Seguros México, S.A. de C.V." },
	{ label: "Allianz México, S.A., Compañía de Seguros", value: "Allianz México, S.A., Compañía de Seguros" },
	{ label: "Armour Secure Insurance, S.A. de C.V.", value: "Armour Secure Insurance, S.A. de C.V." },
	{ label: "Aseguradora Aserta, S.A. de C.V.", value: "Aseguradora Aserta, S.A. de C.V." },
	{ label: "Aseguradora Insurgentes, S.A. de C.V.", value: "Aseguradora Insurgentes, S.A. de C.V." },
	{ label: "Aseguradora Patrimonial Daños, S.A.", value: "Aseguradora Patrimonial Daños, S.A." },
	{ label: "Aseguradora Patrimonial Vida, S.A. de C.V.", value: "Aseguradora Patrimonial Vida, S.A. de C.V." },
	{ label: "Aserta Seguros Vida, S.A. de C.V.", value: "Aserta Seguros Vida, S.A. de C.V." },
	{ label: "Assurant Daños México, S.A.", value: "Assurant Daños México, S.A." },
	{ label: "Assurant Vida México, S.A.", value: "Assurant Vida México, S.A." },
	{ label: "Atradius Seguros de Crédito, S.A.", value: "Atradius Seguros de Crédito, S.A." },
	{ label: "Avla Seguros, S.A. de C.V.", value: "Avla Seguros, S.A. de C.V." },
	{ label: "AXA Seguros, S.A. de C.V.", value: "AXA Seguros, S.A. de C.V." },
	{
		label: "BBVA Seguros México, S.A. de C.V., Grupo Financiero BBVA México",
		value: "BBVA Seguros México, S.A. de C.V., Grupo Financiero BBVA México",
	},
	{
		label: "Berkley International Compañía de Garantías México, S.A. de C.V.",
		value: "Berkley International Compañía de Garantías México, S.A. de C.V.",
	},
	{
		label: "Berkley International Seguros México, S.A. de C.V.",
		value: "Berkley International Seguros México, S.A. de C.V.",
	},
	{ label: "Cardif México Seguros de Vida, S.A. de C.V.", value: "Cardif México Seguros de Vida, S.A. de C.V." },
	{
		label: "Cardif México Seguros Generales, S.A. de C.V.",
		value: "Cardif México Seguros Generales, S.A. de C.V.",
	},
	{ label: "CESCE México, S.A. de C.V.", value: "CESCE México, S.A. de C.V." },
	{
		label: "Chubb Fianzas Monterrey, Aseguradora de Caución, S.A.",
		value: "Chubb Fianzas Monterrey, Aseguradora de Caución, S.A.",
	},
	{ label: "Chubb Seguros México, S.A.", value: "Chubb Seguros México, S.A." },
	{ label: "COFACE Seguro de Crédito México, S.A. de C.V.", value: "COFACE Seguro de Crédito México, S.A. de C.V." },
	{
		label: "Compañía de Seguros Generales Everest México, S.A. de C.V",
		value: "Compañía de Seguros Generales Everest México, S.A. de C.V",
	},
	{ label: "CRABI, S.A. de C.V.", value: "CRABI, S.A. de C.V." },
	{ label: "Deco Seguros, S.A. de C.V.", value: "Deco Seguros, S.A. de C.V." },
	{ label: "Der Neue Horizont Re, S.A. de C.V.", value: "Der Neue Horizont Re, S.A. de C.V." },
	{ label: "Dorama, Institución de Garantías, S.A.", value: "Dorama, Institución de Garantías, S.A." },
	{ label: "El Águila, Compañía de Seguros, S.A. de C.V.", value: "El Águila, Compañía de Seguros, S.A. de C.V." },
	{ label: "Fianzas y Cauciones Atlas, S.A.", value: "Fianzas y Cauciones Atlas, S.A." },
	{ label: "FM Global de México, S.A. de C.V.", value: "FM Global de México, S.A. de C.V." },
	{ label: "General de Seguros, S.A.", value: "General de Seguros, S.A." },
	{ label: "Grupo Mexicano de Seguros, S.A. de C.V.", value: "Grupo Mexicano de Seguros, S.A. de C.V." },
	{ label: "Grupo Nacional Provincial, S.A.B.", value: "Grupo Nacional Provincial, S.A.B." },
	{ label: "HDI Global Seguros, S.A.", value: "HDI Global Seguros, S.A." },
	{ label: "HDI Seguros, S.A. de C.V.", value: "HDI Seguros, S.A. de C.V." },
	{ label: "HIR Compañía de Seguros, S.A. de C.V.", value: "HIR Compañía de Seguros, S.A. de C.V." },
	{
		label: "HSBC Seguros, S.A. de C.V., Grupo Financiero HSBC",
		value: "HSBC Seguros, S.A. de C.V., Grupo Financiero HSBC",
	},
	{
		label: "Inbursa Seguros de Caución y Fianzas, S.A., Grupo Financiero Inbursa",
		value: "Inbursa Seguros de Caución y Fianzas, S.A., Grupo Financiero Inbursa",
	},
	{ label: "Insignia Life, S.A. de C.V.", value: "Insignia Life, S.A. de C.V." },
	{ label: "La Latinoamericana Seguros, S.A.", value: "La Latinoamericana Seguros, S.A." },
	{ label: "Mapfre México, S.A.", value: "Mapfre México, S.A." },
	{ label: "MetLife Más, S.A. de C.V.", value: "MetLife Más, S.A. de C.V." },
	{ label: "Metlife México, S.A. de C.V.", value: "Metlife México, S.A. de C.V." },
	{ label: "Momento Seguros, S.A. de C.V.", value: "Momento Seguros, S.A. de C.V." },
	{
		label: "Pan-American México, Compañía de Seguros, S.A. de C.V",
		value: "Pan-American México, Compañía de Seguros, S.A. de C.V",
	},
	{ label: "Plenit Compañía de Seguros, S.A. de C.V.", value: "Plenit Compañía de Seguros, S.A. de C.V." },
	{ label: "Prevem Seguros, S.A. de C.V.", value: "Prevem Seguros, S.A. de C.V." },
	{ label: "Primero Seguros, S.A. de C.V.", value: "Primero Seguros, S.A. de C.V." },
	{
		label: "Protección Agropecuaria, Compañía de Seguros, S.A.",
		value: "Protección Agropecuaria, Compañía de Seguros, S.A.",
	},
	{ label: "Prudential Seguros México, S.A. de C.V.", value: "Prudential Seguros México, S.A. de C.V." },
	{ label: "Quálitas, Compañía de Seguros, S.A. de C.V.", value: "Quálitas, Compañía de Seguros, S.A. de C.V." },
	{ label: "REASEGURADORA PATRIA, S.A.", value: "REASEGURADORA PATRIA, S.A." },
	{
		label: "Seguros Afirme, S.A. de C.V., Afirme Grupo Financiero",
		value: "Seguros Afirme, S.A. de C.V., Afirme Grupo Financiero",
	},
	{ label: "Seguros Argos, S.A. de C.V.", value: "Seguros Argos, S.A. de C.V." },
	{ label: "Seguros Atlas, S.A.", value: "Seguros Atlas, S.A." },
	{ label: "Seguros Azteca Daños, S.A. de C.V.", value: "Seguros Azteca Daños, S.A. de C.V." },
	{ label: "Seguros Azteca, S.A. de C.V.", value: "Seguros Azteca, S.A. de C.V." },
	{
		label: "Seguros Banamex, S.A. de C.V., Integrante del Grupo Financiero Banamex",
		value: "Seguros Banamex, S.A. de C.V., Integrante del Grupo Financiero Banamex",
	},
	{
		label: "Seguros Banorte, S.A. de C.V., Grupo Financiero Banorte",
		value: "Seguros Banorte, S.A. de C.V., Grupo Financiero Banorte",
	},
	{ label: "Seguros de las Californias, S.A. de C.V.", value: "Seguros de las Californias, S.A. de C.V." },
	{ label: "Seguros El Potosí, S.A.", value: "Seguros El Potosí, S.A." },
	{
		label: "Seguros Inbursa, S.A., Grupo Financiero Inbursa",
		value: "Seguros Inbursa, S.A., Grupo Financiero Inbursa",
	},
	{ label: "Seguros Monterrey New York Life, S.A. de C.V.", value: "Seguros Monterrey New York Life, S.A. de C.V." },
	{ label: "Seguros Sura, S.A. de C.V.", value: "Seguros Sura, S.A. de C.V." },
	{
		label: "Seguros Ve por Más, S.A., Grupo Financiero Ve por Más",
		value: "Seguros Ve por Más, S.A., Grupo Financiero Ve por Más",
	},
	{ label: "Skandia Life, S.A. de C.V.", value: "Skandia Life, S.A. de C.V." },
	{ label: "Sofimex, Institución de Garantías, S.A.", value: "Sofimex, Institución de Garantías, S.A." },
	{ label: "Solunion México Seguros de Crédito, S.A.", value: "Solunion México Seguros de Crédito, S.A." },
	{ label: "Sompo Seguros México, S.A. de C.V.", value: "Sompo Seguros México, S.A. de C.V." },
	{ label: "SPP Institución de Seguros, S.A. de C.V.", value: "SPP Institución de Seguros, S.A. de C.V." },
	{ label: "SPT, Sociedad Mutualista de Seguros", value: "SPT, Sociedad Mutualista de Seguros" },
	{ label: "Stewart Title Guaranty de México, S.A. de C.V.", value: "Stewart Title Guaranty de México, S.A. de C.V." },
	{
		label: "Swiss Re Corporate Solutions México Seguros, S.A. de C.V.",
		value: "Swiss Re Corporate Solutions México Seguros, S.A. de C.V.",
	},
	{ label: "Thona Seguros, S.A. de C.V.", value: "Thona Seguros, S.A. de C.V." },
	{ label: "TLÁLOC SEGUROS, S.A.", value: "TLÁLOC SEGUROS, S.A." },
	{
		label: "Tokio Marine, Compañía de Seguros, S.A. de C.V.",
		value: "Tokio Marine, Compañía de Seguros, S.A. de C.V.",
	},
	{ label: "UMBRELLA COMPAÑÍA DE SEGUROS, S.A. DE C.V.", value: "UMBRELLA COMPAÑÍA DE SEGUROS, S.A. DE C.V." },
	{
		label: "Virginia Surety Seguros de México, S.A. de C.V.",
		value: "Virginia Surety Seguros de México, S.A. de C.V.",
	},
	{ label: "Zurich Aseguradora Mexicana, S.A. de C.V.", value: "Zurich Aseguradora Mexicana, S.A. de C.V." },
	{ label: "Zurich Santander Seguros México, S.A.", value: "Zurich Santander Seguros México, S.A." },
	{ label: "Zurich Vida, Compañía de Seguros, S.A.", value: "Zurich Vida, Compañía de Seguros, S.A." },
	{ label: "Zurich, Compañía de Seguros, S.A.", value: "Zurich, Compañía de Seguros, S.A." },
];

export const reminderPolicyOptions = [
	{ label: "7 days before", value: "7 days before" },
	{ label: "15 days before", value: "15 days before" },
	{ label: "30 days before", value: "30 days before" },
	{ label: "45 days before", value: "45 days before" },
	{ label: "60 days before", value: "60 days before" },
	{ label: "90 days before", value: "90 days before" },
];
