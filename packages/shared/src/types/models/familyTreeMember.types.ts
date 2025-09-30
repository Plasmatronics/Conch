import mongoose, { Document } from "mongoose";
import { MemberFavThings } from "types/favThings.types";
import { ILocation } from "types/location.types";
import {
	HydrateWithMetadata,
	PopulateBestFriend,
	PopulateDated,
	PopulateKeyPhoto,
	PopulateSpouses,
	PopulateChildren,
} from "types/utils";
import { IStory, PopulatedStoryDTO, UnhydratedStoryDTO } from "./stories.types";
import { RelationToRootMember } from "types/relationships.types";

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
	relationToRootMember: RelationToRootMember;
	favThings?: MemberFavThings;
	claimedId?: mongoose.Types.ObjectId;
	keyPhoto?: mongoose.Types.ObjectId;
	bestFriend?: mongoose.Types.ObjectId;
	spouses?: mongoose.Types.ObjectId[];
	dated?: mongoose.Types.ObjectId[];
	children?: mongoose.Types.ObjectId[];
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
	relationToRootMember: RelationToRootMember;
	favThings?: MemberFavThings;
	claimedId?: string;
	keyPhoto?: string;
	bestFriend?: string;
	spouses?: string[];
	dated?: string[];
	children?: string[];
}

export type HydratedFamilyTreeMemberDTO =
	HydrateWithMetadata<UnhydratedFamilyTreeMemberDTO>;

export type PopulatedFamilyTreeMemberDTO = PopulateChildren<
	PopulateDated<
		PopulateBestFriend<
			PopulateSpouses<PopulateKeyPhoto<HydratedFamilyTreeMemberDTO>>
		>
	>
>;

export type PopulatedFamilyTreeMemberDTOWithStoryCount =
	PopulatedFamilyTreeMemberDTO & { storiesCount: number };

export type PopulatedFamilyTreeMemberDTOWithStory = Omit<
	PopulatedFamilyTreeMemberDTO,
	"stories"
> & { stories: PopulatedStoryDTO[] };
