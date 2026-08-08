import { composeStories } from "@storybook/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import IconButton from "./icon-button";
import * as buttonStories from "./icon-button.stories";
import { offlineIconNames } from "./iconify-bundle";
import * as galleryStories from "./icons.stories";
import SvgIcon from "./svg-icon";
import { svgIconMap, svgIconNames } from "./svg-map";

const { Svg: Gallery, IconifyOffline } = composeStories(galleryStories);
const { Default: DefaultButton, Disabled: DisabledButton } = composeStories(buttonStories);

afterEach(() => {
	vi.restoreAllMocks();
});

describe("svgIconMap", () => {
	it("covers the union of both apps' icon sets, minus the per-brand logo", () => {
		expect(svgIconNames.length).toBe(48);
		// QA-only icon and a shared one both present.
		expect(svgIconNames).toContain("ic-edit");
		expect(svgIconNames).toContain("ic_file_pdf");
		// ic_logo_nav differs per brand, so it is injected by the app rather than shipped.
		expect(svgIconNames).not.toContain("ic_logo_nav");
	});

	it("maps every name to a renderable component", () => {
		for (const name of svgIconNames) {
			expect(typeof svgIconMap[name]).toBe("function");
		}
	});
});

describe("SvgIcon", () => {
	it("renders a known icon with its name as the accessible label", () => {
		render(<SvgIcon icon="ic-analysis" />);
		const icon = screen.getByRole("img", { name: "ic-analysis" });
		expect(icon.tagName.toLowerCase()).toBe("svg");
		expect(icon).toHaveClass("anticon");
	});

	it("applies size, color and className", () => {
		render(<SvgIcon icon="ic-search" size={32} color="#DF3D3D" className="custom-icon" />);
		const icon = screen.getByRole("img", { name: "ic-search" });
		expect(icon).toHaveStyle({ width: "32px", height: "32px", color: "#DF3D3D" });
		expect(icon).toHaveClass("custom-icon");
	});

	it("warns once and renders nothing for an unknown name", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const { container, rerender } = render(<SvgIcon icon="ic-does-not-exist" />);

		expect(container).toBeEmptyDOMElement();
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain("ic-does-not-exist");

		rerender(<SvgIcon icon="ic-does-not-exist" />);
		expect(warn).toHaveBeenCalledTimes(1);
	});
});

describe("IconButton", () => {
	it("calls onClick when pressed", async () => {
		const onClick = vi.fn();
		render(
			<IconButton onClick={onClick}>
				<SvgIcon icon="ic-setting" />
			</IconButton>,
		);
		await userEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("blocks clicks when disabled", async () => {
		const onClick = vi.fn();
		render(
			<IconButton onClick={onClick} disabled>
				<SvgIcon icon="ic-setting" />
			</IconButton>,
		);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		await userEvent.click(button, { pointerEventsCheck: 0 });
		expect(onClick).not.toHaveBeenCalled();
	});

	it("renders a native button, never antd's `type` prop", () => {
		render(
			<IconButton>
				<SvgIcon icon="ic-setting" />
			</IconButton>,
		);
		expect(screen.getByRole("button")).toHaveAttribute("type", "button");
	});

	it("matches the default and disabled stories", () => {
		const { container: defaultTree } = render(<DefaultButton />);
		expect(defaultTree.firstChild).toMatchSnapshot("icon-button-default");

		const { container: disabledTree } = render(<DisabledButton />);
		expect(disabledTree.firstChild).toMatchSnapshot("icon-button-disabled");
	});
});

describe("offline iconify bundle", () => {
	it("registers the icon names both apps use", () => {
		expect(offlineIconNames.length).toBeGreaterThan(200);
		for (const name of ["solar:pen-bold", "mdi:circle", "lucide:car"]) {
			expect(offlineIconNames).toContain(name);
		}
	});

	it("renders Iconify icons without touching the network", async () => {
		const fetchSpy = vi.spyOn(globalThis, "fetch");
		render(<IconifyOffline />);
		expect(await screen.findByText("solar:pen-bold")).toBeInTheDocument();
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});

describe("icon gallery story", () => {
	it("lists every icon and passes axe", async () => {
		const { container } = render(<Gallery />);
		expect(screen.getByRole("heading", { name: `SVG icons (${svgIconNames.length})` })).toBeInTheDocument();
		expect(screen.getAllByRole("img")).toHaveLength(svgIconNames.length);
		expect(await axe(container)).toHaveNoViolations();
	});
});
