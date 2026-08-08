import "@ant-design/v5-patch-for-react-19";
// Registers the offline Iconify collections so stories render without calling the Iconify API.
import "../src/icons/iconify-bundle";
import type { Preview } from "@storybook/react";
import { AntdAdapter } from "../src/theme/antd-adapter";
import { UIThemeProvider } from "../src/theme/theme-provider";
import { ThemeMode } from "../src/tokens/enum";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	globalTypes: {
		mode: {
			description: "Theme mode applied by UIThemeProvider",
			toolbar: {
				title: "Mode",
				icon: "sun",
				items: [
					{ value: ThemeMode.Light, title: "Light", icon: "sun" },
					{ value: ThemeMode.Dark, title: "Dark", icon: "moon" },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		mode: ThemeMode.Light,
	},
	decorators: [
		// The toolbar owns the mode, so the provider runs controlled here. Stories that need the
		// uncontrolled path render their own <UIThemeProvider defaultMode=... />.
		(Story, context) => (
			<UIThemeProvider mode={context.globals.mode as ThemeMode} adapters={[AntdAdapter]}>
				<Story />
			</UIThemeProvider>
		),
	],
};

export default preview;
