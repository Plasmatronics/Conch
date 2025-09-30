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

export type PopulateFamilyTreeMember<T> = Omit<T, "familyTreeMember"> & {
	familyTreeMember: PopulateKeyPhoto<HydratedFamilyTreeMemberDTO>;
};

export type PopulateBestFriend<T> = Omit<T, "bestFriend"> & {
	bestFriend?: {
		name: HydrateWithMetadata<HydratedFamilyTreeMemberDTO["name"]>;
	};
};

export type PopulateSpouses<T> = Omit<T, "spouses"> & {
	spouses?: HydrateWithMetadata<HydratedFamilyTreeMemberDTO["name"]>[];
};

export type PopulateChildren<T> = Omit<T, "children"> & {
	children?: HydrateWithMetadata<HydratedFamilyTreeMemberDTO["name"]>[];
};

export type PopulateDated<T> = Omit<T, "dated"> & {
	dated?: HydrateWithMetadata<HydratedFamilyTreeMemberDTO["name"]>[];
};
