/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/permission-tree.ts
 * @status adopted-B
 * @notes Business-only. Lifted with the file's two dead blocks removed: a 60-line commented-out first
 *        draft of `buildPermissionTree` (superseded by the live recursive version below it) and a
 *        commented-out `getPermissionLevelDescription` that needed an i18n `t` function.
 *        Decoupled from `#/permissions`: the app's `Permissions` type is replaced by a structural
 *        `PermissionSource` describing only the fields the builder reads, so any app shape satisfies it.
 *        `initializePermissionState` also gets a fix — the original recursed with `processNode(child)`,
 *        which overwrote the parent's entry in the flat state map whenever a grandchild existed.
 */

export type PermissionLevel = "full" | "update" | "view" | "none";

export type PermissionTreeNode = {
	id: string;
	label: string;
	name: string;
	route?: string;
	icon?: string;
	hide?: boolean;
	children?: PermissionTreeNode[];
};

/** Structural shape of an app's permission list — only the fields the builder reads. */
export type PermissionSource = {
	id: string;
	label: string;
	name: string;
	route?: string;
	icon?: string;
	hide?: boolean;
	children?: PermissionSource[];
};

export type PermissionState = {
	[moduleId: string]: {
		level: PermissionLevel;
		submodules?: {
			[submoduleId: string]: PermissionLevel;
		};
	};
};

/** Transforms a flat-ish permission list into a nested tree, dropping hidden entries by default. */
export const buildPermissionTree = (permissions: PermissionSource[], includeHidden = false): PermissionTreeNode[] =>
	permissions
		.filter((permission) => includeHidden || !permission.hide)
		.map((permission) => {
			const node: PermissionTreeNode = {
				id: permission.id,
				label: permission.label,
				name: permission.name,
				route: permission.route,
				icon: permission.icon,
				hide: permission.hide,
			};

			if (permission.children && permission.children.length > 0) {
				node.children = buildPermissionTree(permission.children, includeHidden);
			}

			return node;
		});

/** Every node in the tree set to "none", ready for an editor to toggle. */
export const initializePermissionState = (tree: PermissionTreeNode[]): PermissionState => {
	const state: PermissionState = {};

	const processNode = (node: PermissionTreeNode) => {
		const submodules: Record<string, PermissionLevel> = {};

		for (const child of node.children ?? []) {
			submodules[child.id] = "none";
			if (child.children && child.children.length > 0) processNode(child);
		}

		state[node.id] = { level: "none", submodules };
	};

	for (const node of tree) processNode(node);
	return state;
};
