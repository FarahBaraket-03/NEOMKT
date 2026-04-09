import sanitizeHtml from 'sanitize-html';

export const TEXT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

/**
 * Sanitizes a string by removing all HTML tags and non-printable characters.
 * @param value The string to sanitize.
 * @returns The sanitized string.
 */
export function sanitizeText(value: string): string {
  return sanitizeHtml(value, TEXT_SANITIZE_OPTIONS)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

/**
 * Sanitizes an optional string. If the resulting string is empty, it returns null.
 * @param value The string to sanitize.
 * @returns The sanitized string, null if empty, or undefined if input was undefined.
 */
export function sanitizeOptionalText(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const sanitized = sanitizeText(value);
  return sanitized.length > 0 ? sanitized : null;
}
