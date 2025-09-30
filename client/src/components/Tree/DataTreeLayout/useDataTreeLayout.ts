import {
	HydratedUserDTO,
	nonDirectFamily,
	PopulatedFamilyTreeMemberDTOWithStoryCount,
} from "@conch/shared";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { TreeLayoutProps } from "../TreeLayout";

type FetchDataTreeLayoutReturn = {
	data: PopulatedFamilyTreeMemberDTOWithStoryCount[];
	keyPhotoUrls: Map<PopulatedFamilyTreeMemberDTOWithStoryCount["id"], string>;
};

type ReactQueryOptions = Omit<
	UseQueryOptions<FetchDataTreeLayoutReturn>,
	"queryFn" | "queryKey"
>;
type useDataTreeLayoutProps = ReactQueryOptions & {
	userId: HydratedUserDTO["id"];
};

const fetchDataTreeLayout = async (): Promise<FetchDataTreeLayoutReturn> => {
	try {
		const url = `http://127.0.0.1:3000/api/v1/familyTreeMembers?relationToRootMember[ne]=friend&count=stories`;
		const { data } = await axios.get<{
			data: PopulatedFamilyTreeMemberDTOWithStoryCount[];
		}>(url);

		const keyPhotoUrls = new Map<
			PopulatedFamilyTreeMemberDTOWithStoryCount["id"],
			string
		>();

		await Promise.all(
			data.data.map(async (person) => {
				const keyPhotoUrl = await axios.post<{
					downloadUrl: string;
					status: string;
				}>("http://127.0.0.1:3000/api/v1/files/download-url", {
					fileKey: person.keyPhoto.fileKey,
				});
				if (keyPhotoUrl) {
					keyPhotoUrls.set(person.id, keyPhotoUrl.data.downloadUrl);
				}
			}),
		);

		return { data: data.data, keyPhotoUrls };
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const useDataTreeLayout = ({
	userId,
	...reactQueryOptions
}: useDataTreeLayoutProps) => {
	const treeLayoutQuery = useQuery<
		FetchDataTreeLayoutReturn,
		Error,
		FetchDataTreeLayoutReturn
	>({
		queryKey: ["treeLayout", userId],
		queryFn: () => fetchDataTreeLayout(),
		...reactQueryOptions,
	});

	const peopleMap: TreeLayoutProps["people"] = {};
	const marriages: TreeLayoutProps["marriages"] = [];
	const parentChild: TreeLayoutProps["parentChild"] = [];

	treeLayoutQuery.data?.data.map((personData) => {
		const memberData = {
			name: personData.name,
			numMemories: personData.storiesCount,
			birthYear: new Date(personData.dateOfBirth).getFullYear(),
			deathYear:
				new Date(personData.dateOfDeath || 0).getFullYear() || undefined,
			image:
				treeLayoutQuery.data.keyPhotoUrls.get(personData.id) ||
				"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbyXaL_SqGwgOX9Ry5md1tc4C5uBm1sjIx6w&s",
		};
		peopleMap[personData.id] = {
			content: { memberData, width: "10rem", height: "10rem" },
		};

		if (
			personData.spouses &&
			personData?.spouses?.length > 0 &&
			personData.relationToRootMember &&
			!nonDirectFamily.includes(personData.relationToRootMember)
		) {
			marriages.push({
				descendantId: personData.id,
				spouseIds: personData.spouses.map((spouse) => spouse.id),
			});
		}

		if (personData.children && personData.children.length > 0) {
			parentChild.push({
				parentId: personData.id,
				childIds: personData?.children?.map((child) => child.id),
			});
		}
	});

	return { treeLayoutQuery, peopleMap, marriages, parentChild };
};
