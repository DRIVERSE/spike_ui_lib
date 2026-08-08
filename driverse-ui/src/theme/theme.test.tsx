import { autocreditBrand, brandCssVar, businessBrand, defaultBrandTokens } from "@/tokens/brand";
import { presetsColors } from "@/tokens/color";
import { hexToRgbChannel } from "@/tokens/css-var-utils";
import { ThemeColorPresets, ThemeMode } from "@/tokens/enum";
import { composeStories } from "@storybook/react";
import { act, render, renderHook, screen } from "@testing-library/react";
import { Button } from "antd";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { AntdAdapter } from "./antd-adapter";
import { UIThemeProvider, type UIThemeProviderProps } from "./theme-provider";
import * as stories from "./theme.stories";
import { useTheme } from "./use-theme";

const { Default: DefaultStory } = composeStories(stories);

const root = () => window.document.documentElement;

function wrapper(props: Omit<UIThemeProviderProps, "children"> = {}) {
	return ({ children }: { children: ReactNode }) => <UIThemeProvider {...props}>{children}</UIThemeProvider>;
}

afterEach(() => {
	root().className = "";
	root().removeAttribute("style");
});

describe("UIThemeProvider", () => {
	it("puts the mode class on <html> and flips it when setMode is called", () => {
		const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });

		expect(result.current.mode).toBe(ThemeMode.Light);
		expect(root().classList.contains("light")).toBe(true);
		expect(root().classList.contains("dark")).toBe(false);

		act(() => result.current.setMode(ThemeMode.Dark));

		expect(result.current.mode).toBe(ThemeMode.Dark);
		expect(root().classList.contains("dark")).toBe(true);
		expect(root().classList.contains("light")).toBe(false);
	});

	it("honours defaultMode when uncontrolled", () => {
		const { result } = renderHook(() => useTheme(), { wrapper: wrapper({ defaultMode: ThemeMode.Dark }) });
		expect(result.current.mode).toBe(ThemeMode.Dark);
		expect(root().classList.contains("dark")).toBe(true);
	});

	it("stays put when controlled, and reports the request through onModeChange", () => {
		const onModeChange = vi.fn();
		const { result } = renderHook(() => useTheme(), {
			wrapper: wrapper({ mode: ThemeMode.Light, onModeChange }),
		});

		act(() => result.current.setMode(ThemeMode.Dark));

		expect(onModeChange).toHaveBeenCalledWith(ThemeMode.Dark);
		expect(result.current.mode).toBe(ThemeMode.Light);
		expect(root().classList.contains("light")).toBe(true);
	});

	it("writes the primary palette and shadow variables for the active color preset", () => {
		renderHook(() => useTheme(), { wrapper: wrapper({ colorPreset: ThemeColorPresets.Purple }) });

		const purple = presetsColors[ThemeColorPresets.Purple];
		expect(root().style.getPropertyValue("--colors-palette-primary-default")).toBe(purple.default);
		expect(root().style.getPropertyValue("--colors-palette-primary-defaultChannel")).toBe(
			hexToRgbChannel(purple.default),
		);
		expect(root().style.getPropertyValue("--shadows-primary")).toContain("box-shadow: 0 8px 16px 0 rgba(");
	});

	it("mirrors the resolved brand tokens onto --brand-* variables", () => {
		renderHook(() => useTheme(), { wrapper: wrapper({ brand: { driverse_primary: "#123456" } }) });

		expect(root().style.getPropertyValue(brandCssVar("driverse_primary"))).toBe("#123456");
		// unspecified keys still come from the library defaults
		expect(root().style.getPropertyValue(brandCssVar("driverse_green"))).toBe(defaultBrandTokens.driverse_green);
		expect(root().style.getPropertyValue(brandCssVar("driverse_light_blue"))).toBe(
			defaultBrandTokens.driverse_light_blue,
		);
	});

	it("applies font size and family", () => {
		renderHook(() => useTheme(), { wrapper: wrapper({ fontSize: 18, fontFamily: "Outfit" }) });
		expect(root().style.fontSize).toBe("18px");
		expect(window.document.body.style.fontFamily).toBe("Outfit");
	});
});

describe("useTheme", () => {
	it("throws outside a provider", () => {
		expect(() => renderHook(() => useTheme())).toThrow(/inside <UIThemeProvider>/);
	});

	it("returns the brand merged over the defaults", () => {
		const { result } = renderHook(() => useTheme(), { wrapper: wrapper({ brand: businessBrand }) });
		expect(result.current.brand).toEqual(businessBrand);
		expect(result.current.brand.driverse_primary_light).toBe("#f0f7ff");
		expect(result.current.brand.driverse_primary_light).not.toBe(autocreditBrand.driverse_primary_light);
	});

	it("resolves tokens against the active mode and color preset", () => {
		const { result } = renderHook(() => useTheme(), {
			wrapper: wrapper({ defaultMode: ThemeMode.Dark, colorPreset: ThemeColorPresets.Cyan }),
		});

		expect(result.current.tokens.color.background.default).toBe("#161c24");
		expect(result.current.tokens.color.palette.primary).toEqual(presetsColors[ThemeColorPresets.Cyan]);
		expect(result.current.tokens.shadow.card).toContain("rgba(0, 0, 0");
		expect(result.current.themeVars.colors.palette.primary.default).toBe("var(--colors-palette-primary-default)");
	});
});

describe("AntdAdapter", () => {
	it("renders children inside antd's ConfigProvider with the injected brand as colorPrimary", () => {
		render(
			<UIThemeProvider adapters={[AntdAdapter]} brand={{ driverse_primary: "#5F8BFA" }}>
				<Button type="primary">Save</Button>
			</UIThemeProvider>,
		);

		const button = screen.getByRole("button", { name: "Save" });
		expect(button).toBeInTheDocument();
		// ConfigProvider is what installs antd's css-in-js styles for the button.
		expect(button.className).toContain("ant-btn");
		expect(document.head.querySelector("style[data-css-hash]")).not.toBeNull();
	});

	it("has no axe violations", async () => {
		const { container } = render(
			<UIThemeProvider adapters={[AntdAdapter]}>
				<Button type="primary">Save</Button>
			</UIThemeProvider>,
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});

describe("theme story", () => {
	it("renders the themed demo card through the Storybook preview decorators", async () => {
		render(<DefaultStory />);

		expect(await screen.findByRole("heading", { name: "UIThemeProvider" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
		expect(screen.getByText("success")).toBeInTheDocument();
		expect(screen.getByText(brandCssVar("driverse_primary"))).toBeInTheDocument();
	});
});
