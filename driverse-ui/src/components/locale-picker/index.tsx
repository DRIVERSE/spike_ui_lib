/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/locale-picker/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/locale-picker/index.tsx
 * @status decoupled
 * @notes The two differ only in formatting, but both are welded to the app: they call the app's
 *        `useLocale()` (an i18next wrapper) for the current value and setter, and read the option list
 *        from the app-local `LANGUAGE_MAP`, whose `icon` values point at the `ic-locale_*` SVGs.
 *        The library owns neither i18next nor an app's locale list, so this is a controlled component:
 *        `locales` / `value` / `onChange`. Apps pass `LANGUAGE_MAP` straight through — the shape is the
 *        same three fields — and keep i18next entirely on their side.
 *        Icons: an `icon` starting with "ic-" renders through <SvgIcon> (the bundled locale flags),
 *        anything containing ":" renders through <Iconify>, so either icon system works.
 *        A11y fix: both apps wrapped an IconButton — itself a <button> — inside another <button>.
 *        Nested interactive elements are invalid HTML and fail axe; the IconButton is now the
 *        dropdown trigger directly, carrying the accessible name.
 */

import IconButton from "@/icons/icon-button";
import Iconify from "@/icons/iconify-icon";
import SvgIcon from "@/icons/svg-icon";
import { Dropdown, type MenuProps, Space } from "antd";
import type { FC } from "react";

export type LocaleOption = {
	value: string;
	label: string;
	/** Icon name: "ic-locale_en_US" for a bundled SVG, "twemoji:flag-mexico" for Iconify. */
	icon?: string;
};

type Props = {
	locales: LocaleOption[];
	value?: string;
	onChange: (value: string) => void;
	className?: string;
};

const LocaleIcon = ({ icon, size }: { icon: string; size: number }) =>
	icon.includes(":") ? (
		<Iconify icon={icon} size={size} className="rounded-md" />
	) : (
		<SvgIcon icon={icon} size={size} className="rounded-md" />
	);

const LocalePicker: FC<Props> = ({ locales, value, onChange, className }) => {
	const current = locales.find((locale) => locale.value === value) ?? locales[0];

	const items: MenuProps["items"] = locales.map((locale) => ({
		key: locale.value,
		label: locale.label,
		icon: locale.icon ? <LocaleIcon icon={locale.icon} size={20} /> : undefined,
	}));

	return (
		<Dropdown menu={{ items, onClick: (e) => onChange(e.key) }}>
			<Space>
				<IconButton
					className={`h-10 w-10 hover:scale-105 ${className ?? ""}`}
					aria-label={`Language: ${current?.label ?? ""}`}
				>
					{current?.icon ? <LocaleIcon icon={current.icon} size={24} /> : <span>{current?.label}</span>}
				</IconButton>
			</Space>
		</Dropdown>
	);
};

export default LocalePicker;
