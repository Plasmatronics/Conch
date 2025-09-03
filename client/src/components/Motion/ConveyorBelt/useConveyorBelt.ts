import { useAnimate } from "framer-motion";
import { useEffect } from "react";

export const useConveyorBelt = ({ speed }: { speed: number }) => {
	const [scope, animate] = useAnimate();

	useEffect(() => {
		animate(
			scope.current,
			{
				x: ["-100vw", "0vw"],
			},
			{
				repeat: Infinity,
				repeatType: "loop",
				duration: speed,
				ease: "linear",
			},
		);
	}, [scope, animate, speed]);

	return { scope };
};
