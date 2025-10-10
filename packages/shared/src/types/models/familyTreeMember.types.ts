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
	PopulateParents,
} from "types/utils";
import { IStory, PopulatedStoryDTO, UnhydratedStoryDTO } from "./stories.types";
import { RelationToMember } from "types/relationships.types";

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
	isRelated: boolean;
	favThings?: MemberFavThings;
	occupations?: string[];
	claimedId?: mongoose.Types.ObjectId;
	keyPhoto?: mongoose.Types.ObjectId;
	keyPhotoCaption?: string;
	bestFriend?: mongoose.Types.ObjectId;
	spouses?: mongoose.Types.ObjectId[];
	dated?: mongoose.Types.ObjectId[];
	children?: mongoose.Types.ObjectId[];
	parents?: mongoose.Types.ObjectId[];
	summary?: string;
	formerResidences?: ILocation[];
	gender: "Male" | "Female";
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
	isRelated: boolean;
	relationToMember: RelationToMember;
	favThings?: MemberFavThings;
	occupations?: string[];
	claimedId?: string;
	keyPhoto?: string;
	keyPhotoCaption?: string;
	bestFriend?: string;
	spouses?: string[];
	dated?: string[];
	children?: string[];
	parents?: string[];
	summary?: string;
	formerResidences?: ILocation[];
	gender: "Male" | "Female";
}

export type HydratedFamilyTreeMemberDTO =
	HydrateWithMetadata<UnhydratedFamilyTreeMemberDTO>;

export type PopulatedFamilyTreeMemberDTO = PopulateParents<
	PopulateChildren<
		PopulateDated<
			PopulateBestFriend<
				PopulateSpouses<PopulateKeyPhoto<HydratedFamilyTreeMemberDTO>>
			>
		>
	>
>;

export type PopulatedFamilyTreeMemberDTOWithStoryCount =
	PopulatedFamilyTreeMemberDTO & { storiesCount: number };

export type PopulatedFamilyTreeMemberDTOWithStory = Omit<
	PopulatedFamilyTreeMemberDTO,
	"stories"
> & { stories: PopulatedStoryDTO[] };
