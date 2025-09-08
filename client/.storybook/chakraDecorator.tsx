import type { StoryFn } from "@storybook/react-vite";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { system } from "@conch/design-system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const withChakra = (Story: StoryFn) => {
	return (
		<QueryClientProvider client={queryClient}>
			<ChakraProvider value={system}>
				<Box p="2rem" mx="auto" height="100%" width="100%">
					<Story />
				</Box>
			</ChakraProvider>
		</QueryClientProvider>
	);
};

export default withChakra;
