/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/table/index.tsx
 * @status decoupled
 * @notes Autocredit-only. As written it was not a table component at all: it called
 *        `useQuery(GET_VEHICLES)` itself, hard-coded seven vehicle column definitions in `useState`, and
 *        console.logged selection and cell edits. Everything app-specific is stripped — rows, columns and
 *        loading are props, and the two console.log handlers are gone (callers pass ag-grid's own
 *        onSelectionChanged/onCellValueChanged through the rest spread). The vehicle colDefs live on in
 *        the story as demo data, which is the only place they were ever generic.
 *        `ModuleRegistry.registerModules([AllCommunityModule])` is kept — ag-grid 33 refuses to render
 *        without it — but is guarded so repeated imports do not re-register.
 *        ag-grid-community / ag-grid-react are optional peers behind the "./data-table" subpath.
 */

import { AllCommunityModule, type ColDef, ModuleRegistry } from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useMemo } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

export type DataTableProps<T = any> = {
	rowData?: T[];
	columnDefs: ColDef<T>[];
	loading?: boolean;
	/** Height of the grid wrapper. ag-grid needs an explicit height to render rows. */
	height?: string | number;
} & Omit<AgGridReactProps<T>, "rowData" | "columnDefs" | "loading">;

/** The defaults A set inline; kept untyped so it merges into any ColDef<T>. */
const DEFAULT_COL_DEF = {
	filter: false,
	editable: false,
	flex: 1,
	floatingFilter: false,
};

export default function DataTable<T = any>({
	rowData,
	columnDefs,
	loading,
	height = "100%",
	defaultColDef,
	...props
}: DataTableProps<T>) {
	const mergedDefaultColDef = useMemo<ColDef<T>>(
		() => ({ ...DEFAULT_COL_DEF, ...defaultColDef }) as ColDef<T>,
		[defaultColDef],
	);

	return (
		<div style={{ width: "100%", height }}>
			<AgGridReact<T>
				rowData={rowData}
				loading={loading}
				columnDefs={columnDefs}
				defaultColDef={mergedDefaultColDef}
				pagination={false}
				{...props}
			/>
		</div>
	);
}
