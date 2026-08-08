/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/FeatureCard.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/FeatureCard.tsx
 * @status decoupled
 * @notes Byte-identical in both apps except for one substitution: `colors.driverse_primary` (from
 *        `@/theme/colors`, `#5F8BFA`) is now `var(--brand-primary)`, the library's token for that same
 *        color — same pattern fleet-tracking-map's `STATUS_COLOR` and page-header use to avoid depending
 *        on either app's theme file.
 */

import { cn } from "@/utils";
import { Card, Skeleton } from "antd";
import type React from "react";

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string | number;
	description: string;
	className?: string;
	iconBg?: string;
	iconColor?: string;
	isLoading?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
	icon,
	title,
	description,
	iconBg = "#eff3fe",
	iconColor,
	className,
	isLoading = false,
}) => {
	return (
		<Card
			className={className}
			styles={{
				body: {
					display: "flex",
					gap: "12px",
				},
			}}
		>
			{isLoading ? (
				<Skeleton active paragraph={{ rows: 2 }} />
			) : (
				<>
					<div
						style={{
							fontSize: "20px",
							backgroundColor: iconBg,
							color: iconColor || "var(--brand-primary)",
						}}
						className={cn("flex items-center justify-center w-12 h-12 p-2 rounded-md flex-shrink-0")}
					>
						{icon}
					</div>
					<div className="flex flex-col gap-1">
						<h3 style={{ fontSize: "16px", fontWeight: 600 }}>{title}</h3>
						<p
							style={{
								margin: 0,
								fontSize: "14px",
								lineHeight: "1.5",
							}}
						>
							{description}
						</p>
					</div>
				</>
			)}
		</Card>
	);
};

export default FeatureCard;
