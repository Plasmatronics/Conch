import { HydratedFamilyTreeMemberDTO } from "@conch/shared";
import { TreeCardProps } from "../TreeCard";

type PersonData = {
	content: Omit<TreeCardProps, "width" | "height"> &
		Partial<Pick<TreeCardProps, "width" | "height">>;
};

interface DescendantMarriages {
	descendantId: HydratedFamilyTreeMemberDTO["id"];
	spouseIds: HydratedFamilyTreeMemberDTO["id"][];
}
interface ParentChildRelationship {
	parentId: HydratedFamilyTreeMemberDTO["id"];
	childIds: HydratedFamilyTreeMemberDTO["id"][];
}

export interface TreeLayoutProps {
	people: Record<HydratedFamilyTreeMemberDTO["id"], PersonData>;
	marriages: DescendantMarriages[];
	parentChild: ParentChildRelationship[];
}
