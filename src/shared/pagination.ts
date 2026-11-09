export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface NormalizedPagination {
  currentPage: number;
  limit: number;
  skip: number;
}

export function parsePaginationParams(
  query: Record<string, unknown>,
  defaultLimit = 10,
  maxLimit = 100
): NormalizedPagination {
  const rawPage = Number(query.page ?? query.currentPage ?? 1);
  const rawLimit = Number(query.limit ?? defaultLimit);

  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1
      ? Math.min(Math.floor(rawLimit), maxLimit)
      : defaultLimit;

  const skip = (currentPage - 1) * limit;

  return {
    currentPage,
    limit,
    skip,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  currentPage: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      currentPage,
      limit,
      totalPages,
    },
  };
}

