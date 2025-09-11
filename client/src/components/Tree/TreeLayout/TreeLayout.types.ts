import { PersonId } from "types";
import { TreeCardProps } from "../TreeCard";

type PersonData = {
	content: Omit<TreeCardProps, "width" | "height"> &
		Partial<Pick<TreeCardProps, "width" | "height">>;
};

interface DescendantMarriages {
	descendantId: PersonId;
	spouseIds: PersonId[];
}
interface ParentChildRelationship {
	parentId: PersonId;
	childIds: PersonId[];
}

export interface TreeLayoutProps {
	people: Record<PersonId, PersonData>;
	marriages: DescendantMarriages[];
	parentChild: ParentChildRelationship[];
}
