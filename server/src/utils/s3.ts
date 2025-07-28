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

export class S3Service {
	private static instance: S3Client;

	private static async getObjectRange(
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

	public static getS3Client() {
		if (!this.instance) {
			this.instance = new S3Client({
				region: process.env.S3_REGION,
			});
		}

		return this.instance;
	}

	public static async uploadFileToBucket(fileName: string, filePath: string) {
		try {
			const command = new PutObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileName,
				Body: await readFile(filePath),
			});

			await this.getS3Client().send(command);
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

	public static async uploadLargeFileToBucket(
		fileName: string,
		filePath: string,
	) {
		try {
			const fileStream = createReadStream(filePath);
			const upload = new Upload({
				client: this.getS3Client(),
				params: {
					Bucket: process.env.S3_BUCKET_NAME,
					Key: fileName,
					Body: fileStream,
				},
			});

			await upload.done();
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

	public static async downloadLargeFileFromBucket(
		fileName: string,
		fileDestination: string,
	) {
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
			const totalLength = Infinity;

			while (rangeStart <= totalLength) {
				const { ContentRange, Body } = await this.getObjectRange(
					fileName,
					rangeStart,
					rangeEnd,
				);

				if (!ContentRange || !Body) {
					throw new AppError(
						500,
						`Couldn't download ${fileName} from ${process.env.S3_BUCKET_NAME} bucket`,
					);
				}

				writeStream.write(await Body.transformToByteArray());

				const [completedRange, totalLengthStr] = ContentRange.replace(
					"bytes ",
					"",
				).split("/");
				const [_, endRangeStr] = completedRange.split("-");

				const totalLength = Number.parseInt(totalLengthStr) - 1;
				const roughRangeStart = Number.parseInt(endRangeStr) + 1;
				rangeStart = Math.min(roughRangeStart, totalLength);
				const roughRangeEnd = rangeStart + oneMb - 1;
				rangeEnd = Math.min(roughRangeEnd, totalLength);
			}
			writeStream.end();
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

	public static async readFilesFromBucket(itemsPerPage?: number) {
		try {
			const objects = [];

			const paginator = paginateListObjectsV2(
				{ client: this.getS3Client(), pageSize: itemsPerPage || 100 },
				{ Bucket: process.env.S3_BUCKET_NAME },
			);

			for await (const page of paginator) {
				const pageContent = page.Contents || [];
				objects.push(pageContent.map((objectPage) => objectPage.Key));
			}

			const objectString = objects
				.map((objectPage, pageNum) => {
					return `Page ${pageNum++}:\n${objectPage.map((object) => object)}`;
				})
				.join(`\n`);

			console.log(objectString);
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

	public static async deleteFileFromBucket(fileName: string) {
		try {
			const command = new DeleteObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileName,
			});
			await this.getS3Client().send(command);
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

	public static async deleteManyFilesFromBucket(fileNames: string[]) {
		return await Promise.all(
			fileNames.map((file) => this.deleteFileFromBucket(file)),
		);
	}
}
