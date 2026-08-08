/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/placeholder-card/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/placeholder-card/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Card import points at the library's own card.
 */

import Card from "@/components/card";
import type { FC } from "react";

interface Props {
	title: string;
}

const PlaceholderCard: FC<Props> = ({ title }) => {
	return (
		<Card className="mt-4">
			<h2 className="p-24 text-2xl">{title}</h2>
		</Card>
	);
};

export default PlaceholderCard;
