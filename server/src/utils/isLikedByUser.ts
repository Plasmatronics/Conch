import { PopulatedStoryDTO } from "@conch/shared";
import { Like } from "../models";

const sortByLikes = (storyDocs: PopulatedStoryDTO[]) => {
	return storyDocs.sort((a, b) => {
		const likesA = a.likes || 0;
		const likesB = b.likes || 0;
		return likesB - likesA;
	});
};

export const hasUserLikedStoryOrComments = async (
	docs: PopulatedStoryDTO | PopulatedStoryDTO[],
	userId?: string,
) => {
	const storyArr = Array.isArray(docs) ? docs : [docs];
	if (!userId) return storyArr;

	const ids: string[] = [];
	storyArr.forEach((story) => {
		if (story) {
			ids.push(story.id.toString());
			for (const comment of story.comments || []) {
				ids.push(comment.id.toString());
				for (const reply of (comment as any).replies || []) {
					ids.push(reply.id.toString());
				}
			}
		}
	});

	const likes = await Like.find({
		author: userId,
		target: { $in: ids },
	}).select("target");

	const likedSet = new Set(likes.map((like) => like.target.toString()));

	storyArr.forEach((story) => {
		if (story) {
			story.isLikedByUser = likedSet.has(story.id);
			for (const comment of story.comments || []) {
				(comment as any).isLikedByUser = likedSet.has(comment.id.toString());
				for (const reply of (comment as any).replies || []) {
					reply.isLikedByUser = likedSet.has(reply.id);
				}
			}
		}
	});

	return Array.isArray(docs) ? sortByLikes(storyArr) : storyArr[0];
};
