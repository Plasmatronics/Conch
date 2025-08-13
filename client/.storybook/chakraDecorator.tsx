import type { StoryFn } from "@storybook/react-vite";
import { Box, ChakraProvider, defaultSystem } from "@chakra-ui/react";

const withChakra = (Story: StoryFn) => {
	return (
		<ChakraProvider value={defaultSystem}>
			<Box p="2rem" mx="auto" height="100%" width="100%">
				<Story />
			</Box>
		</ChakraProvider>
	);
};

export default withChakra;
