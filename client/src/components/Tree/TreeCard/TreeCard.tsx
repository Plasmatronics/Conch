import {
	Card,
	Flex,
	Text,
	Image,
	Separator,
	Button,
	Box,
} from "@chakra-ui/react";
import { TreeCardProps } from "./TreeCard.types";
import { useState } from "react";
import { TabButton } from "../../Elements";

export const TreeCard = ({
	memberData,
	width = "10rem",
	height = "15rem",
	cardBodyProps,
	onMemoriesClick,
	...cardRootProps
}: TreeCardProps) => {
	const [curCardIndex, setCurCardIndex] = useState(0);

	const isArr = Array.isArray(memberData);
	const arrMemberData = isArr ? memberData : [memberData];
	const curMember = arrMemberData[curCardIndex];

	const handleTabClick = (idx: number) => {
		setCurCardIndex(idx);
	};

	return (
		<Card.Root {...cardRootProps} width={width} height={height}>
			<Card.Body
				p="0.75rem"
				{...cardBodyProps}
				width="100%"
				height="100%"
				position="relative"
			>
				{arrMemberData.length > 1 && (
					<Flex
						position="absolute"
						top={0}
						right={0}
						pt="0.25rem"
						pr="0.25rem"
						width="fit-content"
						gap="0.25rem"
						justifyContent="space-around"
					>
						{arrMemberData.map((member, idx) => {
							return (
								<TabButton
									unselectedStyles={{
										bg: "green.400",
										_hover: {
											bg: "green.500",
										},
									}}
									selectedStyles={{
										_hover: {
											bg: "green.600",
										},
										bg: "green.700",
									}}
									width="0.35rem"
									height="0.35rem"
									key={`${member.name}-${idx}`}
									zIndex="overlay"
									onClick={() => handleTabClick(idx)}
									isSelected={idx === curCardIndex}
								/>
							);
						})}
					</Flex>
				)}
				<Flex
					width="100%"
					height="100%"
					direction="column"
					alignItems="center"
					justifyContent="center"
					gapY="0.125rem"
				>
					<Box width="100%" height="60%" overflow="hidden" borderRadius="sm">
						<Image
							width="100%"
							height="100%"
							objectFit="cover"
							src={curMember.image}
							alt={curMember.name}
						/>
					</Box>
					<Flex
						width="100%"
						direction="column"
						alignItems="center"
						justifyContent="center"
						pb="0.25rem"
					>
						<Text
							textAlign="center"
							fontSize="sm"
							fontWeight="medium"
							color="gray.800"
						>
							{curMember.name}
						</Text>
						<Text fontSize="xs" fontWeight="medium" color="gray.500">
							{curMember.birthYear} -
							{curMember.deathYear ? ` ${curMember.deathYear}` : " present"}
						</Text>
					</Flex>
					<Separator mx="auto" width="95%" pb="0.25rem" />
					<Button
						onClick={onMemoriesClick}
						layerStyle="interactionButton"
						width="100%"
						size="xs"
					>
						{curMember.numMemories} Memories
					</Button>
				</Flex>
			</Card.Body>
		</Card.Root>
	);
};
