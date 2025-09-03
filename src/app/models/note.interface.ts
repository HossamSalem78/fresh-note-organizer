export interface NoteInterface {
    id: string;
    title: string;
    content: string;
    folderId: string;
    categoryId?: string;
    teamId?: string;
    tags?: string[];
    userId: string;
  }