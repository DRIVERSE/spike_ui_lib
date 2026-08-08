/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/web/use-permission.ts
 * @status adopted-A
 * @notes A adopted. Business's equivalent, `src/hooks/web/use-user-permissions.ts`, is deliberately NOT
 *        ported: it is broken (see the program manifest), so A's is the only working implementation.
 *        One decoupling: A read the permission list from the app's zustand `useUserStore`. The library
 *        takes it as an argument, so apps keep owning their session state.
 *        `Can` also gains its missing return type — A returned `children` directly from a component typed
 *        to return nothing in particular, which happens to work but does not type-check as a FC.
 */

import { Fragment, type ReactNode, createElement, useMemo } from "react";

export type PermissionApi = {
	has: (permissionKey: string) => boolean;
	hasAny: (permissionKeys: string[]) => boolean;
	hasAll: (permissionKeys: string[]) => boolean;
	getAll: () => string[];
};

export const usePermission = (userPermissions?: string[] | null): PermissionApi => {
	const permissionSet = useMemo(() => new Set(userPermissions || []), [userPermissions]);

	return useMemo(
		() => ({
			has: (permissionKey: string) => permissionSet.has(permissionKey),
			hasAny: (permissionKeys: string[]) => permissionKeys.some((key) => permissionSet.has(key)),
			hasAll: (permissionKeys: string[]) => permissionKeys.every((key) => permissionSet.has(key)),
			getAll: () => Array.from(permissionSet),
		}),
		[permissionSet],
	);
};

/**
 * Renders `children` only when the permission is present.
 * Takes the resolved permission API so it does not re-read the app's store per call site.
 */
export const Can = ({
	permission,
	permissions,
	children,
	fallback = null,
}: {
	permission: string;
	permissions?: string[] | null;
	children: ReactNode;
	fallback?: ReactNode;
}) => {
	const { has } = usePermission(permissions);
	// createElement rather than JSX so this stays a .ts module alongside the hook.
	return createElement(Fragment, null, has(permission) ? children : fallback);
};
