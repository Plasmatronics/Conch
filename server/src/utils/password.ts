import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> =>
	bcrypt.hash(password, SALT_ROUNDS);
