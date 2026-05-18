import type { FindOptions, ModelStatic, Model } from 'sequelize';

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

export async function paginate<TModel extends Model>(
  model: ModelStatic<TModel>,
  options: {
    page: number;
    limit: number;
    findOptions?: FindOptions;
  },
): Promise<PaginatorResult<TModel>> {
  const { page, limit, findOptions = {} } = options;
  const offset = (page - 1) * limit;

  const result = await model.findAndCountAll({
    ...findOptions,
    order: findOptions.order ?? [['created_at', 'DESC']],
    offset,
    limit,
    distinct: true,
  });

  const rows = result.rows;
  // `count` is `number` for non-grouped queries; defensively handle the
  // grouped-count case (array of `{ ...group, count }` objects) too.
  const rawCount: unknown = result.count;
  let total = 0;
  if (typeof rawCount === 'number') {
    total = rawCount;
  } else if (Array.isArray(rawCount)) {
    total = (rawCount as Array<{ count?: number }>).reduce(
      (sum, row) => sum + (typeof row.count === 'number' ? row.count : 0),
      0,
    );
  }

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
