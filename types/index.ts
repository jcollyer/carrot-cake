export interface YouTubeVideo {
  id: string;
  snippet: {
    categoryId?: string;
    title: string;
    description: string;
    publishedAt?: string;
    tags?: string;
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

export interface InstagramVideo {
  InstagrammuserId: string;
  accessToken: string;
  id: string;
  scheduledDate: string;
  thumbnail: string;
  userId: string;
  videoCaption: string;
  videoType: "Stories" | "Videos" | "Reels";
  videoUrl: string;
}

export type SanitizedVideoProps = {
  description: string;
  categoryId?: string;
  file?: any;
  id?: string;
  scheduleDate?: string;
  tags?: string;
  title: string;
  thumbnail?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  // Internal types
  uploadProgress?: number;
};

export type TikTokVideoProps = {
  file: any;
  title: string;
  privacyStatus?: string;
  commercialUseContent: boolean;
  commercialUseOrganic: boolean;
  interactionType: {
    comment: boolean;
    duet: boolean;
    stitch: boolean;
  };
  // Internal types
  directPost: boolean;
  disclose: boolean;
  yourBrand: boolean;
  brandedContent: boolean;
  uploadProgress?: number;
  thumbnail?: string;
  scheduleDate?: string;
};

export type YouTubeUserInfo = {
  userName?: string;
  thumbnail?: string;
  subscriberCount?: string;
  videoCount?: string;
  viewCount?: string;
};

export type TikTokUserInfo = {
  display_name?: string;
  avatar_url?: string;
  bio_description?: string;
  is_verified?: boolean;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
};

export type TikTokUserCreatorInfo = {
  comment_disabled: boolean;
  creator_avatar_url: string;
  creator_nickname: string;
  creator_username: string;
  duet_disabled: boolean;
  max_video_post_duration_sec: number;
  privacy_level_options: string[];
  stitch_disabled: boolean;
};

export type InstagramUserInfo = {
  id: string;
  username: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
};

export type InstagramVideoProps = {
  url?: string;
  caption: string;
  mediaType: "Stories" | "Videos" | "Reels";
  tags?: string;
  location?: string;
  // Internal types
  scheduleDate?: string;
  file?: any;
  thumbnail?: string;
  uploadProgress?: number;
};
