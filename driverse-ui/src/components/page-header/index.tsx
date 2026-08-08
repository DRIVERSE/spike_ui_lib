/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/page-header/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/page-header/index.tsx
 * @status merged
 * @notes B's prop surface on A's body. B added `goBack`/`fallbackRoute`/`showBackBtn`, a ReactNode
 *        `description` (A typed it `string`), the sticky wrapper and the routerLink-dependent card
 *        styling; A kept the cleaner markup and a `text-2xl` title. Taken: all of B's props and its
 *        sticky/card behaviour, A's `text-2xl` title.
 *        Deleted: B's 20-line commented-out goBack block, which referenced a `handleBack` that does not
 *        exist in the file — it would not have compiled if uncommented.
 *        Decoupled: both versions wrapped the back button in react-router's <Link to={routerLink}>. The
 *        library takes an `onBack` callback instead and renders a button, so it works under any router
 *        (or none). `routerLink` is kept purely as the "this is a detail page" styling flag it also was,
 *        and as the href when the app wants a real link — pass `backHref`.
 *        @ant-design/icons' LeftOutlined is rendered through <Iconify> to avoid another icon peer.
 */

import Iconify from "@/icons/iconify-icon";
import { Card } from "antd";
import type { FC, ReactNode } from "react";

type Props = {
	title: ReactNode;
	description?: ReactNode;
	action?: ReactNode;
	/** Marks the header as a detail-page header: switches the card to the bordered white treatment. */
	routerLink?: string;
	icon?: ReactNode;
	avatarText?: string;
	/** Rendered as a link when set; otherwise the back control is a button driven by `onBack`. */
	backHref?: string;
	onBack?: () => void;
	goBack?: boolean;
	fallbackRoute?: string;
	showBackBtn?: boolean;
	sticky?: boolean;
};

const BACK_CONTROL_CLASS =
	"w-9 h-9 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 cursor-pointer transition-colors";

const PageHeader: FC<Props> = ({
	title,
	description,
	action,
	routerLink,
	icon,
	backHref,
	onBack,
	showBackBtn = true,
	sticky = true,
}) => {
	const showBack = showBackBtn && (!!onBack || !!backHref);

	const backControl = backHref ? (
		<a href={backHref} style={{ background: "#FFF" }} className={BACK_CONTROL_CLASS} aria-label="Go back">
			<Iconify icon="solar:alt-arrow-left-outline" size={16} className="text-gray-600" />
		</a>
	) : (
		<button
			type="button"
			onClick={onBack}
			style={{ background: "#FFF" }}
			className={BACK_CONTROL_CLASS}
			aria-label="Go back"
		>
			<Iconify icon="solar:alt-arrow-left-outline" size={16} className="text-gray-600" />
		</button>
	);

	return (
		<div className={sticky ? "sticky z-[4] top-0 w-full" : "mb-3 w-full"}>
			<Card
				style={{
					background: routerLink ? "#FFF" : "#f8f8f8",
					border: routerLink ? "1px solid #eee" : "none",
				}}
				styles={{ body: { padding: routerLink ? "16px" : "10px" } }}
			>
				<div className="flex justify-between items-center gap-4 md:flex-row flex-col">
					<div className="flex-1">
						<div className="flex items-center gap-4">
							{showBack && backControl}

							<div className="flex items-center gap-2">
								{icon && (
									<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">{icon}</div>
								)}
								<div className="flex flex-col gap-1">
									<h1 className="text-2xl font-medium text-gray-800 leading-tight capitalize">{title}</h1>
									{description && <p className="text-lg text-gray-700 leading-relaxed m-0">{description}</p>}
								</div>
							</div>
						</div>
					</div>
					{action && <div className="flex-shrink-0 flex items-center gap-2 md:justify-start justify-end">{action}</div>}
				</div>
			</Card>
		</div>
	);
};

export default PageHeader;

export { Header } from "./header";
