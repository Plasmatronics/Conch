import { claimsDependencyEdges, createClaimsTableQuery } from "./Claims";
import { conchesDependencyEdges, createConchesTableQuery } from "./Conches";
import {
	mediaDependencyEdges,
	createMediaTableQuery,
	mediaTypeEnum,
} from "./Media";
import {
	memberReferralsDependencyEdges,
	createMemberReferralsQuery,
} from "./MemberReferrals";
import { membersDependencyEdges, createMembersTableQuery } from "./Members";
import {
	postsDependencyEdges,
	createPostsTableQuery,
	createSeasonEnum,
} from "./Posts";
import {
	postMediaDependencyEdges,
	createPostMediaTableQuery,
} from "./PostMedia";
import {
	postMembersDependencyEdges,
	postMembersTableName,
	createPostMembersTableQuery,
} from "./PostMembers";
import {
	relationshipsDependencyEdges,
	createRelationshipsTableQuery,
	createRelationshipTypeEnumQuery,
} from "./Relationships";
import {
	userReferralsDependencyEdges,
	createUserReferralsQuery,
} from "./UserReferrals";
import {
	usersDependencyEdges,
	createUsersTableQuery,
	createAppRoleEnumQuery,
} from "./Users";
import { createSessionsTableQuery, sessionsDependencyEdges } from "./Sessions";

import {
	conchesTableName,
	mediaTableName,
	postsTableName,
	membersTableName,
	claimsTableName,
	memberReferralsTableName,
	postMediaTableName,
	relationshipsTableName,
	sessionsTableName,
	userReferralsTableName,
	usersTableName,
} from "./shared";

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

export const nodeToCreationQueryMap: Record<string, string> = {
	[sessionsTableName]: createSessionsTableQuery,
	[claimsTableName]: createClaimsTableQuery,
	[conchesTableName]: createConchesTableQuery,
	[mediaTableName]: createMediaTableQuery,
	[memberReferralsTableName]: createMemberReferralsQuery,
	[membersTableName]: createMembersTableQuery,
	[postsTableName]: createPostsTableQuery,
	[postMediaTableName]: createPostMediaTableQuery,
	[postMembersTableName]: createPostMembersTableQuery,
	[relationshipsTableName]: createRelationshipsTableQuery,
	[userReferralsTableName]: createUserReferralsQuery,
	[usersTableName]: createUsersTableQuery,
};

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
