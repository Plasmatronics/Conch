import React from "react";
import { MediaItem, MediaNode } from "./PostGallery";
import {
	getGridLayoutStyles,
	getVertMediaPrioArr,
	MAX_MEDIA,
	readMediaDimensions,
} from "./PostGallery/utils";

export const useGalleryMedia = (media: MediaItem[]) => {
	const [mediaNodeWithDimensions, setMediaNodeWithDimensions] = React.useState<
		Array<MediaNode>
	>([]);
	const cacheRef = React.useRef<Map<string, Promise<MediaNode>>>(new Map());
	const firstFiveMedia = React.useMemo(
		() => media.slice(0, MAX_MEDIA),
		[media],
	);

	//Promise.all is fine bc readMediaDimensions doesnt rej, just defaults to 1x1 dims
	React.useEffect(() => {
		Promise.all(
			firstFiveMedia.map((file) => {
				const cachedFile = cacheRef.current.get(file.src);
				if (cachedFile) return cachedFile;

				const fileWithDimensions = readMediaDimensions({
					...file,
					type: file.type || "Image",
				});
				cacheRef.current.set(file.src, fileWithDimensions);
				return fileWithDimensions;
			}),
		).then((mediaWithDimensions) => {
			setMediaNodeWithDimensions(mediaWithDimensions);
		});
	}, [firstFiveMedia]);

	const gridLayoutStyles = getGridLayoutStyles(mediaNodeWithDimensions);
	const verticalMediaPrioArr = getVertMediaPrioArr(mediaNodeWithDimensions);
	const isGalleryClamped = media.length > firstFiveMedia.length;

	return {
		mediaNodeWithDimensions,
		setMediaNodeWithDimensions,
		gridLayoutStyles,
		verticalMediaPrioArr,
		isGalleryClamped,
	};
};
