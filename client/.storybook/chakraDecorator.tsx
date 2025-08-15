import type { StoryFn } from "@storybook/react-vite";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { system } from "@conch/design-system";

const withChakra = (Story: StoryFn) => {
	return (
		<ChakraProvider value={system}>
			<Box p="2rem" mx="auto" height="100%" width="100%">
				<Story />
			</Box>
		</ChakraProvider>
	);
};

export default withChakra;
