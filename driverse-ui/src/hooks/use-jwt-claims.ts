/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/useGetTenantId.tsx, src/hooks/web/use-clientId.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-tenantId.tsx, src/hooks/web/use-clientId.tsx
 * @status decoupled
 * @notes The four app hooks are the same function against two different claim keys, so the decoding is
 *        shared here and use-tenant-id.ts / use-client-id.ts are the thin hooks over it.
 *        Decoupled from `useKeycloak()`: the token is a parameter, so apps pass `keycloak.token` and the
 *        library takes no auth peer. `UserSessionJWT` came from the apps' `#/entity`; only the Hasura
 *        claims block is needed, so it is redeclared locally.
 */

import { jwtDecode } from "jwt-decode";

export const HASURA_CLAIMS = "https://hasura.io/jwt/claims";

export type UserSessionClaims = {
	[HASURA_CLAIMS]?: {
		"x-hasura-tenant-id"?: string;
		"x-hasura-client-id"?: string;
		[claim: string]: unknown;
	};
	[key: string]: unknown;
};

/** Reads one Hasura claim out of a JWT. Returns undefined with no token, null when decoding fails. */
export function readHasuraClaim(token: string | null | undefined, claim: string): string | null | undefined {
	if (!token) return undefined;

	try {
		const userInfo = jwtDecode<UserSessionClaims>(token);
		return (userInfo?.[HASURA_CLAIMS]?.[claim] as string | undefined) || null;
	} catch (error) {
		console.error(`Error extracting ${claim}:`, error);
		return null;
	}
}
