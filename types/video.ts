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

export type YTVideoProps = {
  description: string;
  categoryId: string;
  file: any;
  id?: string;
  scheduleDate: string;
  tags?: string;
  title: string;
  thumbnail: string;
};

export type TikTokVideoProps = {
  file: any;
  title: string;
  description: string;
  privacyStatus: string;
  interactionType: {
    allowComments: boolean;
    allowDuet: boolean;
    allowStitch: boolean;
  };
  scheduleDate: string;
  thumbnail: string;
  commercialUse: boolean;
};

export type YouTubeUserInfo = {
  userName?: string;
  thumbnail?: string;
};

export type TikTokUserInfo = {
  userName?: string;
  thumbnail?: string;
}
