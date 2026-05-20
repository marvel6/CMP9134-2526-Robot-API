import { parsePagination } from '../../src/common/paginator';

describe('parsePagination', () => {
  it('uses defaults when query is empty', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10 });
  });

  it('parses valid page and limit', () => {
    expect(parsePagination({ page: '2', limit: '25' })).toEqual({ page: 2, limit: 25 });
  });

  it('falls back for invalid or non-positive values', () => {
    expect(parsePagination({ page: '-1', limit: '0' })).toEqual({ page: 1, limit: 10 });
    expect(parsePagination({ page: 'abc', limit: 'xyz' })).toEqual({ page: 1, limit: 10 });
  });
});
