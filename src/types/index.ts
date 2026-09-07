export interface Excerpt {
  id: number;
  content: string;
  note: string | null;
  tags: string[];          // JSON array
  starred: number;         // 0 or 1
  created_at: string;      // ISO 8601
}

export type NewExcerpt = Omit<Excerpt, 'id'>;