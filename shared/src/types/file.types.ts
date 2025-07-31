export type SupportedFileTypes =
	// Images
	| "image/png"
	| "image/jpeg"
	| "image/jpg"
	| "image/gif"
	| "image/webp"
	| "image/svg+xml"
	| "image/bmp"
	| "image/tiff"

	// Documents
	| "application/pdf"
	| "application/msword"
	| "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	| "application/vnd.ms-excel"
	| "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	| "application/vnd.ms-powerpoint"
	| "application/vnd.openxmlformats-officedocument.presentationml.presentation"
	| "text/plain"
	| "text/csv"
	| "application/rtf"

	// Audio
	| "audio/mpeg"
	| "audio/mp3"
	| "audio/wav"
	| "audio/ogg"
	| "audio/x-m4a"

	// Video
	| "video/mp4"
	| "video/x-msvideo"
	| "video/x-matroska"
	| "video/webm"
	| "video/quicktime"

	// Archives
	| "application/zip"
	| "application/x-rar-compressed"
	| "application/x-tar"
	| "application/gzip"

	// Code & JSON
	| "application/json"
	| "application/javascript"
	| "text/html"
	| "text/css"
	| "application/xml"
	| "text/xml"

	// Fallback
	| "application/octet-stream";

export interface UploadRequest {
	fileType: SupportedFileTypes;
}

export interface DownloadRequest {
	fileKey: string;
}
