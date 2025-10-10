import { PopulatedStoryDTO, Relations } from "@conch/shared";

export const attachRelationsToStoriesAndComments = (
	stories: PopulatedStoryDTO[],
	relationsObj: Relations,
) => {
	return stories.forEach((story) => {
		if (story.author && story.author.id) {
			story.author.relationToMember =
				relationsObj[story.author.id] || undefined;
		}

		story.comments?.forEach((commentThread) => {
			if (commentThread.author && commentThread.author.id) {
				commentThread.author.relationToMember =
					relationsObj[commentThread.author.id] || undefined;
			}

			commentThread.replies?.forEach((reply) => {
				if (reply.author && reply.author.id) {
					reply.author.relationToMember =
						relationsObj[reply.author.id] || undefined;
				}
			});
		});
	});
};
