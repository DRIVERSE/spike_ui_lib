/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/dashboard/multi-tabs/components/tab-item.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/dashboard/multi-tabs/components/tab-item.tsx
 * @status decoupled
 * @notes Byte-identical in both apps. The context menu — its seven entries, their icons, their disabled
 *        conditions and the switch that dispatches them — is verbatim, as is the tab body.
 *        `MultiTabOperation` moved from the apps' `#/enum` to the module's own `types.ts` (same string
 *        values, so `sys.tab.*` keys still resolve). `Iconify` moved from `@/components/icon` to
 *        `@/icons/iconify-icon`, where W3 put it.
 *        `useTranslation()` is gone — the library ships no i18next dependency. The `sys.tab.*` keys are
 *        still what gets asked for, through the injected `translate`; because i18next returns the key
 *        itself when a translation is missing, the untranslated default would have rendered
 *        "sys.tab.closeOthers" in the menu, so each entry now falls back to an English label when
 *        `translate` hands the key straight back. Apps that pass `t` see exactly what they saw before.
 */

import Iconify from "@/icons/iconify-icon";
import { Dropdown, type MenuProps } from "antd";
import { useTabLabelRender } from "../hooks/use-tab-label-render";
import { useMultiTabsContext } from "../providers/multi-tabs-provider";
import { MultiTabOperation, type TabItemProps } from "../types";

/** Rendered when `translate` returns the key unchanged, i.e. the app supplied no i18n. */
const FALLBACK_LABEL: Record<string, string> = {
	[MultiTabOperation.REFRESH]: "Refresh",
	[MultiTabOperation.CLOSE]: "Close",
	[MultiTabOperation.CLOSELEFT]: "Close left",
	[MultiTabOperation.CLOSERIGHT]: "Close right",
	[MultiTabOperation.CLOSEOTHERS]: "Close others",
	[MultiTabOperation.CLOSEALL]: "Close all",
};

export function TabItem({ tab, style, onClose }: TabItemProps) {
	const { tabs, refreshTab, closeTab, closeOthersTab, closeLeft, closeRight, closeAll, translate } =
		useMultiTabsContext();

	const renderTabLabel = useTabLabelRender();

	const label = (operation: MultiTabOperation) => {
		const key = `sys.tab.${operation}`;
		const translated = translate(key);
		return translated === key ? FALLBACK_LABEL[operation] : translated;
	};

	const menuItems: MenuProps["items"] = [
		{
			label: label(MultiTabOperation.REFRESH),
			key: MultiTabOperation.REFRESH,
			icon: <Iconify icon="mdi:reload" size={18} />,
		},
		{
			label: label(MultiTabOperation.CLOSE),
			key: MultiTabOperation.CLOSE,
			icon: <Iconify icon="material-symbols:close" size={18} />,
			disabled: tabs.length === 1,
		},
		{
			type: "divider",
		},
		{
			label: label(MultiTabOperation.CLOSELEFT),
			key: MultiTabOperation.CLOSELEFT,
			icon: <Iconify icon="material-symbols:tab-close-right-outline" size={18} className="rotate-180" />,
			disabled: tabs.findIndex((t) => t.key === tab.key) === 0,
		},
		{
			label: label(MultiTabOperation.CLOSERIGHT),
			key: MultiTabOperation.CLOSERIGHT,
			icon: <Iconify icon="material-symbols:tab-close-right-outline" size={18} />,
			disabled: tabs.findIndex((t) => t.key === tab.key) === tabs.length - 1,
		},
		{
			type: "divider",
		},
		{
			label: label(MultiTabOperation.CLOSEOTHERS),
			key: MultiTabOperation.CLOSEOTHERS,
			icon: <Iconify icon="material-symbols:tab-close-outline" size={18} />,
			disabled: tabs.length === 1,
		},
		{
			label: label(MultiTabOperation.CLOSEALL),
			key: MultiTabOperation.CLOSEALL,
			icon: <Iconify icon="mdi:collapse-all-outline" size={18} />,
		},
	];

	const menuClick = (menuInfo: any) => {
		const { key, domEvent } = menuInfo;
		domEvent.stopPropagation();

		switch (key) {
			case MultiTabOperation.REFRESH:
				refreshTab(tab.key);
				break;
			case MultiTabOperation.CLOSE:
				closeTab(tab.key);
				break;
			case MultiTabOperation.CLOSEOTHERS:
				closeOthersTab(tab.key);
				break;
			case MultiTabOperation.CLOSELEFT:
				closeLeft(tab.key);
				break;
			case MultiTabOperation.CLOSERIGHT:
				closeRight(tab.key);
				break;
			case MultiTabOperation.CLOSEALL:
				closeAll();
				break;
			default:
				break;
		}
	};

	return (
		<Dropdown
			trigger={["contextMenu"]}
			menu={{
				items: menuItems,
				onClick: menuClick,
			}}
		>
			<div className="relative flex select-none items-center px-4 py-1" style={style}>
				<div>{renderTabLabel(tab)}</div>
				{!tab.hideTab && (
					<Iconify
						icon="ion:close-outline"
						size={18}
						className="ml-2 cursor-pointer opacity-50"
						onClick={(e) => {
							e.stopPropagation();
							onClose?.();
						}}
					/>
				)}
			</div>
		</Dropdown>
	);
}
