import React from "react";
import { DataConveyorBeltProps } from "./DataConveyorBelt.types";
import { HydratedFamilyTreeMemberDTO } from "@conch/shared";
import { useDataConveyorBelt } from "./useDataConveyorBelt";
import { ConveyorBelt } from "../ConveyorBelt";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Flex,
	Text,
} from "@chakra-ui/react";
import { HoverCard } from "../../Cards";

const NUM_APPEARANCES_TO_BE_SIGNIFICANT = 2;

export const DataConveyorBelt = ({
	spouses,
	dated,
	childrenArr,
	bestFriend,
	stories,
	memberId,
	onLoadingChange,
	...conveyorBeltProps
}: DataConveyorBeltProps) => {
	const storyAppearancesMap = new Map<
		HydratedFamilyTreeMemberDTO["id"],
		number
	>();
	for (const story of stories || []) {
		for (const person of story.involves || []) {
			if (person === memberId) return;
			const numPrevAppearances = storyAppearancesMap.get(person);

			storyAppearancesMap.set(
				person,
				numPrevAppearances ? numPrevAppearances + 1 : 1,
			);
		}
	}
	const peopleInStories = Array.from(storyAppearancesMap.keys()).filter(
		(person) => {
			return (
				storyAppearancesMap.get(person)! >= NUM_APPEARANCES_TO_BE_SIGNIFICANT
			);
		},
	);

	const { conveyorBeltQuery, avatarQuery } = useDataConveyorBelt({
		spouses,
		dated,
		childrenArr,
		others: bestFriend
			? [bestFriend, ...peopleInStories]
			: [...peopleInStories],
	});
	const dataToDisplay = !!spouses && !!dated && !!childrenArr && !!bestFriend;
	const isLoading = dataToDisplay
		? conveyorBeltQuery.isLoading || avatarQuery.isLoading
		: false;

	React.useEffect(() => {
		onLoadingChange?.(isLoading);
	}, [isLoading, onLoadingChange]);

	return (
		<ConveyorBelt {...conveyorBeltProps}>
			{conveyorBeltQuery?.data?.map((person, idx) => {
				const img = avatarQuery.data?.get(person.keyPhoto.fileKey)?.downloadUrl;

				return (
					<HoverCard
						avatar={img}
						name={person.name}
						key={`${person.name}-${idx}`}
						relationship={person.relationToRootMember}
						numMemories={person.storiesCount}
						trigger={
							<Flex direction="column">
								<Avatar.Root>
									<AvatarFallback name={person.name} />
									<AvatarImage src={img} />
								</Avatar.Root>
								<Text>{person.relationToPerson}</Text>
							</Flex>
						}
					/>
				);
			})}
		</ConveyorBelt>
	);
};
