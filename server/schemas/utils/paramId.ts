import z from "zod";

export const paramId = z.coerce.number().int().positive();
