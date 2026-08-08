/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/total-card/index.tsx
 * @status adopted-B
 * @notes Business-only component; Autocredit has no equivalent. Lifted with one substitution: the two
 *        react-icons/fa6 arrows (FaArrowUpLong / FaArrowDownLong) are rendered through the library's
 *        <Iconify> instead, so the library does not take a react-icons dependency for two glyphs. The
 *        replacements are solar:arrow-up-linear / solar:arrow-down-linear at the same 14px and colors.
 *        Also drops the `antd/lib` deep import for Spin in favour of the package root.
 */

import Iconify from "@/icons/iconify-icon";
import { Card, Spin } from "antd";
import { Fragment, type ReactNode } from "react";

type Props = {
	title: string;
	increase?: boolean;
	percent?: string;
	icon?: ReactNode;
	count: string | number;
	chartData?: number[];
	showIncrease?: boolean;
	loading?: boolean;
	description?: string;
};

export default function TotalCard({
	title,
	increase,
	icon,
	count,
	percent,
	showIncrease = true,
	loading,
	description,
}: Props) {
	return (
		<Card>
			<div className="flex justify-center w-full">
				<div className="flex-grow flex flex-col h-20 justify-between">
					<h6 className="text-base font-medium">{title}</h6>

					<div className="flex flex-row">
						{loading ? (
							<Spin />
						) : (
							<Fragment>
								<h3 className="text-2xl font-semibold ">{count}</h3>
								{showIncrease && (
									<span className="text-base flex items-center font-normal pl-3">
										{increase ? (
											<Iconify icon="solar:arrow-up-linear" size={14} color="rgb(34, 197, 94)" />
										) : (
											<Iconify icon="solar:arrow-down-linear" size={14} color="rgb(255, 86, 48)" />
										)}
										{percent}
									</span>
								)}
							</Fragment>
						)}
					</div>
					{description && <p className="text-sm ">{description}</p>}
				</div>
				{icon}
			</div>
		</Card>
	);
}
