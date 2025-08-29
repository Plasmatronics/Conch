import { TreeCardProps } from "../TreeCard";

type PersonID = string;

type PersonData = {
	content: Omit<TreeCardProps, "width" | "height"> &
		Partial<Pick<TreeCardProps, "width" | "height">>;
};

interface DescendantMarriages {
	descendantId: PersonID;
	spouseIds: PersonID[];
}
interface ParentChildRelationship {
	parentId: PersonID;
	childIds: PersonID[];
}

export interface TreeLayoutProps {
	people: Record<PersonID, PersonData>;
	marriages: DescendantMarriages[];
	parentChild: ParentChildRelationship[];
}
