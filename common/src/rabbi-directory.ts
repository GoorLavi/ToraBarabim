import type { City } from './city';
import type { Rabbi } from './rabbi';

// A rabbi as shown wherever the public directory needs the base `Rabbi`
// fields plus what a listing or a page can show without a second round
// trip: the lesson count and the cities that rabbi teaches in, resolved
// server-side in one pass over the page. Used for both the index row and
// the single-rabbi page, since the two need the exact same fields.
export interface RabbiDirectoryEntry extends Rabbi {
  lessonCount: number;
  cities: City[];
}

// The public rabbi index, one page of the directory. Named distinctly from
// the admin `RabbiListResponse`: the admin list carries `prominence`, this
// one never does.
export interface RabbiDirectoryResponse {
  items: RabbiDirectoryEntry[];
  page: number;
  pageSize: number;
  total: number;
}

// A single rabbi's public page. Same shape as a directory entry: see
// `RabbiDirectoryEntry`.
export type RabbiDetailResponse = RabbiDirectoryEntry;
