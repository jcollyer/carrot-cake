export interface YouTubeVideo {
  id: string;
  snippet: {
    categoryId?: string;
    title: string;
    description: string;
    publishedAt?: string;
    tags?: string[];
    thumbnails: {
      default: {
        url: string;
      };
      medium: {
        url: string;
      };
      high: {
        url: string;
      };
    };
  };
  status: {
    publishAt?: string;
  };
}
export interface TikTokVideo {
  id: string;
  title: string;
  video_description: string;
  duration?: string;
  create_time: number;
  cover_image_url: string;
  share_url: string;
  embed_link?: boolean;
}

export type SanitizedVideoProps = {
  description: string;
  categoryId?: string;
  file?: any;
  id?: string;
  scheduleDate?: string;
  tags?: string[];
  title: string;
  thumbnail: string;
};

export type TikTokVideoProps = {
  file: any;
  title: string;
  description: string;
  privacyStatus: string;
  commercialUseContent: boolean;
  commercialUseOrganic: boolean;
  interactionType: {
    Comments: boolean;
    Duet: boolean;
    Stitch: boolean;
  };
};

export type YouTubeUserInfo = {
  userName?: string;
  thumbnail?: string;
};

export type TikTokUserInfo = {
  userName?: string;
  thumbnail?: string;
}
