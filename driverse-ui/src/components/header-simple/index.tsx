/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/components/header-simple.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/components/header-simple.tsx
 * @status decoupled
 * @notes Byte-identical in both apps. Two decouplings, both for the same reason — the original composed
 *        two app-owned things it cannot own here:
 *          - `<Logo size={30} />` used the app logo component, which the library rewrote to require a
 *            `src` (logos are per-app assets). The mark is a `logo` prop instead, so an app passes its
 *            own `<Logo src={…} />` or any node.
 *          - `<SettingButton />` is the app's theme/settings drawer trigger, which lives on the zustand
 *            settings store the library deliberately does not take. It is the `action` prop.
 *        The header itself — the h-16 flex bar with its spacing — is verbatim, which is the reusable part.
 */

import type { FC, ReactNode } from "react";

type Props = {
	/** Brand mark. Apps pass `<Logo src={…} alt={…} size={30} />`. */
	logo?: ReactNode;
	/** Trailing control. Apps pass their SettingButton. */
	action?: ReactNode;
	className?: string;
};

const HeaderSimple: FC<Props> = ({ logo, action, className }) => {
	return (
		<header className={`flex h-16 w-full items-center justify-between px-6 ${className ?? ""}`.trim()}>
			{logo}
			{action}
		</header>
	);
};

export default HeaderSimple;
