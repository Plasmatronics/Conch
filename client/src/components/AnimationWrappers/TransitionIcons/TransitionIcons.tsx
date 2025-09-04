import { AnimatePresence, motion, easeInOut } from "framer-motion";
import { TransitionIconProps } from "./TransitionIcons.types";
import { Icon } from "@chakra-ui/react";

const MotionIcon = motion.create(Icon);

const defaultMotion = {
	initial: { scale: 1 },
	animate: {
		scale: [1, 1.2, 1],
		transition: { duration: 0.25, ease: easeInOut },
	},
	exit: { scale: 1 },
};

export const TransitionIcons = ({
	icons,
	activeIconIndex,
	uniformIconStyles,
	unanimated,
	...animatePresenceProps
}: TransitionIconProps) => {
	const curIndex = Math.max(Math.min(activeIconIndex, icons.length - 1), 0);
	const curIcon = icons[curIndex];

	return (
		<AnimatePresence mode="wait" initial={false} {...animatePresenceProps}>
			<MotionIcon
				as={curIcon.icon}
				key={`transition-icon-${curIndex}`}
				{...(!unanimated ? defaultMotion : {})}
				{...uniformIconStyles}
				{...curIcon.styles}
			/>
		</AnimatePresence>
	);
};
