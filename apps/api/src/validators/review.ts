import { ValidationError } from '../utils/errors.js';

interface ReviewInput {
  rating?: number;
  title?: string | null;
  comment?: string;
}

const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 2000;
const MAX_TITLE_LENGTH = 100;

function validateRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ValidationError('rating must be between 1 and 5', 'rating');
  }
}

function validateTitle(title: unknown): void {
  if (title === null || title === undefined) {
    return;
  }

  if (typeof title !== 'string') {
    throw new ValidationError('title must be a string', 'title');
  }

  const normalized = title.trim();
  if (normalized.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(
      `title cannot exceed ${MAX_TITLE_LENGTH} characters`,
      'title',
    );
  }
}

function validateComment(comment: string): void {
  const normalized = comment.trim();

  if (normalized.length === 0) {
    throw new ValidationError('comment cannot be empty', 'comment');
  }

  if (normalized.length < MIN_COMMENT_LENGTH) {
    throw new ValidationError(
      `comment must be at least ${MIN_COMMENT_LENGTH} characters`,
      'comment',
    );
  }

  if (normalized.length > MAX_COMMENT_LENGTH) {
    throw new ValidationError('comment cannot exceed 2000 characters', 'comment');
  }
}

export function validateCreateReviewInput(input: ReviewInput): void {
  if (typeof input.rating !== 'number') {
    throw new ValidationError('rating is required', 'rating');
  }
  validateRating(input.rating);

  validateTitle(input.title);

  if (typeof input.comment !== 'string') {
    throw new ValidationError('comment is required', 'comment');
  }
  validateComment(input.comment);
}

export function validateUpdateReviewInput(input: ReviewInput): void {
  if (input.rating !== undefined) {
    validateRating(input.rating);
  }
  if (input.title !== undefined) {
    validateTitle(input.title);
  }
  if (input.comment !== undefined) {
    validateComment(input.comment);
  }
}
