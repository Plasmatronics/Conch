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

		const { uploadUrl, fileKey } =
			await S3Service.getS3Client().generateSecureUploadUrl({
				fileType,
			});

		res.status(200).json({
			status: "success",
			uploadUrl,
			fileKey,
		});
	} catch (err) {
		catchError(err, next);
	}
};

const deleteFromBucket = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { fileKeys } = req.params;
		const fileKeysArr = fileKeys.split(",");
		let s3Res;

		if (!fileKeys)
			throw new AppError(400, "Please specify fileKeys to delete");

		if (fileKeysArr[1]) {
			s3Res =
				await S3Service.getS3Client().deleteManyFilesFromBucket(fileKeysArr);
		} else {
			s3Res = await S3Service.getS3Client().deleteFileFromBucket(
				fileKeysArr[0],
			);
		}

		res.status(200).json({
			status: "success",
			s3Res,
		});
	} catch (err) {
		catchError(err, next);
	}
};

export const s3Controller = {
	generateSecureUploadUrl,
	generateSecureDownloadUrl,
	deleteFromBucket,
};
