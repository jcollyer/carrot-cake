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

export type SanitizedVideoProps = {
  description: string;
  categoryId?: string;
  file?: any;
  url?: string;
  resolution?: string;
  id?: string;
  scheduleDate?: string;
  tags?: string;
  title: string;
  thumbnail?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  // Internal types
  uploadProgress?: number;
};

export interface TikTokVideo {
  id: string;
  userId: string;
  accessToken: string;
  scheduledDate: string;
  thumbnail: string;
  title: string;
  video_description: string;
  duration?: string;
  share_url: string;
  embed_link?: boolean;
  cover_image_url?: string;
  create_time?: Date | number;
}

export type NeonTikTokVideo = {
  accessToken: string;
  brandedContent: boolean;
  commercialUseContent: boolean;
  commercialUseOrganic: boolean;
  disableComment: boolean;
  disableDuet: boolean;
  disableStitch: boolean;
  draft: boolean;
  id: string;
  privacyStatus: string;
  scheduledDate: string;
  thumbnail: string;
  title: string;
  userId: string;
  videoUrl: string;
  yourBrand: boolean;
};

export type TikTokVideoProps = {
  url: string;
  title: string;
  file?: any;
  resolution?: string;
  privacyStatus?: string;
  commercialUseContent: boolean;
  commercialUseOrganic: boolean;
  interactionType: {
    comment: boolean;
    duet: boolean;
    stitch: boolean;
  };
  directPost: boolean;
  disclose: boolean;
  yourBrand: boolean;
  brandedContent: boolean;
  uploadProgress?: number;
  thumbnail?: string;
  scheduleDate?: string;
  draft: boolean;
};

export interface InstagramVideo {
  id: string;
  userId: string;
  accessToken: string;
  scheduledDate: string;
  thumbnail: string;
  InstagrammuserId: string;
  videoCaption: string;
  videoType: "Stories" | "Videos" | "Reels";
  videoUrl: string;
}

export interface InstagramVideoFromPlatform {
  id: string;
  caption: string;
  media_url: string;
  media_type: string;
  timestamp: string;
}

export type InstagramVideoProps = {
  url?: string;
  caption: string;
  mediaType: "Stories" | "Videos" | "Reels";
  tags?: string;
  location?: string;
  scheduleDate?: string;
  file?: any;
  resolution?: string;
  thumbnail?: string;
  uploadProgress?: number;
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
