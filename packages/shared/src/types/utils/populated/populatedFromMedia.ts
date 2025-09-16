import { HydratedMediaDTO } from "types/models";
import { HydrateWithMetadata } from "types/utils";

export type PopulateKeyPhoto<T> = Omit<T, "keyPhoto"> & {
	keyPhoto: HydrateWithMetadata<{
		type: HydratedMediaDTO["type"];
		fileKey: HydratedMediaDTO["fileKey"];
	}>;
};
