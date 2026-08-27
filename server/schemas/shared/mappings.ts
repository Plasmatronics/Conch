import { createClaimsTableQuery } from "../Claims";
import { createConchesTableQuery } from "../Conches";
import { createMediaTableQuery } from "../Media";
import { createMemberReferralsQuery } from "../MemberReferrals";
import { createMembersTableQuery } from "../Members";
import { createPostMediaTableQuery } from "../PostMedia";
import { createPostMembersTableQuery } from "../PostMembers";
import { createPostsTableQuery } from "../Posts";
import { createRelationshipsTableQuery } from "../Relationships";
import { createSessionsTableQuery } from "../Sessions";
import { createUserReferralsQuery } from "../UserReferrals";
import { createUsersTableQuery } from "../Users";
import {
	conchesTableName,
	mediaTableName,
	postsTableName,
	membersTableName,
	claimsTableName,
	memberReferralsTableName,
	postMediaTableName,
	relationshipsTableName,
	postMembersTableName,
	sessionsTableName,
	userReferralsTableName,
	usersTableName,
} from "./tableNames";
import {
	conchesIdColumnName,
	mediaIdColumnName,
	postsIdColumnName,
	membersIdColumnName,
	claimsIdColumnName,
	memberReferralsIdColumnName,
	postMediaIdColumnName,
	relationshipsIdColumnName,
	postMembersIdColumnName,
	sessionsIdColumnName,
	userReferralsIdColumnName,
	usersIdColumnName,
} from "./columnNames";

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

export const tableNameToIdColumnMap: Record<string, string> = {
	[sessionsTableName]: sessionsIdColumnName,
	[claimsTableName]: claimsIdColumnName,
	[conchesTableName]: conchesIdColumnName,
	[mediaTableName]: mediaIdColumnName,
	[memberReferralsTableName]: memberReferralsIdColumnName,
	[membersTableName]: membersIdColumnName,
	[postsTableName]: postsIdColumnName,
	[postMediaTableName]: postMediaIdColumnName,
	[postMembersTableName]: postMembersIdColumnName,
	[relationshipsTableName]: relationshipsIdColumnName,
	[userReferralsTableName]: userReferralsIdColumnName,
	[usersTableName]: usersIdColumnName,
};
