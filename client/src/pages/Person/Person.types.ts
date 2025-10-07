import {
	HydratedFamilyTreeMemberDTO,
	HydratedUserDTO,
	MediaTypeAndDownloadUrl,
	UserDTOMemberPopulated,
} from "@conch/shared";

interface ControlledProps {
	user: UserDTOMemberPopulated;
	userAvatar: MediaTypeAndDownloadUrl["downloadUrl"];
}

export interface PersonProps {
	personId: HydratedFamilyTreeMemberDTO["id"];
	userId: HydratedUserDTO["id"];
	controlledProps?: ControlledProps;
}
