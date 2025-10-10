import { Box, Flex, Spinner } from "@chakra-ui/react";
import { PersonProps } from "./Person.types";
import { usePerson } from "./usePerson";
import { useFetchUserData } from "../../api";
import { BioCard, DataPost, DataConveyorBelt } from "../../components";
import React from "react";

export const Person = ({ personId, userId, controlledProps }: PersonProps) => {
	const [isConveyerBeltLoading, setIsConveyerBeltLoading] =
		React.useState(true);

	const { avatarAndMediaMapQuery, commentAuthorMap, personQuery } = usePerson({
		personId,
	});

	const { userQuery, avatarQuery } = useFetchUserData({
		userId,
		includeParamsValues: ["member"],
		enabled: !controlledProps?.user,
	});

	const controlledBaseLoadingState =
		avatarAndMediaMapQuery.isLoading ||
		personQuery.isLoading ||
		isConveyerBeltLoading;

	const isLoading = !controlledProps
		? controlledBaseLoadingState || userQuery.isLoading || avatarQuery.isLoading
		: controlledBaseLoadingState;

	const effectiveUserData = controlledProps
		? controlledProps.user
		: userQuery.data;
	const effectiveMediaMap = new Map([
		...(avatarAndMediaMapQuery.data || []),
		...(avatarQuery.data || []),
	]);

	const {
		keyPhoto = { fileKey: "" },
		keyPhotoCaption,
		name = "",
		relationToMember = "",
		dateOfBirth = new Date(),
		dateOfDeath,
		spouses,
		favThings,
		nicknames,
		occupations,
		formerResidences,
		dated,
		children,
		bestFriend,
		stories = [],
	} = personQuery.data || {};

	const firstStory = stories.at(0);

	const formerAddresses = formerResidences
		?.map((residence) => residence.address)
		.filter((address): address is string => !!address);

	return (
		<Box position="relative" bg="gray.100" p="1rem">
			{isLoading && <Spinner position="absolute" top="50%" left="50%" />}
			<Flex width="100%" gap="1rem" height="100vh" opacity={isLoading ? 0 : 1}>
				<Flex
					height="100%"
					direction="column"
					flex="1 1 0"
					gap="1rem"
					overflowY="auto"
					css={{
						"&::-webkit-scrollbar": { display: "none" },
						scrollbarWidth: "none",
						msOverflowStyle: "none",
					}}
				>
					{effectiveUserData && firstStory && (
						<DataPost
							storyId={firstStory.id}
							userId={userId}
							controlledProps={{
								loading: isLoading,
								user: effectiveUserData,
								story: firstStory,
								avatarAndMediaMap: effectiveMediaMap,
								commentAuthorMap,
							}}
							key={`${firstStory.title}-${0}`}
						/>
					)}
					<Box>
						<DataConveyorBelt
							spouses={spouses}
							dated={dated}
							childrenArr={children}
							bestFriend={bestFriend?.id}
							memberId={personQuery.data?.id || ""}
							stories={stories}
							onLoadingChange={setIsConveyerBeltLoading}
							speed={50}
						/>
					</Box>
					{personQuery.data?.stories.map((story, idx) => {
						if (effectiveUserData && idx !== 0) {
							return (
								<DataPost
									flex="1 1 0"
									storyId={story.id}
									userId={userId}
									controlledProps={{
										loading: isLoading,
										user: effectiveUserData,
										story: story,
										avatarAndMediaMap: effectiveMediaMap,
										commentAuthorMap,
									}}
									key={`${story.title}-${idx}`}
								/>
							);
						}
					})}
				</Flex>
				<BioCard
					flex="1 1 0"
					info={{
						keyPhotoSrc:
							effectiveMediaMap.get(keyPhoto.fileKey || "")?.downloadUrl || "",
						keyPhotoCaption,
						name,
						relationship: relationToMember,
						birthYear: new Date(dateOfBirth).getFullYear(),
						deathYear: dateOfDeath && new Date(dateOfDeath).getFullYear(),
						marriages: spouses,
						favThings,
						nicknames,
						occupations,
						formerResidences: formerAddresses,
					}}
				/>
			</Flex>
		</Box>
	);
};
