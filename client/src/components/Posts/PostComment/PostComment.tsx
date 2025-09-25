import {
	Flex,
	Box,
	Avatar,
	Textarea,
	IconButton,
	Spinner,
} from "@chakra-ui/react";
import { PostCommentProps } from "./PostComment.types";
import { TbSend2 } from "react-icons/tb";
import React from "react";

export const PostComment = ({
	onSubmit,
	placeholder = "Comment…",
	avatar,
	user,
	registerField,
	posting,
	onHandleBackspace,
	...boxProps
}: PostCommentProps) => {
	const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
	const { ref, ...restRegisterField } = registerField;

	const onHandleEnter = (e: React.KeyboardEvent<HTMLFormElement>) => {
		if (e.code === "Enter" && !e.shiftKey) {
			e.preventDefault();
			(e.currentTarget as HTMLFormElement).requestSubmit?.();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
		onHandleEnter(e);
		if (e.code === "Backspace") {
			onHandleBackspace?.();
		}
	};

	return (
		<Box bg="white" {...boxProps} position="sticky" left={0} bottom={0}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit?.(e);
				}}
				onKeyDown={(e) => {
					handleKeyDown(e);
				}}
			>
				<Flex width="100%" p="1rem" gap="0.5rem" align="center">
					<Avatar.Root>
						<Avatar.Fallback name={user} />
						<Avatar.Image src={avatar} />
					</Avatar.Root>
					<Flex direction="column" width="100%">
						<Textarea
							ref={(element) => {
								textareaRef.current = element;
								ref(element);
							}}
							{...restRegisterField}
							placeholder={placeholder}
							disabled={posting}
							border="none"
							outline="none"
							bg="gray.100"
							autoresize
							borderTopLeftRadius="md"
							borderTopRightRadius="md"
							borderBottomLeftRadius="none"
							borderBottomRightRadius="none"
						/>
						<Flex
							width="100%"
							bg={posting ? "gray.50" : "gray.100"}
							height="2.5rem"
							borderTopLeftRadius="none"
							borderTopRightRadius="none"
							borderBottomLeftRadius="md"
							borderBottomRightRadius="md"
							pb="0.25rem"
							cursor="text"
							onClick={() => textareaRef.current?.focus()}
						>
							<IconButton
								bg="transparent"
								color="gray.500"
								_hover={{
									color: "gray.600",
								}}
								type="submit"
								ml="auto"
								size="md"
								onClick={(e) => e.stopPropagation()}
								disabled={posting}
								cursor="pointer"
							>
								{posting ? <Spinner size="xs" /> : <TbSend2 />}
							</IconButton>
						</Flex>
					</Flex>
				</Flex>
			</form>
		</Box>
	);
};
