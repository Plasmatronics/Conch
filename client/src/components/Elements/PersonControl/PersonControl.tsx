import { IconProps, SegmentGroup } from "@chakra-ui/react";
import {
	TbInfoCircle,
	TbInfoCircleFilled,
	TbMapPin,
	TbMapPinFilled,
	TbPhoto,
	TbPhotoFilled,
} from "react-icons/tb";
import { PersonControlProps } from "./PersonControl.types";
import React from "react";
import { TransitionIcons } from "../../AnimationWrappers";
import { ValueChangeDetails } from "@zag-js/radio-group";
import { easeInOut } from "framer-motion";

const defaultBgColor = "gray.500";
const defaultSelectedBgColor = "white";

const defaultIconStyling = {
	size: "md" as IconProps["size"],
	color: defaultSelectedBgColor,
	initial: { scale: 1 },
	animate: {
		scale: 1,
	},
	exit: { scale: 1 },
};

const defaultActiveIconStyling = {
	...defaultIconStyling,
	color: defaultBgColor,
	animate: {
		scale: [1, 1.2, 1],
		transition: { duration: 0.25, ease: easeInOut },
	},
};

const ABOUT_VALUE_INDEX = 1;

export const PersonControl = ({
	inactiveStyles,
	activeStyles,
	uniformIconProps,
	mediaIconProps,
	aboutIconProps,
	mapIconProps,
	indicatorProps,
	...segmentGroupRootProps
}: PersonControlProps) => {
	const [curItemIndex, setCurItemIndex] = React.useState(ABOUT_VALUE_INDEX);

	const inactiveIconStyles = {
		...defaultIconStyling,
		...inactiveStyles,
		...uniformIconProps,
	};
	const activeIconStyles = {
		...defaultActiveIconStyling,
		...activeStyles,
		...uniformIconProps,
	};

	const items = [
		{
			value: "media",
			label: (
				<TransitionIcons
					icons={[
						{
							icon: TbPhoto,
							styles: { ...mediaIconProps, ...inactiveIconStyles },
						},
						{
							icon: TbPhotoFilled,
							styles: { ...mediaIconProps, ...activeIconStyles },
						},
					]}
					activeIconIndex={curItemIndex === 0 ? 1 : 0}
				/>
			),
		},
		{
			value: "about",
			label: (
				<TransitionIcons
					icons={[
						{
							icon: TbInfoCircle,
							styles: { ...aboutIconProps, ...inactiveIconStyles },
						},
						{
							icon: TbInfoCircleFilled,
							styles: { ...aboutIconProps, ...activeIconStyles },
						},
					]}
					activeIconIndex={curItemIndex === 1 ? 1 : 0}
				/>
			),
		},
		{
			value: "map",
			label: (
				<TransitionIcons
					icons={[
						{
							icon: TbMapPin,
							styles: { ...mapIconProps, ...inactiveIconStyles },
						},
						{
							icon: TbMapPinFilled,
							styles: { ...mapIconProps, ...activeIconStyles },
						},
					]}
					activeIconIndex={curItemIndex === 2 ? 1 : 0}
				/>
			),
		},
	];

	const handleValueChange = (e: ValueChangeDetails) => {
		const changeIndex = items.findIndex((val) => e.value === val.value);
		setCurItemIndex((prev) => {
			return changeIndex !== -1 ? changeIndex : prev;
		});
	};

	return (
		<SegmentGroup.Root
			bg={defaultBgColor}
			{...segmentGroupRootProps}
			value={items[curItemIndex].value}
			onValueChange={(e) => handleValueChange(e)}
		>
			<SegmentGroup.Indicator bg={defaultSelectedBgColor} {...indicatorProps} />
			<SegmentGroup.Items items={items} />
		</SegmentGroup.Root>
	);
};
