import { BaseMediaItem, MediaDimensions, MediaNode } from "./PostGallery.types";

export const MAX_MEDIA = 5;

/**
 * @param media src string
 * @returns Promise returning w and h for aspect ratio, defaults to square dimensions on error
 */
export const readMediaDimensions = async (
	file: BaseMediaItem,
): Promise<MediaNode> => {
	const fallback: MediaNode = { ...file, dimensions: { width: 1, height: 1 } };

	// SSR guard
	if (typeof window === "undefined" || typeof document === "undefined") {
		return fallback;
	}

	return new Promise((res, _) => {
		if (file.type === "image") {
			const img = new window.Image();
			img.onload = () =>
				res({
					dimensions: { width: img.naturalWidth, height: img.naturalHeight },
					...file,
				});
			img.onerror = () =>
				res({
					...fallback,
				});
			img.src = file.src;
		} else {
			const vid = document.createElement("video");
			vid.preload = "metadata";
			vid.addEventListener(
				"loadedmetadata",
				() => {
					return res({
						dimensions: { width: vid.videoWidth, height: vid.videoHeight },
						...file,
					});
				},
				{ once: true },
			);
			vid.addEventListener(
				"error",
				() => {
					return res({
						...fallback,
					});
				},
				{ once: true },
			);
			vid.src = file.src;
		}
	});
};

export const isVertical = ({ width, height }: MediaDimensions) => {
	const aspectRatio = width / height;
	return aspectRatio < 1;
};

export const getVerticalMedia = (media: MediaNode[]) => {
	return media.reduce((acc: MediaNode[], file) => {
		if (
			isVertical({
				width: file.dimensions.width,
				height: file.dimensions.height,
			})
		)
			acc.push(file);
		return acc;
	}, []);
};

/**
 * @param an array of objects containing img.width, img.height, img.src
 * @returns variable layout props obj for Chakra Grid component, depending on img aspect ratios
 */
export const getGridLayoutStyles = (media: MediaNode[]) => {
	const verticalImages = getVerticalMedia(media);

	const baseCols = { templateColumns: "minmax(0,1fr) minmax(0,1fr)" };
	const baseRows = { templateRows: "minmax(0,1fr) minmax(0,1fr)" };

	switch (media.length) {
		case 1:
			return {
				templateColumns: "minmax(0,1fr)",
				templateRows: "minmax(0,1fr)",
				templateAreas: `"media1"`,
			};
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
					templateRows: "repeat(3, minmax(0,1fr))",
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
					templateRows: "repeat(6, minmax(0,1fr))",
				};
			} else {
				return {
					...baseRows,
					templateColumns: "repeat(6, minmax(0,1fr))",
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
export const getVertMediaPrioArr = (media: MediaNode[]) => {
	const verticals = getVerticalMedia(media);
	const horizontals = media.filter((file) => !isVertical(file.dimensions));
	return [...verticals, ...horizontals];
};
