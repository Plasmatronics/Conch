import React from "react";
import { IconButton, Grid, Box, BoxProps } from "@chakra-ui/react";
import { TbArrowUpRight, TbArrowDownLeft } from "react-icons/tb";
import { FullscreenButtonProps } from "./FullscreenButton.types";

export const FullscreenButton = ({
	isExpanded,
	setIsExpanded,
	strokeWidth,
	ref,
	onClick,
	onToggle,
	...iconButtonProps
}: FullscreenButtonProps) => {
	const topRot = isExpanded ? "180deg" : "0deg";
	const bottomRot = isExpanded ? "-180deg" : "0deg";
	const topArrowAnimation: BoxProps = isExpanded
		? {
				_groupHover: { transform: `translate(-2px, 2px) rotate(${topRot})` },
				_groupActive: { transform: `translate(0, 0) rotate(${topRot})` },
			}
		: {
				_groupHover: { transform: `translate(2px, -2px) rotate(${topRot})` },
				_groupActive: { transform: `translate(0, 0) rotate(${topRot})` },
			};

	const bottomArrowAnimation: BoxProps = isExpanded
		? {
				_groupHover: { transform: `translate(2px, -2px) rotate(${bottomRot})` },
				_groupActive: { transform: `translate(0, 0) rotate(${bottomRot})` },
			}
		: {
				_groupHover: { transform: `translate(-2px, 2px) rotate(${bottomRot})` },
				_groupActive: {
					transform: `translate(0, 0) rotate(${bottomRot})`,
				},
			};

	function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
		onClick?.(e);
		if (!e.isDefaultPrevented()) {
			setIsExpanded((prev) => {
				const next = !prev;
				onToggle?.(next);
				return next;
			});
		}
	}

	return (
		<IconButton
			color="gray.300"
			_hover={{
				color: "gray.100",
			}}
			bg="transparent"
			size="2xs"
			{...iconButtonProps}
			aria-label={isExpanded ? "Shrink Content" : "Expand Content"}
			className="group"
			ref={ref}
			onClick={handleClick}
		>
			<Grid
				w="100%"
				h="100%"
				templateColumns="1fr 1fr"
				templateRows="1fr 1fr"
				alignItems="center"
				justifyContent="center"
			>
				<Box
					width="100%"
					height="100%"
					gridColumn="2"
					gridRow="1"
					placeSelf="end start"
					transition="transform 150ms"
					transform={`rotate(${topRot})`}
					{...topArrowAnimation}
				>
					<TbArrowUpRight strokeWidth={strokeWidth || 3} />
				</Box>

				<Box
					width="100%"
					height="100%"
					gridColumn="1"
					gridRow="2"
					placeSelf="start end"
					transition="transform 150ms"
					transform={`rotate(${bottomRot})`}
					{...bottomArrowAnimation}
				>
					<TbArrowDownLeft strokeWidth={strokeWidth || 3} />
				</Box>
			</Grid>
		</IconButton>
	);
};
