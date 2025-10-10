import { HydratedFamilyTreeMemberDTO, HydratedUserDTO } from "types/models";
import { HydrateWithMetadata } from "../hydrateWithMongoose";
import { PopulateFamilyTreeMember } from "./populatedFromMember";

export type PopulateReplyingTo<T> = Omit<T, "replyingTo"> & {
	replyingTo?: HydrateWithMetadata<{ name: HydratedUserDTO["name"] }>;
};

export type PopulateAuthor<T> = Omit<T, "author"> & {
	author: PopulateFamilyTreeMember<HydratedFamilyTreeMemberDTO>;
};
