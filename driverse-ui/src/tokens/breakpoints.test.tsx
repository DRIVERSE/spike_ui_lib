import { composeStories } from "@storybook/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { breakpointsTokens } from "./breakpoints";
import * as stories from "./breakpoints.stories";

const { Default } = composeStories(stories);

describe("breakpointsTokens", () => {
	it("matches the token contract shared by both apps", () => {
		expect(breakpointsTokens).toEqual({
			xs: "375px",
			sm: "576px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		});
	});

	it("renders the token gallery story", () => {
		render(<Default />);
		for (const [name, value] of Object.entries(breakpointsTokens)) {
			expect(screen.getByText(name)).toBeInTheDocument();
			expect(screen.getByText(value)).toBeInTheDocument();
		}
	});
});
