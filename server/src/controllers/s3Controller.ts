import { Request, Response, NextFunction } from "express";
import { AppError, catchError, S3Service } from "../utils";

const generateSecureDownloadUrl = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { fileKey } = req.body;

		if (!fileKey)
			throw new AppError(
				400,
				"Please enter a valid file key to generate secure download url",
			);

		const downloadUrl = await S3Service.getS3Client().generateSecureDownloadUrl(
			{ fileKey },
		);

		res.status(200).json({
			status: "success",
			downloadUrl,
		});
	} catch (err) {
		catchError(err, next);
	}
};

const generateSecureUploadUrl = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { fileType } = req.body;
		if (!fileType)
			throw new AppError(
				400,
				"Please enter a valid file type to generate secure upload url",
			);

		const uploadUrl = await S3Service.getS3Client().generateSecureUploadUrl({
			fileType,
		});

		res.status(200).json({
			status: "success",
			uploadUrl,
		});
	} catch (err) {
		catchError(err, next);
	}
};

export const s3Controller = {
	generateSecureUploadUrl,
	generateSecureDownloadUrl,
};
