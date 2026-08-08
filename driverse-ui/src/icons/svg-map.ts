/** @lib-native */

/**
 * GENERATED FILE — do not edit by hand. Run `node scripts/gen-icon-map.mjs` after changing src/icons/svg/.
 *
 * Replaces the apps' vite-plugin-svg-icons sprite: every SVG is compiled to a React component by
 * vite-plugin-svgr and looked up by its file name, so consumers need no build-time host plugin.
 */
import type { ComponentType, SVGProps } from "react";

import SvgIcAnalysis from "./svg/ic-analysis.svg?react";
import SvgIcBlog from "./svg/ic-blog.svg?react";
import SvgIcClear from "./svg/ic-clear.svg?react";
import SvgIcDashboard from "./svg/ic-dashboard.svg?react";
import SvgIcEdit from "./svg/ic-edit.svg?react";
import SvgIcLeftArrow from "./svg/ic-left-arrow.svg?react";
import SvgIcLocaleEnUS from "./svg/ic-locale_en_US.svg?react";
import SvgIcLocaleEsES from "./svg/ic-locale_es_ES.svg?react";
import SvgIcLocaleZhCN from "./svg/ic-locale_zh_CN.svg?react";
import SvgIcLogo from "./svg/ic-logo.svg?react";
import SvgIcManagement from "./svg/ic-management.svg?react";
import SvgIcMarkdown from "./svg/ic-markdown.svg?react";
import SvgIcMenu from "./svg/ic-menu.svg?react";
import SvgIcMenulevel from "./svg/ic-menulevel.svg?react";
import SvgIcResetPassword from "./svg/ic-reset-password.svg?react";
import SvgIcRightArrow from "./svg/ic-right-arrow.svg?react";
import SvgIcSearch from "./svg/ic-search.svg?react";
import SvgIcSetting from "./svg/ic-setting.svg?react";
import SvgIcSettingsExitFullscreen from "./svg/ic-settings-exit-fullscreen.svg?react";
import SvgIcSettingsFullscreen from "./svg/ic-settings-fullscreen.svg?react";
import SvgIcSettingsModeMoon from "./svg/ic-settings-mode-moon.svg?react";
import SvgIcSettingsModeSun from "./svg/ic-settings-mode-sun.svg?react";
import SvgIcUser from "./svg/ic-user.svg?react";
import SvgIcWorkbench from "./svg/ic-workbench.svg?react";
import SvgIcBlank from "./svg/ic_blank.svg?react";
import SvgIcChat from "./svg/ic_chat.svg?react";
import SvgIcDecline from "./svg/ic_decline.svg?react";
import SvgIcDelivery from "./svg/ic_delivery.svg?react";
import SvgIcDisabled from "./svg/ic_disabled.svg?react";
import SvgIcExternal from "./svg/ic_external.svg?react";
import SvgIcFavicon from "./svg/ic_favicon.svg?react";
import SvgIcFile from "./svg/ic_file.svg?react";
import SvgIcFileAi from "./svg/ic_file_ai.svg?react";
import SvgIcFileAudio from "./svg/ic_file_audio.svg?react";
import SvgIcFileExcel from "./svg/ic_file_excel.svg?react";
import SvgIcFileImg from "./svg/ic_file_img.svg?react";
import SvgIcFilePdf from "./svg/ic_file_pdf.svg?react";
import SvgIcFilePpt from "./svg/ic_file_ppt.svg?react";
import SvgIcFilePsd from "./svg/ic_file_psd.svg?react";
import SvgIcFileTxt from "./svg/ic_file_txt.svg?react";
import SvgIcFileVideo from "./svg/ic_file_video.svg?react";
import SvgIcFileWord from "./svg/ic_file_word.svg?react";
import SvgIcFileZip from "./svg/ic_file_zip.svg?react";
import SvgIcFolder from "./svg/ic_folder.svg?react";
import SvgIcLabel from "./svg/ic_label.svg?react";
import SvgIcMail from "./svg/ic_mail.svg?react";
import SvgIcOrder from "./svg/ic_order.svg?react";
import SvgIcRise from "./svg/ic_rise.svg?react";

export type SvgIconName = keyof typeof svgIconMap;

export const svgIconMap = {
	"ic-analysis": SvgIcAnalysis,
	"ic-blog": SvgIcBlog,
	"ic-clear": SvgIcClear,
	"ic-dashboard": SvgIcDashboard,
	"ic-edit": SvgIcEdit,
	"ic-left-arrow": SvgIcLeftArrow,
	"ic-locale_en_US": SvgIcLocaleEnUS,
	"ic-locale_es_ES": SvgIcLocaleEsES,
	"ic-locale_zh_CN": SvgIcLocaleZhCN,
	"ic-logo": SvgIcLogo,
	"ic-management": SvgIcManagement,
	"ic-markdown": SvgIcMarkdown,
	"ic-menu": SvgIcMenu,
	"ic-menulevel": SvgIcMenulevel,
	"ic-reset-password": SvgIcResetPassword,
	"ic-right-arrow": SvgIcRightArrow,
	"ic-search": SvgIcSearch,
	"ic-setting": SvgIcSetting,
	"ic-settings-exit-fullscreen": SvgIcSettingsExitFullscreen,
	"ic-settings-fullscreen": SvgIcSettingsFullscreen,
	"ic-settings-mode-moon": SvgIcSettingsModeMoon,
	"ic-settings-mode-sun": SvgIcSettingsModeSun,
	"ic-user": SvgIcUser,
	"ic-workbench": SvgIcWorkbench,
	ic_blank: SvgIcBlank,
	ic_chat: SvgIcChat,
	ic_decline: SvgIcDecline,
	ic_delivery: SvgIcDelivery,
	ic_disabled: SvgIcDisabled,
	ic_external: SvgIcExternal,
	ic_favicon: SvgIcFavicon,
	ic_file: SvgIcFile,
	ic_file_ai: SvgIcFileAi,
	ic_file_audio: SvgIcFileAudio,
	ic_file_excel: SvgIcFileExcel,
	ic_file_img: SvgIcFileImg,
	ic_file_pdf: SvgIcFilePdf,
	ic_file_ppt: SvgIcFilePpt,
	ic_file_psd: SvgIcFilePsd,
	ic_file_txt: SvgIcFileTxt,
	ic_file_video: SvgIcFileVideo,
	ic_file_word: SvgIcFileWord,
	ic_file_zip: SvgIcFileZip,
	ic_folder: SvgIcFolder,
	ic_label: SvgIcLabel,
	ic_mail: SvgIcMail,
	ic_order: SvgIcOrder,
	ic_rise: SvgIcRise,
} satisfies Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

/** All available icon names, sorted — handy for galleries and for validating name drift. */
export const svgIconNames = Object.keys(svgIconMap) as SvgIconName[];
