/* eslint-disable no-await-in-loop */
import {
	DeleteObjectCommand,
	GetObjectCommand,
	paginateListObjectsV2,
	PutObjectCommand,
	S3Client,
	S3ServiceException,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { readFile } from "node:fs/promises";
import { AppError } from "./AppError";
import { createReadStream, createWriteStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	UploadRequest,
	DownloadRequest,
} from "../../../shared/src/types/file.types";
export class S3Service extends S3Client {
	private static instance: S3Service;

	private async getObjectRange(
		fileName: string,
		startBytes: number,
		endBytes: number,
	) {
		const command = new GetObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME,
			Key: fileName,
			Range: `bytes=${startBytes}-${endBytes}`,
		});

		return await S3Service.getS3Client().send(command);
	}

	private getByteInfo(ContentRange: string) {
		const [completedRangeStr, totalLengthStr] = ContentRange.replace(
			"bytes ",
			"",
		).split("/");
		const [startRangeStr, endRangeStr] = completedRangeStr.split("-");

		const totalLength = Number.parseInt(totalLengthStr);
		const startRange = Number.parseInt(startRangeStr);
		const endRange = Number.parseInt(endRangeStr);
		return { startRange, endRange, totalLength };
	}

	public static getS3Client() {
		if (!S3Service.instance) {
			S3Service.instance = new S3Service({
				region: process.env.S3_REGION,
				credentials: {
					secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
					accessKeyId: process.env.S3_ACCESS_KEY || "",
				},
			});
		}

		return S3Service.instance;
	}

	public async generateSecureUploadUrl({ fileType }: UploadRequest) {
		try {
			const fileKey = uuidv4();

			const command = new PutObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileKey,
				ContentType: fileType,
			});

			// one minute expire time
			const uploadUrl = await getSignedUrl(S3Service.getS3Client(), command, {
				expiresIn: 60,
			});
			if (!uploadUrl) throw new AppError(500, "Could not generate secure url");

			return { uploadUrl, fileKey };
		} catch (err) {
			if (err instanceof AppError) throw err;

			throw new AppError(
				500,
				err instanceof Error
					? err.message
					: "Could not generate secure url. Please try again.",
			);
		}
	}

	public async generateSecureDownloadUrl({ fileKey }: DownloadRequest) {
		try {
			const command = new GetObjectCommand({
				Key: fileKey,
				Bucket: process.env.S3_BUCKET_NAME,
			});

			// one minute expire time
			const downloadUrl = await getSignedUrl(S3Service.getS3Client(), command, {
				expiresIn: 60,
			});
			if (!downloadUrl)
				throw new AppError(500, "Could not generate secure url");

			return downloadUrl;
		} catch (err) {
			if (err instanceof AppError) throw err;

			throw new AppError(
				500,
				err instanceof Error
					? err.message
					: "Could not generate secure url. Please try again.",
			);
		}
	}

	private async uploadSmallFileToBucket(fileName: string, filePath: string) {
		try {
			const command = new PutObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileName,
				Body: await readFile(filePath),
			});

			return await S3Service.getS3Client().send(command);
		} catch (err) {
			let errMessage;
			if (err instanceof S3ServiceException && err.name === "EntityTooLarge") {
				errMessage = `Error from S3 while uploading object to ${process.env.S3_BUCKET_NAME}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`;
			} else if (err instanceof S3ServiceException) {
				errMessage = `Error from S3 while uploading object to ${process.env.S3_BUCKET_NAME}.  ${err.name}: ${err.message}`;
			} else {
				errMessage = `Could not upload ${fileName} to ${process.env.S3_BUCKET_NAME} bucket.`;
			}

			throw new AppError(500, errMessage);
		}
	}

	private async uploadLargeFileToBucket(fileName: string, filePath: string) {
		try {
			const fileStream = createReadStream(filePath);
			const upload = new Upload({
				client: S3Service.getS3Client(),
				params: {
					Bucket: process.env.S3_BUCKET_NAME,
					Key: fileName,
					Body: fileStream,
				},
			});

			return await upload.done();
		} catch (err) {
			let errMessage;
			if (err instanceof Error && err.name === "AbortError") {
				errMessage = `Multipart upload was aborted. ${err.message}`;
			} else {
				errMessage = `Could not upload ${fileName} to ${process.env.S3_BUCKET_NAME} bucket.`;
			}

			throw new AppError(500, errMessage);
		}
	}

	public async upload(fileName: string, filePath: string, fileSize: number) {
		const MULTIPART_THRESHOLD = 500 * 1024 * 1024; // 500Mb

		if (fileSize > MULTIPART_THRESHOLD) {
			return await this.uploadLargeFileToBucket(fileName, filePath);
		} else {
			return await this.uploadSmallFileToBucket(fileName, filePath);
		}
	}

	public async download(fileName: string, fileDestination: string) {
		try {
			const oneMb = 1024 * 1024;

			fileDestination =
				fileDestination ||
				fileURLToPath(new URL(`./${fileName}`, import.meta.url));

			const writeStream = createWriteStream(fileDestination).on(
				"error",
				(err) => {
					throw new AppError(
						500,
						err instanceof Error
							? err.message
							: `Couldn't download ${fileName} from ${process.env.S3_BUCKET_NAME} bucket`,
					);
				},
			);

			let rangeStart = 0;
			let rangeEnd = oneMb - 1;
			const { ContentRange: startingContentRange } = await this.getObjectRange(
				fileName,
				rangeStart,
				rangeEnd,
			);
			if (!startingContentRange) {
				throw new AppError(
					500,
					`Couldn't retrieve ${fileName} from ${process.env.S3_BUCKET_NAME} bucket for download`,
				);
			}
			const { totalLength } = this.getByteInfo(startingContentRange);

			while (rangeStart < totalLength) {
				const { ContentRange: curContentRange, Body } =
					await this.getObjectRange(fileName, rangeStart, rangeEnd);

				if (!curContentRange || !Body) {
					throw new AppError(
						500,
						`Couldn't download ${fileName} from ${process.env.S3_BUCKET_NAME} bucket`,
					);
				}

				writeStream.write(await Body.transformToByteArray());

				const { endRange } = this.getByteInfo(curContentRange);

				rangeStart = Math.min(endRange + 1, totalLength);
				const roughRangeEnd = rangeStart + oneMb - 1;
				rangeEnd = Math.min(roughRangeEnd, totalLength);
			}
			return writeStream.end();
		} catch (err) {
			if (err instanceof AppError) {
				throw err;
			}

			let errMessage;
			if (err instanceof Error && err.name === "AbortError") {
				errMessage = `Multipart download was aborted. ${err.message}`;
			} else {
				errMessage = `Could not download ${fileName} from ${process.env.S3_BUCKET_NAME} bucket.`;
			}

			throw new AppError(500, err instanceof Error ? err.message : errMessage);
		}
	}

	public async readFilesFromBucket(itemsPerPage?: number) {
		try {
			const objects = [];

			const paginator = paginateListObjectsV2(
				{ client: S3Service.getS3Client(), pageSize: itemsPerPage || 100 },
				{ Bucket: process.env.S3_BUCKET_NAME },
			);

			for await (const page of paginator) {
				const pageContent = page.Contents || [];
				objects.push(pageContent.map((objectPage) => objectPage.Key));
			}

			const objectString = objects
				.map((objectPage, pageNum) => {
					return `Page ${pageNum + 1}:\n${objectPage.map((object) => object)}`;
				})
				.join(`\n`);

			return objectString;
		} catch (err) {
			let errMessage;
			if (err instanceof S3ServiceException && err.name === "NoSuchBucket") {
				errMessage = `Error from S3 while listing objects for "${process.env.S3_BUCKET_NAME}". The bucket doesn't exist.`;
			} else if (err instanceof S3ServiceException) {
				errMessage = `Error from S3 while listing objects for "${process.env.S3_BUCKET_NAME}".  ${err.name}: ${err.message}`;
			} else {
				errMessage = `Could not list objects from ${process.env.S3_BUCKET_NAME} bucket.`;
			}

			throw new AppError(500, errMessage);
		}
	}

	public async deleteFileFromBucket(fileName: string) {
		try {
			const command = new DeleteObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileName,
			});
			return await S3Service.getS3Client().send(command);
		} catch (err) {
			let errMessage;
			if (err instanceof S3ServiceException && err.name === "NoSuchBucket") {
				errMessage = `Error from S3 while deleting object from ${process.env.S3_BUCKET_NAME}. The bucket doesn't exist.`;
			} else if (err instanceof S3ServiceException) {
				errMessage = `Error from S3 while deleting object from ${process.env.S3_BUCKET_NAME}.  ${err.name}: ${err.message}`;
			} else {
				errMessage = `Could not delete ${fileName} from ${process.env.S3_BUCKET_NAME} bucket.`;
			}

			throw new AppError(500, errMessage);
		}
	}

	public async deleteManyFilesFromBucket(fileNames: string[]) {
		const deletionPromises = await Promise.allSettled(
			fileNames.map((file) => this.deleteFileFromBucket(file)),
		);
		const failedDeletions = deletionPromises.filter(
			(deletion) => deletion.status === "rejected",
		);
		const successfulDeletions = deletionPromises.filter(
			(deletion) => deletion.status === "fulfilled",
		);

		if (failedDeletions.length > 0)
			failedDeletions.forEach((failure, i) => {
				if (failure.status === "rejected") {
					console.error(`Failed Deletion ${i}: ${failure.reason}\n`);
				}
			});

		return {
			failedDeletions,
			successfulDeletions,
		};
	}
}
