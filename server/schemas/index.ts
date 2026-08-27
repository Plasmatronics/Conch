import { claimsDependencyEdges } from "./Claims";
import { conchesDependencyEdges } from "./Conches";
import { mediaDependencyEdges, mediaTypeEnum } from "./Media";
import { memberReferralsDependencyEdges } from "./MemberReferrals";
import { membersDependencyEdges } from "./Members";
import { postsDependencyEdges, createSeasonEnum } from "./Posts";
import { postMediaDependencyEdges } from "./PostMedia";
import { postMembersDependencyEdges } from "./PostMembers";
import {
	relationshipsDependencyEdges,
	createRelationshipTypeEnumQuery,
} from "./Relationships";
import { userReferralsDependencyEdges } from "./UserReferrals";
import { usersDependencyEdges, createAppRoleEnumQuery } from "./Users";
import { sessionsDependencyEdges } from "./Sessions";

export const dependencyEdges: Array<[string, string]> = [
	...claimsDependencyEdges,
	...conchesDependencyEdges,
	...mediaDependencyEdges,
	...memberReferralsDependencyEdges,
	...membersDependencyEdges,
	...postsDependencyEdges,
	...postMediaDependencyEdges,
	...postMembersDependencyEdges,
	...relationshipsDependencyEdges,
	...userReferralsDependencyEdges,
	...usersDependencyEdges,
	...sessionsDependencyEdges,
];

export const enumCreationQueries: string[] = [
	createAppRoleEnumQuery,
	createRelationshipTypeEnumQuery,
	createSeasonEnum,
	mediaTypeEnum,
];

export * from "./Claims";
export * from "./Conches";
export * from "./Media";
export * from "./MemberReferrals";
export * from "./Members";
export * from "./Posts";
export * from "./PostMedia";
export * from "./PostMembers";
export * from "./Relationships";
export * from "./UserReferrals";
export * from "./Users";
export * from "./Sessions";

export * from "./shared";
export * from "./utils";
