import nodemailer, { Transporter } from "nodemailer";
import { IUser } from "../models";
import { AppError } from "./AppError";

class EmailService {
	private transporter: Transporter;
	private static instance: EmailService;

	private constructor() {
		this.transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAuth2",
				user: process.env.TRANSPORT_EMAIL,
				clientId: process.env.OAUTH2_CLIENT_ID,
				clientSecret: process.env.OAUTH2_CLIENT_SECRET,
				refreshToken: process.env.OAUTH2_REFRESH_TOKEN,
			},
		});
	}

	public static getEmail() {
		if (!EmailService.instance) {
			EmailService.instance = new EmailService();
		}

		return EmailService.instance;
	}

	public async sendGreetingEmail(recipient: IUser["email"]) {
		try {
			return await this.transporter.sendMail({
				from: process.env.TRANSPORT_EMAIL,
				to: recipient,
				subject: "Welcome to the App",
				html: "<p>Welcome!</p>",
			});
		} catch (err) {
			throw new AppError(500, "Could not send email. Please try again.");
		}
	}
}

export const Email = EmailService;
