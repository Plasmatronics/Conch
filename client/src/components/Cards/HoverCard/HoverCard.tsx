import {
	Avatar,
	HoverCard as ChakraCard,
	Flex,
	Portal,
	Text,
} from "@chakra-ui/react";
import { HoverCardProps } from "./HoverCard.types";

export const HoverCard = ({
	avatar,
	trigger,
	relationship,
	overview,
	name,
	numMemories,
	...hoverCardRootProps
}: HoverCardProps) => {
	return (
		<ChakraCard.Root {...hoverCardRootProps}>
			<ChakraCard.Trigger>{trigger}</ChakraCard.Trigger>
			<Portal>
				<ChakraCard.Positioner>
					<ChakraCard.Content>
						<ChakraCard.Arrow />
						<Flex
							alignItems="start"
							justifyContent="center"
							direction="column"
							width="100%"
							gap="0.5rem"
						>
							<Flex alignItems="center" justifyContent="center" gap="0.5rem">
								<Avatar.Root size="xl">
									<Avatar.Image src={avatar} alt={name} />
									<Avatar.Fallback name={name} />
								</Avatar.Root>
								<Flex gap="0rem" direction="column">
									<Text fontWeight="semibold">{name}</Text>
									<Text color="gray.500" fontSize="xs">
										{relationship}
									</Text>
								</Flex>
							</Flex>
							{overview && <Text>{overview}</Text>}
							<Text fontSize="xs">
								<Text fontWeight="medium" as="span">
									{numMemories}
								</Text>{" "}
								Memories
							</Text>
						</Flex>
					</ChakraCard.Content>
				</ChakraCard.Positioner>
			</Portal>
		</ChakraCard.Root>
	);
};
