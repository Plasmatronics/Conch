import mongoose, { Document } from "mongoose";
import { MemberFavThings } from "types/favThings.types";
import { ILocation } from "types/location.types";
import { HydrateWithMetadata, PopulateKeyPhoto } from "types/utils";
import { IStory, PopulatedStoryDTO, UnhydratedStoryDTO } from "./stories.types";

export interface IFamilyTreeMember {
	name: string;
	nicknames?: string[];
	birthLocation?: ILocation;
	dateOfBirth: Date;
	dateOfDeath?: Date;
	deathLocation?: ILocation;
	createdAt: Date;
	deletedAt?: Date;
	stories?: IStory[];
	relationToRootMember: string;
	favThings?: MemberFavThings;
	claimedId?: mongoose.Types.ObjectId;
	keyPhoto?: mongoose.Types.ObjectId;
}

export type FamilyTreeMemberDoc = IFamilyTreeMember & Document;

export interface UnhydratedFamilyTreeMemberDTO {
	name: string;
	nicknames?: string[];
	birthLocation?: ILocation;
	dateOfBirth: Date;
	dateOfDeath?: Date;
	deathLocation?: ILocation;
	createdAt: Date;
	deletedAt?: Date;
	stories?: UnhydratedStoryDTO[];
	relationToRootMember: string;
	favThings?: MemberFavThings;
	claimedId?: string;
	keyPhoto?: string;
}

export type HydratedFamilyTreeMemberDTO =
	HydrateWithMetadata<UnhydratedFamilyTreeMemberDTO>;

export type PopulatedFamilyTreeMemberDTO =
	PopulateKeyPhoto<HydratedFamilyTreeMemberDTO>;

export type PopulatedFamilyTreeMemberDTOWithStory = Omit<
	PopulatedFamilyTreeMemberDTO,
	"stories"
> & { stories: PopulatedStoryDTO[] };
