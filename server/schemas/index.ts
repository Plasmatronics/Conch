import {
	claimsDependencyEdges,
	claimsTableName,
	createClaimsTableQuery,
} from "./Claims";
import {
	conchesDependencyEdges,
	conchesTableName,
	createConchesTableQuery,
} from "./Conches";
import {
	mediaDependencyEdges,
	mediaTableName,
	createMediaTableQuery,
} from "./Media";
import {
	memberReferralsDependencyEdges,
	memberReferralsTableName,
	createMemberReferralsQuery,
} from "./MemberReferrals";
import {
	membersDependencyEdges,
	membersTableName,
	createMembersTableQuery,
} from "./Members";
import {
	postsDependencyEdges,
	postsTableName,
	createPostsTableQuery,
	createSeasonEnum,
} from "./Posts";
import {
	postMediaDependencyEdges,
	postMediaTableName,
	createPostMediaTableQuery,
} from "./PostMedia";
import {
	postMembersDependencyEdges,
	postMembersTableName,
	createPostMembersTableQuery,
} from "./PostMembers";
import {
	relationshipsDependencyEdges,
	relationshipsTableName,
	createRelationshipsTableQuery,
	createRelationshipTypeEnumQuery,
} from "./Relationships";
import {
	userReferralsDependencyEdges,
	userReferralsTableName,
	createUserReferralsQuery,
} from "./UserReferrals";
import {
	usersDependencyEdges,
	usersTableName,
	createUsersTableQuery,
	createAppRoleEnumQuery,
} from "./Users";
import {
	createSessionsTableQuery,
	sessionsDependencyEdges,
	sessionsTableName,
} from "./Sessions";

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
