/** @lib-native */

/**
 * The two app couplings every insight chart shared, turned into props.
 *
 * The app versions each called `useTranslation()` for their labels and, in two cases, `useNavigate()` to
 * deep-link into a compliance tab. Both would have made i18next and react-router hard peers of the chart
 * package. They are optional props instead: the charts render standalone with English defaults, and an
 * app passes `t={t}` and `onNavigate={navigate}` to get its original behaviour back verbatim.
 */
export type InsightChartCommonProps = {
	/** i18next-compatible translator. Defaults to echoing the last segment of the key. */
	t?: (key: string) => string;
	/** Called with the same paths the app version passed to react-router's `navigate`. */
	onNavigate?: (path: string) => void;
};

/**
 * Stands in for i18next when no translator is supplied: turns `sys.dashboard.charts.x.compliant` into
 * "compliant", which keeps the charts readable in Storybook and tests without shipping a bundle.
 */
export const defaultT = (key: string): string => key.split(".").pop() ?? key;
