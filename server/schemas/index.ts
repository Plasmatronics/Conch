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
} from "./Users";

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
];

export const nodeToCreationQueryMap: Record<string, string> = {
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
