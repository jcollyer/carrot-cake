export interface YouTubeVideo {
  id?: string;
  title?: string;
  description?: string;
  scheduleDate?: string;
  categoryId?: string;
  tags?: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: {
        url?: string;
      };
      medium?: {
        url?: string;
      };
      high?: {
        url?: string;
      };
    };
  };
}

export type VideoProps = {
  description: string;
  categoryId: string;
  file: any;
  id?: string;
  scheduleDate: string;
  tags?: string;
  title: string;
  thumbnail: string;
}
