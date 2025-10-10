import {
	HydratedFamilyTreeMemberDTO,
	MediaTypeAndKey,
	PopulatedFamilyTreeMemberDTOWithStoryCount,
} from "@conch/shared";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useFetchMediaData } from "../../../api";
import axios from "axios";

interface IFetchPeople {
	spouses?: HydratedFamilyTreeMemberDTO["id"][];
	dated?: HydratedFamilyTreeMemberDTO["id"][];
	childrenArr?: HydratedFamilyTreeMemberDTO["id"][];
	others: HydratedFamilyTreeMemberDTO["id"][];
	relationshipMap: Map<HydratedFamilyTreeMemberDTO["id"], Relationships>;
}

type Relationships =
	| "Romantic"
	| "Friend"
	| "Spouse"
	| "Family"
	| "Child"
	| "Other";

type PersonAndRelationship = PopulatedFamilyTreeMemberDTOWithStoryCount & {
	relationToPerson: Relationships;
};

type ReactQueryOptions = Omit<
	UseQueryOptions<PersonAndRelationship[]>,
	"queryFn" | "queryKey"
>;

type useDataPostProps = Omit<IFetchPeople, "relationshipMap"> &
	ReactQueryOptions;

export const IFetchPeople = async ({
	spouses = [],
	dated = [],
	childrenArr = [],
	others = [],
	relationshipMap,
}: IFetchPeople): Promise<PersonAndRelationship[]> => {
	try {
		const peopleSearch = [...spouses, ...dated, ...childrenArr, ...others].join(
			"_id=",
		);

		const { data } = await axios.get<{
			data: PopulatedFamilyTreeMemberDTOWithStoryCount[];
		}>(
			`http://127.0.0.1:3000/api/v1/familyTreeMembers/?count=stories&_id=${peopleSearch}`,
		);

		return data.data.map((person) => {
			const relationToPerson = relationshipMap.get(person.id) as Relationships;
			if (
				relationToPerson === "Other" &&
				person.relationToMember === "friend"
			) {
				return { ...person, relationToPerson: "Friend" };
			} else if (relationToPerson === "Other") {
				return { ...person, relationToPerson: "Family" };
			}

			return { ...person, relationToPerson };
		});
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const useDataConveyorBelt = ({
	spouses = [],
	dated = [],
	childrenArr = [],
	others = [],
	...reactQueryProps
}: useDataPostProps) => {
	const relationshipMap = new Map<
		HydratedFamilyTreeMemberDTO["id"],
		Relationships
	>();
	for (const spouse of spouses) {
		relationshipMap.set(spouse, "Spouse");
	}
	for (const partner of dated) {
		relationshipMap.set(partner, "Romantic");
	}
	for (const child of childrenArr) {
		relationshipMap.set(child, "Child");
	}
	for (const friend of others) {
		relationshipMap.set(friend, "Other");
	}

	const relationshipKey = Array.from(relationshipMap.entries());
	const conveyorBeltQueryKey = [
		"conveyorBelt",
		spouses.length ? spouses : undefined,
		dated.length ? dated : undefined,
		childrenArr.length ? childrenArr : undefined,
		others.length ? others : undefined,
		relationshipKey.length ? relationshipKey : undefined,
	].filter(Boolean);

	const conveyorBeltQuery = useQuery<PersonAndRelationship[]>({
		// key is included, but made stable, react query however cannot detect this
		// eslint-disable-next-line
		queryKey: conveyorBeltQueryKey,
		queryFn: () =>
			IFetchPeople({ spouses, dated, childrenArr, others, relationshipMap }),
		enabled: !!spouses || !!dated || !!childrenArr || !!others,
		...reactQueryProps,
	});

	const fileKeys: MediaTypeAndKey[] = [];
	for (const person of conveyorBeltQuery.data || []) {
		fileKeys.push({
			fileKey: person.keyPhoto.fileKey,
			type: person.keyPhoto.type,
		});
	}

	const avatarQuery = useFetchMediaData({
		files: fileKeys,
		enabled: !!conveyorBeltQuery.data && !!fileKeys.length,
	});

	return { conveyorBeltQuery, avatarQuery };
};
