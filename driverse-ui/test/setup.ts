import "@ant-design/v5-patch-for-react-19";
import "@testing-library/jest-dom/vitest";
// Registers the offline Iconify collections so <Iconify> never hits the network in tests.
import "../src/icons/iconify-bundle";
import { setProjectAnnotations } from "@storybook/react";
import { expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";
import preview from "../.storybook/preview";

expect.extend(axeMatchers);

// Portable stories: composeStories() in *.test.tsx then renders through the real preview decorators
// (UIThemeProvider + AntdAdapter) and globals, so a story stays the single fixture definition.
setProjectAnnotations(preview);

// jsdom lacks these browser APIs that theme/media components rely on.
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
});

// axe's color-contrast rule probes a canvas to detect icon ligatures; jsdom has no 2d context.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"];

// jsdom has no layout, so it implements no scrolling; multi-tabs scrolls the active tab into view.
if (!("scrollIntoView" in Element.prototype)) {
	Object.defineProperty(Element.prototype, "scrollIntoView", { writable: true, value: () => {} });
}

// sonner captures the pointer for swipe-to-dismiss; jsdom implements none of the Pointer Capture API.
for (const method of ["setPointerCapture", "releasePointerCapture", "hasPointerCapture"] as const) {
	if (!(method in Element.prototype)) {
		Object.defineProperty(Element.prototype, method, {
			writable: true,
			value: () => (method === "hasPointerCapture" ? false : undefined),
		});
	}
}

// apexcharts measures every label with getBBox, which jsdom does not implement. Charts render into a
// zero-sized SVG in tests; the stub keeps that from raising unhandled errors.
if (typeof SVGElement !== "undefined" && !("getBBox" in SVGElement.prototype)) {
	Object.defineProperty(SVGElement.prototype, "getBBox", {
		writable: true,
		value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
	});
}

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}
window.ResizeObserver = window.ResizeObserver ?? (ResizeObserverMock as unknown as typeof ResizeObserver);
