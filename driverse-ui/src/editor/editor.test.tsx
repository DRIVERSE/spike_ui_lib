import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Editor from "./index";

describe("Editor", () => {
	it("mounts react-quill-new under React 19 without findDOMNode", () => {
		const { container } = render(<Editor id="test-quill" value="<p>hello</p>" onChange={() => {}} />);
		expect(container.querySelector(".ql-container")).not.toBeNull();
		expect(container.querySelector(".ql-editor")?.innerHTML).toContain("hello");
	});

	it("renders a toolbar bound to the editor by id, trimmed in sample mode", () => {
		const { container, rerender } = render(<Editor id="full-quill" />);
		const full = container.querySelectorAll("#full-quill .ql-formats").length;
		expect(full).toBeGreaterThan(0);
		expect(container.querySelector("#full-quill select.ql-header")).not.toBeNull();

		rerender(<Editor id="full-quill" sample />);
		expect(container.querySelectorAll("#full-quill .ql-formats").length).toBeLessThan(full);
	});

	it("keeps the placeholder both apps shipped", () => {
		const { container } = render(<Editor id="ph-quill" />);
		expect(container.querySelector(".ql-editor")).toHaveAttribute("data-placeholder", "Write something awesome...");
	});
});
