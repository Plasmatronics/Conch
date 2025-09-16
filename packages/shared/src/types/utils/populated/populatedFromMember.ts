import { HydratedFamilyTreeMemberDTO } from "types/models";
import { HydrateWithMetadata } from "types/utils";
import { PopulateKeyPhoto } from "./populatedFromMedia";

export type PopulateAuthor<T> = Omit<T, "author"> & {
	author: HydrateWithMetadata<
		PopulateKeyPhoto<{
			relationToRootMember: HydratedFamilyTreeMemberDTO["relationToRootMember"];
			name: HydratedFamilyTreeMemberDTO["name"];
			keyPhoto: HydratedFamilyTreeMemberDTO["keyPhoto"];
		}>
	>;
};
