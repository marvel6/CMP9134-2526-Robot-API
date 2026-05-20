import type { FilterQuery, Model, PopulateOptions, SortOrder } from 'mongoose';

export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

export interface PaginatorMeta {
  total: number;
  per_page: number;
  last_page: number;
  current_page: number;
  prev: number | null;
  next: number | null;
}

export interface PaginatorResult<T> {
  results: T[];
  meta: PaginatorMeta;
}

function toPositiveInt(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

export function parsePagination(query: PaginationQuery): { page: number; limit: number } {
  return {
    page: toPositiveInt(query.page, 1),
    limit: toPositiveInt(query.limit, 10),
  };
}

export interface PaginateOptions<T> {
  page: number;
  limit: number;
  filter?: FilterQuery<T>;
  sort?: Record<string, SortOrder>;
  populate?: PopulateOptions | (string | PopulateOptions)[];
}

/**
 * Simple offset/limit pagination wrapper for Mongoose models.
 *
 * Returns lean documents (plain objects) — callers map them into response
 * shapes themselves, so the result type is loose by design.
 */
export async function paginate<T>(
  model: Model<T>,
  options: PaginateOptions<T>,
): Promise<PaginatorResult<unknown>> {
  const { page, limit, filter = {}, sort = { created_at: -1 }, populate } = options;
  const offset = (page - 1) * limit;

  const query = model
    .find(filter)
    .sort(sort as Record<string, SortOrder>)
    .skip(offset)
    .limit(limit);

  if (populate) {
    query.populate(populate as PopulateOptions);
  }

  const [rows, total] = await Promise.all([
    query.lean({ virtuals: true }).exec(),
    model.countDocuments(filter).exec(),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / limit));

  return {
    results: rows,
    meta: {
      total,
      per_page: limit,
      last_page: lastPage,
      current_page: page,
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
    },
  };
}
