import { compare, hash } from "bcrypt";

export const createPasswordHash = async (
	unhashedPassword: string,
): Promise<string> => {
	const saltRounds = 10;
	return await hash(unhashedPassword, saltRounds);
};

export const checkPassword = async (
	unhashedPassword: string,
	dbHash: string,
): Promise<boolean> => {
	return await compare(unhashedPassword, dbHash);
};
