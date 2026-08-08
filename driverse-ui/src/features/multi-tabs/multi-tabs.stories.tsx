import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
import MultiTabs from "./multi-tabs";
import { MultiTabsProvider } from "./providers/multi-tabs-provider";
import type { MultiTabsLayout, TabRouteMeta } from "./types";

function Panel({ title }: { title: string }) {
	return (
		<div style={{ padding: 24 }}>
			<h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
			<p style={{ fontSize: 13, opacity: 0.7 }}>Keep-alive page content for {title}.</p>
		</div>
	);
}

/**
 * Mock route table — what an app's router would hand the strip. In the apps these came from
 * `useCurrentRouteMeta()`; here the story's nav owns the "current route", which is exactly the seam
 * `MultiTabsNavigation` opens.
 */
export const MOCK_ROUTES: TabRouteMeta[] = [
	{ key: "/dashboard/workbench", label: "Workbench", outlet: <Panel title="Workbench" /> },
	{ key: "/vehicle-parks/fleets", label: "Fleets", outlet: <Panel title="Fleets" /> },
	{ key: "/documents/inbox", label: "Document inbox", outlet: <Panel title="Document inbox" /> },
	{ key: "/management/user/:id", label: "User detail", params: { id: "42" }, outlet: <Panel title="User 42" /> },
];

/** Spanish labels for the context menu, to exercise the `translate` seam that replaced react-i18next. */
const ES_TAB_MENU: Record<string, string> = {
	"sys.tab.refresh": "Actualizar",
	"sys.tab.close": "Cerrar",
	"sys.tab.closeLeft": "Cerrar a la izquierda",
	"sys.tab.closeRight": "Cerrar a la derecha",
	"sys.tab.closeOthers": "Cerrar las demás",
	"sys.tab.closeAll": "Cerrar todas",
};

function MultiTabsDemo({
	layout = "vertical",
	localised = false,
}: {
	layout?: MultiTabsLayout;
	localised?: boolean;
}) {
	// Stands in for the app router: `push` moves the current route, which the provider turns into a tab.
	const [route, setRoute] = useState<TabRouteMeta>(MOCK_ROUTES[0]);
	const [lastPush, setLastPush] = useState<string | null>(null);

	const push = useCallback((next: string) => {
		setLastPush(next);
		const match = MOCK_ROUTES.find((r) => next.startsWith(r.key.split("/:")[0]));
		if (match) setRoute(match);
	}, []);

	const translate = useCallback((key: string) => (localised ? (ES_TAB_MENU[key] ?? key) : key), [localised]);

	return (
		<div style={{ height: 360 }}>
			<MultiTabsProvider
				navigation={{ push, currentRouteMeta: route, homePath: MOCK_ROUTES[0].key }}
				translate={translate}
			>
				<MultiTabs push={push} layout={layout} />
				{/* Stands in for the shell's side nav: visiting a route is what opens a tab. The strip
				    itself is `position: fixed`, so the story leaves room for it above. */}
				<nav style={{ paddingTop: 48, display: "flex", gap: 8, flexWrap: "wrap" }}>
					{MOCK_ROUTES.map((r) => (
						<button
							key={r.key}
							type="button"
							onClick={() => push(r.params ? r.key.replace(":id", r.params.id ?? "") : r.key)}
							style={{ fontSize: 12, padding: "4px 10px", border: "1px solid currentColor", borderRadius: 6 }}
						>
							Go to {r.label}
						</button>
					))}
				</nav>
				<p style={{ fontSize: 12, opacity: 0.6, paddingTop: 8 }}>last push: {lastPush ?? "—"}</p>
			</MultiTabsProvider>
		</div>
	);
}

const meta = {
	title: "Features/MultiTabs",
	component: MultiTabsDemo,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MultiTabsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Horizontal: Story = { args: { layout: "horizontal" } };
export const Mini: Story = { args: { layout: "mini" } };
export const Localised: Story = { args: { localised: true } };
