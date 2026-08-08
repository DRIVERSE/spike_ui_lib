/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/dashboard/multi-tabs/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/dashboard/multi-tabs/index.tsx
 * @status adopted-B
 * @notes A and B differ by one line: A left a `console.log("handleTabClick", key, params)` in the click
 *        handler that B had commented out. B adopted and the dead comment dropped.
 *        Everything visual is verbatim — the antd `Tabs` with its card type and `renderTabBar` override,
 *        the horizontal wheel-scroll listeners, `scrollIntoView` on the active tab, the drag reorder,
 *        the drag overlay, and the whole `StyledMultiTabs` block.
 *        Two decouplings: `useRouter().push` and `replaceDynamicParams` came from `@/router/hooks`; push
 *        is now the injected `navigation.push` read off the context's provider, and
 *        `replaceDynamicParams` is vendored beside this file. `useMultiTabsStyle` takes the shell layout
 *        as the `layout` prop instead of reading the zustand settings store.
 *        The mouseenter/mouseleave listeners were registered without cleanup in the apps — a real leak on
 *        unmount, since only the inner `wheel` handler was ever removed. They are now removed in the
 *        effect's teardown alongside it; behaviour while mounted is unchanged.
 */

import { Tabs } from "antd";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import SortableContainer from "./components/sortable-container";
import { SortableItem } from "./components/sortable-item";
import { TabItem } from "./components/tab-item";
import { useMultiTabsStyle } from "./hooks/use-tab-style";
import { useMultiTabsContext } from "./providers/multi-tabs-provider";
import { replaceDynamicParams } from "./replace-dynamic-params";
import type { KeepAliveTab, MultiTabsLayout } from "./types";

export type MultiTabsProps = {
	/** Navigates when a tab is clicked. Was `useRouter().push`. */
	push: (path: string) => void;
	/** Shell layout the strip positions against. Was `useSettings().themeLayout`. */
	layout?: MultiTabsLayout;
};

export default function MultiTabs({ push, layout = "vertical" }: MultiTabsProps) {
	const scrollContainer = useRef<HTMLUListElement>(null);

	const { tabs, activeTabRoutePath, setTabs } = useMultiTabsContext();
	const style = useMultiTabsStyle(layout);

	const handleTabClick = ({ key, params = {} }: KeepAliveTab) => {
		const tabKey = replaceDynamicParams(key, params);
		push(tabKey);
	};

	useEffect(() => {
		if (!scrollContainer.current) return;
		const tab = tabs.find((item) => item.key === activeTabRoutePath);
		const currentTabElement = scrollContainer.current.querySelector(`#tab${tab?.key.split("/").join("-")}`);
		if (currentTabElement) {
			currentTabElement.scrollIntoView({
				block: "nearest",
				behavior: "smooth",
			});
		}
	}, [tabs, activeTabRoutePath]);

	useEffect(() => {
		const container = scrollContainer.current;
		if (!container) return;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			container.scrollLeft += e.deltaY;
		};
		const attach = () => container.addEventListener("wheel", handleWheel);
		const detach = () => container.removeEventListener("wheel", handleWheel);

		container.addEventListener("mouseenter", attach);
		container.addEventListener("mouseleave", detach);

		return () => {
			container.removeEventListener("mouseenter", attach);
			container.removeEventListener("mouseleave", detach);
			detach();
		};
	}, []);

	const handleDragEnd = (oldIndex: number, newIndex: number) => {
		const newTabs = Array.from(tabs);
		const [movedTab] = newTabs.splice(oldIndex, 1);
		newTabs.splice(newIndex, 0, movedTab);

		setTabs([...newTabs]);
	};

	const renderOverlay = (id: string | number) => {
		const tab = tabs.find((tab) => tab.key === id);
		if (!tab) return null;
		return <TabItem tab={tab} />;
	};

	return (
		<StyledMultiTabs>
			<Tabs
				size="small"
				type="card"
				tabBarGutter={4}
				activeKey={activeTabRoutePath}
				items={tabs.map((tab) => ({
					...tab,
					children: <div key={tab.timeStamp}>{tab.children}</div>,
				}))}
				renderTabBar={() => {
					return (
						<div style={style}>
							<SortableContainer items={tabs} onSortEnd={handleDragEnd} renderOverlay={renderOverlay}>
								<ul ref={scrollContainer} className="flex overflow-x-auto w-full px-2 h-[32px] hide-scrollbar">
									{tabs.map((tab) => (
										<SortableItem tab={tab} key={tab.key} onClick={() => handleTabClick(tab)} />
									))}
								</ul>
							</SortableContainer>
						</div>
					);
				}}
			/>
		</StyledMultiTabs>
	);
}

const StyledMultiTabs = styled.div`
  height: 100%;
  margin-top: 2px;

  .anticon {
    margin: 0px !important;
  }

  .ant-tabs {
    height: 100%;
    .ant-tabs-content {
      height: 100%;
    }
    .ant-tabs-tabpane {
      height: 100%;
      & > div {
        height: 100%;
      }
    }
  }

  .hide-scrollbar {
    overflow: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
    will-change: transform;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;
