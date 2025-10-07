import { useAnimate } from "framer-motion";
import React from "react";
import { ConveyorBeltProps } from "./ConveyorBelt.types";

interface IUseConveyorBelt {
	speed: ConveyorBeltProps["speed"];
	direction: ConveyorBeltProps["direction"];
}

export const useConveyorBelt = ({ speed, direction }: IUseConveyorBelt) => {
	const [scope, animate] = useAnimate();
	const controlsRef = React.useRef<ReturnType<typeof animate>>();

	React.useEffect(() => {
		const from = direction === "right" ? "-50%" : "0%";
		const to = direction === "right" ? "0%" : "-50%";
		controlsRef.current = animate(
			scope.current,
			{ x: [from, to] },
			{ repeat: Infinity, duration: speed, ease: "linear" },
		);
		return () => controlsRef.current?.stop();
	}, [scope, animate, speed, direction]);

	const runBelt = () => controlsRef.current?.play();
	const pauseBelt = () => controlsRef.current?.pause();

	return { scope, runBelt, pauseBelt };
};
