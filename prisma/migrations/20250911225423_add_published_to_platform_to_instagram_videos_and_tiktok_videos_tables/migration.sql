-- AlterTable
ALTER TABLE "InstagramVideos" ADD COLUMN     "publishedToPlatform" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TiktokVideos" ADD COLUMN     "publishedToPlatform" BOOLEAN NOT NULL DEFAULT false;
