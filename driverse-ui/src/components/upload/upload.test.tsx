import { UIThemeProvider } from "@/theme/theme-provider";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Upload } from "./upload";
import { UploadAvatar } from "./upload-avatar";
import { UploadBox } from "./upload-box";
import { beforeAvatarUpload, getFileFormat, getFileThumb } from "./utils";

afterEach(() => vi.restoreAllMocks());

// UploadIllustration reads themeVars through useTheme, so these render inside the provider.
const withTheme = (ui: ReactNode) => render(<UIThemeProvider>{ui}</UIThemeProvider>);

describe("upload utils", () => {
	it("maps extensions onto formats", () => {
		expect(getFileFormat("report.pdf")).toBe("pdf");
		expect(getFileFormat("sheet.xlsx")).toBe("excel");
		// Upper-case extensions now resolve too; both apps fell through to the generic icon here.
		expect(getFileFormat("photo.PNG")).toBe("img");
		expect(getFileFormat("clip.mp4")).toBe("video");
		expect(getFileFormat("archive.zip")).toBe("zip");
	});

	it("maps formats onto the bundled ic_file_* icons", () => {
		expect(getFileThumb("report.pdf")).toBe("ic_file_pdf");
		expect(getFileThumb("sheet.xlsx")).toBe("ic_file_excel");
		expect(getFileThumb("mystery.qqq")).toBe("ic_file");
	});

	it("beforeAvatarUpload rejects non-images and oversized files", () => {
		const jpeg = new File(["x"], "a.jpg", { type: "image/jpeg" });
		Object.defineProperty(jpeg, "size", { value: 1024 });
		expect(beforeAvatarUpload(jpeg as never)).toBe(true);

		const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
		Object.defineProperty(pdf, "size", { value: 1024 });
		expect(beforeAvatarUpload(pdf as never)).toBe(false);

		const huge = new File(["x"], "a.png", { type: "image/png" });
		Object.defineProperty(huge, "size", { value: 5 * 1024 * 1024 });
		expect(beforeAvatarUpload(huge as never)).toBe(false);
	});
});

describe("upload components", () => {
	it("Upload renders the dragger with its illustration and copy", () => {
		const { container } = withTheme(<Upload />);
		expect(screen.getByText("Drop or Select file")).toBeInTheDocument();
		expect(container.querySelector(".ant-upload-drag")).not.toBeNull();
		expect(screen.getByLabelText("Upload Illustration")).toBeInTheDocument();
	});

	it("UploadBox renders the default placeholder, and a custom one when given", () => {
		const { container, rerender } = render(<UploadBox />);
		expect(container.querySelector(".ant-upload")).not.toBeNull();

		rerender(<UploadBox placeholder={<span>drop here</span>} />);
		expect(screen.getByText("drop here")).toBeInTheDocument();
	});

	it("UploadAvatar shows the photo placeholder and default helper text", () => {
		render(<UploadAvatar />);
		expect(screen.getByText("Upload Photo")).toBeInTheDocument();
		expect(screen.getByText(/Allowed \*.jpeg/)).toBeInTheDocument();
	});

	it("UploadAvatar accepts custom helper text", () => {
		render(<UploadAvatar helperText="Square images only" />);
		expect(screen.getByText("Square images only")).toBeInTheDocument();
	});
});
