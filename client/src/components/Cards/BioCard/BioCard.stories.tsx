import type { Meta, StoryFn } from "@storybook/react-vite";

import { BioCard } from "./BioCard";
import { BioCardProps } from "./BioCard.types";
import { Box, Flex } from "@chakra-ui/react";

export default {
	title: "Cards/BioCard",
	component: BioCard,
} satisfies Meta<typeof BioCard>;

const defaultInfo = {
	keyPhotoSrc:
		"https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRxSwCY9F--SzRe5tRL8fpupQeIRc4auqHR-MiHYkCSXYQjRqD9HYBDB9aXgh19YExZzjhUHhPFBQaOK_jM9oAGNlIUgC6hza9goKNYLWw",
	keyPhotoCaption: "Albert Einstein in 1921",
	name: "Albert Einstein",
	relationship: "Great Grandfather",
	birthYear: 1879,
	deathYear: 1955,
	marriages: ["Mileva Marić", "Elsa Löwenthal"],
	favThings: {
		movie: "Modern Times",
		food: "Sticky Orange Cake",
		restaurant: "Café Metropole",
		color: "Blue",
		place: "Princeton",
		decade: "1920s",
		person: "Isaac Newton",
		song: "Beethoven’s Symphony No. 9",
	},
	nicknames: ["Einie", "Professor"],
	occupations: ["Physicist", "Professor"],
	formerResidences: ["Ulm", "Zurich", "Berlin", "Princeton"],
};

const Template: StoryFn<BioCardProps> = (args) => {
	return <BioCard {...args} />;
};

export const Einstein = Template.bind({});
Einstein.args = {
	info: defaultInfo,
};

export const Madonna = Template.bind({});
Madonna.args = {
	info: {
		keyPhotoSrc:
			"https://media.vogue.co.uk/photos/689c913fb3aecbedac377e32/master/w_1600%2Cc_limit/GettyImages-635753811.jpg",
		keyPhotoCaption: "Madonna at 22 (2015)",
		name: "Madonna",
		relationship: "Grandmother",
		birthYear: 1958,
		marriages: ["Sean Penn", "Guy Ritchie"],
		favThings: {
			movie: "Desperately Seeking Susan",
			food: "Salmon",
			place: "New York City",
			decade: "1980s",
			person: "Marilyn Monroe",
			song: "Imagine",
		},
		nicknames: ["Queen of Pop", "Madge", "Esther"],
		occupations: [
			"Singer",
			"Songwriter",
			"Actress",
			"Director",
			"Businesswoman",
		],
		formerResidences: [
			"Bay City",
			"Rochester Hills",
			"New York City",
			"London",
			"Lisbon",
		],
	},
};

export const SideBySide = () => {
	return (
		<Flex width="100%" height="100%" gap="1rem">
			<Box height="50rem" flex="3" bg="red" />
			<BioCard flex="2" info={defaultInfo} />
		</Flex>
	);
};
