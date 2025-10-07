import { HydratedFamilyTreeMemberDTO, PopulatedStoryDTO } from "@conch/shared";
import { ConveyorBeltProps } from "../ConveyorBelt";

export interface DataConveyorBeltProps
	extends Omit<ConveyorBeltProps, "children"> {
	spouses?: HydratedFamilyTreeMemberDTO["id"][];
	dated?: HydratedFamilyTreeMemberDTO["id"][];
	childrenArr?: HydratedFamilyTreeMemberDTO["id"][];
	bestFriend?: HydratedFamilyTreeMemberDTO["id"];
	memberId: HydratedFamilyTreeMemberDTO["id"];
	stories?: PopulatedStoryDTO[];
	onLoadingChange?: (isLoading: boolean) => void;
}
