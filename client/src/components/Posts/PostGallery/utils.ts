import { IMediaDimensions, MediaTypes } from "./PostGallery.types";

/**
 * @param media src string
 * @returns Promise returning w and h for aspect ratio, defaults to square dimensions on error
 */
export const readMediaDimensions = async (
	type: MediaTypes,
	src: string,
): Promise<IMediaDimensions> => {
	return new Promise((res, rej) => {
		if (type === "Image") {
			const img = new window.Image();
			img.onload = () =>
				res({
					width: img.naturalWidth,
					height: img.naturalHeight,
					src,
					type,
				});
			img.onerror = () => res({ width: 1, height: 1, src: img.src, type });
			img.src = src;
		} else {
			const vid = document.createElement("video");
			vid.preload = "metadata";
			vid.addEventListener(
				"loadedmetadata",
				() => {
					return res({
						width: vid.videoWidth,
						height: vid.videoHeight,
						src,
						type,
					});
				},
				{ once: true },
			);
			vid.addEventListener(
				"error",
				() => {
					return res({ width: 1, height: 1, src, type });
				},
				{ once: true },
			);
			vid.src = src;
		}
	});
};

export const isVertical = ({
	width,
	height,
}: Omit<IMediaDimensions, "src" | "type">) => {
	const aspectRatio = width / height;
	return aspectRatio < 1;
};

export const getVerticalMedia = (mediaDimensions: IMediaDimensions[]) => {
	return mediaDimensions.reduce((acc: IMediaDimensions[], media) => {
		if (isVertical({ width: media.width, height: media.height }))
			acc.push(media);
		return acc;
	}, []);
};

/**
 * @param an array of objects containing img.width, img.height, img.src
 * @returns variable layout props obj for Chakra Grid component, depending on img aspect ratios
 */
export const getGridLayoutStyles = (mediaDimensions: IMediaDimensions[]) => {
	const verticalImages = getVerticalMedia(mediaDimensions);

	const baseCols = { templateColumns: "1fr 1fr" };
	const baseRows = { templateRows: "1fr 1fr" };

	switch (mediaDimensions.length) {
		case 1:
			return {};
		case 2:
			return verticalImages.length > 0
				? {
						...baseCols,
						templateAreas: `"media1 media2"
								"media1 media2"`,
					}
				: {
						...baseRows,
						templateAreas: `"media1 media1"
								"media2 media2"`,
					};
		case 3: {
			if (verticalImages.length > 0) {
				return {
					templateAreas: `"media1 media2"
								"media1 media3"`,
					...baseRows,
					...baseCols,
				};
			} else {
				return {
					templateAreas: `"media1 media1"
								"media2 media3"`,
					...baseRows,
					...baseCols,
				};
			}
		}
		case 4: {
			if (verticalImages.length > 0) {
				return {
					templateAreas: `"media1 media2"
								"media1 media3"
								"media1 media4"`,
					...baseCols,
					templateRows: "repeat(3, 1fr)",
				};
			} else {
				return {
					templateAreas: `"media1 media2"
								"media3 media4"`,
					...baseCols,
					...baseRows,
				};
			}
		}
		default: {
			if (verticalImages.length > 0) {
				return {
					templateAreas: `"media1 media3"
								"media1 media3"
								"media1 media4"
								"media2 media4"
								"media2 media5"
								"media2 media5"`,
					...baseCols,
					templateRows: "repeat(6, 1fr)",
				};
			} else {
				return {
					...baseRows,
					templateColumns: "repeat(6, 1fr)",
					templateAreas: `"media1 media1 media1 media2 media2 media2"
								"media3 media3 media4 media4 media5 media5"`,
				};
			}
		}
	}
};

/**
 * @param an array of objects containing media.width, media.height, media.src
 * @returns an array of objects containing media.width, media.height, media.src, but with vert media coming before horz media
 */
export const getVertMediaPrioArr = (mediaDimensions: IMediaDimensions[]) => {
	const verticals = getVerticalMedia(mediaDimensions);
	const horizontals = mediaDimensions.filter((img) => !isVertical(img));
	return [...verticals, ...horizontals];
};
