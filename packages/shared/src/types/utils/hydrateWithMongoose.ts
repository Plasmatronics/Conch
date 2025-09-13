export type HydrateWithMetadata<T> = T & {
	_id?: string;
	id: string;
	__v?: number;
};
