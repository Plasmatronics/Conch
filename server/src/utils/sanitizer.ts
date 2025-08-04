import sanitizeHtml from "sanitize-html";

const defaultOptions = {
	allowedTags: ["b", "i", "em", "strong", "p", "br"],
	allowedAttributes: {},
	allowedIframeHostnames: [],
};

const strictOptions = {
	allowedTags: [],
	allowedAttributes: {},
	textFilter: (text: string) => text.trim(),
};

/**
 * Sanitize any input deeply.
 * @param input - The value to sanitize
 * @param strict - Whether to apply strict sanitization (remove all tags)
 * @param customOptions - Optional custom sanitize-html options
 * @returns Sanitized copy of the input
 */
export const sanitize = <T>(
	input: T,
	strict: boolean = true,
	customOptions?: sanitizeHtml.IOptions,
): T => {
	const options = customOptions ?? (strict ? strictOptions : defaultOptions);
	const seen = new WeakSet();

	return sanitizeValue(input, options, seen) as T;
};

const sanitizeValue = (
	value: unknown,
	options: sanitizeHtml.IOptions,
	seen: WeakSet<object>,
): unknown => {
	if (typeof value === "string") {
		return sanitizeHtml(value, options);
	} else if (Array.isArray(value)) {
		return sanitizeArray(value, options, seen);
	} else if (value && typeof value === "object") {
		return sanitizeObject(value, options, seen);
	} else {
		return value;
	}
};

const sanitizeObject = (
	input: object,
	options: sanitizeHtml.IOptions,
	seen: WeakSet<object>,
): Record<string, unknown> => {
	if (seen.has(input)) return {};
	seen.add(input);

	const sanitizedObj: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input)) {
		sanitizedObj[key] = sanitizeValue(value, options, seen);
	}

	return sanitizedObj;
};

const sanitizeArray = (
	input: unknown[],
	options: sanitizeHtml.IOptions,
	seen: WeakSet<object>,
): unknown[] => {
	if (seen.has(input)) return [];
	seen.add(input);

	return input.map((value) => sanitizeValue(value, options, seen));
};
