import { HydratedUserDTO } from "types/models";
import { HydrateWithMetadata } from "../hydrateWithMongoose";

export type PopulateReplyingTo<T> = Omit<T, "replyingTo"> & {
	replyingTo: HydrateWithMetadata<{ name: HydratedUserDTO["name"] }>;
};
