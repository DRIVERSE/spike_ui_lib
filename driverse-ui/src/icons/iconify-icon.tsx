/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/icon/iconify-icon.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/icon/iconify-icon.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim, including `disableCache("local")` and the
 *        styled-components wrapper. Icon data resolution is unchanged — see `iconify-bundle.ts` for the
 *        offline collection the library registers so Storybook and tests never hit the Iconify API.
 */

import { Icon, type IconProps, disableCache } from "@iconify/react";
import styled from "styled-components";

interface Props extends IconProps {
	size?: IconProps["width"];
}

export default function Iconify({ icon, size = "1em", className = "", ...other }: Props) {
	return (
		<StyledIconify className="anticon">
			<Icon icon={icon} width={size} height={size} className={`m-auto ${className}`} {...other} />
		</StyledIconify>
	);
}

disableCache("local");

const StyledIconify = styled.div`
  display: inline-flex;
  vertical-align: middle;
  svg {
    display: inline-block;
  }
`;
