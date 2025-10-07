import { AspectRatio, Card, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { BioCardProps } from "./BioCard.types";

const renderDetail = (label: string, value: string[] | string) => {
	const isValueArr = Array.isArray(value);

	return (
		<>
			<Text fontSize="sm" fontWeight="medium">
				{label}
			</Text>
			<Text fontSize="sm">
				{!isValueArr
					? value
					: value.map((val, idx) => (
							<Text key={`val-${idx}`} as="span">
								{val}
								{idx !== value.length - 1 && (
									<Text fontWeight="bold" as="span">
										{` · `}
									</Text>
								)}
							</Text>
						))}
			</Text>
		</>
	);
};

export const BioCard = ({
	info,
	cardBodyProps,
	...cardRootProps
}: BioCardProps) => {
	const {
		keyPhotoSrc,
		keyPhotoCaption,
		name,
		relationship,
		birthYear,
		deathYear,
		marriages,
		favThings,
		nicknames,
		occupations,
		formerResidences,
	} = info;

	const favThingsKeys = favThings && Object.keys(favThings);
	const randomFavThingKey =
		favThingsKeys &&
		favThingsKeys[Math.floor(Math.random() * favThingsKeys.length)];
	const formattedRandomFavThingKey =
		randomFavThingKey &&
		randomFavThingKey?.charAt(0)?.toUpperCase() + randomFavThingKey?.slice(1);

	return (
		<Card.Root width="100%" height="100%" maxW="20rem" {...cardRootProps}>
			<Card.Body p="0.75rem" {...cardBodyProps} width="100%" height="100%">
				<Flex width="100%" height="100%" direction="column" gap="0.25rem">
					<AspectRatio width="100%" ratio={1 / 1.25}>
						<Image
							width="100%"
							src={keyPhotoSrc}
							alt={name}
							borderRadius="md"
						/>
					</AspectRatio>
					<Text fontSize="xs" alignSelf="center">
						{keyPhotoCaption}
					</Text>
					<Grid templateColumns="1fr 2fr" gap="0.25rem">
						{renderDetail("Name", name)}
						{renderDetail(
							"Lifespan",
							deathYear
								? `${birthYear} - ${deathYear}`
								: `${birthYear} - present`,
						)}
						{renderDetail("Relation", relationship)}
						{marriages && renderDetail("Spouses", marriages)}
						{nicknames && renderDetail("Nicknames", nicknames)}
						{occupations && renderDetail("Occupations", occupations)}
						{favThings &&
							renderDetail(
								formattedRandomFavThingKey!,
								favThings[
									randomFavThingKey! as keyof typeof favThings
								] as string,
							)}
						{formerResidences && renderDetail("Residences", formerResidences)}
					</Grid>
				</Flex>
			</Card.Body>
		</Card.Root>
	);
};
