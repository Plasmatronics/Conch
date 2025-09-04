import type { Meta } from "@storybook/react-vite";

import { TransitionIcons } from "./TransitionIcons";
import {
	TbAlarm,
	TbAlarmFilled,
	TbBrand4Chan,
	TbBrandDiscord,
	TbBrandFacebook,
	TbBrandInstagram,
	TbBrandReddit,
} from "react-icons/tb";
import { useState } from "react";
import { Button, Flex } from "@chakra-ui/react";

export default {
	title: "AnimationWrapper/TransitionIcons",
	component: TransitionIcons,
} satisfies Meta<typeof TransitionIcons>;

export const ClockOutlineToFilled = () => {
	const [activeIconIndex, setActiveIconIndex] = useState(0);

	const handleClick = () => setActiveIconIndex((prev) => (prev === 0 ? 1 : 0));

	return (
		<Flex direction="column" align="center" justify="center">
			<TransitionIcons
				icons={[
					{
						icon: TbAlarm,
					},
					{
						icon: TbAlarmFilled,
					},
				]}
				activeIconIndex={activeIconIndex}
			/>
			<Button onClick={handleClick}>
				{activeIconIndex ? "filled" : "stroke"}
			</Button>
		</Flex>
	);
};

export const SocialMediaIcons = () => {
	const [activeIconIndex, setActiveIconIndex] = useState(0);
	const icons = [
		{
			icon: TbBrandFacebook,
		},
		{
			icon: TbBrand4Chan,
		},
		{
			icon: TbBrandDiscord,
		},
		{
			icon: TbBrandInstagram,
		},
		{
			icon: TbBrandReddit,
		},
	];

	const handleClick = () =>
		setActiveIconIndex((prev) => (prev === icons.length - 1 ? 0 : ++prev));

	return (
		<Flex direction="column" align="center" justify="center">
			<TransitionIcons icons={icons} activeIconIndex={activeIconIndex} />
			<Button onClick={handleClick}>Next</Button>
		</Flex>
	);
};

export const CustomAnimations = () => {
	const [activeIconIndex, setActiveIconIndex] = useState(0);

	const handleClick = () => setActiveIconIndex((prev) => (prev === 0 ? 1 : 0));

	return (
		<Flex direction="column" align="center" justify="center">
			<TransitionIcons
				icons={[
					{
						icon: TbAlarm,
						styles: {
							initial: { rotate: 0 },
							animate: {
								rotate: [null, 20, -20, 0],
								transition: { duration: 0.25 },
							},
							exit: { rotate: 0 },
						},
					},
					{
						icon: TbAlarmFilled,
						styles: {
							initial: { scale: 1 },
							animate: {
								scale: [null, 1.75, 1],
								transition: { duration: 0.25 },
							},
							exit: { scale: 1 },
						},
					},
				]}
				uniformIconStyles={{ color: "red" }}
				activeIconIndex={activeIconIndex}
			/>
			<Button onClick={handleClick}>
				{activeIconIndex ? "filled" : "stroke"}
			</Button>
		</Flex>
	);
};
