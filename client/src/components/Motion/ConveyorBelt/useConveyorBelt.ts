import { useAnimate } from "framer-motion";
import React from "react";
import { ConveyorBeltProps } from "./ConveyorBelt.types";

interface IUseConveyerBelt {
	speed: ConveyorBeltProps["speed"];
	direction: ConveyorBeltProps["direction"];
	gap: ConveyorBeltProps["gap"];
}

export const useConveyorBelt = ({
	speed,
	direction,
	gap,
}: IUseConveyerBelt) => {
	const controlsRef = React.useRef<ReturnType<typeof animate>>();
	const [scope, animate] = useAnimate();

	React.useEffect(() => {
		const animationStartingPoint =
			direction === "right" ? `-100vw - ${gap}` : `100vw + ${gap}`;

		controlsRef.current = animate(
			scope.current,
			{ x: [`calc(${animationStartingPoint})`, "0vw"] },
			{ repeat: Infinity, repeatType: "loop", duration: speed, ease: "linear" },
		);
		return () => controlsRef.current?.stop();
	}, [scope, animate, speed, gap]);

	const runBelt = () => controlsRef.current?.play();
	const pauseBelt = () => controlsRef.current?.pause();

	return { scope, runBelt, pauseBelt };
};
