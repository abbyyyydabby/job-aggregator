export interface SearchQuery {
  keyword?: string;
  location?: string;
  remoteOnly?: boolean;
  minSalary?: number;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salaryMin: number | null;
  score: number;
}

export interface SearchProvider {
  search(query: SearchQuery): Promise<SearchResult[]>;
}