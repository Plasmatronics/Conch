import z from "zod";

export const apiDateSchema = z.iso
	.datetime()
	.transform((value: string) => new Date(value));
