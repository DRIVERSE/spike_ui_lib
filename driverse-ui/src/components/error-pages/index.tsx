/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/pages/sys/error/PageError.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/pages/sys/error/PageError.tsx
 * @status decoupled
 * @notes Only B's PageError is a real error UI. A's PageError — and Page403/Page404/Page500 in *both*
 *        apps — are four-line keycloak redirect shims (`<Navigate to={authenticated ? HOMEPAGE : "/login"} />`)
 *        driven by `import.meta.env.VITE_APP_HOMEPAGE`. Those are auth routing, not components, so they
 *        are deliberately not extracted; see the wave report.
 *        B's version decoupled three ways: react-helmet-async's <Helmet> is dropped (document title is the
 *        app's concern and it would add a peer for one tag), the app router's `useRouter().push("/")`
 *        becomes an `onGoHome` callback, and `process.env.NODE_ENV === "development"` — which is not
 *        defined in a browser bundle unless the host injects it — becomes a `showDetails` prop.
 *        Renamed PageError -> ErrorFallback: it is a react-error-boundary fallback, not a route.
 */

import MotionContainer from "@/components/animate/motion-container";
import { varBounce } from "@/components/animate/variants/bounce";
import Fallback from "@/components/fallback";
import Iconify from "@/icons/iconify-icon";
import { Button } from "antd";
import { m } from "framer-motion";

type Props = {
	error?: Error;
	resetErrorBoundary?: () => void;
	/** Called before the reload when the user picks "Go Home". Apps route however they like. */
	onGoHome?: () => void;
	/** Shows the stack in a collapsed panel. The apps gated this on process.env.NODE_ENV. */
	showDetails?: boolean;
};

export default function ErrorFallback({ error, resetErrorBoundary, onGoHome, showDetails = false }: Props) {
	const handleRefresh = () => {
		resetErrorBoundary?.();
		window.location.reload();
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<div className="max-w-md w-full px-6">
				<MotionContainer className="flex flex-col items-center justify-center">
					<m.div variants={varBounce().in}>
						<Fallback
							title={<p className="text-center text-2xl font-medium !mb-2">Oops! Something went wrong</p>}
							description={
								error?.message ||
								"An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."
							}
							icon={<Iconify icon="material-symbols:error-outline" size={64} className="text-red-500 mb-4" />}
							hideIcon={false}
							action={
								<div className="flex flex-col sm:flex-row gap-3 mt-6">
									<Button type="primary" icon={<Iconify icon="mi:refresh" size={16} />} onClick={handleRefresh}>
										Try Again
									</Button>
									<Button
										icon={<Iconify icon="lucide:home" size={16} />}
										onClick={() => {
											onGoHome?.();
											setTimeout(handleRefresh, 100);
										}}
									>
										Go Home
									</Button>
								</div>
							}
							className="text-center"
						/>
					</m.div>

					{showDetails && error && (
						<m.div variants={varBounce().in} className="mt-8 w-full">
							<details className="bg-red-50 border border-red-200 rounded-lg p-4">
								<summary className="cursor-pointer font-medium text-red-800 mb-2">Error Details</summary>
								<pre className="text-sm text-red-700 overflow-auto whitespace-pre-wrap">
									{error.stack || error.message}
								</pre>
							</details>
						</m.div>
					)}
				</MotionContainer>
			</div>
		</div>
	);
}
