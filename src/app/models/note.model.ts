export interface Note {
  _id?: string;
  title: string;
  content: string;
  summary?: string;
  isAISummary: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isSummarizing?: boolean;
  isDeleting?: boolean;
}
