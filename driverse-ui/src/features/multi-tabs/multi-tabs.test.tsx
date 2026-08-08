import { composeStories } from "@storybook/react";
import { act, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useTabOperations } from "./hooks/use-tab-operations";
import * as stories from "./multi-tabs.stories";
import { replaceDynamicParams } from "./replace-dynamic-params";
import { type KeepAliveTab, MultiTabOperation, type MultiTabsNavigation } from "./types";

const { Default, Horizontal, Mini, Localised } = composeStories(stories);

const tab = (key: string, label = key): KeepAliveTab => ({ key, label, children: null });

const navigation = (push = vi.fn()): MultiTabsNavigation => ({ push, homePath: "/home" });

/**
 * The tab strip is the story's only `<ul>`. Scoping to it matters: every route label also appears in the
 * story's nav button and again in the rendered page body.
 */
const strip = () => within(screen.getByRole("list"));

describe("MultiTabs", () => {
	it("renders a tab for the active route", async () => {
		render(<Default />);
		expect(await strip().findByText("Workbench")).toBeInTheDocument();
	});

	it("opens a keep-alive tab when the app navigates to a new route", async () => {
		render(<Default />);
		expect(await strip().findByText("Workbench")).toBeInTheDocument();
		expect(strip().queryByText("Document inbox")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: "Go to Document inbox" }));

		// Both tabs are now in the strip — the first is kept alive rather than replaced.
		expect(await strip().findByText("Document inbox")).toBeInTheDocument();
		expect(strip().getByText("Workbench")).toBeInTheDocument();
	});

	it("resolves dynamic params into the tab key before pushing", async () => {
		render(<Default />);
		await userEvent.click(screen.getByRole("button", { name: "Go to User detail" }));
		expect(await screen.findByText("last push: /management/user/42")).toBeInTheDocument();
	});

	it("localises the context menu through the injected translate", async () => {
		render(<Localised />);
		await userEvent.pointer({ keys: "[MouseRight]", target: await strip().findByText("Workbench") });
		expect(await screen.findByText("Cerrar todas")).toBeInTheDocument();
	});

	it("falls back to English menu labels when no translate is supplied", async () => {
		render(<Default />);
		await userEvent.pointer({ keys: "[MouseRight]", target: await strip().findByText("Workbench") });
		// i18next hands back the key when a translation is missing; the library must not render
		// "sys.tab.closeAll" at the user.
		expect(await screen.findByText("Close all")).toBeInTheDocument();
		expect(screen.queryByText(`sys.tab.${MultiTabOperation.CLOSEALL}`)).not.toBeInTheDocument();
	});
});

describe("replaceDynamicParams", () => {
	it("substitutes named params and leaves unmatched segments alone", () => {
		expect(replaceDynamicParams("/user/:id", { id: "42" })).toBe("/user/42");
		expect(replaceDynamicParams("/user/:id/post/:postId", { id: "1", postId: "2" })).toBe("/user/1/post/2");
		expect(replaceDynamicParams("/user/:id", {})).toBe("/user/:id");
		expect(replaceDynamicParams("/static", { id: "1" })).toBe("/static");
	});
});

describe("useTabOperations", () => {
	it("navigates to the neighbouring tab when one is closed", () => {
		const push = vi.fn();
		const setTabs = vi.fn();
		const tabs = [tab("/a"), tab("/b"), tab("/c")];

		const { result } = renderHook(() => useTabOperations(tabs, setTabs, "/b", navigation(push)));
		act(() => result.current.closeTab("/b"));

		expect(push).toHaveBeenCalledWith("/a");
		expect(setTabs).toHaveBeenCalledWith([tabs[0], tabs[2]]);
	});

	it("refuses to close the last remaining tab", () => {
		const push = vi.fn();
		const setTabs = vi.fn();

		const { result } = renderHook(() => useTabOperations([tab("/a")], setTabs, "/a", navigation(push)));
		act(() => result.current.closeTab("/a"));

		expect(push).not.toHaveBeenCalled();
		expect(setTabs).not.toHaveBeenCalled();
	});

	it("sends closeAll to the injected homePath instead of import.meta.env", () => {
		const push = vi.fn();
		const setTabs = vi.fn();

		const { result } = renderHook(() => useTabOperations([tab("/a"), tab("/b")], setTabs, "/a", navigation(push)));
		act(() => result.current.closeAll());

		expect(setTabs).toHaveBeenCalledWith([]);
		expect(push).toHaveBeenCalledWith("/home");
	});

	it("trims left and right of a tab", () => {
		const setTabs = vi.fn();
		const tabs = [tab("/a"), tab("/b"), tab("/c")];

		const { result } = renderHook(() => useTabOperations(tabs, setTabs, "/a", navigation()));

		act(() => result.current.closeLeft("/b"));
		expect(setTabs).toHaveBeenLastCalledWith([tabs[1], tabs[2]]);

		act(() => result.current.closeRight("/b"));
		expect(setTabs).toHaveBeenLastCalledWith([tabs[0], tabs[1]]);
	});
});

describe("stories", () => {
	it.each([
		["Default", Default],
		["Horizontal", Horizontal],
		["Mini", Mini],
		["Localised", Localised],
	])("%s renders", async (_name, Story) => {
		const { container } = render(<Story />);
		expect(container.firstChild).not.toBeNull();
	});
});
